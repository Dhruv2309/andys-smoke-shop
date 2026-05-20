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

### GitHub setup

This project is ready for GitHub publishing. Use the following commands after creating a repository named `andys-smoke-shop` under your GitHub account:

```bash
cd /Users/dhruv2309/andys-smoke-shop
git remote add origin https://github.com/Dhruv2309/andys-smoke-shop.git
git push -u origin main
```

### Web deployment

This repo includes a GitHub Actions workflow to build and deploy the Expo web output to GitHub Pages on every push to `main`.

To deploy manually:

```bash
cd /Users/dhruv2309/andys-smoke-shop
npm install
npm run build:web
```

To publish to GitHub Pages:

1. Push to `main`
2. Enable GitHub Pages in repo settings using branch `gh-pages`
3. The site will be available at `https://Dhruv2309.github.io/andys-smoke-shop`

### Expo mobile publish

To publish to Expo Cloud and prepare for iOS/Android app store submission:

```bash
cd /Users/dhruv2309/andys-smoke-shop/app
npm install
npx expo login
npx eas build --platform all
```

### Stripe secret configuration

Copy `.env.example` to `.env` and set your Stripe secret key:

```bash
cp .env.example .env
# then edit .env and set STRIPE_SECRET_KEY
```

For production, set these values in your deployment environment:

- `STRIPE_SECRET_KEY`
- `SUCCESS_URL`
- `CANCEL_URL`
- `BACKEND_URL`

> Note: actual App Store / Google Play publishing requires Apple and Google developer accounts and approval.

## Legal and compliance

This app is a starting point for retail commerce. Please verify Indiana and federal law before selling regulated tobacco, nicotine, THC, CBD, or vape products.
