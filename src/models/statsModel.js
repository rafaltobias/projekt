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