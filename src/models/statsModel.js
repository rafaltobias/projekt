const db = require('../databse.js');

exports.getTotalVisits = async () => {
    return await db.query('SELECT COUNT(*) as total FROM visits');
};

exports.getUniqueVisitors = async () => {
    return await db.query('SELECT COUNT(DISTINCT session_id) as unique_count FROM visits');
};

exports.getTopPages = async () => {
    return await db.query(
        'SELECT page_url, COUNT(*) as count FROM visits GROUP BY page_url ORDER BY count DESC LIMIT 5'
    );
};

exports.getReferrers = async () => {
    return await db.query(
        'SELECT referrer, COUNT(*) as count FROM visits GROUP BY referrer ORDER BY count DESC LIMIT 5'
    );
};

exports.getBrowsers = async () => {
    return await db.query(
        'SELECT browser, COUNT(*) as count FROM visits GROUP BY browser ORDER BY count DESC LIMIT 5'
    );
};

exports.getEntryPages = async () => {
    return await db.query(
        'SELECT page_url, COUNT(*) as count FROM visits WHERE is_entry_page = true GROUP BY page_url ORDER BY count DESC LIMIT 5'
    );
};

exports.getExitPages = async () => {
    return await db.query(
        'SELECT page_url, COUNT(*) as count FROM visits WHERE is_exit_page = true GROUP BY page_url ORDER BY count DESC LIMIT 5'
    );
};

exports.getCountryStats = async () => {
    return await db.query(
        'SELECT country, COUNT(*) as count FROM visits GROUP BY country ORDER BY count DESC'
    );
};