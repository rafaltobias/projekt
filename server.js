const express = require('express');
const rateLimit = require('express-rate-limit'); 
const app = express();
const PORT = 3000;
const db = require('./src/databse.js');

const visitController = require('./src/controllers/visitController');
const statsController = require('./src/controllers/statsController');

app.use(express.static('public'));
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all requests
app.use(limiter);

app.post('/track', visitController.trackVisit);
app.get('/api/stats', statsController.getStats);
app.get('/stats', statsController.getStatsPage);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});