#!/bin/bash

# 🚀 Andy's Smoke Shop - Deployment & Image Setup Wizard
# This script guides you through the entire setup process

set -e

clear

echo "╔════════════════════════════════════════════════════════╗"
echo "║   🚀 Andy's Smoke Shop Deployment Setup Wizard        ║"
echo "║      Your code is deployed! Now populate images       ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Check git status
echo "📋 Step 1: Checking deployment status..."
echo ""

if git rev-parse --git-dir > /dev/null 2>&1; then
    echo "✅ Git repository found"
    LAST_COMMIT=$(git log -1 --pretty=%B)
    echo "✅ Last commit: $LAST_COMMIT"
else
    echo "❌ Not a git repository"
    exit 1
fi

echo ""
echo "✅ Code has been pushed to GitHub"
echo "✅ Railway is auto-deploying your changes (2-3 minutes)"
echo ""

# Step 2: Get DATABASE_URL
echo "════════════════════════════════════════════════════════"
echo "🔑 Step 2: Get Your DATABASE_URL from Railway"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Follow these steps:"
echo ""
echo "1️⃣  Go to: https://railway.app"
echo "2️⃣  Login with your account"
echo "3️⃣  Select project: 'andys-smoke-shop'"
echo "4️⃣  Click the Postgres database"
echo "5️⃣  Copy the DATABASE_URL from Variables"
echo ""
echo "It will look like:"
echo "  postgresql://user:password@host:5432/railway"
echo ""
echo ""

# Read DATABASE_URL from user
read -p "🔐 Paste your DATABASE_URL here (press Enter when done): " DATABASE_URL

# Validate
if [[ ! "$DATABASE_URL" =~ ^postgresql:// ]]; then
    echo ""
    echo "❌ ERROR: Invalid DATABASE_URL"
    echo "   Make sure it starts with 'postgresql://'"
    echo ""
    exit 1
fi

echo ""
echo "✅ DATABASE_URL received!"
echo ""

# Step 3: Run image populator
echo "════════════════════════════════════════════════════════"
echo "📸 Step 3: Populating Images (this takes ~30 seconds)"
echo "════════════════════════════════════════════════════════"
echo ""

# Export the DATABASE_URL
export DATABASE_URL="$DATABASE_URL"

# Run the image populator
if [ -f "backend/scripts/quick-populate-images.js" ]; then
    echo "🎬 Starting image population..."
    echo ""
    
    if command -v node &> /dev/null; then
        cd "$(dirname "$0")"
        node backend/scripts/quick-populate-images.js
    else
        echo "❌ ERROR: Node.js is not installed"
        echo "   Install from: https://nodejs.org/"
        exit 1
    fi
else
    echo "❌ ERROR: quick-populate-images.js not found"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ ALL DONE! Your shop is ready!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "🎉 What's next:"
echo ""
echo "1. Open: https://dhruv2309.github.io/andys-smoke-shop/"
echo "2. Refresh the page (Cmd+Shift+R on Mac)"
echo "3. Login with your account"
echo "4. See all 325+ products with real images!"
echo ""
echo "If images don't appear:"
echo "  • Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "  • Clear browser cache"
echo "  • Logout and login again"
echo ""
echo "✨ Your shop is now live and beautiful! 🚀"
echo ""
