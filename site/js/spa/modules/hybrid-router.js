// hybrid-router.js - Router that supports both hash and path routing for GitHub Pages compatibility

export class HybridRouter {
    constructor(config = {}) {
        this.useHashRouting = config.useHashRouting || this.shouldUseHashRouting();
        this.basePath = config.basePath || this.detectBasePath();
        this.routes = new Map();
        this.currentRoute = null;
        
        // Bind methods
        this.handleRouteChange = this.handleRouteChange.bind(this);
        
        // Set up event listeners
        if (this.useHashRouting) {
            window.addEventListener('hashchange', this.handleRouteChange);
        } else {
            window.addEventListener('popstate', this.handleRouteChange);
        }
        
        // Handle clicks on links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && this.shouldHandleLink(link)) {
                e.preventDefault();
                const path = this.extractPath(link.href);
                this.navigate(path);
            }
        });
    }
    
    // Auto-detect if we should use hash routing (GitHub Pages)
    shouldUseHashRouting() {
        // Use hash routing if:
        // 1. We're on GitHub Pages (detected by URL pattern)
        // 2. Or if explicitly set in localStorage for testing
        const isGitHubPages = window.location.hostname.includes('github.io') || 
                            window.location.pathname.includes('/adapted-from-women/site/');
        const forceHash = localStorage.getItem('useHashRouting') === 'true';
        
        return isGitHubPages || forceHash;
    }
    
    // Detect the base path for the application
    detectBasePath() {
        const pathname = window.location.pathname;
        
        // GitHub Pages
        if (pathname.includes('/adapted-from-women/site/')) {
            return '/adapted-from-women/site';
        }
        
        // Local development
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') {
            return '';
        }
        
        // Production (future)
        return '';
    }
    
    // Check if we should handle a link click
    shouldHandleLink(link) {
        // Don't handle external links
        if (link.hostname !== window.location.hostname) return false;
        
        // Don't handle links with target attribute
        if (link.hasAttribute('target')) return false;
        
        // Check if it's a database route
        const href = link.getAttribute('href');
        return href && (href.includes('/database/') || href.includes('#/'));
    }
    
    // Extract the path from a URL
    extractPath(url) {
        if (this.useHashRouting) {
            // For hash routing, extract everything after the hash
            const hashIndex = url.indexOf('#');
            return hashIndex >= 0 ? url.substring(hashIndex + 1) : '/';
        } else {
            // For path routing, extract the pathname
            const urlObj = new URL(url, window.location.origin);
            let path = urlObj.pathname;
            
            // Remove the base path if present
            if (this.basePath && path.startsWith(this.basePath)) {
                path = path.substring(this.basePath.length);
            }
            
            // Remove /database prefix to get the relative path
            if (path.startsWith('/database')) {
                path = path.substring('/database'.length) || '/';
            }
            
            return path;
        }
    }
    
    // Get the current path
    getCurrentPath() {
        if (this.useHashRouting) {
            const hash = window.location.hash.substring(1) || '/';
            // Debug logging for development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('[HybridRouter] Getting current path from hash:', hash);
            }
            return hash;
        } else {
            let path = window.location.pathname;
            
            // Remove base path
            if (this.basePath && path.startsWith(this.basePath)) {
                path = path.substring(this.basePath.length);
            }
            
            // Remove /database prefix
            if (path.startsWith('/database')) {
                path = path.substring('/database'.length) || '/';
            }
            
            return path;
        }
    }
    
    // Register a route
    route(pattern, handler) {
        this.routes.set(pattern, handler);
        return this;
    }
    
    // Navigate to a path
    navigate(path, options = {}) {
        const { replaceState = false, skipPushState = false } = options;
        
        if (!skipPushState) {
            if (this.useHashRouting) {
                // For hash routing
                const newHash = '#' + path;
                if (replaceState) {
                    history.replaceState(null, '', newHash);
                } else {
                    window.location.hash = path;
                }
            } else {
                // For path routing
                const fullPath = `${this.basePath}/database${path === '/' ? '' : path}`;
                const method = replaceState ? 'replaceState' : 'pushState';
                history[method](null, '', fullPath);
            }
        }
        
        this.handleRouteChange();
    }
    
    // Handle route changes
    handleRouteChange() {
        const path = this.getCurrentPath();
        
        // Try to match the path against registered routes
        for (const [pattern, handler] of this.routes) {
            const match = this.matchPath(pattern, path);
            if (match) {
                this.currentRoute = { pattern, params: match.params };
                handler(match.params, match.query);
                return;
            }
        }
        
        // No route matched - call default handler if set
        if (this.routes.has('*')) {
            const handler = this.routes.get('*');
            handler({}, {});
        }
    }
    
    // Match a path against a pattern
    matchPath(pattern, path) {
        // Simple pattern matching (can be enhanced)
        // Supports patterns like: /films, /film/:slug, /author/:id
        
        const patternParts = pattern.split('/').filter(Boolean);
        const pathParts = path.split('/').filter(Boolean);
        
        // Exact match for root
        if (pattern === '/' && path === '/') {
            return { params: {}, query: this.parseQuery() };
        }
        
        // Different lengths = no match (unless pattern has wildcards)
        if (patternParts.length !== pathParts.length && !pattern.includes('*')) {
            return null;
        }
        
        const params = {};
        
        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];
            
            // Parameter extraction
            if (patternPart.startsWith(':')) {
                const paramName = patternPart.substring(1);
                params[paramName] = pathPart;
            }
            // Wildcard
            else if (patternPart === '*') {
                // Match anything
                continue;
            }
            // Exact match required
            else if (patternPart !== pathPart) {
                return null;
            }
        }
        
        return { params, query: this.parseQuery() };
    }
    
    // Parse query string
    parseQuery() {
        const query = {};
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.forEach((value, key) => {
            query[key] = value;
        });
        return query;
    }
    
    // Update URL with query parameters
    updateQuery(params) {
        const currentPath = this.getCurrentPath();
        const searchParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                searchParams.set(key, value);
            }
        });
        
        const queryString = searchParams.toString();
        const newPath = currentPath + (queryString ? '?' + queryString : '');
        
        if (this.useHashRouting) {
            history.replaceState(null, '', '#' + newPath);
        } else {
            const fullPath = `${this.basePath}/database${currentPath}${queryString ? '?' + queryString : ''}`;
            history.replaceState(null, '', fullPath);
        }
    }
    
    // Generate a URL for the database
    getDatabaseURL(path) {
        if (this.useHashRouting) {
            return `${this.basePath}/database/#${path}`;
        } else {
            return `${this.basePath}/database${path}`;
        }
    }
    
    // Initialize - check for redirects or hash migration
    init() {
        // Check for redirect from 404.html
        const redirect = sessionStorage.getItem('redirect');
        if (redirect) {
            sessionStorage.removeItem('redirect');
            
            // Extract the path part after /database
            const dbIndex = redirect.indexOf('/database');
            if (dbIndex >= 0) {
                const path = redirect.substring(dbIndex + '/database'.length) || '/';
                
                // If we're using hash routing, convert to hash
                if (this.useHashRouting) {
                    window.location.hash = path + window.location.search;
                } else {
                    history.replaceState(null, '', redirect);
                }
            }
        }
        
        // Check if we need to migrate from path to hash
        if (this.useHashRouting && window.location.pathname.includes('/database/')) {
            const currentPath = this.getCurrentPath();
            if (currentPath && currentPath !== '/') {
                // Redirect to hash version
                window.location.replace(this.getDatabaseURL(currentPath) + window.location.search);
                return false; // Indicate that we're redirecting
            }
        }
        
        // IMPORTANT: Always trigger initial route, even when opening a hash URL directly
        // Use setTimeout to ensure DOM is ready and all event listeners are attached
        setTimeout(() => {
            this.handleRouteChange();
        }, 0);
        
        return true;
    }
}

// Convenience function to detect if hash routing is needed
export function isHashRoutingNeeded() {
    return window.location.hostname.includes('github.io') || 
           window.location.pathname.includes('/adapted-from-women/site/');
}
