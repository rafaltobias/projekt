function processTimestamps(timestamps, period) {
    const now = new Date();
    const results = new Map();
    
    switch(period) {
        case '1d':
            // Initialize all 24 hours first
            for (let i = 0; i < 24; i++) {
                const hour = i.toString().padStart(2, '0') + ':00';
                results.set(hour, 0);
            }
            
            // Count visits
            timestamps.forEach(timestamp => {
                const date = new Date(timestamp);
                if (now - date <= 24 * 60 * 60 * 1000) {
                    const hour = date.getHours().toString().padStart(2, '0') + ':00';
                    results.set(hour, (results.get(hour) || 0) + 1);
                }
            });
            break;
            
        case '7d':
            // Initialize all days first (starting from Monday)
            const daysOrdered = [
                'Poniedziałek', 
                'Wtorek', 
                'Środa', 
                'Czwartek', 
                'Piątek', 
                'Sobota', 
                'Niedziela'
            ];
            
            daysOrdered.forEach(day => {
                results.set(day, 0);
            });
            
            // Count visits
            timestamps.forEach(timestamp => {
                const date = new Date(timestamp);
                if (now - date <= 7 * 24 * 60 * 60 * 1000) {
                    // Convert Sunday (0) to 6 for proper indexing
                    let dayIndex = date.getDay() - 1;
                    if (dayIndex === -1) dayIndex = 6;
                    const day = daysOrdered[dayIndex];
                    results.set(day, (results.get(day) || 0) + 1);
                }
            });
            break;
            
        case '30d':
            // Initialize 4-5 weeks
            for (let i = 0; i >= 0; i--) {
                const weekLabel = `Tydzień ${i + 1}`;
                results.set(weekLabel, 0);
            }
            
            // Count visits
            timestamps.forEach(timestamp => {
                const date = new Date(timestamp);
                if (now - date <= 30 * 24 * 60 * 60 * 1000) {
                    const weekNumber = Math.ceil((now - date) / (7 * 24 * 60 * 60 * 1000));
                    const weekLabel = `Tydzień ${weekNumber}`;
                    if (weekNumber <= 5) {  // Only count up to 5 weeks
                        results.set(weekLabel, (results.get(weekLabel) || 0) + 1);
                    }
                }
            });
            break;
    }
    
    // Convert Map to array and sort properly
    return Array.from(results).map(([period, count]) => ({ period, count }));
}

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        console.log('Stats data:', stats);

        // Common chart configuration
        const commonConfig = {
            responsive: true,
            displayModeBar: false,
            displaylogo: false
        };

        // Update general stats
        document.getElementById('totalVisits').textContent = stats.totalVisits || 'Brak danych';
        document.getElementById('uniqueVisitors').textContent = stats.uniqueVisitors || 'Brak danych';

        // Helper function to create bar chart
        function createBarChart(data, containerId, title, xAxisTitle, yAxisTitle, color = '#3B82F6') {
            if (!data || !data.length) {
                document.getElementById(containerId).innerHTML = 
                    '<p class="text-center text-gray-600">Brak danych do wyświetlenia wykresu</p>';
                return;
            }

            const chartData = [{
                x: data.map(item => item.page_url || item.country || item.period),
                y: data.map(item => item.count || item.visits),
                type: 'bar',
                marker: { color: color }
            }];

            const layout = {
                title: title,
                font: { family: 'system-ui, -apple-system, sans-serif' },
                xaxis: {
                    title: xAxisTitle,
                    tickangle: -45,
                    tickmode: containerId === 'visitTimeChart' ? 'array' : 'auto',
                    ticktext: containerId === 'visitTimeChart' ? data.map(item => item.period) : undefined,
                    tickvals: containerId === 'visitTimeChart' ? data.map((_, i) => i) : undefined
                },
                yaxis: {
                    title: yAxisTitle
                },
                margin: { b: 100 }
            };

            Plotly.newPlot(containerId, chartData, layout, commonConfig);
        }

        // Helper function to create pie chart
        function createPieChart(data, containerId, title, defaultLabel = 'Nieznane') {
            if (!data || !data.length) {
                document.getElementById(containerId).innerHTML = 
                    '<p class="text-center text-gray-600">Brak danych do wyświetlenia wykresu</p>';
                return;
            }

            const chartData = [{
                labels: data.map(item => item.referrer || item.browser || defaultLabel),
                values: data.map(item => item.count),
                type: 'pie'
            }];

            const layout = {
                title: title,
                font: { family: 'system-ui, -apple-system, sans-serif' }
            };

            Plotly.newPlot(containerId, chartData, layout, commonConfig);
        }

        // Create charts
        createBarChart(stats.topPages, 'topPagesChart', 
            'Liczba odwiedzin stron', 'Strona', 'Liczba odwiedzin');

        createPieChart(stats.referrers, 'referrersChart', 
            'Źródła odwiedzin', 'Bezpośrednie');

        createPieChart(stats.browsers, 'browsersChart', 
            'Przeglądarki', 'Nieznana');

        createBarChart(stats.countryStats, 'countryStatsChart',
            'Odwiedziny według krajów', 'Kraj', 'Liczba odwiedzin');

        // Entry and exit pages charts
        createBarChart(stats.entryPages, 'entryPagesChart',
            'Strony wejściowe', 'Strona', 'Liczba wejść', '#10B981');

        createBarChart(stats.exitPages, 'exitPagesChart',
            'Strony wyjściowe', 'Strona', 'Liczba wyjść', '#EF4444');

        // Process timestamps for visit times
        if (stats.timestamps) {
            stats.visitTimes = {
                '1d': processTimestamps(stats.timestamps, '1d'),
                '7d': processTimestamps(stats.timestamps, '7d'),
                '30d': processTimestamps(stats.timestamps, '30d')
            };
        }

        // Function to update visit time chart
        function updateVisitTimeChart(period) {
            // Update button states
            const buttons = ['btn1d', 'btn7d', 'btn30d'];
            buttons.forEach(btnId => {
                const btn = document.getElementById(btnId);
                if (btn) {
                    btn.classList.remove('bg-blue-800');
                    btn.classList.add('bg-blue-600');
                    if (btnId === `btn${period}`) {
                        btn.classList.remove('bg-blue-600');
                        btn.classList.add('bg-blue-800');
                    }
                }
            });

            const visitTimes = stats.visitTimes[period];
            if (!visitTimes || visitTimes.length === 0) {
                document.getElementById('visitTimeChart').innerHTML = 
                    `<p class="text-center text-gray-600">Brak danych dla okresu ${period}</p>`;
                return;
            }

            const periodLabels = {
                '1d': 'ostatnie 24 godziny',
                '7d': 'ostatnie 7 dni',
                '30d': 'ostatnie 30 dni'
            };

            createBarChart(
                visitTimes,
                'visitTimeChart',
                `Liczba odwiedzin (${periodLabels[period]})`,
                'Okres',
                'Liczba odwiedzin'
            );
        }

        // Set up time period button listeners
        document.getElementById('btn1d').addEventListener('click', () => updateVisitTimeChart('1d'));
        document.getElementById('btn7d').addEventListener('click', () => updateVisitTimeChart('7d'));
        document.getElementById('btn30d').addEventListener('click', () => updateVisitTimeChart('30d'));

        // Initial load with 1-day period
        updateVisitTimeChart('1d');

    } catch (error) {
        console.error('Error loading stats:', error);
        document.getElementById('visitTimeChart').innerHTML = 
            '<p class="text-center text-gray-600">Wystąpił błąd podczas ładowania danych</p>';
    }
}

// Load stats on page load
window.onload = loadStats;

// Handle window resize for chart responsiveness
window.addEventListener('resize', function() {
    const chartIds = [
        'topPagesChart',
        'entryPagesChart',
        'exitPagesChart',
        'referrersChart',
        'browsersChart',
        'countryStatsChart',
        'visitTimeChart'
    ];
    
    chartIds.forEach(id => {
        if (document.getElementById(id)) {
            Plotly.Plots.resize(id);
        }
    });
});