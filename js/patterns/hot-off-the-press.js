// hot-off-the-press.js - JavaScript for the Hot Off the Press pattern page

// Load the data and initialize visualizations
async function initHotOffThePress() {
    try {
        // Load the hot-off-the-press data
        const response = await fetch('../data/patterns/hot-off-the-press.json');
        if (!response.ok) {
            throw new Error('Failed to load hot-off-the-press data');
        }
        
        const data = await response.json();
        
        // Update counts in the hero section
        updateHeroStats(data.stats.total);
        
        // Create visualizations
        createRushTimeline(data);
        createGenreBreakdown(data);
        createStudioSpeedChart(data);
        
        // Update specific sections with real data
        updateSpeedRecords(data.adaptations);
        updateAuthorList(data.stats.topAuthors);
        updateEraStats(data.stats.byDecade);
        updateFascinatingFacts(data);
        
    } catch (error) {
        console.error('Error loading hot-off-the-press data:', error);
        // Show static content
        showStaticContent();
    }
}

// Update hero stats with actual count
function updateHeroStats(count) {
    const statItem = document.querySelector('.hero-stats .stat-item');
    if (statItem) {
        statItem.textContent = `${count} films`;
    }
}

// Create genre breakdown chart
function createGenreBreakdown(data) {
    const container = document.getElementById('genreBreakdown');
    if (!container) return;
    
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.style.maxHeight = '300px';
    container.appendChild(canvas);
    
    // Get top 6 genres
    const topGenres = data.stats.byGenre.slice(0, 6);
    const genres = topGenres.map(g => g.genre);
    const values = topGenres.map(g => g.count);
    
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: genres,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(139, 0, 0, 0.9)',
                    'rgba(180, 40, 40, 0.9)',
                    'rgba(160, 60, 60, 0.9)',
                    'rgba(120, 20, 20, 0.9)',
                    'rgba(200, 80, 80, 0.9)',
                    'rgba(100, 10, 10, 0.9)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: window.devicePixelRatio || 1,
            plugins: {
                title: {
                    display: true,
                    text: 'Genres That Needed Speed',
                    font: {
                        size: 16,
                        style: 'italic',
                        family: "'EB Garamond', serif"
                    },
                    color: '#4a4a4a',
                    padding: 20
                },
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            family: "'Source Sans 3', sans-serif",
                            size: 14
                        },
                        padding: 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} films (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Create timeline visualization
function createRushTimeline(data) {
    const container = document.getElementById('rushTimeline');
    if (!container) return;
    
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.style.maxHeight = '300px';
    container.appendChild(canvas);
    
    const decades = Object.keys(data.stats.byDecade);
    const values = Object.values(data.stats.byDecade);
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: decades,
            datasets: [{
                label: 'Same-Year Adaptations',
                data: values,
                borderColor: 'rgba(139, 0, 0, 0.8)',
                backgroundColor: 'rgba(139, 0, 0, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#8b0000',
                pointBorderColor: '#8b0000',
                pointRadius: 6,
                pointHoverRadius: 8,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: window.devicePixelRatio || 1,
            plugins: {
                title: {
                    display: true,
                    text: 'Same-Year Films by Decade',
                    font: {
                        size: 16,
                        style: 'italic',
                        family: "'EB Garamond', serif"
                    },
                    color: '#4a4a4a',
                    padding: 20
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} films adapted in the same year as publication`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5,
                        font: {
                            family: "'Source Sans 3', sans-serif",
                            size: 14
                        },
                        color: '#767676'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: "'Source Sans 3', sans-serif",
                            size: 12
                        },
                        color: '#4a4a4a'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Create studio speed chart
function createStudioSpeedChart(data) {
    const container = document.getElementById('studioSpeed');
    if (!container) return;
    
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.style.maxHeight = '300px';
    container.appendChild(canvas);
    
    // Use top 6 studios from the data
    const studios = data.stats.topStudios.slice(0, 6).map(s => s.studio);
    const values = data.stats.topStudios.slice(0, 6).map(s => s.count);
    
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: studios,
            datasets: [{
                label: 'Same-Year Adaptations',
                data: values,
                backgroundColor: 'rgba(139, 0, 0, 0.8)',
                borderColor: '#8b0000',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: window.devicePixelRatio || 1,
            plugins: {
                title: {
                    display: true,
                    text: 'Studios Racing to Screen',
                    font: {
                        size: 16,
                        style: 'italic',
                        family: "'EB Garamond', serif"
                    },
                    color: '#4a4a4a',
                    padding: 20
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 2,
                        font: {
                            family: "'Source Sans 3', sans-serif",
                            size: 14
                        },
                        color: '#767676'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: "'Source Sans 3', sans-serif",
                            size: 11
                        },
                        color: '#4a4a4a'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update speed records with real examples
function updateSpeedRecords(adaptations) {
    // Get interesting examples from different eras
    const examples = [
        adaptations.find(a => a.film.year < 1920), // Early example
        adaptations.find(a => a.film.year >= 1925 && a.film.year < 1935), // Peak era
        adaptations[adaptations.length - 1] // Latest example
    ].filter(Boolean);
    
    const recordCards = document.querySelectorAll('.record-card');
    
    examples.forEach((adaptation, index) => {
        if (recordCards[index] && adaptation) {
            const card = recordCards[index];
            const titleEl = card.querySelector('.record-title');
            const timelineEl = card.querySelector('.record-timeline');
            const detailEl = card.querySelector('.record-detail');
            
            if (titleEl) {
                titleEl.innerHTML = adaptation.work.html_title;
            }
            
            if (timelineEl) {
                timelineEl.innerHTML = `
                    <span class="timeline-item">Published: ${adaptation.work.publication_year}</span>
                    <span class="timeline-arrow">→</span>
                    <span class="timeline-item">Released: ${adaptation.film.year}</span>
                `;
            }
            
            if (detailEl) {
                detailEl.textContent = `${adaptation.film.studio || 'Unknown studio'} • Dir: ${adaptation.film.directors || 'Unknown'}`;
            }
        }
    });
}

// Update author list
function updateAuthorList(topAuthors) {
    const container = document.querySelector('.author-speed-list');
    if (!container) return;
    
    container.innerHTML = topAuthors.slice(0, 5).map(author => `
        <div class="speed-author">
            <h3>${author.name} - ${author.count} same-year adaptation${author.count !== 1 ? 's' : ''}</h3>
            <p>Notable for: ${getAuthorNote(author.name)}</p>
        </div>
    `).join('');
}

// Helper function to get author notes
function getAuthorNote(authorName) {
    const notes = {
        'Mary Roberts Rinehart': 'Mystery queen who mastered the magazine-to-movie pipeline',
        'Faith Baldwin': 'Romance writer whose stories captured contemporary life',
        'Alice Muriel Williamson': 'Adventure novelist with a knack for timely tales',
        'Evelyn Campbell': 'Society stories that studios couldn\'t resist',
        'Gertrude Atherton': 'California chronicler with studio connections'
    };
    return notes[authorName] || 'Multiple rapid adaptations';
}

// Update era stats
function updateEraStats(byDecade) {
    const silent = (byDecade['1910s'] || 0) + (byDecade['1920s'] || 0);
    const earlyTalkies = byDecade['1930s'] || 0;
    const studioPeak = byDecade['1940s'] || 0;
    const television = (byDecade['1950s'] || 0) + (byDecade['1960s'] || 0);
    
    const eraCards = document.querySelectorAll('.era-card');
    const eraCounts = [silent, earlyTalkies, studioPeak, television];
    
    eraCards.forEach((card, index) => {
        const statEl = card.querySelector('.era-stat');
        if (statEl && eraCounts[index] !== undefined) {
            statEl.textContent = `${eraCounts[index]} same-year adaptations`;
        }
    });
}

// Update fascinating facts
function updateFascinatingFacts(data) {
    const factCards = document.querySelectorAll('.fact-card');
    
    // Find the most prolific year
    const yearCounts = {};
    data.adaptations.forEach(a => {
        yearCounts[a.film.year] = (yearCounts[a.film.year] || 0) + 1;
    });
    const topYear = Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0];
    
    // Update fact cards
    if (factCards[0]) {
        factCards[0].querySelector('p').textContent = 
            `${data.stats.total} verified same-year adaptations in our database`;
    }
    
    if (factCards[1] && topYear) {
        factCards[1].querySelector('p').textContent = 
            `${topYear[0]} saw ${topYear[1]} same-year adaptations, the highest in our database`;
    }
    
    if (factCards[2]) {
        factCards[2].querySelector('p').textContent = 
            `${data.stats.yearRange.earliest} to ${data.stats.yearRange.latest} — ${data.stats.yearRange.latest - data.stats.yearRange.earliest} years of rapid adaptation`;
    }
    
    if (factCards[3]) {
        const latest = data.adaptations[data.adaptations.length - 1];
        factCards[3].querySelector('p').innerHTML = 
            `The final same-year adaptation: ${latest.work.html_title} (${latest.film.year})`;
    }
}

// Fallback for when data doesn't load
function showStaticContent() {
    document.querySelectorAll('#rushTimeline, #genreBreakdown, #studioSpeed').forEach(el => {
        el.innerHTML = '<p style="text-align: center; color: #767676; font-style: italic;">Visualization loading...</p>';
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initHotOffThePress);