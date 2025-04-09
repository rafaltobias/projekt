function processTimestamps(timestamps, period) {
    const now = new Date();
    const results = new Map();
    
    switch(period) {
        case '1d':
            for (let i = 0; i < 24; i++) {
                const hour = i.toString().padStart(2, '0') + ':00';
                results.set(hour, 0);
            }
            
            timestamps.forEach(timestamp => {
                const date = new Date(timestamp);
                if (now - date <= 24 * 60 * 60 * 1000) {
                    const hour = date.getHours().toString().padStart(2, '0') + ':00';
                    results.set(hour, (results.get(hour) || 0) + 1);
                }
            });
            break;
            
        case '7d':
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
            
            timestamps.forEach(timestamp => {
                const date = new Date(timestamp);
                if (now - date <= 7 * 24 * 60 * 60 * 1000) {
                    let dayIndex = date.getDay() - 1;
                    if (dayIndex === -1) dayIndex = 6;
                    const day = daysOrdered[dayIndex];
                    results.set(day, (results.get(day) || 0) + 1);
                }
            });
            break;
            
        case '30d':
            for (let i = 0; i >= 0; i--) {
                const weekLabel = `Tydzień ${i + 1}`;
                results.set(weekLabel, 0);
            }
            
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
    
    return Array.from(results).map(([period, count]) => ({ period, count }));
}

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();

        const commonConfig = {
            responsive: true,
            displayModeBar: false,
            displaylogo: false
        };

        document.getElementById('totalVisits').textContent = stats.totalVisits || 'Brak danych';
        document.getElementById('uniqueVisitors').textContent = stats.uniqueVisitors || 'Brak danych';

        function createPieChart(data, containerId, title, defaultLabel = 'Nieznane') {
            if (!data || !data.length) {
                document.getElementById(containerId).innerHTML = 
                    '<p class="text-center text-gray-600">Brak danych do wyświetlenia wykresu</p>';
                return;
            }
            const sortedData = data.sort((a, b) => b.count - a.count);
            const topCategories = sortedData.slice(0, 5);
            const otherCategories = sortedData.slice(5);
            
            if (otherCategories.length > 0) {
                const otherCount = otherCategories.reduce((sum, item) => sum + item.count, 0);
                topCategories.push({
                    referrer: 'Inne', // lub użyj odpowiedniego pola, np. 'browser'
                    count: otherCount
                });
            }
            const chartData = [{
                labels: data.map(item => item.referrer || item.browser || defaultLabel),
                values: data.map(item => item.count),
                type: 'pie'
            }];
        
            const layout = {
                title: title,
                showlegend: false, // Disables the legend
                font: { family: 'system-ui, -apple-system, sans-serif' },
                legend: {
                    orientation: 'h', // Horizontal legend
                    traceorder: 'normal', // Left-to-right order
                    x: 0, // Align legend to the left
                    y: -0.5, // Position legend below the chart
                    xanchor: 'left',
                    yanchor: 'top',
                    font: { size: 8 } // Reduce font size for better fit
                },
                margin: { t: 50, b: 100 } // Adjust margins for legend space
            };
        
            Plotly.newPlot(containerId, chartData, layout, {
                responsive: true,
                displayModeBar: false,
                displaylogo: false,
            });
        }
        
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
                marker: { color: color },
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
                margin: { b: 100 },
                legend: {
                    orientation: 'h', 
                    traceorder: 'normal', 
                    x: 0, 
                    y: -0.5, // Position legend below the chart
                    xanchor: 'left',
                    yanchor: 'top',
                    font: { size: 8 } // Reduce font size for better fit
                }
            };
        
            Plotly.newPlot(containerId, chartData, layout, {
                responsive: true,
                displayModeBar: false,
                displaylogo: false
            });
        }
        function createLineChart(data, containerId, title, xAxisTitle, yAxisTitle, color = '#3B82F6') {
            if (!data || !data.length) {
                document.getElementById(containerId).innerHTML = 
                    '<p class="text-center text-gray-600">Brak danych do wyświetlenia wykresu</p>';
                return;
            }
        
            const chartData = [{
                x: data.map(item => item.period),
                y: data.map(item => item.count || 0),
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: color },
                connectgaps: true
            }];
        
            const layout = {
                title: title,
                font: { family: 'system-ui, -apple-system, sans-serif' },
                xaxis: {
                    title: xAxisTitle,
                    tickangle: -45
                },
                yaxis: {
                    title: yAxisTitle
                },
                margin: { b: 100 }
            };
        
            Plotly.newPlot(containerId, chartData, layout, commonConfig);
        }

        createPieChart(stats.referrers, 'referrersChart', 'Źródła odwiedzin', 'Bezpośrednie');
        createPieChart(stats.browsers, 'browsersChart', 'Przeglądarki', 'Nieznana');
        createBarChart(stats.topPages, 'topPagesChart', 
            'Liczba odwiedzin stron', 'Strona', 'Liczba odwiedzin');

        createPieChart(stats.referrers, 'referrersChart', 
            'Źródła odwiedzin', 'Bezpośrednie');

        createPieChart(stats.browsers, 'browsersChart', 
            'Przeglądarki', 'Nieznana');

         createBarChart(stats.countryStats, 'countryStatsChart',
            'Odwiedziny według krajów', 'Kraj', 'Liczba odwiedzin');

        createBarChart(stats.entryPages, 'entryPagesChart',
            'Strony wejściowe', 'Strona', 'Liczba wejść', '#10B981');

        createBarChart(stats.exitPages, 'exitPagesChart',
            'Strony wyjściowe', 'Strona', 'Liczba wyjść', '#EF4444');

        if (stats.timestamps) {
            stats.visitTimes = {
                '1d': processTimestamps(stats.timestamps, '1d'),
                '7d': processTimestamps(stats.timestamps, '7d'),
                '30d': processTimestamps(stats.timestamps, '30d')
            };
        }

        function updateVisitTimeChart(period) {
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

            createLineChart(
                visitTimes,
                'visitTimeChart',
                `Liczba odwiedzin (${periodLabels[period]})`,
                'Okres',
                'Liczba odwiedzin'
            );
        }

        document.getElementById('btn1d').addEventListener('click', () => updateVisitTimeChart('1d'));
        document.getElementById('btn7d').addEventListener('click', () => updateVisitTimeChart('7d'));
        document.getElementById('btn30d').addEventListener('click', () => updateVisitTimeChart('30d'));

        updateVisitTimeChart('1d');
    } catch (error) {
        console.error('Error loading stats:', error);
        document.getElementById('visitTimeChart').innerHTML = 
            '<p class="text-center text-gray-600">Wystąpił błąd podczas ładowania danych</p>';
    }
}

window.onload = loadStats;

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

async function exportData() {
    let days = document.querySelector('input[name="days"]:checked').value;
    if (days === 'custom') {
        days = document.getElementById('customDays').value;
    }

    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10);
    const filename = `stats_${formattedDate}_${days}.csv`;

    try {
        const response = await fetch(`/api/exportStats?days=${days}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvData = await response.text();

        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error exporting data. See console for details.');
    }
}

document.getElementById('exportDataBtn').addEventListener('click', exportData);

document.addEventListener('DOMContentLoaded', () => {
    const customRadio = document.getElementById('custom');
    const customDaysInput = document.getElementById('customDays');

    customRadio.addEventListener('change', () => {
        customDaysInput.disabled = !customRadio.checked;
    });
});