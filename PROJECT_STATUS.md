# Agrimodel Pro — Project Status

**Last updated:** 2026-05-06  
**Revenue target:** R30k–R50k/month  
**Business model:** R1,500 once-off feasibility report · R99/month ecosystem tier (not yet built)

---

## What It Is

A South African livestock farming profitability platform. A farmer selects a province on an interactive map, inputs their operation details, and receives a structured 9-section feasibility report covering cashflow, capital structure, break-even, and a prioritised inefficiency audit.

**Stack:** React 18 + Vite 5, single-page app, no backend. Leaflet for the province map. PayFast for payments. All calculation and report generation runs client-side.

---

## End-to-End Sellable Modules

Four modules are complete and ready to charge R1,500 for:

| Module | Map | Calc | Report | Ready |
|--------|-----|------|--------|-------|
| 🐑 Sheep | ✅ Green/yellow/red suitability | ✅ Breeding + grow-out | ✅ All 9 sections, T-parameterized | **YES** |
| 🐄 Beef Cattle | ✅ Green/yellow/red suitability | ✅ Breeding + grow-out | ✅ All 9 sections, T-parameterized, cattle-specific language | **YES** |
| 🐐 Goats | ✅ Green/yellow/red suitability | ✅ Breeding + grow-out | ✅ All 9 sections, r.breed-parameterized (Boer Goat / Kalahari Red), Eid timing, halaal premium | **YES** |
| 🐝 Bees | ✅ Green/yellow/red suitability | ✅ Colony expansion (no grow-out — correct by design) | ✅ All 9 sections, r.subspecies-parameterized (capensis / hybrid_zone / scutellata), cfTable, working capital corrected | **YES** |

### What "End-to-End" Means

Each of the four active modules delivers:
- Province selection on the interactive SA map with correct green (best) → yellow (okay) → red (avoid) suitability fill
- Breed recommendation with province-specific primary/secondary/avoid logic
- Full financial calc: revenue, variable margin, annual profit, break-even, scale curve, 36-month cashflow, capital required, 5-year NPV, Land Bank bankability
- Inefficiency Engine (Stupidity Index): benchmark-based audit with ZAR savings quantified
- Free one-page summary (browser print)
- Full 9-section paid report (R1,500): province profile, breed selection, cashflow, capital structure, inefficiency audit, market analysis, risk assessment, implementation roadmap

---

## Placeholder Modules (Not Yet Sellable)

| Module | Map | Calc | Report | Blocking Issues |
|--------|-----|------|--------|-----------------|
| 🐖 Pigs | ✅ Green/yellow/red suitability | ✅ `calcPigs` — dedicated farrowing-cycle model (pigsPerSow × carcassKg × price), 5-month rolling batch cashflow | ✅ All 9 sections, breed-parameterized, SAPPO references, ASF risk, FCR/energy/disease risk sections | **YES** |
| 🐓 Poultry | ✅ Green/yellow/red suitability | ❌ calcFull used as proxy — wrong for batch broiler cycle | ❌ Placeholder text only | Needs cycle-based batch model, BENCH bird entry, full 9-section report |
| 🐮 Dairy | ✅ Green/yellow/red suitability | ❌ calcFull uses carcass price as proxy — meaningless for milk yield | ❌ Placeholder text only | Needs milk-yield revenue model, BENCH dairy cow entry, full 9-section report |

All three inactive modules have correct province suitability map data but are disabled in LIVESTOCK_TYPES (`status: "coming_soon"`). They will not appear as selectable options to paying users until activated.

---

## Province Suitability Map System

All 7 modules use a unified 5-tier green/yellow/red traffic-light palette applied at 38% opacity (unselected) and 80% opacity (selected):

| Tier | Color | Hex | Meaning |
|------|-------|-----|---------|
| T1 BEST | Dark green | `#1a8a20` | Optimal climate, carry capacity, parasite pressure, market access |
| T2 GOOD | Medium green | `#58aa18` | Strong suitability, minor constraints |
| T3 OKAY | Yellow | `#c8b400` | Viable with management investment |
| T4 POOR | Orange | `#c86000` | Significant constraints — specialist operations only |
| T5 BAD | Dark red | `#b81818` | Not recommended for commercial production |

---

## What Still Needs to Be Done

### Critical (blocks revenue)

| Item | Why it's blocking |
|------|-------------------|
| **PayFast ITN webhook** | No server to receive PayFast's payment notification. Access code generated client-side before payment confirmed — trivially bypassable. |
| **Backend (Node/Express or serverless)** | Required for ITN handling, access code validation, email delivery, and future auth. |
| **Email delivery** | User enters email at checkout but nothing is sent. Report and access code must be emailed on confirmed payment. |
| **Real AI report generation** | Current report is template strings, not Claude API. The differentiator is the AI-written province-specific narrative. Needs a backend endpoint calling Claude API gated behind confirmed payment. |

### Module Completeness

- **Pigs (100%) ✅** — dedicated `calcPigs` function, correct province economics (lambing/100 = pigsPerSow), full 9-section report, activated
- **Poultry** — Cycle-based batch broiler model + BENCH bird entry + report + activate
- **Dairy** — Milk-yield revenue model + BENCH dairy cow entry + report + activate

### PDF Quality

- Current PDF = `window.print()` on styled HTML — browser-dependent quality
- Proper PDF generation (Puppeteer or React-PDF) needed to match the R1,500 price point

### Infrastructure / Deployment

- No hosting configured — app on local dev only
- No domain, no HTTPS, no CI/CD
- PayFast credentials hardcoded in App.jsx — must move to environment variables before deploying

### Revenue Tier 2

- R99/month ecosystem membership not built — no subscription billing, no member-only content

---

## Recommended Build Order

1. ~~**Sheep 100%**~~ ✅
2. ~~**Cattle 100%**~~ ✅ — FAMACHA fixed, cattle-specific language, grow-out complete
3. ~~**Goats 100%**~~ ✅ — kid-finishing grow-out, r.breed-parameterized, Eid timing, halaal premium
4. ~~**Bees 100%**~~ ✅ — subspecies-parameterized, cfTable, working capital corrected, sheep-bleed removed
5. ~~**Province suitability maps — all 7 modules**~~ ✅ — unified green/yellow/red system across Sheep, Cattle, Goats, Bees, Pigs, Poultry, Dairy
6. ~~**Pigs 100%**~~ ✅ — `calcPigs` farrowing-cycle model, province economics corrected, 9-section report with SAPPO refs + ASF/FCR/energy risk sections, activated
7. **Backend + ITN handler** — serverless function (Vercel/Netlify) receives PayFast POST, validates signature, stores `{ accessCode, email, paid:true, timestamp }`, sends email
8. **Email delivery** — Resend or SendGrid: send access code + summary on confirmed payment
9. **Real Claude API report** — backend endpoint calls `claude-sonnet-4-6`, streams 9 sections; gate behind confirmed payment
10. **Poultry** — batch broiler model + BENCH bird entry + report + activate
11. **Dairy** — milk-yield model + BENCH dairy cow entry + report + activate
12. **Proper PDF** — Puppeteer (backend) or React-PDF (client-side)

---

## File Map

| File | Purpose |
|------|---------|
| `src/App.jsx` | Everything — UI, state, all livestock province data (7 modules), calcFull, calcGrowOut, getCostLabel, PayFast modal, print functions |
| `src/reportEngine.js` | Report data builder + template generators for sheep, cattle, bees, goats (grow-out and breeding for all four) |
| `src/inefficiencyEngine.js` | Benchmark audit — raises findings only when user cost exceeds SA benchmark |
| `PROJECT_STATUS.md` | This file |
| `Files/` | ~32 brainstorm/spec docs — most features are already designed here before being built |

---

## Known Design Decisions

- **No user accounts by design (v1)** — access code in localStorage. Acceptable for v1; breaks on device change or browser clear.
- **All calc is client-side** — fast, no server costs, but report data never persists server-side.
- **Template report, not live AI** — deliberate for reliability and cost control. Real AI generation is the upgrade path once payment infrastructure is confirmed.
- **`sandbox: false` already set** — PayFast will attempt real charges. Do not test with real cards until ITN handler is live.
- **Goats grow-out: calc uses sheep path, report is goat-specific** — `calcGrowOut` detects cattle via `liveKg >= 100`; goats (liveKg ~38) fall through to the sheep grow-out path, which is numerically correct for kid finishing. The report has a dedicated `if (isGrowOut)` block in `generateGoatsReport` with full kid-finishing language.
- **Kalahari Red vs Boer Goat** — all goat report text is `r.breed`-parameterized. Northern Cape correctly renders Kalahari Red throughout.
- **Bees has no grow-out mode** — colony expansion differs fundamentally from livestock buy-and-finish; intentionally excluded.
- **Pigs/Poultry/Dairy province data is correct** — map colors and province metadata are complete; only the calc model and report text block activation.
