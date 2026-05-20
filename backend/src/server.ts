import dotenv from 'dotenv';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import Stripe from 'stripe';
import { z } from 'zod';

dotenv.config();
const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: '2022-11-15' })
  : null;

const products = [
  {
    id: 'tobacco-001',
    name: 'Premium Cigarettes Pack',
    category: 'Tobacco',
    price: 12.99,
    description: 'Classic filtered cigarettes for daily adult smokers.',
    tags: ['tobacco', 'cigarette']
  },
  {
    id: 'nicotine-001',
    name: 'Nicotine Disposable Vape',
    category: 'Nicotine',
    price: 19.99,
    description: 'Ready-to-use nicotine disposable with smooth flavor.',
    tags: ['nicotine', 'vape', 'disposable']
  },
  {
    id: 'cbd-001',
    name: 'CBD Gummies Pack',
    category: 'CBD / Delta',
    price: 24.99,
    description: 'Indiana-friendly CBD gummies for relaxation.',
    tags: ['cbd', 'gummies']
  },
  {
    id: 'thc-001',
    name: 'Delta-8 Disposable Pod',
    category: 'CBD / Delta',
    price: 29.99,
    description: 'Delta-8 disposable vape device with mellow effects.',
    tags: ['delta8', 'disposable']
  },
  {
    id: 'snacks-001',
    name: 'Snack Pack - Chips & Candy',
    category: 'Snacks',
    price: 9.49,
    description: 'Assorted chips, candy, and convenience snacks.',
    tags: ['snacks', 'candy']
  },
  {
    id: 'drinks-001',
    name: 'Energy Drink Variety',
    category: 'Beverages',
    price: 3.49,
    description: 'Carbonated and non-carbonated beverage options.',
    tags: ['beverage', 'drink']
  },
  {
    id: 'accessory-001',
    name: 'Butane Lighter',
    category: 'Accessories',
    price: 6.99,
    description: 'Compact butane refill lighter.',
    tags: ['lighter', 'butane']
  },
  {
    id: 'accessory-002',
    name: 'Condom Pack',
    category: 'Accessories',
    price: 11.99,
    description: '3-pack premium condoms.',
    tags: ['condom', 'health']
  }
];

const app = Fastify({ logger: true });

async function start() {
  await app.register(cors, { origin: true });

  app.get('/api/products', async () => ({ products }));

  app.get('/api/categories', async () => ({ categories: Array.from(new Set(products.map((item) => item.category))) }));

const orderSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  age: z.number().min(21),
  items: z.array(
    z.object({ id: z.string(), quantity: z.number().min(1) })
  ).min(1)
});

app.post('/api/checkout', async (request, reply) => {
  const body = orderSchema.safeParse(request.body);
  if (!body.success) {
    return reply.status(400).send({ error: body.error.format() });
  }

  const orderTotal = body.data.items.reduce((total, item) => {
    const product = products.find((product) => product.id === item.id);
    return total + (product?.price ?? 0) * item.quantity;
  }, 0);

  const orderId = `AS-${Date.now()}`;
  const total = Number(orderTotal.toFixed(2));

  if (!stripe) {
    return {
      orderId,
      status: 'pending',
      total,
      message: 'Order recorded. Configure STRIPE_SECRET_KEY in .env to enable live checkout.',
      paymentUrl: `https://pay.andys-smokeshop.example.com/checkout/${orderId}`
    };
  }

  const lineItems = body.data.items.map((item) => {
    const product = products.find((product) => product.id === item.id);
    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: product?.name ?? item.id,
          description: product?.description ?? ''
        },
        unit_amount: Math.round((product?.price ?? 0) * 100)
      },
      quantity: item.quantity
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    success_url: process.env.SUCCESS_URL || 'https://andys-smokeshop.example.com/success',
    cancel_url: process.env.CANCEL_URL || 'https://andys-smokeshop.example.com/cancel',
    metadata: {
      orderId,
      customerEmail: body.data.email
    }
  });

  return {
    orderId,
    status: 'pending',
    total,
    message: 'Order recorded. Complete payment using Stripe Checkout.',
    paymentUrl: session.url
  };
});

app.get('/api/legal', async () => ({
  message: 'Customers must be 21+ to purchase tobacco, nicotine, CBD, or delta products in Indiana. Verify compliance before accepting sales.'
}));

  app.setNotFoundHandler(() => ({ error: 'Route not found' }));

  const port = Number(process.env.PORT || 3000);
  await app.listen({ host: '0.0.0.0', port });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
