# Agrimodel Pro — Project Status

**Last updated:** 2026-05-05  
**Revenue target:** R30k–R50k/month  
**Business model:** R1,500 once-off feasibility report · R99/month ecosystem tier (not yet built)

---

## What It Is

A South African livestock farming profitability platform. A farmer selects a province on an interactive map, inputs their operation details, and receives a structured 9-section feasibility report covering cashflow, capital structure, break-even, and a prioritised inefficiency audit.

**Stack:** React 18 + Vite 5, single-page app, no backend. Leaflet for the province map. PayFast for payments. All calculation and report generation runs client-side.

---

## What It Can Do Right Now

### Core Model
- Province selection via interactive SA map (9 provinces, GADM 4.1 boundaries)
- Four active livestock modules with full province-specific data: **Sheep, Beef Cattle, Bees, Goats**
- **Breeding mode** — calculates annual profitability for a breeding herd/flock/apiary/herd
- **Grow-out mode** — buy-and-finish model (weaners/calves/kids), cycle-based returns
- Breed selection per province (primary / secondary / avoid recommendations)
- Manual overrides for feed cost, health cost, labour, overhead, bond repayments, fencing

### Financial Outputs
- Revenue, variable cost, variable margin per unit
- Annual flock/herd/apiary profit
- Break-even (minimum viable operation) size
- Scale analysis (profit curve across 6 size points)
- 36-month cashflow with month-by-month events
- Capital required and 5-year NPV
- Land Bank bankability rating

### Inefficiency Engine (Stupidity Index)
- Benchmark-based audit — findings only raised when user's cost exceeds SA efficient-operation benchmark
- Quantified ZAR savings scaled to actual flock/herd size
- Covers: health/treatment costs, water infrastructure, fencing (dynamic — reads user's actual monthly cost), transport/logistics, feed costs, market channel
- Species-aware findings (separate logic for hive / cow / ewe / doe)

### Report
- **Free summary:** browser-printable one-pager (key financials + top inefficiency finding)
- **Full report (R1,500):** 9-section structured report — province profile, breed selection, cashflow, capital structure, inefficiency audit, market analysis, risk assessment, implementation roadmap
- Report is generated from a sophisticated template engine in `reportEngine.js` — **not a live Claude API call**
- Separate report generators for sheep, cattle, bees, and goats (dispatched by `generateProReport`)
- PDF delivery via browser print dialog (`window.print`)

### Payment Flow
- PayFast integration — card, EFT, SnapScan, Zapper, PayShap
- Payment modal collects name + email, generates a 6-character access code
- Access code stored in `localStorage` — lets the user retrieve their report on the same device
- `sandbox: false` is already set (live payment mode)

### UX
- Onboarding tour for new users
- Wizard mode (step-by-step guided input) alongside the full model panel
- Dark theme, monospace font, mobile-responsive layout

---

## Module Completion

| Module | Score | What's missing |
|--------|-------|----------------|
| 🐑 Sheep | 100% | Complete — all 9 sections fully parameterized via T terms object |
| 🐄 Beef Cattle | 72% | Report prompt text still sheep-centric in ~4 of 9 sections |
| 🐝 Bees | 68% | Report language issues in sections 1, 5, 6, 7 |
| 🐐 Goats | 80% | Module active. Grow-out mode uses sheep path (numerically correct). Report sections could be tightened; no Angora/dairy goat variant |
| 🐖 Pigs | 30% | BENCH sow entry · FCR/farrowing cycle model · Report text |
| 🐓 Poultry | 25% | Dedicated cycle-based model (calcFull is wrong for batch broilers) · BENCH bird entry · Report text |
| 🐮 Dairy | 22% | Milk-yield revenue model (calcFull uses carcass price as proxy — meaningless) · Separate BENCH entry · Report text |

---

## What Still Needs to Be Done

### Critical (blocks revenue)

| Item | Why it's blocking |
|------|-------------------|
| **PayFast ITN webhook** | No server exists to receive PayFast's payment notification. If user closes browser after paying, there is no record. Access code generated client-side before payment confirmed. |
| **Backend (Node/Express or serverless)** | Required for: ITN handling, access code validation, email delivery, and future auth. Without it, payment verification is client-side only and trivially bypassable. |
| **Email delivery** | User enters email at checkout but nothing is sent. Report and access code must be emailed on confirmed payment. |
| **Real AI report generation** | Current report is template strings, not Claude API. The differentiator is the AI-written province-specific narrative. Needs a backend endpoint that calls the Claude API with the report data as context. |

### Module Completeness

- **Sheep (100%) ✅** — All 9 sections fully parameterized via T terms object. `generateSheepReport` now serves as a clean generic base template with no hardcoded species strings in financial outputs.
- **Cattle (72%):** Language pass on breeding report sections (currently sheep-centric in ~4 of 9)
- **Bees (68%):** Language pass on sections 1, 5, 6, 7
- **Goats (80%):** Grow-out kid-finishing terminology pass; optional Angora/Savanna variant
- **Pigs, Poultry, Dairy:** Full model + report work required before activation

### Report Engine
- `generateProReport` dispatches correctly to all four active species
- Sheep report template is the base — sections 1/5/6/7 still carry sheep-specific language that bleeds into cattle/bees
- Cattle grow-out report sections are solid; breeding report needs cattle-specific language pass
- Bees report needs a language pass on sections 1, 5, 6, 7

### PDF Quality
- Current PDF = `window.print()` on a styled HTML page — quality depends on browser print settings
- Not mobile-printable; no guaranteed consistent output
- Proper PDF generation (PDFKit, Puppeteer, or React-PDF) would produce a deliverable that matches the R1,500 price point

### Infrastructure / Deployment
- No hosting configured — app lives on local dev only
- No domain routing, no HTTPS, no CI/CD
- No environment variable management (PayFast credentials are hardcoded in App.jsx)

### Revenue Tier 2
- R99/month ecosystem membership not built — no subscription billing, no member-only content

---

## File Map

| File | Purpose |
|------|---------|
| `src/App.jsx` | Everything — UI, state, all livestock data, calcFull, calcGrowOut, getCostLabel, PayFast modal, print functions |
| `src/reportEngine.js` | Report data builder + template generators for sheep, cattle, bees, goats (grow-out and breeding) |
| `src/inefficiencyEngine.js` | Benchmark audit — raises findings only when user cost exceeds SA benchmark |
| `PROJECT_STATUS.md` | This file — project snapshot for onboarding and build-order reference |
| `Files/` | ~32 brainstorm/spec docs — most features are already designed here before being built |

---

## Recommended Build Order

1. ~~**Sheep 100%**~~ ✅ Done
2. **Cattle + Bees language pass** — cattle breeding sections (4 of 9) + bees sections 1/5/6/7
3. **Backend + ITN handler** — serverless function (Vercel/Netlify) that receives PayFast POST, validates signature, stores `{ accessCode, email, paid:true, timestamp }` in a database or KV store, sends email with code + report link
4. **Email delivery** — Resend or SendGrid: send access code + summary PDF on confirmed payment
5. **Real Claude API report** — backend endpoint receives report data, calls `claude-sonnet-4-6`, streams 9 sections back; gate behind confirmed payment
6. **Pigs** — BENCH sow entry + farrowing cycle model + 9-section report + activate
7. **Poultry** — cycle-based batch broiler model + BENCH bird entry + report + activate
8. **Dairy** — milk-yield revenue model + BENCH dairy cow entry + report + activate
9. **Proper PDF** — Puppeteer on the backend or React-PDF client-side

---

## Known Design Decisions

- **No user accounts by design (for now)** — access code in localStorage is the intentional lightweight auth. Acceptable for v1; breaks on device change or browser clear.
- **All calc is client-side** — fast, no server costs, but means report data never persists server-side.
- **Template report, not live AI** — deliberate for reliability and cost control. Real AI generation is the upgrade path once payment infrastructure is confirmed.
- **`sandbox: false` already set** — PayFast will attempt real charges. Do not test with real cards until ITN handler is live.
- **Goats grow-out uses sheep path** — `calcGrowOut` detects cattle via `liveKg >= 100`; goats (liveKg ~38) fall through to sheep grow-out, which is numerically correct for kid finishing.
