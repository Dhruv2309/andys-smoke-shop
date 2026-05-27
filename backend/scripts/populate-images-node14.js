#!/usr/bin/env node

/**
 * Image Populator for Node 14
 * Populate products with images using older pg library
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL not set');
  console.error('Usage: DATABASE_URL="..." node populate-images-node14.js');
  process.exit(1);
}

console.log('🔄 Connecting to database...');
console.log('Database:', connectionString.split('@')[1] || 'unknown');

// Parse connection string manually
const url = require('url');
const parsed = url.parse(connectionString);

const config = {
  user: parsed.auth?.split(':')[0],
  password: parsed.auth?.split(':')[1],
  host: parsed.hostname,
  port: parseInt(parsed.port),
  database: parsed.pathname.slice(1)
};

console.log(`📡 Connecting to ${config.user}@${config.host}:${config.port}/${config.database}`);

const http = require('http');
const querystring = require('querystring');

// Image URLs mapping
const imageMap = {
  'geek bar pulse': 'https://m.media-amazon.com/images/I/71pB0P9lPNL._SL1500_.jpg',
  'geek bar': 'https://m.media-amazon.com/images/I/71HQAg5bP-L._SL1500_.jpg',
  'elf bar': 'https://m.media-amazon.com/images/I/71R8P0BVbLL._SL1500_.jpg',
  'randm tornado': 'https://m.media-amazon.com/images/I/71bQq0H8DHL._SL1500_.jpg',
  'breeze': 'https://m.media-amazon.com/images/I/71R0F8JbvRL._SL1500_.jpg',
  'vape': 'https://m.media-amazon.com/images/I/71HQAg5bP-L._SL1500_.jpg',
  'backwoods': 'https://m.media-amazon.com/images/I/71YM4XvH-qL._SL1500_.jpg',
  'blunt': 'https://m.media-amazon.com/images/I/71YM4XvH-qL._SL1500_.jpg',
  'cigarette': 'https://m.media-amazon.com/images/I/61RcKvPnY6L._SL1500_.jpg',
  'rolling': 'https://m.media-amazon.com/images/I/71qJ3N5LMAL._SL1500_.jpg',
  'lighter': 'https://m.media-amazon.com/images/I/61+7rF6GHeL._SL1500_.jpg',
  'paper': 'https://m.media-amazon.com/images/I/71qJ3N5LMAL._SL1500_.jpg'
};

// Use native TCP to connect to PostgreSQL
const net = require('net');

console.log('📦 Installing pg module dependencies...');

// Check if we have pg
try {
  const pg = require('pg');
  console.log('✅ Using pg library');
  runWithPg(pg);
} catch (e) {
  console.log('⚠️  pg not available, using manual TCP connection...');
  runWithTcp();
}

function runWithPg(pg) {
  const pool = new pg.Pool({
    connectionString
  });

  pool.query('SELECT COUNT(*) FROM products', (err, res) => {
    if (err) {
      console.error('❌ Database connection failed:', err.message);
      process.exit(1);
    }
    console.log(`✅ Connected! Total products: ${res.rows[0].count}`);
    updateImages(pool);
  });
}

function updateImages(pool) {
  // Get products without images
  pool.query(
    'SELECT sku, name, category FROM products WHERE image_url IS NULL ORDER BY sku',
    (err, res) => {
      if (err) {
        console.error('❌ Query failed:', err);
        process.exit(1);
      }

      const products = res.rows;
      console.log(`\n🖼️  Found ${products.length} products without images\n`);

      let updated = 0;
      let processed = 0;

      products.forEach((product, index) => {
        setTimeout(() => {
          const imageUrl = getImageUrl(product.name, product.category);
          pool.query(
            'UPDATE products SET image_url = $1 WHERE sku = $2',
            [imageUrl, product.sku],
            (err) => {
              processed++;
              if (!err) updated++;
              
              if (processed % 50 === 0) {
                console.log(`⏳  Processed ${processed}/${products.length}...`);
              }

              if (processed === products.length) {
                console.log(`\n✅ Image population complete!`);
                console.log(`   Updated: ${updated}/${products.length} products`);
                pool.end();
                process.exit(0);
              }
            }
          );
        }, index * 10);
      });
    }
  );
}

function getImageUrl(name, category) {
  const lowerName = (name || '').toLowerCase();
  
  // Try exact match
  for (let key in imageMap) {
    if (lowerName.includes(key)) {
      return imageMap[key];
    }
  }
  
  // Default by category
  if (category === 'vape') return imageMap['vape'];
  if (category === 'blunt') return imageMap['blunt'];
  if (category === 'tobacco') return imageMap['cigarette'];
  
  // Generic default
  return 'https://m.media-amazon.com/images/I/71HQAg5bP-L._SL1500_.jpg';
}

function runWithTcp() {
  console.log('Manual TCP connection not implemented. Please install pg: npm install pg');
  process.exit(1);
}
