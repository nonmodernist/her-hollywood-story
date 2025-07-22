# Quick Implementation Guide

## What I've Created

1. **`routing-helper.js`** - Automatically redirects path URLs to hash URLs on GitHub Pages
2. **`hybrid-router.js`** - A router that works with both hash and path routing
3. **`database-app-hash.js`** - Started converting the main app to use the hybrid router

## What You Need to Do

### 1. Update database-app.js to use the hybrid router

Replace the current Router class with the HybridRouter:

```javascript
// At the top of database-app.js
import { HybridRouter } from './modules/hybrid-router.js';

// In the init() function, replace the router initialization with:
router = new HybridRouter({ basePath: BASE_PATH });

// Define routes
router
    .route('/', () => showList('films'))
    .route('/films', () => showList('films'))
    .route('/authors', () => showList('authors'))
    .route('/works', () => showList('works'))
    .route('/film/:slug', (params) => showDetail('film', params.slug))
    .route('/author/:slug', (params) => showDetail('author', params.slug))
    .route('/work/:slug', (params) => showDetail('work', params.slug))
    .route('*', () => showList('films'));

// Initialize (this handles redirects)
router.init();
```

### 2. Update link generation

Replace all instances of `getDatabaseURL()` with `router.getDatabaseURL()`:

```javascript
// Old
<a href="${getDatabaseURL('/film/' + film.slug)}">

// New
<a href="${router.getDatabaseURL('/film/' + film.slug)}">
```

### 3. Update URL updates

Replace direct history manipulation with router methods:

```javascript
// Old
history.replaceState(null, '', path);

// New
router.updateQuery(params);
```

### 4. Test the redirect flow

1. Push to GitHub Pages
2. Try accessing: `https://nonmodernist.com/adapted-from-women/site/database/film/uncle-toms-cabin-part-3-1910`
3. It should redirect to: `https://nonmodernist.com/adapted-from-women/site/database/#/film/uncle-toms-cabin-part-3-1910`
4. The page should load correctly

### 5. Update pattern page links

On your pattern pages, update links to use hash routing:

```html
<!-- Old -->
<a href="/database/film/the-bat-1926">

<!-- New -->
<a href="/database/#/film/the-bat-1926">
```

Or better yet, use JavaScript to generate the correct URLs:

```javascript
// In pattern page scripts
function getDatabaseLink(path) {
    const base = '/adapted-from-women/site';
    return `${base}/database/#${path}`;
}
```

## Alternative: Quick Fix

If you want the quickest solution without refactoring, you could:

1. Just add the `routing-helper.js` to redirect to the list view
2. Users would land on `/database/` and could search for the film
3. Not ideal but works immediately

## Why This Solution?

- GitHub Pages doesn't support SPA routing natively
- The hash (#) part of the URL doesn't trigger a server request
- JavaScript can read and route based on the hash
- It's the standard solution for SPAs on static hosts

Let me know if you need help with any part of the implementation!
