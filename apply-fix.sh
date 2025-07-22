#!/bin/bash

# Apply hash routing fix to Her Hollywood Story

echo "🚀 Applying Hash Routing Fix"
echo "=========================="

# Navigate to the project directory
cd "$(dirname "$0")"

# Step 1: Backup current database-app.js
echo "1. Creating backup..."
cp site/js/spa/database-app.js site/js/spa/database-app-backup-$(date +%Y%m%d-%H%M%S).js
echo "   ✅ Backup created"

# Step 2: Apply the complete updated file
echo "2. Applying updated database-app.js..."
cp site/js/spa/database-app-complete.js site/js/spa/database-app.js
echo "   ✅ Updated file applied"

# Step 3: Verify all files are in place
echo "3. Verifying required files..."

if [ -f "site/js/spa/modules/hybrid-router.js" ]; then
    echo "   ✅ hybrid-router.js found"
else
    echo "   ❌ ERROR: hybrid-router.js not found!"
    exit 1
fi

if [ -f "site/js/spa/routing-helper.js" ]; then
    echo "   ✅ routing-helper.js found"
else
    echo "   ❌ ERROR: routing-helper.js not found!"
    exit 1
fi

# Check if routing-helper is included in index.html
if grep -q "routing-helper.js" site/database/index.html; then
    echo "   ✅ routing-helper.js is included in index.html"
else
    echo "   ⚠️  WARNING: routing-helper.js not found in index.html"
fi

echo ""
echo "✨ Implementation complete!"
echo ""
echo "Next steps:"
echo "1. Test locally: npm run dev"
echo "2. Navigate to http://localhost:8000/database/"
echo "3. Click on a film and verify it works"
echo "4. To test GitHub Pages behavior locally:"
echo "   - Open browser console"
echo "   - Run: localStorage.setItem('useHashRouting', 'true')"
echo "   - Reload the page"
echo "   - URLs should now use hash format"
echo ""
echo "5. When ready, commit and push:"
echo "   git add ."
echo "   git commit -m 'Implement hash-based routing for GitHub Pages compatibility'"
echo "   git push"
echo ""
echo "Happy coding! 🎉"
