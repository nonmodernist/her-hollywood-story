// database-state.js - Core state management for database app

// Application state
export const app = {
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
export const elements = {
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

// Cache DOM elements
export function cacheElements() {
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