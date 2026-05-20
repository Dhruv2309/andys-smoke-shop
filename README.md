# Andy's Smoke Shop App

A cross-platform retail experience for Andy's Smoke Shop at 5780 Broadway, Merrillville, IN.

This monorepo contains:

- `app/` - Expo mobile app with web support
- `backend/` - Fastify API serving products, cart checkout, and age verification

## Features

- Product shopping cart
- Category browsing for tobacco, vaping, CBD/Delta, snacks, beverages, and accessories
- In-app checkout flow with mock payment microservice
- Age verification flow for Indiana retail
- Expo iOS/Android + web PWA support

## Local development

```bash
cd /Users/dhruv2309/andys-smoke-shop
npm install
npm run dev
```

Then open:
- Web: `http://localhost:19006`
- Mobile: `expo` will show QR code / device options
- Backend API: `http://localhost:3000/api/products`

## Build

```bash
npm run build:web
npm run build:backend
```

## Publish

- Web: Deploy the `app` web build to Vercel, Netlify, or any static host
- Mobile: Use Expo to publish to iOS and Android app stores

### GitHub

If you already have a GitHub repository, add it as a remote:

```bash
cd /Users/dhruv2309/andys-smoke-shop
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### Expo publish

```bash
cd /Users/dhruv2309/andys-smoke-shop/app
npm install
npx expo publish
```

> Note: actual App Store / Google Play publishing requires Apple and Google developer accounts and approval.

## Legal and compliance

This app is a starting point for retail commerce. Please verify Indiana and federal law before selling regulated tobacco, nicotine, THC, CBD, or vape products.
