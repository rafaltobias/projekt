async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();

        // Updating general data
        document.getElementById('totalVisits').textContent = stats.totalVisits || 'Brak danych';
        document.getElementById('uniqueVisitors').textContent = stats.uniqueVisitors || 'Brak danych';

        // Update top pages chart
        if (stats.topPages && stats.topPages.length > 0) {
            const pages = stats.topPages.map(page => page.page_url);
            const visits = stats.topPages.map(page => page.count);

            const chartData = [{
                x: pages,
                y: visits,
                type: 'bar',
                marker: {
                    color: '#3B82F6'
                }
            }];

            const layout = {
                title: 'Liczba odwiedzin stron',
                font: {
                    family: 'system-ui, -apple-system, sans-serif'
                },
                xaxis: {
                    title: 'Strona',
                    tickangle: -45
                },
                yaxis: {
                    title: 'Liczba odwiedzin'
                },
                margin: {
                    b: 100
                }
            };

            const config = {
                responsive: true,
                displayModeBar: false,
                displaylogo: false // Remove Plotly watermark
            };

            Plotly.newPlot('topPagesChart', chartData, layout, config);
        } else {
            document.getElementById('topPagesChart').innerHTML = '<p class="text-center text-gray-600">Brak danych do wyświetlenia wykresu</p>';
        }

        // Update referrers chart
        if (stats.referrers && stats.referrers.length > 0) {
            const sources = stats.referrers.map(ref => ref.referrer || 'Bezpośrednie');
            const sourceVisits = stats.referrers.map(ref => ref.count);

            const referrerData = [{
                labels: sources,
                values: sourceVisits,
                type: 'pie'
            }];

            const referrerLayout = {
                title: 'Źródła odwiedzin',
                font: {
                    family: 'system-ui, -apple-system, sans-serif'
                }
            };

            const referrerConfig = {
                responsive: true,
                displayModeBar: false,
                displaylogo: false // Remove Plotly watermark
            };

            Plotly.newPlot('referrersChart', referrerData, referrerLayout, referrerConfig);
        } else {
            document.getElementById('referrersChart').innerHTML = '<p class="text-center text-gray-600">Brak danych do wyświetlenia wykresu</p>';
        }

        // Update browsers chart
        if (stats.browsers && stats.browsers.length > 0) {
            const browsers = stats.browsers.map(browser => browser.browser || 'Nieznana');
            const browserVisits = stats.browsers.map(browser => browser.count);

            const browserData = [{
                labels: browsers,
                values: browserVisits,
                type: 'pie'
            }];

            const browserLayout = {
                title: 'Przeglądarki',
                font: {
                    family: 'system-ui, -apple-system, sans-serif'
                }
            };

            const browserConfig = {
                responsive: true,
                displayModeBar: false,
                displaylogo: false // Remove Plotly watermark
            };

            Plotly.newPlot('browsersChart', browserData, browserLayout, browserConfig);
        } else {
            document.getElementById('browsersChart').innerHTML = '<p class="text-center text-gray-600">Brak danych do wyświetlenia wykresu</p>';
        }

        // Update country stats chart
        if (stats.countryStats && stats.countryStats.length > 0) {
            const countries = stats.countryStats.map(country => country.name || 'Nieznany');
            const countryVisits = stats.countryStats.map(country => country.visits);

            const countryData = [{
                x: countries,
                y: countryVisits,
                type: 'bar',
                marker: {
                    color: '#3B82F6'
                }
            }];

            const countryLayout = {
                title: 'Odwiedziny według krajów',
                font: {
                    family: 'system-ui, -apple-system, sans-serif'
                },
                xaxis: {
                    title: 'Kraj',
                    tickangle: -45
                },
                yaxis: {
                    title: 'Liczba odwiedzin'
                },
                margin: {
                    b: 100
                }
            };

            const countryConfig = {
                responsive: true,
                displayModeBar: false,
                displaylogo: false, // Remove Plotly watermark
                staticPlot: true // Disable zooming and panning
            };

            Plotly.newPlot('countryStatsChart', countryData, countryLayout, countryConfig);
        } else {
            document.getElementById('countryStatsChart').innerHTML = '<p class="text-center text-gray-600">Brak danych do wyświetlenia wykresu</p>';
        }

        // Function to update visit time chart
        function updateVisitTimeChart(period) {
            if (stats.visitTimes && stats.visitTimes[period]) {
                const visitTimes = stats.visitTimes[period];
                const times = visitTimes.map(vt => vt.period);
                const counts = visitTimes.map(vt => vt.count);

                const visitTimeData = [{
                    x: times,
                    y: counts,
                    type: 'bar',
                    marker: {
                        color: '#3B82F6'
                    }
                }];

                const visitTimeLayout = {
                    title: 'Liczba odwiedzin według czasu',
                    font: {
                        family: 'system-ui, -apple-system, sans-serif'
                    },
                    xaxis: {
                        title: 'Czas',
                        tickangle: -45
                    },
                    yaxis: {
                        title: 'Liczba odwiedzin'
                    },
                    margin: {
                        b: 100
                    }
                };

                const visitTimeConfig = {
                    responsive: true,
                    displayModeBar: false,
                    displaylogo: false,
                    staticPlot: true // Disable zooming and panning
                };

                Plotly.newPlot('visitTimeChart', visitTimeData, visitTimeLayout, visitTimeConfig);
            } else {
                document.getElementById('visitTimeChart').innerHTML = '<p class="text-center text-gray-600">Brak danych do wyświetlenia wykresu</p>';
            }
        }

        // Initial load for 1-day period
        updateVisitTimeChart('1d');

        // Event listeners for period buttons
        document.getElementById('btn1d').addEventListener('click', () => updateVisitTimeChart('1d'));
        document.getElementById('btn7d').addEventListener('click', () => updateVisitTimeChart('7d'));
        document.getElementById('btn30d').addEventListener('click', () => updateVisitTimeChart('30d'));

    } catch (error) {
        console.error('Błąd podczas ładowania statystyk:', error);
    }
}

// Load stats on page load
window.onload = loadStats;

// Handle window resize for chart responsiveness
window.addEventListener('resize', function() {
    Plotly.Plots.resize('topPagesChart');
    Plotly.Plots.resize('referrersChart');
    Plotly.Plots.resize('browsersChart');
    Plotly.Plots.resize('countryStatsChart');
    Plotly.Plots.resize('visitTimeChart');
});