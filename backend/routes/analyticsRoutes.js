const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/analytics', analyticsController.getStats);
router.post('/log', analyticsController.logRequest);

module.exports = router;
