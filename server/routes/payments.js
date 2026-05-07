const express        = require('express');
const crypto         = require('crypto');
const { getDb }      = require('../db/database');
const { requireAuth }= require('../middleware/auth');
const paymentService = require('../services/paymentService');
const pdfService     = require('../services/pdfService');
const emailService   = require('../services/emailService');

const SUBSCRIPTION_PRICE_CENTS = 9900; // R99.00

const router = express.Router();

const REPORT_PRICE_CENTS = 19900; // R199.00

function audit(db, userId, action, req, details = null) {
    db.prepare('INSERT INTO audit_log (user_id, action, ip_address, user_agent, details) VALUES (?,?,?,?,?)')
      .run(userId, action, req.ip, req.get('user-agent') || '', details ? JSON.stringify(details) : null);
}

// POST /api/create-order
router.post('/create-order', requireAuth, (req, res) => {
    const { inputs, results } = req.body;
    if (!inputs || !results)
        return res.status(400).json({ error: true, code: 'VALIDATION_ERROR', message: 'inputs and results are required.' });

    const db = getDb();

    const reportRow = db.prepare(
        'INSERT INTO reports (user_id, inputs_json, results_json, status) VALUES (?,?,?,?)'
    ).run(req.user.id, JSON.stringify(inputs), JSON.stringify(results), 'pending');

    const paymentRow = db.prepare(
        'INSERT INTO payments (user_id, amount, method, status) VALUES (?,?,?,?)'
    ).run(req.user.id, REPORT_PRICE_CENTS, 'payfast', 'pending');

    // Associate payment with report
    db.prepare('UPDATE reports SET payment_id = ? WHERE id = ?').run(paymentRow.lastInsertRowid, reportRow.lastInsertRowid);

    const pfForm = paymentService.buildPayFastForm({
        paymentId:   paymentRow.lastInsertRowid,
        reportId:    reportRow.lastInsertRowid,
        userId:      req.user.id,
        email:       req.user.email,
        fullName:    req.user.full_name || '',
        amountCents: REPORT_PRICE_CENTS
    });

    audit(db, req.user.id, 'create_order', req, { paymentId: paymentRow.lastInsertRowid });
    res.json({ paymentId: paymentRow.lastInsertRowid, pfForm });
});

// POST /webhook/payfast  — PayFast ITN
router.post('/payfast-itn', express.urlencoded({ extended: false }), async (req, res) => {
    // Always respond 200 first — PayFast retries on non-200
    res.sendStatus(200);

    const db = getDb();
    try {
        const valid = await paymentService.validateITN(req.body, req.ip);
        if (!valid) {
            audit(db, null, 'payfast_itn_invalid', req, req.body);
            return;
        }

        // Route: subscription vs one-time report
        if (req.body.custom_str2 === 'subscription') {
            const userId    = parseInt(req.body.custom_str1, 10);
            const paymentId = parseInt(req.body.custom_str3, 10);

            if (req.body.payment_status !== 'COMPLETE') return;

            const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
            if (!payment || payment.status === 'completed') return;

            db.prepare('UPDATE payments SET status = ?, payfast_token = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
              .run('completed', req.body.pf_payment_id || '', paymentId);
            db.prepare('UPDATE users SET ecosystem_member = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(userId);

            const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
            await emailService.sendSubscriptionConfirm(user.email, user.full_name || 'Farmer');
            audit(db, userId, 'subscription_payment', req, { paymentId });
            return;
        }

        const paymentId = parseInt(req.body.custom_str1, 10);
        const reportId  = parseInt(req.body.custom_str2, 10);

        const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
        if (!payment || payment.status === 'completed') return;

        if (req.body.payment_status !== 'COMPLETE') {
            db.prepare('UPDATE payments SET status = ? WHERE id = ?').run('failed', paymentId);
            return;
        }

        const amountReceived = Math.round(parseFloat(req.body.amount_gross) * 100);
        if (amountReceived < REPORT_PRICE_CENTS) {
            audit(db, payment.user_id, 'payfast_amount_mismatch', req, { expected: REPORT_PRICE_CENTS, received: amountReceived });
            return;
        }

        // Mark payment complete
        db.prepare('UPDATE payments SET status = ?, payfast_token = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run('completed', req.body.pf_payment_id || '', paymentId);

        // Generate PDF
        const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);
        const user   = db.prepare('SELECT * FROM users WHERE id = ?').get(payment.user_id);
        const pdfPath = await pdfService.generate(reportId, JSON.parse(report.inputs_json), JSON.parse(report.results_json));

        // Mark report paid
        db.prepare('UPDATE reports SET status = ?, pdf_path = ? WHERE id = ?').run('paid', pdfPath, reportId);

        // Email PDF
        await emailService.sendReport(user.email, user.full_name || 'Farmer', pdfPath);

        db.prepare('UPDATE reports SET status = ? WHERE id = ?').run('delivered', reportId);
        audit(db, payment.user_id, 'payment_complete', req, { paymentId, reportId });
    } catch (err) {
        console.error('PayFast ITN error:', err);
        audit(db, null, 'payfast_itn_error', req, { error: err.message });
    }
});

// POST /api/voucher/generate
router.post('/voucher/generate', requireAuth, (req, res) => {
    const db   = getDb();
    const code = crypto.randomBytes(8).toString('hex').toUpperCase();
    db.prepare('INSERT INTO vouchers (code, user_id) VALUES (?,?)').run(code, req.user.id);
    audit(db, req.user.id, 'voucher_generated', req, { code });
    res.json({ code });
});

// POST /api/voucher/redeem
router.post('/voucher/redeem', requireAuth, async (req, res) => {
    const { code, inputs, results } = req.body;
    if (!code) return res.status(400).json({ error: true, code: 'VALIDATION_ERROR', message: 'Voucher code is required.' });

    const db      = getDb();
    const voucher = db.prepare('SELECT * FROM vouchers WHERE code = ? AND used = 0').get(code.toUpperCase().trim());
    if (!voucher)
        return res.status(400).json({ error: true, code: 'INVALID_VOUCHER', message: 'Invalid or already-used voucher code.' });

    db.prepare('UPDATE vouchers SET used = 1, user_id = ? WHERE id = ?').run(req.user.id, voucher.id);

    const reportRow = db.prepare(
        'INSERT INTO reports (user_id, inputs_json, results_json, status) VALUES (?,?,?,?)'
    ).run(req.user.id, JSON.stringify(inputs || {}), JSON.stringify(results || {}), 'pending');

    const pdfPath = await pdfService.generate(reportRow.lastInsertRowid, inputs || {}, results || {});
    db.prepare('UPDATE reports SET status = ?, pdf_path = ? WHERE id = ?').run('paid', pdfPath, reportRow.lastInsertRowid);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    await emailService.sendReport(user.email, user.full_name || 'Farmer', pdfPath);
    db.prepare('UPDATE reports SET status = ? WHERE id = ?').run('delivered', reportRow.lastInsertRowid);

    audit(db, req.user.id, 'voucher_redeemed', req, { code, reportId: reportRow.lastInsertRowid });
    res.json({ success: true, pdfPath });
});

// POST /api/create-subscription  — start R99/month PayFast subscription
router.post('/create-subscription', requireAuth, (req, res) => {
    const db = getDb();

    const paymentRow = db.prepare(
        'INSERT INTO payments (user_id, amount, method, status) VALUES (?,?,?,?)'
    ).run(req.user.id, SUBSCRIPTION_PRICE_CENTS, 'payfast_subscription', 'pending');

    const pfForm = paymentService.buildSubscriptionForm({
        paymentId: paymentRow.lastInsertRowid,
        userId:    req.user.id,
        email:     req.user.email,
        fullName:  req.user.full_name || ''
    });

    audit(db, req.user.id, 'subscription_initiated', req, { paymentId: paymentRow.lastInsertRowid });
    res.json({ paymentId: paymentRow.lastInsertRowid, pfForm });
});

// POST /api/upgrade-membership  — kept for backwards compat; real path is create-subscription
router.post('/upgrade-membership', requireAuth, (req, res) => {
    const db = getDb();
    db.prepare('UPDATE users SET ecosystem_member = 1 WHERE id = ?').run(req.user.id);
    audit(db, req.user.id, 'membership_upgrade', req);
    res.json({ success: true });
});

// POST /api/eft-notify  — farmer submits proof-of-payment email reference
// Creates a pending payment record so admin can manually verify and trigger dispatch
router.post('/eft-notify', requireAuth, (req, res) => {
    const { reference, amount_zar, inputs, results } = req.body;
    if (!reference)
        return res.status(400).json({ error: true, code: 'VALIDATION_ERROR', message: 'Bank reference is required.' });

    const db = getDb();

    const reportRow = db.prepare(
        'INSERT INTO reports (user_id, inputs_json, results_json, status) VALUES (?,?,?,?)'
    ).run(req.user.id, JSON.stringify(inputs || {}), JSON.stringify(results || {}), 'pending');

    const paymentRow = db.prepare(
        'INSERT INTO payments (user_id, amount, method, status) VALUES (?,?,?,?)'
    ).run(req.user.id, Math.round((amount_zar || 199) * 100), 'manual_eft', 'pending');

    db.prepare('UPDATE reports SET payment_id = ? WHERE id = ?').run(paymentRow.lastInsertRowid, reportRow.lastInsertRowid);

    audit(db, req.user.id, 'eft_notify', req, { reference, reportId: reportRow.lastInsertRowid, paymentId: paymentRow.lastInsertRowid });

    res.json({
        success:  true,
        reportId: reportRow.lastInsertRowid,
        message:  'EFT notification received. Your report will be emailed within 2 hours of payment verification.'
    });
});

// POST /api/admin/eft-confirm  — admin confirms EFT received and triggers PDF + email
// Protected by admin check (user_id === 1 for now — replace with role field later)
router.post('/admin/eft-confirm', requireAuth, async (req, res) => {
    if (req.user.id !== 1)
        return res.status(403).json({ error: true, code: 'FORBIDDEN', message: 'Admin only.' });

    const { payment_id } = req.body;
    if (!payment_id)
        return res.status(400).json({ error: true, code: 'VALIDATION_ERROR', message: 'payment_id required.' });

    const db      = getDb();
    const payment = db.prepare('SELECT * FROM payments WHERE id = ? AND method = ? AND status = ?').get(payment_id, 'manual_eft', 'pending');
    if (!payment)
        return res.status(404).json({ error: true, code: 'NOT_FOUND', message: 'Pending EFT payment not found.' });

    db.prepare('UPDATE payments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('completed', payment_id);

    const report = db.prepare('SELECT * FROM reports WHERE payment_id = ? AND user_id = ?').get(payment_id, payment.user_id);
    const user   = db.prepare('SELECT * FROM users WHERE id = ?').get(payment.user_id);

    const pdfPath = await pdfService.generate(report.id, JSON.parse(report.inputs_json), JSON.parse(report.results_json));
    db.prepare('UPDATE reports SET status = ?, pdf_path = ? WHERE id = ?').run('paid', pdfPath, report.id);

    await emailService.sendReport(user.email, user.full_name || 'Farmer', pdfPath);
    db.prepare('UPDATE reports SET status = ? WHERE id = ?').run('delivered', report.id);

    audit(db, req.user.id, 'eft_confirmed', req, { payment_id, reportId: report.id });
    res.json({ success: true, reportId: report.id });
});

module.exports = router;
