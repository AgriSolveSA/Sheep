/**
 * Seed script — inserts test data for development.
 * Usage: node scripts/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
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
    "ALTER TABLE guides ADD COLUMN description TEXT",
    "ALTER TABLE listings ADD COLUMN payment_id INTEGER",
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

// Test listing — generate seed photo if it doesn't exist yet
const seedImg = path.join(__dirname, '..', 'uploads', 'listings', 'seed-merino-ewes.png');
if (!fs.existsSync(seedImg)) {
    const zlib = require('zlib');
    const W = 400, H = 280;
    const pixels = Buffer.alloc(W * H * 3);
    const px = (x, y, r, g, b) => { if (x<0||x>=W||y<0||y>=H) return; const i=(y*W+x)*3; pixels[i]=r;pixels[i+1]=g;pixels[i+2]=b; };
    const fillRect = (x1,y1,x2,y2,r,g,b) => { for(let y=y1;y<=y2;y++) for(let x=x1;x<=x2;x++) px(x,y,r,g,b); };
    const fillEllipse = (cx,cy,rx,ry,r,g,b,tex) => { for(let y=cy-ry;y<=cy+ry;y++) for(let x=cx-rx;x<=cx+rx;x++) { const dx=(x-cx)/rx,dy=(y-cy)/ry; if(dx*dx+dy*dy<=1){if(tex){const n=((x*11+y*17)%30);const v=n<10?230:n<20?245:255;px(x,y,v,v,v);}else px(x,y,r,g,b);}}};
    const fillCircle = (cx,cy,r2,r,g,b) => { for(let y=cy-r2;y<=cy+r2;y++) for(let x=cx-r2;x<=cx+r2;x++) if((x-cx)**2+(y-cy)**2<=r2*r2) px(x,y,r,g,b); };
    for(let y=0;y<H;y++){const t=y/H;for(let x=0;x<W;x++) px(x,y,Math.round(120+t*20),Math.round(185+t*10),Math.round(235-t*50));}
    for(let y=Math.floor(H*0.62);y<H;y++){const t=(y-H*0.62)/(H*0.38);for(let x=0;x<W;x++) px(x,y,Math.round(58+t*15),Math.round(145-t*20),42);}
    fillEllipse(80,45,38,18,255,255,255,false); fillEllipse(105,38,28,16,255,255,255,false); fillEllipse(55,48,22,14,255,255,255,false);
    fillEllipse(290,55,30,14,255,255,255,false); fillEllipse(312,50,22,12,255,255,255,false);
    fillEllipse(190,158,80,52,0,0,0,true); fillEllipse(145,130,30,22,0,0,0,true); fillEllipse(175,120,28,20,0,0,0,true);
    fillEllipse(205,116,30,21,0,0,0,true); fillEllipse(232,122,26,19,0,0,0,true); fillEllipse(255,133,25,18,0,0,0,true);
    fillRect(250,128,272,158,190,175,155); fillEllipse(284,140,30,26,180,160,138,false);
    fillEllipse(262,125,10,7,160,135,115,false); fillEllipse(262,125,7,4,200,160,150,false);
    fillCircle(292,134,5,30,20,10); fillCircle(292,134,3,255,255,255); fillCircle(293,133,1,10,10,10);
    fillCircle(308,148,3,140,110,95); fillCircle(300,150,2,140,110,95);
    fillRect(142,200,157,242,80,70,60); fillRect(165,200,180,242,80,70,60); fillRect(205,200,220,242,80,70,60); fillRect(228,200,243,242,80,70,60);
    fillRect(142,238,157,246,35,30,25); fillRect(165,238,180,246,35,30,25); fillRect(205,238,220,246,35,30,25); fillRect(228,238,243,246,35,30,25);
    fillEllipse(112,155,14,12,0,0,0,true);
    function crc32b(buf){const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c;}let c=0xFFFFFFFF;for(let i=0;i<buf.length;i++)c=t[(c^buf[i])&0xFF]^(c>>>8);return(c^0xFFFFFFFF)>>>0;}
    function pngChunk(type,data){const tb=Buffer.from(type,'ascii');const lb=Buffer.alloc(4);lb.writeUInt32BE(data.length);const cb=Buffer.alloc(4);cb.writeUInt32BE(crc32b(Buffer.concat([tb,data])));return Buffer.concat([lb,tb,data,cb]);}
    const sig=Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
    const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(W,0);ihdr.writeUInt32BE(H,4);ihdr[8]=8;ihdr[9]=2;
    const rows=[];for(let y=0;y<H;y++){const row=Buffer.alloc(1+W*3);row[0]=0;pixels.copy(row,1,y*W*3,(y+1)*W*3);rows.push(row);}
    const comp=zlib.deflateSync(Buffer.concat(rows),{level:6});
    fs.writeFileSync(seedImg,Buffer.concat([sig,pngChunk('IHDR',ihdr),pngChunk('IDAT',comp),pngChunk('IEND',Buffer.alloc(0))]));
    console.log('Seed sheep photo generated.');
}

const seedImgJson = JSON.stringify(['/uploads/listings/seed-merino-ewes.png']);
const existingListing = db.prepare('SELECT id FROM listings WHERE category = ? AND user_id = ?').get('sheep', user.id);
if (!existingListing) {
    db.prepare(`
        INSERT INTO listings (user_id, category, title, description, price, province, status, images)
        VALUES (?, 'sheep', '50x Merino Ewes — Northern Cape', 'Well-conditioned, vaccinated Merino ewes, 3-5 years', 2800, 'Northern Cape', 'active', ?)
    `).run(user.id, seedImgJson);
} else {
    // Backfill image if listing was seeded without one
    db.prepare('UPDATE listings SET images = ? WHERE id = ? AND (images IS NULL OR images = \'\')').run(seedImgJson, existingListing.id);
}

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
        INSERT OR IGNORE INTO guides (title, description, category, price, is_vet_reviewed)
        VALUES (?, ?, ?, ?, 1)
    `).run(g.title, g.desc, g.category, g.price);
    db.prepare('UPDATE guides SET description = ? WHERE title = ? AND (description IS NULL OR description = \'\')').run(g.desc, g.title);
}
const guideCount = db.prepare('SELECT COUNT(*) as n FROM guides').get().n;
console.log(`${guideCount} guides in database.`);

console.log('Seed complete.');
console.log('Test login: test@shepherdai.co.za / Test1234!');
console.log(`Test user referral code: ${refCode}`);
console.log('Test voucher: TESTCODE');
console.log('5 digital guides seeded.');
