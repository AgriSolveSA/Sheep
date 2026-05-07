const express        = require('express');
const path           = require('path');
const fs             = require('fs');
const { getDb }      = require('../db/database');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const { kycUpload }  = require('../services/uploadService');

const router = express.Router();

const PLAN_PRICES = { free: 0, standard: 1000, premium: 3000, urgent: 5000 }; // cents
const CATEGORIES  = ['sheep', 'cattle', 'goats', 'dairy', 'pigs', 'poultry', 'bees', 'equipment', 'feed', 'land', 'services', 'supplier'];
const PROVINCES   = ['Western Cape', 'Northern Cape', 'Eastern Cape', 'KwaZulu-Natal', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Gauteng'];

const BANNED_WORDS = ['scam', 'fraud', 'fake', 'stolen', 'illegal'];

function audit(db, userId, action, req, details = null) {
    db.prepare('INSERT INTO audit_log (user_id, action, ip_address, user_agent, details) VALUES (?,?,?,?,?)')
      .run(userId, action, req.ip, req.get('user-agent') || '', details ? JSON.stringify(details) : null);
}

function isAdmin(user) { return user.id === 1 || user.is_admin === 1; }

function moderateText(...fields) {
    const combined = fields.join(' ').toLowerCase();
    return BANNED_WORDS.some(w => combined.includes(w));
}

// GET /api/listings  — browse (province + category filter)
router.get('/listings', optionalAuth, (req, res) => {
    const db = getDb();
    let sql  = `
        SELECT l.id, l.category, l.title, l.price, l.price_negotiable,
               l.province, l.district, l.plan_type, l.views,
               l.created_at, l.expires_at, u.full_name AS seller_name
        FROM listings l
        JOIN users u ON u.id = l.user_id
        WHERE l.status = 'active'
    `;
    const params = [];

    if (req.query.province && PROVINCES.includes(req.query.province)) {
        sql += ' AND l.province = ?'; params.push(req.query.province);
    }
    if (req.query.category && CATEGORIES.includes(req.query.category)) {
        sql += ' AND l.category = ?'; params.push(req.query.category);
    }
    if (req.query.q) {
        sql += ' AND (l.title LIKE ? OR l.description LIKE ?)';
        const term = `%${req.query.q}%`;
        params.push(term, term);
    }

    sql += ' ORDER BY l.plan_type DESC, l.created_at DESC LIMIT 60';
    const listings = db.prepare(sql).all(...params);
    res.json(listings);
});

// GET /api/listings/:id  — single listing detail + increment views
router.get('/listings/:id', optionalAuth, (req, res) => {
    const db      = getDb();
    const listing = db.prepare(`
        SELECT l.*, u.full_name AS seller_name, u.mobile AS seller_mobile
        FROM listings l JOIN users u ON u.id = l.user_id
        WHERE l.id = ? AND (l.status = 'active' OR l.user_id = ?)
    `).get(parseInt(req.params.id, 10), req.user?.id || -1);

    if (!listing)
        return res.status(404).json({ error: true, code: 'NOT_FOUND', message: 'Listing not found.' });

    // Increment views
    db.prepare('UPDATE listings SET views = views + 1 WHERE id = ?').run(listing.id);
    res.json(listing);
});

// POST /api/listings  — create listing
router.post('/listings', requireAuth, (req, res) => {
    const { category, title, description, price, price_negotiable, province, district, plan_type } = req.body;

    const errors = {};
    if (!category || !CATEGORIES.includes(category))       errors.category = 'Invalid category.';
    if (!title || title.trim().length < 5)                  errors.title = 'Title must be at least 5 characters.';
    if (!province || !PROVINCES.includes(province))        errors.province = 'Invalid province.';

    if (Object.keys(errors).length)
        return res.status(400).json({ error: true, code: 'VALIDATION_ERROR', message: 'Invalid inputs.', details: errors });

    const db   = getDb();
    const user = db.prepare('SELECT kyc_status, ecosystem_member FROM users WHERE id = ?').get(req.user.id);

    // KYC required for non-free listings
    const plan = PLAN_PRICES[plan_type] !== undefined ? plan_type : 'free';
    if (plan !== 'free' && user.kyc_status !== 'verified')
        return res.status(403).json({ error: true, code: 'KYC_REQUIRED', message: 'KYC verification required for paid listing plans. Submit your ID via the verification page.' });

    // Content moderation
    if (moderateText(title, description || ''))
        return res.status(400).json({ error: true, code: 'CONTENT_REJECTED', message: 'Listing contains prohibited content.' });

    const priceCents = PLAN_PRICES[plan];
    const expiryDays = plan === 'premium' ? 60 : 30;
    const expiresAt  = new Date(Date.now() + expiryDays * 86400000).toISOString();
    const status     = priceCents === 0 ? 'active' : 'pending';

    const row = db.prepare(`
        INSERT INTO listings (user_id, category, title, description, price, price_negotiable, province, district, plan_type, status, expires_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `).run(
        req.user.id,
        category,
        title.trim(),
        (description || '').trim(),
        price ? parseFloat(price) : null,
        price_negotiable !== false ? 1 : 0,
        province,
        district || null,
        plan,
        status,
        expiresAt
    );

    // If paid plan, create PayFast order for upgrade fee
    let pfForm = null;
    if (priceCents > 0) {
        const paymentRow = db.prepare(
            'INSERT INTO payments (user_id, amount, method, status) VALUES (?,?,?,?)'
        ).run(req.user.id, priceCents, 'payfast', 'pending');

        pfForm = paymentService.buildPayFastForm({
            paymentId:   paymentRow.lastInsertRowid,
            reportId:    row.lastInsertRowid,
            userId:      req.user.id,
            email:       req.user.email,
            fullName:    req.user.full_name || '',
            amountCents: priceCents,
            itemName:    `ShepherdAI Listing — ${plan} plan`,
            customType:  'listing_upgrade'
        });
        db.prepare('UPDATE listings SET payment_id = ? WHERE id = ?').run(paymentRow.lastInsertRowid, row.lastInsertRowid);
    }

    audit(db, req.user.id, 'listing_created', req, { listingId: row.lastInsertRowid, plan });
    res.status(201).json({ id: row.lastInsertRowid, status, pfForm });
});

// DELETE /api/listings/:id  — remove own listing
router.delete('/listings/:id', requireAuth, (req, res) => {
    const db      = getDb();
    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(parseInt(req.params.id, 10));
    if (!listing)
        return res.status(404).json({ error: true, code: 'NOT_FOUND', message: 'Listing not found.' });
    if (listing.user_id !== req.user.id && !isAdmin(req.user))
        return res.status(403).json({ error: true, code: 'FORBIDDEN', message: 'You can only delete your own listings.' });

    db.prepare("UPDATE listings SET status = 'removed' WHERE id = ?").run(listing.id);
    audit(db, req.user.id, 'listing_removed', req, { listingId: listing.id });
    res.json({ success: true });
});

// POST /api/kyc/upload  — submit KYC documents
router.post('/kyc/upload', requireAuth, kycUpload.fields([
    { name: 'id_document', maxCount: 1 },
    { name: 'proof_of_address', maxCount: 1 }
]), (req, res) => {
    if (!req.files?.id_document)
        return res.status(400).json({ error: true, code: 'VALIDATION_ERROR', message: 'ID document is required.' });

    const db = getDb();

    const insert = db.prepare(
        'INSERT INTO kyc_documents (user_id, document_type, file_path) VALUES (?,?,?)'
    );

    if (req.files.id_document) {
        insert.run(req.user.id, 'id_document', req.files.id_document[0].path);
    }
    if (req.files.proof_of_address) {
        insert.run(req.user.id, 'proof_of_address', req.files.proof_of_address[0].path);
    }

    db.prepare("UPDATE users SET kyc_status = 'submitted' WHERE id = ?").run(req.user.id);
    audit(db, req.user.id, 'kyc_submitted', req);
    res.json({ success: true, message: 'KYC documents submitted. Verification typically takes 24 hours.' });
});

// ─── Admin routes ─────────────────────────────────────────────────────────────

// GET /api/admin/listings  — pending listings (admin)
router.get('/admin/listings', requireAuth, (req, res) => {
    if (!isAdmin(req.user)) return res.status(403).json({ error: true, code: 'FORBIDDEN', message: 'Admin only.' });
    const db = getDb();
    const pending = db.prepare(`
        SELECT l.*, u.email AS seller_email, u.full_name AS seller_name
        FROM listings l JOIN users u ON u.id = l.user_id
        WHERE l.status = 'pending'
        ORDER BY l.created_at ASC
    `).all();
    res.json(pending);
});

// POST /api/admin/listings/:id/approve
router.post('/admin/listings/:id/approve', requireAuth, (req, res) => {
    if (!isAdmin(req.user)) return res.status(403).json({ error: true, code: 'FORBIDDEN', message: 'Admin only.' });
    const db = getDb();
    db.prepare("UPDATE listings SET status = 'active', starts_at = CURRENT_TIMESTAMP WHERE id = ?").run(parseInt(req.params.id, 10));
    audit(db, req.user.id, 'listing_approved', req, { listingId: parseInt(req.params.id, 10) });
    res.json({ success: true });
});

// POST /api/admin/listings/:id/reject
router.post('/admin/listings/:id/reject', requireAuth, (req, res) => {
    if (!isAdmin(req.user)) return res.status(403).json({ error: true, code: 'FORBIDDEN', message: 'Admin only.' });
    const db = getDb();
    db.prepare("UPDATE listings SET status = 'rejected' WHERE id = ?").run(parseInt(req.params.id, 10));
    audit(db, req.user.id, 'listing_rejected', req, { listingId: parseInt(req.params.id, 10) });
    res.json({ success: true });
});

// GET /api/admin/kyc  — pending KYC docs
router.get('/admin/kyc', requireAuth, (req, res) => {
    if (!isAdmin(req.user)) return res.status(403).json({ error: true, code: 'FORBIDDEN', message: 'Admin only.' });
    const db = getDb();
    const docs = db.prepare(`
        SELECT k.*, u.email, u.full_name
        FROM kyc_documents k JOIN users u ON u.id = k.user_id
        WHERE k.verified = 0
        ORDER BY k.created_at ASC
    `).all();
    res.json(docs);
});

// POST /api/admin/kyc/:id/verify
router.post('/admin/kyc/:id/verify', requireAuth, (req, res) => {
    if (!isAdmin(req.user)) return res.status(403).json({ error: true, code: 'FORBIDDEN', message: 'Admin only.' });
    const { approved } = req.body;
    const db = getDb();
    const doc = db.prepare('SELECT * FROM kyc_documents WHERE id = ?').get(parseInt(req.params.id, 10));
    if (!doc) return res.status(404).json({ error: true, code: 'NOT_FOUND', message: 'Document not found.' });

    db.prepare('UPDATE kyc_documents SET verified = 1, verified_by = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(req.user.id, doc.id);

    if (approved) {
        db.prepare("UPDATE users SET kyc_status = 'verified' WHERE id = ?").run(doc.user_id);
    } else {
        db.prepare("UPDATE users SET kyc_status = 'rejected' WHERE id = ?").run(doc.user_id);
    }

    audit(db, req.user.id, approved ? 'kyc_approved' : 'kyc_rejected', req, { docId: doc.id, userId: doc.user_id });
    res.json({ success: true });
});

module.exports = router;
