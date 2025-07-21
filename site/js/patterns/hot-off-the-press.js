// hot-off-the-press.js - JavaScript for the Hot Off the Press pattern page

// Load the data and initialize visualizations
async function initHotOffThePress() {
    try {
        // Load the speed-demons data
        const response = await fetch('../data/patterns/speed-demons.json');
        if (!response.ok) {
            throw new Error('Failed to load speed-demons data');
        }
        
        const rawData = await response.json();
        
        // Filter to only same-year adaptations (delay = 0)
        const sameYearDemons = rawData.demons.filter(d => d.speed.delay === 0);
        
        // Process the data for visualizations
        const data = processSpeedData(sameYearDemons);
        
        // Update counts in the hero section
        updateHeroStats(sameYearDemons.length);
        
        // Create visualizations
        createRushTimeline(data);
        createGenreBreakdown(data);
        createStudioSpeedChart(data);
        
        // Update specific sections with real data
        updateSpeedRecords(sameYearDemons);
        updateAuthorList(data);
        updateEraStats(data);
        updateFascinatingFacts(data, sameYearDemons);
        
    } catch (error) {
        console.error('Error loading hot-off-the-press data:', error);
        // Show static content
        showStaticContent();
    }
}

// Process the raw speed data into visualization-ready format
function processSpeedData(sameYearDemons) {
    const data = {
        byDecade: {},
        byGenre: {},
        byStudio: {},
        byAuthor: {},
        byYear: {},
        topAuthors: [],
        earliestYear: 9999,
        latestYear: 0
    };
    
    // Initialize decades
    for (let decade = 1910; decade <= 1960; decade += 10) {
        data.byDecade[decade + 's'] = 0;
    }
    
    // Process each film
    sameYearDemons.forEach(demon => {
        const year = demon.firstAdaptation.year;
        const decade = Math.floor(year / 10) * 10 + 's';
        const studio = demon.firstAdaptation.studio || 'Unknown';
        const authorName = demon.author.name;
        
        // Track year range
        if (year < data.earliestYear) data.earliestYear = year;
        if (year > data.latestYear) data.latestYear = year;
        
        // Count by decade
        if (data.byDecade[decade] !== undefined) {
            data.byDecade[decade]++;
        }
        
        // Count by studio
        data.byStudio[studio] = (data.byStudio[studio] || 0) + 1;
        
        // Count by author
        data.byAuthor[authorName] = (data.byAuthor[authorName] || 0) + 1;
        
        // Count by specific year
        data.byYear[year] = (data.byYear[year] || 0) + 1;
        
        // Genre would need to come from film data, not available in speed-demons.json
        // For now, we'll skip genre analysis
    });
    
    // Get top authors
    const authorCounts = Object.entries(data.byAuthor)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    
    data.topAuthors = authorCounts;
    
    // Consolidate smaller studios into "Others"
    const studioEntries = Object.entries(data.byStudio).sort((a, b) => b[1] - a[1]);
    const topStudios = {};
    let othersCount = 0;
    
    studioEntries.forEach(([studio, count], index) => {
        if (index < 6) {
            topStudios[studio] = count;
        } else {
            othersCount += count;
        }
    });
    
    if (othersCount > 0) {
        topStudios['Others'] = othersCount;
    }
    
    data.byStudio = topStudios;
    
    return data;
}

// Update hero stats with actual count
function updateHeroStats(count) {
    const statItem = document.querySelector('.hero-stats .stat-item');
    if (statItem) {
        statItem.textContent = `${count} films`;
    }
}

// Create timeline visualization
function createRushTimeline(data) {
    const container = document.getElementById('rushTimeline');
    if (!container) return;
    
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.style.maxHeight = '300px';
    container.appendChild(canvas);
    
    const decades = Object.keys(data.byDecade);
    const values = Object.values(data.byDecade);
    
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
            plugins: {
                title: {
                    display: true,
                    text: 'The Rush to Adapt: Same-Year Films by Decade',
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
                            size: 11
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

// Create genre breakdown chart
function createGenreBreakdown(data) {
    const container = document.getElementById('genreBreakdown');
    if (!container) return;
    
    // Since we don't have genre data in speed-demons.json, show a placeholder
    container.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #767676;">
            <p style="font-style: italic;">Genre analysis will be available once film genre data is verified.</p>
            <p style="font-size: 0.9rem; margin-top: 1rem;">This visualization will reveal which types of stories studios rushed to adapt.</p>
        </div>
    `;
    
    // TODO: Once we have genre data, implement the doughnut chart
    // The code below is preserved for when we have the data
    /*
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.style.maxHeight = '300px';
    container.appendChild(canvas);
    
    const genres = Object.keys(data.byGenre);
    const values = Object.values(data.byGenre);
    
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
            plugins: {
                title: {
                    display: true,
                    text: 'Genres That Demanded Speed',
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
                            size: 11
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
    */
}

// Create studio speed chart
function createStudioSpeedChart(data) {
    const container = document.getElementById('studioSpeed');
    if (!container) return;
    
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.style.maxHeight = '300px';
    container.appendChild(canvas);
    
    const studios = Object.keys(data.byStudio).slice(0, 6); // Top 6 studios
    const values = Object.values(data.byStudio).slice(0, 6);
    
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
                            size: 11
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

// Update specific elements once we have real data
function updateSpeedRecords(sameYearDemons) {
    // Sort by year to find interesting examples
    const sortedByYear = [...sameYearDemons].sort((a, b) => a.firstAdaptation.year - b.firstAdaptation.year);
    
    // Get earliest, middle, and latest examples
    const examples = [
        sortedByYear[0], // Earliest
        sortedByYear[Math.floor(sortedByYear.length / 2)], // Middle
        sortedByYear[sortedByYear.length - 1] // Latest
    ];
    
    const recordCards = document.querySelectorAll('.record-card');
    
    examples.forEach((demon, index) => {
        if (recordCards[index] && demon) {
            const card = recordCards[index];
            const titleEl = card.querySelector('.record-title');
            const timelineEl = card.querySelector('.record-timeline');
            const detailEl = card.querySelector('.record-detail');
            
            if (titleEl) {
                titleEl.innerHTML = demon.work.html_title;
            }
            
            if (timelineEl) {
                timelineEl.innerHTML = `
                    <span class="timeline-item">Published: ${demon.work.publication_year}</span>
                    <span class="timeline-arrow">→</span>
                    <span class="timeline-item">Released: ${demon.firstAdaptation.year}</span>
                `;
            }
            
            if (detailEl) {
                detailEl.textContent = `${demon.firstAdaptation.studio || 'Unknown studio'} • Dir: ${demon.firstAdaptation.directors || 'Unknown'}`;
            }
        }
    });
}

function updateAuthorList(data) {
    const container = document.querySelector('.author-speed-list');
    if (!container || !data.topAuthors) return;
    
    container.innerHTML = data.topAuthors.map(author => `
        <div class="speed-author">
            <h3>${author.name} - ${author.count} same-year adaptation${author.count !== 1 ? 's' : ''}</h3>
            <p>Notable for: ${author.note || 'Multiple rapid adaptations'}</p>
        </div>
    `).join('');
}

function updateEraStats(data) {
    // Calculate era stats from decade data
    const silent = (data.byDecade['1910s'] || 0) + (data.byDecade['1920s'] || 0);
    const earlyTalkies = data.byDecade['1930s'] || 0;
    const studioPeak = data.byDecade['1940s'] || 0;
    const television = (data.byDecade['1950s'] || 0) + (data.byDecade['1960s'] || 0);
    
    // Update the era cards
    const eraCards = document.querySelectorAll('.era-card');
    const eraCounts = [silent, earlyTalkies, studioPeak, television];
    
    eraCards.forEach((card, index) => {
        const statEl = card.querySelector('.era-stat');
        if (statEl && eraCounts[index] !== undefined) {
            statEl.textContent = `${eraCounts[index]} same-year adaptations`;
        }
    });
}

// Add new function to update fascinating facts
function updateFascinatingFacts(data, sameYearDemons) {
    const factCards = document.querySelectorAll('.fact-card');
    
    // Find the most prolific year
    const yearCounts = Object.entries(data.byYear).sort((a, b) => b[1] - a[1]);
    const topYear = yearCounts[0];
    
    // Find earliest and latest
    const earliest = sameYearDemons.reduce((min, d) => 
        d.firstAdaptation.year < min.firstAdaptation.year ? d : min
    );
    const latest = sameYearDemons.reduce((max, d) => 
        d.firstAdaptation.year > max.firstAdaptation.year ? d : max
    );
    
    // Update fact cards
    if (factCards[0]) {
        factCards[0].querySelector('p').textContent = 
            `Verified same-year adaptations in our database: ${sameYearDemons.length} films`;
    }
    
    if (factCards[1] && topYear) {
        factCards[1].querySelector('p').textContent = 
            `${topYear[0]} saw ${topYear[1]} same-year adaptations, the highest in our database`;
    }
    
    if (factCards[2]) {
        factCards[2].querySelector('p').textContent = 
            `${data.earliestYear} to ${data.latestYear} — ${data.latestYear - data.earliestYear} years of rapid adaptation`;
    }
    
    if (factCards[3] && latest) {
        factCards[3].querySelector('p').innerHTML = 
            `The final same-year adaptation in our database: ${latest.work.html_title} (${latest.firstAdaptation.year})`;
    }
}

// Fallback for when data doesn't load
function showStaticContent() {
    document.querySelectorAll('#rushTimeline, #genreBreakdown, #studioSpeed').forEach(el => {
        el.innerHTML = '<p style="text-align: center; color: #767676; font-style: italic;">Visualization will be available once data verification is complete.</p>';
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initHotOffThePress);