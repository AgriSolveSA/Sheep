const express        = require('express');
const fs             = require('fs');
const { getDb }      = require('../db/database');
const { requireAuth } = require('../middleware/auth');
const paymentService = require('../services/paymentService');

const router = express.Router();

function audit(db, userId, action, req, details = null) {
    db.prepare('INSERT INTO audit_log (user_id, action, ip_address, user_agent, details) VALUES (?,?,?,?,?)')
      .run(userId, action, req.ip, req.get('user-agent') || '', details ? JSON.stringify(details) : null);
}

// GET /api/guides  — list all available guides
router.get('/guides', (req, res) => {
    const db     = getDb();
    const guides = db.prepare('SELECT id, title, category, price, is_vet_reviewed, description FROM guides ORDER BY category, title').all();
    res.json(guides);
});

// GET /api/guides/my  — list guides the authenticated user has purchased
router.get('/guides/my', requireAuth, (req, res) => {
    const db      = getDb();
    const purchased = db.prepare(`
        SELECT g.id, g.title, g.category, g.price, ug.purchased_at
        FROM user_guides ug
        JOIN guides g ON g.id = ug.guide_id
        WHERE ug.user_id = ?
        ORDER BY ug.purchased_at DESC
    `).all(req.user.id);
    res.json(purchased);
});

// GET /api/guides/:id/download  — download purchased guide PDF
router.get('/guides/:id/download', requireAuth, (req, res) => {
    const db        = getDb();
    const guideId   = parseInt(req.params.id, 10);
    const guide     = db.prepare('SELECT * FROM guides WHERE id = ?').get(guideId);

    if (!guide)
        return res.status(404).json({ error: true, code: 'NOT_FOUND', message: 'Guide not found.' });

    const purchase = db.prepare('SELECT 1 FROM user_guides WHERE user_id = ? AND guide_id = ?').get(req.user.id, guideId);
    if (!purchase)
        return res.status(403).json({ error: true, code: 'NOT_PURCHASED', message: 'You have not purchased this guide.' });

    if (!guide.pdf_path || !fs.existsSync(guide.pdf_path))
        return res.status(503).json({ error: true, code: 'PDF_UNAVAILABLE', message: 'Guide PDF is being prepared. Please check back shortly.' });

    audit(db, req.user.id, 'guide_download', req, { guideId });
    res.download(guide.pdf_path, `shepherdai-guide-${guideId}.pdf`);
});

// POST /api/guides/purchase  — initiate PayFast payment for a guide
router.post('/guides/purchase', requireAuth, (req, res) => {
    const { guide_id } = req.body;
    if (!guide_id)
        return res.status(400).json({ error: true, code: 'VALIDATION_ERROR', message: 'guide_id is required.' });

    const db    = getDb();
    const guide = db.prepare('SELECT * FROM guides WHERE id = ?').get(parseInt(guide_id, 10));
    if (!guide)
        return res.status(404).json({ error: true, code: 'NOT_FOUND', message: 'Guide not found.' });

    const alreadyOwned = db.prepare('SELECT 1 FROM user_guides WHERE user_id = ? AND guide_id = ?').get(req.user.id, guide.id);
    if (alreadyOwned)
        return res.status(409).json({ error: true, code: 'ALREADY_PURCHASED', message: 'You already own this guide.' });

    const paymentRow = db.prepare(
        'INSERT INTO payments (user_id, amount, method, status) VALUES (?,?,?,?)'
    ).run(req.user.id, guide.price, 'payfast', 'pending');

    const pfForm = paymentService.buildPayFastForm({
        paymentId:   paymentRow.lastInsertRowid,
        reportId:    guide.id,            // reuse reportId slot for guide_id
        userId:      req.user.id,
        email:       req.user.email,
        fullName:    req.user.full_name || '',
        amountCents: guide.price,
        itemName:    guide.title,
        customType:  'guide'              // signals ITN handler
    });

    audit(db, req.user.id, 'guide_purchase_initiated', req, { guideId: guide.id, paymentId: paymentRow.lastInsertRowid });
    res.json({ paymentId: paymentRow.lastInsertRowid, pfForm });
});

module.exports = router;
