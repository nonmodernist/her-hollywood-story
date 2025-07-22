// database-app.js - Main SPA controller for Her Hollywood Story database
// Updated to use hybrid routing for GitHub Pages compatibility

import { HybridRouter } from './modules/hybrid-router.js';

// Dynamic Base Path Detection (works everywhere!)
function getBasePath() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    // GitHub Pages (your current beta)
    if (pathname.includes('/adapted-from-women/site/')) {
        return '/adapted-from-women/site';
    }
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return '';
    }
    
    // Future production
    return '';
}

const BASE_PATH = getBasePath();

// Create consistent paths for all your data
const PATHS = {
    data: {
        index: (type) => `${BASE_PATH}/data/database/${type}-index.min.json`,
        detail: (type, slug) => `${BASE_PATH}/data/database/${type}/${slug}.json`,
        patterns: (pattern) => `${BASE_PATH}/data/patterns/${pattern}.json`
    }
};

// Configuration
const ITEMS_PER_PAGE = 50;

// Application state
const app = {
    currentRoute: {
        type: 'list',
        entity: 'films',
        slug: null
    },
    currentView: 'list',
    currentPage: 0,
    filters: {
        search: ''
    },
    sortBy: 'default',
    data: {
        films: null,
        authors: null,
        works: null
    },
    detailCache: new Map(),
    filteredData: [],
    loading: {
        films: false,
        authors: false,
        works: false
    }
};

// DOM Elements
const elements = {};

// Router instance
let router;

// Initialize the application
async function init() {
    // Cache DOM elements
    cacheElements();
    
    // Set up the hybrid router
    router = new HybridRouter({
        basePath: BASE_PATH
    });
    
    // Define routes
    router
        .route('/', () => showList('films'))
        .route('/films', () => showList('films'))
        .route('/authors', () => showList('authors'))
        .route('/works', () => showList('works'))
        .route('/film/:slug', (params) => showDetail('film', params.slug))
        .route('/author/:slug', (params) => showDetail('author', params.slug))
        .route('/work/:slug', (params) => showDetail('work', params.slug))
        .route('*', () => showList('films')); // Default route
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize router (handles redirects and triggers first route)
    const initialized = router.init();
    
    // If router is redirecting, wait for it
    if (!initialized) {
        return;
    }
}

// Cache DOM elements
function cacheElements() {
    elements.listView = document.querySelector('.database-intro').parentElement;
    elements.detailView = document.getElementById('detailView');
    elements.tabs = document.querySelectorAll('.tab-button');
    elements.searchInput = document.getElementById('searchInput');
    elements.clearSearch = document.getElementById('clearSearch');
    elements.filterRow = document.getElementById('filterRow');
    elements.sortBy = document.getElementById('sortBy');
    elements.resultsContainer = document.getElementById('resultsContainer');
    elements.resultsCount = document.getElementById('resultsCount');
    elements.loadMoreContainer = document.getElementById('loadMoreContainer');
    elements.loadMoreBtn = document.getElementById('loadMoreBtn');
    elements.showingCount = document.getElementById('showingCount');
    elements.totalCount = document.getElementById('totalCount');
    elements.clearFilters = document.getElementById('clearFilters');
    elements.statsBar = document.getElementById('statsBar');
    elements.viewButtons = document.querySelectorAll('.view-btn');
}

// Show list view
async function showList(entity, query) {
    app.currentRoute = {
        type: 'list',
        entity: entity,
        slug: null
    };
    
    // Apply query params to filters
    if (query) {
        if (query.search) {
            app.filters.search = query.search;
            if (elements.searchInput) elements.searchInput.value = app.filters.search;
        }
        if (query.sort) {
            app.sortBy = query.sort;
        }
        // Apply other filters
        Object.entries(query).forEach(([key, value]) => {
            if (key !== 'search' && key !== 'sort') {
                app.filters[key] = value;
            }
        });
    }
    
    // Show list view
    elements.listView.style.display = 'block';
    elements.detailView.style.display = 'none';
    document.title = `${capitalizeFirst(entity)} - Database - Her Hollywood Story`;
    
    // Switch to the appropriate tab
    await switchTab(entity);
}

// Show detail view
async function showDetail(entityType, slug) {
    app.currentRoute = {
        type: 'detail',
        entity: entityType + 's',
        slug: slug
    };
    
    elements.listView.style.display = 'none';
    elements.detailView.style.display = 'block';
    elements.detailView.innerHTML = '<div class="loading-state">Loading details...</div>';
    
    try {
        // Check cache first
        const cacheKey = `${entityType}-${slug}`;
        let detailData;
        
        if (app.detailCache.has(cacheKey)) {
            detailData = app.detailCache.get(cacheKey);
        } else {
            // Load detail data
            const response = await fetch(PATHS.data.detail(entityType, slug));
            if (!response.ok) throw new Error('Failed to load details');
            
            detailData = await response.json();
            app.detailCache.set(cacheKey, detailData);
        }
        
        // Update page title
        const title = detailData.title || detailData.name || 'Detail';
        document.title = `${title} - Her Hollywood Story`;
        
        // Render detail view
        elements.detailView.innerHTML = renderDetailView(entityType, detailData);
        
        // Scroll to top
        window.scrollTo(0, 0);
        
    } catch (error) {
        console.error('Error loading detail:', error);
        elements.detailView.innerHTML = `
            <div class="error-state">
                <h3>Not Found</h3>
                <p>The ${entityType} you're looking for could not be found.</p>
                <a href="${router.getDatabaseURL('/' + entityType + 's')}" class="button">Browse all ${entityType}s</a>
            </div>
        `;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Tab navigation
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            router.navigate('/' + tabName);
        });
    });
    
    // Search
    elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
    elements.clearSearch.addEventListener('click', clearSearch);
    
    // Clear filters
    elements.clearFilters.addEventListener('click', clearAllFilters);
    
    // Sort
    elements.sortBy.addEventListener('change', handleSort);
    
    // View toggle
    elements.viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });
    
    // Load more
    elements.loadMoreBtn.addEventListener('click', loadMore);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== elements.searchInput) {
            e.preventDefault();
            elements.searchInput.focus();
        }
    });
}

// Update URL with current filters/sort
function updateURL() {
    const params = {};
    
    if (app.filters.search) {
        params.search = app.filters.search;
    }
    
    if (app.sortBy && app.sortBy !== 'default') {
        params.sort = app.sortBy;
    }
    
    // Add other active filters
    Object.entries(app.filters).forEach(([key, value]) => {
        if (key !== 'search' && value) {
            params[key] = value;
        }
    });
    
    router.updateQuery(params);
}

// Render detail view based on type
function renderDetailView(type, data) {
    let html = `
        <div class="detail-header">
            <a href="${router.getDatabaseURL('/' + type + 's')}" class="back-link">← Back to ${capitalizeFirst(type)}s</a>
        </div>
    `;
    
    switch (type) {
        case 'film':
            html += renderFilmDetail(data);
            break;
        case 'author':
            html += renderAuthorDetail(data);
            break;
        case 'work':
            html += renderWorkDetail(data);
            break;
    }
    
    return html;
}

// Render film detail
function renderFilmDetail(film) {
    return `
        <div class="film-detail">
            <h1>${film.html_title}</h1>
            <div class="film-meta">
                ${film.release_year} · ${film.studio || 'Unknown Studio'}
                ${film.runtime_minutes ? ` · ${film.runtime_minutes} minutes` : ''}
            </div>
            
            <div class="detail-sections">
                <section class="detail-section">
                    <h3>Film Details</h3>
                    ${film.directors ? `<p><strong>Director(s):</strong> ${film.directors}</p>` : ''}
                    ${film.writers ? `<p><strong>Screenwriter(s):</strong> ${film.writers}</p>` : ''}
                    ${film.cast_members ? `<p><strong>Cast:</strong> ${film.cast_members}</p>` : ''}
                    ${film.genres?.length ? `<p><strong>Genres:</strong> ${film.genres.join(', ')}</p>` : ''}
                </section>
                
                <section class="detail-section">
                    <h3>Source Work</h3>
                    <p><strong>Title:</strong> <a href="${router.getDatabaseURL('/work/' + film.source_work.slug)}">${film.source_work.html_title}</a></p>
                    <p><strong>Author:</strong> <a href="${router.getDatabaseURL('/author/' + film.author.slug)}">${film.author.name}</a></p>
                    ${film.source_work.publication_year ? `<p><strong>Published:</strong> ${film.source_work.publication_year}</p>` : ''}
                    ${film.source_work.year_to_adaptation !== null && film.source_work.year_to_adaptation !== undefined ? `<p><strong>Years to adaptation:</strong> ${film.source_work.year_to_adaptation}</p>` : ''}
                </section>
                
                ${film.other_adaptations?.length ? `
                    <section class="detail-section">
                        <h3>Other Adaptations of This Work</h3>
                        <div class="related-items">
                            ${film.other_adaptations.map(f => `
                                <a href="${router.getDatabaseURL('/film/' + f.slug)}" class="related-item">
                                    <strong>${f.html_title}</strong> (${f.year || 'Unknown'})
                                </a>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}
                
                ${film.media?.length ? `
                    <section class="detail-section">
                        <h3>Media Gallery</h3>
                        <div class="media-count">${film.media.length} images available</div>
                        <!-- Media gallery would go here -->
                    </section>
                ` : ''}
            </div>
        </div>
    `;
}

// Render author detail
function renderAuthorDetail(author) {
    return `
        <div class="author-detail">
            <h1>${author.name}</h1>
            ${author.birth_year || author.death_year ? `
                <div class="author-lifespan">${author.birth_year || '?'}–${author.death_year || '?'}</div>
            ` : ''}
            
            <div class="author-stats-bar">
                <div class="stat">
                    <div class="stat-number">${author.stats.total_films}</div>
                    <div class="stat-label">Films</div>
                </div>
                <div class="stat">
                    <div class="stat-number">${author.stats.works_adapted}</div>
                    <div class="stat-label">Works Adapted</div>
                </div>
                <div class="stat">
                    <div class="stat-number">${author.stats.first_adaptation}–${author.stats.last_adaptation}</div>
                    <div class="stat-label">Adaptation Period</div>
                </div>
            </div>
            
            <div class="detail-sections">
                ${author.biographical_notes ? `
                    <section class="detail-section">
                        <h3>Biography</h3>
                        <p>${author.biographical_notes}</p>
                    </section>
                ` : ''}
                
                <section class="detail-section">
                    <h3>Adapted Works</h3>
                    <div class="works-list">
                        ${author.adapted_works.map(work => `
                            <div class="work-item">
                                <a href="${router.getDatabaseURL('/work/' + work.slug)}">${work.html_title}</a>
                                <span class="work-meta">${work.publication_year || 'Publication year unknown'} · ${work.adaptation_count} film${work.adaptation_count !== 1 ? 's' : ''}</span>
                            </div>
                        `).join('')}
                    </div>
                </section>
                
                <section class="detail-section">
                    <h3>Films</h3>
                    <div class="films-timeline">
                        ${author.films.map(film => `
                            <div class="timeline-item">
                                <a href="${router.getDatabaseURL('/film/' + film.slug)}">${film.html_title}</a>
                                <span class="film-year">${film.year || 'Unknown'}</span>
                            </div>
                        `).join('')}
                    </div>
                </section>
            </div>
        </div>
    `;
}

// Render work detail
function renderWorkDetail(work) {
    return `
        <div class="work-detail">
            <h1>${work.html_title}</h1>
            <div class="work-meta">
                by <a href="${router.getDatabaseURL('/author/' + work.author.slug)}">${work.author.name}</a> · 
                ${capitalizeFirst(work.work_type?.replace('_', ' ') || 'Unknown type')} · 
                ${work.publication_year || 'Publication year unknown'}
            </div>
            
            <div class="detail-sections">
                ${work.plot_summary ? `
                    <section class="detail-section">
                        <h3>Plot Summary</h3>
                        <p>${work.plot_summary}</p>
                    </section>
                ` : ''}
                
                ${work.literary_significance ? `
                    <section class="detail-section">
                        <h3>Literary Significance</h3>
                        <p>${work.literary_significance}</p>
                    </section>
                ` : ''}
                
                <section class="detail-section">
                    <h3>Film Adaptations (${work.stats.adaptation_count})</h3>
                    <div class="adaptations-list">
                        ${work.adaptations.map((film, index) => `
                            <div class="adaptation-item">
                                <span class="adaptation-number">#${index + 1}</span>
                                <div class="adaptation-info">
                                    <a href="${router.getDatabaseURL('/film/' + film.slug)}">${film.html_title}</a>
                                    <div class="adaptation-details">
                                        ${film.year || 'Unknown'} · ${film.studio || 'Unknown Studio'}
                                        ${film.directors ? ` · Dir: ${film.directors}` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            </div>
        </div>
    `;
}

// Create a film list item
function createFilmListItem(film) {
    const div = document.createElement('div');
    div.className = 'film-entry';
    
    const mediaIndicator = film.hasMedia ? '<span class="media-indicator">📷</span>' : '';
    const workSlug = film.workSlug;
    const workTitle = film.workHtml || film.workTitle || film.sourceWorkTitle || 'Unknown';
    
    div.innerHTML = `
        <div class="entry-title">
            <a href="${router.getDatabaseURL('/film/' + film.slug)}">${film.html_title || film.title}</a>${mediaIndicator}
        </div>
        <div class="entry-meta">
            ${film.year || 'Unknown year'}<span class="meta-separator">·</span>
            Based on ${workSlug ? `<a href="${router.getDatabaseURL('/work/' + workSlug)}">${workTitle}</a>` : workTitle} 
            by <a href="${router.getDatabaseURL('/author/' + film.authorSlug)}" class="author-name">${film.authorName || 'Unknown'}</a><span class="meta-separator">·</span>
            ${film.directors ? `Directed by ${film.directors}<span class="meta-separator">·</span>` : ''}
            ${film.studio || 'Unknown Studio'}
            ${film.isRemake ? '<span class="pattern-badge">Repeat</span>' : ''}
        </div>
    `;
    
    return div;
}

// Create an author list item
function createAuthorListItem(author) {
    const div = document.createElement('div');
    div.className = 'author-entry';
    
    const lifespan = author.birthYear || author.deathYear 
        ? `(${author.birthYear || '?'}–${author.deathYear || '?'})`
        : '';
    
    div.innerHTML = `
        <div class="author-info">
            <div class="author-name">
                <a href="${router.getDatabaseURL('/author/' + author.slug)}">${author.name}</a>
                ${author.isTwentyTimer ? '<span class="pattern-badge twenty-timer">Twenty-Timer</span>' : ''}
            </div>
            <div class="author-lifespan">${lifespan}</div>
        </div>
        <div class="author-stats">
            <div class="author-film-count">${author.filmCount}</div>
            <div class="author-film-label">Films</div>
        </div>
    `;
    
    return div;
}

// Create a work list item
function createWorkListItem(work) {
    const div = document.createElement('div');
    div.className = 'work-entry';
    
    div.innerHTML = `
        <div class="work-title">
            <a href="${router.getDatabaseURL('/work/' + work.slug)}">${work.html_title || work.title}</a>
            ${work.isRemakeChampion ? '<span class="pattern-badge remake-champion">Remake Champion</span>' : ''}
            ${work.isSpeedDemon ? '<span class="pattern-badge speed-demon">Speed Demon</span>' : ''}
        </div>
        <div class="work-author">by <a href="${router.getDatabaseURL('/author/' + work.authorSlug)}">${work.authorName}</a></div>
        <div class="work-meta">
            ${work.workType ? capitalizeFirst(work.workType.replace('_', ' ')) : 'Unknown type'} · 
            ${work.publicationYear || 'Unknown year'} · 
            ${work.adaptationCount} film${work.adaptationCount !== 1 ? 's' : ''}
        </div>
    `;
    
    return div;
}

// Handle search
function handleSearch() {
    app.filters.search = elements.searchInput.value;
    app.currentPage = 0;
    filterAndRender();
    updateURL();
}

// Clear search
function clearSearch() {
    elements.searchInput.value = '';
    app.filters.search = '';
    app.currentPage = 0;
    filterAndRender();
    updateURL();
}

// Clear all filters
function clearAllFilters() {
    clearSearch();
    elements.filterRow.querySelectorAll('select').forEach(select => {
        select.value = '';
    });
    app.filters = { search: '' };
    filterAndRender();
    updateURL();
}

// Handle sort change
function handleSort() {
    app.sortBy = elements.sortBy.value;
    filterAndRender();
    updateURL();
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// COPY THE REST OF THE FUNCTIONS FROM THE ORIGINAL FILE
// (All the remaining functions stay exactly the same - switchTab, loadData, updateFilters,
// filterAndRender, renderResults, etc. - I'm truncating here to save space)

// Include all functions from line 587 onwards from the original database-app.js file

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

// Export for debugging
window.app = app;
window.router = router;
