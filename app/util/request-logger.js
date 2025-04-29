const requestIp = require('request-ip');

const REQUEST_TIMEOUT = 30000; // 30 seconds

const requestLogger = (req, res, next) => {
    const start = Date.now();
    const clientIp = requestIp.getClientIp(req);
    const timestamp = new Date().toISOString();
    
    // Track all request completions
    res.on('finish', () => {
        const duration = Date.now() - start;
        const userId = req.body?.userID || req.body?.userId;
        const statusCode = res.statusCode;
        const successMsg = statusCode >= 200 && statusCode < 300 ? 'SUCCESS' : 'FAILED';
        
        // Log all requests with their status code and timing
        console.log(`${successMsg} ${req.method} ${req.originalUrl} - Status: ${statusCode} - Time: ${duration}ms - IP: ${clientIp}${userId ? ' - UserID: ' + userId : ''}`);
    });

    // Set request timeout
    req.setTimeout(REQUEST_TIMEOUT, () => {
        const duration = Date.now() - start;
        console.error(`Request timeout after ${duration}ms - URL: ${req.originalUrl} - IP: ${clientIp}`);
        if (!res.headersSent) {
            res.status(503).send('Request timeout');
        }
    });

    next();
};

module.exports = requestLogger;