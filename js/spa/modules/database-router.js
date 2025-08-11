// database-router.js - Router for database app navigation

import { app, elements } from './database-state.js';
import { getDatabaseURL } from './database-config.js';

// Router class for handling navigation
export class Router {
    constructor(callbacks) {
        // Store callbacks for UI updates
        this.callbacks = callbacks;
        
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
                } else if (key === 'view') {
                    // Set view mode from URL parameter
                    if (value === 'grid' || value === 'list') {
                        app.currentView = value;
                    }
                } else {
                    app.filters[key] = value;
                }
            });
        }

        // Call the callback to show list view
        if (this.callbacks.showListView) {
            this.callbacks.showListView();
        }

        // Switch to the appropriate tab
        if (this.callbacks.switchTab) {
            this.callbacks.switchTab(entity);
        }
    }

    showDetail(entityType, slug) {
        // Update app state
        app.currentRoute = {
            type: 'detail',
            entity: entityType + 's', // Convert singular to plural
            slug: slug
        };

        // Call the callback to show detail view
        if (this.callbacks.showDetailView) {
            this.callbacks.showDetailView(entityType, slug);
        }
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

            // Add view state (only if it's grid, since list is default)
            if (app.currentView === 'grid') {
                params.set('view', 'grid');
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