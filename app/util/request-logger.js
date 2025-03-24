const requestIp = require('request-ip');

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

    res.on('finish', () => {
        const duration = Date.now() - start;
        if (duration > 2000) {
            const userId = JSON.parse(req.body)?.userID || JSON.parse(req.body)?.userId;
            console.log(`More than 2 seconds! URL: ${req.originalUrl} - UserID: ${userId} - Response Time: ${duration}ms`);
        }
    });

    next();
};

module.exports = requestLogger;