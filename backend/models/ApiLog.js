const mongoose = require('mongoose');

const apiLogSchema = new mongoose.Schema({
    ip: { type: String, required: true },
    endpoint: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    statusCode: { type: Number, required: true },
    responseTime: { type: Number, required: true },
    userAgent: { type: String },
    method: { type: String, required: true }
});

module.exports = mongoose.model('ApiLog', apiLogSchema);
