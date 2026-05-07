const express        = require('express');
const path           = require('path');
const fs             = require('fs');
const { getDb }      = require('../db/database');
const { requireAuth }= require('../middleware/auth');

const router = express.Router();

function audit(db, userId, action, req, details = null) {
    db.prepare('INSERT INTO audit_log (user_id, action, ip_address, user_agent, details) VALUES (?,?,?,?,?)')
      .run(userId, action, req.ip, req.get('user-agent') || '', details ? JSON.stringify(details) : null);
}

// GET /api/reports
router.get('/', requireAuth, (req, res) => {
    const db   = getDb();
    const rows = db.prepare(
        'SELECT id, status, pdf_path, created_at FROM reports WHERE user_id = ? ORDER BY created_at DESC'
    ).all(req.user.id);
    res.json(rows);
});

// GET /api/report/:id/download
router.get('/:id/download', requireAuth, (req, res) => {
    const db     = getDb();
    const report = db.prepare('SELECT * FROM reports WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);

    if (!report)
        return res.status(404).json({ error: true, code: 'NOT_FOUND', message: 'Report not found.' });
    if (report.status !== 'paid' && report.status !== 'delivered')
        return res.status(402).json({ error: true, code: 'NOT_PAID', message: 'Report not yet paid.' });
    if (!report.pdf_path || !fs.existsSync(report.pdf_path))
        return res.status(404).json({ error: true, code: 'PDF_NOT_FOUND', message: 'PDF file not found.' });

    audit(db, req.user.id, 'report_download', req, { reportId: report.id });
    res.download(path.resolve(report.pdf_path), `shepherdai-report-${report.id}.pdf`);
});

module.exports = router;
