const requestIp = require('request-ip');

const requestLogger = (req, res, next) => {
    const start = Date.now();
    const clientIp = requestIp.getClientIp(req);
    const timestamp = new Date().toISOString();

    const body = JSON.parse(req.body)
    console.log({
        timestamp,
        ip: clientIp,
        method: req.method,
        path: req.path,
        userID: body?.userID,
        userAgent: req.headers['user-agent']
    });

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`Request URL: ${req.originalUrl} - UserID: ${body?.userID} - Response Time: ${duration}ms`);
    });

    next();
};

module.exports = requestLogger;