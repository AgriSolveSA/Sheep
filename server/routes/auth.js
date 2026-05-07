const express  = require('express');
const crypto   = require('crypto');
const bcrypt   = require('bcrypt');
const { getDb } = require('../db/database');
const { requireAuth } = require('../middleware/auth');
const limits   = require('../middleware/rateLimiter');

const router = express.Router();
const BCRYPT_ROUNDS  = 10;
const SESSION_DAYS   = 7;
const SESSION_MS     = SESSION_DAYS * 24 * 60 * 60 * 1000;

function audit(db, userId, action, req, details = null) {
    db.prepare('INSERT INTO audit_log (user_id, action, ip_address, user_agent, details) VALUES (?,?,?,?,?)')
      .run(userId, action, req.ip, req.get('user-agent') || '', details ? JSON.stringify(details) : null);
}

// POST /api/signup
router.post('/signup', limits.signup, async (req, res) => {
    const { email, password, full_name, mobile } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: true, code: 'VALIDATION_ERROR', message: 'Email and password are required.' });
    if (password.length < 8)
        return res.status(400).json({ error: true, code: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return res.status(400).json({ error: true, code: 'VALIDATION_ERROR', message: 'Invalid email address.' });

    const db   = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing)
        return res.status(409).json({ error: true, code: 'EMAIL_EXISTS', message: 'An account with this email already exists.' });

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const result = db.prepare(
        'INSERT INTO users (email, password_hash, full_name, mobile) VALUES (?,?,?,?)'
    ).run(email.toLowerCase().trim(), hash, full_name || null, mobile || null);

    audit(db, result.lastInsertRowid, 'signup', req);
    res.status(201).json({ success: true, userId: result.lastInsertRowid });
});

// POST /api/login
router.post('/login', limits.login, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: true, code: 'VALIDATION_ERROR', message: 'Email and password are required.' });

    const db   = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        audit(db, user?.id || null, 'login_failed', req, { email });
        return res.status(401).json({ error: true, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    }

    const sessionId = crypto.randomBytes(32).toString('hex');
    const expires   = Date.now() + SESSION_MS;
    db.prepare('INSERT INTO sessions (id, user_id, expires) VALUES (?,?,?)').run(sessionId, user.id, expires);

    audit(db, user.id, 'login', req);
    res.json({ success: true, sessionId, userId: user.id, ecosystem_member: user.ecosystem_member });
});

// POST /api/logout
router.post('/logout', requireAuth, (req, res) => {
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    const db = getDb();
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    audit(db, req.user.id, 'logout', req);
    res.json({ success: true });
});

// GET /api/user
router.get('/user', requireAuth, (req, res) => {
    const db   = getDb();
    const user = db.prepare('SELECT id, email, full_name, mobile, ecosystem_member, verified, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
});

module.exports = router;
