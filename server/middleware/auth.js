const { getDb } = require('../db/database');

function requireAuth(req, res, next) {
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    if (!sessionId) {
        return res.status(401).json({ error: true, code: 'NO_SESSION', message: 'Authentication required.' });
    }

    const db  = getDb();
    const row = db.prepare(
        'SELECT s.user_id, s.expires, u.email, u.full_name, u.ecosystem_member FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?'
    ).get(sessionId);

    if (!row) {
        return res.status(401).json({ error: true, code: 'INVALID_SESSION', message: 'Session not found.' });
    }
    if (Date.now() > row.expires) {
        db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
        return res.status(401).json({ error: true, code: 'SESSION_EXPIRED', message: 'Session expired. Please log in again.' });
    }

    req.user = { id: row.user_id, email: row.email, full_name: row.full_name, ecosystem_member: row.ecosystem_member };
    next();
}

function optionalAuth(req, res, next) {
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    if (!sessionId) return next();

    const db  = getDb();
    const row = db.prepare(
        'SELECT s.user_id, s.expires, u.email, u.full_name, u.ecosystem_member FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?'
    ).get(sessionId);

    if (row && Date.now() <= row.expires) {
        req.user = { id: row.user_id, email: row.email, full_name: row.full_name, ecosystem_member: row.ecosystem_member };
    }
    next();
}

module.exports = { requireAuth, optionalAuth };
