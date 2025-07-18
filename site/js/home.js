// home.js - Homepage functionality

// Handle search form submission
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.querySelector('.search-form');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchInput = this.querySelector('input[name="q"]');
            const searchTerm = searchInput.value.trim();
            
            if (searchTerm) {
                // Redirect to database page with search query
                window.location.href = `database.html?search=${encodeURIComponent(searchTerm)}`;
            } else {
                // If no search term, just go to database
                window.location.href = 'database.html';
            }
        });
    }
});