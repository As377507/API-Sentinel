const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const { createClient } = require('redis');

let store;

try {
    const redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
        console.warn('Redis Connection Failed. Falling back to memory store.');
    });

    redisClient.connect().catch(() => {
        console.warn('Could not connect to Redis. Using local memory for rate limiting.');
    });

    store = new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    });
} catch (error) {
    console.warn('Redis initialization error. Using local memory.');
    store = undefined; // express-rate-limit defaults to MemoryStore
}

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    store: store,
    message: {
        error: 'Too Many Requests',
        message: 'You have exceeded the rate limit. Please try again later.'
    }
});

module.exports = apiLimiter;
