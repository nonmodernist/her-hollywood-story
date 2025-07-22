#!/bin/bash

# Update script for implementing hash routing

echo "🚀 Implementing Hash Routing Fix for Her Hollywood Story"
echo "================================================"

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# Step 1: Backup the current database-app.js
echo "1. Backing up current database-app.js..."
cp site/js/spa/database-app.js site/js/spa/database-app-backup.js
echo "   ✅ Backup created: site/js/spa/database-app-backup.js"

# Step 2: Copy the updated file
echo "2. Applying the updated database-app.js..."
cp site/js/spa/database-app-updated.js site/js/spa/database-app.js
echo "   ✅ Updated file applied"

# Step 3: Verify the module file exists
echo "3. Checking for hybrid-router module..."
if [ -f "site/js/spa/modules/hybrid-router.js" ]; then
    echo "   ✅ hybrid-router.js module found"
else
    echo "   ❌ ERROR: hybrid-router.js module not found!"
    echo "   Please ensure the module file was created"
    exit 1
fi

# Step 4: Verify routing helper is included
echo "4. Checking routing-helper in index.html..."
if grep -q "routing-helper.js" site/database/index.html; then
    echo "   ✅ routing-helper.js is included in index.html"
else
    echo "   ⚠️  WARNING: routing-helper.js not found in index.html"
    echo "   You may need to add it manually"
fi

echo ""
echo "✨ Hash routing implementation complete!"
echo ""
echo "Next steps:"
echo "1. Complete the database-app.js by copying remaining functions from the backup"
echo "2. Test locally: npm run dev"
echo "3. Commit and push to GitHub"
echo "4. Test on GitHub Pages with a direct URL"
echo ""
echo "Test URL: https://nonmodernist.com/adapted-from-women/site/database/film/uncle-toms-cabin-part-3-1910"
echo "Should redirect to: https://nonmodernist.com/adapted-from-women/site/database/#/film/uncle-toms-cabin-part-3-1910"
