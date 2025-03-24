const express = require('express');
const app = express();
const PORT = 3000;
const db = require('./src/databse.js');

const visitController = require('./src/controllers/visitController');
const statsController = require('./src/controllers/statsController');

app.use(express.static('public'));
app.use(express.json());

app.post('/track', visitController.trackVisit);
app.get('/api/stats', statsController.getStats);
app.get('/stats', statsController.getStatsPage);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});