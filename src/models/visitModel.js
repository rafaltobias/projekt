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
    return await db.query(`
        SELECT 
            DATE_TRUNC('day', timestamp) AS period, 
            COUNT(*) AS count 
        FROM visits 
        GROUP BY period 
        ORDER BY period DESC
    `);
};