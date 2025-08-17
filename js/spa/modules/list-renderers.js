// list-renderers.js - List and grid item rendering functions

import { 
    formatNameList, 
    getDatabaseURL,
    capitalizeFirst
} from './database-config.js';

// Create a list item based on type
export function createListItem(item, type) {
    switch (type) {
        case 'films':
            return createFilmListItem(item);
        case 'authors':
            return createAuthorListItem(item);
        case 'works':
            return createWorkListItem(item);
    }
}

// Create a film list item
export function createFilmListItem(film) {
    const div = document.createElement('div');
    div.className = 'film-entry';

    const mediaIndicator = film.hasMedia ? '<span class="media-indicator" title="Media gallery available">◉</span>' : '';

    // Debug log to check film structure
    if (!film.sourceWorkSlug && !film.workSlug) {
        console.warn('Film missing work slug:', film);
    }

    // Get the work slug from the film data
    const workSlug = film.workSlug;
    const workTitle = film.workHtml || film.workTitle || film.sourceWorkTitle || 'Unknown';

    div.innerHTML = `
        <div class="entry-title">
            <a href="${getDatabaseURL('/film/' + film.slug)}">${film.html_title || film.title}</a>${mediaIndicator}
        </div>
        <div class="entry-meta font-sans">
            ${film.year || 'Unknown year'}<span class="meta-separator">·</span>
            Based on ${workSlug ? `<a href="${getDatabaseURL('/work/' + workSlug)}">${workTitle}</a>` : workTitle} 
            by <a href="${getDatabaseURL('/author/' + film.authorSlug)}">${film.authorName || 'Unknown'}</a><span class="meta-separator">·</span>
            ${film.directors ? `Directed by  ${formatNameList(film.directors)}<span class="meta-separator">·</span>` : ''}
            ${film.studio || 'Unknown Studio'}
            ${film.isRemake ? '<span class="media-indicator" title="Based on a source that was adapted more than once">※</span>' : ''}

        </div>
    `;

    return div;
}

// Create an author list item
export function createAuthorListItem(author) {
    const div = document.createElement('div');
    div.className = 'author-entry';

    const lifespan = author.birthYear || author.deathYear
        ? `(${author.birthYear || '?'}–${author.deathYear || '?'})`
        : '';

    div.innerHTML = `
        <div class="author-info">
            <div class="author-name">
                <a href="${getDatabaseURL('/author/' + author.slug)}">${author.name}</a>
                ${author.isTwentyTimer ? '<span class="media-indicator" title="Member of the Twenty Timers Club">⁑︎</span>' : ''}
            </div>
            <div class="author-lifespan font-sans">${lifespan}</div>
        </div>
        <div class="author-stats font-sans">
            <div class="author-film-count">${author.filmCount}</div>
            <div class="author-film-label">Films</div>
        </div>
    `;

    return div;
}

// Create a work list item
export function createWorkListItem(work) {
    const div = document.createElement('div');
    div.className = 'work-entry';

    // Check if the work was adapted in the same year it was published
    const isSameYearAdaptation = work.publicationYear && work.firstAdaptationYear && 
                                work.publicationYear === work.firstAdaptationYear;

    div.innerHTML = `
        <div class="work-title">
            <a href="${getDatabaseURL('/work/' + work.slug)}">${work.html_title || work.title}</a>
            ${work.isRemakeChampion ? '<span class="media-indicator" title="Adapted 4 or more times">⸬︎</span>' : ''}
            ${isSameYearAdaptation ? '<span class="media-indicator" title="Adapted in the same year it was published">⧗</span>' : ''}
        </div>
        <div class="work-author">by <a href="${getDatabaseURL('/author/' + work.authorSlug)}">${work.authorName}</a></div>
        <div class="entry-meta font-sans">
            ${work.workType ? capitalizeFirst(work.workType.replace('_', ' ')) : 'Unknown type'} · 
            ${work.publicationYear || 'Unknown year'} · 
            ${work.adaptationCount} film${work.adaptationCount !== 1 ? 's' : ''}
        </div>
    `;

    return div;
}

// Create grid items 
export function createGridItem(item, type) {
    if (type === 'films') {
        return createFilmGridItem(item);
    }
    // For authors and works, still use list items for now
    return createListItem(item, type);
}

// Create film grid item with media
export function createFilmGridItem(film) {
    const item = document.createElement('div');
    item.className = 'film-item';
    // Use data attribute and handle navigation in main file via event delegation
    item.dataset.filmSlug = film.slug;
    item.style.cursor = 'pointer';
    
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
        <div class="film-poster font-sans ${!film.featuredMedia ? 'no-image' : ''}">
            ${posterContent}
        </div>
        <div class="film-title">${film.html_title}</div>
        <div class="film-year font-sans">${film.year}</div>
    `;
    
    return item;
}