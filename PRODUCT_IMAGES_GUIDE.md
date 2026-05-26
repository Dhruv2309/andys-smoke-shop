# Product Images Setup Guide

## Overview
Your smoke shop now supports product-specific images. Here's how to add real product images through legitimate sources.

## ✅ How to Get Legitimate Product Images

### Option 1: Brand Official Images (Best Quality)
1. **Geek Bar & Other Vape Brands**
   - Visit brand official websites
   - Look for "Wholesale" or "Product Catalog" sections
   - Download product images from their brand partner resources
   - Examples:
     - [Geek Bar Official](https://www.geekbarofficial.com/) - Check wholesale portal
     - [Elf Bar Official](https://elfbar.com/) - Brand resources
     - [Breeze Pro](https://www.breezepro.com/)

2. **Authorized Distributors**
   - Contact your wholesale supplier
   - Ask for product photography/catalog
   - Most distributors provide high-quality product images
   - Example suppliers:
     - Cloud 9
     - Golden Token
     - Vpro Distribution

### Option 2: Amazon/Retail Listings
- Search for the exact product on Amazon
- Right-click product image and copy image URL
- Use this URL in your admin panel (most are allowed for personal business use)

### Option 3: Your Own Photography
- Take professional photos of products in your store
- Upload to a hosting service:
  - **Imgur** (free, simple): https://imgur.com
  - **Amazon S3** (scalable, professional)
  - **Cloudinary** (image optimization, free tier)
  - **ImageKit** (CDN with optimization)

### Option 4: Free Stock Photo Sites
For generic category backups (not recommended as primary):
- Unsplash
- Pexels
- Pixabay
- BUT: Use specific product images instead when possible

---

## 📋 How to Add Images via Admin API

### 1. Get Your Admin Token
First, make yourself an admin by running this **once** (via your backend):
```bash
# Via POST to your backend
POST /api/bootstrap/make-admin
{
  "email": "your-email@example.com",
  "secret": "andys-bootstrap-2024"  // Check your .env for actual secret
}
```

### 2. Update Product Images via API

#### Method A: Update Single Product Image
```bash
curl -X PUT http://localhost:3000/api/admin/products/SKU123/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/product-image.jpg"
  }'
```

#### Method B: Update Multiple Product Fields (including image)
```bash
curl -X PUT http://localhost:3000/api/admin/products/SKU123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Geek Bar Pulse 15000",
    "brand": "Geek Bar",
    "price": 19.99,
    "imageUrl": "https://example.com/geek-bar-pulse.jpg"
  }'
```

### 3. Image URL Requirements
✅ **Valid URLs:**
- `https://example.com/image.jpg`
- `https://cdn.example.com/products/image.png`
- `https://imgur.com/abc123.jpg`
- `https://your-domain.com/images/product.webp`

❌ **Invalid URLs:**
- `image.jpg` (missing protocol)
- `http://` (use HTTPS for security)
- URLs that expire or require authentication

---

## 🎨 Using the Admin Panel (Coming Soon)

Once the frontend admin panel is implemented, you'll be able to:
1. Click "Edit Product"
2. Paste an image URL in the "Image URL" field
3. Preview the image
4. Save

---

## 🔍 Finding Specific Product Images

### For Geek Bar Flavors:
```
Common Geek Bar Pulse flavors:
- Geek Bar Pulse 15000 (Blue Raspberry, Watermelon, Cool Mint, Banana Ice, etc.)
```

Search pattern: `"[Product Name]" filetype:jpg site:geekbarofficial.com`

### For Popular Brands:
- **Elf Bar**: Search "Elf Bar [Flavor] official product image"
- **Breeze**: "Breeze Pro [Flavor]"
- **RandM**: "RandM Tornado [Flavor]"

### Quick URL Examples:
```
Typical wholesale catalog URLs:
https://www.geekbarofficial.com/products/[product-name]
https://cdn.shopify.com/s/files/1/...  (Shopify CDN)
https://images-na.ssl-images-amazon.com/... (Amazon)
```

---

## 💡 Pro Tips

1. **Use HTTPS URLs only** - HTTP images won't load on your HTTPS site
2. **Test URLs** - Paste the URL in your browser first to confirm it works
3. **Use CDN URLs** - They load faster than direct source URLs
4. **File formats**: JPG, PNG, WebP are ideal (typically 500x500px or larger)
5. **Bulk update**: Script the API calls to update multiple products at once

---

## 🛠️ Bulk Update Script Example

If you have many products to update, create a CSV with SKU and image URLs, then run:

```bash
#!/bin/bash
# bulk-update-images.sh

TOKEN="your-jwt-token"
BASE_URL="http://localhost:3000"

while IFS=',' read -r sku imageUrl; do
  echo "Updating $sku..."
  curl -X PUT "$BASE_URL/api/admin/products/$sku/image" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"imageUrl\": \"$imageUrl\"}"
done < products-images.csv
```

---

## ⚠️ Common Issues

### Image not showing?
- ✅ Check URL is HTTPS
- ✅ Paste URL in browser to confirm it's accessible
- ✅ Check CORS settings if using external CDN
- ✅ Confirm API returned `"success": true`

### Getting 404 on image URL?
- The URL might have expired or requires authentication
- Try a different source
- Consider hosting your own images

### Database not updating?
- Confirm you have admin access (`is_admin = true` in database)
- Check JWT token is valid
- Verify SKU exists in products table

---

## 📦 Next Steps

1. **Collect product images** from legitimate sources
2. **Test one update** via API to confirm it works
3. **Batch update** remaining products
4. **Monitor** for any expired image URLs and refresh them periodically

