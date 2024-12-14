const rateLimit = require('express-rate-limit');
const requestIp = require('request-ip');
// Basic rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,

    // Add logging for rate limit hits
    handler: (req, res) => {
        console.warn('Rate limit exceeded:', {
            ip: requestIp.getClientIp(req),
            path: req.path,
            userAgent: req.headers['user-agent']
        });
        res.status(429).send('Too many requests');
    }
});

module.exports = limiter;