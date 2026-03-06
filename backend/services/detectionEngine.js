const ApiLog = require('../models/ApiLog');
const BlockedIP = require('../models/BlockedIP');

const THRESHOLDS = {
    MAX_REQUESTS_PER_MINUTE: 100,
    MAX_FAILED_LOGINS: 5,
    SCAN_THRESHOLD: 10 // Accessing too many unique 404 endpoints
};

const analyzeIP = async (ip) => {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    // 1. Check Request Frequency
    const recentRequests = await ApiLog.countDocuments({
        ip,
        timestamp: { $gte: oneMinuteAgo }
    });

    if (recentRequests > THRESHOLDS.MAX_REQUESTS_PER_MINUTE) {
        await blockIP(ip, 'Excessive rate usage detected');
        return true;
    }

    // 2. Check Failed Logins (Assuming /api/login and 401 status)
    const failedLogins = await ApiLog.countDocuments({
        ip,
        endpoint: '/api/login',
        statusCode: 401,
        timestamp: { $gte: oneMinuteAgo }
    });

    if (failedLogins > THRESHOLDS.MAX_FAILED_LOGINS) {
        await blockIP(ip, 'Brute-force attempt detected');
        return true;
    }

    // 3. Check Endpoint Scanning (Many 404s)
    const unique404s = await ApiLog.distinct('endpoint', {
        ip,
        statusCode: 404,
        timestamp: { $gte: oneMinuteAgo }
    });

    if (unique404s.length > THRESHOLDS.SCAN_THRESHOLD) {
        await blockIP(ip, 'Endpoint scanning detected');
        return true;
    }

    return false;
};

const blockIP = async (ip, reason) => {
    try {
        const alreadyBlocked = await BlockedIP.findOne({ ip });
        if (!alreadyBlocked) {
            await BlockedIP.create({ ip, reason });
            console.log(`[SECURITY] Blocked IP: ${ip} for reason: ${reason}`);
        }
    } catch (error) {
        console.error('Error blocking IP:', error);
    }
};

module.exports = { analyzeIP, blockIP };
