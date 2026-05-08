# ShepherdAI — Project Status

**Last updated:** 2026-05-08
**Branch:** `main` (clean, up to date with origin)

---

## What It Is

A South African livestock farming profitability platform with two surfaces:

1. **React calculator** (`/calculator/`) — interactive province map, breed/feasibility model, 9-section report
2. **ShepherdAI ecosystem** (`/`) — public site, user accounts, guides, classifieds, admin panel

---

## Tech Stack (Current)

| Layer | Technology |
|-------|------------|
| Frontend (calculator) | React 18 + Vite 5, Leaflet map, `src/App.jsx` |
| Backend | Node.js + Express, `server/server.js` |
| Database | SQLite via `better-sqlite3`, `server/db/farm.db` |
| Auth | Session-based, bcrypt passwords |
| Payments | PayFast live (ITN handler at `POST /api/payfast/notify`), EFT fallback |
| File uploads | multer — listing images (JPG/PNG, max 5 MB, up to 3 per listing) |
| Email | Nodemailer/SMTP — leads, guide delivery, subscription confirm |
| Theme | Light/dark toggle on all 9 public pages + calculator (shared `sai_theme` localStorage key) |

---

## Calculator Modules — All Complete

| Module | Status | Notes |
|--------|--------|-------|
| 🐑 Sheep | ✅ Sellable | Breeding + grow-out, 9-section report, T-parameterized |
| 🐄 Beef Cattle | ✅ Sellable | Breeding + grow-out, FAMACHA, T-parameterized |
| 🐐 Goats | ✅ Sellable | Boer Goat + Kalahari Red, kid-finishing, Eid timing, halaal premium |
| 🐝 Bees | ✅ Sellable | capensis / hybrid_zone / scutellata, cfTable |
| 🐖 Pigs | ✅ Sellable | `calcPigs` farrowing-cycle model, SAPPO refs, ASF risk |
| 🐓 Poultry | ✅ Sellable | `calcPoultry` broiler-cycle model |
| 🐮 Dairy | ✅ Sellable | `calcDairy` milk-yield model, cull cow income as 2nd revenue stream |

All 7 modules use a unified green → yellow → red province suitability map (9 SA provinces).

**Note:** Calculator reports are still template strings — not live Claude API calls. This is the primary remaining upgrade path.

---

## Ecosystem Features — All Live

| Feature | Status | Route |
|---------|--------|-------|
| Landing / pricing page | ✅ | `/` |
| Free savings estimator | ✅ | `/estimator.html` |
| Email lead capture | ✅ | `POST /api/leads` → DB + follow-up email |
| Sign up / Log in | ✅ | `/signup.html`, `/login.html` |
| User dashboard | ✅ | `/dashboard.html` |
| KYC document upload | ✅ | `POST /api/kyc/upload` |
| R299/month subscription | ✅ | PayFast subscription + EFT fallback |
| Digital guides store | ✅ | `/guides.html` — buy via PayFast, download PDF |
| Farm Classifieds | ✅ | `/listings.html` — filter by province, category, search |
| Post a listing | ✅ | `/post-listing.html` — 4 plan tiers, photo upload (up to 3) |
| Listing photo uploads | ✅ | `POST /api/listings/:id/images`, served from `/uploads/` |
| Referral program | ✅ | Unique code per user, R50 reward on conversion |
| Admin dashboard | ✅ | `/admin.html` — stats, EFT approval, KYC review, listing approval, audit log |
| Light / dark mode | ✅ | All 9 public pages + calculator, persisted in localStorage |

---

## Revenue Streams (Live)

| Stream | Price | Status |
|--------|-------|--------|
| One-off farm report | R199 | ✅ PayFast live |
| Ecosystem subscription | R299/month | ✅ PayFast subscription + EFT |
| Digital guides | R49/guide | ✅ PayFast + EFT |
| Listing — Standard | R10 | ✅ PayFast |
| Listing — Premium | R30 | ✅ PayFast |
| Listing — Urgent | R50 | ✅ PayFast |
| Listing — Free | R0 | ✅ Basic tier |

---

## What Is NOT Done Yet

### High priority (revenue-impacting)

| Item | Why it matters |
|------|---------------|
| **Real Claude API report** | Current report is template strings. The AI-generated, province-specific narrative is the product's core differentiator and justifies the price. Needs a server route calling the Claude API, gated behind confirmed payment. |
| **PDF generation** | No server-side PDF — farmers get an HTML report. Need Puppeteer or React-PDF to produce a proper downloadable PDF that gets emailed automatically. |
| **Email triggers** | No emails sent on: EFT confirmed, KYC approved/rejected, listing approved/rejected. Users have to check the site. |

### Owner actions (no code needed)

| Item | Notes |
|------|-------|
| Server hardware | Refurbished desktop/laptop, Ubuntu 22.04, i5+, 8 GB RAM |
| Nginx + SSL | Certbot + Let's Encrypt, auto-renewing |
| Domain DNS | Point shepherdai.co.za to server IP |
| PayFast merchant account | `PAYFAST_SANDBOX=false` when live |
| Write guide PDFs | 5 guides planned: sheep, vaccination, fencing, feed, ram selection |
| MoMo Pay API keys | Stub is built, needs `MOMO_SUBSCRIPTION_KEY` from momodeveloper.mtn.com |

### Lower priority

| Item | Notes |
|------|-------|
| SMS alerts for urgent listings | Paid tier — listed as feature, not yet wired |
| WhatsApp auto-reply | Requires WhatsApp Business API account |
| Proper unit tests | No test suite exists yet |

---

## File Map

| Path | Purpose |
|------|---------|
| `src/App.jsx` | Calculator monolith — UI, state, all 7 province datasets, calc functions, PayFast modal |
| `src/reportEngine.js` | Report data builder + 9-section template generators |
| `src/inefficiencyEngine.js` | Benchmark audit — Inefficiency Engine (Stupidity Index) |
| `server/server.js` | Express app entry point |
| `server/db/schema.sql` | All table definitions |
| `server/routes/` | auth, guides, listings, payments, referrals, admin |
| `server/public/` | 9 HTML pages + app.js + style.css |
| `server/services/` | paymentService, uploadService, pdfService, emailService |
| `server/scripts/seed.js` | Seed data — guides, listings (with sheep PNG), test user |
| `server/uploads/listings/` | Uploaded listing photos (gitignored) |
