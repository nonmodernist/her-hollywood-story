// routing-helper.js - Helper script to detect and handle routing mode

(function() {
    // Check if we're on a page that needs hash routing
    const needsHashRouting = window.location.hostname.includes('github.io') || 
                           window.location.pathname.includes('/adapted-from-women/site/');
    
    // Check if we're on a database path that needs conversion
    const path = window.location.pathname;
    const isDirectDatabasePath = path.includes('/database/film/') || 
                                path.includes('/database/author/') || 
                                path.includes('/database/work/') ||
                                path.includes('/database/films') ||
                                path.includes('/database/authors') ||
                                path.includes('/database/works');
    
    if (needsHashRouting && isDirectDatabasePath) {
        // Extract the database-relative path
        const dbIndex = path.indexOf('/database/');
        if (dbIndex >= 0) {
            const dbPath = path.substring(dbIndex + '/database'.length) || '/';
            const basePath = path.substring(0, dbIndex);
            
            // Redirect to hash version
            const newUrl = `${basePath}/database/#${dbPath}${window.location.search}`;
            console.log('Redirecting to hash-based URL:', newUrl);
            window.location.replace(newUrl);
        }
    }
})();
