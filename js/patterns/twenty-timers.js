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
        
        // Load and create statistical significance chart
        createStatisticalSignificanceChart();
        
        // Create network graph
        createNetworkGraph();
        
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
            displayName = 'Famous Players-Lasky';
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
                    max: 20,
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

// Create Statistical Significance chart
async function createStatisticalSignificanceChart() {
    const container = document.getElementById('statisticalSignificanceViz');
    if (!container) return;
    
    try {
        // Load the adaptation distribution data
        const response = await fetch('../data/adaptation-distribution-analysis.json');
        if (!response.ok) {
            throw new Error('Failed to load adaptation distribution data');
        }
        
        const distributionData = await response.json();
        
        // Clear container and create canvas
        container.innerHTML = '';
        const canvas = document.createElement('canvas');
        canvas.style.maxHeight = '400px';
        container.appendChild(canvas);
        
        // Chart data from JSON
        const chartData = {
            labels: ['1 film', '2-5 films', '6-10 films', '11-19 films', '20+ films'],
            datasets: [{
                label: 'Authors',
                data: [
                    distributionData.distribution.authors_with_1_film,
                    distributionData.distribution.authors_with_2_5_films,
                    distributionData.distribution.authors_with_6_10_films,
                    distributionData.distribution.authors_with_11_19_films,
                    distributionData.distribution.authors_with_20_plus_films
                ],
                backgroundColor: [
                    'rgba(139, 0, 0, 0.6)',
                    'rgba(139, 0, 0, 0.7)', 
                    'rgba(139, 0, 0, 0.8)',
                    'rgba(139, 0, 0, 0.9)',
                    'rgba(139, 0, 0, 1.0)'
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
                    text: 'Adaptation Frequency Distribution',
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
                            const value = context.parsed.x;
                            const total = distributionData.overview.total_authors;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${value} authors (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 320,
                    ticks: {
                        stepSize: 50,
                        font: {
                            family: "'Source Sans 3', sans-serif",
                            size: 12
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
                            size: 12
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
    
    } catch (error) {
        console.error('Error loading statistical significance data:', error);
        // Show fallback message
        container.innerHTML = '<p style="text-align: center; color: #767676; font-style: italic;">Statistical significance chart loading...</p>';
    }
}

// Create network visualization
async function createNetworkGraph() {
    const container = document.getElementById('networkViz');
    if (!container) return;
    
    try {
        // Load the network data
        const response = await fetch('../data/twenty-timers-creative-networks.json');
        if (!response.ok) {
            throw new Error('Failed to load network data');
        }
        
        const networkData = await response.json();
        
        // Create nodes and edges for vis-network
        const nodes = [];
        const edges = [];
        
        // Twenty-Timer authors (red nodes)
        const authors = ['Alice Duer Miller', 'Edna Ferber', 'Fannie Hurst', 'Mary Roberts Rinehart', 'Gene Stratton-Porter'];
        const authorFilmCounts = {
            'Mary Roberts Rinehart': 41,
            'Fannie Hurst': 27,
            'Edna Ferber': 25,
            'Alice Duer Miller': 22,
            'Gene Stratton-Porter': 21
        };
        
        authors.forEach(author => {
            nodes.push({
                id: `author_${author}`,
                label: author,
                group: 'authors',
                shape: 'dot',
                size: 0.75 + authorFilmCounts[author] * 0.5,
                color: { background: '#8b0000', border: '#660000', highlight: { background: '#aa0000', border: '#880000' } },
                font: { color: '#1a1a1a', size: 16, face: 'EB Garamond', strokeWidth: 3, strokeColor: 'white' },
                title: `${author}\nTwenty-Timer Author\n${authorFilmCounts[author]} films adapted`,
                borderWidth: 3,
                borderWidthSelected: 4
            });
        });
        
        // Directors (blue nodes)
        networkData.cross_directors.forEach(director => {
            nodes.push({
                id: `director_${director.name}`,
                label: director.name,
                group: 'directors',
                shape: 'dot',
                size: 0.75 + director.author_count * 6,
                color: { background: '#1f4e79', border: '#0f2e49', highlight: { background: '#2f5e89', border: '#1f3e59' } },
                font: { color: '#4a4a4a', size: 12, face: 'EB Garamond', strokeWidth: 2, strokeColor: 'white' },
                title: `${director.name}\nDirector\nWorked with ${director.author_count} Twenty-Timer${director.author_count > 1 ? 's' : ''}\n${director.authors.join(', ')}`,
                borderWidth: 2,
                borderWidthSelected: 3
            });
            
            // Create edges between directors and authors
            director.authors.forEach(author => {
                edges.push({
                    from: `director_${director.name}`,
                    to: `author_${author}`,
                    color: { color: '#b2b2b2ff' },
                    width: 1.5
                });
            });
        });
        
        // Writers (green nodes)
        networkData.cross_writers.forEach(writer => {
            nodes.push({
                id: `writer_${writer.name}`,
                label: writer.name,
                group: 'writers',
                shape: 'dot',
                size: 0.75 + writer.author_count * 6,
                color: { background: '#2d5a2d', border: '#1d3a1d', highlight: { background: '#3d6a3d', border: '#2d4a2d' } },
                font: { color: '#4a4a4a', size: 12, face: 'EB Garamond', strokeWidth: 2, strokeColor: 'white' },
                title: `${writer.name}\nScreenwriter\nAdapted ${writer.author_count} Twenty-Timer${writer.author_count > 1 ? 's' : ''}\n${writer.authors.join(', ')}`,
                borderWidth: 2,
                borderWidthSelected: 3
            });
            
            // Create edges between writers and authors
            writer.authors.forEach(author => {
                edges.push({
                    from: `writer_${writer.name}`,
                    to: `author_${author}`,
                    color: { color: '#b2b2b2ff' },
                    width: 1.5
                });
            });
        });
        
        // Studios (purple nodes) - only show top studios to avoid clutter
        networkData.cross_studios.slice(0, 6).forEach(studio => {
            nodes.push({
                id: `studio_${studio.name}`,
                label: studio.name,
                group: 'studios',
                shape: 'square',
                size: 0.5 + studio.author_count * 3,
                color: { background: '#663366', border: '#442244', highlight: { background: '#773377', border: '#553355' } },
                font: { color: '#4a4a4a', size: 12, face: 'EB Garamond', strokeWidth: 2, strokeColor: 'white' },
                title: `${studio.name} (studio).\nProduced films from ${studio.author_count} Twenty-Timer${studio.author_count > 1 ? 's' : ''}: \n${studio.authors.join(', ')}`,
                borderWidth: 2,
                borderWidthSelected: 3
            });
            
            // Create edges between studios and authors
            studio.authors.forEach(author => {
                edges.push({
                    from: `studio_${studio.name}`,
                    to: `author_${author}`,
                    color: { color: '#b2b2b2ff' },
                    width: 1
                });
            });
        });
        
        // Create the network
        const data = { nodes, edges };
        const options = {
            physics: {
                enabled: true,
                stabilization: { 
                    iterations: 200,
                    updateInterval: 10
                },
                barnesHut: {
                    gravitationalConstant: -4000,
                    centralGravity: 0.3,
                    springLength: 200,
                    springConstant: 0.05,
                    damping: 0.1,
                    avoidOverlap: 0.5
                }
            },
            interaction: {
                hover: true,
                dragNodes: true,
                dragView: true,
                zoomView: true,
                tooltipDelay: 200,
                hideEdgesOnDrag: true,
                hideEdgesOnZoom: false
            },
            layout: {
                improvedLayout: true,
                randomSeed: 42
            },
            nodes: {
                chosen: {
                    node: function(values, nodeId, selected, hovering) {
                        if (hovering) {
                            values.size = values.size * 1.2;
                        }
                    },
                    label: function(values, nodeId, selected, hovering) {
                        if (hovering) {
                            values.size = values.size + 5;
                        }
                    }
                }
            },
            edges: {
                smooth: {
                    type: 'continuous',
                    roundness: 0.5
                },
                color: {
                    color: '#b2b2b2ff',
                    highlight: '#b2b2b2ff',
                    hover: '#b2b2b2ff',
                    opacity: 0.6
                },
                width: 1,
                selectionWidth: 1.75,
                hoverWidth: 1.5
            }
        };
        
        const network = new vis.Network(container, data, options);
        
        // Add zoom-based label visibility
        network.on('zoom', function() {
            const scale = network.getScale();
            
            // Update label visibility based on zoom level
            const updatedNodes = nodes.map(node => {
                const updateNode = { id: node.id };
                
                // Authors always show labels
                if (node.group === 'authors') {
                    updateNode.font = { 
                        size: Math.max(12, Math.min(18, 14 * scale)),
                        color: '#1a1a1a',
                        face: 'EB Garamond',
                        strokeWidth: 3,
                        strokeColor: 'white'
                    };
                } 
                // Other nodes show labels only when zoomed in
                else if (scale > 0.7) {
                    updateNode.font = { 
                        size: Math.max(10, Math.min(14, 11 * scale)),
                        color: '#4a4a4a',
                        face: 'Source Sans 3',
                        strokeWidth: 2,
                        strokeColor: 'white'
                    };
                } else {
                    // Hide labels when zoomed out
                    updateNode.label = '';
                }
                
                return updateNode;
            });
            
            // Apply the updates
            data.nodes.update(updatedNodes);
        });
        
    } catch (error) {
        console.error('Error loading network data:', error);
        container.innerHTML = '<p style="text-align: center; color: #767676; font-style: italic; padding: 50px;">Network visualization loading...</p>';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initTwentyTimers);