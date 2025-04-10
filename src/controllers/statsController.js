const statsModel = require('../models/statsModel');
const visitModel = require('../models/visitModel');
const path = require('path');
const { stringify } = require('csv-stringify');

exports.getStats = async (req, res) => {
    try {
        const stats = {};

        const totalVisits = await statsModel.getTotalVisits();
        stats.totalVisits = parseInt(totalVisits.rows[0].total);

        const uniqueVisitors = await statsModel.getUniqueVisitors();
        stats.uniqueVisitors = parseInt(uniqueVisitors.rows[0].unique_count);

        const topPages = await statsModel.getTopPages();
        stats.topPages = topPages.rows;

        const referrers = await statsModel.getReferrers();
        stats.referrers = referrers.rows;

        const browsers = await statsModel.getBrowsers();
        stats.browsers = browsers.rows;

        const entryPages = await statsModel.getEntryPages();
        stats.entryPages = entryPages.rows;

        const exitPages = await statsModel.getExitPages();
        stats.exitPages = exitPages.rows;

        const countryStats = await statsModel.getCountryStats();
        stats.countryStats = countryStats.rows;

        const visitTimes = await visitModel.getVisitTimes();
        stats.visitTimes = visitTimes;

        const recentVisits = await visitModel.getRecentVisits();
        stats.timestamps = recentVisits.rows.map(row => row.timestamp);

        res.status(200).json(stats);
    } catch (err) {
        console.error('Error in fetching stats:', err);
        res.status(500).json({
            error: 'Error fetching stats',
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

exports.getStatsPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/stats.html'));
};

exports.exportStats = async (req, res) => {
    try {
        const days = req.query.days;

        const data = await statsModel.getStatsForExport(days);

        const visits = data.rows;

        if (!visits || visits.length === 0) {
            console.log('No visits found for the last', days, 'days');
            return res.status(200).send(''); 
        }

        const columns = [
            "id",
            "timestamp",
            "page_url",
            "referrer",
            "user_agent",
            "browser",
            "os",
            "device",
            "country",
            "session_id",
        ];

       const csvStringifier = stringify({
            header: true,
            columns: columns,
        }, (err, output) => {
            if (err) {
              console.error('Error during CSV stringify:', err);
              return res.status(500).json({ error: 'CSV stringify error', message: err.message });
            }

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="stats.csv"');
            res.status(200).send(output);

        });

        const records = visits.map((visit) => [
            visit.id,
            visit.timestamp,
            visit.page_url,
            visit.referrer,
            visit.user_agent,
            visit.browser,
            visit.os,
            visit.device,
            visit.country,
            visit.session_id,
        ]);

        records.forEach(record => {
            csvStringifier.write(record);
        });

        csvStringifier.end();

    } catch (err) {
        console.error('Error in exporting stats:', err);
        res.status(500).json({
            error: 'Error exporting stats',
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};