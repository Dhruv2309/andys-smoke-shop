import dotenv from 'dotenv';
import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import Stripe from 'stripe';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

dotenv.config();

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string; email: string };
    user: { userId: string; email: string };
  }
}

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: '2022-11-15' })
  : null;

const db = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
  : null;

const app = Fastify({ logger: true });

async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}

async function authenticateAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  if (!db) return reply.status(503).send({ error: 'Database not configured' });
  const { rows } = await db.query('SELECT is_admin FROM users WHERE id = $1', [request.user.userId]);
  if (!rows[0]?.is_admin) return reply.status(403).send({ error: 'Admin access required' });
}

async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const { rows } = await db!.query(
    'SELECT stripe_customer_id, email, first_name, last_name FROM users WHERE id = $1',
    [userId]
  );
  const u = rows[0];
  if (u?.stripe_customer_id) return u.stripe_customer_id;
  const customer = await stripe!.customers.create({
    email: u.email,
    name: `${u.first_name} ${u.last_name}`,
    metadata: { userId }
  });
  await db!.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customer.id, userId]);
  return customer.id;
}

async function getOrCreateCart(userId: string): Promise<string> {
  const existing = await db!.query(
    `SELECT id FROM carts WHERE user_id = $1 AND status = 'active' ORDER BY updated_at DESC LIMIT 1`,
    [userId]
  );
  if (existing.rows.length > 0) return existing.rows[0].id;
  const created = await db!.query(`INSERT INTO carts (user_id) VALUES ($1) RETURNING id`, [userId]);
  return created.rows[0].id;
}

async function autoSeedIfEmpty() {
  if (!db) return;
  try {
    const { rows } = await db.query('SELECT COUNT(*) FROM products');
    if (parseInt(rows[0].count) > 0) return;
  } catch {
    return;
  }
  console.log('[seed] Products table is empty — loading seed data...');
  try {
    const fs = await import('fs');
    const path = await import('path');
    const seedPath = path.join(__dirname, '..', 'seed.sql');
    if (!fs.existsSync(seedPath)) { console.log('[seed] seed.sql not found, skipping'); return; }
    const sql = fs.readFileSync(seedPath, 'utf8');
    const statements = sql.split(/;\s*\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('--'));
    for (const stmt of statements) {
      try { await db.query(stmt); } catch (err: any) {
        if (!err.message?.includes('already exists')) console.warn('[seed] stmt warn:', err.message);
      }
    }
    const { rows: after } = await db.query('SELECT COUNT(*) FROM products');
    console.log(`[seed] Done — ${after[0].count} products in DB`);
  } catch (err) {
    console.error('[seed] Auto-seed failed:', err);
  }
}

async function start() {
  await app.register(cors, { origin: true });
  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-prod'
  });

  app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    try {
      (req as any).rawBody = body as string;
      done(null, JSON.parse(body as string));
    } catch (err) {
      done(err as Error);
    }
  });

  // ── Health ────────────────────────────────────────────────────────────────
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // ── Products ──────────────────────────────────────────────────────────────
  app.get('/api/products', async (request) => {
    const query = request.query as Record<string, string>;
    const { category, subcategory, search } = query;

    if (!db) {
      return { products: [] };
    }

    const conditions: string[] = ['is_active = true'];
    const params: unknown[] = [];

    if (category && category !== 'All') {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (subcategory) {
      params.push(subcategory);
      conditions.push(`subcategory = $${params.length}`);
    }
    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      const n = params.length;
      conditions.push(`(name ILIKE $${n} OR brand ILIKE $${n} OR sku ILIKE $${n} OR description ILIKE $${n})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await db.query(
      `SELECT sku AS id, sku, name, brand, category, subcategory, description,
              price::float, stock, min_stock, age_restricted
       FROM products ${where} ORDER BY category, name`,
      params
    );
    return { products: rows };
  });

  app.get('/api/categories', async () => {
    if (!db) return { categories: ['All'] };
    const { rows } = await db.query(
      `SELECT DISTINCT category FROM products WHERE is_active = true ORDER BY category`
    );
    return { categories: ['All', ...rows.map((r) => r.category)] };
  });

  // ── Auth: Register ────────────────────────────────────────────────────────
  const registerSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD')
  });

  app.post('/api/auth/register', async (request, reply) => {
    if (!db) return reply.status(503).send({ error: 'Database not configured' });
    const body = registerSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.format() });

    const { firstName, lastName, email, password, dateOfBirth } = body.data;
    const ageMs = Date.now() - new Date(dateOfBirth).getTime();
    const age = Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 21) return reply.status(400).send({ error: 'You must be 21 or older to register.' });

    const passwordHash = await bcrypt.hash(password, 12);
    try {
      const result = await db.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, date_of_birth)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name`,
        [email, passwordHash, firstName, lastName, dateOfBirth]
      );
      const u = result.rows[0];
      const token = app.jwt.sign({ userId: u.id, email: u.email }, { expiresIn: '30d' });
      return { token, user: { id: u.id, email: u.email, firstName: u.first_name, lastName: u.last_name } };
    } catch (err: any) {
      if (err.code === '23505') return reply.status(409).send({ error: 'Email already registered.' });
      throw err;
    }
  });

  // ── Auth: Login ───────────────────────────────────────────────────────────
  const loginSchema = z.object({ email: z.string().email(), password: z.string() });

  app.post('/api/auth/login', async (request, reply) => {
    if (!db) return reply.status(503).send({ error: 'Database not configured' });
    const body = loginSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.format() });

    const result = await db.query(
      `SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = $1`,
      [body.data.email]
    );
    const u = result.rows[0];
    if (!u || !(await bcrypt.compare(body.data.password, u.password_hash))) {
      return reply.status(401).send({ error: 'Invalid email or password.' });
    }
    const token = app.jwt.sign({ userId: u.id, email: u.email }, { expiresIn: '30d' });
    return { token, user: { id: u.id, email: u.email, firstName: u.first_name, lastName: u.last_name } };
  });

  // ── Auth: Me ──────────────────────────────────────────────────────────────
  app.get('/api/auth/me', { onRequest: [authenticate] }, async (request, reply) => {
    if (!db) return { user: request.user };
    const result = await db.query(
      `SELECT id, email, first_name, last_name, age_verified, is_admin FROM users WHERE id = $1`,
      [request.user.userId]
    );
    if (!result.rows[0]) return reply.status(404).send({ error: 'User not found' });
    const u = result.rows[0];
    return {
      user: {
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        ageVerified: u.age_verified,
        isAdmin: u.is_admin
      }
    };
  });

  // ── Cart: Get ─────────────────────────────────────────────────────────────
  app.get('/api/cart', { onRequest: [authenticate] }, async (request, reply) => {
    if (!db) return reply.status(503).send({ error: 'Database not configured' });
    const cartId = await getOrCreateCart(request.user.userId);
    const { rows: cartRows } = await db.query(
      `SELECT product_id, quantity FROM cart_items WHERE cart_id = $1`, [cartId]
    );
    if (cartRows.length === 0) return { cartId, items: [] };

    const skus = cartRows.map((r) => r.product_id);
    const { rows: productRows } = await db.query(
      `SELECT sku AS id, sku, name, brand, category, description, price::float FROM products WHERE sku = ANY($1)`,
      [skus]
    );
    const productMap = new Map(productRows.map((p) => [p.sku, p]));
    const items = cartRows
      .map((r) => {
        const p = productMap.get(r.product_id);
        return p ? { ...p, quantity: r.quantity } : null;
      })
      .filter(Boolean);
    return { cartId, items };
  });

  // ── Cart: Add Item ────────────────────────────────────────────────────────
  const cartItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().min(1).default(1)
  });

  app.post('/api/cart/items', { onRequest: [authenticate] }, async (request, reply) => {
    if (!db) return reply.status(503).send({ error: 'Database not configured' });
    const body = cartItemSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.format() });

    const { rows } = await db.query(
      'SELECT sku FROM products WHERE sku = $1 AND is_active = true',
      [body.data.productId]
    );
    if (!rows[0]) return reply.status(404).send({ error: 'Product not found' });

    const cartId = await getOrCreateCart(request.user.userId);
    await db.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
      [cartId, body.data.productId, body.data.quantity]
    );
    await db.query(`UPDATE carts SET updated_at = NOW() WHERE id = $1`, [cartId]);
    return { success: true };
  });

  // ── Cart: Remove Item ─────────────────────────────────────────────────────
  app.delete<{ Params: { productId: string } }>(
    '/api/cart/items/:productId',
    { onRequest: [authenticate] },
    async (request, reply) => {
      if (!db) return reply.status(503).send({ error: 'Database not configured' });
      const cartId = await getOrCreateCart(request.user.userId);
      await db.query(`DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2`, [cartId, request.params.productId]);
      return { success: true };
    }
  );

  // ── Payment Methods: Start Setup ──────────────────────────────────────────
  app.post('/api/payments/setup', { onRequest: [authenticate] }, async (request, reply) => {
    if (!stripe || !db) return reply.status(503).send({ error: 'Service not configured' });
    const customerId = await getOrCreateStripeCustomer(request.user.userId);
    const session = await stripe.checkout.sessions.create({
      mode: 'setup',
      customer: customerId,
      success_url: `${process.env.APP_URL || 'https://Dhruv2309.github.io/andys-smoke-shop'}?payment_saved=true`,
      cancel_url: `${process.env.APP_URL || 'https://Dhruv2309.github.io/andys-smoke-shop'}?payment_cancelled=true`,
      payment_method_types: ['card']
    });
    return { url: session.url };
  });

  // ── Payment Methods: List ─────────────────────────────────────────────────
  app.get('/api/payments/methods', { onRequest: [authenticate] }, async (request, reply) => {
    if (!stripe || !db) return reply.status(503).send({ error: 'Service not configured' });
    const customerId = await getOrCreateStripeCustomer(request.user.userId);
    const stripeList = await stripe.customers.listPaymentMethods(customerId, { type: 'card' });
    const { rows: dbRows } = await db.query(
      'SELECT stripe_payment_method_id, is_default FROM payment_methods WHERE user_id = $1',
      [request.user.userId]
    );
    const defaultId = dbRows.find((r) => r.is_default)?.stripe_payment_method_id ?? null;
    for (const pm of stripeList.data) {
      await db.query(
        `INSERT INTO payment_methods (user_id, stripe_payment_method_id, type, brand, last4, exp_month, exp_year)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (stripe_payment_method_id) DO UPDATE
           SET brand = EXCLUDED.brand, last4 = EXCLUDED.last4,
               exp_month = EXCLUDED.exp_month, exp_year = EXCLUDED.exp_year`,
        [request.user.userId, pm.id, pm.type, pm.card?.brand, pm.card?.last4, pm.card?.exp_month, pm.card?.exp_year]
      );
    }
    const methods = stripeList.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand ?? 'card',
      last4: pm.card?.last4 ?? '????',
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
      isDefault: pm.id === defaultId
    }));
    return { methods };
  });

  // ── Payment Methods: Delete ───────────────────────────────────────────────
  app.delete<{ Params: { id: string } }>(
    '/api/payments/methods/:id',
    { onRequest: [authenticate] },
    async (request, reply) => {
      if (!stripe || !db) return reply.status(503).send({ error: 'Service not configured' });
      await stripe.paymentMethods.detach(request.params.id);
      await db.query(
        'DELETE FROM payment_methods WHERE stripe_payment_method_id = $1 AND user_id = $2',
        [request.params.id, request.user.userId]
      );
      return { success: true };
    }
  );

  // ── Payment Methods: Set Default ──────────────────────────────────────────
  app.put<{ Params: { id: string } }>(
    '/api/payments/methods/:id/default',
    { onRequest: [authenticate] },
    async (request, reply) => {
      if (!db) return reply.status(503).send({ error: 'Database not configured' });
      await db.query('UPDATE payment_methods SET is_default = false WHERE user_id = $1', [request.user.userId]);
      await db.query(
        'UPDATE payment_methods SET is_default = true WHERE stripe_payment_method_id = $1 AND user_id = $2',
        [request.params.id, request.user.userId]
      );
      return { success: true };
    }
  );

  // ── Age Verification ──────────────────────────────────────────────────────
  app.post('/api/age-verification/session', { onRequest: [authenticate] }, async (request, reply) => {
    if (!stripe) return reply.status(503).send({ error: 'Stripe not configured' });
    if (!db) return reply.status(503).send({ error: 'Database not configured' });
    const { rows } = await db.query('SELECT age_verified FROM users WHERE id = $1', [request.user.userId]);
    if (rows[0]?.age_verified) return { alreadyVerified: true };
    const session = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: { userId: request.user.userId },
      options: {
        document: {
          allowed_types: ['driving_license', 'passport', 'id_card'],
          require_matching_selfie: true
        }
      },
      return_url: process.env.APP_URL || 'https://Dhruv2309.github.io/andys-smoke-shop'
    });
    await db.query(
      `INSERT INTO age_verifications (user_id, stripe_session_id) VALUES ($1, $2)
       ON CONFLICT (stripe_session_id) DO NOTHING`,
      [request.user.userId, session.id]
    );
    return { url: session.url, sessionId: session.id };
  });

  // Direct Stripe poll — doesn't depend on webhooks firing
  app.get('/api/age-verification/check', { onRequest: [authenticate] }, async (request, reply) => {
    if (!stripe || !db) return reply.status(503).send({ error: 'Service not configured' });

    const { rows: userRows } = await db.query(
      'SELECT age_verified FROM users WHERE id = $1',
      [request.user.userId]
    );
    if (userRows[0]?.age_verified) return { verified: true };

    const { rows: sessions } = await db.query(
      `SELECT stripe_session_id FROM age_verifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [request.user.userId]
    );

    for (const row of sessions) {
      try {
        const vs = await stripe.identity.verificationSessions.retrieve(row.stripe_session_id);
        if (vs.status !== 'verified') continue;

        const dob = vs.verified_outputs?.dob;
        if (dob?.year && dob?.month && dob?.day) {
          const dobDate = new Date(dob.year, dob.month - 1, dob.day);
          const age = Math.floor((Date.now() - dobDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          if (age < 21) {
            await db.query(
              `UPDATE age_verifications SET status = 'failed' WHERE stripe_session_id = $1`,
              [row.stripe_session_id]
            );
            continue;
          }
          await db.query('UPDATE users SET age_verified = true WHERE id = $1', [request.user.userId]);
          await db.query(
            `UPDATE age_verifications SET status = 'verified', verified_dob = $1 WHERE stripe_session_id = $2`,
            [
              `${dob.year}-${String(dob.month).padStart(2, '0')}-${String(dob.day).padStart(2, '0')}`,
              row.stripe_session_id
            ]
          );
        } else {
          // Verified but no DOB in outputs (test mode edge case)
          await db.query('UPDATE users SET age_verified = true WHERE id = $1', [request.user.userId]);
          await db.query(
            `UPDATE age_verifications SET status = 'verified' WHERE stripe_session_id = $1`,
            [row.stripe_session_id]
          );
        }
        return { verified: true };
      } catch {}
    }

    return { verified: false };
  });

  // ── Stripe Webhook ────────────────────────────────────────────────────────
  app.post('/api/webhooks/stripe', async (request, reply) => {
    if (!stripe) return reply.status(503).send({ error: 'Stripe not configured' });
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;
    if (webhookSecret) {
      try {
        const sig = request.headers['stripe-signature'] as string;
        event = stripe.webhooks.constructEvent((request as any).rawBody, sig, webhookSecret);
      } catch {
        return reply.status(400).send({ error: 'Webhook signature verification failed' });
      }
    } else {
      event = request.body as Stripe.Event;
    }

    if (event.type === 'identity.verification_session.verified') {
      const vs = event.data.object as Stripe.Identity.VerificationSession;
      const userId = vs.metadata?.userId;
      const dob = vs.verified_outputs?.dob;
      if (userId && db && dob?.year && dob?.month && dob?.day) {
        const dobDate = new Date(dob.year, dob.month - 1, dob.day);
        const age = Math.floor((Date.now() - dobDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age >= 21) {
          await db.query('UPDATE users SET age_verified = true WHERE id = $1', [userId]);
          await db.query(
            `UPDATE age_verifications SET status = 'verified', verified_dob = $1 WHERE stripe_session_id = $2`,
            [`${dob.year}-${String(dob.month).padStart(2, '0')}-${String(dob.day).padStart(2, '0')}`, vs.id]
          );
        } else {
          await db.query(`UPDATE age_verifications SET status = 'failed' WHERE stripe_session_id = $1`, [vs.id]);
        }
      }
    }
    if (event.type === 'identity.verification_session.requires_input') {
      const vs = event.data.object as Stripe.Identity.VerificationSession;
      if (db) await db.query(`UPDATE age_verifications SET status = 'failed' WHERE stripe_session_id = $1`, [vs.id]);
    }
    return { received: true };
  });

  // ── Checkout ──────────────────────────────────────────────────────────────
  const orderSchema = z.object({
    phone: z.string().min(10),
    items: z.array(z.object({ id: z.string(), quantity: z.number().min(1) })).min(1),
    paymentMethodId: z.string().optional(),
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    age: z.number().min(21).optional()
  });

  app.post('/api/checkout', async (request, reply) => {
    const body = orderSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.format() });

    let authUser: { userId: string; email: string } | null = null;
    let userName = body.data.name || 'Guest';
    let userEmail = body.data.email || 'guest@andys-smokeshop.com';

    try {
      await request.jwtVerify();
      authUser = request.user;
    } catch {
      // guest checkout
    }

    if (authUser && db) {
      const result = await db.query(
        `SELECT first_name, last_name, email, age_verified FROM users WHERE id = $1`,
        [authUser.userId]
      );
      if (result.rows[0]) {
        const u = result.rows[0];
        userName = `${u.first_name} ${u.last_name}`;
        userEmail = u.email;
        if (!u.age_verified) {
          return reply.status(403).send({ error: 'Age verification required before checkout. Please verify your government ID.' });
        }
      }
    }

    // Pull prices from DB (never trust client-provided prices)
    const skus = body.data.items.map((i) => i.id);
    let productMap = new Map<string, { name: string; description: string; price: number }>();

    if (db) {
      const { rows: dbProducts } = await db.query(
        `SELECT sku, name, description, price::float FROM products WHERE sku = ANY($1) AND is_active = true`,
        [skus]
      );
      productMap = new Map(dbProducts.map((p) => [p.sku, p]));
    }

    const orderTotal = body.data.items.reduce((sum, item) => {
      return sum + (productMap.get(item.id)?.price ?? 0) * item.quantity;
    }, 0);

    const orderId = `AS-${Date.now()}`;
    const total = Number(orderTotal.toFixed(2));

    if (db && authUser) {
      const cartId = await getOrCreateCart(authUser.userId).catch(() => null);
      await db.query(
        `INSERT INTO orders (id, user_id, cart_id, status, total) VALUES ($1, $2, $3, 'pending', $4)`,
        [orderId, authUser.userId, cartId, total]
      );
      if (cartId) {
        await db.query(`UPDATE carts SET status = 'checked_out' WHERE id = $1`, [cartId]);
      }
    }

    if (!stripe) {
      return {
        orderId,
        status: 'pending',
        total,
        message: 'Order recorded. Configure STRIPE_SECRET_KEY in .env to enable live checkout.',
        paymentUrl: null
      };
    }

    // Pay with saved payment method
    if (body.data.paymentMethodId && authUser && db) {
      const customerId = await getOrCreateStripeCustomer(authUser.userId);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: 'usd',
        customer: customerId,
        payment_method: body.data.paymentMethodId,
        confirm: true,
        return_url: process.env.SUCCESS_URL || 'https://dhruv2309.github.io/andys-smoke-shop',
        metadata: { orderId, customerName: userName }
      });
      await db.query(`UPDATE orders SET stripe_session_id = $1 WHERE id = $2`, [paymentIntent.id, orderId]);
      const actionUrl = (paymentIntent.next_action as any)?.redirect_to_url?.url as string | undefined;
      if (paymentIntent.status === 'succeeded') {
        await db.query(`UPDATE orders SET status = 'paid' WHERE id = $1`, [orderId]);
        return { orderId, status: 'paid', total, message: 'Payment successful!' };
      }
      return { orderId, status: 'pending', total, message: 'Complete 3D Secure authentication.', paymentUrl: actionUrl };
    }

    const lineItems = body.data.items.map((item) => {
      const p = productMap.get(item.id);
      return {
        price_data: {
          currency: 'usd',
          product_data: { name: p?.name ?? item.id, description: p?.description ?? '' },
          unit_amount: Math.round((p?.price ?? 0) * 100)
        },
        quantity: item.quantity
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: process.env.SUCCESS_URL || 'https://dhruv2309.github.io/andys-smoke-shop',
      cancel_url: process.env.CANCEL_URL || 'https://dhruv2309.github.io/andys-smoke-shop',
      customer_email: userEmail,
      metadata: { orderId, customerName: userName }
    });

    if (db && authUser) {
      await db.query(`UPDATE orders SET stripe_session_id = $1 WHERE id = $2`, [session.id, orderId]);
    }
    return { orderId, status: 'pending', total, message: 'Complete payment via Stripe Checkout.', paymentUrl: session.url };
  });

  // ── Admin: Products CRUD ──────────────────────────────────────────────────
  const productSchema = z.object({
    sku: z.string().min(1).max(50),
    name: z.string().min(1).max(255),
    brand: z.string().max(100).optional(),
    category: z.string().min(1).max(100),
    subcategory: z.string().max(100).optional(),
    description: z.string().optional(),
    price: z.number().positive(),
    costPrice: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().default(0),
    minStock: z.number().int().nonnegative().default(5),
    ageRestricted: z.boolean().default(true),
    isActive: z.boolean().default(true)
  });

  // List all products (including inactive)
  app.get('/api/admin/products', { onRequest: [authenticateAdmin] }, async () => {
    const { rows } = await db!.query(
      `SELECT sku, name, brand, category, subcategory, description,
              price::float, cost_price::float, stock, min_stock, is_active, age_restricted,
              created_at, updated_at
       FROM products ORDER BY category, name`
    );
    const stats = await db!.query(
      `SELECT COUNT(*) as total,
              COUNT(*) FILTER (WHERE stock < min_stock AND is_active) as low_stock,
              COUNT(DISTINCT category) as categories
       FROM products`
    );
    return { products: rows, stats: stats.rows[0] };
  });

  // Create product
  app.post('/api/admin/products', { onRequest: [authenticateAdmin] }, async (request, reply) => {
    const body = productSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: body.error.format() });
    const { sku, name, brand, category, subcategory, description, price, costPrice, stock, minStock, ageRestricted, isActive } = body.data;
    try {
      await db!.query(
        `INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, age_restricted, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [sku, name, brand, category, subcategory, description, price, costPrice ?? null, stock, minStock, ageRestricted, isActive]
      );
      return { success: true, sku };
    } catch (err: any) {
      if (err.code === '23505') return reply.status(409).send({ error: 'SKU already exists' });
      throw err;
    }
  });

  // Update product
  app.put<{ Params: { sku: string } }>(
    '/api/admin/products/:sku',
    { onRequest: [authenticateAdmin] },
    async (request, reply) => {
      const body = productSchema.partial().safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.format() });
      const { name, brand, category, subcategory, description, price, costPrice, stock, minStock, ageRestricted, isActive } = body.data;
      const result = await db!.query(
        `UPDATE products SET
           name = COALESCE($1, name),
           brand = COALESCE($2, brand),
           category = COALESCE($3, category),
           subcategory = COALESCE($4, subcategory),
           description = COALESCE($5, description),
           price = COALESCE($6, price),
           cost_price = COALESCE($7, cost_price),
           stock = COALESCE($8, stock),
           min_stock = COALESCE($9, min_stock),
           age_restricted = COALESCE($10, age_restricted),
           is_active = COALESCE($11, is_active),
           updated_at = NOW()
         WHERE sku = $12`,
        [name, brand, category, subcategory, description, price ?? null, costPrice ?? null, stock ?? null, minStock ?? null, ageRestricted ?? null, isActive ?? null, request.params.sku]
      );
      if (result.rowCount === 0) return reply.status(404).send({ error: 'Product not found' });
      return { success: true };
    }
  );

  // Adjust stock
  app.put<{ Params: { sku: string } }>(
    '/api/admin/products/:sku/stock',
    { onRequest: [authenticateAdmin] },
    async (request, reply) => {
      const body = z.object({ adjustment: z.number().int() }).safeParse(request.body);
      if (!body.success) return reply.status(400).send({ error: body.error.format() });
      const result = await db!.query(
        `UPDATE products SET stock = GREATEST(0, stock + $1), updated_at = NOW() WHERE sku = $2 RETURNING stock`,
        [body.data.adjustment, request.params.sku]
      );
      if (result.rowCount === 0) return reply.status(404).send({ error: 'Product not found' });
      return { success: true, stock: result.rows[0].stock };
    }
  );

  // Deactivate / reactivate product
  app.delete<{ Params: { sku: string } }>(
    '/api/admin/products/:sku',
    { onRequest: [authenticateAdmin] },
    async (request, reply) => {
      await db!.query('UPDATE products SET is_active = false, updated_at = NOW() WHERE sku = $1', [request.params.sku]);
      return { success: true };
    }
  );

  // Make a user admin (useful to set up the first admin via DB directly)
  app.put<{ Params: { userId: string } }>(
    '/api/admin/users/:userId/make-admin',
    { onRequest: [authenticateAdmin] },
    async (request) => {
      await db!.query('UPDATE users SET is_admin = true WHERE id = $1', [request.params.userId]);
      return { success: true };
    }
  );

  // ── Legal ─────────────────────────────────────────────────────────────────
  app.get('/api/legal', async () => ({
    message: 'Customers must be 21+ to purchase tobacco, nicotine, CBD, or delta products in Indiana.'
  }));

  app.setNotFoundHandler(() => ({ error: 'Route not found' }));

  const port = Number(process.env.PORT || 3000);
  await app.listen({ host: '0.0.0.0', port });
  await autoSeedIfEmpty();
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
