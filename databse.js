const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'analytics',
    password: process.env.POSTGRES_PASSWORD || 'tobias',
    port: process.env.POSTGRES_PORT || 6666,
});

// Inicjalizacja tabeli
const initializeDatabase = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS visits (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                page_url TEXT,
                referrer TEXT,
                user_agent TEXT,
                ip_address TEXT,
                browser TEXT,
                os TEXT,
                device TEXT,
                country TEXT,
                session_id TEXT,
                is_entry_page BOOLEAN DEFAULT FALSE,
                is_exit_page BOOLEAN DEFAULT FALSE
            )
        `);
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
        throw err;
    }
};

// Inicjalizacja bazy danych przy starcie
initializeDatabase();

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};