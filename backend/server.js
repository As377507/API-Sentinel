require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const winston = require('winston');
const { analyzeIP } = require('./services/detectionEngine');
const ApiLog = require('./models/ApiLog');
const blockIPMiddleware = require('./middleware/blockIP');
const rateLimiter = require('./middleware/rateLimiter');

const analyticsRoutes = require('./routes/analyticsRoutes');
const securityRoutes = require('./routes/securityRoutes');

const app = express();

// SECURITY FIX: Trust proxy (required for Cloudflare, Heroku, Nginx)
app.set('trust proxy', 1);

// Winston Logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({ format: winston.format.simple() })
    ]
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(blockIPMiddleware); // Check if IP is blocked first
app.use(rateLimiter); // Apply rate limiting

// Automatic Request Logging & Analysis Middleware
app.use((req, res, next) => {
    const start = Date.now();
    
    // Capture response finish to log in background
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            ip: req.ip || req.get('x-forwarded-for') || req.connection.remoteAddress,
            endpoint: req.originalUrl,
            method: req.method,
            statusCode: res.statusCode,
            responseTime: duration,
            userAgent: req.get('User-Agent')
        };

        // Fire and forget - background processing
        setImmediate(async () => {
            try {
                await ApiLog.create(logData);
                await analyzeIP(logData.ip);
                logger.info(`REAL-TIME LOG: ${logData.method} ${logData.endpoint} ${logData.statusCode} from ${logData.ip}`);
            } catch (err) {
                logger.error('Background Logging Error:', err);
            }
        });
    });

    next();
});

// Routes
app.use('/api', analyticsRoutes);
app.use('/api', securityRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
