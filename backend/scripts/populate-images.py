#!/usr/bin/env python3

import os
import sys
import psycopg2
from urllib.parse import urlparse

DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    print('❌ DATABASE_URL environment variable not set')
    sys.exit(1)

print('🔄 Connecting to database...')

try:
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    print('✅ Connected to database!')
except ImportError:
    print('⚠️  psycopg2 not installed. Installing...')
    os.system('pip3 install psycopg2-binary > /dev/null 2>&1')
    try:
        import psycopg2
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        print('✅ Connected to database!')
    except Exception as e:
        print(f'❌ Connection failed: {e}')
        sys.exit(1)
except Exception as e:
    print(f'❌ Connection failed: {e}')
    sys.exit(1)

# Image URL mapping
IMAGE_MAP = {
    'geek bar pulse': 'https://m.media-amazon.com/images/I/71pB0P9lPNL._SL1500_.jpg',
    'geek bar': 'https://m.media-amazon.com/images/I/71HQAg5bP-L._SL1500_.jpg',
    'elf bar': 'https://m.media-amazon.com/images/I/71R8P0BVbLL._SL1500_.jpg',
    'randm tornado': 'https://m.media-amazon.com/images/I/71bQq0H8DHL._SL1500_.jpg',
    'breeze': 'https://m.media-amazon.com/images/I/71R0F8JbvRL._SL1500_.jpg',
    'backwoods': 'https://m.media-amazon.com/images/I/71YM4XvH-qL._SL1500_.jpg',
    'blunt': 'https://m.media-amazon.com/images/I/71YM4XvH-qL._SL1500_.jpg',
    'cigarette': 'https://m.media-amazon.com/images/I/61RcKvPnY6L._SL1500_.jpg',
    'rolling': 'https://m.media-amazon.com/images/I/71qJ3N5LMAL._SL1500_.jpg',
    'lighter': 'https://m.media-amazon.com/images/I/61+7rF6GHeL._SL1500_.jpg',
    'paper': 'https://m.media-amazon.com/images/I/71qJ3N5LMAL._SL1500_.jpg',
    'vape': 'https://m.media-amazon.com/images/I/71HQAg5bP-L._SL1500_.jpg',
}

def get_image_url(name, category):
    """Get image URL for a product based on name and category"""
    if not name:
        name = ''
    
    name_lower = name.lower()
    
    # Try to match keywords in product name
    for key, url in IMAGE_MAP.items():
        if key in name_lower:
            return url
    
    # Default by category
    if category == 'vape':
        return IMAGE_MAP.get('vape')
    elif category == 'blunt':
        return IMAGE_MAP.get('blunt')
    elif category == 'tobacco':
        return IMAGE_MAP.get('cigarette')
    
    # Generic default
    return IMAGE_MAP['vape']

# Get products without images
cur.execute('SELECT sku, name, category FROM products WHERE image_url IS NULL ORDER BY sku')
products = cur.fetchall()

print(f'\n🖼️  Found {len(products)} products without images\n')

if len(products) == 0:
    print('✅ All products already have images!')
    cur.close()
    conn.close()
    sys.exit(0)

updated = 0
for idx, (sku, name, category) in enumerate(products, 1):
    image_url = get_image_url(name, category)
    
    try:
        cur.execute(
            'UPDATE products SET image_url = %s WHERE sku = %s',
            (image_url, sku)
        )
        updated += 1
        
        if idx % 50 == 0 or idx == 1:
            print(f'⏳  Processed {idx}/{len(products)}... ({updated} updated)')
    
    except Exception as e:
        print(f'❌ Error updating {sku}: {e}')

conn.commit()
print(f'\n✅ Image population complete!')
print(f'   Updated: {updated}/{len(products)} products')

cur.close()
conn.close()
