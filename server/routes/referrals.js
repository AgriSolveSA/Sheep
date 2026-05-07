const express        = require('express');
const crypto         = require('crypto');
const { getDb }      = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function isAdmin(user) { return user.id === 1 || user.is_admin === 1; }

// GET /api/referrals  — user's referral code + stats
router.get('/referrals', requireAuth, (req, res) => {
    const db   = getDb();
    const user = db.prepare('SELECT referral_code FROM users WHERE id = ?').get(req.user.id);

    if (!user.referral_code) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        db.prepare('UPDATE users SET referral_code = ? WHERE id = ?').run(code, req.user.id);
        user.referral_code = code;
    }

    const stats = db.prepare(`
        SELECT
            COUNT(*) AS total_referrals,
            SUM(CASE WHEN status = 'rewarded' THEN 1 ELSE 0 END) AS rewarded,
            SUM(CASE WHEN status = 'rewarded' THEN reward_cents ELSE 0 END) AS total_earned_cents
        FROM referrals WHERE referrer_id = ?
    `).get(req.user.id);

    res.json({
        referral_code: user.referral_code,
        referral_link: `${process.env.BASE_URL || 'https://shepherdai.co.za'}/signup.html?ref=${user.referral_code}`,
        total_referrals:   stats.total_referrals || 0,
        rewarded:          stats.rewarded || 0,
        total_earned_cents: stats.total_earned_cents || 0
    });
});

// POST /api/referrals/apply  — called at signup with a referral code
// Creates pending referral record; reward issued when referred user makes first purchase
router.post('/referrals/apply', requireAuth, (req, res) => {
    const { code } = req.body;
    if (!code)
        return res.status(400).json({ error: true, code: 'VALIDATION_ERROR', message: 'Referral code is required.' });

    const db = getDb();

    // Find referrer
    const referrer = db.prepare('SELECT id FROM users WHERE referral_code = ?').get(code.toUpperCase().trim());
    if (!referrer)
        return res.status(404).json({ error: true, code: 'INVALID_CODE', message: 'Referral code not found.' });
    if (referrer.id === req.user.id)
        return res.status(400).json({ error: true, code: 'SELF_REFERRAL', message: 'You cannot use your own referral code.' });

    // Check not already referred
    const existing = db.prepare('SELECT id FROM referrals WHERE referred_id = ?').get(req.user.id);
    if (existing)
        return res.status(409).json({ error: true, code: 'ALREADY_REFERRED', message: 'A referral is already linked to your account.' });

    db.prepare('INSERT INTO referrals (referrer_id, referred_id) VALUES (?,?)').run(referrer.id, req.user.id);
    res.json({ success: true, message: 'Referral code applied. Your referrer will earn R100 when you complete your first purchase.' });
});

// GET /api/admin/stats  — performance dashboard (admin only)
router.get('/admin/stats', requireAuth, (req, res) => {
    if (!isAdmin(req.user)) return res.status(403).json({ error: true, code: 'FORBIDDEN', message: 'Admin only.' });

    const db = getDb();

    const users    = db.prepare("SELECT COUNT(*) AS total, SUM(ecosystem_member) AS members, SUM(CASE WHEN created_at > datetime('now','-7 days') THEN 1 ELSE 0 END) AS new_7d FROM users").get();
    const revenue  = db.prepare("SELECT SUM(amount) AS total_cents, COUNT(*) AS payments FROM payments WHERE status = 'completed'").get();
    const reports  = db.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) AS delivered, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending FROM reports").get();
    const eft      = db.prepare("SELECT COUNT(*) AS count FROM payments WHERE method='manual_eft' AND status='pending'").get();
    const kyc      = db.prepare("SELECT COUNT(DISTINCT user_id) AS count FROM kyc_documents WHERE verified = 0").get();
    const listings = db.prepare("SELECT COUNT(*) AS active, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending FROM listings").get();
    const leads    = db.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN created_at > datetime('now','-7 days') THEN 1 ELSE 0 END) AS new_7d FROM leads").get();
    const refStats = db.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status='rewarded' THEN 1 ELSE 0 END) AS rewarded FROM referrals").get();
    const recentAudit = db.prepare(`
        SELECT a.action, a.created_at, a.ip_address, u.email
        FROM audit_log a LEFT JOIN users u ON u.id = a.user_id
        ORDER BY a.created_at DESC LIMIT 20
    `).all();

    res.json({
        users,
        revenue: { ...revenue, total_zar: ((revenue.total_cents || 0) / 100).toFixed(2) },
        reports,
        eft_pending: eft.count,
        kyc_pending: kyc.count,
        listings,
        leads,
        referrals: refStats,
        recent_audit: recentAudit
    });
});

// GET /api/admin/eft-pending  — list pending EFT payments (admin)
router.get('/admin/eft-pending', requireAuth, (req, res) => {
    if (!isAdmin(req.user)) return res.status(403).json({ error: true, code: 'FORBIDDEN', message: 'Admin only.' });
    const db = getDb();
    const pending = db.prepare(`
        SELECT p.id, p.amount, p.created_at, u.email, u.full_name,
               r.id AS report_id
        FROM payments p
        JOIN users u ON u.id = p.user_id
        LEFT JOIN reports r ON r.payment_id = p.id
        WHERE p.method = 'manual_eft' AND p.status = 'pending'
        ORDER BY p.created_at ASC
    `).all();
    res.json(pending);
});

module.exports = router;
