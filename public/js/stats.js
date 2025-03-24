document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const stats = await response.json();

        console.log('Stats data:', stats); // Log the stats data

        if (!stats) {
            throw new Error('Stats object is undefined');
        }

        document.getElementById('totalVisits').textContent = stats.totalVisits || 'N/A';
        document.getElementById('uniqueVisitors').textContent = stats.uniqueVisitors || 'N/A';

        populateTable('topPages', stats.topPages, ['page_url', 'count']);
        populateTable('referrers', stats.referrers, ['referrer', 'count']);
        populateTable('browsers', stats.browsers, ['browser', 'count']);
        populateTable('entryPages', stats.entryPages, ['page_url', 'count']);
        populateTable('exitPages', stats.exitPages, ['page_url', 'count']);
        populateTable('countryStats', stats.countryStats, ['country', 'count', null]);

    } catch (err) {
        console.error('Error fetching stats:', err);
    }
});

function populateTable(tableId, data, columns) {
    if (!data || !Array.isArray(data)) {
        console.error(`Invalid data for table ${tableId}:`, data);
        return;
    }

    const tbody = document.getElementById(tableId).querySelector('tbody');
    tbody.innerHTML = '';
    data.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = row[col] || 'N/A';
            td.className = col === 'count' ? 'text-right' : 'text-left';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}