// Configuration
const DATA_BASE_PATH = './data/';
const CSV_FILES = {
    films: 'films_rows.csv',
    authors: 'authors_rows.csv',
    sourceWorks: 'source_works_rows.csv'
};

// Data storage
let data = {
    films: [],
    authors: [],
    sourceWorks: []
};

// View state
let currentView = 'card';

// Routing state
let currentRoute = '';
let filterState = {
    search: '',
    year: '',
    author: '',
    genre: ''
};

// Create lookup maps for performance
let authorMap = {};
let workMap = {};

// Parse pipe-separated values
function parsePipeSeparated(value) {
    if (!value) return '';
    return value.split('|').join(', ');
}

// Parse genres from string that might contain JSON array or comma-separated list
function parseGenres(genreString) {
    if (!genreString) return [];
    
    // Try to parse as JSON array first
    if (genreString.startsWith('[')) {
        try {
            return JSON.parse(genreString);
        } catch (e) {
            // If JSON parse fails, fall back to comma separation
        }
    }
    
    // Otherwise treat as comma-separated
    return genreString.split(',').map(g => g.trim());
}

// Format genres for display
function formatGenres(genreString) {
    const genres = parseGenres(genreString);
    return genres.join(', ');
}

// Generate AFI Catalog URL
function getAFICatalogURL(afiId) {
    if (!afiId) return null;
    // AFI Catalog URL pattern - adjust if needed based on actual AFI URLs
    return `https://catalog.afi.com/Catalog/moviedetails/${afiId}`;
}

// Generate URL slug for a film
function generateFilmSlug(film) {
    if (!film.title) return null;
    
    // Clean title: remove punctuation, convert to lowercase, replace spaces with hyphens
    const cleanTitle = film.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, '-')    // Replace spaces with hyphens
        .replace(/-+/g, '-')     // Replace multiple hyphens with single
        .replace(/^-|-$/g, '');  // Remove leading/trailing hyphens
    
    // Add year if available
    const year = film.release_year ? `-${film.release_year}` : '';
    
    return `${cleanTitle}${year}`;
}

// Find film by slug or ID
function findFilmBySlugOrId(identifier) {
    // First try to find by ID (numeric)
    if (/^\d+$/.test(identifier)) {
        return data.films.find(f => f.id == identifier);
    }
    
    // Then try to find by slug
    return data.films.find(f => generateFilmSlug(f) === identifier);
}

// Router class for handling navigation
class Router {
    constructor() {
        this.routes = {
            '': () => this.showDatabaseView(),
            'film': (filmId) => this.showFilmDetail(filmId)
        };
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }
    
    handleRoute() {
        const hash = window.location.hash.slice(1); // Remove #
        const [route, ...params] = hash.split('/').filter(Boolean);
        
        currentRoute = hash;
        
        if (this.routes[route]) {
            this.routes[route](...params);
        } else {
            // Default to database view for unknown routes
            this.showDatabaseView();
        }
    }
    
    navigate(path) {
        window.location.hash = path;
    }
    
    showDatabaseView() {
        // Update page title
        document.title = 'Film Adaptation Research Database';
        
        // Show database view with transition
        this.transitionToView('databaseView');
        
        // Restore filter state
        this.restoreFilterState();
        
        // Re-render films if data is loaded
        if (data.films.length > 0) {
            renderFilms();
        }
    }
    
    async showFilmDetail(filmIdentifier) {
        if (!filmIdentifier) {
            this.navigate('/');
            return;
        }
        
        // Find the film
        const film = findFilmBySlugOrId(filmIdentifier);
        
        if (!film) {
            this.showFilmNotFound(filmIdentifier);
            return;
        }
        
        // Update page title
        document.title = `${film.title || 'Film Details'} - Film Adaptation Research Database`;
        
        // Show film detail view with transition
        this.transitionToView('filmDetailView');
        
        // Render film details
        this.renderFilmDetail(film);
    }
    
    showFilmNotFound(identifier) {
        document.title = 'Film Not Found - Film Adaptation Research Database';
        this.transitionToView('filmDetailView');
        
        document.getElementById('filmDetailContent').innerHTML = `
            <div class="error-detail">
                <h3>Film Not Found</h3>
                <p>The film "${identifier}" could not be found in our database.</p>
                <p><a href="#/">Return to the database</a> to browse all films.</p>
            </div>
        `;
    }
    
    transitionToView(targetView) {
        const databaseView = document.getElementById('databaseView');
        const filmDetailView = document.getElementById('filmDetailView');
        
        // Hide both views first
        databaseView.style.display = 'none';
        filmDetailView.style.display = 'none';
        
        // Show target view
        if (targetView === 'databaseView') {
            databaseView.style.display = 'block';
            // Trigger fade-in animation
            setTimeout(() => {
                databaseView.classList.remove('fade-out');
                databaseView.classList.add('fade-in');
            }, 10);
        } else if (targetView === 'filmDetailView') {
            filmDetailView.style.display = 'block';
            // Scroll to top when showing film detail view
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Trigger fade-in animation
            setTimeout(() => {
                filmDetailView.classList.remove('fade-out');
                filmDetailView.classList.add('fade-in');
            }, 10);
        }
    }
    
    saveFilterState() {
        filterState.search = document.getElementById('search').value;
        filterState.year = document.getElementById('yearFilter').value;
        filterState.author = document.getElementById('authorFilter').value;
        filterState.genre = document.getElementById('genreFilter').value;
    }
    
    restoreFilterState() {
        document.getElementById('search').value = filterState.search;
        document.getElementById('yearFilter').value = filterState.year;
        document.getElementById('authorFilter').value = filterState.author;
        document.getElementById('genreFilter').value = filterState.genre;
    }
    
    renderFilmDetail(film) {
        const work = workMap[film.source_work_id];
        const author = work ? authorMap[work.author_id] : null;
        const genres = formatGenres(film.genres);
        const adaptationDelay = getAdaptationDelay(work, film);
        
        // Find other adaptations of the same work
        const otherAdaptations = work ? data.films.filter(f => 
            f.source_work_id === film.source_work_id && f.id !== film.id
        ) : [];
        
        const content = `
            <div class="film-detail-header">
                <h1>${film.title || 'Untitled'}</h1>
                <div class="film-year">${film.release_year || 'Year unknown'}</div>
            </div>
            
            <div class="film-detail-sections">
                <div class="detail-section">
                    <h3>Film Details</h3>
                    <div class="detail-grid">
                        ${film.studio ? `<div class="detail-item"><strong>Studio:</strong> ${film.studio}</div>` : ''}
                        ${film.directors ? `<div class="detail-item"><strong>Director(s):</strong> ${parsePipeSeparated(film.directors)}</div>` : ''}
                        ${film.writers ? `<div class="detail-item"><strong>Screenwriter(s):</strong> ${parsePipeSeparated(film.writers)}</div>` : ''}
                        ${film.cast_members ? `<div class="detail-item"><strong>Cast:</strong> ${parsePipeSeparated(film.cast_members)}</div>` : ''}
                        ${film.runtime_minutes ? `<div class="detail-item"><strong>Runtime:</strong> ${film.runtime_minutes} minutes</div>` : ''}
                        ${film.country_of_production ? `<div class="detail-item"><strong>Country:</strong> ${film.country_of_production}</div>` : ''}
                        ${film.color_info ? `<div class="detail-item"><strong>Color:</strong> ${film.color_info}</div>` : ''}
                        ${film.language ? `<div class="detail-item"><strong>Language:</strong> ${film.language}</div>` : ''}
                        ${film.adaptation_type ? `<div class="detail-item"><strong>Adaptation Type:</strong> ${film.adaptation_type}</div>` : ''}
                        ${genres ? `<div class="detail-item"><strong>Genres:</strong> ${genres}</div>` : ''}
                    </div>
                    ${film.adaptation_notes ? `<p><strong>Notes:</strong> ${film.adaptation_notes}</p>` : ''}
                    <div class="detail-grid">
                        ${film.imdb_id ? `<div class="detail-item"><strong>IMDb:</strong> <a href="https://www.imdb.com/title/${film.imdb_id}" target="_blank">${film.imdb_id}</a></div>` : ''}
                        ${film.afi_catalog_id ? `<div class="detail-item"><strong>AFI Catalog:</strong> <a href="${getAFICatalogURL(film.afi_catalog_id)}" target="_blank">View Record</a></div>` : ''}
                    </div>
                </div>
                
                ${work ? `
                    <div class="detail-section">
                        <h3>Source Work</h3>
                        <div class="detail-grid">
                            <div class="detail-item"><strong>Title:</strong> ${work.title || 'Unknown'}</div>
                            ${work.publication_year ? `<div class="detail-item"><strong>Publication Year:</strong> ${work.publication_year}</div>` : ''}
                            ${adaptationDelay !== null ? `<div class="detail-item"><strong>Years to Adaptation:</strong> ${adaptationDelay} years</div>` : ''}
                            ${work.genre ? `<div class="detail-item"><strong>Genre:</strong> ${work.genre}</div>` : ''}
                        </div>
                        ${work.plot_summary ? `<p><strong>Plot Summary:</strong> ${work.plot_summary}</p>` : ''}
                        ${work.literary_significance ? `<p><strong>Literary Significance:</strong> ${work.literary_significance}</p>` : ''}
                        ${work.attribution_notes ? `<p><strong>Attribution Notes:</strong> ${work.attribution_notes}</p>` : ''}
                    </div>
                ` : ''}
                
                ${otherAdaptations.length > 0 ? `
                    <div class="detail-section">
                        <h3>Other Film Adaptations of This Work</h3>
                        <div class="related-films">
                            ${otherAdaptations.map(adaptation => {
                                const slug = generateFilmSlug(adaptation);
                                const url = slug ? `#/film/${slug}` : `#/film/${adaptation.id}`;
                                return `
                                    <div class="related-film" onclick="router.navigate('${url}')">
                                        <strong>${adaptation.title}</strong> (${adaptation.release_year || 'Year unknown'})
                                        ${adaptation.directors ? `<br><small>Dir: ${adaptation.directors}</small>` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${author ? `
                    <div class="detail-section">
                        <h3>Author</h3>
                        <div class="detail-grid">
                            <div class="detail-item"><strong>Name:</strong> ${author.name || 'Unknown'}</div>
                            ${author.birth_year || author.death_year ? `<div class="detail-item"><strong>Lived:</strong> ${author.birth_year || '?'} - ${author.death_year || '?'}</div>` : ''}
                            ${author.nationality ? `<div class="detail-item"><strong>Country:</strong> ${author.nationality}</div>` : ''}
                            ${author.literary_movement ? `<div class="detail-item"><strong>Movement:</strong> ${author.literary_movement}</div>` : ''}
                        </div>
                        ${author.biographical_notes ? `<p><strong>Biography:</strong> ${author.biographical_notes}</p>` : ''}
                        ${author.author_notes ? `<p><strong>Research Notes:</strong> ${author.author_notes}</p>` : ''}
                    </div>
                ` : ''}
                
                <div class="detail-section future-section">
                    <h3>Media Gallery</h3>
                    <p>Film stills, posters, and promotional materials will appear here in a future update.</p>
                </div>
                
                <div class="detail-section future-section">
                    <h3>Where to Watch</h3>
                    <p>Streaming availability and digital rental options will be listed here in a future update.</p>
                </div>
                
                <div class="detail-section future-section">
                    <h3>Academic Citations</h3>
                    <p>Scholarly articles, books, and research papers that discuss this film adaptation will be listed here in a future update.</p>
                </div>
                
                ${film.updated_at ? `
                    <div class="last-updated">
                        Last updated: ${new Date(film.updated_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                ` : ''}
            </div>
        `;
        
        document.getElementById('filmDetailContent').innerHTML = content;
    }
}

// Initialize router
let router;

// Load CSV from URL using PapaParse
async function loadCSV(url) {
    return new Promise((resolve, reject) => {
        Papa.parse(url, {
            download: true,
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: function(results) {
                console.log(`Loaded ${results.data.length} rows from ${url}`);
                resolve(results.data);
            },
            error: function(error) {
                console.error(`Error loading ${url}:`, error);
                reject(error);
            }
        });
    });
}

// Load all data
async function loadData() {
    try {
        // Show loading state
        document.getElementById('filmGrid').innerHTML = '<div class="loading">Loading database...</div>';
        
        // Load all CSV files
        const [filmsData, authorsData, worksData] = await Promise.all([
            loadCSV(DATA_BASE_PATH + CSV_FILES.films),
            loadCSV(DATA_BASE_PATH + CSV_FILES.authors),
            loadCSV(DATA_BASE_PATH + CSV_FILES.sourceWorks)
        ]);
        
        // Store data
        data.films = filmsData;
        data.authors = authorsData;
        data.sourceWorks = worksData;
        
        // Create lookup maps
        data.authors.forEach(author => {
            authorMap[author.id] = author;
        });
        
        data.sourceWorks.forEach(work => {
            workMap[work.id] = work;
        });
        
        // Initialize UI
        analyzeAdaptations();
        initializeFilters();
        updateStats();
        
        // Initialize router after data is loaded
        if (!router) {
            router = new Router();
        } else {
            // If router already exists, handle current route
            router.handleRoute();
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('filmGrid').innerHTML = `
            <div class="error">
                Error loading data. Please ensure CSV files are in the correct location:<br>
                ${DATA_BASE_PATH}${CSV_FILES.films}<br>
                ${DATA_BASE_PATH}${CSV_FILES.authors}<br>
                ${DATA_BASE_PATH}${CSV_FILES.sourceWorks}
            </div>
        `;
    }
}

// Initialize filters
function initializeFilters() {
    // Year filter
    const years = [...new Set(data.films.map(f => f.release_year))].filter(y => y).sort((a, b) => b - a);
    const yearSelect = document.getElementById('yearFilter');
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
    
    // Author filter
    const authorSelect = document.getElementById('authorFilter');
    data.authors.sort((a, b) => (a.name || '').localeCompare(b.name || '')).forEach(author => {
        if (author.name) {
            const option = document.createElement('option');
            option.value = author.id;
            option.textContent = author.name;
            authorSelect.appendChild(option);
        }
    });
    
    // Genre filter
    const genres = new Set();
    data.films.forEach(film => {
        parseGenres(film.genres).forEach(g => genres.add(g));
    });
    const genreSelect = document.getElementById('genreFilter');
    [...genres].sort().forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreSelect.appendChild(option);
    });
}

// Track multiple adaptations
let multipleAdaptations = {};

// Analyze adaptations
function analyzeAdaptations() {
    // Find works with multiple adaptations
    const adaptationCounts = {};
    data.films.forEach(film => {
        if (film.source_work_id) {
            adaptationCounts[film.source_work_id] = (adaptationCounts[film.source_work_id] || 0) + 1;
        }
    });
    
    // Store works with multiple adaptations
    Object.entries(adaptationCounts).forEach(([workId, count]) => {
        if (count > 1) {
            multipleAdaptations[workId] = count;
        }
    });
}

// Calculate years between publication and adaptation
function getAdaptationDelay(work, film) {
    if (work && work.publication_year && film.release_year) {
        return film.release_year - work.publication_year;
    }
    return null;
}

// Update statistics
function updateStats() {
    document.getElementById('filmCount').textContent = data.films.length;
    document.getElementById('authorCount').textContent = data.authors.length;
    document.getElementById('workCount').textContent = data.sourceWorks.length;
}

// Filter films
function filterFilms() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const yearFilter = document.getElementById('yearFilter').value;
    const authorFilter = document.getElementById('authorFilter').value;
    const genreFilter = document.getElementById('genreFilter').value;
    
    const filtered = data.films.filter(film => {
        // Search filter
        if (searchTerm) {
            const work = workMap[film.source_work_id];
            const author = work ? authorMap[work.author_id] : null;
            
            const searchMatch = 
                (film.title || '').toLowerCase().includes(searchTerm) ||
                (work && (work.title || '').toLowerCase().includes(searchTerm)) ||
                (author && (author.name || '').toLowerCase().includes(searchTerm));
            
            if (!searchMatch) return false;
        }
        
        // Year filter
        if (yearFilter && film.release_year != yearFilter) return false;
        
        // Author filter
        if (authorFilter) {
            const work = workMap[film.source_work_id];
            if (!work || work.author_id != authorFilter) return false;
        }
        
        // Genre filter
        if (genreFilter) {
            const genres = parseGenres(film.genres);
            if (!genres.includes(genreFilter)) return false;
        }
        
        return true;
    });
    
    // Sort by year (ascending)
    return filtered.sort((a, b) => {
        // Handle missing years by putting them at the end
        if (!a.release_year && !b.release_year) return 0;
        if (!a.release_year) return 1;
        if (!b.release_year) return -1;
        return a.release_year - b.release_year;
    });
}

// Render films based on current view
function renderFilms() {
    if (currentView === 'card') {
        renderCardView();
    } else {
        renderListView();
    }
}

// Render card view
function renderCardView() {
    const filmGrid = document.getElementById('filmGrid');
    const filteredFilms = filterFilms();
    
    if (filteredFilms.length === 0) {
        filmGrid.innerHTML = '<div class="loading">No films found matching your criteria.</div>';
        return;
    }
    
    filmGrid.innerHTML = filteredFilms.map(film => {
        const work = workMap[film.source_work_id];
        const author = work ? authorMap[work.author_id] : null;
        const genres = parseGenres(film.genres);
        const adaptationDelay = getAdaptationDelay(work, film);
        const hasMultipleAdaptations = multipleAdaptations[film.source_work_id];
        
        const slug = generateFilmSlug(film);
        const filmUrl = slug ? `#/film/${slug}` : `#/film/${film.id}`;
        
        return `
            <div class="film-card" onclick="router.saveFilterState(); router.navigate('${filmUrl}')">
                <h3>${film.title || 'Untitled'}</h3>
                <div class="film-year">${film.release_year || 'Year unknown'}</div>
                ${film.directors ? `<div class="film-credits"><strong>Director:</strong> ${parsePipeSeparated(film.directors)}</div>` : ''}
                ${film.writers ? `<div class="film-credits"><strong>Writer:</strong> ${parsePipeSeparated(film.writers)}</div>` : ''}
                <div class="film-details">
                    ${film.country_of_production ? `<strong>Country:</strong> ${film.country_of_production}<br>` : ''}
                    ${film.adaptation_type ? `<strong>Type:</strong> ${film.adaptation_type}` : ''}
                </div>
                ${work ? `
                    <div class="film-source">
                        <strong>Based on:</strong> "${work.title || 'Unknown'}"<br>
                        <strong>Author:</strong> 
                        <span class="author-link">${author ? author.name : 'Unknown'}</span>
                        ${adaptationDelay !== null ? `<br><small class="adaptation-delay">Adapted ${adaptationDelay} years after publication</small>` : ''}
                        ${hasMultipleAdaptations ? `<br><span class="multiple-adaptations">One of ${hasMultipleAdaptations} film adaptations</span>` : ''}
                    </div>
                ` : ''}
                ${genres.length > 0 ? `
                    <div class="tags">
                        ${genres.map(g => `<span class="tag">${g}</span>`).join('')}
                    </div>
                ` : ''}
                ${film.afi_catalog_id ? `
                    <div class="afi-link">
                        <a href="${getAFICatalogURL(film.afi_catalog_id)}" target="_blank" onclick="event.stopPropagation()">
                            View in AFI Catalog →
                        </a>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Render list view
function renderListView() {
    const tbody = document.getElementById('filmTableBody');
    const filteredFilms = filterFilms();
    
    tbody.innerHTML = filteredFilms.map(film => {
        const work = workMap[film.source_work_id];
        const author = work ? authorMap[work.author_id] : null;
        const genres = formatGenres(film.genres);
        const adaptationDelay = getAdaptationDelay(work, film);
        const hasMultipleAdaptations = multipleAdaptations[film.source_work_id];
        
        const slug = generateFilmSlug(film);
        const filmUrl = slug ? `#/film/${slug}` : `#/film/${film.id}`;
        
        return `
            <tr onclick="router.saveFilterState(); router.navigate('${filmUrl}')">
                <td>
                    ${film.title || 'Untitled'}
                    ${hasMultipleAdaptations ? '<span class="adaptation-badge" title="Multiple adaptations exist">★</span>' : ''}
                </td>
                <td>${film.release_year || '-'}</td>
                <td>${film.directors ? parsePipeSeparated(film.directors) : '-'}</td>
                <td>${work ? work.title : '-'}</td>
                <td>${author ? author.name : '-'}</td>
                <td>${adaptationDelay !== null ? adaptationDelay + ' yrs' : '-'}</td>
                <td>${genres || '-'}</td>
                <td>
                    ${film.afi_catalog_id ? `
                        <a href="${getAFICatalogURL(film.afi_catalog_id)}" target="_blank" onclick="event.stopPropagation()">
                            View
                        </a>
                    ` : '-'}
                </td>
            </tr>
        `;
    }).join('');
}

// Toggle view
function toggleView(view) {
    currentView = view;
    
    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    // Show/hide appropriate containers
    document.getElementById('filmGrid').style.display = view === 'card' ? 'grid' : 'none';
    document.getElementById('filmList').style.display = view === 'list' ? 'block' : 'none';
    
    // Re-render
    renderFilms();
}

// Legacy function: Show film details modal (kept for backward compatibility)
function showFilmDetails(filmId) {
    const film = data.films.find(f => f.id === filmId);
    if (!film) return;
    
    const work = workMap[film.source_work_id];
    const author = work ? authorMap[work.author_id] : null;
    const genres = formatGenres(film.genres);
    const adaptationDelay = getAdaptationDelay(work, film);
    
    // Find other adaptations of the same work
    const otherAdaptations = work ? data.films.filter(f => 
        f.source_work_id === film.source_work_id && f.id !== film.id
    ) : [];
    
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <h2>${film.title || 'Untitled'} (${film.release_year || 'Year unknown'})</h2>
        
        <div class="modal-section">
            <h3>Film Details</h3>
            ${film.studio ? `<p><strong>Studio:</strong> ${film.studio}</p>` : ''}
            ${film.directors ? `<p><strong>Director(s):</strong> ${parsePipeSeparated(film.directors)}</p>` : ''}
            ${film.writers ? `<p><strong>Screenwriter(s):</strong> ${parsePipeSeparated(film.writers)}</p>` : ''}
            ${film.cast_members ? `<p><strong>Cast:</strong> ${parsePipeSeparated(film.cast_members)}</p>` : ''}
            ${film.runtime_minutes ? `<p><strong>Runtime:</strong> ${film.runtime_minutes} minutes</p>` : ''}
            ${film.country_of_production ? `<p><strong>Country:</strong> ${film.country_of_production}</p>` : ''}
            ${film.color_info ? `<p><strong>Color:</strong> ${film.color_info}</p>` : ''}
            ${film.language ? `<p><strong>Language:</strong> ${film.language}</p>` : ''}
            ${film.adaptation_type ? `<p><strong>Adaptation Type:</strong> ${film.adaptation_type}</p>` : ''}
            ${genres ? `<p><strong>Genres:</strong> ${genres}</p>` : ''}
            ${film.adaptation_notes ? `<p><strong>Notes:</strong> ${film.adaptation_notes}</p>` : ''}
            ${film.imdb_id ? `<p><strong>IMDb:</strong> <a href="https://www.imdb.com/title/${film.imdb_id}" target="_blank">${film.imdb_id}</a></p>` : ''}
            ${film.afi_catalog_id ? `<p><strong>AFI Catalog:</strong> <a href="${getAFICatalogURL(film.afi_catalog_id)}" target="_blank">View Record</a></p>` : ''}
        </div>
        
        ${work ? `
            <div class="modal-section">
                <h3>Source Work</h3>
                <p><strong>Title:</strong> ${work.title || 'Unknown'}</p>
                ${work.publication_year ? `<p><strong>Publication Year:</strong> ${work.publication_year}</p>` : ''}
                ${adaptationDelay !== null ? `<p><strong>Years to Adaptation:</strong> ${adaptationDelay} years</p>` : ''}
                ${work.genre ? `<p><strong>Genre:</strong> ${work.genre}</p>` : ''}
                ${work.plot_summary ? `<p><strong>Plot Summary:</strong> ${work.plot_summary}</p>` : ''}
                ${work.literary_significance ? `<p><strong>Literary Significance:</strong> ${work.literary_significance}</p>` : ''}
                ${work.attribution_notes ? `<p><strong>Attribution Notes:</strong> ${work.attribution_notes}</p>` : ''}
            </div>
        ` : ''}
        
        ${otherAdaptations.length > 0 ? `
            <div class="modal-section">
                <h3>Other Film Adaptations of This Work</h3>
                <div class="other-adaptations">
                    ${otherAdaptations.map(adaptation => `
                        <div class="adaptation-item" onclick="showFilmDetails(${adaptation.id})">
                            <strong>${adaptation.title}</strong> (${adaptation.release_year || 'Year unknown'})
                            ${adaptation.directors ? `<br><small>Dir: ${adaptation.directors}</small>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        ${author ? `
            <div class="modal-section">
                <h3>Author</h3>
                <p><strong>Name:</strong> ${author.name || 'Unknown'}</p>
                ${author.birth_year || author.death_year ? `<p><strong>Lived:</strong> ${author.birth_year || '?'} - ${author.death_year || '?'}</p>` : ''}
                ${author.nationality ? `<p><strong>Country:</strong> ${author.nationality}</p>` : ''}
                ${author.literary_movement ? `<p><strong>Movement:</strong> ${author.literary_movement}</p>` : ''}
                ${author.biographical_notes ? `<p><strong>Biography:</strong> ${author.biographical_notes}</p>` : ''}
                ${author.author_notes ? `<p><strong>Research Notes:</strong> ${author.author_notes}</p>` : ''}
            </div>
        ` : ''}
        
        <div class="modal-section">
            <h3>Academic Citations</h3>
            <div class="citation-placeholder">
                <p>Citation functionality coming soon!</p>
                <p>This section will display academic papers, articles, and books that discuss this film adaptation.</p>
            </div>
        </div>
        
        ${film.updated_at ? `
            <div class="modal-section">
                <p class="last-updated">
                    Last updated: ${new Date(film.updated_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </p>
            </div>
        ` : ''}
    `;
    
    document.getElementById('filmModal').style.display = 'block';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Search and filter listeners
    document.getElementById('search').addEventListener('input', renderFilms);
    document.getElementById('yearFilter').addEventListener('change', renderFilms);
    document.getElementById('authorFilter').addEventListener('change', renderFilms);
    document.getElementById('genreFilter').addEventListener('change', renderFilms);

    // View toggle listeners
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleView(btn.dataset.view));
    });

    // Back to database button
    document.getElementById('backToDatabase').addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate('/');
    });

    // Legacy modal close listeners (keeping for backwards compatibility)
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            document.getElementById('filmModal').style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        const modal = document.getElementById('filmModal');
        if (modal && e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Initialize data loading
    loadData();
});