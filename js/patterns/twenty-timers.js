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
        createNetworkGraphCytoscape();
        
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

// Create network legend
function createNetworkLegend(container) {
    // Create a wrapper that will contain both the legend and the chart
    const wrapperDiv = document.createElement('div');
    wrapperDiv.style.cssText = `
        display: flex;
        gap: 20px;
        align-items: flex-start;
    `;
    
    // Create legend element
    const legendDiv = document.createElement('div');
    legendDiv.className = 'network-legend';
    legendDiv.style.cssText = `
        flex-shrink: 0;
        width: 200px;
        margin-top: 20px;
        padding: 15px; 
        background: #fafaf7;  
        border: 1px solid #e6e6e6;
        font-family: 'Source Sans 3', sans-serif;
        font-size: 13px;
        height: fit-content;
    `;
    
    legendDiv.innerHTML = `
        <div class="legend-title" style="
            text-align: center; 
            font-weight: 600; 
            margin-bottom: 15px; 
            color: #1a1a1a;
            font-family: 'EB Garamond', serif;
            font-size: 16px;
        ">Network Legend</div>
        
        <div class="legend-item" style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <div style="
                width: 20px; 
                height: 20px; 
                background: #8b0000; 
                border: 2px solid #660000; 
                border-radius: 50%;
                flex-shrink: 0;
            "></div>
            <span style="color: #1a1a1a; font-weight: 500;">Twenty-Timer Authors</span>
        </div>
        
        <div class="legend-item" style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <div style="
                width: 16px; 
                height: 16px; 
                background: #1f4e79; 
                border: 2px solid #0f2e49; 
                border-radius: 50%;
                flex-shrink: 0;
            "></div>
            <span style="color: #4a4a4a;">Directors</span>
        </div>
        
        <div class="legend-item" style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <div style="
                width: 16px; 
                height: 16px; 
                background: #2d5a2d; 
                border: 2px solid #1d3a1d; 
                border-radius: 50%;
                flex-shrink: 0;
            "></div>
            <span style="color: #4a4a4a;">Screenwriters</span>
        </div>
        
        <div class="legend-item" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
            <div style="
                width: 16px; 
                height: 16px; 
                background: #663366; 
                border: 2px solid #442244; 
                border-radius: 3px;
                flex-shrink: 0;
            "></div>
            <span style="color: #4a4a4a;">Studios</span>
        </div>
        
        <div class="legend-note" style="
            font-size: 11px; 
            color: #767676; 
            font-style: italic; 
            line-height: 1.3;
            padding-top: 10px;
            border-top: 1px solid #d4d4d4;
        ">Node size indicates collaboration frequency.<br><br>• Click nodes to highlight connections<br>• Double-click to focus<br>• Scroll or pinch to zoom</div>
    `;
    
    // Find the layout controls (they should be right before the container)
    const layoutControls = container.previousElementSibling;
    
    // Wrap the original container, but keep layout controls above
    container.parentNode.insertBefore(wrapperDiv, container);
    wrapperDiv.appendChild(legendDiv);
    wrapperDiv.appendChild(container);
    
    // Move layout controls to be above the wrapper
    if (layoutControls && layoutControls.classList.contains('layout-controls')) {
        wrapperDiv.parentNode.insertBefore(layoutControls, wrapperDiv);
    }
    
    // Adjust container to take remaining space
    container.style.flex = '1';
    container.style.minHeight = '500px';
}

// Create layout control panel
function createLayoutControls(container) {
    // Store reference to the original container for later use
    container._originalParent = container.parentNode;
    
    const controlsHtml = `
        <div class="layout-controls" style="
            margin-bottom: 15px; 
            display: flex; 
            justify-content: center; 
            gap: 10px; 
            font-family: 'Source Sans 3', sans-serif;
            font-size: 14px;
        ">
            <span style="color: #4a4a4a; margin-right: 10px; align-self: center;">Layout:</span>
            <button class="layout-btn active" data-layout="cose" style="
                padding: 8px 16px; 
                border: 1px solid #8b0000; 
                background: #8b0000; 
                color: #fafaf7;  
                cursor: pointer;
                transition: all 0.2s ease;
            ">Default</button>
            <button class="layout-btn" data-layout="circle" style="
                padding: 8px 16px; 
                border: 1px solid #8b0000; 
                background: #fafaf7; 
                color: #8b0000;  
                cursor: pointer;
                transition: all 0.2s ease;
            ">Circular</button>
            <button class="layout-btn" data-layout="grid" style="
                padding: 8px 16px; 
                border: 1px solid #8b0000; 
                background: #fafaf7; 
                color: #8b0000;  
                cursor: pointer;
                transition: all 0.2s ease;
            ">Grid</button>
            <button class="reset-btn" style="
                padding: 8px 16px; 
                border: 1px solid #1a1a1a; 
                background: #fafaf7; 
                color: #1a1a1a;  
                cursor: pointer;
                transition: all 0.2s ease;
            ">Reset View</button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforebegin', controlsHtml);
}

// Add layout control event handlers
function addLayoutControls(cy) {
    const layoutButtons = document.querySelectorAll('.layout-btn');
    
    // Define layout configurations
    const layouts = {
        cose: {
            name: 'cose',
            animate: true,
            animationDuration: 1000,
            animationEasing: 'ease-out',
            padding: 50,
            nodeRepulsion: 400000,
            nodeOverlap: 20,
            idealEdgeLength: 100,
            edgeElasticity: 100,
            nestingFactor: 5,
            gravity: 80,
            numIter: 1000,
            initialTemp: 200,
            coolingFactor: 0.95,
            minTemp: 1.0
        },
        circle: {
            name: 'circle',
            animate: true,
            animationDuration: 800,
            animationEasing: 'ease-in-out',
            padding: 50,
            radius: 200,
            startAngle: 0,
            sweep: Math.PI * 2,
            clockwise: true,
            sort: function(a, b) {
                // Sort by node type priority: authors first
                const aType = a.data('type');
                const bType = b.data('type');
                const typePriority = { 'author': 0, 'director': 1, 'writer': 2, 'studio': 3 };
                return typePriority[aType] - typePriority[bType];
            }
        },
        grid: {
            name: 'grid',
            animate: true,
            animationDuration: 800,
            animationEasing: 'ease-in-out',
            padding: 50,
            rows: 4,
            cols: 6,
            sort: function(a, b) {
                // Sort by type and then alphabetically
                const aType = a.data('type');
                const bType = b.data('type');
                const typePriority = { 'author': 0, 'director': 1, 'writer': 2, 'studio': 3 };
                if (typePriority[aType] !== typePriority[bType]) {
                    return typePriority[aType] - typePriority[bType];
                }
                return a.data('label').localeCompare(b.data('label'));
            }
        }
    };
    
    // Add click handlers for layout buttons
    layoutButtons.forEach(button => {
        button.addEventListener('click', function() {
            const layoutName = this.getAttribute('data-layout');
            
            // Update button styles
            layoutButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.background = '#fafaf7';
                btn.style.color = '#8b0000';
            });
            
            this.classList.add('active');
            this.style.background = '#8b0000';
            this.style.color = '#fafaf7';
            
            // Apply the new layout
            cy.layout(layouts[layoutName]).run();
        });
        
        // Add hover effects
        button.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.background = '#e6e6e6';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.background = '#fafaf7';
            }
        });
    });
    
    // Add reset button functionality
    const resetButton = document.querySelector('.reset-btn');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            console.log('Reset button clicked'); // Debug log
            try {
                // Reset highlighting
                cy.elements().removeClass('highlighted dimmed');
                
                // Reset layout to default (cose)
                const layoutButtons = document.querySelectorAll('.layout-btn');
                layoutButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.background = '#fafaf7';
                    btn.style.color = '#8b0000';
                });
                
                const defaultButton = document.querySelector('.layout-btn[data-layout="cose"]');
                if (defaultButton) {
                    defaultButton.classList.add('active');
                    defaultButton.style.background = '#8b0000';
                    defaultButton.style.color = '#fafaf7';
                }
                
                // Apply cose layout
                const layouts = {
                    cose: {
                        name: 'cose',
                        animate: true,
                        animationDuration: 1000,
                        animationEasing: 'ease-out',
                        padding: 50,
                        nodeRepulsion: 400000,
                        nodeOverlap: 20,
                        idealEdgeLength: 100,
                        edgeElasticity: 100,
                        nestingFactor: 5,
                        gravity: 80,
                        numIter: 1000,
                        initialTemp: 200,
                        coolingFactor: 0.95,
                        minTemp: 1.0
                    }
                };
                
                cy.layout(layouts.cose).run();
                
                // Reset zoom and pan to fit all elements after layout is done
                setTimeout(() => {
                    cy.animate({
                        fit: {
                            eles: cy.elements(),
                            padding: 50
                        },
                        duration: 500,
                        easing: 'ease-out'
                    });
                }, 1000);
            } catch (error) {
                console.error('Error in reset button:', error);
            }
        });
        
        // Add hover effects for reset button
        resetButton.addEventListener('mouseenter', function() {
            this.style.background = '#e6e6e6';
        });
        
        resetButton.addEventListener('mouseleave', function() {
            this.style.background = '#fafaf7';
        });
    }
}

// Create network visualization with Cytoscape.js
async function createNetworkGraphCytoscape() {
    const container = document.getElementById('networkViz');
    if (!container) return;
    
    try {
        // Load the network data
        const response = await fetch('../data/twenty-timers-creative-networks.json');
        if (!response.ok) {
            throw new Error('Failed to load network data');
        }
        
        const networkData = await response.json();
        
        // Create layout controls first (above everything)
        createLayoutControls(container);
        // Create legend (will be beside the chart)
        createNetworkLegend(container);
        
        // Convert data to Cytoscape elements array format
        const elements = [];
        
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
            elements.push({
                data: {
                    id: `author_${author}`,
                    label: author,
                    type: 'author',
                    films: authorFilmCounts[author],
                    tooltip: `${author}\nTwenty-Timer Author\n${authorFilmCounts[author]} films adapted`
                }
            });
        });
        
        // Directors (blue nodes)
        networkData.cross_directors.forEach(director => {
            elements.push({
                data: {
                    id: `director_${director.name}`,
                    label: director.name,
                    type: 'director',
                    collaborations: director.author_count,
                    tooltip: `${director.name}\nDirector\nWorked with ${director.author_count} Twenty-Timer${director.author_count > 1 ? 's' : ''}\n${director.authors.join(', ')}`
                }
            });
            
            // Create edges between directors and authors
            director.authors.forEach(author => {
                elements.push({
                    data: {
                        source: `director_${director.name}`,
                        target: `author_${author}`
                    }
                });
            });
        });
        
        // Writers (green nodes)
        networkData.cross_writers.forEach(writer => {
            elements.push({
                data: {
                    id: `writer_${writer.name}`,
                    label: writer.name,
                    type: 'writer',
                    collaborations: writer.author_count,
                    tooltip: `${writer.name}\nScreenwriter\nAdapted ${writer.author_count} Twenty-Timer${writer.author_count > 1 ? 's' : ''}\n${writer.authors.join(', ')}`
                }
            });
            
            // Create edges between writers and authors
            writer.authors.forEach(author => {
                elements.push({
                    data: {
                        source: `writer_${writer.name}`,
                        target: `author_${author}`
                    }
                });
            });
        });
        
        // Studios (purple nodes) - only show top studios to avoid clutter
        networkData.cross_studios.slice(0, 6).forEach(studio => {
            elements.push({
                data: {
                    id: `studio_${studio.name}`,
                    label: studio.name,
                    type: 'studio',
                    films: studio.author_count,
                    tooltip: `${studio.name}\nStudio\nProduced films from ${studio.author_count} Twenty-Timer${studio.author_count > 1 ? 's' : ''}\n${studio.authors.join(', ')}`
                }
            });
            
            // Create edges between studios and authors
            studio.authors.forEach(author => {
                elements.push({
                    data: {
                        source: `studio_${studio.name}`,
                        target: `author_${author}`
                    }
                });
            });
        });
        
        // Initialize Cytoscape with proper styling
        const cy = cytoscape({
            container: container,
            elements: elements,
            style: [
                // Author nodes (red, circular)
                {
                    selector: 'node[type="author"]',
                    style: {
                        'background-color': '#8b0000',
                        'border-color': '#660000',
                        'border-width': 3,
                        'label': 'data(label)',
                        'text-valign': 'bottom',
                        'text-margin-y': 8,
                        'font-family': 'EB Garamond, serif',
                        'font-size': 16,
                        'color': '#1a1a1a',
                        'text-outline-width': 3,
                        'text-outline-color': '#fffff8',
                        'width': function(ele) {
                            return 8 + (ele.data('films') * 0.8);
                        },
                        'height': function(ele) {
                            return 8 + (ele.data('films') * 0.8);
                        }
                    }
                },
                // Director nodes (blue, circular)
                {
                    selector: 'node[type="director"]',
                    style: {
                        'background-color': '#1f4e79',
                        'border-color': '#0f2e49',
                        'border-width': 2,
                        'label': 'data(label)',
                        'text-valign': 'bottom',
                        'text-margin-y': 6,
                        'font-family': 'Source Sans 3, sans-serif',
                        'font-size': 12,
                        'color': '#4a4a4a',
                        'text-outline-width': 2,
                        'text-outline-color': '#fffff8',
                        'width': function(ele) {
                            return 5 + (ele.data('collaborations') * 4);
                        },
                        'height': function(ele) {
                            return 5 + (ele.data('collaborations') * 4);
                        }
                    }
                },
                // Writer nodes (green, circular)
                {
                    selector: 'node[type="writer"]',
                    style: {
                        'background-color': '#2d5a2d',
                        'border-color': '#1d3a1d',
                        'border-width': 2,
                        'label': 'data(label)',
                        'text-valign': 'bottom',
                        'text-margin-y': 6,
                        'font-family': 'Source Sans 3, sans-serif',
                        'font-size': 12,
                        'color': '#4a4a4a',
                        'text-outline-width': 2,
                        'text-outline-color': '#fffff8',
                        'width': function(ele) {
                            return 5 + (ele.data('collaborations') * 4);
                        },
                        'height': function(ele) {
                            return 5 + (ele.data('collaborations') * 4);
                        }
                    }
                },
                // Studio nodes (purple, rectangular)
                {
                    selector: 'node[type="studio"]',
                    style: {
                        'background-color': '#663366',
                        'border-color': '#442244',
                        'border-width': 2,
                        'shape': 'rectangle',
                        'label': 'data(label)',
                        'text-valign': 'bottom',
                        'text-margin-y': 6,
                        'font-family': 'Source Sans 3, sans-serif',
                        'font-size': 12,
                        'color': '#4a4a4a',
                        'text-outline-width': 2,
                        'text-outline-color': '#fffff8',
                        'width': function(ele) {
                            return 5 + (ele.data('films') * 3);
                        },
                        'height': function(ele) {
                            return 5 + (ele.data('films') * 3);
                        }
                    }
                },
                // Edges
                {
                    selector: 'edge',
                    style: {
                        'width': 1.5,
                        'line-color': '#b2b2b2',
                        'target-arrow-color': '#b2b2b2',
                        'curve-style': 'straight',
                        'opacity': 0.6
                    }
                },
                // Highlighted nodes
                {
                    selector: 'node.highlighted',
                    style: {
                        'border-width': 4,
                        'z-index': 999
                    }
                },
                // Dimmed nodes
                {
                    selector: 'node.dimmed',
                    style: {
                        'opacity': 0.3
                    }
                },
                // Highlighted edges
                {
                    selector: 'edge.highlighted',
                    style: {
                        'width': 2.5,
                        'opacity': 1,
                        'z-index': 999
                    }
                },
                // Dimmed edges
                {
                    selector: 'edge.dimmed',
                    style: {
                        'opacity': 0.1
                    }
                }
            ],
            layout: {
                name: 'cose',
                animate: true,
                animationDuration: 1000,
                animationEasing: 'ease-out',
                padding: 50,
                nodeRepulsion: 400000,
                nodeOverlap: 20,
                idealEdgeLength: 100,
                edgeElasticity: 100,
                nestingFactor: 5,
                gravity: 80,
                numIter: 1000,
                initialTemp: 200,
                coolingFactor: 0.95,
                minTemp: 1.0
            },
            minZoom: 0.3,
            maxZoom: 3,
            wheelSensitivity: 0.2
        });
        
        // Add interaction handlers
        // Click node: Highlight node + its immediate connections
        cy.on('tap', 'node', function(evt) {
            const node = evt.target;
            
            // Reset all styles first
            cy.elements().removeClass('highlighted dimmed');
            
            // Highlight clicked node and its neighborhood
            const neighborhood = node.closedNeighborhood();
            const others = cy.elements().difference(neighborhood);
            
            neighborhood.addClass('highlighted');
            others.addClass('dimmed');
        });
        
        // Click background: Reset highlighting
        cy.on('tap', function(evt) {
            if (evt.target === cy) {
                cy.elements().removeClass('highlighted dimmed');
            }
        });
        
        // Double-click node: Zoom to fit node and its neighborhood
        cy.on('dbltap', 'node', function(evt) {
            const node = evt.target;
            const neighborhood = node.closedNeighborhood();
            
            cy.animate({
                fit: {
                    eles: neighborhood,
                    padding: 50
                },
                duration: 500
            });
        });
        
        // Hover tooltip - matching Chart.js tooltip style
        let tooltipTimeout;
        
        // Create tooltip element once at initialization
        let tooltipEl = document.getElementById('cytoscape-tooltip');
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'cytoscape-tooltip';
            tooltipEl.style.cssText = `
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: #ffffff;
                padding: 10px 14px;
                border-radius: 6px;
                font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 13px;
                line-height: 1.4;
                pointer-events: none;
                z-index: 9999;
                white-space: pre-line;
                box-shadow: 0 2px 12px rgba(0,0,0,0.15);
                transition: opacity 0.15s ease;
                opacity: 0;
                display: none;
                max-width: 300px;
            `;
            document.body.appendChild(tooltipEl);
        }
        
        cy.on('mouseover', 'node', function(evt) {
            const node = evt.target;
            const tooltip = node.data('tooltip');
            
            // Clear any existing timeout
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
            }
            
            // Small delay before showing tooltip
            tooltipTimeout = setTimeout(() => {
                // Update tooltip content
                tooltipEl.innerHTML = tooltip.replace(/\n/g, '<br>');
                tooltipEl.style.display = 'block';
                tooltipEl.style.opacity = '0';
                
                // Force a reflow to ensure display:block takes effect before calculating dimensions
                tooltipEl.offsetHeight;
                
                // Get positions
                const renderedPosition = node.renderedPosition();
                const containerRect = container.getBoundingClientRect();
                
                // Calculate tooltip dimensions after it's visible
                const tooltipWidth = tooltipEl.offsetWidth;
                const tooltipHeight = tooltipEl.offsetHeight;
                
                // Calculate position (centered above node)
                let left = containerRect.left + renderedPosition.x - (tooltipWidth / 2) + window.pageXOffset;
                let top = containerRect.top + renderedPosition.y - tooltipHeight - 15 + window.pageYOffset;
                
                // Keep tooltip within viewport
                if (left < 10) left = 10;
                if (left + tooltipWidth > window.innerWidth - 10) {
                    left = window.innerWidth - tooltipWidth - 10;
                }
                if (top < window.pageYOffset + 10) {
                    // Show below if not enough space above
                    top = containerRect.top + renderedPosition.y + 25 + window.pageYOffset;
                }
                
                tooltipEl.style.left = left + 'px';
                tooltipEl.style.top = top + 'px';
                
                // Fade in
                requestAnimationFrame(() => {
                    tooltipEl.style.opacity = '1';
                });
            }, 200);
        });
        
        cy.on('mouseout', 'node', function() {
            // Clear timeout if mouse leaves before tooltip shows
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
            
            if (tooltipEl) {
                tooltipEl.style.opacity = '0';
                setTimeout(() => {
                    tooltipEl.style.display = 'none';
                }, 150);
            }
        });
        
        // Add zoom-based label visibility
        cy.on('zoom', function() {
            const zoom = cy.zoom();
            
            // Hide non-author labels when zoomed out
            if (zoom < 0.7) {
                cy.nodes('[type!="author"]').style('label', '');
            } else {
                cy.nodes('[type!="author"]').forEach(function(node) {
                    node.style('label', node.data('label'));
                });
            }
        });
        
        // Add layout switching functionality
        addLayoutControls(cy);
        
    } catch (error) {
        console.error('Error loading network data:', error);
        container.innerHTML = '<p style="text-align: center; color: #767676; font-style: italic; padding: 50px;">Network visualization loading...</p>';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initTwentyTimers);