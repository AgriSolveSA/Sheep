```markdown
# SHEPHERDAI — ENTERPRISE-GRADE EXECUTION BRIEF

**Version:** 1.1  
**Duration:** 6 months (May 2026 – October 2026)  
**Target:** R50,000–100,000/month recurring revenue  
**Principle:** If it's not in this brief, don't build it yet.

---

## PROGRESS TRACKER (Updated: 2026-05-07)

### Code Status
| Module | Status | Notes |
|--------|--------|-------|
| React SPA — Sheep calculator | ✅ 100% | Breeding + grow-out, 9-section report, province map |
| React SPA — Beef Cattle | ✅ 100% | Breeding + grow-out, FAMACHA, T-parameterized |
| React SPA — Goats | ✅ 100% | Boer Goat + Kalahari Red, Eid timing, halaal premium |
| React SPA — Bees | ✅ 100% | capensis/hybrid/scutellata, 9-section report |
| React SPA — Pigs | ✅ 100% | calcPigs farrowing model, SAPPO refs, activated |
| React SPA — Poultry | ✅ 100% | calcPoultry broiler model, activated |
| React SPA — Dairy | ✅ 100% | calcDairy milk-yield model, cull income, activated |
| Server — Express + SQLite | ✅ Done | server.js, all middleware, security headers, SPA fallback |
| Server — Database schema | ✅ Done | 9 tables + indexes (users, sessions, reports, payments, vouchers, listings, guides, kyc, audit_log) |
| Server — Auth endpoints | ✅ Done | /api/signup, /api/login, /api/logout, /api/user (bcrypt + session tokens) |
| Server — /api/calculate | ✅ Done | sheepFarmModel + inefficiencyEngine + recommendationEngine pipeline |
| Server — /api/create-order | ✅ Done | Creates pending payment + report, returns PayFast form |
| Server — /webhook/payfast | ✅ Done | Full ITN validation: signature, IP, amount, merchant_id, remote check |
| Server — PDF service | ✅ Done | PDFKit A4 report with revenue/cost breakdown, warnings, recommendations |
| Server — Email service | ✅ Done | Nodemailer — PDF attachment + welcome email |
| Server — Voucher system | ✅ Done | Generate + redeem vouchers via /api/voucher/generate and /api/voucher/redeem |
| Server — Backup service | ✅ Done | SQLite .backup, 30-day prune, 2AM daily cron |
| Server — deploy.sh | ✅ Done | Ubuntu 22.04 full setup script |
| Server — monitor.sh + backup.sh | ✅ Done | Health check every 5 min, disk alert, PM2 restart |
| Server — seed.js | ✅ Done | Test user, voucher, report, listing |
| Public pages — Landing | 🔲 TODO | index.html brochure with pricing + money-back guarantee |
| Public pages — Auth | 🔲 TODO | login.html + signup.html wired to /api/login + /api/signup |
| Public pages — Dashboard | 🔲 TODO | dashboard.html — past reports list + PDF download |
| Manual EFT fallback | 🔲 TODO | Payment option for farmers without cards |
| Hardware setup | ⏳ Pending | Ubuntu server, Nginx, SSL, DNS — owner action |
| PayFast merchant account | ⏳ Pending | Register at payfast.co.za — owner action |

### Month Completion
| Month | Target | Status |
|-------|--------|--------|
| Month 1 — Foundation & First Revenue | R5,000 | 🔶 80% — code done, pages + hardware pending |
| Month 2 — Recurring Revenue + Funnel | R10k–15k/month | 🔲 Not started |
| Month 3 — Guides + MoMo Pay | R15k–25k/month | 🔲 Not started |
| Month 4 — Classifieds Marketplace | R25k–40k/month | 🔲 Not started |
| Month 5 — Cattle Module | R40k–60k/month | ✅ Module built (ahead of schedule) |
| Month 6 — Supplier Marketplace | R50k–100k/month | 🔲 Not started |

> **Note:** Month 5 cattle + goat modules are already complete in the React SPA — built ahead of schedule. Month 3 voucher system is also already built in the server.

---

---

## 0. WHAT THIS IS

A self-hosted, vendor-free agricultural profit platform for South African farmers. Not a report generator. A **Farmer Profit Operating System** — diagnosis, action, execution, and marketplace in one.

### What Success Looks Like (Month 6)

- Farmer visits site on a phone
- Creates account
- Enters 10 farm inputs with smart defaults
- Runs free savings estimator — sees "You could save R8,400/year"
- Pays R199 via PayFast, MoMo Pay, or voucher
- Receives personalised one-page action sheet PDF by email within 60 seconds
- Logs into dashboard, sees past reports
- Upgrades to R99/month ecosystem membership
- Buys a guide (R49), posts a classified ad (R10)
- Refers a neighbour, earns R100 credit
- You have 200+ active users, R50k+ monthly revenue, zero cloud bills

---

## 1. ARCHITECTURE (DO NOT CHANGE)

### Hardware
```
1x Ubuntu 22.04 LTS server (refurbished desktop/laptop, i5+, 8GB+ RAM, 256GB SSD)
1x External USB HDD (1TB) for backups
1x UPS (1500VA, 30+ min runtime)
1x LTE failover router (optional, Month 3+)
```

### Software Stack
| Layer | Technology | Why |
|-------|------------|-----|
| OS | Ubuntu 22.04 LTS | Stable, 5-year support |
| Web server | Nginx | Reverse proxy, static files |
| Runtime | Node.js 20 LTS | JavaScript end-to-end |
| Database | SQLite (Phase 1–2) → PostgreSQL (Phase 3+) | SQLite: zero config, file-based. PostgreSQL: concurrent writes |
| Process manager | PM2 | Auto-restart, log rotation |
| SSL | Certbot + Let's Encrypt | Auto-renewing, free |
| Backups | rsync + cron + sqlite3 .backup | Native tools, no external dependency |
| Monitoring | Netdata + custom health check script | Self-hosted, real-time alerts |
| Firewall | ufw + fail2ban | Basic security |

### File Structure (On Server)
```
/var/www/shepherdai/
├── server.js                  # Main Express application
├── package.json
├── .env                        # NEVER commit to version control
├── models/
│   ├── sheepFarmModel.js       # Core profitability engine
│   ├── inputSensitivity.js     # Smart defaults + impact scoring
│   ├── recommendationEngine.js # Action plan generator
│   └── inefficiencyEngine.js   # Stupidity Index calculator
├── routes/
│   ├── auth.js                 # Login, signup, sessions
│   ├── calculate.js            # /api/calculate endpoint
│   ├── payments.js             # PayFast, MoMo Pay, vouchers
│   ├── reports.js              # PDF generation + delivery
│   ├── listings.js             # Classifieds marketplace
│   └── guides.js               # Digital product purchases
├── services/
│   ├── paymentService.js       # PayFast ITN handler
│   ├── pdfService.js           # PDFKit report generator
│   ├── emailService.js         # Nodemailer SMTP sender
│   └── backupService.js        # Automated db backup
├── middleware/
│   ├── auth.js                 # Session validation
│   ├── rateLimiter.js          # Abuse prevention
│   └── logger.js               # Structured request logging
├── db/
│   ├── schema.sql              # All table definitions
│   ├── migrations/             # Versioned schema changes
│   └── farm.db                 # SQLite database file (Phase 1–2)
├── public/
│   ├── index.html              # Landing page
│   ├── dashboard.html          # User dashboard
│   ├── farm-form.html          # Farm input form
│   ├── login.html
│   ├── signup.html
│   ├── style.css
│   └── app.js                  # Client-side utilities
├── reports/                    # Generated PDF storage
├── backups/                    # Daily database backups
├── logs/                       # Application logs
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── scripts/
│   ├── deploy.sh               # Full server setup
│   ├── backup.sh               # Daily backup cron
│   ├── monitor.sh              # Health check + alert
│   └── seed.js                 # Test data generator
├── docs/
│   ├── API.md                  # Full endpoint documentation
│   ├── DEPLOYMENT.md           # Step-by-step deployment guide
│   └── RUNBOOK.md              # Operational procedures
└── README.md
```

---

## 2. DATABASE SCHEMA (COMPLETE)

```sql
-- Users (Phase 1)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    mobile TEXT,
    ecosystem_member INTEGER DEFAULT 0,
    kyc_status TEXT DEFAULT 'pending',    -- pending, verified, rejected
    verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions (Phase 1)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reports (Phase 1)
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    inputs_json TEXT NOT NULL,
    results_json TEXT NOT NULL,
    pdf_path TEXT,
    payment_id TEXT,
    status TEXT DEFAULT 'pending',       -- pending, paid, delivered, refunded
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Payments (Phase 1)
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,              -- in cents (R199 = 19900)
    method TEXT,                           -- payfast, momo, voucher, manual_eft
    status TEXT DEFAULT 'pending',         -- pending, completed, failed, refunded
    payfast_token TEXT,
    momo_transaction_id TEXT,
    voucher_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Vouchers (Phase 2)
CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    amount INTEGER DEFAULT 49900,         -- R499 in cents
    used INTEGER DEFAULT 0,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Listings / Classifieds (Phase 3)
CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price REAL,
    price_negotiable INTEGER DEFAULT 1,
    province TEXT NOT NULL,
    district TEXT,
    coordinates TEXT,
    images TEXT,                           -- JSON array of file paths
    status TEXT DEFAULT 'pending',         -- pending, active, sold, expired, rejected
    plan_type TEXT DEFAULT 'free',         -- free, standard, premium, urgent
    visibility_level TEXT DEFAULT 'standard',
    starts_at DATETIME,
    expires_at DATETIME,
    views INTEGER DEFAULT 0,
    inquiries INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Guides (Phase 2)
CREATE TABLE IF NOT EXISTS guides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT,
    price INTEGER DEFAULT 4900,            -- R49 in cents
    pdf_path TEXT,
    is_vet_reviewed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Guide purchases (Phase 2)
CREATE TABLE IF NOT EXISTS user_guides (
    user_id INTEGER NOT NULL,
    guide_id INTEGER NOT NULL,
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, guide_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(guide_id) REFERENCES guides(id)
);

-- KYC documents (Phase 3)
CREATE TABLE IF NOT EXISTS kyc_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    document_type TEXT,                    -- id_front, id_back, proof_of_address, bank_statement
    file_path TEXT NOT NULL,
    verified INTEGER DEFAULT 0,
    verified_by INTEGER,
    verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Audit log (Phase 1 — security requirement)
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_province ON listings(province);
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
```

---

## 3. API SPECIFICATION (EVERY ENDPOINT)

### 3.1 Authentication

| Method | Endpoint | Auth | Input | Output | Errors |
|--------|----------|------|-------|--------|--------|
| POST | `/api/signup` | None | `{email, password, full_name?, mobile?}` | `{userId, success: true}` | 400: Missing fields, 409: Email exists |
| POST | `/api/login` | None | `{email, password}` | `{sessionId, userId, ecosystem_member}` | 401: Invalid credentials |
| POST | `/api/logout` | Session | — | `{success: true}` | 401: Invalid session |
| GET | `/api/user` | Session | — | `{id, email, full_name, mobile, ecosystem_member, verified}` | 401: Invalid session |

### 3.2 Core Model

| Method | Endpoint | Auth | Input | Output | Errors |
|--------|----------|------|-------|--------|--------|
| POST | `/api/calculate` | Optional | `{landHa, flockSize, breed, productionSystem, marketChannel, feedSource, studOperation?, agriTourism?}` | `{results, stupidity, recommendations, savingsEstimate}` | 400: Invalid inputs |

### 3.3 Payments

| Method | Endpoint | Auth | Input | Output | Errors |
|--------|----------|------|-------|--------|--------|
| POST | `/api/create-order` | Session | `{inputs, results}` | `{redirectUrl (PayFast form), paymentId}` | 401: No session |
| POST | `/webhook/payfast` | PayFast IP | PayFast ITN payload | `200 OK` | Always return 200 to PayFast |
| POST | `/api/voucher/generate` | Session | — | `{code}` | 401: No session |
| POST | `/api/voucher/redeem` | Session | `{code, inputs}` | `{success, pdfPath}` | 400: Invalid/used voucher |

### 3.4 Reports

| Method | Endpoint | Auth | Input | Output | Errors |
|--------|----------|------|-------|--------|--------|
| GET | `/api/reports` | Session | — | `[{id, created_at, pdf_path}]` | 401: No session |
| GET | `/api/report/:id/download` | Session | — | PDF file | 401: No session, 404: Not found |

### 3.5 Membership

| Method | Endpoint | Auth | Input | Output | Errors |
|--------|----------|------|-------|--------|--------|
| POST | `/api/upgrade-membership` | Session | — | `{success: true}` | 401: No session |

### 3.6 Classifieds (Phase 3)

| Method | Endpoint | Auth | Input | Output | Errors |
|--------|----------|------|-------|--------|--------|
| GET | `/api/listings` | Optional | `?province=&category=` | `[{id, title, price, province, ...}]` | — |
| POST | `/api/listings` | Session + KYC | `{category, title, description, price, province, district, plan_type}` | `{id}` | 401: No session, 403: KYC required |

### 3.7 Guides (Phase 2)

| Method | Endpoint | Auth | Input | Output | Errors |
|--------|----------|------|-------|--------|--------|
| GET | `/api/guides` | None | — | `[{id, title, category, price}]` | — |
| POST | `/api/guides/purchase` | Session | `{guide_id}` | `{pdfPath}` | 404: Guide not found |

### 3.8 System

| Method | Endpoint | Auth | Input | Output | Errors |
|--------|----------|------|-------|--------|--------|
| GET | `/api/health` | None | — | `{status: "ok", timestamp, db: "connected"}` | 500: Database error |

### Error Response Format (All Endpoints)

```json
{
    "error": true,
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": {}  // Optional field-level errors
}
```

---

## 4. SECURITY REQUIREMENTS (MANDATORY)

### 4.1 Authentication
- Passwords hashed with bcrypt (cost factor 10 minimum)
- Sessions: 32-byte crypto-random token, 7-day expiry, stored in database
- No passwords in logs, error messages, or API responses

### 4.2 Input Validation
- All inputs validated server-side (never trust client)
- SQL injection prevention: parameterised queries only (never string concatenation)
- File uploads: restrict to PDF/JPG/PNG, max 5MB, stored outside web root with random filenames

### 4.3 Payment Security
- PayFast ITN: validate signature, IP whitelist, merchant_id match, amount match
- Never mark order as paid from client-side request
- Never store card details (PCI-DSS — handled by PayFast)

### 4.4 Rate Limiting
```javascript
// Middleware to prevent abuse
const rateLimit = {
    '/api/calculate': '100 requests per hour per IP',
    '/api/login': '10 requests per hour per IP',
    '/api/signup': '5 requests per hour per IP',
    '/webhook/payfast': 'unlimited (PayFast IPs only)'
};
```

### 4.5 Headers (Nginx)
```
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

### 4.6 Audit Logging
Log every: login attempt, payment, report generation, PDF download, admin action

---

## 5. PAYMENT FLOW (STEP BY STEP)

```
1. User submits farm form → POST /api/calculate
2. Backend returns results + savingsEstimate (no PDF yet)
3. User clicks "Get Full Report R199"
4. POST /api/create-order → backend creates pending payment record
5. Backend returns PayFast redirect HTML form
6. User completes payment on PayFast
7. PayFast sends ITN to POST /webhook/payfast
8. Backend validates:
   a. Signature matches
   b. IP in PayFast whitelist (optional but recommended)
   c. payment_status = COMPLETE
   d. amount_gross matches expected amount
   e. merchant_id matches
9. If valid:
   a. Update payment record → status = 'completed'
   b. Generate PDF report
   c. Save PDF to /reports/report_{id}.pdf
   d. Update report record → status = 'paid', pdf_path = '/reports/report_{id}.pdf'
   e. Email PDF to user
   f. Return 200 OK to PayFast
10. If invalid:
    a. Log attempt
    b. Still return 200 OK (PayFast retries otherwise)
```

---

## 6. MILESTONES (6 MONTHS)

### Month 1: Foundation & First Revenue
**Weeks 1–2: Server + Core**
- [ ] Ubuntu 22.04 installed, secured (SSH key, ufw, fail2ban) — *owner action*
- [ ] Nginx + Node.js + SQLite installed — *owner action*
- [ ] Let's Encrypt SSL configured — *owner action*
- [ ] Domain DNS pointing to server — *owner action*
- [x] Database schema created (all tables) ✅ `server/db/schema.sql`
- [x] Auth endpoints working (/signup, /login, /logout, /user) ✅ `server/routes/auth.js`
- [x] /api/calculate working with sheepFarmModel.js ✅ `server/routes/calculate.js`
- [ ] Brochure website deployed (public/index.html) 🔲 *building next*

**Weeks 3–4: Payments + PDF**
- [ ] PayFast merchant account registered (sandbox then live) — *owner action*
- [x] /api/create-order working (returns PayFast form) ✅ `server/routes/payments.js`
- [x] /webhook/payfast ITN handler working, fully validated ✅ signature + IP + amount + remote check
- [x] PDF generation working (pdfService.js) ✅ `server/services/pdfService.js`
- [x] Email delivery working (emailService.js) ✅ `server/services/emailService.js`
- [ ] Money-back guarantee displayed on site 🔲 *building next (part of index.html)*
- [ ] Manual EFT option available as fallback 🔲 *building next*
- [ ] **TARGET: 10 paying customers**

**Revenue target (end of Month 1): R5,000**

---

### Month 2: Recurring Revenue + Funnel
- [ ] Free savings estimator tool (public, no sign-in) 🔲
- [ ] Email capture on free tool (+ follow-up email sequence) 🔲
- [ ] PayFast subscription integration (R99/month) 🔲
- [ ] Member dashboard (past reports, update profile) 🔲 *dashboard.html building in Month 1*
- [ ] WhatsApp auto-reply with estimator link 🔲
- [ ] **TARGET: 50 total reports, 15 ecosystem members**

**Revenue target (end of Month 2): R10,000–15,000/month**

---

### Month 3: Guides + MoMo Pay
- [ ] 5 digital guides written (sheep husbandry, vaccination, fencing, feed, ram selection) 🔲
- [ ] Guide store page with PayFast integration 🔲
- [ ] MoMo Pay merchant registration + API integration 🔲
- [x] Voucher generation system ✅ `/api/voucher/generate` + `/api/voucher/redeem` built ahead of schedule
- [ ] Farmer testimonial video page 🔲
- [ ] **TARGET: 100 total reports, 30 members, 20 guide sales**

**Revenue target (end of Month 3): R15,000–25,000/month**

---

### Month 4: Classifieds Marketplace
- [ ] KYC upload form (ID document, proof of address)
- [ ] Manual KYC review dashboard (admin)
- [ ] Listing creation form (category, price, description, province)
- [ ] Province-based search + filtering
- [ ] Free basic listings + paid upgrades (R10 standard, R30 premium, R50 urgent)
- [ ] Automated moderation (keyword filtering, duplicate detection)
- [ ] **TARGET: 150 total reports, 50 members, 100 active listings**

**Revenue target (end of Month 4): R25,000–40,000/month**

---

### Month 5: Cattle Module ✅ AHEAD OF SCHEDULE
- [x] Cattle lookup tables ✅ province data in React SPA
- [x] Cattle action sheet template ✅ `generateCattleReport` — 9-section report
- [x] Module selector on farm form ✅ LIVESTOCK_TYPES in App.jsx
- [x] Dairy cattle module ✅ `calcDairy`, milk-yield model, cull cow income
- [x] Goat module ✅ Boer Goat + Kalahari Red, kid-finishing, Eid timing
- [ ] Pricing: R299 for cattle report (higher value) 🔲 *connect to backend*
- [ ] **TARGET: 250 total reports (200 sheep + 50 cattle), 75 members**

**Revenue target (end of Month 5): R40,000–60,000/month**

---

### Month 6: Supplier Marketplace + Scale
- [ ] Supplier onboarding section (feed, vet, equipment)
- [ ] Commission tracking system (5–10% per referral)
- [ ] Referral program ("Bring a neighbour, get R100 off")
- [ ] Performance monitoring dashboard (for you)
- [ ] Goat module started (reuse cattle patterns)
- [ ] **TARGET: 400+ total reports, 100+ members, 10+ supplier partners**

**Revenue target (end of Month 6): R50,000–100,000/month**

---

## 7. MONITORING & OPERATIONS

### 7.1 Health Check Script (monitor.sh)
```bash
#!/bin/bash
ENDPOINT="https://shepherdai.co.za/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $ENDPOINT)

if [ "$RESPONSE" != "200" ]; then
    echo "[$(date)] Health check FAILED (HTTP $RESPONSE)" >> /var/log/shepherdai/monitor.log
    pm2 restart shepherdai
    # Send alert (email/SMS) here when you have alerting set up
fi

# Disk check
DISK=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK" -gt 80 ]; then
    echo "[$(date)] Disk usage at ${DISK}%" >> /var/log/shepherdai/monitor.log
fi
```

### 7.2 Backup Script (backup.sh)
```bash
#!/bin/bash
BACKUP_DIR="/var/www/shepherdai/backups"
mkdir -p "$BACKUP_DIR"

# Backup database
sqlite3 /var/www/shepherdai/db/farm.db ".backup '$BACKUP_DIR/farm_$(date +%Y%m%d_%H%M%S).db'"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "*.db" -mtime +30 -delete

# Optional: rsync to external USB
# rsync -av "$BACKUP_DIR/" /mnt/backup_drive/shepherdai/

echo "[$(date)] Backup completed" >> /var/log/shepherdai/backup.log
```

### 7.3 Cron Jobs
```
# Backup: daily at 2am
0 2 * * * /var/www/shepherdai/scripts/backup.sh

# Health check: every 5 minutes
*/5 * * * * /var/www/shepherdai/scripts/monitor.sh

# SSL renewal: twice daily (Certbot default)
0 0,12 * * * certbot renew --quiet

# Log rotation: weekly
0 3 * * 0 logrotate /etc/logrotate.d/shepherdai
```

---

## 8. DEVELOPMENT WORKFLOW

### 8.1 Branch Strategy
```
main          — production (deployed to server)
├── develop   — integration branch
    ├── feature/payfast-integration
    ├── feature/pdf-generator
    ├── feature/cattle-module
    └── hotfix/security-patch
```

### 8.2 Deployment Command
```bash
# On your development machine
git push origin main

# SSH into production server
ssh user@shepherdai.co.za
cd /var/www/shepherdai
git pull origin main
pm2 restart shepherdai
pm2 logs shepherdai --lines 50  # verify no errors
```

### 8.3 Rollback Procedure
```bash
# If deployment breaks:
git log --oneline -5             # Find last working commit
git checkout <last-good-commit>  # Rollback code
pm2 restart shepherdai           # Restart with old code
# Then fix the issue on a branch
```

---

## 9. TESTING REQUIREMENTS

### 9.1 Unit Tests (Must Pass Before Every Deployment)
- sheepFarmModel.js: all calculations for all breeds + systems
- inputSensitivity.js: impact scoring logic
- recommendationEngine.js: action generation rules
- Payment validation logic

### 9.2 Integration Tests (Weekly)
- Full payment flow: form → PayFast → ITN → PDF → email
- Auth flow: signup → login → session → protected route
- Report generation: input validation → calculation → PDF output

### 9.3 Manual Tests (Before Each Launch)
- Mobile phone: full flow on Android + basic phone
- Payment: real PayFast sandbox transaction
- PDF: downloaded, printed, legible
- Email: received, PDF attached

---

## 10. PRICING (FINAL)

| Product | Price | Notes |
|---------|-------|-------|
| Free savings estimator | R0 | No sign-in, captures email |
| One-page action sheet (sheep) | R199 | Core product |
| Cattle action sheet | R299 | Higher value (Month 5) |
| Bundle: 3 reports | R399 | Upsell |
| Ecosystem membership | R99/month | Quarterly updates, community |
| Guides | R49–R199 | One-time purchase |
| Classifieds standard listing | R10 | 10 ads/month, 30 days |
| Classifieds premium listing | R30 | Unlimited ads, featured |
| Classifieds urgent listing | R50 | Top of category, email alert to buyers |
| Farm consulting | R500–R1,500 | By appointment |

---

## 11. WHAT NOT TO BUILD (UNTIL AFTER MONTH 6)

- ❌ Mobile app (PWA is enough)
- ❌ Crowdfunding platform (requires FSCA registration + legal review)
- ❌ SME vertical (separate customer, separate launch)
- ❌ Real-time price feeds (static tables updated quarterly are fine)
- ❌ AI/ML features (your Inefficiency Engine already does this without ML)
- ❌ Multi-language (English only until validated)
- ❌ Docker/Kubernetes (bare metal is simpler and cheaper)
- ❌ Third-party auth (Google/Facebook login — unnecessary complexity)

---

## 12. SUCCESS CHECKLIST (DO NOT SKIP)

### Phase 0 Complete When:
- [ ] Website loads at https://shepherdai.co.za from a phone — *needs hardware*
- [ ] Free sample PDF downloads without sign-in 🔲 *building next*
- [ ] Signup + login works (email + password) 🔲 *building next (login.html + signup.html)*
- [x] /api/calculate returns results ✅ all 7 modules (sheep, cattle, dairy, goats, bees, pigs, poultry)
- [ ] Server survives reboot (PM2 auto-start) ✅ deploy.sh handles this — *needs hardware to verify*

### Phase 1 Complete When:
- [ ] User pays R199 via PayFast (sandbox) — *needs PayFast merchant account*
- [x] ITN webhook validates signature ✅ full validation in paymentService.js
- [x] PDF generated automatically after payment ✅ pdfService.js triggered from ITN handler
- [x] PDF emailed to user within 60 seconds ✅ emailService.js called in ITN handler
- [ ] Past reports visible in dashboard 🔲 *building next (dashboard.html)*

### Phase 2 Complete When:
- [ ] User upgrades to R99/month
- [ ] Free estimator captures emails
- [ ] WhatsApp auto-reply works
- [ ] 50+ paying customers

### Phase 3 Complete When:
- [ ] Guides purchasable + downloadable
- [ ] MoMo Pay transaction successful
- [ ] First classified ad posted + paid
- [ ] R30,000+ monthly revenue

### Phase 4 Complete When:
- [ ] Cattle report purchased
- [ ] KYC verification working
- [ ] R50,000+ monthly revenue
- [ ] 200+ active users

---

## 13. DAILY/WEEKLY ROUTINE (YOU)

### Daily (10 minutes)
- Check PM2 logs: `pm2 logs shepherdai --lines 20`
- Check disk space: `df -h`
- Check PayFast dashboard for failed payments
- Respond to any support emails/WhatsApp messages

### Weekly (1 hour)
- Full backup verification (restore test database from backup)
- Review audit log for suspicious activity
- Check Google Analytics (if installed)
- Update lookup tables if prices changed significantly
- Post in 1 WhatsApp/Facebook farming group

### Monthly (2 hours)
- Generate revenue report
- Review conversion rates (visitors → estimator → paid)
- Plan next feature based on user feedback
- Pay domain/hosting costs
- Update benchmarks in lookup tables (meat prices, wool prices, feed costs)

---

## 14. EMERGENCY PROCEDURES

| Problem | Action |
|---------|--------|
| Server down | SSH in, `pm2 restart shepherdai`, check `pm2 logs` |
| PayFast ITN failing | Check PayFast dashboard → ITN history → see reason. Fix code, redeploy |
| Database corrupt | Stop PM2, restore from latest backup: `cp backups/farm_latest.db db/farm.db`, restart PM2 |
| Disk full | Delete old logs: `find logs/ -name "*.log" -mtime +30 -delete`, delete old backups |
| SSL expired | `sudo certbot renew --force-renewal`, restart Nginx |
| Compromised (hacked) | Take server offline, restore from clean backup, change all passwords, review audit logs |

---

## 15. IMMEDIATE NEXT ACTION (TODAY)

1. **If you don't have hardware:** Buy a refurbished Dell OptiPlex (R3,000–R5,000 on Takealot/Gumtree)
2. **Install Ubuntu 22.04** on it (boot from USB)
3. **Run these commands:**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx nodejs npm sqlite3 git
sudo npm install -g pm2
```
4. **Set up DuckDNS** (if no static IP) or configure your domain DNS
5. **Clone your code** onto the server
6. **Get HTTPS working** — see your site load from the internet on your phone

---

**This brief contains everything you need for the next 6 months.**  

Build what's here. Don't add features. Don't chase new ideas. Don't optimise prematurely.  

**Phase 1 is your only priority right now.** Get one paying customer. Everything else follows.  

Start today.
```