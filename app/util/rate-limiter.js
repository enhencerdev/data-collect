const rateLimit = require('express-rate-limit');
const requestIp = require('request-ip');

// Basic rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Increased from 60 to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    
    // Add more detailed logging
    handler: (req, res) => {
        console.warn('Rate limit exceeded:', {
            ip: requestIp.getClientIp(req),
            path: req.path,
            userAgent: req.headers['user-agent'],
            currentTime: new Date().toISOString(),
            headers: req.headers
        });
        res.status(429).send('Too many requests');
    },

    // Skip rate limiting for certain IPs (optional, for testing)
    skip: (req) => {
        const clientIp = requestIp.getClientIp(req);
        console.log('Incoming request from IP:', clientIp);
        return clientIp === '176.233.70.92'; // Uncomment and modify for testing
    }
});

module.exports = limiter;