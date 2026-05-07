require('dotenv').config();
const express = require('express');
const path    = require('path');
const fs      = require('fs');

const logger      = require('./middleware/logger');
const authRoutes  = require('./routes/auth');
const calcRoutes  = require('./routes/calculate');
const payRoutes   = require('./routes/payments');
const repRoutes   = require('./routes/reports');
const { getDb }   = require('./db/database');
const { runBackup }= require('./services/backupService');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Security headers ────────────────────────────────────────────────────────
app.set('trust proxy', 1);
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options',           'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options',    'nosniff');
    res.setHeader('X-XSS-Protection',          '1; mode=block');
    res.setHeader('Referrer-Policy',           'strict-origin-when-cross-origin');
    next();
});

// ─── Body parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
// Note: PayFast ITN uses urlencoded — handled inside payments route

// ─── Request logging ─────────────────────────────────────────────────────────
app.use(logger);

// ─── Static frontend (Vite build) ────────────────────────────────────────────
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
}

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    try {
        getDb().prepare('SELECT 1').get();
        res.json({ status: 'ok', timestamp: new Date().toISOString(), db: 'connected' });
    } catch {
        res.status(500).json({ status: 'error', db: 'disconnected' });
    }
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api',             authRoutes);
app.use('/api/calculate',   calcRoutes);
app.use('/api',             payRoutes);
app.use('/api/reports',     repRoutes);
app.use('/api/report',      repRoutes);

// PayFast ITN endpoint (outside /api prefix)
app.use('/webhook',         payRoutes);

// ─── SPA fallback (serve React app for unknown routes) ───────────────────────
if (fs.existsSync(distDir)) {
    app.get('*', (req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
    });
}

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: true, code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`ShepherdAI server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);

    // Initialise DB schema on first boot
    try {
        const db = getDb();
        const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
        db.exec(schema);
        console.log('Database schema verified.');
    } catch (err) {
        console.error('Database init error:', err);
    }

    // Schedule daily backup at 2 AM
    const now    = new Date();
    const next2am= new Date(now); next2am.setHours(2, 0, 0, 0);
    if (next2am <= now) next2am.setDate(next2am.getDate() + 1);
    const msUntil2am = next2am - now;
    setTimeout(() => {
        runBackup();
        setInterval(runBackup, 24 * 60 * 60 * 1000);
    }, msUntil2am);
});

module.exports = app;
