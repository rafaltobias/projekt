const statsModel = require('../models/statsModel');
const visitModel = require('../models/visitModel');
const path = require('path');

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
        stats.visitTimes = {
            '1d': visitTimes.rows.filter(row => row.period === 'day'),
            '7d': visitTimes.rows.filter(row => row.period === 'week'),
            '30d': visitTimes.rows.filter(row => row.period === 'month')
        };

        res.status(200).json(stats);
    } catch (err) {
        console.error('Error in fetching stats:', err);
        res.status(500).send('Error fetching stats');
    }
};

exports.getStatsPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/stats.html'));
};