// database-config.js - Configuration and constants for database app

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

export const BASE_PATH = getBasePath();

// Create consistent paths for all your data
export const PATHS = {
    data: {
        index: (type) => `${BASE_PATH}/data/database/${type}-index.min.json`,
        detail: (type, slug) => `${BASE_PATH}/data/database/${type}/${slug}.json`,
        patterns: (pattern) => `${BASE_PATH}/data/patterns/${pattern}.json`
    },
    database: (path = '') => `${BASE_PATH}/database${path}`
};

// Configuration
export const ITEMS_PER_PAGE = 50;

// Helper function to parse lists of names
export function formatNameList(names) {
    if (!names) return '';
    // Split by pipe, trim whitespace, and join with commas
    return names.split('|').map(name => name.trim()).join(', ');
}

// Date formatter helper
export function formatMagazineDate(dateStr) {
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

// Helper to generate database URLs
export function getDatabaseURL(path) {
    return PATHS.database(path);
}

// Utility functions
export function debounce(func, wait) {
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

export function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper function to parse PostgreSQL array strings
export function parseArrayField(field) {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field !== 'string') return [];
    
    // Remove outer brackets and quotes, then split
    try {
        // Handle PostgreSQL array format like "['item1', 'item2', \"item3\"]"
        // First remove the outer brackets
        let cleaned = field.trim();
        if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
            cleaned = cleaned.slice(1, -1);
        }
        
        // Parse as a comma-separated list, handling both single and double quotes
        const items = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = null;
        
        for (let i = 0; i < cleaned.length; i++) {
            const char = cleaned[i];
            const nextChar = cleaned[i + 1];
            
            if (!inQuotes && (char === '"' || char === "'")) {
                // Starting a quoted string
                inQuotes = true;
                quoteChar = char;
            } else if (inQuotes && char === '\\' && nextChar === quoteChar) {
                // Escaped quote within string
                current += quoteChar;
                i++; // Skip the next character
            } else if (inQuotes && char === quoteChar) {
                // Ending a quoted string
                inQuotes = false;
                quoteChar = null;
            } else if (!inQuotes && char === ',') {
                // End of item
                if (current.trim()) {
                    items.push(current.trim());
                }
                current = '';
            } else {
                current += char;
            }
        }
        
        // Add the last item
        if (current.trim()) {
            items.push(current.trim());
        }
        
        return items;
    } catch (e) {
        return [];
    }
}