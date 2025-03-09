const express = require('express');
const db = require('./databse.js'); // Poprawiona nazwa pliku
const UAParser = require('ua-parser-js');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

// Śledzenie wizyt
app.post('/track', (req, res) => {
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
        is_entry_page: 0,
        is_exit_page: 0
    };

    // Sprawdzenie, czy to pierwsza wizyta w sesji
    db.get('SELECT id FROM visits WHERE session_id = ? ORDER BY timestamp ASC LIMIT 1', [sessionId], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error checking session');
        }

        visitData.is_entry_page = !row ? 1 : 0; // Jeśli nie ma wcześniejszych rekordów, to strona wejściowa

        // Wstawienie nowego rekordu
        db.run(`
            INSERT INTO visits (page_url, referrer, user_agent, ip_address, browser, os, device, country, session_id, is_entry_page, is_exit_page)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, Object.values(visitData), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving data');
            }

            // Aktualizacja poprzedniej strony jako strony wyjściowej (jeśli istnieje)
            db.run(`
                UPDATE visits 
                SET is_exit_page = 0 
                WHERE session_id = ? AND id != last_insert_rowid()
            `, [sessionId], (err) => {
                if (err) console.error('Error updating exit page:', err);

                db.run(`
                    UPDATE visits 
                    SET is_exit_page = 1 
                    WHERE id = last_insert_rowid()
                `, (err) => {
                    if (err) console.error('Error setting current exit page:', err);
                    res.status(200).send('Tracked');
                });
            });
        });
    });
});

// Endpoint API dla statystyk
app.get('/api/stats', (req, res) => {
    const stats = {};

    // Łączna liczba odwiedzin
    db.get('SELECT COUNT(*) as total FROM visits', (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        stats.totalVisits = row ? row.total : 0;

        // Unikalni użytkownicy
        db.get('SELECT COUNT(DISTINCT session_id) as unique_count FROM visits', (err, row) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            stats.uniqueVisitors = row ? row.unique_count : 0;

        // Najpopularniejsze strony
            db.all('SELECT page_url, COUNT(*) as count FROM visits GROUP BY page_url ORDER BY count DESC LIMIT 5', (err, rows) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                stats.topPages = rows || [];

                // Źródła odwiedzin
                db.all('SELECT referrer, COUNT(*) as count FROM visits GROUP BY referrer ORDER BY count DESC LIMIT 5', (err, rows) => {
                    if (err) return res.status(500).json({ error: 'Database error' });
                    stats.referrers = rows || [];

                    // Przeglądarki
                    db.all('SELECT browser, COUNT(*) as count FROM visits GROUP BY browser ORDER BY count DESC', (err, rows) => {
                        if (err) return res.status(500).json({ error: 'Database error' });
                        stats.browsers = rows || [];

                        // Strony wejściowe
                        db.all('SELECT page_url, COUNT(*) as count FROM visits WHERE is_entry_page = 1 GROUP BY page_url ORDER BY count DESC LIMIT 5', (err, rows) => {
                            if (err) return res.status(500).json({ error: 'Database error' });
                            stats.entryPages = rows || [];

                            // Strony wyjściowe
                            db.all('SELECT page_url, COUNT(*) as count FROM visits WHERE is_exit_page = 1 GROUP BY page_url ORDER BY count DESC LIMIT 5', (err, rows) => {
                                if (err) return res.status(500).json({ error: 'Database error' });
                                stats.exitPages = rows || [];

                                // Ścieżki użytkownika (przykładowo 5 ostatnich sesji)
                                db.all(`
                                    SELECT session_id, GROUP_CONCAT(page_url, ' -> ') as path 
                                    FROM visits 
                                    GROUP BY session_id 
                                    ORDER BY MAX(timestamp) DESC 
                                    LIMIT 5
                                `, (err, rows) => {
                                    if (err) return res.status(500).json({ error: 'Database error' });
                                    stats.userPaths = rows || [];
                                    res.json(stats);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.get('/stats', (req, res) => {
    res.sendFile(__dirname + '/public/stats.html');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});