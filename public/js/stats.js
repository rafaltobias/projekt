async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();

        console.log('Dane z serwera:', stats);

        // Aktualizacja danych ogólnych
        document.getElementById('totalVisits').textContent = stats.totalVisits || 'Brak danych';
        document.getElementById('uniqueVisitors').textContent = stats.uniqueVisitors || 'Brak danych';

        // Aktualizacja najpopularniejszych stron i utworzenie wykresu
        const topPagesBody = document.querySelector('#topPages tbody');
        if (stats.topPages && stats.topPages.length > 0) {
            // Aktualizacja tabeli
            topPagesBody.innerHTML = stats.topPages.map(page => `
                <tr>
                    <td class="py-1">${page.page_url || 'Nieznana'}</td>
                    <td class="py-1 text-right">${page.count}</td>
                </tr>
            `).join('');

            // Tworzenie wykresu Plotly
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
                displayModeBar: false
            };

            Plotly.newPlot('topPagesChart', chartData, layout, config);
        } else {
            topPagesBody.innerHTML = '<tr><td colspan="2" class="py-1 text-center">Brak danych</td></tr>';
            document.getElementById('topPagesChart').innerHTML = '<p class="text-center text-gray-600">Brak danych do wyświetlenia wykresu</p>';
        }

        // Aktualizacja źródeł odwiedzin
        const referrersBody = document.querySelector('#referrers tbody');
        referrersBody.innerHTML = stats.referrers && stats.referrers.length > 0 
            ? stats.referrers.map(ref => `
                <tr>
                    <td class="py-1">${ref.referrer || 'Bezpośrednie'}</td>
                    <td class="py-1 text-right">${ref.count}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="2" class="py-1 text-center">Brak danych</td></tr>';

        // Aktualizacja przeglądarek
        const browsersBody = document.querySelector('#browsers tbody');
        browsersBody.innerHTML = stats.browsers && stats.browsers.length > 0 
            ? stats.browsers.map(browser => `
                <tr>
                    <td class="py-1">${browser.browser || 'Nieznana'}</td>
                    <td class="py-1 text-right">${browser.count}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="2" class="py-1 text-center">Brak danych</td></tr>';

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

        // Aktualizacja statystyk krajów
        const countryStatsBody = document.querySelector('#countryStats tbody');
        countryStatsBody.innerHTML = stats.countryStats && stats.countryStats.length > 0 
            ? stats.countryStats.map(country => `
                <tr>
                    <td class="py-1">${country.name || 'Nieznany'}</td>
                    <td class="py-1 text-right">${country.visits}</td>
                    <td class="py-1 text-right">${(country.percentage * 100).toFixed(1)}%</td>
                </tr>
            `).join('')
            : '<tr><td colspan="3" class="py-1 text-center">Brak danych</td></tr>';

    } catch (error) {
        console.error('Błąd podczas ładowania statystyk:', error);
    }
}

// Załaduj statystyki po wczytaniu strony
window.onload = loadStats;

// Obsługa zmiany rozmiaru okna dla responsywności wykresu
window.addEventListener('resize', function() {
    Plotly.Plots.resize('topPagesChart');
});