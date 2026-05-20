import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'seed.sql'), 'utf8');

  // Split on statement boundaries (each INSERT block + ALTER + CREATE)
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let inserted = 0;
  let errors = 0;

  for (const stmt of statements) {
    try {
      const result = await db.query(stmt);
      if (stmt.toUpperCase().includes('INSERT')) {
        inserted += result.rowCount ?? 0;
      }
    } catch (err: any) {
      console.error('Error on statement:', stmt.substring(0, 80));
      console.error(err.message);
      errors++;
    }
  }

  console.log(`\nSeed complete: ${inserted} rows inserted, ${errors} errors`);

  // Print product counts by category
  const counts = await db.query(
    `SELECT category, COUNT(*) as count FROM products WHERE is_active = true GROUP BY category ORDER BY category`
  );
  console.log('\nInventory by category:');
  counts.rows.forEach(r => console.log(`  ${r.category}: ${r.count} products`));

  const total = await db.query('SELECT COUNT(*) FROM products');
  console.log(`\nTotal products: ${total.rows[0].count}`);

  await db.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
