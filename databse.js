const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('analytics.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS visits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            page_url TEXT,
            referrer TEXT,
            user_agent TEXT,
            ip_address TEXT,
            browser TEXT,
            os TEXT,
            device TEXT,
            country TEXT,
            session_id TEXT,
            is_entry_page INTEGER DEFAULT 0,  
            is_exit_page INTEGER DEFAULT 0   
        )
    `);
});

module.exports = db;