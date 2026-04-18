import { ZAR, PCT, MONTHS } from "./utils.js";

// ── SANDBOX / DEMO REPORT ─────────────────────────────────────────────────────
// Generates a full 9-section report from financial data — no API call required.
// Used when PF.sandbox=true or VITE_ANTHROPIC_API_KEY is absent.
export function generateSandboxReport(reportData, buyerName) {
  const { r, flock, lm, carcass, lab, fa, revPE, varPE, vm, be, pp, capital, npv5,
          scaleRows, cfRows, firstPositive, sensRows, yr1, yr2, yr3, mc } = reportData;

  const lmNote  = lm === "owner" ? "owner-operated (notional R1,500/mo)" : "hired worker (BCEA 2024 R5,594/mo)";
  const s20     = sensRows.find(s => s.pct === -20);
  const scaleVi = scaleRows.find(r => r.ok);
  const scaleStr= scaleRows.filter((_, i) => i % 2 === 0)
    .map(rw => `${rw.n} ewes → profit ${ZAR(rw.fp)}/yr (ROI ${PCT(rw.roi)})`)
    .join(" | ");

  const viabilityVerdict = pp > 0
    ? `VIABLE — this ${flock}-ewe ${r.breed} operation in ${r.name} produces a profit of ${ZAR(pp)}/ewe/year (${PCT(pp / r.ewePrice)} ROI on stock capital).`
    : `MARGINAL — at ${flock} ewes, this operation sits below the ${be ?? "?"}-ewe breakeven. Increasing flock size to at least ${be ?? flock + 20} ewes is the single most important action.`;

  const bankRating = pp > 0 && flock >= (be ?? 0) * 1.2 ? "STRONG" : pp > 0 ? "MODERATE" : "MARGINAL";

  const TITLES = [
    "Executive Summary",
    "Regional Analysis",
    "Breed Analysis",
    "Financial Model & Assumptions",
    "36-Month Cashflow Analysis",
    "Scale & Breakeven Analysis",
    "Risk Analysis & Sensitivity",
    "Capital Structure & Financing",
    "Implementation Roadmap",
  ];

  const bodies = [
    // 1 — Executive Summary
    `${viabilityVerdict}

Operation: ${flock} ${r.breed} ewes in ${r.name}, ${lmNote}. Carcass price basis: R${carcass}/kg A2 (AgriOrbit Apr 2025).

Key financials: Revenue ${ZAR(revPE)}/ewe/yr · Variable cost ${ZAR(varPE)}/ewe/yr · Variable margin ${ZAR(vm)}/ewe · Fixed annual R${ZAR(fa)} · Breakeven ${be ?? "N/A"} ewes · Profit/ewe ${ZAR(pp)} · Flock profit ${ZAR(pp * flock)}/yr · ROI ${PCT(pp / r.ewePrice)} · Capital required ${ZAR(capital)}.

First cashflow: Month ${firstPositive?.m ?? 13} (${firstPositive?.mo ?? "Jan"} Year ${firstPositive?.yr ?? 2}) — 12 months of working capital must be funded before the first lamb cheque.

Three-year outlook: Year 1 P&L ${ZAR(yr1)} (entirely negative — working capital phase). Year 2 cumulative ${ZAR(yr2)}. Year 3 cumulative ${ZAR(yr3)}. 5-year NPV at 10% discount rate: ${ZAR(npv5)}.

Land Bank bankability rating: ${bankRating}. ${bankRating === "STRONG" ? "This operation covers its fixed costs with a comfortable margin and presents a credible repayment schedule." : bankRating === "MODERATE" ? "Viable at current flock size but limited margin for error — lender will require evidence of management experience." : "Below breakeven — a larger flock or reduced cost structure is required before approaching a lender."}

Recommended immediate action: ${be && flock < be ? `Increase flock size to at least ${be} ewes before committing capital — the current ${flock} ewes cannot cover fixed costs.` : `Proceed with the ${flock}-ewe operation, securing a 12-month revolving credit facility of ${ZAR(Math.abs(yr1) * 1.1)} to bridge the working capital gap to Month 13.`}

⚠ SANDBOX DEMO — This section was generated from your financial model data, not by the AI engine. Purchase the full report for the AI-written analysis.`,

    // 2 — Regional Analysis
    `${r.name} is ${r.climate.toLowerCase()}, making it ${r.type === "Wool" ? "ideal for wool production" : "well-suited to commercial meat production"}.

Climate profile: Rainfall ${r.climate.match(/\d+[–-]\d+mm/)?.[0] ?? "variable"} · Frost: ${r.frost} · Parasite pressure: ${r.parasites} · Drought risk: ${r.drought} · Sheep density: ${r.sheepDensity}.

Carrying capacity in ${r.name} varies significantly by district and rainfall. ${r.drought === "Severe, frequent" || r.drought === "Frequent" ? `Given the high drought frequency, conservative stocking is critical — plan for at least 30% capacity reduction in drought years and maintain a supplementary feed reserve.` : `Under normal rainfall conditions, stocking rates are manageable, but always carry a 60-day emergency feed reserve.`}

Market infrastructure: ${r.market}. ${r.type === "Wool" ? `Wool buyers from the Cape Wool Board hold regular auction events — register with the board and clip according to their grading specifications for maximum price.` : `Commercial abattoirs in ${r.name} accept animals on a live-weight or dressed-weight basis — understand your nearest abattoir's grading criteria before the first sale.`}

Transport reality: Distance to market is the silent margin killer in ${r.name}. Calculate your exact transport cost per animal and factor it into your net carcass price assumption.

${r.tip ? `Key provincial insight: ${r.tip}` : ""}

Why ${r.name} operations succeed or fail: The operations that survive in ${r.name} manage water access, maintain lean fixed-cost structures, and sell at the right time rather than holding animals waiting for better prices. The operations that fail typically overstock relative to carrying capacity, underestimate first-year working capital, and miss the biological timing of their first lamb crop.

Avoid in ${r.name}: ${r.avoid.length ? r.avoid.join(", ") : "No specific breed avoidances — consult local extension officers."}.

⚠ SANDBOX DEMO — Full AI-written regional analysis included in purchased report.`,

    // 3 — Breed Analysis
    `${r.breed} — ${r.type} breed — is the recommended primary breed for ${r.name}.

Why this choose fits ${r.name}: ${r.why}

Production parameters: Lambing rate ${r.lambing}% · Survival to weaning ${r.survival}% · Effective lambs/ewe/yr ${((r.lambing / 100) * (r.survival / 100) * 0.85).toFixed(2)} (applying 85% selection of sellable lambs) · Slaughter weight ${r.liveKg}kg live · Dressing ${r.dressing}% · Carcass ${(r.liveKg * r.dressing / 100).toFixed(1)}kg · ${r.wool > 0 ? `Wool income ${ZAR(r.wool)}/ewe/yr` : "Hair breed — no wool income, zero shearing cost"}.

At R${carcass}/kg A2, revenue per ewe per year: ${ZAR(revPE)} (lamb ${ZAR(((r.lambing / 100) * (r.survival / 100) * 0.85) * (r.liveKg * r.dressing / 100) * carcass)}${r.wool > 0 ? ` + wool ${ZAR(r.wool)}` : ""}).

Where to source ${r.breed} stock in ${r.name}: Stud breeders registered with the SA ${r.breed} Breeders' Society hold annual production sales. For commercial replacements, local livestock auctions typically offer certified-breeding-status ewes at ${ZAR(r.ewePrice)} per ewe (the price assumption used in this model). At ${flock} ewes, a commercial flock is appropriate — stud rams (1:35 ewe ratio) sourced from a reputable local stud will improve lambing percentages without the overhead of maintaining a stud flock.

Key health priorities for ${r.breed} in ${r.name}: ${r.parasites !== "Very low" ? "Internal parasite management is critical — implement a FAMACHA-based dosing protocol rather than calendar dosing. The health budget of " + ZAR(r.health) + "/ewe/yr in this model assumes 3 strategic dosings per year." : "Low parasite pressure in " + r.name + " reduces health costs — maintain prophylactic dosing at 2 cycles/year minimum and monitor for Bluetongue in summer."}

First-year red flags to watch: Lambing rate below ${Math.round(r.lambing * 0.85)}% (15% below benchmark), ewe condition score below 2.5 at mating, lamb losses above ${100 - r.survival}%.

⚠ SANDBOX DEMO — Full AI-written breed analysis included in purchased report.`,

    // 4 — Financial Model & Assumptions
    `This model applies a conservative, Land Bank-style extensive farming benchmark. Every assumption below can be challenged — the transparency is intentional.

Revenue assumptions:
• Lambing rate: ${r.lambing}% (${r.name} commercial average — intensive irrigated operations can achieve 140–160%)
• Survival: ${r.survival}% (accounts for normal mortality — exceptional management can exceed this)
• Live weight: ${r.liveKg}kg (market standard for ${r.breed} in ${r.name})
• Dressing: ${r.dressing}% (A2 grade standard — poor condition reduces this to 44–45%)
• Carcass price: R${carcass}/kg A2 (AgriOrbit Apr 2025 — verify current price before finalising)
• Wool: ${r.wool > 0 ? ZAR(r.wool) + "/ewe/yr (clip weight × " + r.name + " market price)" : "R0 — hair breed, no wool income"}

Cost assumptions:
• Feed: ${ZAR(r.feed)}/ewe/yr — this is the Land Bank extensive benchmark. It includes salt licks, supplementary feed during drought, and creep feed for lambs. It does NOT include irrigated pasture establishment.
• Health: ${ZAR(r.health)}/ewe/yr — ProAgri 3-cycle dosing schedule: 2× anthelmintic + 1× clostridial vaccination + foot care + annual vet call. Actual costs vary by parasite pressure.
• Replacement: ${r.rep}% at ${ZAR(r.ewePrice)}/ewe = ${ZAR(r.ewePrice * r.rep / 100)}/ewe/yr — commercial SA norm. Stud operations replace at lower rates; overstocked operations at higher rates.
• Overhead: ${ZAR(r.oh)}/mo — water, fuel, repairs, electricity, insurance. This is conservative for a small flock — larger operations benefit from scale.
• Labour: ${lmNote}.

The variable margin of ${ZAR(vm)}/ewe is the most important number in this model. At ${flock} ewes, fixed costs consume ${ZAR(fa / flock)}/ewe/yr of that margin. At 200 ewes, fixed cost per ewe drops to ${ZAR(fa / 200)}. This is why scale matters.

Most likely wrong assumption: Carcass price. A ±R10/kg swing changes profit/ewe by ${ZAR(((r.lambing / 100) * (r.survival / 100) * 0.85) * (r.liveKg * r.dressing / 100) * 10)}.

⚠ SANDBOX DEMO — Full AI-written financial analysis included in purchased report.`,

    // 5 — 36-Month Cashflow
    `The cashflow story for this operation has three distinct phases.

Phase 1 — Working capital (Months 1–${(firstPositive?.m ?? 13) - 1}): Every month is cash-negative. You are funding the biological reality that ewes take 5 months to gestate and 5–7 months to produce a lamb at slaughter weight. Monthly operating cost: ${ZAR(mc)} (covering labour, overhead, feed, health, and replacement reserve). By Month 12 you have spent ${ZAR(Math.abs(yr1))} from your working capital reserve. This is not a loss — it is the investment in your first crop.

Phase 2 — First revenue (Month ${firstPositive?.m ?? 13}, ${firstPositive?.mo ?? "January"} Year ${firstPositive?.yr ?? 2}): The first lamb cheque arrives. With ${flock} ewes at ${r.lambing}% lambing, you sell approximately ${Math.round(flock * (r.lambing / 100) * (r.survival / 100) * 0.5)} lambs (50% of crop, rest retained or in finishing). At R${carcass}/kg and ${(r.liveKg * r.dressing / 100).toFixed(1)}kg carcass, this is a significant cash event. The Year 2 cumulative position: ${ZAR(yr2)}.

Phase 3 — Normalisation (Year 3+): With annual revenue of ${ZAR(revPE * flock)} and annual costs of ${ZAR((varPE + fa / flock) * flock)}, the operation reaches Year 3 cumulative of ${ZAR(yr3)}. From Year 3 the operation runs at a sustainable rate of ${ZAR(pp * flock)}/year flock profit.

${pp < 0 ? `WARNING: At ${flock} ewes, this operation never turns cumulative-positive in 36 months. The flock must be increased to at least ${be ?? flock + 20} ewes before proceeding.` : `The operation ${yr2 >= 0 ? "recovers its working capital by Year 2" : "requires 36+ months to recover working capital — a longer-term view is required"}.`}

Working capital required: ${ZAR(Math.abs(yr1) * 1.15)} (Year 1 drawdown + 15% contingency). Best bridging instrument: 12-month revolving credit facility, with repayment timed to January/February lamb sales.

Seasonal risk: Revenue is concentrated in 1–2 months per year (lamb sale periods). Cash management between sales is critical.

⚠ SANDBOX DEMO — Full AI-written cashflow analysis included in purchased report.`,

    // 6 — Scale & Breakeven
    `Breakeven: ${be ?? "N/A"} ewes. At this scale, variable margin of ${ZAR(vm)}/ewe exactly covers fixed costs of ${ZAR(fa)}/yr. Below ${be ?? "?"} ewes, every ewe adds to the loss. Above ${be ?? "?"} ewes, every additional ewe drops ${ZAR(vm)}/ewe straight to profit.

Scale economics (current inputs):
${scaleStr}

${scaleVi ? `First viable scale: ${scaleVi.n} ewes — profit ${ZAR(scaleVi.fp)}/yr, ROI ${PCT(scaleVi.roi)}.` : "No viable scale found at current input prices — review cost structure."}

At what scale does this become a primary income? At ${Math.round((fa + 180000) / vm)} ewes, the operation generates R180,000/year net — roughly a minimum rural household income. At ${Math.round((fa + 360000) / vm)} ewes, it produces R360,000/year.

At what scale does it beat money in the bank (prime 11.5%)? ${vm > 0 ? `ROI equals prime at ${Math.round(fa / (vm - r.ewePrice * 0.115))} ewes.` : "Not achievable at current variable margin — review input costs."}

Your current position: ${flock} ewes · ${flock >= (be ?? Infinity) ? `${flock - (be ?? 0)} ewes above breakeven (${PCT((flock - (be ?? 0)) / flock)} buffer)` : `${(be ?? flock) - flock} ewes below breakeven — operate at a loss until flock reaches ${be ?? "?"}`}.

The single most important reinvestment decision in Year 3: retain the best 20% of ewe lambs instead of selling them. This grows your flock by approximately ${Math.round(flock * (r.lambing / 100) * (r.survival / 100) * 0.2)} ewes/year at zero purchase cost, compounding your profit margin with each cycle.

Land and infrastructure requirements scale approximately as follows: ${flock} ewes → ${Math.round(flock / 5)} ha minimum (5 ewes/ha assuming mixed grazing). 200 ewes → 40 ha. 500 ewes → 100 ha.

⚠ SANDBOX DEMO — Full AI-written scale analysis included in purchased report.`,

    // 7 — Risk Analysis
    `1. PRICE RISK (High probability, manageable): The sensitivity analysis shows:
${sensRows.filter(s => [-20, -10, 0, 10, 20].includes(s.pct)).map(s => `  R${s.adj.toFixed(0)}/kg (${s.pct > 0 ? "+" : ""}${s.pct}%): profit/ewe ${ZAR(s.pp)} · ROI ${PCT(s.roi)} · BE ${s.be ?? "∞"} ewes`).join("\n")}
At -20% (R${(carcass * 0.8).toFixed(0)}/kg), profit/ewe is ${ZAR(s20?.pp ?? 0)} — ${(s20?.pp ?? 0) > -500 ? "survivable with reserve" : "severe — operation requires emergency cost reduction"}. Mitigation: forward pricing contracts with abattoir where available; AgriSure price protection.

2. DROUGHT RISK (${r.drought} in ${r.name}): ${r.drought === "Severe, frequent" ? "This is the primary existential risk. Maintain a 90-day supplementary feed reserve, carry AgriSure CP drought cover, and set a trigger stocking rate reduction at 50% of normal rainfall." : "Drought occurs but is manageable with a 60-day feed reserve and the flexibility to sell down the flock during extended dry spells."} AgriSure Comprehensive Plan is recommended — register before the season starts.

3. DISEASE RISK (Medium probability): Key threats for ${r.breed} in ${r.name} — internal parasites (${r.parasites} pressure), Bluetongue (notifiable), Rift Valley Fever (notifiable). Health budget of ${ZAR(r.health)}/ewe/yr covers prophylactic dosing. Any outbreak requires immediate veterinary intervention — budget a contingency of ${ZAR(r.health * 0.5 * flock)} for emergency vet costs.

4. MARKET RISK (Low-medium): ${r.market}. If primary abattoir changes grading or closes: alternatives include local auction markets and direct-to-consumer channels. Never be 100% dependent on a single buyer.

5. MANAGEMENT RISK (Most underestimated): The most common failure mode in ${r.name} sheep operations is under-capitalisation — starting with insufficient working capital and being forced to sell animals at the wrong time or abandon the operation before Year 2 sales. ${flock < (be ?? 0) ? `With only ${flock} ewes (below the ${be}-ewe breakeven), this is a high-risk operation.` : ""}

Recommended contingency reserve: ${ZAR(Math.round(fa * 0.5))} (6 months of fixed costs) held in a separate account, not touched except for genuine emergencies.

⚠ SANDBOX DEMO — Full AI-written risk analysis included in purchased report.`,

    // 8 — Capital Structure
    `Total capital required: ${ZAR(capital)}.

Stock component: ${ZAR(flock * r.ewePrice)} (${flock} ewes × ${ZAR(r.ewePrice)}/ewe)
Land Bank production loan: Typically prime + 1.5–2.5%, 3–5 year term, quarterly repayments aligned to lamb sales cycles. Security: livestock bond (notarial bond over animals), plus cession of insurance policy. Minimum equity: 30% own contribution (${ZAR(flock * r.ewePrice * 0.3)}).

Working capital: ${ZAR(Math.abs(yr1) * 1.1)} (Year 1 cashflow requirement + 10% buffer)
Recommended: 12-month revolving credit facility with a commercial bank. Agri-specialist at FNB Agri or ABSA Agri will structure drawdowns monthly and repayment timed to lamb sales. Interest only during the first 12 months, capital repayment from Month 13 onwards.

Infrastructure (if applicable): Fencing, handling, water — typically funded from own equity or a separate improvement loan, not production finance.

Land Bank products to investigate:
• Agri-Finance: standard production loan for commercial farmers
• Agri-Business Finance: for agri-processing or value-add components
• Land Acquisition Finance: if land purchase is involved

FNB Agri vs Land Bank: FNB Agri offers more flexible terms and faster approval but typically requires more collateral. Land Bank is the preferred route for first-time farmers with BBBEE compliance — interest rates are often 0.5–1% lower.

Owner equity vs debt recommendation: At ${ZAR(capital)}, a 50/50 split (${ZAR(capital / 2)} own equity, ${ZAR(capital / 2)} debt) is optimal for this scale. Full debt financing is possible but leaves zero margin for the inevitable setback in Year 1.

One honest caution: First-time applicants consistently underestimate the time between loan approval and first livestock on farm. Budget 3–6 months for the loan process — don't time your mating season around an assumed approval date.

⚠ SANDBOX DEMO — Full AI-written financing analysis included in purchased report.`,

    // 9 — Implementation Roadmap
    `Month 1–2 — Site preparation:
• Install/repair handling facilities (crush, loading ramp, dip tank or spray race)
• Confirm water supply reliability — boreholes, dams, pipelines
• Fence camps for rotational grazing (minimum 4 camps for ${flock} ewes)
• Register with your local veterinarian for a herd/flock health protocol
• Open a farm bank account separate from personal finances
• Apply for Land Bank / FNB Agri production loan NOW — allow 3 months for approval

Month 3 — Stock procurement:
• Source ${r.breed} ewes at ${r.name} livestock auctions or directly from registered breeders
• Price benchmark: ${ZAR(r.ewePrice)}/ewe (certified breeding status)
• Purchase 1 ram per 35 ewes (${Math.ceil(flock / 35)} rams for ${flock} ewes) — rams should be from a performance-tested stud with ${r.name} climate exposure
• Transport with veterinary health certificate; quarantine new animals for 14 days

Month 4 — Mating:
• Flush ewes 3 weeks before mating (improve body condition to 3.0–3.5)
• Ram:ewe ratio 1:35 — monitor rams daily for serving ability
• Ram harness/raddle to identify cycling ewes; replace non-serving rams immediately
• Target: 95%+ of ewes mated in first 17-day cycle

Month 5–8 — Gestation management:
• Pregnancy scanning at Month 6 (5 weeks post-mating) — sort single vs twin bearers
• Adjust nutrition by pregnancy class
• Prepare lambing camps — clean, sheltered, predator-proof

Month 9–10 — Lambing:
• Most common first-timer error: abandoning wet ewes. Check every 3–4 hours for the first 10 days
• Colostrum management is critical — lamb must suckle within 2 hours of birth
• Tag and record every lamb at birth
• Castrate and dock ram lambs at 1–7 days

Month 13–14 — First lamb sales (${firstPositive?.mo ?? "January"} Year 2):
• Grade animals before booking — remove underweight animals from the sale group
• Book with ${r.market.split("·")[0]?.trim() ?? "your nearest abattoir"} 2 weeks in advance
• Present animals well-finished (body condition score 3.0+)
• First sale is a learning experience — benchmark against your model and adjust

Month 18 — Expansion decision:
• Review actual vs model performance: lambing %, survival %, carcass price achieved
• If at or above model: retain best 20% of ewe lambs to grow flock toward ${Math.round(flock * 1.3)} ewes
• If below model: identify the single biggest variance and address it before expanding

Five priority actions THIS WEEK:
1. Open a dedicated farm bank account
2. Book a site visit with your local Land Bank agri-assessor
3. Contact ${r.name} livestock auction to register as a buyer/seller
4. Get at least 3 quotes from local feed suppliers for bulk feed pricing
5. Join the SA ${r.breed} Breeders' Society for stud access and production data

⚠ SANDBOX DEMO — Full AI-written implementation plan with province-specific contacts in purchased report.`,
  ];

  const sections = TITLES.map((title, i) => ({ title, body: bodies[i] ?? "" }));

  return {
    sections,
    raw: bodies.join("\n\n"),
    reportData,
    buyerName,
    generatedAt: new Date().toISOString(),
    isSandbox: true,
  };
}

// Province data field mapping (matches PROVINCE_DATA keys):
//   r.lambing   r.survival  r.liveKg    r.dressing  r.wool
//   r.feed      r.health    r.ewePrice  r.rep       r.oh
//   r.labour    r.hired     r.woolMonth r.breed     r.type
//   r.market    r.name      r.climate   r.frost     r.parasites
//   r.why       r.tip       r.avoid

export function buildReportData(r, flock, lm, carcass) {
  const lab = lm === "owner" ? r.labour : r.hired;
  const ck  = r.liveKg * (r.dressing / 100);
  const lpe = (r.lambing / 100) * (r.survival / 100) * 0.85;
  const fa  = (lab + r.oh) * 12;

  const revPE = lpe * ck * carcass + r.wool;
  const varPE = r.feed + r.health + r.ewePrice * (r.rep / 100);
  const vm    = revPE - varPE;
  const be    = vm > 0 ? Math.ceil(fa / vm) : null;
  const pp    = revPE - varPE - fa / flock;

  const capital = flock * r.ewePrice + fa + varPE * flock;
  const npv5    = [-flock * r.ewePrice, ...Array(5).fill(pp * flock)]
    .reduce((a, v, i) => a + v / Math.pow(1.10, i), 0);

  // Scale rows — cluster around breakeven so table tells a story
  const SIZES = [...new Set([
    be ? Math.max(1, be - 10) : 10, be || 50,
    be ? Math.ceil(be * 1.1) : 60,  be ? Math.round(be * 1.5) : 80,
    be ? be * 2 : 100, be ? be * 3 : 150, 200, 350, 500,
  ].filter(v => v > 0))].sort((a, b) => a - b);

  const scaleRows = SIZES.map(n => {
    const c = varPE + fa / n;
    const p = revPE - c;
    return { n, pp: p, fp: p * n, rev: revPE * n, roi: p / r.ewePrice, cap: n * r.ewePrice + fa + varPE * n, ok: p > 0, vsB: p / r.ewePrice - 0.115 };
  });

  // 36-month cashflow — biologically driven schedule
  const isWC   = r.name === "Western Cape";
  const isSale = m => isWC
    ? (m === 12 || m === 13 || m === 24 || m === 25)
    : (m === 13 || m === 14 || m === 25 || m === 26) || (r.lambing >= 140 && (m === 21 || m === 22));
  const isWool = m => r.wool > 0 && r.woolMonth && (m === r.woolMonth + 1 || m === r.woolMonth + 13);
  const mc  = (lab + r.oh) + (r.feed / 12 + r.health / 12) * flock + r.ewePrice * (r.rep / 100) * flock / 12;
  const lrm = Math.floor(flock * lpe * 0.5) * ck * carcass;
  const wrm = r.wool * flock;

  let cum = 0;
  const cfRows = Array.from({ length: 36 }, (_, i) => {
    const m  = i + 1;
    const ev = [];
    if (m === 1)                          ev.push("Stock purchased");
    if (m === 4  || m === 16)             ev.push("Mating");
    if (m === 9  || m === 21)             ev.push("Lambing");
    if ([2, 7, 11, 14, 19, 23].includes(m)) ev.push("Dosing");
    if (m === 6  || m === 18)             ev.push("Preg scan");
    if (isWool(m))                        ev.push("Wool clip");
    if (isSale(m))                        ev.push("Lamb sales");
    const rev    = (isSale(m) ? lrm : 0) + (isWool(m) ? wrm : 0);
    const profit = rev - mc;
    cum += profit;
    return { m, mo: MONTHS[(m - 1) % 12], yr: Math.ceil(m / 12), rev, cost: mc, profit, cum, events: ev.join(", ") };
  });

  // First month with lamb/wool revenue (biologically driven — typically month 13)
  const firstPositive = cfRows.find(d => d.rev > 0);

  // Sensitivity — 9 scenarios ±20%
  const sensRows = [-20, -15, -10, -5, 0, 5, 10, 15, 20].map(pct => {
    const adj   = carcass * (1 + pct / 100);
    const rAdj  = lpe * ck * adj + r.wool;
    const pAdj  = rAdj - varPE - fa / flock;
    const beAdj = (rAdj - varPE) > 0 ? Math.ceil(fa / (rAdj - varPE)) : null;
    return { pct, adj, pp: pAdj, fp: pAdj * flock, roi: pAdj / r.ewePrice, be: beAdj };
  });

  return {
    r, flock, lm, carcass,
    lab, ck, lpe, fa, revPE, varPE, vm, be, pp, capital, npv5,
    scaleRows, cfRows, firstPositive, sensRows, mc,
    yr1: cfRows[11]?.cum ?? 0,
    yr2: cfRows[23]?.cum ?? 0,
    yr3: cfRows[35]?.cum ?? 0,
  };
}

export async function generateReport(reportData, buyerName) {
  const { r, flock, lm, carcass, lab, fa, revPE, varPE, vm, be, pp, capital, npv5,
          scaleRows, cfRows, firstPositive, sensRows, yr1, yr2, yr3, mc } = reportData;

  const scaleText = scaleRows
    .filter((_, i) => i % 2 === 0)
    .map(rw => `  ${rw.n} ewes: profit/ewe ${ZAR(rw.pp)} · flock profit ${ZAR(rw.fp)} · ROI ${PCT(rw.roi)} · capital ${ZAR(rw.cap)} · ${rw.ok ? (rw.roi > 0.15 ? "STRONG" : "VIABLE") : "BELOW BE"}`)
    .join("\n");

  const sensText = sensRows
    .filter(s => [-20, -10, 0, 10, 20].includes(s.pct))
    .map(s => `  ${s.pct > 0 ? "+" : ""}${s.pct}% (R${s.adj.toFixed(0)}/kg): profit/ewe ${ZAR(s.pp)} · ROI ${PCT(s.roi)} · BE ${s.be || "∞"} ewes`)
    .join("\n");

  const labourNote = lm === "owner"
    ? "Owner-operated (notional R1,500/mo — BCEA 2024 hired benchmark R5,594/mo for reference)"
    : "Hired worker at R5,594/mo (BCEA 2024 Sectoral Determination + UIF 1% + SDL 1% + housing allowance R800)";

  const prompt = `You are a senior South African agricultural finance consultant with 20 years of experience in sheep production and rural finance across the Karoo, Bushveld, and Cape regions. You write concise, expert, opinionated reports — no filler, no generic advice. Every sentence earns its place.

This report is for a Land Bank or FNB Agri loan application and for the farmer's own decision-making. It must justify a R1,500 consulting fee by delivering specific, actionable, SA-grounded insights that the farmer could not easily find elsewhere.

══════════════════════════════════════════════════════════════
CLIENT: ${buyerName}
PROVINCE: ${r.name}
BREED: ${r.breed} (${r.type})
FLOCK: ${flock} ewes
LABOUR: ${labourNote}
CARCASS: R${carcass}/kg A2 (AgriOrbit Apr 2025)
══════════════════════════════════════════════════════════════

VERIFIED FINANCIALS (use these exact numbers):
  Revenue/ewe/yr:        ${ZAR(revPE)}  (lamb ${ZAR(lpe * ck * carcass)} + wool ${ZAR(r.wool)})
  Variable cost/ewe/yr:  ${ZAR(varPE)}  (feed ${ZAR(r.feed)} + health ${ZAR(r.health)} + replacement ${ZAR(r.ewePrice * (r.rep / 100))})
  Variable margin/ewe:   ${ZAR(vm)}
  Fixed annual:          ${ZAR(fa)}  (labour ${ZAR(lab * 12)} + overhead ${ZAR(r.oh * 12)})
  Breakeven flock:       ${be} ewes
  Profit/ewe @ ${flock}: ${ZAR(pp)}
  Flock profit/yr:       ${ZAR(pp * flock)}
  ROI on stock capital:  ${PCT(pp / r.ewePrice)}
  Capital required:      ${ZAR(capital)}  (stock ${ZAR(flock * r.ewePrice)} + running ${ZAR(fa + varPE * flock)})
  5-yr NPV (10%):        ${ZAR(npv5)}
  First lamb revenue:    Month ${firstPositive?.m || 13} (${firstPositive?.mo || "Jan"} Yr${firstPositive?.yr || 2}) — first cash from lamb sales
  Yr 1 P&L:              ${ZAR(yr1)}  (entirely negative — first lamb sales only at Month ${firstPositive?.m || 13})
  Yr 2 cumulative:       ${ZAR(yr2)}
  Yr 3 cumulative:       ${ZAR(yr3)}
  Monthly operating cost:${ZAR(mc)}  (labour + overhead + feed + health + replacement reserve)

SCALE TABLE (selected):
${scaleText}

SENSITIVITY TABLE:
${sensText}

REGIONAL PROFILE:
  Climate:    ${r.climate}
  Frost:      ${r.frost}
  Parasites:  ${r.parasites}
  Market:     ${r.market}
  Why ${r.breed}: ${r.why}
  Pro insight: ${r.tip || ""}
  Avoid:      ${r.avoid?.join(", ") || "None"}

COST STRUCTURE:
  Feed R${r.feed}/ewe/yr (Land Bank extensive benchmark)
  Health R${r.health}/ewe/yr (ProAgri 3-cycle dosing schedule)
  Replacement ${r.rep}% of flock annually at R${r.ewePrice}/ewe
  Overhead R${r.oh}/mo (water, fuel, repairs, electricity)
  Labour: ${labourNote}

══════════════════════════════════════════════════════════════
WRITE EXACTLY 9 SECTIONS. Each section: 220–300 words.
Professional, specific, SA-grounded, expert tone.
No waffle. Use the exact financial numbers above throughout.
══════════════════════════════════════════════════════════════

SECTION 1 — EXECUTIVE SUMMARY
Open with a one-sentence verdict on this operation (viable/marginal/strong). Then: operation type and scale, key financial metrics (use the exact numbers above), first cashflow date, 3-year outlook, capital requirement, and a clear bankability rating for Land Bank submission (Strong / Moderate / Marginal — with one sentence explaining why). End with a single recommended action.

SECTION 2 — REGIONAL ANALYSIS: ${r.name.toUpperCase()}
Go beyond climate summaries. Cover: specific grazing districts and carrying capacity (ha/ewe for ${r.name}), water security for sheep farming, the real abattoir infrastructure in ${r.name} (name auction markets or abattoirs where you can — Karan Beef, RCL, Dawn Meats, local cooperatives), typical wool buyer networks if applicable, transport cost reality from farm to market, and any province-specific regulatory or land tenure considerations. End with: what separates successful ${r.name} sheep operations from failed ones.

SECTION 3 — BREED ANALYSIS: ${r.breed.toUpperCase()}
Deep breed profile using your numbers: lambing ${r.lambing}%, survival ${r.survival}%, live weight ${r.liveKg}kg at slaughter, dressing ${r.dressing}%, wool income ${r.wool > 0 ? ZAR(r.wool) + "/ewe/yr" : "nil (hair breed)"}. Cover: the genetic history and why this breed suits ${r.name}, where to source commercial breeding stock in SA (name specific studs or sale events if you can), the stud-vs-commercial decision at this scale, key health management priorities specific to this breed in ${r.name}, and what performance red flags to watch in year 1.

SECTION 4 — FINANCIAL MODEL: METHODOLOGY AND ASSUMPTIONS
Walk through every assumption with its source. Be transparent about what's conservative and what could be optimistic. Explain: why feed is R${r.feed}/ewe (not intensive feedlot, not zero-cost veld — this is the Land Bank extensive benchmark), why health is R${r.health}/ewe (ProAgri 3-cycle dosing schedule), why replacement is ${r.rep}% (SA commercial norm, not stud herd), the carcass price basis (AgriOrbit A2 April 2025 R${carcass}/kg), and the overhead assumption. Explain what the variable margin of ${ZAR(vm)}/ewe means for scaling — this is the number that determines the business. Flag any assumptions that are most likely to be wrong for this specific operation.

SECTION 5 — 36-MONTH CASHFLOW ANALYSIS
Tell the cashflow story as a narrative. Explain: why the first ${firstPositive?.m || 13} months are entirely cash-negative (biological reality — you are feeding ewes that have not yet produced a saleable crop), what the ${ZAR(Math.abs(yr1))} drawdown in year 1 represents practically (working capital requirement — not a loss on the operation), why Month ${firstPositive?.m || 13} (${firstPositive?.mo || "January"} Year ${firstPositive?.yr || 2}) is the critical turning point when the first lamb cheque arrives, the seasonal revenue concentration risk (all income in 2 months), the Year 2 cumulative position (${ZAR(yr2)}), how Year 3 cumulative (${ZAR(yr3)}) begins to show the sustainable run rate. The monthly operating cost of ${ZAR(mc)} — what that actually represents on a weekly farm level. What short-term credit facility is best suited to bridge the 13-month dry period before first sales.

SECTION 6 — SCALE AND BREAKEVEN ANALYSIS
The breakeven of ${be} ewes is not a theoretical number — explain what it means operationally for ${r.name}. At ${be} ewes, variable margin exactly covers fixed costs — the variable margin per ewe is ${ZAR(vm)}. Explain the dilution economics — why doubling the flock more than doubles the profit. Walk through the scale table: at what flock size does this become a primary income for a family? At what size does it outperform money in the bank (prime 11.5%)? What land and infrastructure does each scale point require in ${r.name}? The one reinvestment decision that matters most in year 3.

SECTION 7 — RISK ANALYSIS AND SENSITIVITY
This section earns the R1,500 fee. Cover each risk with a specific probability assessment and mitigation:
1. PRICE RISK: The sensitivity table shows ${ZAR(sensRows.find(s => s.pct === -20)?.pp || 0)}/ewe profit at -20% carcass price (R${(carcass * 0.8).toFixed(0)}/kg). Is this survivable? What's the practical floor on lamb prices in SA?
2. DROUGHT RISK: ${r.name} specifics — historical drought frequency, AgriSure CP coverage, stocking rate reduction trigger.
3. DISEASE RISK: The specific disease threats for ${r.breed} in ${r.name}, annual health budget coverage, Bluetongue/Rift Valley Fever/Scrapie notification requirements.
4. MARKET RISK: What happens if the nearest abattoir closes or changes grading? Alternative channels.
5. MANAGEMENT RISK: The most common reason sheep operations in ${r.name} fail — be specific and honest.
Conclude with a recommended contingency reserve amount in rands for this specific operation.

SECTION 8 — CAPITAL STRUCTURE AND FINANCING
Total capital requirement: ${ZAR(capital)}. Structure this practically:
- Stock component ${ZAR(flock * r.ewePrice)}: Land Bank production loan options, typical terms (prime + 1-2%, 3-5 year, quarterly repayment aligned to lamb sales), what collateral is required.
- Working capital ${ZAR(Math.max(0, fa + varPE * flock))}: revolving credit facility recommendation, timing to align with January/February sales — typically a 12-month revolving facility.
- Specific Land Bank products: Agri-Finance, MAFISA, or relevant schemes by name.
- FNB Agri and ABSA Agri as alternatives: key differences in security requirements.
- The owner equity vs debt recommendation for this scale and risk profile.
- One honest caution about livestock finance that many first-time applicants miss.

SECTION 9 — IMPLEMENTATION ROADMAP
Month-by-month for the first 18 months, then quarterly to year 3. Be specific — not "source breeding stock" but WHERE in ${r.name} to source ${r.breed} ewes, at what auction, in what month. Cover:
- Months 1-3: exact infrastructure preparation checklist for ${r.name}
- Month 4: mating — ram:ewe ratio, condition scoring, what to do if a ewe fails to conceive
- Months 9-10: lambing management — what the first-time operator gets wrong
- Months 13-14: first lamb sales — how to present animals, grading expectations, who to call
- Month 18: second crop arriving — expansion decision framework
Five concrete next steps the client should take THIS WEEK, ranked by priority.`;

  const TITLES = [
    "Executive Summary",
    "Regional Analysis",
    "Breed Analysis",
    "Financial Model & Assumptions",
    "36-Month Cashflow Analysis",
    "Scale & Breakeven Analysis",
    "Risk Analysis & Sensitivity",
    "Capital Structure & Financing",
    "Implementation Roadmap",
  ];

  const callApi = async (attempt) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 130_000);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 10000,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: controller.signal,
      });

      if (response.status === 429 || response.status === 529) {
        const retryAfter = parseInt(response.headers.get("retry-after") || "15", 10);
        throw Object.assign(new Error(`Rate limited (attempt ${attempt})`), { retryable: true, wait: retryAfter * 1000 });
      }
      if (response.status >= 500) {
        throw Object.assign(new Error(`Server error ${response.status} (attempt ${attempt})`), { retryable: true, wait: 5000 });
      }
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`API ${response.status}: ${body.slice(0, 300)}`);
      }

      const data = await response.json();
      return data.content?.[0]?.text || "";
    } finally {
      clearTimeout(timeout);
    }
  };

  let text = "";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      text = await callApi(attempt);
      break;
    } catch (err) {
      if (err.retryable && attempt < 3) {
        await new Promise(res => setTimeout(res, err.wait || 5000));
        continue;
      }
      throw err;
    }
  }

  // Parse sections: split on "SECTION N —" or "SECTION N:" patterns
  const raw = text.split(/\n?SECTION \d{1,2}\s*[—–:\-]\s*/i).filter(s => s.trim().length > 30);

  // Strip leading title line from each chunk (the AI echoes the section title after the delimiter)
  const parseBody = chunk => chunk.replace(/^[^\n]*\n/, "").trim();

  const sections = TITLES.map((title, i) => ({
    title,
    body: raw[i] ? parseBody(raw[i]) : `[Section ${i + 1} not generated — please regenerate the report]`,
  }));

  return {
    sections,
    raw: text,
    reportData,
    buyerName,
    generatedAt: new Date().toISOString(),
  };
}
