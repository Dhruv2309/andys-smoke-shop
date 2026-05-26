# Quick Start: Adding Real Product Images to Your Smoke Shop

## 🚀 The Fast Way (5 minutes)

### Step 1: Get Your Admin Access

Your backend has been updated with a database migration. Run this once in your backend:

```bash
curl -X POST http://localhost:3000/api/bootstrap/make-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "YOUR-EMAIL@example.com",
    "secret": "andys-bootstrap-2024"
  }'
```

Then login to your app and click **Admin** in the top right.

---

### Step 2: Find Real Product Images

#### **For Geek Bar Vapes** (Most Popular)
```
Best sources:
1. Amazon: https://amazon.com → Search "Geek Bar Pulse 15000 [Flavor]"
   → Right-click image → Copy image link
   
2. Official: https://www.geekbarofficial.com
   → Click "Products" → Find your flavor
   → Image URL usually ends in: .jpg or .png
   
3. Distributor: https://cloud9smokeshop.com
   → Search "Geek Bar" → View product page
   → Copy image URL (usually works great!)
```

**Example Geek Bar Flavors:**
- Geek Bar Pulse 15000 Blue Raspberry
- Geek Bar Pulse 15000 Watermelon
- Geek Bar Pulse 15000 Cool Mint
- Geek Bar Pulse 15000 Banana Ice

#### **For Elf Bar**
```
https://elfbar.com/products/[product-name]
Images available in their product catalog
```

#### **For RandM Tornado**
```
Search: "RandM Tornado [Flavor Name]" on Amazon
Copy the main product image URL
```

#### **For Cigarettes/Tobacco**
```
1. Google Images: Search "[Brand] [Product] cigarettes package"
2. Right-click → "Open image in new tab"
3. Copy the URL from address bar
4. Make sure URL starts with https:// (not http://)
```

---

### Step 3: Update Your Products

#### **Method A: Via Admin Panel (Easiest)**
1. Login to your app → Click **Admin**
2. Find the product you want to update
3. Click **Edit**
4. Paste the image URL in the **"Image URL"** field
5. Click **Save**

Example URL format:
```
https://example.com/products/geek-bar-pulse.jpg
https://m.media-amazon.com/images/I/abc123XYZ.jpg
https://cdn.shopify.com/s/files/1/path/to/image.png
```

#### **Method B: Via API (For Bulk Updates)**

**Find Your JWT Token:**
1. Open your app in browser
2. Open DevTools (F12)
3. Go to **Storage** → **Local Storage** → Your domain
4. Copy the `token` value

**Update One Product:**
```bash
TOKEN="paste-your-token-here"
SKU="GEEK-BAR-001"
IMAGE_URL="https://example.com/image.jpg"

curl -X PUT http://localhost:3000/api/admin/products/$SKU/image \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"imageUrl\": \"$IMAGE_URL\"}"
```

**Bulk Update (CSV):**

1. Create file `products-images.csv`:
```csv
sku,imageUrl
GEEK-BAR-001,https://amazon.com/geek-bar-blue.jpg
GEEK-BAR-002,https://amazon.com/geek-bar-water.jpg
ELF-BAR-001,https://cdn.example.com/elfbar.jpg
```

2. Run the bulk script:
```bash
JWT_TOKEN="your-token" API_URL="http://localhost:3000" \
  node backend/scripts/update-product-images.js
```

---

## 📸 Recommended Image Sources (Ranked)

| Source | Quality | Speed | Legal | Reliability |
|--------|---------|-------|-------|-------------|
| **Amazon** | ⭐⭐⭐⭐⭐ | Fast | ✅ | High |
| **Brand Official** | ⭐⭐⭐⭐⭐ | Varies | ✅ | High |
| **Distributor CDN** | ⭐⭐⭐⭐ | Fast | ✅ | High |
| **Google Images** | ⭐⭐⭐ | Fast | ⚠️ | Medium |
| **Pinterest** | ⭐⭐⭐ | Fast | ⚠️ | Medium |

---

## ✅ Image URL Checklist

Before using an image URL, verify:

- [ ] URL starts with `https://` (not `http://`)
- [ ] Paste URL in browser - image loads
- [ ] Image clearly shows the product (not generic)
- [ ] Image resolution is at least 300x300px
- [ ] URL is stable (won't expire soon)

❌ **BAD URLs:**
- `salad-bowl.jpg` (missing protocol)
- `http://...` (insecure)
- Pinterest links (often expire)
- URLs requiring login

✅ **GOOD URLs:**
- `https://m.media-amazon.com/images/I/71...jpg`
- `https://cdn.shopify.com/s/files/1/.../product.png`
- `https://www.geekbarofficial.com/images/products/...jpg`

---

## 🔗 Direct Links to Popular Products

### Geek Bar Pulse 15000
- **Amazon**: https://amazon.com/s?k=Geek+Bar+Pulse+15000
- **Official**: https://www.geekbarofficial.com/products/geek-bar-pulse
- **Cloud 9**: https://cloud9smokeshop.com/search?q=geek+bar+pulse

### Elf Bar
- **Official**: https://elfbar.com
- **Distributor**: https://elfbar.com/collections

### RandM Tornado
- **Amazon**: https://amazon.com/s?k=RandM+Tornado
- **Cloud 9**: https://cloud9smokeshop.com/search?q=randm+tornado

---

## 🆘 Troubleshooting

### "Image not showing in my shop"
✅ Solution:
1. Verify URL works in browser first
2. Check it starts with `https://`
3. Admin panel should show "✅ Done"

### "API returns 404 error"
✅ Solution:
1. Check product SKU is correct (case-sensitive)
2. Login as admin user
3. Verify JWT token is valid

### "Image URL keeps expiring"
✅ Solution:
- Use Amazon S3 or Cloudinary instead
- These are permanent, fast CDNs
- See guide below for setup

---

## 💡 Pro Tips

### 1. **Use Amazon URLs** (Easy & Reliable)
```
Search for product on Amazon
Copy image URL from product page
Works great for vape products!
```

### 2. **Optimize with Cloudinary** (Best Performance)
Free image hosting with optimization:
```
1. Sign up: https://cloudinary.com (free tier)
2. Upload your image
3. Copy the CDN URL
4. Use in admin panel
```

### 3. **Batch Update Script**
If you have 50+ products:
```bash
# Create CSV with all products
# Run: JWT_TOKEN=xxx node backend/scripts/update-product-images.js
# Done in 30 seconds!
```

### 4. **Use Image Proxies** (For Troublesome URLs)
If an image URL blocks direct linking:
```
https://images.weserv.nl/?url=https://example.com/image.jpg
```

---

## 🎯 Next Steps

1. **Find 5 Geek Bar product images** from Amazon
2. **Update those 5 products** via Admin panel
3. **Screenshot and save** the URLs in a CSV
4. **Bulk update remaining** products via API

Your shop will look **professional and trustworthy** with real product images!

---

## ⚖️ Legal Note

- ✅ **Legal**: Use official brand images, distributor images, or take your own
- ✅ **Legal**: Use Amazon product images for your own business
- ⚠️ **Gray Area**: Pinterest, eBay, or third-party sites (verify terms)
- ❌ **Illegal**: Stealing copyrighted images without permission

**Best practice**: Always use official brand or authorized distributor images.

