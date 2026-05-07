/**
 * Seed script — inserts test data for development.
 * Usage: node scripts/seed.js
 */
require('dotenv').config({ path: '../.env' });
const bcrypt   = require('bcrypt');
const { getDb }= require('../db/database');
const fs       = require('fs');
const path     = require('path');

// Ensure schema exists
const db     = getDb();
const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
db.exec(schema);

// Test user
const hash = bcrypt.hashSync('Test1234!', 10);
db.prepare(`
    INSERT OR IGNORE INTO users (email, password_hash, full_name, mobile, verified)
    VALUES (?, ?, ?, ?, 1)
`).run('test@shepherdai.co.za', hash, 'Test Farmer', '0821234567');
const user = db.prepare('SELECT id FROM users WHERE email = ?').get('test@shepherdai.co.za');

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

console.log('Seed complete.');
console.log('Test login: test@shepherdai.co.za / Test1234!');
console.log('Test voucher: TESTCODE');
