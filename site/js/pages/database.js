// database.js - Database functionality for Her Hollywood Story
// Modified to load real data from JSON files

// Global state
let filmsData = null;
let filteredFilms = [];
let currentView = 'list'; // Default to list view as it's more elegant
let currentPage = 0;
const ITEMS_PER_PAGE = 50;

// DOM elements
const elements = {
    searchInput: document.getElementById('searchInput'),
    clearSearch: document.getElementById('clearSearch'),
    yearFilter: document.getElementById('yearFilter'),
    authorFilter: document.getElementById('authorFilter'),
    studioFilter: document.getElementById('studioFilter'),
    genreFilter: document.getElementById('genreFilter'),
    mediaFilter: document.getElementById('mediaFilter'),
    sortBy: document.getElementById('sortBy'),
    resultsContainer: document.getElementById('resultsContainer'),
    resultsCount: document.getElementById('resultsCount'),
    currentResults: document.getElementById('currentResults'),
    loadMoreContainer: document.getElementById('loadMoreContainer'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),
    showingCount: document.getElementById('showingCount'),
    totalCount: document.getElementById('totalCount'),
    clearFilters: document.getElementById('clearFilters'),
    modal: document.getElementById('filmModal'),
    modalContent: document.getElementById('modalContent')
};

// Initialize the page
async function init() {
    try {
        // Load the films index data
        const response = await fetch('data/database/films-index.min.json');
        if (!response.ok) {
            throw new Error('Failed to load films data');
        }
        filmsData = await response.json();
        
        // Update stats
        updateStats();
        
        // Populate filters
        populateFilters();
        
        // Set up event listeners
        setupEventListeners();
        
        // Check for search query from URL
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        if (searchQuery) {
            elements.searchInput.value = searchQuery;
        }
        
        // Initial render
        filterAndRender();
        
    } catch (error) {
        console.error('Error loading films data:', error);
        showError('Failed to load film database. Please make sure to run the data copy script first.');
    }
}

// Update statistics
function updateStats() {
    document.getElementById('totalFilms').textContent = filmsData.metadata.totalCount.toLocaleString();
    document.getElementById('yearRange').textContent = `${filmsData.metadata.yearRange[0]}–${filmsData.metadata.yearRange[1]}`;
    document.getElementById('withMedia').textContent = filmsData.metadata.withMedia.toLocaleString();
}

// Populate filter dropdowns
function populateFilters() {
    // Years
    const yearOptgroup = document.getElementById('yearOptions');
    filmsData.filterOptions.years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearOptgroup.appendChild(option);
    });
    
    // Authors
    filmsData.filterOptions.authors.forEach(author => {
        const option = document.createElement('option');
        option.value = author.value;
        option.textContent = `${author.label} (${author.count})`;
        elements.authorFilter.appendChild(option);
    });
    
    // Studios
    filmsData.filterOptions.studios.forEach(studio => {
        const option = document.createElement('option');
        option.value = studio.value;
        option.textContent = studio.label;
        elements.studioFilter.appendChild(option);
    });
    
    // Genres
    filmsData.filterOptions.genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.value;
        option.textContent = genre.label;
        elements.genreFilter.appendChild(option);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Search
    elements.searchInput.addEventListener('input', debounce(filterAndRender, 300));
    elements.clearSearch.addEventListener('click', clearSearch);
    
    // Filters
    elements.yearFilter.addEventListener('change', filterAndRender);
    elements.authorFilter.addEventListener('change', filterAndRender);
    elements.studioFilter.addEventListener('change', filterAndRender);
    elements.genreFilter.addEventListener('change', filterAndRender);
    elements.mediaFilter.addEventListener('change', filterAndRender);
    elements.sortBy.addEventListener('change', filterAndRender);
    
    // Clear filters
    elements.clearFilters.addEventListener('click', clearAllFilters);
    
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleView(btn.dataset.view));
    });
    
    // Load more
    elements.loadMoreBtn.addEventListener('click', loadMore);
    
    // Modal
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal || e.target.classList.contains('modal-close')) {
            closeModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === '/' && document.activeElement !== elements.searchInput) {
            e.preventDefault();
            elements.searchInput.focus();
        }
    });
}

// Filter and render films
function filterAndRender() {
    currentPage = 0;
    filteredFilms = filterFilms();
    sortFilms(filteredFilms);
    renderFilms();
    updateResultsCount();
    updateLoadMoreVisibility();
}

// Filter films based on current criteria
function filterFilms() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const yearValue = elements.yearFilter.value;
    const authorId = elements.authorFilter.value;
    const studio = elements.studioFilter.value;
    const genre = elements.genreFilter.value;
    const mediaFilter = elements.mediaFilter.value;
    
    return filmsData.films.filter(film => {
        // Search filter
        if (searchTerm && !film.searchText.includes(searchTerm)) {
            return false;
        }
        
        // Year filter (handles both specific years and decades)
        if (yearValue) {
            if (yearValue.endsWith('s')) {
                // Decade filter
                const decade = parseInt(yearValue);
                if (film.decade !== decade) return false;
            } else {
                // Specific year
                if (film.year !== parseInt(yearValue)) return false;
            }
        }
        
        // Author filter
        if (authorId && film.authorId !== parseInt(authorId)) {
            return false;
        }
        
        // Studio filter
        if (studio && film.studio !== studio) {
            return false;
        }
        
        // Genre filter
        if (genre && !film.genres.includes(genre)) {
            return false;
        }
        
        // Media filter
        if (mediaFilter) {
            switch (mediaFilter) {
                case 'with':
                    if (!film.hasMedia) return false;
                    break;
                case 'without':
                    if (film.hasMedia) return false;
                    break;
            }
        }
        
        return true;
    });
}

// Sort films
function sortFilms(films) {
    const sortValue = elements.sortBy.value;
    
    films.sort((a, b) => {
        switch (sortValue) {
            case 'year-desc':
                return b.year - a.year || a.title.localeCompare(b.title);
            case 'year-asc':
                return a.year - b.year || a.title.localeCompare(b.title);
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            case 'author-asc':
                return (a.authorName || '').localeCompare(b.authorName || '');
            default:
                return 0;
        }
    });
}

// Render films
function renderFilms(append = false) {
    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const filmsToRender = filteredFilms.slice(start, end);
    
    if (!append) {
        elements.resultsContainer.innerHTML = '';
        elements.resultsContainer.className = currentView === 'grid' ? 'film-grid' : 'film-list';
    }
    
    if (filteredFilms.length === 0) {
        showEmptyState();
        return;
    }
    
    filmsToRender.forEach(film => {
        const filmElement = currentView === 'grid' ? createFilmGridItem(film) : createFilmListItem(film);
        elements.resultsContainer.appendChild(filmElement);
    });
}

// Create film list item (default view)
function createFilmListItem(film) {
    const item = document.createElement('div');
    item.className = 'film-entry';
    item.onclick = () => showFilmDetail(film);
    
    const mediaIndicator = film.hasMedia ? '<span class="media-indicator">📷</span>' : '';
    
    item.innerHTML = `
        <div class="entry-title">${film.title}${mediaIndicator}</div>
        <div class="entry-meta">
            ${film.year}<span class="meta-separator">·</span>
            Based on "${film.workTitle || 'Unknown'}" by <span class="author-name">${film.authorName}</span><span class="meta-separator">·</span>
            ${film.directors ? `Directed by ${film.directors}<span class="meta-separator">·</span>` : ''}
            ${film.studio || 'Unknown Studio'}
        </div>
    `;
    
    return item;
}

// Create film grid item
function createFilmGridItem(film) {
    const item = document.createElement('div');
    item.className = 'film-item';
    item.onclick = () => showFilmDetail(film);
    
    item.innerHTML = `
        <div class="film-poster">
            ${film.hasMedia ? '<span>Image Available</span>' : '<span>No Image</span>'}
        </div>
        <div class="film-title">${film.title}</div>
        <div class="film-year">${film.year}</div>
    `;
    
    return item;
}

// Show film detail modal
async function showFilmDetail(film) {
    elements.modal.style.display = 'block';
    
    elements.modalContent.innerHTML = `
        <h2>${film.title}</h2>
        <p class="film-year">${film.year}</p>
        
        <div class="modal-section">
            <h3>Film Details</h3>
            ${film.directors ? `<p><strong>Director:</strong> ${film.directors}</p>` : ''}
            ${film.studio ? `<p><strong>Studio:</strong> ${film.studio}</p>` : ''}
            ${film.genres.length > 0 ? `<p><strong>Genres:</strong> ${film.genres.join(', ')}</p>` : ''}
        </div>
        
        <div class="modal-section">
            <h3>Source Work</h3>
            <p><strong>Title:</strong> ${film.workTitle || 'Unknown'}</p>
            <p><strong>Author:</strong> ${film.authorName}</p>
            ${film.isRemake ? `<p><strong>Note:</strong> This is adaptation #${film.adaptationNumber || '?'} of this work</p>` : ''}
        </div>
        
        ${film.hasMedia ? `
            <div class="modal-section">
                <h3>Media Available</h3>
                <p>${film.mediaCount} items available in the archive</p>
            </div>
        ` : ''}
    `;
}

// Close modal
function closeModal() {
    elements.modal.style.display = 'none';
}

// Toggle view
function toggleView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    currentPage = 0;
    renderFilms();
    updateLoadMoreVisibility();
}

// Load more films
function loadMore() {
    currentPage++;
    renderFilms(true);
    updateLoadMoreVisibility();
}

// Update load more visibility
function updateLoadMoreVisibility() {
    const totalShowing = Math.min((currentPage + 1) * ITEMS_PER_PAGE, filteredFilms.length);
    const hasMore = totalShowing < filteredFilms.length;
    
    elements.loadMoreContainer.style.display = hasMore ? 'block' : 'none';
    elements.showingCount.textContent = totalShowing;
    elements.totalCount.textContent = filteredFilms.length;
}

// Update results count
function updateResultsCount() {
    const count = filteredFilms.length;
    elements.resultsCount.textContent = `Showing ${count.toLocaleString()} film${count !== 1 ? 's' : ''}`;
    elements.currentResults.textContent = count.toLocaleString();
}

// Clear search
function clearSearch() {
    elements.searchInput.value = '';
    filterAndRender();
}

// Clear all filters
function clearAllFilters() {
    elements.searchInput.value = '';
    elements.yearFilter.value = '';
    elements.authorFilter.value = '';
    elements.studioFilter.value = '';
    elements.genreFilter.value = '';
    elements.mediaFilter.value = '';
    elements.sortBy.value = 'year-desc';
    filterAndRender();
}

// Show empty state
function showEmptyState() {
    elements.resultsContainer.innerHTML = `
        <div class="empty-state">
            <h3>No films found</h3>
            <p>Try adjusting your filters or search terms</p>
            <button class="button" onclick="clearAllFilters()">Clear All Filters</button>
        </div>
    `;
}

// Show error
function showError(message) {
    elements.resultsContainer.innerHTML = `
        <div class="empty-state">
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;
}

// Debounce helper
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

// Initialize on load
document.addEventListener('DOMContentLoaded', init);