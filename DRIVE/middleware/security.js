const xss = require('xss');
const { rateLimit } = require('express-rate-limit');

// XSS prevention middleware
const xssPreventionMiddleware = (req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key]);
            }
        }
    }
    next();
};

// Global rate limiter
const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false
});

// API rate limiter (stricter)
const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: 'Too many API requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    xssPreventionMiddleware,
    globalRateLimiter,
    apiRateLimiter
};
