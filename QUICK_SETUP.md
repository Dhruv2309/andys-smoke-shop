# 🚀 QUICK START - Image Population

## ✅ Your code is DEPLOYED! 

Your changes have been pushed to GitHub and Railway is automatically deploying them now.

---

## 📸 NEXT: Get Your Database URL (2 minutes)

### 📱 On Your Phone/Computer:

1. **Open:** https://railway.app
2. **Login** with your email
3. **Look for** "andys-smoke-shop" project
4. **Click** on it
5. **Find** "Postgres" or "postgres" database
6. **Click** on the database  
7. **Look for** "Variables" section
8. **Find** "DATABASE_URL"
9. **Click** the COPY button
10. **Your DATABASE_URL is now copied!** ✅

---

## 💻 On Your Computer:

Open Terminal and run this command:

```
~/andys-smoke-shop/setup-wizard.sh
```

Then:
1. When asked, paste your DATABASE_URL
2. Press Enter
3. Wait for it to finish (~30 seconds)
4. Done! ✅

---

## 📸 Step-by-Step with Railway.app

### Find Your DATABASE_URL:

**In Railway Dashboard:**
```
1. Visit: https://railway.app
2. Login
3. Click "andys-smoke-shop" project
4. Click "Postgres" database (on left sidebar)
5. Go to "Variables" tab
6. Find "DATABASE_URL"
7. Click the copy icon
```

**It looks like this:**
```
postgresql://postgres:xyz123@db.railway.internal:5432/railway
```

---

## ⚡ Run the Setup

Once you have your DATABASE_URL:

```bash
# Option 1: Use the interactive wizard (easiest)
~/andys-smoke-shop/setup-wizard.sh

# Option 2: Run the command directly
DATABASE_URL="your-database-url-here" node ~/andys-smoke-shop/backend/scripts/quick-populate-images.js
```

Replace `your-database-url-here` with your actual URL.

---

## ✨ That's It!

After running the command:
1. All 325+ products will have real images
2. Refresh your app: https://dhruv2309.github.io/andys-smoke-shop/
3. See your beautiful shop! 🎉

---

## 🆘 Need Help?

If you get stuck:
1. Tell me the error message you see
2. Or give me your DATABASE_URL and I'll run it for you
3. Screenshot of where you're stuck

I'm here to help! 💪
