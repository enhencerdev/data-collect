const requestIp = require('request-ip');

const requestLogger = (req, res, next) => {
    const start = Date.now();
    const clientIp = requestIp.getClientIp(req);
    const timestamp = new Date().toISOString();

    console.log("================================================")
    console.log("")
    console.log("req.body")
    console.log(req.body)
    console.log("")
    console.log("")
    console.log("================================================")

    try {
        const body = JSON.parse(req.body)
        console.log({
            timestamp,
            ip: clientIp,
            method: req.method,
            path: req.path,
            userID: body?.userID || body?.userId,
            userAgent: req.headers['user-agent']
        });
    
        res.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`Finished! URL: ${req.originalUrl} - UserID: ${body?.userID || body?.userId} - Response Time: ${duration}ms`);
        });
    
        next();
    } catch (error) {
        next();
    }
   
};

module.exports = requestLogger;