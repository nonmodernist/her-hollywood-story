// database-app.js - Main SPA controller for Her Hollywood Story database

// Dynamic Base Path Detection (works everywhere!)
function getBasePath() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // GitHub Pages (your current beta)
    if (pathname.includes('/adapted-from-women/')) {
        return '/adapted-from-women';
    }

    // Local development (Python server)
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::' || hostname === '[::1]') {
        return '';  // No prefix needed!
    }

    // Future production (herhollywoodstory.com)
    return '';
}

const BASE_PATH = getBasePath();

// Create consistent paths for all your data
const PATHS = {
    data: {
        index: (type) => `${BASE_PATH}/data/database/${type}-index.min.json`,
        detail: (type, slug) => `${BASE_PATH}/data/database/${type}/${slug}.json`,
        patterns: (pattern) => `${BASE_PATH}/data/patterns/${pattern}.json`
    },
    database: (path = '') => `${BASE_PATH}/database${path}`
};

// helper function to parse lists of names
function formatNameList(names) {
    if (!names) return '';
    // Split by pipe, trim whitespace, and join with commas
    return names.split('|').map(name => name.trim()).join(', ');
}

// date formatter helper
function formatMagazineDate(dateStr) {
    if (!dateStr) return '';

    // Handle YYYY-MM-DD format
    const match = dateStr.match(/^(\d{4})-(\d{2})-\d{2}$/);
    if (match) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = parseInt(match[2]) - 1;
        return `${months[monthIndex]} ${match[1]}`;
    }

    return dateStr;
}

// Configuration
const ITEMS_PER_PAGE = 50;

// Application state
const app = {
    // Current route info
    currentRoute: {
        type: 'list', // 'list' or 'detail'
        entity: 'films', // 'films', 'authors', 'works'
        slug: null
    },

    // Current view mode (list, grid)
    currentView: 'list',

    // Pagination
    currentPage: 0,

    // Filters
    filters: {
        search: '',
        // Dynamic filters based on entity
    },

    // Sort
    sortBy: 'default',

    // Data storage
    data: {
        films: null,
        authors: null,
        works: null
    },

    // Detail cache
    detailCache: new Map(),

    // Filtered results
    filteredData: [],

    // Loading states
    loading: {
        films: false,
        authors: false,
        works: false
    }
};

// DOM Elements
const elements = {
    // Main containers
    listView: null,
    detailView: null,

    // List view elements
    tabs: null,
    searchInput: null,
    clearSearch: null,
    filterRow: null,
    sortBy: null,
    resultsContainer: null,
    resultsCount: null,
    loadMoreContainer: null,
    loadMoreBtn: null,
    showingCount: null,
    totalCount: null,
    clearFilters: null,
    viewButtons: null
};

// Router class for handling navigation
class Router {
    constructor() {
        // Bind methods
        this.handlePopState = this.handlePopState.bind(this);

        // Listen for browser navigation
        window.addEventListener('popstate', this.handlePopState);

        // Handle clicks on SPA links
        document.addEventListener('click', (e) => {
            // Check if it's an internal database link
            const link = e.target.closest('a');
            if (link && link.href && !link.hasAttribute('target')) {
                const url = new URL(link.href);
                const path = url.pathname;

                // Check if it's a database route
                if (path.includes('/database/')) {
                    e.preventDefault();
                    this.navigate(path);
                }
            }
        });
    }

    handlePopState(e) {
        this.handleRoute();
    }

    navigate(path, replaceState = false) {
        const method = replaceState ? 'replaceState' : 'pushState';
        history[method](null, '', path);
        this.handleRoute();
    }

    handleRoute() {
        const path = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);

        // Parse the route - handle both absolute and relative paths
        let pathParts = path.split('/').filter(Boolean);

        // Find where 'database' appears in the path
        const dbIndex = pathParts.indexOf('database');
        if (dbIndex !== -1) {
            // Get parts after 'database'
            pathParts = pathParts.slice(dbIndex);
        }

        // Route: /database or /database/
        if (pathParts.length === 1 && pathParts[0] === 'database') {
            this.showList('films', searchParams);
        }
        // Route: /database/films or /database/authors or /database/works
        else if (pathParts.length === 2 && ['films', 'authors', 'works'].includes(pathParts[1])) {
            this.showList(pathParts[1], searchParams);
        }
        // Route: /database/film/[slug] or /database/author/[slug] or /database/work/[slug]
        else if (pathParts.length === 3 && ['film', 'author', 'work'].includes(pathParts[1])) {
            this.showDetail(pathParts[1], pathParts[2]);
        }
        // Default to films list
        else {
            this.navigate(getDatabaseURL('/films'), true);
        }
    }

    showList(entity, searchParams) {
        // Update app state
        app.currentRoute = {
            type: 'list',
            entity: entity,
            slug: null
        };

        // Apply search params to filters
        if (searchParams) {
            searchParams.forEach((value, key) => {
                if (key === 'search') {
                    app.filters.search = value;
                    if (elements.searchInput) elements.searchInput.value = value;
                } else if (key === 'sort') {
                    app.sortBy = value;
                } else if (key === 'page') {
                    // Restore pagination state (convert from 1-based to 0-based)
                    app.currentPage = Math.max(0, parseInt(value) - 1);
                } else {
                    app.filters[key] = value;
                }
            });
        }

        // Show list view
        showListView();

        // Switch to the appropriate tab
        switchTab(entity);
    }

    showDetail(entityType, slug) {
        // Update app state
        app.currentRoute = {
            type: 'detail',
            entity: entityType + 's', // Convert singular to plural
            slug: slug
        };

        // Show detail view
        showDetailView(entityType, slug);
    }

    updateURL() {
        // Get base path for database
        const basePath = window.location.pathname.split('/database/')[0] + '/database';

        // Build URL based on current state
        let path = basePath;

        if (app.currentRoute.type === 'list') {
            path += `/${app.currentRoute.entity}`;

            // Add query parameters for filters
            const params = new URLSearchParams();

            if (app.filters.search) {
                params.set('search', app.filters.search);
            }

            if (app.sortBy && app.sortBy !== 'default') {
                params.set('sort', app.sortBy);
            }

            // Add pagination state
            if (app.currentPage > 0) {
                params.set('page', app.currentPage + 1); // Use 1-based page numbers in URL
            }

            // Add other active filters
            Object.entries(app.filters).forEach(([key, value]) => {
                if (key !== 'search' && value) {
                    params.set(key, value);
                }
            });

            const queryString = params.toString();
            if (queryString) {
                path += '?' + queryString;
            }
        } else if (app.currentRoute.type === 'detail') {
            const entitySingular = app.currentRoute.entity.replace(/s$/, ''); // Remove 's'
            path += `/${entitySingular}/${app.currentRoute.slug}`;
        }

        // Update URL without triggering popstate
        if (window.location.pathname + window.location.search !== path) {
            history.replaceState(null, '', path);
        }
    }
}

// Initialize router
let router;

// Initialize the application
async function init() {
    // Check for redirect from 404.html (GitHub Pages workaround)
    const redirect = sessionStorage.getItem('redirect');
    if (redirect) {
        sessionStorage.removeItem('redirect');
        // Replace the current state to handle the intended route
        history.replaceState(null, '', redirect);
    }

    // Cache DOM elements
    cacheElements();

    // Set up event listeners
    setupEventListeners();

    // Initialize router
    router = new Router();

    // Handle initial route
    router.handleRoute();
}

// Cache DOM elements
function cacheElements() {
    // Main containers
    elements.listView = document.querySelector('.database-intro').parentElement;
    elements.detailView = document.getElementById('detailView');

    // List view elements
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
    elements.viewButtons = document.querySelectorAll('.view-btn');
}

// Show list view
function showListView() {
    elements.listView.style.display = 'block';
    elements.detailView.style.display = 'none';
    document.title = `${capitalizeFirst(app.currentRoute.entity)} - Database - Her Hollywood Story`;
}

// Show detail view
async function showDetailView(entityType, slug) {
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
        console.error('Error stack:', error.stack);
        elements.detailView.innerHTML = `
            <div class="error-state">
                <h3>Not Found</h3>
                <p>The ${entityType} you're looking for could not be found.</p>
                <p style="color: red; font-size: 0.9em;">Debug: ${error.message}</p>
                <a href="/database/${entityType}s" class="button">Browse all ${entityType}s</a>
            </div>
        `;
    }
}

// Render detail view based on type
function renderDetailView(type, data) {
    const basePath = window.location.pathname.split('/database/')[0] + '/database';

    let html = `
        <div class="detail-header">
            <a href="${basePath}/${type}s" class="back-link">← Back to ${capitalizeFirst(type)}s</a>
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
                    ${film.directors ? `<p><strong>Director(s):</strong> ${formatNameList(film.directors)}</p>` : ''}
                    ${film.writers ? `<p><strong>Screenwriter(s):</strong> ${formatNameList(film.writers)}</p>` : ''}
                    ${film.cast_members ? `<p><strong>Cast:</strong> ${formatNameList(film.cast_members)}</p>` : ''}
                    ${film.genres?.length ? `<p><strong>Genres:</strong> ${film.genres.join(', ')}</p>` : ''}
                </section>

                                ${film.media?.length ? `
                    <section class="detail-section">
                        <h3>Media Gallery</h3>
                        <div class="media-gallery">
                            ${film.media.map(media => `
                                <div class="media-item">
                                    <a href="${media.url}" target="_blank" rel="noopener">
                                        <img src="${media.thumbnail_url}" alt="${media.caption || media.title}" loading="lazy">
                                    </a>
                                    <div class="media-caption">
                                        ${media.caption ? `<p>${media.caption}</p>` : ''}
                                        <small>Source: ${media.source} ${media.attribution ? `• ${media.attribution}` : ''}</small>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}
                
                <section class="detail-section">
                    <h3>Source Work</h3>
                    <p><strong>Title:</strong> <a href="${getDatabaseURL('/work/' + film.source_work.slug)}">${film.source_work.html_title}</a></p>
                    <p><strong>Author:</strong> <a href="${getDatabaseURL('/author/' + film.author.slug)}">${film.author.name}</a></p>
                    ${film.source_work.publication_year ? `<p><strong>Published:</strong> ${film.source_work.publication_year}</p>` : ''}
                    ${film.source_work.year_to_adaptation !== null && film.source_work.year_to_adaptation !== undefined ? `<p><strong>Years to adaptation:</strong> ${film.source_work.year_to_adaptation}</p>` : ''}
                </section>
                
                ${film.other_adaptations?.length ? `
                    <section class="detail-section">
                        <h3>Other Adaptations of This Work</h3>
                        <div class="related-items">
                            ${film.other_adaptations.map(f => `
                                <a href="${getDatabaseURL('/film/' + f.slug)}" class="related-item">
                                    <strong>${f.html_title}</strong> (${f.year || 'Unknown'})
                                </a>
                            `).join('')}
                        </div>
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
                                <a href="${getDatabaseURL('/work/' + work.slug)}">${work.html_title}</a>
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
                                <a href="${getDatabaseURL('/film/' + film.slug)}">${film.html_title}</a>
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
                by <a href="${getDatabaseURL('/author/' + work.author.slug)}">${work.author.name}</a> · 
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

                <!-- Magazine Publication Section -->
                ${work.magazine_publication ? `
                    <section class="detail-section">
                        <h3>Original Publication</h3>
                        <p><strong>${work.magazine_publication.magazine_title}</strong>${work.magazine_publication.magazine_pub_date ? ` · ${formatMagazineDate(work.magazine_publication.magazine_pub_date)}` : ''}</p>
                        
                        ${work.magazine_publication.magazine_issue_info ?
                `<p class="issue-info">${work.magazine_publication.magazine_issue_info}</p>` : ''}
                        
                        ${work.magazine_publication.serialized && work.magazine_publication.serial_parts ?
                `<p class="serialization-note">Serialized in ${work.magazine_publication.serial_parts} parts</p>` : ''}
            
                <!-- Archive Links Section -->
        ${(work.magazine_publication.digitized_url || work.magazine_publication.FMI_link) ? `
            <div class="archive-links">
                ${work.magazine_publication.digitized_url ? `
                    <p class="archive-link">
                        <a href="${work.magazine_publication.digitized_url}" 
                           target="_blank" 
                           rel="noopener">
                            Read the full magazine issue →
                        </a>
                    </p>
                ` : ''}
                
                ${work.magazine_publication.FMI_link ? `
                    <p class="external-link">
                        <a href="${work.magazine_publication.FMI_link}" 
                           target="_blank" 
                           rel="noopener">
                            View in FictionMags Index →
                        </a>
                    </p>
                ` : ''}
            </div>
        ` : ''}</section>
                ` : ''}
                
                <!-- External Book Links Section -->
                ${work.external_urls && work.external_urls.length > 0 ? `
                    <section class="detail-section">
                        <h3>Read the Book</h3>
                        ${(() => {
                            // Sort by priority
                            const sortedUrls = work.external_urls.sort((a, b) => a.priority - b.priority);
                            
                            // Apply display logic
                            let filteredUrls = [];
                            let hasInternetArchive = sortedUrls.some(url => url.source === 'Internet Archive');
                            
                            for (let url of sortedUrls) {
                                // Always include Project Gutenberg and Internet Archive
                                if (url.source === 'Project Gutenberg' || url.source === 'Internet Archive') {
                                    filteredUrls.push(url);
                                }
                                // Only include Open Library if no Internet Archive
                                else if (url.source === 'Open Library' && !hasInternetArchive) {
                                    filteredUrls.push(url);
                                }
                                // Only include WorldCat if no other links
                                else if (url.source === 'WorldCat' && filteredUrls.length === 0) {
                                    filteredUrls.push(url);
                                }
                            }
                            
                            return filteredUrls.map(url => `
                                <p class="external-link">
                                    <a href="${url.url}" target="_blank" rel="noopener">
                                        ${url.source} →
                                    </a>
                                </p>
                            `).join('');
                        })()}
                    </section>
                ` : ''}
                
                <!-- Photoplay Edition Section (simplified for now) -->
                ${work.has_photoplay_edition ? `
                    <section class="detail-section">
                        <h3>Photoplay Edition</h3>
                        <p class="photoplay-note">A photoplay edition of this work was published. More details coming soon!</p>
                    </section>
                ` : ''}
                
                    <section class="detail-section">
                    <h3>Film Adaptation${work.stats.adaptation_count > 1 ? 's' : ''} (${work.stats.adaptation_count})</h3>
                    <div class="adaptations-list">
                        ${work.adaptations.map((film, index) => `
                            <div class="adaptation-item">
                                <span class="adaptation-number">#${index + 1}</span>
                                <div class="adaptation-info">
                                    <a href="${getDatabaseURL('/film/' + film.slug)}">${film.html_title}</a>
                                    <div class="adaptation-details">
                                        ${film.year || 'Unknown'} · ${film.studio || 'Unknown Studio'}
                                        ${film.directors ? ` · Dir: ${film.directors}` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    ${work.adaptation_gaps && work.adaptation_gaps.length > 0 ? `
                        <p class="adaptation-stats">Average gap between adaptations: ${work.stats.average_gap_between_adaptations} years</p>
                    ` : ''}
                </section>
            </div>
        </div>
    `;
}

// Set up all event listeners
function setupEventListeners() {
    // Tab navigation
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            // Reset pagination when switching tabs manually
            app.currentPage = 0;
            router.navigate(getDatabaseURL('/' + tabName));
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

// Switch between tabs
async function switchTab(tabName) {
    // Update active tab
    app.currentRoute.entity = tabName;
    // Don't reset page here - let it be controlled by URL params or reset in filterAndRender

    // Update UI
    elements.tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update search placeholder
    const placeholders = {
        films: 'Search films, directors, studios...',
        authors: 'Search authors by name...',
        works: 'Search works by title or author...'
    };
    elements.searchInput.placeholder = placeholders[tabName];

    // Load data if not already loaded
    if (!app.data[tabName]) {
        await loadData(tabName);
    }

    // Update filters for this tab
    updateFilters(tabName);

    // Update sort options
    updateSortOptions(tabName);

    // Filter and render - with pagination from URL if present
    filterAndRenderWithPagination();
}

// Load data for a specific tab
async function loadData(tabName) {
    // Show loading state
    app.loading[tabName] = true;
    showLoadingState();

    try {
        const response = await fetch(PATHS.data.index(tabName));
        if (!response.ok) {
            throw new Error(`Failed to load ${tabName} data`);
        }

        const data = await response.json();
        app.data[tabName] = data;

        // Update tab count
        const tab = document.querySelector(`[data-tab="${tabName}"]`);
        const count = tab.querySelector('.tab-count');
        if (count) {
            count.textContent = `(${data.metadata.totalCount.toLocaleString()})`;
        }

    } catch (error) {
        console.error(`Error loading ${tabName} data:`, error);
        showError(`Failed to load ${tabName} data. Please refresh and try again.`);
    } finally {
        app.loading[tabName] = false;
    }
}

// Update filters based on current tab
function updateFilters(tabName) {
    const filterRow = elements.filterRow;
    filterRow.classList.add('changing');

    // Clear existing filters
    filterRow.innerHTML = '';

    // Reset filter state (preserve search)
    const currentSearch = app.filters.search;
    app.filters = { search: currentSearch };

    // Add filters based on tab
    switch (tabName) {
        case 'films':
            addFilmFilters();
            break;
        case 'authors':
            addAuthorFilters();
            break;
        case 'works':
            addWorkFilters();
            break;
    }

    // Restore filter values from URL if present
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.forEach((value, key) => {
        if (key !== 'search' && key !== 'sort') {
            const filterElement = document.getElementById(`filter-${key}`);
            if (filterElement) {
                filterElement.value = value;
                app.filters[key] = value;
            }
        }
    });

    setTimeout(() => {
        filterRow.classList.remove('changing');
    }, 100);
}

// Add film-specific filters
function addFilmFilters() {
    const data = app.data.films;
    if (!data) return;

    // Year filter
    const yearFilter = createFilter('year', 'Decade', [
        { value: '', label: 'All Decades' },
        { value: '1910s', label: '1910s' },
        { value: '1920s', label: '1920s' },
        { value: '1930s', label: '1930s' },
        { value: '1940s', label: '1940s' },
        { value: '1950s', label: '1950s' },
        { value: '1960s', label: '1960s' }
    ]);

    // Author filter
    const authorOptions = [{ value: '', label: 'All Authors' }];
    if (data.filterOptions?.authors) {
        authorOptions.push(...data.filterOptions.authors);
    }
    const authorFilter = createFilter('author', 'Author', authorOptions);

    // Studio filter
    const studioOptions = [{ value: '', label: 'All Studios' }];
    if (data.filterOptions?.studios) {
        studioOptions.push(...data.filterOptions.studios);
    }
    const studioFilter = createFilter('studio', 'Studio', studioOptions);

    // Genre filter
    const genreOptions = [{ value: '', label: 'All Genres' }];
    if (data.filterOptions?.genres) {
        genreOptions.push(...data.filterOptions.genres);
    }
    const genreFilter = createFilter('genre', 'Genre', genreOptions);

    // Media filter
    const mediaFilter = createFilter('media', 'Media', [
        { value: '', label: 'All Films' },
        { value: 'with', label: 'With Images' },
        { value: 'without', label: 'Without Images' }
    ]);

    elements.filterRow.appendChild(yearFilter);
    elements.filterRow.appendChild(authorFilter);
    elements.filterRow.appendChild(studioFilter);
    elements.filterRow.appendChild(genreFilter);
    elements.filterRow.appendChild(mediaFilter);
}

// Add author-specific filters
function addAuthorFilters() {
    // Pattern filter
    const patternFilter = createFilter('pattern', 'Pattern', [
        { value: '', label: 'All Authors' },
        { value: 'twenty-timer', label: 'Twenty-Timers Club' },
        { value: 'most-adapted', label: '10+ Films' },
        { value: 'single-film', label: 'Single Film' }
    ]);

    // Nationality filter
    const nationalityFilter = createFilter('nationality', 'Nationality', [
        { value: '', label: 'All Nationalities' },
        { value: 'American', label: 'American' },
        { value: 'Other', label: 'Other' }
    ]);


    elements.filterRow.appendChild(patternFilter);
    elements.filterRow.appendChild(nationalityFilter);
}

// Add work-specific filters
function addWorkFilters() {
    const data = app.data.works;
    if (!data) return;

    // Work type filter
    const typeFilter = createFilter('workType', 'Type', [
        { value: '', label: 'All Types' },
        { value: 'novel', label: 'Novels' },
        { value: 'novella', label: 'Novellas' },
        { value: 'short_story', label: 'Short Stories' },
        { value: 'collection', label: 'Collections' }
    ]);

    // Magazine publication filter
    const magazineFilter = createFilter('hasMagazine', 'Magazine Publication', [
        { value: '', label: 'All Works' },
        { value: 'true', label: 'Has Magazine Publication' },
        { value: 'false', label: 'No Magazine Publication' }
    ]);

    // Photoplay edition filter
    const photoplayFilter = createFilter('hasPhotoplay', 'Photoplay Edition', [
        { value: '', label: 'All Works' },
        { value: 'true', label: 'Has Photoplay Edition' },
        { value: 'false', label: 'No Photoplay Edition' }
    ]);

    // Author filter
    const authorOptions = [{ value: '', label: 'All Authors' }];
    if (data.filterOptions?.authors) {
        authorOptions.push(...data.filterOptions.authors);
    }
    const authorFilter = createFilter('author', 'Author', authorOptions);

    elements.filterRow.appendChild(typeFilter);
    elements.filterRow.appendChild(magazineFilter);
    elements.filterRow.appendChild(photoplayFilter);
    elements.filterRow.appendChild(authorFilter);
}

// Create a filter element
function createFilter(name, label, options) {
    const container = document.createElement('div');
    container.className = 'filter-group';

    const labelEl = document.createElement('label');
    labelEl.setAttribute('for', `filter-${name}`);
    labelEl.textContent = label;

    const select = document.createElement('select');
    select.id = `filter-${name}`;
    select.addEventListener('change', (e) => {
        app.filters[name] = e.target.value;
        app.currentPage = 0;
        filterAndRender();
        router.updateURL();
    });

    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        select.appendChild(option);
    });

    container.appendChild(labelEl);
    container.appendChild(select);

    return container;
}

// Update sort options based on tab
function updateSortOptions(tabName) {
    const sortOptions = {
        films: [
            { value: 'year-asc', label: 'Year (Oldest First)' },
            { value: 'year-desc', label: 'Year (Newest First)' },
            { value: 'title-asc', label: 'Title (A–Z)' },
            { value: 'title-desc', label: 'Title (Z–A)' },
            { value: 'author-asc', label: 'Author (A–Z)' }
        ],
        authors: [
            { value: 'name-asc', label: 'Name (A–Z)' },
            { value: 'name-desc', label: 'Name (Z–A)' },
            { value: 'films-desc', label: 'Most Films First' },
            { value: 'films-asc', label: 'Fewest Films First' }
        ],
        works: [
            { value: 'title-asc', label: 'Title (A–Z)' },
            { value: 'title-desc', label: 'Title (Z–A)' },
            { value: 'author-asc', label: 'Author (A–Z)' },
            { value: 'year-desc', label: 'Publication (Newest)' },
            { value: 'year-asc', label: 'Publication (Oldest)' },
            { value: 'adaptations-desc', label: 'Most Adapted First' }
        ]
    };

    elements.sortBy.innerHTML = '';
    const options = sortOptions[tabName] || [];
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        elements.sortBy.appendChild(option);
    });

    // Restore sort from URL or set default
    const searchParams = new URLSearchParams(window.location.search);
    const urlSort = searchParams.get('sort');
    if (urlSort && options.some(opt => opt.value === urlSort)) {
        app.sortBy = urlSort;
        elements.sortBy.value = urlSort;
    } else {
        app.sortBy = options[0]?.value || 'default';
        elements.sortBy.value = app.sortBy;
    }
}


// Filter and render the current data
function filterAndRender() {
    const data = app.data[app.currentRoute.entity];
    if (!data) return;

    // Apply filters
    app.filteredData = filterData(data[app.currentRoute.entity], app.filters);

    // Apply sorting
    sortData(app.filteredData, app.sortBy);

    // Reset to first page
    app.currentPage = 0;

    // Render
    renderResults();
    updateResultsCount();
    updateLoadMoreVisibility();
}

// Filter and render with pagination preserved
function filterAndRenderWithPagination() {
    const data = app.data[app.currentRoute.entity];
    if (!data) return;

    // Apply filters
    app.filteredData = filterData(data[app.currentRoute.entity], app.filters);

    // Apply sorting
    sortData(app.filteredData, app.sortBy);

    // Don't reset currentPage - it should be set from URL params
    // But validate it's within bounds
    const maxPage = Math.floor(app.filteredData.length / ITEMS_PER_PAGE);
    if (app.currentPage > maxPage) {
        app.currentPage = 0;
    }

    // Render all pages up to current page
    renderResultsWithAllPages();
    updateResultsCount();
    updateLoadMoreVisibility();
}

// Filter data based on current filters
function filterData(items, filters) {
    if (!items) return [];

    return items.filter(item => {
        // Search filter (always applied)
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            const searchText = item.searchText || '';
            if (!searchText.toLowerCase().includes(searchTerm)) {
                return false;
            }
        }

        // Tab-specific filters
        switch (app.currentRoute.entity) {
            case 'films':
                return filterFilm(item, filters);
            case 'authors':
                return filterAuthor(item, filters);
            case 'works':
                return filterWork(item, filters);
            default:
                return true;
        }
    });
}

// Filter a film
function filterFilm(film, filters) {
    // Year/decade filter
    if (filters.year) {
        if (filters.year.endsWith('s')) {
            // Decade filter
            const decade = parseInt(filters.year);
            if (film.decade !== decade) return false;
        } else {
            // Specific year
            if (film.year !== parseInt(filters.year)) return false;
        }
    }

    // Author filter
    if (filters.author && film.authorId !== parseInt(filters.author)) {
        return false;
    }

    // Studio filter
    if (filters.studio && film.studio !== filters.studio) {
        return false;
    }

    // Genre filter
    if (filters.genre && !film.genres?.includes(filters.genre)) {
        return false;
    }

    // Media filter
    if (filters.media) {
        if (filters.media === 'with' && !film.hasMedia) return false;
        if (filters.media === 'without' && film.hasMedia) return false;
    }

    return true;
}

// Filter an author
function filterAuthor(author, filters) {
    // Pattern filter
    if (filters.pattern) {
        switch (filters.pattern) {
            case 'twenty-timer':
                if (!author.isTwentyTimer) return false;
                break;
            case 'most-adapted':
                if (author.filmCount < 10) return false;
                break;
            case 'single-film':
                if (author.filmCount !== 1) return false;
                break;
        }
    }

    // Nationality filter
    if (filters.nationality) {
        if (filters.nationality === 'Other' && author.nationality === 'American') return false;
        if (filters.nationality !== 'Other' && author.nationality !== filters.nationality) return false;
    }


    return true;
}

// Filter a work
function filterWork(work, filters) {
    // Work type filter
    if (filters.workType && work.workType !== filters.workType) {
        return false;
    }

    // Magazine publication filter
    if (filters.hasMagazine) {
        const hasMagazine = work.hasMagazinePublication;
        if (filters.hasMagazine === 'true' && !hasMagazine) return false;
        if (filters.hasMagazine === 'false' && hasMagazine) return false;
    }

    // Photoplay edition filter
    if (filters.hasPhotoplay) {
        const hasPhotoplay = work.hasPhotoplayEdition;
        if (filters.hasPhotoplay === 'true' && !hasPhotoplay) return false;
        if (filters.hasPhotoplay === 'false' && hasPhotoplay) return false;
    }

    // Author filter
    if (filters.author && work.authorId !== parseInt(filters.author)) {
        return false;
    }

    return true;
}

// Sort data
function sortData(items, sortBy) {
    if (!items || !sortBy) return;

    const [field, direction] = sortBy.split('-');
    const isAsc = direction === 'asc';

    items.sort((a, b) => {
        let aVal, bVal;

        // Get values based on field
        switch (field) {
            case 'year':
                aVal = a.year || a.publicationYear || (isAsc ? 9999 : 0);
                bVal = b.year || b.publicationYear || (isAsc ? 9999 : 0);
                break;
            case 'title':
                aVal = a.title || a.name || '';
                bVal = b.title || b.name || '';
                return isAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            case 'name':
                aVal = a.name || '';
                bVal = b.name || '';
                return isAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            case 'author':
                aVal = a.authorName || '';
                bVal = b.authorName || '';
                return isAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            case 'films':
                aVal = a.filmCount || 0;
                bVal = b.filmCount || 0;
                break;
            case 'adaptations':
                aVal = a.adaptationCount || 0;
                bVal = b.adaptationCount || 0;
                break;
            default:
                return 0;
        }

        // Compare numeric values
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return isAsc ? aVal - bVal : bVal - aVal;
        }

        return 0;
    });
}

// Render results
function renderResults(append = false) {
    const start = app.currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const itemsToRender = app.filteredData.slice(start, end);

    if (!append) {
        elements.resultsContainer.innerHTML = '';
        elements.resultsContainer.className = app.currentView === 'grid'
            ? `${app.currentRoute.entity}-grid`
            : 'results-list';
    }

    if (app.filteredData.length === 0) {
        showEmptyState();
        return;
    }

    // Render based on current tab and view
    itemsToRender.forEach(item => {
        const element = app.currentView === 'grid'
            ? createGridItem(item, app.currentRoute.entity)
            : createListItem(item, app.currentRoute.entity);
        elements.resultsContainer.appendChild(element);
    });
}

// Render all results up to current page (for back button restoration)
function renderResultsWithAllPages() {
    // Clear container and set class
    elements.resultsContainer.innerHTML = '';
    elements.resultsContainer.className = app.currentView === 'grid'
        ? `${app.currentRoute.entity}-grid`
        : 'results-list';

    if (app.filteredData.length === 0) {
        showEmptyState();
        return;
    }

    // Render all items from page 0 to current page
    const end = (app.currentPage + 1) * ITEMS_PER_PAGE;
    const itemsToRender = app.filteredData.slice(0, end);

    // Render based on current tab and view
    itemsToRender.forEach(item => {
        const element = app.currentView === 'grid'
            ? createGridItem(item, app.currentRoute.entity)
            : createListItem(item, app.currentRoute.entity);
        elements.resultsContainer.appendChild(element);
    });
}

// Create a list item based on type
function createListItem(item, type) {
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
function createFilmListItem(film) {
    const div = document.createElement('div');
    div.className = 'film-entry';

    const mediaIndicator = film.hasMedia ? '<span class="media-indicator" title="Media gallery available">🖻</span>' : '';

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
        <div class="entry-meta">
            ${film.year || 'Unknown year'}<span class="meta-separator">·</span>
            Based on ${workSlug ? `<a href="${getDatabaseURL('/work/' + workSlug)}">${workTitle}</a>` : workTitle} 
            by <a href="${getDatabaseURL('/author/' + film.authorSlug)}">${film.authorName || 'Unknown'}</a><span class="meta-separator">·</span>
            ${film.directors ? `Directed by  ${formatNameList(film.directors)}<span class="meta-separator">·</span>` : ''}
            ${film.studio || 'Unknown Studio'}
            ${film.isRemake ? '<span class="media-indicator" title="Based on a source that was adapted more than once">𝄏</span>' : ''}

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
                <a href="${getDatabaseURL('/author/' + author.slug)}">${author.name}</a>
                ${author.isTwentyTimer ? '<span class="media-indicator" title="Member of the Twenty Timers Club">⁑</span>' : ''}
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

    // Check if the work was adapted in the same year it was published
    const isSameYearAdaptation = work.publicationYear && work.firstAdaptationYear && 
                                 work.publicationYear === work.firstAdaptationYear;

    div.innerHTML = `
        <div class="work-title">
            <a href="${getDatabaseURL('/work/' + work.slug)}">${work.html_title || work.title}</a>
            ${work.isRemakeChampion ? '<span class="media-indicator" title="Adapted 4 or more times">⸬</span>' : ''}
            ${isSameYearAdaptation ? '<span class="media-indicator" title="Adapted in the same year it was published">🗲</span>' : ''}
        </div>
        <div class="work-author">by <a href="${getDatabaseURL('/author/' + work.authorSlug)}">${work.authorName}</a></div>
        <div class="work-meta">
            ${work.workType ? capitalizeFirst(work.workType.replace('_', ' ')) : 'Unknown type'} · 
            ${work.publicationYear || 'Unknown year'} · 
            ${work.adaptationCount} film${work.adaptationCount !== 1 ? 's' : ''}
        </div>
    `;

    return div;
}

// Create grid items 
function createGridItem(item, type) {
    if (type === 'films') {
        return createFilmGridItem(item);
    }
    // For authors and works, still use list items for now
    return createListItem(item, type);
}

// Create film grid item with media
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

// Handle search
function handleSearch() {
    app.filters.search = elements.searchInput.value;
    app.currentPage = 0;
    filterAndRender();
    router.updateURL();
}

// Clear search
function clearSearch() {
    elements.searchInput.value = '';
    app.filters.search = '';
    app.currentPage = 0;
    filterAndRender();
    router.updateURL();
}

// Clear all filters
function clearAllFilters() {
    // Clear search
    clearSearch();

    // Clear all filter selects
    elements.filterRow.querySelectorAll('select').forEach(select => {
        select.value = '';
    });

    // Reset filters
    app.filters = { search: '' };

    // Re-render
    filterAndRender();
    router.updateURL();
}

// Handle sort change
function handleSort() {
    app.sortBy = elements.sortBy.value;
    filterAndRender();
    router.updateURL();
}

// Switch view mode
function switchView(view) {
    app.currentView = view;

    // Update buttons
    elements.viewButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Re-render with new view
    app.currentPage = 0;
    renderResults();
}

// Load more items
function loadMore() {
    app.currentPage++;
    renderResults(true);
    updateLoadMoreVisibility();
    router.updateURL();
}

// Update results count
function updateResultsCount() {
    const count = app.filteredData.length;
    const showing = Math.min((app.currentPage + 1) * ITEMS_PER_PAGE, count);
    const entity = app.currentRoute.entity;

    elements.resultsCount.textContent = `Showing ${count.toLocaleString()} ${entity}`;
    elements.showingCount.textContent = showing.toLocaleString();
    elements.totalCount.textContent = count.toLocaleString();
}

// Update load more visibility
function updateLoadMoreVisibility() {
    const totalShowing = Math.min((app.currentPage + 1) * ITEMS_PER_PAGE, app.filteredData.length);
    const hasMore = totalShowing < app.filteredData.length;

    elements.loadMoreContainer.style.display = hasMore ? 'block' : 'none';
}

// Show loading state
function showLoadingState() {
    elements.resultsContainer.innerHTML = '<div class="loading-state">Loading...</div>';
}

// Show empty state
function showEmptyState() {
    elements.resultsContainer.innerHTML = `
        <div class="empty-state">
            <h3>No ${app.currentRoute.entity} found</h3>
            <p>Try adjusting your filters or search terms</p>
            <button class="button" onclick="clearAllFilters()">Clear All Filters</button>
        </div>
    `;
}

// Show error
function showError(message) {
    elements.resultsContainer.innerHTML = `
        <div class="error-state">
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;
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

// Helper to generate database URLs
function getDatabaseURL(path) {
    return PATHS.database(path);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

// Export for debugging
window.app = app;