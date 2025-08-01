# Handoff: Add Featured Media to Film Grid View

## Context
We have a film database SPA that currently shows films in list or grid view. The grid view is just a placeholder right now - clicking the grid view button doesn't do anything. We have media data available in `film_media.csv` with posters, stills, and other images from Wikimedia Commons and TMDb, but this media data isn't being included in the build process or displayed in the grid.

## Current State

### 1. Media Data Structure (film_media.csv)
```csv
id,film_id,media_type,media_format,url,thumbnail_url,download_url,title,caption,description,source,source_id,source_url,license,attribution,copyright_holder,copyright_year,width,height,file_size,mime_type,quality_score,verified,verified_by,verified_at,display_order,is_featured,is_hidden,created_at,updated_at
```

Key fields:
- `film_id`: Links to films table
- `media_type`: poster, still, advertisement, other
- `thumbnail_url`: Pre-sized for grid display (~300px)
- `url`: Full-size image
- `is_featured`: Boolean flag for preferred images
- `caption`: Description of the image

### 2. Current Film Index Structure
The build process creates `data/database/films-index.json` with:
```json
{
  "id": 4,
  "slug": "a-lady-of-quality-1913",
  "hasMedia": true,
  "mediaCount": 1,
  // ... but NO actual media URLs or featured image data
}
```

### 3. Current Grid View Issue
- Grid view doesn't exist yet
- `createFilmGridItem()` in `database-app.js` is just a placeholder

## Task: Implement Featured Media Selection

### Step 1: Update Build Process
**File**: `src/scripts/enhanced-build/build-enhanced-database.js`

Add these functions after the existing helper functions:

```javascript
/**
 * Select the best media item for grid display
 * Priority: featured > poster > still > advertisement
 */
function selectFeaturedMedia(filmId, allMedia) {
  const filmMedia = allMedia.filter(m => m.film_id === filmId);
  
  if (filmMedia.length === 0) return null;
  
  // First priority: explicitly featured items
  const featured = filmMedia.find(m => m.is_featured === 'True' || m.is_featured === true);
  if (featured) return formatMediaForIndex(featured);
  
  // Then by type priority
  const priorities = ['poster', 'still', 'advertisement', 'other'];
  
  for (const type of priorities) {
    const media = filmMedia.find(m => m.media_type === type);
    if (media) return formatMediaForIndex(media);
  }
  
  // Fallback to first available
  return formatMediaForIndex(filmMedia[0]);
}

/**
 * Format media item for inclusion in index
 */
function formatMediaForIndex(media) {
  return {
    type: media.media_type,
    thumbnailUrl: media.thumbnail_url,
    fullUrl: media.url,
    caption: media.caption || media.title || '',
    source: media.source,
    attribution: media.attribution || media.copyright_holder || ''
  };
}
```

**In the same file**, find where films are processed (likely in `buildEnhancedDatabase()`) and add:

```javascript
// Load media data
console.log('Loading media data...');
const mediaData = await loadCSV('film_media.csv');

// Then when processing each film (around line 200-300), add:
const featuredMedia = selectFeaturedMedia(film.id, mediaData);

// Add to the enhanced film object:
enhancedFilm.featuredMedia = featuredMedia;
```

### Step 2: Update Index Generation
**File**: `src/scripts/enhanced-build/generate-indexes.js`

Find where film index entries are created and add the `featuredMedia` field:

```javascript
const indexEntry = {
  id: film.id,
  slug: film.slug,
  // ... existing fields ...
  hasMedia: film.hasMedia,
  mediaCount: film.mediaCount,
  featuredMedia: film.featuredMedia, // ADD THIS LINE
  // ... rest of fields ...
};
```

### Step 3: Update Grid View Display
**File**: `js/spa/database-app.js`

The `createFilmGridItem()` function already expects this data, but update it to handle missing images better:

```javascript
function createFilmGridItem(film) {
    const item = document.createElement('div');
    item.className = 'film-item';
    item.onclick = () => router.navigate(getDatabaseURL('/film/' + film.slug));
    
    let posterContent;
    
    if (film.featuredMedia && film.featuredMedia.thumbnailUrl) {
        // Use thumbnail URL for grid, with lazy loading
        posterContent = `
            <img src="${film.featuredMedia.thumbnailUrl}" 
                 alt="${film.featuredMedia.caption || film.title + ' poster'}"
                 loading="lazy"
                 onerror="this.onerror=null; this.parentElement.classList.add('no-image'); this.parentElement.innerHTML='<span>No Image</span>';">
        `;
    } else if (film.hasMedia) {
        // Has media but not in index - shouldn't happen after build update
        posterContent = '<span>Media Loading...</span>';
    } else {
        // No media available
        posterContent = '<span>No Image</span>';
    }
    
    item.innerHTML = `
        <div class="film-poster ${!film.featuredMedia ? 'no-image' : ''}">
            ${posterContent}
        </div>
        <div class="film-title">${film.html_title}</div>
        <div class="film-year">${film.year}</div>
    `;
    
    return item;
}
```

### Step 4: Test the Implementation

1. **Rebuild the data**:
   ```bash
   npm run build:clean
   ```

2. **Check the output**:
   - Open `data/database/films-index.json`
   - Verify films now have `featuredMedia` objects with URLs

3. **Test the grid view**:
   - Navigate to `/database/films`
   - Switch to grid view
   - Images should now load for films that have media

### Step 5: Performance Optimization (Optional)

If load performance is poor, consider:

1. **Add intersection observer for lazy loading**:
```javascript
// In database-app.js
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
        }
    });
});

// Then modify image creation to use data-src
```

2. **Add loading skeletons** while images load

3. **Consider CDN or image optimization** for thumbnail generation

## Expected Outcome

After implementation:
- Film grid shows actual poster/still images from Wikimedia or TMDb
- Images load efficiently with proper lazy loading
- Graceful fallbacks for films without media
- Featured/best quality images are automatically selected
- Grid view becomes visually engaging and useful

## Files to Modify

1. `src/scripts/enhanced-build/build-enhanced-database.js` - Add media selection logic
2. `src/scripts/enhanced-build/generate-indexes.js` - Include featured media in index
3. `js/spa/database-app.js` - Already set up, may need minor tweaks
4. `css/pages/database-spa.css` - May need style adjustments for loaded images

## Testing Checklist

- [ ] Build process completes without errors
- [ ] films-index.json includes featuredMedia objects
- [ ] Grid view displays actual images
- [ ] Images lazy load properly
- [ ] Fallback text appears for films without media
- [ ] Click on grid items still navigates to detail page
- [ ] Performance is acceptable with many images

---

This implementation will transform your grid view from placeholder text to a rich, visual browsing experience using the Wikimedia images you've already collected!