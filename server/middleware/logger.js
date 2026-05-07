const fs = require('fs');
const path = require('path');

const logDir = process.env.LOG_DIR || path.join(__dirname, '..', 'logs');
fs.mkdirSync(logDir, { recursive: true });

const logStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });

function logger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const ms  = Date.now() - start;
        const line = JSON.stringify({
            ts:     new Date().toISOString(),
            method: req.method,
            url:    req.originalUrl,
            status: res.statusCode,
            ms,
            ip:     req.ip,
            ua:     req.get('user-agent') || ''
        });
        logStream.write(line + '\n');
        if (process.env.NODE_ENV !== 'production') console.log(line);
    });
    next();
}

module.exports = logger;
