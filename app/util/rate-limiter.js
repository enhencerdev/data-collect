const rateLimit = require('express-rate-limit');
const requestIp = require('request-ip');

// More flexible rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 400, // Increased to 120 requests per minute
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    
    // Add more detailed logging
    handler: (req, res) => {
        console.warn('Rate limit exceeded:', {
            ip: requestIp.getClientIp(req),
            path: req.path,
            userAgent: req.headers['user-agent'],
            currentTime: new Date().toISOString()
        });
        res.status(429).json({
            error: 'Too many requests',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    },

    // More sophisticated rate limit skip logic
    skip: (req) => {
        const clientIp = requestIp.getClientIp(req);
        
        // Skip rate limiting for health checks and specific endpoints
        if (req.path === '/health' || req.path === '/ping') {
            return true;
        }

        // Skip for whitelisted IPs (configure these through environment variables)
        const whitelistedIps = (process.env.RATE_LIMIT_WHITELIST || '').split(',');
        if (whitelistedIps.includes(clientIp)) {
            return true;
        }

        return false;
    }
});

module.exports = limiter;