// mary-pickford.js - JavaScript for Mary Pickford pattern page

// Load the data and initialize visualizations
async function initMaryPickford() {
    try {
        // Create publication timeline visualization
        createPublicationTimeline();
        
    } catch (error) {
        console.error('Error initializing Mary Pickford visualizations:', error);
    }
}

// Create publication timeline visualization using Chart.js
function createPublicationTimeline() {
    const container = document.getElementById('publicationTimelineViz');
    if (!container) return;
    
    // Clear container and create canvas
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.style.maxHeight = '600px';
    container.appendChild(canvas);
    
    // Mary Pickford adaptation data
    const adaptationData = [
        { film_title: "Ramona", release_year: 1910, work_title: "Ramona", publication_year: 1884 },
        { film_title: "In the Bishop's Carriage", release_year: 1913, work_title: "In the Bishop's Carriage", publication_year: 1904 },
        { film_title: "The Eagle's Mate", release_year: 1914, work_title: "The Eagle's Mate", publication_year: 1914 },
        { film_title: "Tess of the Storm Country", release_year: 1914, work_title: "Tess of the Storm Country", publication_year: 1909 },
        { film_title: "The Dawn of a Tomorrow", release_year: 1915, work_title: "The Dawn of a Tomorrow", publication_year: 1905 },
        { film_title: "Esmeralda", release_year: 1915, work_title: "Esmeralda", publication_year: 1877 },
        { film_title: "Rags", release_year: 1915, work_title: "Rags", publication_year: 1915 },
        { film_title: "A Little Princess", release_year: 1917, work_title: "Sara Crewe; or, What Happened at Miss Minchin's", publication_year: 1887 },
        { film_title: "Rebecca of Sunnybrook Farm", release_year: 1917, work_title: "Rebecca of Sunnybrook Farm", publication_year: 1903 },
        { film_title: "The Poor Little Rich Girl", release_year: 1917, work_title: "The Poor Little Rich Girl", publication_year: 1912 },
        { film_title: "Amarilly of Clothes-Line Alley", release_year: 1918, work_title: "Amarilly of Clothes-Line Alley", publication_year: 1915 },
        { film_title: "How Could You, Jean?", release_year: 1918, work_title: "How Could You Jean?", publication_year: 1917 },
        { film_title: "Daddy-Long-Legs", release_year: 1919, work_title: "Daddy-Long-Legs", publication_year: 1912 },
        { film_title: "The Hoodlum", release_year: 1919, work_title: "Burkeses Amy", publication_year: 1915 },
        { film_title: "Pollyanna", release_year: 1920, work_title: "Pollyanna", publication_year: 1913 },
        { film_title: "Little Lord Fauntleroy", release_year: 1921, work_title: "Little Lord Fauntleroy", publication_year: 1885 },
        { film_title: "Tess of the Storm Country", release_year: 1922, work_title: "Tess of the Storm Country", publication_year: 1909 },
        { film_title: "My Best Girl", release_year: 1927, work_title: "My Best Girl", publication_year: 1927 }
    ];
    
    // Prepare data for scatter plot (x = film release, y = publication)
    const scatterData = adaptationData.map(d => ({
        x: d.release_year,
        y: d.publication_year,
        film_title: d.film_title,
        work_title: d.work_title,
        yearGap: d.release_year - d.publication_year
    }));
    
    // Create datasets for different gap categories for color coding (3 categories)
    const datasets = [
        {
            label: 'Contemporary (0-5 years)',
            data: scatterData.filter(d => d.yearGap >= 0 && d.yearGap <= 5),
            backgroundColor: 'rgba(139, 0, 0, 0.9)',
            borderColor: '#8b0000',
            borderWidth: 2,
            pointRadius: 7,
            pointHoverRadius: 9
        },
        {
            label: 'Recent (6-15 years)',
            data: scatterData.filter(d => d.yearGap > 5 && d.yearGap <= 15),
            backgroundColor: 'rgba(139, 0, 0, 0.7)',
            borderColor: '#8b0000',
            borderWidth: 2,
            pointRadius: 7,
            pointHoverRadius: 9
        },
        {
            label: 'Classic (16+ years)',
            data: scatterData.filter(d => d.yearGap > 15),
            backgroundColor: 'rgba(139, 0, 0, 0.5)',
            borderColor: '#8b0000',
            borderWidth: 2,
            pointRadius: 7,
            pointHoverRadius: 9
        }
    ];
    
    // Add diagonal reference line dataset
    datasets.push({
        label: 'Same Year Line',
        type: 'line',
        data: [
            { x: 1908, y: 1908 },
            { x: 1930, y: 1930 }
        ],
        borderColor: 'rgba(0, 0, 0, 0.3)',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
        showLine: true,
        tension: 0,
        order: 99 // Draw behind other elements
    });
    
    new Chart(canvas, {
        type: 'scatter',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Mary Pickford\'s Adaptation Timeline',
                    font: {
                        size: 18,
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
                            size: 12
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        filter: function(item, chart) {
                            return item.text !== 'Same Year Line';
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const point = context[0].raw;
                            return point.film_title + ' (' + point.x + ')';
                        },
                        label: function(context) {
                            const point = context.raw;
                            const yearGap = point.yearGap;
                            let gapText = yearGap === 0 ? 'Same year' : yearGap + ' year' + (yearGap === 1 ? '' : 's') + ' later';
                            return [
                                'Source: ' + point.work_title,
                                'Published: ' + point.y,
                                'Time gap: ' + gapText
                            ];
                        }
                    },
                    displayColors: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 6
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    min: 1908,
                    max: 1930,
                    ticks: {
                        stepSize: 2,
                        callback: function(value) {
                            return value.toString();
                        },
                        font: {
                            family: "'Source Sans 3', sans-serif",
                            size: 11
                        },
                        color: '#767676'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                        display: true,
                        text: 'Film Release Year',
                        font: {
                            family: "'Source Sans 3', sans-serif",
                            size: 13,
                            weight: 600
                        },
                        color: '#4a4a4a'
                    }
                },
                y: {
                    type: 'linear',
                    min: 1870,
                    max: 1930,
                    ticks: {
                        stepSize: 10,
                        callback: function(value) {
                            return value.toString();
                        },
                        font: {
                            family: "'Source Sans 3', sans-serif",
                            size: 11
                        },
                        color: '#767676'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                        display: true,
                        text: 'Publication Year',
                        font: {
                            family: "'Source Sans 3', sans-serif",
                            size: 13,
                            weight: 600
                        },
                        color: '#4a4a4a'
                    }
                }
            }
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initMaryPickford);

// Add this to your mary-pickford.js temporarily for testing
document.addEventListener('DOMContentLoaded', function() {
    // Replace broken images with placeholders for testing
    const images = document.querySelectorAll('.gallery-item img');
    images.forEach(img => {
        img.onerror = function() {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgUGxhY2Vob2xkZXI8L3RleHQ+PC9zdmc+';
        };
    });
});