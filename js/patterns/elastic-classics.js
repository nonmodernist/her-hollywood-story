// elastic-classics.js - JavaScript for the Elastic Classics pattern page

// Load the data and initialize visualizations
async function initElasticClassics() {
    try {
        // Load the elastic classics data (would need to be renamed from remake-champions.json)
        const response = await fetch('../data/patterns/remake-champions.json');
        if (!response.ok) {
            throw new Error('Failed to load elastic classics data');
        }
        
        const data = await response.json();
        
        // Create the main timeline visualization
        createElasticTimeline(data.champions);
        
    } catch (error) {
        console.error('Error loading elastic classics data:', error);
        // Show static content as fallback
        showStaticContent();
    }
}

// Create the elastic timeline visualization
function createElasticTimeline(champions) {
    const container = document.getElementById('elasticTimeline');
    if (!container) return;
    
    // Clear container and create canvas
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.style.maxHeight = '600px';
    container.appendChild(canvas);
    
    // Prepare data for timeline
    const datasets = [];
    const colors = [
        'rgba(139, 0, 0, 0.8)',      // Deep red
        'rgba(0, 100, 139, 0.8)',    // Deep blue
        'rgba(139, 69, 19, 0.8)',    // Saddle brown
        'rgba(85, 107, 47, 0.8)',    // Dark olive green
        'rgba(128, 0, 128, 0.8)',    // Purple
        'rgba(184, 134, 11, 0.8)',   // Dark goldenrod
        'rgba(0, 139, 139, 0.8)',    // Dark cyan
        'rgba(139, 0, 139, 0.8)',    // Dark magenta
        'rgba(47, 79, 79, 0.8)',     // Dark slate gray
        'rgba(25, 25, 112, 0.8)',    // Midnight blue
        'rgba(139, 90, 43, 0.8)',    // Tan
        'rgba(105, 105, 105, 0.8)'   // Dim gray
    ];
    
    // Create a dataset for each work
    champions.forEach((champion, index) => {
        const adaptationData = champion.adaptations.map(film => ({
            x: film.year,
            y: index,
            title: film.title,
            studio: film.studio,
            directors: film.directors
        }));
        
        datasets.push({
            label: champion.work.title,
            data: adaptationData,
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length],
            borderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            showLine: false
        });
    });
    
    // Create the chart
    new Chart(canvas, {
        type: 'scatter',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    min: 1909,
                    max: 1965,
                    title: {
                        display: true,
                        text: 'Year',
                        font: {
                            family: "'Source Sans 3', sans-serif",
                            size: 14
                        }
                    },
                    ticks: {
                        stepSize: 5,
                        callback: function(value) {
                            return value % 10 === 0 ? value : '';
                        },
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
                y: {
                    type: 'category',
                    labels: champions.map(c => {
                        // Shorten long titles for display
                        const title = c.work.title;
                        return title.length > 30 ? title.substring(0, 27) + '...' : title;
                    }),
                    title: {
                        display: true,
                        text: 'Works',
                        font: {
                            family: "'Source Sans 3', sans-serif",
                            size: 14
                        }
                    },
                    ticks: {
                        font: {
                            family: "'EB Garamond', serif",
                            size: 13
                        },
                        color: '#1a1a1a'
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const point = context[0].raw;
                            return `${point.title} (${point.x})`;
                        },
                        label: function(context) {
                            const point = context.raw;
                            return [
                                `Studio: ${point.studio}`,
                                `Director: ${point.directors || 'Unknown'}`
                            ];
                        }
                    },
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleFont: {
                        family: "'EB Garamond', serif",
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        family: "'Source Sans 3', sans-serif",
                        size: 12
                    },
                    padding: 12
                }
            },
            interaction: {
                intersect: false,
                mode: 'point'
            }
        }
    });
    
    // Add era indicators
    addEraIndicators(canvas);
}

// Add visual indicators for major film eras
function addEraIndicators(canvas) {
    // This would add subtle background shading for silent era, early talkies, etc.
    // Implementation depends on Chart.js plugins
}

// Fallback for when data doesn't load
function showStaticContent() {
    const container = document.getElementById('elasticTimeline');
    if (container) {
        container.innerHTML = '<p style="text-align: center; color: #767676; font-style: italic;">Timeline visualization loading...</p>';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initElasticClassics);