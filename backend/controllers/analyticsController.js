const ApiLog = require('../models/ApiLog');
const BlockedIP = require('../models/BlockedIP');

exports.getStats = async (req, res) => {
    try {
        const totalRequests = await ApiLog.countDocuments();
        const blockedCount = await BlockedIP.countDocuments();
        
        // Count suspicious: IPs with more than 50 requests in the last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const suspiciousIPs = await ApiLog.aggregate([
            { $match: { timestamp: { $gte: oneHourAgo } } },
            { $group: { _id: "$ip", count: { $sum: 1 } } },
            { $match: { count: { $gt: 50 } } }
        ]);

        res.json({
            totalRequests,
            blockedIPs: blockedCount,
            suspiciousIPs: suspiciousIPs.length,
            recentTraffic: await ApiLog.find().sort({ timestamp: -1 }).limit(10)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.logRequest = async (req, res) => {
    const { ip, endpoint, statusCode, responseTime, userAgent, method } = req.body;
    try {
        const log = await ApiLog.create({
            ip,
            endpoint,
            statusCode,
            responseTime,
            userAgent,
            method
        });
        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
