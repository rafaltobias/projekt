const UAParser = require('ua-parser-js');
const visitModel = require('../models/visitModel');

exports.trackVisit = async (req, res) => {
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

        const existingVisit = await visitModel.getFirstVisit(sessionId);
        visitData.is_entry_page = existingVisit.rows.length === 0;

        const newVisit = await visitModel.insertVisit(visitData);
        await visitModel.updatePreviousExitPage(sessionId, newVisit.rows[0].id);

        res.status(200).send('Tracked');
    } catch (err) {
        console.error('Error in tracking:', err);
        res.status(500).send('Error tracking visit');
    }
};