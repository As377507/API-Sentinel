const mongoose = require('mongoose');

const blockedIPSchema = new mongoose.Schema({
    ip: { type: String, required: true, unique: true },
    reason: { type: String, required: true },
    blockedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date } // Null for permanent block
});

module.exports = mongoose.model('BlockedIP', blockedIPSchema);
