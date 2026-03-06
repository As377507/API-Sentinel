const BlockedIP = require('../models/BlockedIP');

const checkBlockedIP = async (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    try {
        const isBlocked = await BlockedIP.findOne({ ip: clientIP });

        if (isBlocked) {
            return res.status(403).json({
                error: 'Access Denied',
                message: 'Your IP address has been blocked due to suspicious activity.',
                reason: isBlocked.reason
            });
        }
        next();
    } catch (error) {
        console.error('Middleware Error:', error);
        next();
    }
};

module.exports = checkBlockedIP;
