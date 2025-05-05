const requestIp = require('request-ip');

const REQUEST_TIMEOUT = 30000; // 30 seconds

const requestLogger = (req, res, next) => {
    const start = Date.now();
    const clientIp = requestIp.getClientIp(req);
    const timestamp = new Date().toISOString();
    
    // Log PUT requests without ID that might cause slowdowns
    if (req.method === 'PUT' && req.originalUrl.match(/\/api\/customers\/?$/)) {
        console.log(`[${timestamp}] PUT request without ID - IP: ${clientIp} - Body:`, JSON.stringify(req.body));
    }
    
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