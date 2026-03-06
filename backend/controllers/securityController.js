const BlockedIP = require('../models/BlockedIP');

exports.blockIP = async (req, res) => {
    const { ip, reason } = req.body;
    try {
        const existing = await BlockedIP.findOne({ ip });
        if (existing) return res.status(400).json({ message: 'IP already blocked' });

        const blocked = await BlockedIP.create({ ip, reason: reason || 'Manual block' });
        res.status(201).json(blocked);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.unblockIP = async (req, res) => {
    const { ip } = req.params;
    try {
        await BlockedIP.findOneAndDelete({ ip });
        res.status(200).json({ message: `IP ${ip} unblocked successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBlockedIPs = async (req, res) => {
    try {
        const blocked = await BlockedIP.find().sort({ blockedAt: -1 });
        res.json(blocked);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
