// ─────────────────────────────────────────────────────────────────────────────
// AGRIMODEL PRO — R1,500 REPORT ENGINE
// This is what justifies the price. Claude writes as a senior agricultural
// finance consultant — specific, opinionated, bankable.
// ─────────────────────────────────────────────────────────────────────────────

const MO = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const ZAR = (n, d=0) => `R ${Math.abs(isNaN(n)?0:n).toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g,",")}`;
const PCT = (n) => `${((isNaN(n)?0:n)*100).toFixed(1)}%`;
const SGN = (n) => n >= 0 ? "+" : "−";

export function buildReportData(r, flock, lm, carcass) {
  const lab = lm === "owner" ? r.labour : r.hired;
  const ck  = r.liveKg * (r.dress / 100);
  const lpe = (r.lambing / 100) * (r.surv / 100) * 0.85;
  const fa  = (lab + r.oh) * 12;

  const revPE  = lpe * ck * carcass + r.wool;
  const varPE  = r.feed + r.health + r.price * (r.rep / 100);
  const vm     = revPE - varPE;
  const be     = vm > 0 ? Math.ceil(fa / vm) : null;
  const pp     = revPE - varPE - fa / flock;
  const capital = flock * r.price + fa + varPE * flock;
  const npv5   = [-flock * r.price, ...Array(5).fill(pp * flock)]
    .reduce((a, v, i) => a + v / Math.pow(1.10, i), 0);

  // Scale rows
  const SIZES = [...new Set([
    be ? Math.max(1, be - 10) : 10, be || 50,
    be ? Math.ceil(be * 1.1) : 60, be ? Math.round(be * 1.5) : 80,
    be ? be * 2 : 100, be ? be * 3 : 150, 200, 350, 500
  ].filter(v => v > 0))].sort((a, b) => a - b);

  const scaleRows = SIZES.map(n => {
    const c  = varPE + fa / n;
    const p  = revPE - c;
    return { n, pp: p, fp: p*n, rev: revPE*n, roi: p/r.price, cap: n*r.price+fa+varPE*n, ok: p>0, vsB: p/r.price - 0.115 };
  });

  // 36m cashflow
  const isWC = r.name === "Western Cape";
  const isSale = m => isWC ? (m===12||m===13||m===24||m===25) : (m===13||m===14||m===25||m===26) || (r.lambing >= 140 && (m===21||m===22));
  const isWool = m => r.wool > 0 && r.woolMonth && (m === r.woolMonth+1 || m === r.woolMonth+13);
  const mc = (lab + r.oh) + (r.feed/12 + r.health/12) * flock + r.price * (r.rep/100) * flock/12;
  const lrm = Math.floor(flock * lpe * 0.5) * ck * carcass;
  const wrm = r.wool * flock;

  let cum = 0;
  const cfRows = Array.from({ length: 36 }, (_, i) => {
    const m   = i + 1;
    const ev  = [];
    if (m===1)  ev.push("Stock purchased");
    if (m===4||m===16)  ev.push("Mating");
    if (m===9||m===21)  ev.push("Lambing");
    if ([2,7,11,14,19,23].includes(m)) ev.push("Dosing");
    if (m===6||m===18)  ev.push("Preg scan");
    if (isWool(m))      ev.push("Wool clip");
    if (isSale(m))      ev.push("Lamb sales");
    const rev = (isSale(m) ? lrm : 0) + (isWool(m) ? wrm : 0);
    const profit = rev - mc;
    cum += profit;
    return { m, mo: MO[(m-1)%12], yr: Math.ceil(m/12), rev, cost: mc, profit, cum, events: ev.join(", ") };
  });

  const firstPositive = cfRows.find(d => d.cum > 0);

  // Sensitivity
  const sensRows = [-20,-15,-10,-5,0,5,10,15,20].map(pct => {
    const adj  = carcass * (1 + pct/100);
    const rAdj = lpe * ck * adj + r.wool;
    const pAdj = rAdj - varPE - fa / flock;
    const beAdj = (rAdj - varPE) > 0 ? Math.ceil(fa / (rAdj - varPE)) : null;
    return { pct, adj, pp: pAdj, fp: pAdj*flock, roi: pAdj/r.price, be: beAdj };
  });

  return {
    r, flock, lm, carcass,
    lab, ck, lpe, fa, revPE, varPE, vm, be, pp, capital, npv5,
    scaleRows, cfRows, firstPositive, sensRows,
    yr1: cfRows[11]?.cum ?? 0,
    yr2: cfRows[23]?.cum ?? 0,
    yr3: cfRows[35]?.cum ?? 0,
    mc,
  };
}

export async function generateReport(reportData, buyerName) {
  const { r, flock, lm, carcass, lab, fa, revPE, varPE, vm, be, pp, capital, npv5,
    scaleRows, cfRows, firstPositive, sensRows, yr1, yr2, yr3 } = reportData;

  const scaleText = scaleRows
    .filter((_, i) => i % 2 === 0)
    .map(rw => `  ${rw.n} ewes: profit/ewe ${ZAR(rw.pp)} · flock profit ${ZAR(rw.fp)} · ROI ${PCT(rw.roi)} · capital ${ZAR(rw.cap)} · ${rw.ok ? (rw.roi > 0.15 ? "STRONG" : "VIABLE") : "BELOW BE"}`)
    .join("\n");

  const sensText = sensRows
    .filter(s => [-20,-10,0,10,20].includes(s.pct))
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
  Revenue/ewe/yr:        ${ZAR(revPE)}  (lamb ${ZAR(lpe*ck*carcass)} + wool ${ZAR(r.wool)})
  Variable cost/ewe/yr:  ${ZAR(varPE)}  (feed ${ZAR(r.feed)} + health ${ZAR(r.health)} + replacement ${ZAR(r.price*(r.rep/100))})
  Variable margin/ewe:   ${ZAR(vm)}
  Fixed annual:          ${ZAR(fa)}  (labour ${ZAR(lab*12)} + overhead ${ZAR(r.oh*12)})
  Breakeven flock:       ${be} ewes
  Profit/ewe @ ${flock}: ${ZAR(pp)}
  Flock profit/yr:       ${ZAR(pp*flock)}
  ROI on stock capital:  ${PCT(pp/r.price)}
  Capital required:      ${ZAR(capital)}  (stock ${ZAR(flock*r.price)} + running ${ZAR(fa+varPE*flock)})
  5-yr NPV (10%):        ${ZAR(npv5)}
  First +ve cashflow:    Month ${firstPositive?.m || "N/A"} (${firstPositive?.mo || "N/A"} Yr${firstPositive?.yr || "N/A"})
  Yr 1 P&L:              ${ZAR(yr1)}
  Yr 2 cumulative:       ${ZAR(yr2)}
  Yr 3 cumulative:       ${ZAR(yr3)}

SCALE TABLE (selected):
${scaleText}

SENSITIVITY TABLE:
${sensText}

REGIONAL PROFILE:
  Climate:    ${r.climate}
  Frost:      ${r.frost}
  Parasites:  ${r.parasites}
  Market:     ${r.market}
  Why ${r.breed}:  ${r.why}
  Pro insight: ${r.tip || ""}
  Avoid:      ${r.avoid?.join(", ") || "None"}

COST STRUCTURE:
  Feed R${r.feed}/ewe/yr (FarmShare/Land Bank extensive benchmark)
  Health R${r.health}/ewe/yr (ProAgri: 3 dosing cycles + extras)
  Replacement ${r.rep}% of flock annually at R${r.price}/ewe
  Overhead R${r.oh}/mo (water, fuel, repairs, electricity)
  Labour: ${labourNote}

══════════════════════════════════════════════════════════════
WRITE EXACTLY 9 SECTIONS. Each section: 220–300 words. 
Professional, specific, SA-grounded, expert tone.
No waffle. If you don't know a specific fact, give the best 
estimate a senior SA consultant would give.
Use the exact financial numbers above throughout.
══════════════════════════════════════════════════════════════

SECTION 1 — EXECUTIVE SUMMARY
Open with a one-sentence verdict on this operation (viable/marginal/strong). Then: operation type and scale, key financial metrics (use the exact numbers above), first cashflow date, 3-year outlook, capital requirement, and a clear bankability rating for Land Bank submission (Strong / Moderate / Marginal — with one sentence explaining why). End with a single recommended action.

SECTION 2 — REGIONAL ANALYSIS: ${r.name.toUpperCase()}
Go beyond climate summaries. Cover: specific grazing districts and carrying capacity (ha/ewe for ${r.name}), water security for sheep farming, the real abattoir infrastructure in ${r.name} (name auction markets or abattoirs where you can — Karan Beef, RCL, Dawn Meats, local cooperatives), typical wool buyer networks if applicable, transport cost reality from farm to market, and any province-specific regulatory or land tenure considerations. End with: what separates successful ${r.name} sheep operations from failed ones.

SECTION 3 — BREED ANALYSIS: ${r.breed.toUpperCase()}
Deep breed profile using your numbers: lambing ${r.lambing}%, survival ${r.surv}%, live weight ${r.liveKg}kg at slaughter, dressing ${r.dress}%, wool income ${r.wool > 0 ? ZAR(r.wool)+"/ewe/yr" : "nil (hair breed)"}. Cover: the genetic history and why this breed suits ${r.name}, where to source commercial breeding stock in SA (name specific studs or sale events if you can), the stud-vs-commercial decision at this scale, key health management priorities specific to this breed in ${r.name}, and what performance red flags to watch in year 1.

SECTION 4 — FINANCIAL MODEL: METHODOLOGY AND ASSUMPTIONS
Walk through every assumption with its source. Be transparent about what's conservative and what could be optimistic. Explain: why feed is R${r.feed}/ewe (not intensive feedlot, not zero-cost veld — this is the Land Bank extensive benchmark), why health is R${r.health}/ewe (ProAgri 3-cycle dosing schedule), why replacement is ${r.rep}% (SA commercial norm, not stud herd), the carcass price basis (AgriOrbit A2 April 2025 R${carcass}/kg), and the overhead assumption. Explain what the variable margin of ${ZAR(vm)}/ewe means for scaling — this is the number that determines the business. Flag any assumptions that are most likely to be wrong for this specific operation.

SECTION 5 — 36-MONTH CASHFLOW ANALYSIS
Tell the cashflow story as a narrative, not a table summary. Explain: why the first 13 months are entirely cash-negative (biological reality — you are feeding animals that are not yet producing), what the R${Math.abs(yr1 < 0 ? yr1 : -Math.abs(yr1)).toLocaleString()} drawdown in year 1 represents practically (it's your working capital requirement, not a loss), why Month ${firstPositive?.m || 14} (${firstPositive?.mo || "February"} Year ${firstPositive?.yr || 2}) is the critical turning point, the January/February revenue concentration risk and how to manage it, the Year 2 pattern as the second crop arrives, how Year 3 begins to show the real sustainable run rate. Practical advice: what banking facility to use for the 13-month dry period. The monthly cost of ${ZAR(reportData.mc)} — what that actually represents week to week.

SECTION 6 — SCALE AND BREAKEVEN ANALYSIS
The breakeven of ${be} ewes is not a theoretical number — explain what it means operationally for ${r.name}. At ${be} ewes, variable margin exactly covers fixed costs — the variable margin per ewe is ${ZAR(vm)}. Below that, every ewe loses money on fixed cost allocation. At ${Math.ceil((be||0)*1.1)} ewes (this model), profit per ewe is ${ZAR(pp)}. Explain the dilution economics — why doubling the flock more than doubles the profit. Walk through the scale table: at what flock size does this become a primary income for a family? At what size does it outperform money in the bank (prime 11.5%)? What land and infrastructure does each scale point require in ${r.name}? The one reinvestment decision that matters most in year 3.

SECTION 7 — RISK ANALYSIS AND SENSITIVITY
This section earns the R1,500 fee. Cover each risk with a specific probability assessment and mitigation:
1. PRICE RISK: The sensitivity table shows ${ZAR(sensRows.find(s=>s.pct===-20)?.pp || 0)}/ewe profit at -20% carcass price (R${(carcass*0.8).toFixed(0)}/kg). Is this survivable? What's the practical floor on lamb prices in SA?
2. DROUGHT RISK: ${r.name} specifics — historical drought frequency, AgriSure CP coverage, stocking rate reduction trigger.
3. DISEASE RISK: The specific disease threats for ${r.breed} in ${r.name} (not generic), what the annual health budget needs to cover, Bluetongue/Rift Valley Fever/Scrapie notification requirements.
4. MARKET RISK: What happens if the nearest abattoir closes or changes grading? Alternative channels.
5. MANAGEMENT RISK: The most common reason sheep operations in ${r.name} fail — be specific and honest.
Conclude with a recommended contingency reserve amount (in rands, for this specific operation).

SECTION 8 — CAPITAL STRUCTURE AND FINANCING
Total capital requirement: ${ZAR(capital)}. Structure this practically:
- Stock component ${ZAR(flock*r.price)}: Land Bank production loan options, typical terms (prime + 1-2%, 3-5 year, quarterly repayment aligned to lamb sales), what collateral is required.
- Working capital ${ZAR(fa + varPE*flock - flock*r.price)}: revolving credit facility recommendation, timing to align with January/February sales.
- Specific Land Bank products: mention Agri-Finance, MAFISA, or relevant schemes by name.
- FNB Agri and ABSA Agri as alternatives: key differences in security requirements.
- The owner equity vs debt recommendation for this scale and risk profile.
- One honest caution about livestock finance that many first-time applicants miss.

SECTION 9 — IMPLEMENTATION ROADMAP
Month-by-month for the first 18 months, then quarterly to year 3. Be specific — not "source breeding stock" but WHERE in ${r.name} to source ${r.breed} ewes, at what auction, in what month (SA stud sale calendar). Cover:
- Months 1-3: exact infrastructure preparation checklist for ${r.name}
- Month 4: mating — ram:ewe ratio, condition scoring, what to do if a ewe fails to conceive
- Months 9-10: lambing management — what the first-time operator gets wrong
- Months 13-14: first lamb sales — how to present animals, grading expectations, who to call
- Month 18: second crop arriving — expansion decision framework
Five concrete next steps the client should take THIS WEEK, ranked by priority.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 10000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "";

  // Parse sections
  const raw = text.split(/SECTION \d+ ?[—–\-] ?/i).filter(s => s.trim().length > 20);
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

  return {
    sections: TITLES.map((title, i) => ({
      title,
      body: raw[i] ? raw[i].replace(/^[^\n]*\n/, "").trim() : "",
    })),
    raw: text,
    reportData,
    buyerName,
    generatedAt: new Date().toISOString(),
  };
}
