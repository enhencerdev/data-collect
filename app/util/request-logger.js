const requestIp = require('request-ip');

const REQUEST_TIMEOUT = 30000; // 30 seconds

const requestLogger = (req, res, next) => {
    const start = Date.now();
    const clientIp = requestIp.getClientIp(req);
    const timestamp = new Date().toISOString();
    
    // Log ALL PUT requests to identify routing issues
    if (req.method === 'PUT') {
        console.log(`[DEBUG][${timestamp}] PUT request - URL: ${req.originalUrl} - IP: ${clientIp} - Body:`, JSON.stringify(req.body));
    }
    
    // Set request timeout
    req.setTimeout(REQUEST_TIMEOUT, () => {
        const duration = Date.now() - start;
        console.error(`Request timeout after ${duration}ms - URL: ${req.originalUrl} - IP: ${clientIp}`);
        if (!res.headersSent) {
            res.status(503).send('Request timeout');
        }
    });

    // Track response status for debugging 404s
    const originalEnd = res.end;
    res.end = function(...args) {
        const duration = Date.now() - start;
        if (req.method === 'PUT' && res.statusCode === 404) {
            console.error(`[ERROR][${timestamp}] 404 Not Found for PUT - URL: ${req.originalUrl} - Duration: ${duration}ms - IP: ${clientIp}`);
        }
        return originalEnd.apply(this, args);
    };

    next();
};

module.exports = requestLogger;