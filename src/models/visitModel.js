const db = require('../databse.js');

exports.getFirstVisit = async (sessionId) => {
    return await db.query(
        'SELECT id FROM visits WHERE session_id = $1 ORDER BY timestamp ASC LIMIT 1',
        [sessionId]
    );
};

exports.insertVisit = async (visitData) => {
    return await db.query(`
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
};

exports.updatePreviousExitPage = async (sessionId, newVisitId) => {
    return await db.query(`
        UPDATE visits 
        SET is_exit_page = false 
        WHERE session_id = $1 AND id != $2
    `, [sessionId, newVisitId]);
};

exports.getVisitTimes = async () => {
    const now = new Date();
    
    // Get last 24 hours data (1d)
    const hourlyData = await db.query(`
        SELECT 
            TO_CHAR(DATE_TRUNC('hour', timestamp), 'HH24:00') as period,
            COUNT(*) as count
        FROM visits 
        WHERE timestamp >= NOW() - INTERVAL '24 hours'
        GROUP BY DATE_TRUNC('hour', timestamp)
        ORDER BY DATE_TRUNC('hour', timestamp)
    `);

    // Get last 7 days data (7d)
    const dailyData = await db.query(`
        SELECT 
            TO_CHAR(DATE_TRUNC('day', timestamp), 'Day') as period,
            COUNT(*) as count
        FROM visits 
        WHERE timestamp >= NOW() - INTERVAL '7 days'
        GROUP BY DATE_TRUNC('day', timestamp), TO_CHAR(DATE_TRUNC('day', timestamp), 'Day')
        ORDER BY DATE_TRUNC('day', timestamp)
    `);

    // Get last 30 days data grouped by week (30d)
    const weeklyData = await db.query(`
        SELECT 
            CONCAT('Tydzień ', TO_CHAR(DATE_TRUNC('week', timestamp), 'WW')) as period,
            COUNT(*) as count
        FROM visits 
        WHERE timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('week', timestamp)
        ORDER BY DATE_TRUNC('week', timestamp)
    `);

    return {
        '1d': hourlyData.rows,
        '7d': dailyData.rows,
        '30d': weeklyData.rows
    };
};

exports.getRecentVisits = async () => {
    return await db.query(`
        SELECT timestamp 
        FROM visits 
        WHERE timestamp >= NOW() - INTERVAL '30 days'
        ORDER BY timestamp DESC
    `);
};