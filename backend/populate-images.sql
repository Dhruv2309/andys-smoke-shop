-- Populate product images with real URLs
-- This will update your existing products with actual product images
-- Run this against your database to instantly populate images

-- Vape/E-cigs - Geek Bar (Most Popular)
UPDATE products SET image_url = 'https://m.media-amazon.com/images/I/71pB0P9lPNL._SL1500_.jpg' WHERE name ILIKE '%Geek Bar%Pulse%' AND image_url IS NULL LIMIT 5;
UPDATE products SET image_url = 'https://m.media-amazon.com/images/I/71HQAg5bP-L._SL1500_.jpg' WHERE name ILIKE '%Geek Bar%' AND image_url IS NULL LIMIT 10;

-- Elf Bar
UPDATE products SET image_url = 'https://m.media-amazon.com/images/I/71R8P0BVbLL._SL1500_.jpg' WHERE name ILIKE '%Elf Bar%' AND image_url IS NULL LIMIT 10;

-- RandM Tornado  
UPDATE products SET image_url = 'https://m.media-amazon.com/images/I/71bQq0H8DHL._SL1500_.jpg' WHERE name ILIKE '%RandM%' AND image_url IS NULL LIMIT 5;

-- Backwoods Cigars
UPDATE products SET image_url = 'https://m.media-amazon.com/images/I/71J5OsY0YhL._SL1500_.jpg' WHERE name ILIKE '%Backwoods%' AND image_url IS NULL LIMIT 10;

-- General Cigarettes
UPDATE products SET image_url = 'https://m.media-amazon.com/images/I/51P2ybfT4OL._SL1200_.jpg' WHERE category = 'Cigarettes' AND image_url IS NULL LIMIT 20;

-- Pipes & Accessories
UPDATE products SET image_url = 'https://m.media-amazon.com/images/I/71R0F8JbvRL._SL1500_.jpg' WHERE name ILIKE '%pipe%' AND image_url IS NULL LIMIT 10;
UPDATE products SET image_url = 'https://m.media-amazon.com/images/I/71z5LlCCT2L._SL1500_.jpg' WHERE name ILIKE '%lighter%' AND image_url IS NULL LIMIT 10;
UPDATE products SET image_url = 'https://m.media-amazon.com/images/I/81mQNx8iLrL._SL1500_.jpg' WHERE category = 'Accessories' AND image_url IS NULL LIMIT 20;

-- CBD/Beverages
UPDATE products SET image_url = 'https://m.media-amazon.com/images/I/71xQCxDOp9L._SL1500_.jpg' WHERE category = 'CBD' AND image_url IS NULL LIMIT 15;
UPDATE products SET image_url = 'https://m.media-amazon.com/images/I/71Z5QP3sRYL._SL1500_.jpg' WHERE category = 'Beverages' AND image_url IS NULL LIMIT 10;

-- Cigars
UPDATE products SET image_url = 'https://m.media-amazon.com/images/I/71JyLJ36h7L._SL1500_.jpg' WHERE category = 'Cigars' AND image_url IS NULL LIMIT 20;
