const requestIp = require('request-ip');

const REQUEST_TIMEOUT = 30000; // 30 seconds

const requestLogger = (req, res, next) => {
    const start = Date.now();
    const clientIp = requestIp.getClientIp(req);
    const timestamp = new Date().toISOString();

    /* console.log("================================================")
    console.log("")
    console.log("req.body")
    console.log(req.body)
    console.log("")
    console.log("")
    console.log("================================================")
    console.log({
        timestamp,
        ip: clientIp,
        method: req.method,
        path: req.path,
        body: req.body,
        userAgent: req.headers['user-agent']
    }); */

    // Set request timeout
    req.setTimeout(REQUEST_TIMEOUT, () => {
        const duration = Date.now() - start;
        console.error(`Request timeout after ${duration}ms - URL: ${req.originalUrl} - IP: ${clientIp}`);
        if (!res.headersSent) {
            res.status(503).send('Request timeout');
        }
    });

    res.on('finish', () => {
        const duration = Date.now() - start;
        if (duration > 2000) {
            // Body is already parsed by middleware
            const userId = req.body?.userID || req.body?.userId;
            console.log(`More than 2 seconds! URL: ${req.originalUrl} - UserID: ${userId} - Response Time: ${duration}ms`);
        }
    });

    next();
};

module.exports = requestLogger;