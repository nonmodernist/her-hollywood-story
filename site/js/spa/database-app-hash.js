// database-app-hash.js - Modified version using hash-based routing for GitHub Pages

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

// DOM Elements (cached on init)
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
async function showList(entity) {
    app.currentRoute = {
        type: 'list',
        entity: entity,
        slug: null
    };
    
    // Apply search params from URL
    const params = new URLSearchParams(window.location.search);
    if (params.has('search')) {
        app.filters.search = params.get('search');
        if (elements.searchInput) elements.searchInput.value = app.filters.search;
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

// All the other functions remain the same...
// (Copy the rest of the functions from the original database-app.js)
// I'm truncating here for brevity, but all the remaining functions 
// (switchTab, loadData, renderDetailView, filterAndRender, etc.) 
// remain exactly the same, just using router.getDatabaseURL() for generating links

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

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

// Export for debugging
window.app = app;
window.router = router;
