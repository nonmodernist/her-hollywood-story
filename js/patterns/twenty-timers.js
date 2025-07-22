// twenty-timers.js - JavaScript for the Twenty-Timers Club pattern page

// Load the data and initialize visualizations
async function initTwentyTimers() {
    try {
        // Load the twenty-timers data
        const response = await fetch('../data/patterns/twenty-timers.json');
        if (!response.ok) {
            throw new Error('Failed to load twenty-timers data');
        }
        
        const data = await response.json();
        
        // Update any dynamic content
        updateMemberCards(data.members);
        
        // Create visualizations
        createTimeline(data);
        createStudioNetwork(data);
        createDecadesChart(data);
        
    } catch (error) {
        console.error('Error loading twenty-timers data:', error);
        // Show fallback content
        showStaticContent();
    }
}

// Update member cards with any missing data
function updateMemberCards(members) {
    members.forEach(member => {
        const card = document.querySelector(`[data-author-id="${member.id}"]`);
        if (!card) return;
        
        // Update fascinating fact if available
        if (member.fascinatingFact) {
            const factElement = card.querySelector('.member-fact');
            if (factElement) {
                factElement.textContent = member.fascinatingFact;
            }
        }
    });
    
    // Update preview cards
    members.forEach(member => {
        const previewId = member.slug || member.name.toLowerCase().replace(/\s+/g, '-');
        const preview = document.getElementById(previewId);
        if (!preview) return;
        
        if (member.signatureWork) {
            const sigWork = preview.querySelector('.signature-work');
            if (sigWork) {
                sigWork.innerHTML = `<strong>Signature Work:</strong> ${member.signatureWork}`;
            }
        }
        
        if (member.deepDiveTeaser) {
            const teaser = preview.querySelector('.preview-teaser');
            if (teaser) {
                teaser.textContent = member.deepDiveTeaser;
            }
        }
    });
}

// Create timeline visualization using Chart.js
function createTimeline(data) {
    const container = document.getElementById('timelineViz');
    if (!container) return;
    
    // Clear container and create canvas
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.style.maxHeight = '400px';
    container.appendChild(canvas);
    
    // Create floating bar chart for timeline
    const chartData = {
        labels: data.members.map(m => m.name),
        datasets: [{
            label: 'Active Years',
            data: data.members.map(m => [m.yearStart, m.yearEnd]),
            backgroundColor: [
                'rgba(139, 0, 0, 0.8)',
                'rgba(139, 0, 0, 0.7)',
                'rgba(139, 0, 0, 0.6)',
                'rgba(139, 0, 0, 0.5)',
                'rgba(139, 0, 0, 0.4)'
            ],
            borderColor: '#8b0000',
            borderWidth: 1
        }]
    };
    
    new Chart(canvas, {
        type: 'bar',
        data: chartData,
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Hollywood Adaptation Spans',
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
                            const member = data.members[context.dataIndex];
                            return `${member.yearStart}–${member.yearEnd} (${member.yearSpan} years, ${member.filmCount} films)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    min: 1910,
                    max: 1965,
                    ticks: {
                        stepSize: 10,
                        callback: function(value) {
                            return value;
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
                    ticks: {
                        font: {
                            family: "'EB Garamond', serif",
                            size: 14
                        },
                        color: '#1a1a1a'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Create studio network visualization
function createStudioNetwork(data) {
    const container = document.getElementById('studioNetwork');
    if (!container) return;
    
    // Clear container and create canvas
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.style.maxHeight = '300px';
    container.appendChild(canvas);
    
    // Shorten long studio names for better display
    const studios = data.patterns.collectiveStats.studioConcentration.map(s => {
        let displayName = s.studio;
        if (displayName === 'Gene Stratton Porter Productions') {
            displayName = 'GSP Productions';
        } else if (displayName === 'Famous Players-Lasky') {
            displayName = 'Famous Players-L.';
        }
        return {
            ...s,
            displayName: displayName
        };
    });
    
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: studios.map(s => s.displayName),
            datasets: [{
                label: 'Films',
                data: studios.map(s => s.count),
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
                    text: 'Films by Studio',
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
                    max: 15,
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
                            size: 11
                        },
                        color: '#4a4a4a',
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Create decades chart
function createDecadesChart(data) {
    const container = document.getElementById('decadesViz');
    if (!container) return;
    
    // Clear container and create canvas
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.style.maxHeight = '300px';
    container.appendChild(canvas);
    
    // Aggregate total films by decade
    const decadeTotals = {
        '1910s': 0,
        '1920s': 0,
        '1930s': 0,
        '1940s': 0,
        '1950s': 0,
        '1960s': 0
    };
    
    data.members.forEach(member => {
        Object.entries(member.filmsByDecade).forEach(([decade, count]) => {
            const decadeLabel = decade + 's';
            if (decadeTotals[decadeLabel] !== undefined) {
                decadeTotals[decadeLabel] += count;
            }
        });
    });
    
    // Create stacked data for each author
    const decades = Object.keys(decadeTotals);
    const datasets = data.members.map((member, index) => {
        const colors = [
            'rgba(139, 0, 0, 0.9)',
            'rgba(180, 40, 40, 0.9)',
            'rgba(160, 60, 60, 0.9)',
            'rgba(120, 20, 20, 0.9)',
            'rgba(200, 80, 80, 0.9)'
        ];
        
        return {
            label: member.name,
            data: decades.map(decade => {
                const decadeKey = decade.slice(0, 4);
                return member.filmsByDecade[decadeKey] || 0;
            }),
            backgroundColor: colors[index],
            borderWidth: 0
        };
    });
    
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: decades,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Films by Decade',
                    font: {
                        size: 16,
                        style: 'italic',
                        family: "'EB Garamond', serif"
                    },
                    color: '#4a4a4a',
                    padding: 20
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: "'Source Sans 3', sans-serif",
                            size: 11
                        },
                        padding: 10,
                        usePointStyle: true,
                        pointStyle: 'rect'
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
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
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        font: {
                            family: "'Source Sans 3', sans-serif",
                            size: 11
                        },
                        color: '#767676'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

// Fallback for when data doesn't load
function showStaticContent() {
    // The HTML already has the basic content, so just hide loading indicators
    document.querySelectorAll('.timeline-container, .studio-viz, .decades-chart').forEach(el => {
        el.innerHTML = '<p style="text-align: center; color: #767676; font-style: italic;">Visualization loading...</p>';
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initTwentyTimers);