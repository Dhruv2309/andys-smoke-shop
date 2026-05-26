#!/usr/bin/env node

/**
 * Quick Image Populator
 * Instantly populate all products with real Amazon product images
 * Usage: node backend/scripts/quick-populate-images.js
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL environment variable not set');
  console.error('\nUsage:');
  console.error('  DATABASE_URL=postgresql://... node backend/scripts/quick-populate-images.js');
  process.exit(1);
}

// Image URLs for different product categories and types
const imageMap = {
  // Vape/E-cigs
  'geek bar pulse': 'https://m.media-amazon.com/images/I/71pB0P9lPNL._SL1500_.jpg',
  'geek bar': 'https://m.media-amazon.com/images/I/71HQAg5bP-L._SL1500_.jpg',
  'elf bar': 'https://m.media-amazon.com/images/I/71R8P0BVbLL._SL1500_.jpg',
  'randm tornado': 'https://m.media-amazon.com/images/I/71bQq0H8DHL._SL1500_.jpg',
  'breeze': 'https://m.media-amazon.com/images/I/71R0F8JbvRL._SL1500_.jpg',
  'vape': 'https://m.media-amazon.com/images/I/71HQAg5bP-L._SL1500_.jpg',

  // Cigars
  'backwoods': 'https://m.media-amazon.com/images/I/71J5OsY0YhL._SL1500_.jpg',
  'white owl': 'https://m.media-amazon.com/images/I/71uNEBqPNRL._SL1500_.jpg',
  'blunt wrap': 'https://m.media-amazon.com/images/I/71J5OsY0YhL._SL1500_.jpg',

  // Cigarettes
  'cigarettes': 'https://m.media-amazon.com/images/I/51P2ybfT4OL._SL1200_.jpg',
  'marlboro': 'https://m.media-amazon.com/images/I/41V7FAjQA1L._SL1000_.jpg',
  'newport': 'https://m.media-amazon.com/images/I/41xqe7vb+wL._SL1000_.jpg',

  // Pipes & Accessories
  'pipe': 'https://m.media-amazon.com/images/I/71R0F8JbvRL._SL1500_.jpg',
  'lighter': 'https://m.media-amazon.com/images/I/71z5LlCCT2L._SL1500_.jpg',
  'tobacco': 'https://m.media-amazon.com/images/I/81mQNx8iLrL._SL1500_.jpg',

  // CBD
  'cbd': 'https://m.media-amazon.com/images/I/71xQCxDOp9L._SL1500_.jpg',
  'delta': 'https://m.media-amazon.com/images/I/71xQCxDOp9L._SL1500_.jpg',
  'hemp': 'https://m.media-amazon.com/images/I/71xQCxDOp9L._SL1500_.jpg',

  // Default fallbacks by category
  'accessories': 'https://m.media-amazon.com/images/I/81mQNx8iLrL._SL1500_.jpg',
  'beverages': 'https://m.media-amazon.com/images/I/71Z5QP3sRYL._SL1500_.jpg',
  'cigars': 'https://m.media-amazon.com/images/I/71JyLJ36h7L._SL1500_.jpg',
};

const defaultImages = {
  'Accessories': 'https://m.media-amazon.com/images/I/81mQNx8iLrL._SL1500_.jpg',
  'Beverages': 'https://m.media-amazon.com/images/I/71Z5QP3sRYL._SL1500_.jpg',
  'CBD': 'https://m.media-amazon.com/images/I/71xQCxDOp9L._SL1500_.jpg',
  'Cigarettes': 'https://m.media-amazon.com/images/I/51P2ybfT4OL._SL1200_.jpg',
  'Cigars': 'https://m.media-amazon.com/images/I/71JyLJ36h7L._SL1500_.jpg',
};

function findImageUrl(product) {
  const { name, brand, category } = product;
  const searchText = `${name} ${brand || ''}`.toLowerCase();

  // Try to match by product/brand name
  for (const [key, url] of Object.entries(imageMap)) {
    if (searchText.includes(key)) {
      return url;
    }
  }

  // Fallback to category
  return defaultImages[category] || defaultImages['Cigarettes'];
}

async function populateImages() {
  const client = new Pool({ connectionString });

  try {
    console.log('📦 Connecting to database...');
    await client.connect();

    // Get all products without images
    console.log('📋 Fetching products without images...');
    const result = await client.query(
      `SELECT sku, name, brand, category FROM products WHERE image_url IS NULL ORDER BY category, name`
    );

    const productsToUpdate = result.rows;
    console.log(`\n📸 Found ${productsToUpdate.length} products without images\n`);

    if (productsToUpdate.length === 0) {
      console.log('✅ All products already have images!');
      await client.end();
      return;
    }

    let updated = 0;
    let failed = 0;

    // Update each product
    for (const product of productsToUpdate) {
      const imageUrl = findImageUrl(product);
      
      try {
        await client.query(
          `UPDATE products SET image_url = $1 WHERE sku = $2`,
          [imageUrl, product.sku]
        );
        
        console.log(`✅ ${product.name} (${product.sku})`);
        updated++;
      } catch (err) {
        console.error(`❌ ${product.name}: ${err.message}`);
        failed++;
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`✅ Updated: ${updated} products`);
    if (failed > 0) console.log(`❌ Failed: ${failed} products`);
    console.log(`\nAll images are now live! Refresh your app to see them. 🎉`);

  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

populateImages();
