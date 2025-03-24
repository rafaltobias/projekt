const express = require('express');
const db = require('./databse.js');
const UAParser = require('ua-parser-js');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

// Śledzenie wizyt
app.post('/track', async (req, res) => {
    try {
        const parser = new UAParser(req.headers['user-agent']);
        const uaResult = parser.getResult();
        
        const sessionId = req.body.session_id || Math.random().toString(36).substring(2);
        const visitData = {
            page_url: req.body.page_url,
            referrer: req.body.referrer || req.headers.referer || '',
            user_agent: req.headers['user-agent'],
            ip_address: req.ip,
            browser: uaResult.browser.name,
            os: uaResult.os.name,
            device: uaResult.device.model || 'Desktop',
            country: req.headers['cf-ipcountry'] || 'Unknown',
            session_id: sessionId,
            is_entry_page: false,
            is_exit_page: true
        };

        // Sprawdzenie, czy to pierwsza wizyta w sesji
        const existingVisit = await db.query(
            'SELECT id FROM visits WHERE session_id = $1 ORDER BY timestamp ASC LIMIT 1',
            [sessionId]
        );

        visitData.is_entry_page = existingVisit.rows.length === 0;

        // Wstawienie nowego rekordu
        const result = await db.query(`
            INSERT INTO visits (
                page_url, referrer, user_agent, ip_address, browser, os, 
                device, country, session_id, is_entry_page, is_exit_page
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id
        `, [
            visitData.page_url, visitData.referrer, visitData.user_agent,
            visitData.ip_address, visitData.browser, visitData.os,
            visitData.device, visitData.country, visitData.session_id,
            visitData.is_entry_page, visitData.is_exit_page
        ]);

        // Aktualizacja poprzedniej strony jako nie-wyjściowej
        await db.query(`
            UPDATE visits 
            SET is_exit_page = false 
            WHERE session_id = $1 AND id != $2
        `, [sessionId, result.rows[0].id]);

        res.status(200).send('Tracked');
    } catch (err) {
        console.error('Error in tracking:', err);
        res.status(500).send('Error tracking visit');
    }
});

// Endpoint API dla statystyk
app.get('/api/stats', async (req, res) => {
    try {
        const stats = {};

        // Łączna liczba odwiedzin
        const totalVisits = await db.query('SELECT COUNT(*) as total FROM visits');
        stats.totalVisits = parseInt(totalVisits.rows[0].total);

        // Unikalni użytkownicy
        const uniqueVisitors = await db.query('SELECT COUNT(DISTINCT session_id) as unique_count FROM visits');
        stats.uniqueVisitors = parseInt(uniqueVisitors.rows[0].unique_count);

        // Najpopularniejsze strony
        const topPages = await db.query(
            'SELECT page_url, COUNT(*) as count FROM visits GROUP BY page_url ORDER BY count DESC LIMIT 5'
        );
        stats.topPages = topPages.rows;

        // Źródła odwiedzin
        const referrers = await db.query(
            'SELECT referrer, COUNT(*) as count FROM visits GROUP BY referrer ORDER BY count DESC LIMIT 5'
        );
        stats.referrers = referrers.rows;

        // Przeglądarki
        const browsers = await db.query(
            'SELECT browser, COUNT(*) as count FROM visits GROUP BY browser ORDER BY count DESC'
        );
        stats.browsers = browsers.rows;

        // Strony wejściowe
        const entryPages = await db.query(`
            SELECT page_url, COUNT(*) as count 
            FROM visits 
            WHERE is_entry_page = true 
            GROUP BY page_url 
            ORDER BY count DESC 
            LIMIT 5
        `);
        stats.entryPages = entryPages.rows;

        // Strony wyjściowe
        const exitPages = await db.query(`
            SELECT page_url, COUNT(*) as count 
            FROM visits 
            WHERE is_exit_page = true 
            GROUP BY page_url 
            ORDER BY count DESC 
            LIMIT 5
        `);
        stats.exitPages = exitPages.rows;

        // Ścieżki użytkownika
        const userPaths = await db.query(`
            SELECT 
                session_id, 
                string_agg(page_url, ' -> ' ORDER BY timestamp) as path
            FROM visits 
            GROUP BY session_id 
            ORDER BY max(timestamp) DESC 
            LIMIT 5
        `);
        stats.userPaths = userPaths.rows;

        res.json(stats);
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/stats', (req, res) => {
    res.sendFile(__dirname + '/public/stats.html');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});