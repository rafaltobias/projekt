async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();

        // Aktualizacja danych ogólnych
        document.getElementById('totalVisits').textContent = stats.totalVisits || 'Brak danych';
        document.getElementById('uniqueVisitors').textContent = stats.uniqueVisitors || 'Brak danych';

        // Aktualizacja najpopularniejszych stron i utworzenie wykresu
        if (stats.topPages && stats.topPages.length > 0) {
            // Tworzenie wykresu Plotly dla najpopularniejszych stron
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

        // Aktualizacja źródeł odwiedzin i utworzenie wykresu
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

        // Aktualizacja przeglądarek i utworzenie wykresu
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

        // Aktualizacja statystyk krajów i utworzenie wykresu
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

        // Aktualizacja stron wejściowych
        const entryPagesBody = document.querySelector('#entryPages tbody');
        entryPagesBody.innerHTML = stats.entryPages && stats.entryPages.length > 0 
            ? stats.entryPages.map(page => `
                <tr>
                    <td class="py-1">${page.page_url || 'Nieznana'}</td>
                    <td class="py-1 text-right">${page.count}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="2" class="py-1 text-center">Brak danych</td></tr>';

        // Aktualizacja stron wyjściowych
        const exitPagesBody = document.querySelector('#exitPages tbody');
        exitPagesBody.innerHTML = stats.exitPages && stats.exitPages.length > 0 
            ? stats.exitPages.map(page => `
                <tr>
                    <td class="py-1">${page.page_url || 'Nieznana'}</td>
                    <td class="py-1 text-right">${page.count}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="2" class="py-1 text-center">Brak danych</td></tr>';

        // Aktualizacja ścieżek użytkownika
        const userPathsBody = document.querySelector('#userPaths tbody');
        userPathsBody.innerHTML = stats.userPaths && stats.userPaths.length > 0 
            ? stats.userPaths.map(path => `
                <tr>
                    <td class="py-1">${path.path || 'Brak ścieżki'}</td>
                </tr>
            `).join('')
            : '<tr><td class="py-1 text-center">Brak danych</td></tr>';

    } catch (error) {
        console.error('Błąd podczas ładowania statystyk:', error);
    }
}

// Załaduj statystyki po wczytaniu strony
window.onload = loadStats;

// Obsługa zmiany rozmiaru okna dla responsywności wykresu
window.addEventListener('resize', function() {
    Plotly.Plots.resize('topPagesChart');
    Plotly.Plots.resize('referrersChart');
    Plotly.Plots.resize('browsersChart');
    Plotly.Plots.resize('countryStatsChart');
});