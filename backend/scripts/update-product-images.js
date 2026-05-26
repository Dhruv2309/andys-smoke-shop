#!/usr/bin/env node

/**
 * Product Image Bulk Updater
 * Usage: node update-product-images.js
 * 
 * Creates a CSV file format:
 * sku,imageUrl
 * SKU001,https://example.com/image1.jpg
 * SKU002,https://example.com/image2.jpg
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const API_BASE = process.env.API_URL || 'http://localhost:3000';
const JWT_TOKEN = process.env.JWT_TOKEN;

if (!JWT_TOKEN) {
  console.error('❌ Error: JWT_TOKEN environment variable not set');
  console.error('\nUsage:');
  console.error('  JWT_TOKEN=your_token API_URL=http://your-backend update-product-images.js');
  console.error('\nTo get your JWT token:');
  console.error('  1. Login to your app');
  console.error('  2. Open browser DevTools → Application → Local Storage');
  console.error('  3. Copy the "token" value');
  process.exit(1);
}

const csvFilePath = path.join(__dirname, 'products-images.csv');

if (!fs.existsSync(csvFilePath)) {
  console.error(`❌ Error: ${csvFilePath} not found`);
  console.log('\nCreate a CSV file with this format:\n');
  console.log('sku,imageUrl');
  console.log('GEEK-BAR-001,https://example.com/geek-bar-1.jpg');
  console.log('GEEK-BAR-002,https://example.com/geek-bar-2.jpg');
  process.exit(1);
}

async function updateProductImage(sku, imageUrl) {
  try {
    const response = await fetch(`${API_BASE}/api/admin/products/${encodeURIComponent(sku)}/image`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || response.statusText };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  const rl = readline.createInterface({
    input: fs.createReadStream(csvFilePath),
    crlfDelay: Infinity
  });

  let lineNum = 0;
  let successCount = 0;
  let failCount = 0;
  const failures = [];

  console.log('🚀 Starting bulk image update...\n');

  for await (const line of rl) {
    lineNum++;
    if (lineNum === 1) continue; // Skip header
    if (!line.trim()) continue;

    const [sku, imageUrl] = line.split(',').map(s => s.trim());

    if (!sku || !imageUrl) {
      console.warn(`⚠️  Line ${lineNum}: Invalid format (skipped)`);
      continue;
    }

    process.stdout.write(`[${lineNum}] Updating ${sku}... `);

    const result = await updateProductImage(sku, imageUrl);

    if (result.success) {
      console.log('✅ Done');
      successCount++;
    } else {
      console.log(`❌ Failed: ${result.error}`);
      failCount++;
      failures.push({ sku, error: result.error });
    }

    // Rate limit: 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Completed: ${successCount} updated, ${failCount} failed`);

  if (failures.length > 0) {
    console.log('\n❌ Failed updates:');
    failures.forEach(({ sku, error }) => {
      console.log(`  - ${sku}: ${error}`);
    });
  }
}

main().catch(console.error);
