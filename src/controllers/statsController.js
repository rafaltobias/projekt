const statsModel = require('../models/statsModel');
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

        res.status(200).json(stats);
    } catch (err) {
        console.error('Error in fetching stats:', err);
        res.status(500).send('Error fetching stats');
    }
};
exports.getStatsPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/stats.html'));
};