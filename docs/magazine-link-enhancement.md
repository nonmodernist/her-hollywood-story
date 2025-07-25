## Handoff Prompt: Enhanced Magazine Archive Links for v2.0

### Current Implementation (v1.0)
We've added basic archive links to work detail pages. When a work has a `digitized_url` in its magazine publication data, we display a simple styled link to the digital archive.

### Future Enhancement Plan (v2.0)

#### 1. Archive Type Detection
Create a helper function to identify and customize display based on archive source:

```javascript
function getArchiveInfo(url) {
    // Patterns to detect:
    // - hdl.handle.net / hathitrust.org → HathiTrust
    // - archive.org → Internet Archive  
    // - books.google.com → Google Books
    // - babel.hathitrust.org → HathiTrust Babel
    // - onlinebooks.library.upenn.edu → UPenn Digital Library
    
    // Return object with:
    // - name: "HathiTrust Digital Library"
    // - icon: appropriate emoji or SVG
    // - accessNote: "Free with login" / "Public domain" / etc.
}
```

#### 2. Magazine Cover Images
Add field to data structure:
```json
"magazine_publication": {
    "magazine_cover_url": "https://archive.org/services/img/cosmopolitan192003",
    "magazine_cover_thumbnail": "https://archive.org/services/img/cosmopolitan192003/thumb",
    // existing fields...
}
```

Display as clickable thumbnail:
```html
<a href="[digitized_url]" class="magazine-cover-link">
    <img src="[thumbnail]" alt="Cover of [magazine] [date]" loading="lazy">
</a>
```

#### 3. Enhanced Context
Add these fields to help users find content:
- `page_start`: Page number where story begins
- `page_end`: Page number where story ends  
- `toc_listed`: Boolean - is it in table of contents?
- `search_tips`: Custom hints like "Listed under 'Short Stories'"

#### 4. Multiple Archive Sources
Some magazines are digitized in multiple places. Structure:
```json
"digital_archives": [
    {
        "url": "...",
        "type": "hathitrust",
        "access": "public",
        "quality": "high",
        "has_ocr": true
    },
    {
        "url": "...",
        "type": "archive.org",
        "access": "public",
        "quality": "medium",
        "has_ocr": false
    }
]
```

#### 5. Implementation Checklist
- [ ] Add cover image fields to build process
- [ ] Create archive detection function
- [ ] Design thumbnail gallery component
- [ ] Add "View on [Archive Name]" dynamic text
- [ ] Include page numbers when available
- [ ] Add tooltips explaining access levels
- [ ] Create fallback for missing covers
- [ ] Test load performance with images
- [ ] Add lazy loading for cover images
- [ ] Consider CDN for thumbnail caching

#### 6. Nice-to-Have Features
- Preview of table of contents
- "Also in this issue" for context - YES LET'S DO THIS
- Reading time estimates
- OCR quality warnings
- Login requirement notifications
- Archive.org BookReader embed (only on request)

#### 7. Data Sources for Covers
- Internet Archive: `https://archive.org/services/img/[identifier]`
- HathiTrust: Check their API documentation
- Manual upload to `images/magazine-covers/`

### Why This Matters
Enhanced archive links will:
- Help users understand what they're clicking
- Set expectations about access and quality
- Provide visual interest to work pages
- Reduce frustration from dead-end clicks
- Showcase the magazine culture context

### Current Blockers
- Need to audit which archives allow hotlinking images
- Page number data not currently in database
- Would need to enhance build process for cover URLs
- Performance considerations for image loading

Save this for when we're ready to make the work detail pages even richer!