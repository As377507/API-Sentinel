const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');

router.post('/block-ip', securityController.blockIP);
router.get('/blocked', securityController.getBlockedIPs);
router.delete('/unblock/:ip', securityController.unblockIP);

module.exports = router;
