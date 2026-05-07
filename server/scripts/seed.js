/**
 * Seed script — inserts test data for development.
 * Usage: node scripts/seed.js
 */
require('dotenv').config({ path: '../.env' });
const bcrypt   = require('bcrypt');
const crypto   = require('crypto');
const { getDb }= require('../db/database');
const fs       = require('fs');
const path     = require('path');

const db     = getDb();
const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
db.exec(schema);

// Column migrations (idempotent)
const MIGRATIONS = [
    "ALTER TABLE users ADD COLUMN referral_code TEXT",
    "ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0",
];
for (const sql of MIGRATIONS) {
    try { db.prepare(sql).run(); } catch (_) {}
}

// Admin / test user
const hash = bcrypt.hashSync('Test1234!', 10);
const refCode = crypto.randomBytes(4).toString('hex').toUpperCase();
db.prepare(`
    INSERT OR IGNORE INTO users (email, password_hash, full_name, mobile, verified, is_admin, referral_code)
    VALUES (?, ?, ?, ?, 1, 1, ?)
`).run('test@shepherdai.co.za', hash, 'Test Farmer', '0821234567', refCode);
const user = db.prepare('SELECT id FROM users WHERE email = ?').get('test@shepherdai.co.za');

// Ensure referral_code set (if user already existed)
if (!db.prepare('SELECT referral_code FROM users WHERE id = ?').get(user.id)?.referral_code) {
    db.prepare('UPDATE users SET referral_code = ? WHERE id = ?').run(refCode, user.id);
}

// Test voucher
db.prepare(`INSERT OR IGNORE INTO vouchers (code, amount) VALUES ('TESTCODE', 19900)`).run();

// Test report
const inputs  = { landHa: 100, flockSize: 150, breed: 'Merino', productionSystem: 'semiIntensive', marketChannel: 'auction', feedSource: 'mixed' };
const results = { summary: { totalRevenue: 185000, totalCosts: 142000, netProfit: 43000, profitMargin: 23.2, breakEvenLambs: 95, status: 'PROFITABLE' } };
db.prepare(`
    INSERT INTO reports (user_id, inputs_json, results_json, status)
    VALUES (?, ?, ?, 'delivered')
`).run(user.id, JSON.stringify(inputs), JSON.stringify(results));

// Test listing
db.prepare(`
    INSERT INTO listings (user_id, category, title, description, price, province, status)
    VALUES (?, 'sheep', '50x Merino Ewes — Northern Cape', 'Well-conditioned, vaccinated Merino ewes, 3-5 years', 2800, 'Northern Cape', 'active')
`).run(user.id);

// Digital guides (5 core guides — PDFs must be created by owner)
const guides = [
    { title: 'Sheep Husbandry Handbook', category: 'sheep', price: 4900, desc: 'Complete guide to profitable Merino and Dorper farming — from weaning to market.' },
    { title: 'Livestock Vaccination Schedule', category: 'health', price: 4900, desc: 'Annual vaccination calendar for sheep, cattle, and goats. Province-specific disease risks.' },
    { title: 'Farm Fencing Audit & Repair Guide', category: 'infrastructure', price: 4900, desc: 'How to audit, prioritise, and fix fencing to reduce stock losses and theft.' },
    { title: 'Feed Management & Cost Control', category: 'feed', price: 4900, desc: 'Optimise supplementary feeding schedules. Reduce feed costs by 20-35%.' },
    { title: 'Ram & Bull Selection Guide', category: 'genetics', price: 4900, desc: 'How to evaluate and select breeding males for improved flock/herd performance.' },
];

for (const g of guides) {
    db.prepare(`
        INSERT OR IGNORE INTO guides (title, category, price, is_vet_reviewed)
        VALUES (?, ?, ?, 1)
    `).run(g.title, g.category, g.price);
}

console.log('Seed complete.');
console.log('Test login: test@shepherdai.co.za / Test1234!');
console.log(`Test user referral code: ${refCode}`);
console.log('Test voucher: TESTCODE');
console.log('5 digital guides seeded.');
