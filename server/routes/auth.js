const express  = require('express');
const crypto   = require('crypto');
const bcrypt   = require('bcrypt');
const { getDb } = require('../db/database');
const { requireAuth } = require('../middleware/auth');
const limits   = require('../middleware/rateLimiter');
const emailService = require('../services/emailService');

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
    const { email, password, full_name, mobile, referrer_code } = req.body;

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

    const hash    = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const refCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const result  = db.prepare(
        'INSERT INTO users (email, password_hash, full_name, mobile, referral_code) VALUES (?,?,?,?,?)'
    ).run(email.toLowerCase().trim(), hash, full_name || null, mobile || null, refCode);

    // Apply referral code if provided
    if (referrer_code) {
        const referrer = db.prepare('SELECT id FROM users WHERE referral_code = ?').get(referrer_code.toUpperCase().trim());
        if (referrer && referrer.id !== result.lastInsertRowid) {
            db.prepare('INSERT INTO referrals (referrer_id, referred_id) VALUES (?,?)').run(referrer.id, result.lastInsertRowid);
        }
    }

    audit(db, result.lastInsertRowid, 'signup', req);

    emailService.sendWelcome(email, full_name || '').catch(err => console.error('Welcome email error:', err));

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
    const user = db.prepare('SELECT id, email, full_name, mobile, ecosystem_member, kyc_status, verified, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
});

// POST /api/leads  — capture email from free estimator (no auth required)
router.post('/leads', limits.signup, async (req, res) => {
    const { email, livestock_type, province, herd_size, savings_low, savings_high } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return res.status(400).json({ error: true, code: 'VALIDATION_ERROR', message: 'Valid email address is required.' });

    const db = getDb();
    db.prepare(
        'INSERT INTO leads (email, livestock_type, province, herd_size, savings_low, savings_high) VALUES (?,?,?,?,?,?)'
    ).run(
        email.toLowerCase().trim(),
        livestock_type || null,
        province || null,
        herd_size ? parseInt(herd_size, 10) : null,
        savings_low  ? parseInt(savings_low, 10)  : null,
        savings_high ? parseInt(savings_high, 10) : null
    );

    // Fire-and-forget follow-up email
    emailService.sendLeadFollowUp(email, {
        livestockType: livestock_type,
        province,
        savingsLow:  savings_low,
        savingsHigh: savings_high
    }).catch(err => console.error('Lead email error:', err));

    res.json({ success: true });
});

module.exports = router;
