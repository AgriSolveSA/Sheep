import { ZAR, PCT, MONTHS } from "./utils.js";

// ── SHEEP CARRYING CAPACITY ───────────────────────────────────────────────────
const PROV_CC = {
  "Limpopo":       "5–8 ha/ewe across most bushveld areas, improving to 3–4 ha with water development and controlled rotational grazing",
  "North West":    "6–10 ha/ewe in drier districts, 4–6 ha in better-rainfall areas near the Magaliesberg",
  "Gauteng":       "2–4 ha/ewe with good pasture management — the province's small size means every hectare counts",
  "Mpumalanga":    "3–5 ha/ewe on highveld (Ermelo/Standerton), 5–8 ha in the drier lowveld belt",
  "Free State":    "4–8 ha/ewe, highly variable by district — Karoo transition zone (Springfontein/Trompsburg) requires conservative stocking below 8 ha/ewe",
  "KwaZulu-Natal": "2–4 ha/ewe in the coastal midlands, 4–8 ha in drier western KZN near the Drakensberg foothills",
  "Western Cape":  "3–6 ha/ewe in the Klein Karoo, improving to 1–3 ha on well-managed renosterveld in the Swartland",
  "Eastern Cape":  "3–8 ha/ewe, ranging from Karoo (conservative) to fertile midlands — extremely variable by rainfall zone",
  "Northern Cape": "8–15 ha/ewe in Namaqualand/Bushmanland, improving to 5–8 ha in the Gordonia/Kenhardt area",
};

// ── CATTLE CARRYING CAPACITY ──────────────────────────────────────────────────
const CATTLE_CC = {
  "Limpopo":       "4–8 ha/LSU on good bushveld around Mokopane and Waterberg — improving to 3–4 ha with rotational grazing and water development. Lephalale and far northern bushveld requires 8–12 ha/LSU on sparse mopane veld.",
  "North West":    "6–10 ha/LSU in the semi-arid Kalahari fringe; 4–6 ha in better-rainfall areas near the Magaliesberg and the Vryburg corridor.",
  "Gauteng":       "2–4 ha/LSU with improved pasture management. Proximity to Johannesburg markets offsets high land cost — intensive operations are viable from 10ha+ with external feed sourcing.",
  "Mpumalanga":    "3–5 ha/LSU on the highveld (Ermelo/Standerton), rising to 5–10 ha in the drier lowveld. Highveld grasslands support the highest calving percentages in the province.",
  "Free State":    "4–8 ha/LSU — highly variable. Northern Free State (better rainfall) supports 3–5 ha/LSU. Karoo transition zone requires conservative planning at 8–10 ha/LSU.",
  "KwaZulu-Natal": "2–4 ha/LSU in the coastal midlands and north KZN where Nguni is indigenous. Higher tick pressure demands intensive management — underdosed cattle lose condition rapidly.",
  "Western Cape":  "2–4 ha/LSU on improved cereal stubble and renosterveld in the Swartland and Overberg. Wheat/cattle rotation farms achieve the lowest hay and supplementary feed cost per LSU in SA.",
  "Eastern Cape":  "3–8 ha/LSU across the province — Karoo interior requires conservative 6–10 ha/LSU; Midlands 2–4 ha on improved pastures. Most diverse cattle province in SA by environment.",
  "Northern Cape": "8–20 ha/LSU in the semi-arid Northern Cape. Vryburg/Kuruman corridor supports 6–10 ha/LSU on natural veld. Namaqualand requires 15–25 ha/LSU — supplementary feeding is mandatory in drought years.",
};

// ── SHEEP BREED SOURCES ───────────────────────────────────────────────────────
const BREED_SOURCES = {
  "Dorper":
    "The SA Dorper Sheep Breeders' Society (SADSBS — sadsbs.co.za) maintains a directory of production-tested studs. Premier sourcing events: Vryburg Annual Dorper Show (North West, March), Prieska Production Sale (Northern Cape), Kroonstad Livestock Auction (Free State). Insist on animals from the National Dorper Recording Scheme (NDRS) with published index values — top-decile indexed rams improve lambing percentage 8–12% over non-recorded stock.",
  "Meatmaster":
    "The Meatmaster Sheep Breeders' Society (meatmastersociety.co.za) coordinates annual evaluation days at which top studs present BLUP-indexed rams. Leading Limpopo studs are concentrated near Vaalwater, Mokopane, and Waterberg. Request the performance index report before purchase.",
  "Merino":
    "Merino SA (merinosa.co.za) coordinates regional Young Ram Sales. Klein Karoo Agricultural Show (Oudtshoorn, June) is the premier Cape event; Springfontein area hosts the key Free State/Northern Cape show. Cape Wools SA (capewoolssa.co.za) provides grading and price support for clip marketing.",
  "SAMM":
    "The SA Mutton Merino Breeders' Society holds production sales in Ermelo and Middelburg (Mpumalanga) annually. Source rams with above-average BLUP indexes on both fleece weight and carcass traits.",
  "Dohne Merino":
    "The Dohne Merino Breed Society (dohnesa.co.za) coordinates annual sales in Stutterheim (Eastern Cape) and Bethlehem (Free State). Insist on National Dohne Recording Scheme data with index values for both fleece and meat traits.",
  "Damara":
    "The Damara Breeders' Society of SA holds annual production events — leading studs in the Northern Cape (Upington/Kakamas) and North West. Source animals from DAFF-registered breeders and avoid informal auctions where health status cannot be verified.",
  "Van Rooy":
    "SA Van Rooy Sheep Breeders' Society. Best sourced at regional livestock auctions in Upington and Calvinia. Fat-tail reserves sustain ewe condition through dry periods without costly supplementary feeding.",
  "_default":
    "Contact the relevant SA breed society for your province — most coordinate annual production days where you can inspect performance-tested animals. For commercial replacements, local livestock auctions offer certified breeding-status ewes at competitive prices. Always request health and production history before purchase.",
};

// ── CATTLE BREED SOURCES ──────────────────────────────────────────────────────
const CATTLE_BREED_SOURCES = {
  "Bonsmara":
    "The Bonsmara Cattle Breeders' Society of SA (bonsmara.co.za) coordinates annual bull performance tests at Vryheid and Mokopane. Source bulls with above-average weaning weight EPD and scrotal circumference above 36cm at 18 months. For commercial cows, established breeders in Limpopo and Free State offer pregnancy-tested in-calf heifers at market rates. Avoid stud overhead below 300-cow scale.",
  "Nguni":
    "The Nguni Cattle Breeders' Society (nguni.co.za) runs annual production sales — Zululand and the Eastern Cape are the primary sourcing regions. For commercial cow herds, KZN and Eastern Cape communal farmers provide affordable Nguni base cows — these work best crossed with a Bonsmara or Brahman terminal sire for weaner production.",
  "Angus":
    "Angus SA (angus.co.za) coordinates production-tested bull sales nationally. Cape Angus bulls from the Swartland/Overberg region lead on marbling and carcass quality. For feedlot supply, insist on bulls with above-average retail beef yield and a minimum frame score of 4–5.",
  "Simmentaler":
    "Simmentaler SA (simmentaler.co.za) coordinates national production sales. Simmentaler's high growth rate suits intensive and semi-intensive systems. In extensive conditions, use Simmentaler as a terminal sire on a Bonsmara or Nguni cow base rather than as a pure-bred commercial cow.",
  "Brahman":
    "The SA Brahman Breeders' Society coordinates annual bull sales. Source bulls with documented tick resistance and a Frame Score of 5–6 for feedlot-acceptable weaner weights. Brahman × Bonsmara F1 crosses are the SA commercial standard for hot, tick-pressured environments.",
  "Drakensberger":
    "The Drakensberger Breeders' Society holds production sales in the Eastern Cape. This indigenous SA breed offers strong drought tolerance and is gaining recognition in the premium grass-fed beef sector.",
  "_default":
    "Contact the relevant SA cattle breed society for your province — most coordinate annual bull performance tests and production days. For commercial cow herds, local livestock auctions offer pregnancy-tested cows at competitive prices. Always verify pregnancy status, tick-treatment history, and vaccination records before purchase.",
};

// ── SANDBOX REPORT (PREVIEW) ──────────────────────────────────────────────────
export function generateSandboxReport(reportData, buyerName) {
  const { r, flock, lm, carcass, lab, fa, revPE, varPE, vm, be, pp, capital, npv5,
          scaleRows, cfRows, firstPositive, sensRows, yr1, yr2, yr3, mc } = reportData;
  const lmNote  = lm === "owner" ? "owner-operated (notional R1,500/mo)" : "hired worker (BCEA 2024 R5,594/mo)";
  const s20     = sensRows.find(s => s.pct === -20);
  const scaleStr= scaleRows.filter((_, i) => i % 2 === 0)
    .map(rw => `${rw.n} units → profit ${ZAR(rw.fp)}/yr (ROI ${PCT(rw.roi)})`).join(" | ");
  const viabilityVerdict = pp > 0
    ? `VIABLE — this ${flock}-unit operation in ${r.name} generates ${ZAR(pp)}/unit/year net.`
    : `MARGINAL — at ${flock} units, below the ${be ?? "?"}-unit breakeven. Scale up before committing capital.`;
  const TITLES = [
    "Executive Summary", "Regional Analysis", "Products & Breed Analysis",
    "Financial Model & Assumptions", "36-Month Cashflow Analysis",
    "Scale & Breakeven Analysis", "Risk Analysis & Sensitivity",
    "Capital Structure & Financing", "Implementation Roadmap",
  ];
  const bodies = [
    `${viabilityVerdict}\n\nKey financials: Revenue ${ZAR(revPE)}/unit/yr · Cost ${ZAR(varPE)}/unit · Breakeven ${be ?? "N/A"} units · Profit ${ZAR(pp)}/unit · Capital ${ZAR(capital)}.\n\n⚠ SANDBOX DEMO — Purchase the full report for the AI-written province-specific analysis.`,
    `${r.name} — ${r.climate}.\n\nMarket: ${r.market}.\n\n${r.tip ? `Insight: ${r.tip}` : ""}\n\n⚠ SANDBOX DEMO`,
    `${r.breed} — ${r.why}\n\n⚠ SANDBOX DEMO`,
    `Revenue ${ZAR(revPE)}/unit · Costs ${ZAR(varPE)}/unit · Variable margin ${ZAR(vm)}/unit · Fixed ${ZAR(fa)}/yr · Breakeven ${be ?? "N/A"} units.\n\n⚠ SANDBOX DEMO`,
    `First revenue: Month ${firstPositive?.m ?? 13}. Year 1: ${ZAR(yr1)} · Year 2: ${ZAR(yr2)} · Year 3: ${ZAR(yr3)}.\n\n⚠ SANDBOX DEMO`,
    `Breakeven: ${be ?? "N/A"} units. ${scaleStr}\n\n⚠ SANDBOX DEMO`,
    `Price risk: at -20%, profit = ${ZAR(s20?.pp ?? 0)}. Drought: ${r.drought}.\n\n⚠ SANDBOX DEMO`,
    `Total capital: ${ZAR(capital)}. Stock: ${ZAR(flock * r.ewePrice)}.\n\n⚠ SANDBOX DEMO`,
    `Month 1–3: setup. First revenue: Month ${firstPositive?.m ?? 13}.\n\n⚠ SANDBOX DEMO`,
  ];
  return { sections: TITLES.map((title, i) => ({ title, body: bodies[i] ?? "" })), raw: bodies.join("\n\n"), reportData, buyerName, generatedAt: new Date().toISOString(), isSandbox: true };
}

// ── PROVINCE DATA FIELD MAPPING ───────────────────────────────────────────────
export function buildReportData(r, flock, lm, carcass, inputs = {}) {
  const {
    feedOverride    = null,
    healthOverride  = null,
    labourOverride  = null,
    productionSystem = "extensive",
    marketChannel    = "auction",
    feedSource       = "mixed",
  } = inputs;

  // Apply client inputs with floors and fallbacks
  const MIN_OWNER_LABOUR = 1500;
  const lab = lm === "hired"
    ? r.hired
    : Math.max(MIN_OWNER_LABOUR, labourOverride !== null ? labourOverride : r.labour);
  const feedCost   = feedOverride   !== null ? feedOverride   : r.feed;
  const healthCost = healthOverride !== null ? healthOverride : r.health;

  const ck  = r.liveKg * (r.dressing / 100);
  const lpe = (r.lambing / 100) * (r.survival / 100) * 0.85;
  const fa  = (lab + r.oh) * 12;
  const revPE = lpe * ck * carcass + r.wool;
  const varPE = feedCost + healthCost + r.ewePrice * (r.rep / 100);
  const vm    = revPE - varPE;
  const be    = vm > 0 ? Math.ceil(fa / vm) : null;
  const pp    = revPE - varPE - fa / flock;
  const capital = flock * r.ewePrice + fa + varPE * flock;
  const npv5    = [-flock * r.ewePrice, ...Array(5).fill(pp * flock)]
    .reduce((a, v, i) => a + v / Math.pow(1.10, i), 0);
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
  const isWC   = r.name === "Western Cape";
  const isSale = m => isWC
    ? (m === 12 || m === 13 || m === 24 || m === 25)
    : (m === 13 || m === 14 || m === 25 || m === 26) || (r.lambing >= 140 && (m === 21 || m === 22));
  const isWool = m => r.wool > 0 && r.woolMonth && (m === r.woolMonth + 1 || m === r.woolMonth + 13);
  const mc  = (lab + r.oh) + (feedCost / 12 + healthCost / 12) * flock + r.ewePrice * (r.rep / 100) * flock / 12;
  const lrm = Math.floor(flock * lpe * 0.5) * ck * carcass;
  const wrm = r.wool * flock;
  let cum = 0;
  const cfRows = Array.from({ length: 36 }, (_, i) => {
    const m  = i + 1;
    const ev = [];
    if (m === 1)                             ev.push("Stock purchased");
    if (m === 4  || m === 16)                ev.push("Mating");
    if (m === 9  || m === 21)                ev.push("Lambing");
    if ([2, 7, 11, 14, 19, 23].includes(m)) ev.push("Dosing");
    if (m === 6  || m === 18)                ev.push("Preg scan");
    if (isWool(m))                           ev.push("Wool clip");
    if (isSale(m))                           ev.push("Lamb sales");
    const rev    = (isSale(m) ? lrm : 0) + (isWool(m) ? wrm : 0);
    const profit = rev - mc;
    cum += profit;
    return { m, mo: MONTHS[(m - 1) % 12], yr: Math.ceil(m / 12), rev, cost: mc, profit, cum, events: ev.join(", ") };
  });
  const firstPositive = cfRows.find(d => d.rev > 0);
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
    feedCost, healthCost, productionSystem, marketChannel, feedSource,
    yr1: cfRows[11]?.cum ?? 0,
    yr2: cfRows[23]?.cum ?? 0,
    yr3: cfRows[35]?.cum ?? 0,
  };
}

// ── SHEEP REPORT ──────────────────────────────────────────────────────────────
function generateSheepReport(reportData, buyerName, T) {
  const { r, flock, lm, carcass, lab, fa, revPE, varPE, vm, be, pp, capital, npv5,
          scaleRows, cfRows, firstPositive, sensRows, yr1, yr2, yr3, mc,
          feedCost, healthCost, productionSystem, marketChannel, feedSource } = reportData;
  const lmNote = lm === "owner"
    ? `owner-operated (${ZAR(lab)}/mo notional — BCEA 2024 hired benchmark ${ZAR(r.hired)}/mo for reference)`
    : `hired worker at ${ZAR(r.hired)}/mo (BCEA 2024 Sectoral Determination + UIF + SDL + housing allowance R800)`;
  const feedNote   = feedCost !== r.feed
    ? `${ZAR(feedCost)}/ewe/yr — client-specified (province benchmark: ${ZAR(r.feed)})`
    : `${ZAR(feedCost)}/ewe/yr — Land Bank extensive benchmark including salt, drought supplement, creep feed`;
  const healthNote = healthCost !== r.health
    ? `${ZAR(healthCost)}/ewe/yr — client-specified (province benchmark: ${ZAR(r.health)})`
    : `${ZAR(healthCost)}/ewe/yr — ProAgri 3-cycle dosing schedule plus foot care and annual vet`;
  const profileLine = `Production system: ${productionSystem} · Market channel: ${marketChannel} · Feed source: ${feedSource}`;
  const s20 = sensRows.find(s => s.pct === -20);
  const s10 = sensRows.find(s => s.pct === -10);
  const scaleVi = scaleRows.find(rw => rw.ok);
  const viabilityVerdict = pp > 0
    ? `VIABLE — this ${flock}-ewe ${r.breed} operation in ${r.name} is profitable at current input prices, generating ${ZAR(pp)}/ewe/year net (${PCT(pp / r.ewePrice)} ROI on stock capital).`
    : `MARGINAL — at ${flock} ewes, this operation falls below the ${be ?? "?"}-ewe breakeven. Fixed costs of ${ZAR(fa)}/yr cannot be covered by the current flock. Increasing to at least ${be ?? flock + 20} ewes is the single most critical action before committing capital.`;
  const bankRating = pp > 0 && flock >= (be ?? 0) * 1.2 ? "STRONG" : pp > 0 ? "MODERATE" : "MARGINAL";
  const ccGuide = PROV_CC[r.name] || `4–8 ha/ewe depending on rainfall zone — obtain a professional carrying-capacity assessment before stocking`;
  const breedSource = (BREED_SOURCES[r.breed] || BREED_SOURCES["_default"]).replace(/\$\{r => ZAR\(r\.wool\)\}/g, ZAR(r.wool));
  const droughtAdvice = (r.drought === "Severe, frequent" || r.drought === "Frequent")
    ? `Drought is the defining operational risk in ${r.name}. Carry a 90-day supplementary feed reserve at all times — ${ZAR(Math.round(feedCost / 12 * 3 * flock))} for your flock at current feed cost. AgriSure CP (Comprehensive Plan) coverage is mandatory — register before the production season opens. Set a trigger stocking rate reduction at 50% of normal rainfall.`
    : `Drought is a periodic risk in ${r.name}, manageable with preparation. Maintain a 60-day supplementary feed reserve (${ZAR(Math.round(feedCost / 12 * 2 * flock))} for your flock). AgriSure CP is strongly recommended. Key discipline: sell the right animals at the right time rather than holding through drought waiting for better prices.`;
  const scaleStr = scaleRows.filter((_, i) => i % 2 === 0)
    .map(rw => `${rw.n} ewes: profit/ewe ${ZAR(rw.pp)} · flock profit ${ZAR(rw.fp)} · ROI ${PCT(rw.roi)} · ${rw.ok ? (rw.roi > 0.15 ? "STRONG" : "VIABLE") : "BELOW BE"}`)
    .join("\n");
  const sensTable = sensRows.filter(s => [-20, -10, 0, 10, 20].includes(s.pct))
    .map(s => `  ${s.pct > 0 ? "+" : ""}${s.pct}% (R${s.adj.toFixed(0)}/kg): profit/ewe ${ZAR(s.pp)} · ROI ${PCT(s.roi)} · BE ${s.be || "∞"} ewes`)
    .join("\n");
  const primaryIncomeEwes = vm > 0 ? Math.round((fa + 180000) / vm) : "N/A";

  const TITLES = [
    "Executive Summary", "Regional Analysis", "Breed Analysis",
    "Financial Model & Assumptions", "36-Month Cashflow Analysis",
    "Scale & Breakeven Analysis", "Risk Analysis & Sensitivity",
    "Capital Structure & Financing", "Implementation Roadmap",
  ];

  const bodies = [
    `${viabilityVerdict}

Operation profile: ${flock} ${r.breed} ewes in ${r.name}. ${profileLine}. Labour: ${lmNote}. Carcass price basis: R${carcass}/kg A2 (AgriOrbit Apr 2025).

Key financials: Revenue ${ZAR(revPE)}/ewe/yr · Variable cost ${ZAR(varPE)}/ewe/yr · Variable margin ${ZAR(vm)}/ewe · Fixed annual ${ZAR(fa)} · Breakeven ${be ?? "N/A"} ewes · Profit/ewe ${ZAR(pp)} · Flock profit ${ZAR(pp * flock)}/yr · ROI on stock capital ${PCT(pp / r.ewePrice)} · Capital required ${ZAR(capital)} · 5-year NPV at 10% discount rate: ${ZAR(npv5)}.

Cashflow turning point: Month ${firstPositive?.m ?? 13} (${firstPositive?.mo ?? "Jan"} Year ${firstPositive?.yr ?? 2}) — first lamb cheque. The preceding 12 months require ${ZAR(Math.abs(yr1))} in working capital before revenue arrives.

Three-year trajectory: Year 1 cumulative ${ZAR(yr1)} (working capital phase). Year 2 cumulative ${ZAR(yr2)}. Year 3 cumulative ${ZAR(yr3)}. From Year 3 onwards: ${ZAR(pp * flock)}/year sustainable flock profit.

Land Bank bankability rating: ${bankRating}. ${bankRating === "STRONG" ? `This operation covers fixed costs with a ${PCT((flock - (be ?? flock)) / flock)} safety buffer above breakeven.` : bankRating === "MODERATE" ? "Viable but limited margin — a lender will require management experience and a 12-month cash reserve." : `Below the ${be}-ewe breakeven — flock expansion or cost reduction is required before applying for production finance.`}

Recommended immediate action: ${be && flock < be ? `Increase flock size to at least ${be} ewes before committing capital.` : `Proceed with the ${flock}-ewe operation, securing a revolving credit facility of ${ZAR(Math.round(Math.abs(yr1) * 1.1))} to bridge the working capital gap to Month ${firstPositive?.m ?? 13}.`}`,

    `${r.name} — ${r.climate}.

Climate and production environment: Rainfall ${r.climate.match(/\d+[–\-]\d+mm/)?.[0] ?? "variable"} · Season: ${r.season ?? "summer"} · Frost: ${r.frost} · Parasite pressure: ${r.parasites} · Drought frequency: ${r.drought}.

Carrying capacity: ${ccGuide}. This is a district average — actual capacity depends on veld type, water point distribution, and seasonal variability. A professional veld assessment (ARC-Range & Forage Institute at arc.agric.za) before stocking avoids the most common error in ${r.name} sheep farming: overstocking in a good year and being trapped when drought arrives.

Market infrastructure: ${r.market}. Distance to market is a silent margin killer — calculate exact transport cost per animal (R15–45/animal depending on distance) and deduct from your net carcass price before comparing buyer options.

${r.tip ? `Provincial insight: ${r.tip}` : ""}

What separates successful ${r.name} operations from failed ones: Water access first (sheep will not walk more than 3km to water — infrastructure drives carrying capacity), lean fixed-cost structures, and selling at the biologically optimal time. Operations that fail consistently overstock in good years and underestimate the 12-month working capital gap.

Breeds to avoid in ${r.name}: ${r.avoid.length ? r.avoid.join(", ") + " — genetic characteristics do not suit local climate." : "No specific breed avoidances — confirm with your local extension officer for your district."}`,

    `${r.breed} — ${r.type} breed — is the recommended primary breed for ${r.name}.

Why ${r.breed} suits ${r.name}: ${r.why}

Production parameters for this model:
• Lambing rate: ${r.lambing}% (${r.name} commercial average)
• Survival to weaning: ${r.survival}%
• Effective lambs sold/ewe/yr: ${((r.lambing / 100) * (r.survival / 100) * 0.85).toFixed(2)} (85% selection rate applied)
• Slaughter weight: ${r.liveKg}kg live · Dressing: ${r.dressing}% · Carcass: ${(r.liveKg * r.dressing / 100).toFixed(1)}kg
• Wool income: ${r.wool > 0 ? ZAR(r.wool) + "/ewe/yr" : "R0 — hair breed, zero shearing cost and shearing labour requirement"}

Revenue per ewe at R${carcass}/kg A2: ${ZAR(revPE)} (lamb carcass ${ZAR(Math.round(((r.lambing / 100) * (r.survival / 100) * 0.85) * (r.liveKg * r.dressing / 100) * carcass))}${r.wool > 0 ? ` + wool ${ZAR(r.wool)}` : ""}).

Where to source ${r.breed} in ${r.name}: ${breedSource}

At ${flock} ewes, a commercial flock is appropriate — no reason to maintain a stud. Use performance-tested stud rams (1:35 ratio = ${Math.ceil(flock / 35)} rams) sourced from a recording-scheme stud. Stud overhead adds cost without proportionate benefit below 500 ewes.

Health priorities for ${r.breed} in ${r.name}: ${r.parasites !== "Very low" && r.parasites !== "Low" ? `Internal parasite management is the primary ongoing cost driver. Implement FAMACHA-based dosing — this reduces anthelmintic use by 30–40% and delays resistance development. The health budget of ${ZAR(healthCost)}/ewe/yr assumes 3 strategic dosings per year. Maintain a ${ZAR(Math.round(healthCost * 0.5 * flock))} contingency for outbreak years.` : `Low parasite pressure in ${r.name} reduces health costs. Maintain prophylactic dosing at minimum 2 cycles/year and monitor for Bluetongue in summer months.`}

HIDDEN INCOME STREAM — Carbon credits + direct freezer-lamb sales:
Most sheep operations in ${r.name} leave two significant income streams untapped. First: register your veld under a voluntary carbon programme (Verra VCS or BioCarbon Fund at agricarbon.co.za for the SA verification pathway). Holistic planned grazing on 500ha of degraded veld generates R22,500–R60,000/year in verified carbon credits — pure income addition with no reduction in livestock numbers, no extra land required. Second: direct freezer-lamb sales to urban consumers at R90–110/kg deadweight vs R52/kg abattoir price add R1,500–R2,300 per animal. A WhatsApp order group in your nearest town and a licensed mobile abattoir booking (R250–R400/animal) is the entire infrastructure required. Start with 5% of your crop — price discovery is immediate.`,

    `This model applies a conservative, Land Bank-style extensive farming benchmark.

Revenue assumptions:
• Lambing rate: ${r.lambing}% — ${r.name} commercial benchmark
• Survival to weaning: ${r.survival}%
• Live weight at slaughter: ${r.liveKg}kg — market standard for ${r.breed} in ${r.name}
• Dressing percentage: ${r.dressing}% — A2 grade standard
• Carcass price: R${carcass}/kg A2 (AgriOrbit Apr 2025 — verify current price before finalising finance)
• Wool: ${r.wool > 0 ? ZAR(r.wool) + "/ewe/yr — clip weight × current Cape Wools A-grade price" : "R0 — hair breed"}

Cost assumptions:
• Feed: ${feedNote}
• Health: ${healthNote}
• Replacement: ${r.rep}% annually at ${ZAR(r.ewePrice)}/ewe = ${ZAR(Math.round(r.ewePrice * r.rep / 100))}/ewe/yr
• Overhead: ${ZAR(r.oh)}/mo — water, fuel, repairs, electricity, insurance
• Labour: ${lmNote}

The variable margin of ${ZAR(vm)}/ewe is the most important number in this model. At ${flock} ewes, fixed costs consume ${ZAR(Math.round(fa / flock))}/ewe/yr. At 200 ewes, fixed cost per ewe drops to ${ZAR(Math.round(fa / 200))}. Every ewe above breakeven drops ${ZAR(vm)} straight to profit.

Most likely wrong assumption: Carcass price. A ±R10/kg swing changes profit/ewe by ${ZAR(Math.round(((r.lambing / 100) * (r.survival / 100) * 0.85) * (r.liveKg * r.dressing / 100) * 10))} — review the sensitivity analysis in Section 7.`,

    `The cashflow story has three distinct phases.

Phase 1 — Working capital (Months 1–${(firstPositive?.m ?? 13) - 1}): Every month is cash-negative. Monthly operating cost: ${ZAR(Math.round(mc))}. At Month 12 the cumulative position is ${ZAR(yr1)} — this is the working capital investment in your first crop, not a loss.

Phase 2 — First revenue (Month ${firstPositive?.m ?? 13}, ${firstPositive?.mo ?? "January"} Year ${firstPositive?.yr ?? 2}): First lamb cheque. With ${flock} ewes at ${r.lambing}% lambing, approximately ${Math.round(flock * (r.lambing / 100) * (r.survival / 100) * 0.5)} lambs available in the first batch. At R${carcass}/kg and ${(r.liveKg * r.dressing / 100).toFixed(1)}kg carcass. Year 2 cumulative: ${ZAR(yr2)}.

Phase 3 — Normalisation (Year 3+): Annual revenue ${ZAR(Math.round(revPE * flock))}, annual costs ${ZAR(Math.round((varPE + fa / flock) * flock))}, sustainable free cash ${ZAR(Math.round(pp * flock))}/yr. Year 3 cumulative: ${ZAR(yr3)}.

${pp < 0 ? `WARNING: At ${flock} ewes, this operation never turns cumulative-positive in 36 months. Increase to at least ${be ?? flock + 20} ewes before proceeding.` : `The operation ${yr2 >= 0 ? "recovers working capital by Year 2" : "requires the full 36-month period to recover working capital — a long-term view is required"}.`}

Working capital requirement: ${ZAR(Math.round(Math.abs(yr1) * 1.15))} (Year 1 drawdown + 15% contingency).

Best bridging instrument: 12-month revolving credit facility from FNB Agri or ABSA Agri, with monthly drawdowns and repayment timed to the January/February lamb sales. Avoid fixed-term loans for working capital.`,

    `Breakeven: ${be ?? "N/A"} ewes. Variable margin ${ZAR(vm)}/ewe covers fixed costs of ${ZAR(fa)}/yr at this scale.

Scale table (at current input prices):
${scaleStr}

${scaleVi ? `First viable scale: ${scaleVi.n} ewes — flock profit ${ZAR(scaleVi.fp)}/yr, ROI ${PCT(scaleVi.roi)}.` : "No viable scale found at current input prices — review cost structure."}

Your current position: ${flock} ewes · ${flock >= (be ?? Infinity) ? `${flock - (be ?? 0)} ewes above breakeven (${PCT((flock - (be ?? 0)) / flock)} safety buffer)` : `${(be ?? flock) - flock} ewes below breakeven`}.

At what scale does this become a primary income? ${primaryIncomeEwes === "N/A" ? "Not achievable at current variable margin — review input costs." : `${primaryIncomeEwes} ewes generate approximately R180,000/year net.`}

Most important reinvestment decision in Year 3: retain the best 20% of ewe lambs instead of selling them — grows your flock by ${Math.round(flock * (r.lambing / 100) * (r.survival / 100) * 0.2)} ewes/year at zero purchase cost.`,

    `1. PRICE RISK (High probability, manageable with planning)
${sensTable}
At -20% (R${(carcass * 0.8).toFixed(0)}/kg): profit/ewe ${ZAR(s20?.pp ?? 0)} — ${(s20?.pp ?? 0) > -500 ? "survivable with a cash reserve" : "severe — emergency cost reduction required"}.
Mitigation: forward-sale relationship with your nearest abattoir (some accept 3-month forward contracts).

2. DROUGHT RISK (${r.drought} in ${r.name})
${droughtAdvice}

3. DISEASE RISK
Key threats for ${r.breed} in ${r.name}: ${r.parasites !== "Very low" ? "internal parasites (primary cost driver — " + r.parasites + " pressure)" : "low parasite pressure — maintain prevention"}, Bluetongue (notifiable, vaccine available), Rift Valley Fever (cyclical outbreak risk), foot rot (wet conditions). Health budget ${ZAR(healthCost)}/ewe/yr covers prevention — budget ${ZAR(Math.round(healthCost * 0.5 * flock))} contingency for outbreak years.

4. MARKET RISK
${r.market}. Develop at least 2 active sale relationships — never be 100% dependent on a single buyer.

5. MANAGEMENT RISK (Most underestimated)
The most common cause of sheep operation failure in ${r.name} is under-capitalisation, not drought or disease. Operations that start without sufficient working capital are forced to sell animals at the wrong biological time.

Recommended contingency reserve: ${ZAR(Math.round(fa * 0.5))} minimum (6 months fixed costs), held separately.`,

    `Total capital required: ${ZAR(capital)}.

Stock component: ${ZAR(flock * r.ewePrice)} (${flock} ewes × ${ZAR(r.ewePrice)}/ewe)
Route: Land Bank production loan, typically prime + 1.5–2.5%, 3–5 year term, quarterly repayments aligned to lamb sales. Security: notarial livestock bond, cession of fire and multi-peril insurance, personal surety. Minimum own contribution: 30% (${ZAR(Math.round(flock * r.ewePrice * 0.3))}).

Working capital: ${ZAR(Math.round(Math.abs(yr1) * 1.1))} (Year 1 + 10% buffer)
Instrument: 12-month revolving credit facility — drawdown monthly, repay in full after each sales event.

Land Bank products to investigate:
• Agri-Finance: standard production loan for stock purchase (primary instrument)
• MAFISA: relevant if you qualify as a small-scale emerging farmer — subsidised rate

FNB Agri vs Land Bank: FNB Agri is faster (4–6 weeks vs Land Bank 8–14 weeks) but requires stronger collateral. Land Bank is preferred for first-time applicants — rates typically 0.5–1.0% lower with better moratorium terms.

Optimal structure at ${ZAR(capital)}: 50/50 split (${ZAR(Math.round(capital / 2))} own equity, ${ZAR(Math.round(capital / 2))} debt). Full debt financing leaves zero contingency margin.

Honest caution: First-time applicants consistently underestimate time from application to livestock on farm — budget 3–6 months for the full lending process.`,

    `MONTHS 1–2 — Site preparation and funding:
• Install or refurbish handling facilities: crush, loading ramp, dip tank or spray race
• Confirm water supply — sheep will not walk more than 3km to water
• Fence 4 camps minimum for ${flock} ewes (7-day rotational grazing)
• Open a dedicated farm bank account
• Apply for Land Bank / FNB Agri production loan NOW (8–14 week process)
• Register with your local veterinarian

MONTH 3 — Stock procurement:
• Source ${r.breed} ewes from ${r.name} livestock auctions or registered breeders
• Price benchmark: ${ZAR(r.ewePrice)}/ewe for certified breeding-status animals
• Purchase ${Math.ceil(flock / 35)} stud rams (1:35 ratio) from a recording-scheme stud
• Quarantine all new animals 14 days before joining existing flock

MONTHS 4–8 — Mating and pregnancy:
• Flush ewes 3 weeks before ram introduction (body condition 3.0–3.5)
• Pregnancy scan 5 weeks post-mating: sort singles, twins, empties
• Adjust nutrition by class: twins need 20% higher feed from Month 5

MONTHS 9–10 — Lambing:
• Check every 3–4 hours during peak lambing
• Colostrum management: lamb must suckle within 2 hours of birth
• Tag and weigh every lamb at birth — production records from Day 1

MONTHS 13–14 — First lamb sales:
• Grade animals before booking — remove underweight animals
• Book with ${r.market.split("·")[0]?.trim() ?? "nearest abattoir"} 2–3 weeks in advance
• Compare actual lambing%, survival%, and carcass weight against model assumptions

YEAR 2 INCOME OPPORTUNITY — Carbon credits:
Contact AgriCarbon (agricarbon.co.za) for a free farm carbon assessment. Registration takes 3–6 months but income from verified holistic grazing starts from the first annual verification period. On 500ha of previously degraded veld, this adds R22,500–R60,000/yr to your existing sheep income.

FIVE ACTIONS THIS WEEK:
1. Open a dedicated farm bank account and move initial working capital into it
2. Book a site visit with your regional Land Bank agri-assessor or FNB Agri specialist
3. Contact ${r.name} livestock auction to register as a buyer and get the sale calendar
4. Get 3 quotes from local feed suppliers for bulk concentrate pricing
5. Join the SA ${r.breed} Breeders' Society — access to production data, stud directories, and auction calendars`,
  ];

  return {
    sections: TITLES.map((title, i) => ({ title, body: bodies[i] ?? "" })),
    raw: bodies.join("\n\n"),
    reportData, buyerName,
    generatedAt: new Date().toISOString(),
    isSandbox: false,
  };
}

// ── BEES REPORT ───────────────────────────────────────────────────────────────
function generateBeesReport(reportData, buyerName, T) {
  const { r, flock, lm, carcass, lab, fa, revPE, varPE, vm, be, pp, capital, npv5,
          scaleRows, cfRows, firstPositive, sensRows, yr1, yr2, yr3, mc,
          feedCost, healthCost, productionSystem, marketChannel, feedSource } = reportData;

  const harvestMo  = r.woolMonth || 4;
  const harvestName = MONTHS[(harvestMo - 1) % 12];
  const honeyRevHive = Math.round(r.liveKg * carcass);
  const waxRevHive   = r.wool;
  const grossRevHive = honeyRevHive + waxRevHive;
  const calvsPerHive = Math.round(flock * (r.lambing / 100) * (r.survival / 100) * 0.85);
  const lmNote = lm === "owner"
    ? `owner-managed (${ZAR(lab)}/mo notional — BCEA 2024 hired benchmark ${ZAR(r.hired)}/mo)`
    : `hired worker at ${ZAR(r.hired)}/mo (BCEA 2024 rate)`;
  const feedNote   = feedCost !== r.feed
    ? `${ZAR(feedCost)}/hive/yr — client-specified (province benchmark: ${ZAR(r.feed)})`
    : `${ZAR(feedCost)}/hive/yr — off-season syrup during dearth periods. Migratory placement eliminates this cost entirely.`;
  const healthNote = healthCost !== r.health
    ? `${ZAR(healthCost)}/hive/yr — client-specified (province benchmark: ${ZAR(r.health)})`
    : `${ZAR(healthCost)}/hive/yr — oxalic acid vaporisation + monitoring supplies. Switching from synthetic miticides reduces this by 60–70%.`;
  const profileLine = `Management style: ${productionSystem} · Market channel: ${marketChannel} · Feed source: ${feedSource}`;
  const s20 = sensRows.find(s => s.pct === -20);
  const s10 = sensRows.find(s => s.pct === -10);
  const scaleVi = scaleRows.find(rw => rw.ok);
  const viabilityVerdict = pp > 0
    ? `VIABLE — this ${flock}-hive apiary in ${r.name} is profitable at current honey prices, generating ${ZAR(pp)}/hive/year net (${PCT(pp / r.ewePrice)} ROI on hive capital investment).`
    : `MARGINAL — at ${flock} hives, this apiary falls below the ${be ?? "?"}-hive breakeven. Fixed costs of ${ZAR(fa)}/yr cannot be covered by the current apiary. Increasing to at least ${be ?? flock + 10} hives is the single most important action before committing capital.`;
  const bankRating = pp > 0 && flock >= (be ?? 0) * 1.2 ? "STRONG" : pp > 0 ? "MODERATE" : "MARGINAL";
  const scaleStr = scaleRows.filter((_, i) => i % 2 === 0)
    .map(rw => `${rw.n} hives: profit/hive ${ZAR(rw.pp)} · apiary profit ${ZAR(rw.fp)} · ROI ${PCT(rw.roi)} · ${rw.ok ? (rw.roi > 0.18 ? "STRONG" : "VIABLE") : "BELOW BE"}`)
    .join("\n");
  const sensTable = sensRows.filter(s => [-20, -10, 0, 10, 20].includes(s.pct))
    .map(s => `  ${s.pct > 0 ? "+" : ""}${s.pct}% (R${s.adj.toFixed(0)}/kg): profit/hive ${ZAR(s.pp)} · ROI ${PCT(s.roi)} · BE ${s.be || "∞"} hives`)
    .join("\n");
  const hasPollinationIncome = r.type && r.type.toLowerCase().includes("pollination");
  const primaryProducts = r.primary ?? [];
  const secondaryProducts = r.secondary ?? [];

  const TITLES = [
    "Executive Summary",
    "Regional Analysis",
    "Honey Products & Income Streams",
    "Financial Model & Assumptions",
    "36-Month Cashflow Analysis",
    "Scale & Breakeven Analysis",
    "Risk Analysis & Sensitivity",
    "Capital Structure & Equipment",
    "Implementation Roadmap",
  ];

  const bodies = [
    `${viabilityVerdict}

Operation profile: ${flock} hives in ${r.name}. ${profileLine}. Labour: ${lmNote}. Honey price basis: R${carcass}/kg (${r.name} bulk market — direct retail ${r.name === "Western Cape" ? "R150–200" : "R90–150"}/kg for labelled origin honey).

Revenue per hive:
• Primary honey: ${r.liveKg}kg/hive/yr × R${carcass}/kg = ${ZAR(honeyRevHive)}/hive
• Beeswax & by-products: ${ZAR(waxRevHive)}/hive/yr
• Gross revenue per hive: ${ZAR(grossRevHive)} · Variable cost: ${ZAR(varPE)}/hive · Variable margin: ${ZAR(vm)}/hive
• Fixed annual: ${ZAR(fa)} · Breakeven: ${be ?? "N/A"} hives · Profit/hive: ${ZAR(pp)} · Apiary profit: ${ZAR(pp * flock)}/yr
• ROI on hive capital: ${PCT(pp / r.ewePrice)} · Capital required: ${ZAR(capital)} · 5-year NPV (10% discount): ${ZAR(npv5)}

First harvest: Month ${harvestMo} (${harvestName}) — ${r.name}'s peak forage season. The ${harvestMo - 1} months before this require ${ZAR(Math.abs(Math.min(yr1, -fa)))} in working capital before a single rand of honey income is received.

Three-year trajectory: Year 1 cumulative ${ZAR(yr1)} (establishment phase). Year 2 cumulative ${ZAR(yr2)}. Year 3 cumulative ${ZAR(yr3)}. From Year 3: ${ZAR(pp * flock)}/year sustainable income from honey, wax, and by-products.

Bankability rating: ${bankRating}. ${bankRating === "STRONG" ? "This apiary covers its fixed costs with adequate hive-count buffer and a credible seasonal repayment schedule." : bankRating === "MODERATE" ? "Viable at current scale but limited margin for error — demonstrate 2 seasons of production records before seeking formal lending." : `Below the ${be}-hive breakeven — scale is required before the operation can service any external debt reliably.`}

Recommended immediate action: ${be && flock < be ? `Scale to at least ${be} hives before committing capital — at ${flock} hives the apiary cannot cover its fixed costs.` : `Proceed with the ${flock}-hive operation. Establish a working capital buffer of ${ZAR(Math.round(Math.abs(yr1 ?? fa) * 1.1))} to bridge the gap to the ${harvestName} harvest.`}`,

    `${r.name} — ${r.climate}.

Beekeeping environment: Rainfall ${r.rainfall} · Season: ${r.season} · Frost: ${r.frost} · Humidity: ${r.humidity} · Varroa pressure: ${r.parasites} · Drought frequency: ${r.drought} · Commercial apiary density: ${r.hiveDensity}.

Forage calendar: ${r.name}'s primary forage window produces ${r.breed} as the dominant honey type. ${r.why}

Water access is critical — bees will not forage effectively more than 3km from a reliable water source. Every apiary site must have a shallow trough, wick-drinker, or dripper system within 100m. Bees foraging for water rather than nectar reduces productivity by 15–25% and increases absconding risk dramatically. Install water on Day 1, before hives arrive.

Market infrastructure: ${r.market}. ${hasPollinationIncome ? `Pollination income opportunity: ${r.type} is available in this province at R700–R1,200/hive/visit. A single pollination placement on orchard crops earns more in 1 week than 3 months on natural veld.` : ""}

${r.tip ? `Provincial insight: ${r.tip}` : ""}

Placement to avoid in ${r.name}:${r.avoid.length ? "\n" + r.avoid.map(a => `• ${a}`).join("\n") : " No specific placement exclusions for this province."}

What separates successful ${r.name} beekeeping operations from failed ones: Water access and forage proximity are non-negotiable. Successful operations perform regular Varroa monitoring (sugar roll or alcohol wash every 4–6 weeks during build-up season) and treat before mite loads exceed 2 per 100 bees. Failed operations treat reactively, after colony strength is already compromised. Absconsion in ${r.name} is ${r.drought === "High" || r.drought === "Frequent" ? "a significant risk — maintain water and shade at all apiary sites year-round" : "manageable with stable site conditions and regular inspections"}.`,

    `${r.breed} is the primary honey variety produced in ${r.name} — determined by the dominant flowering plants within 3km of your apiary sites.

Primary products (${primaryProducts.join(", ")}):
${r.breed} commands ${r.name === "Western Cape" ? "R120–200/kg" : r.name === "Mpumalanga" ? "R90–140/kg" : r.name === "Eastern Cape" ? "R80–100/kg (Karoo origin premium)" : "R80–130/kg"} for labelled direct-retail vs R45–65/kg bulk supply. The margin difference is purely packaging (500g glass jars, R3–6 each) and a clear floral origin label. This single change captures ${ZAR(Math.round(r.liveKg * 40 * flock))}/yr in additional revenue on your existing honey yield at the same production cost.

Secondary products (${secondaryProducts.join(", ")}):
• Beeswax: ${ZAR(waxRevHive)}/hive/yr at current wax prices (R80–R150/kg at craft and cosmetics market). Upgrade from raw to filtered pressed cakes or cosmetic-grade and the price jumps to R200–R350/kg.
• Pollen: R150–R250/100g to health food market. Requires a pollen trap fitted to active hives — cost R80/trap, labour 30min/hive/month.
• Propolis: R200–R450/100g cleaned and dried. Highly regarded in natural health channels. Requires a propolis screen — cost R120/screen.${hasPollinationIncome ? "\n• Pollination services: R700–R1,200/hive/visit for commercial orchards. This is the highest-margin product in apiculture by time invested. Contact citrus, avocado, macadamia, or deciduous fruit growers in your region for placement contracts." : ""}

Floral origin certification for premium pricing:
Register your apiary site with the SA Honey Producers Organisation (sahpo.co.za). Verified origin certification (Fynbos, Karoo, Citrus, Bushveld) unlocks premium buyers — Cape Honey, Faithful to Nature, and export channels — at prices R30–80/kg above uncertified product. Western Cape Fynbos certified honey has EU export clearance. Certification cost: R500–R1,500/year.

HIDDEN INCOME STREAM 1 — Nucleus colony (nuc) sales:
This is the highest-margin product most SA beekeepers never discover. A strong colony preparing swarm cells in spring (September–November in most provinces) can be split: the queen and 4–5 frames go into a new box as a nucleus colony. Sold to a new or expanding beekeeper for R800–R1,500 per nuc. A 20-hive apiary produces 6–8 nucs per spring without reducing honey yield — the colony rebuilds queen-right within 4 weeks. Annual income: R5,000–R12,000 with zero extra land, zero extra equipment beyond spare boxes. Demand from new beekeepers consistently exceeds supply in every province. Contact the SA Beekeepers' Association (sabees.co.za) to list your nucs — they sell within days during spring.

HIDDEN INCOME STREAM 2 — Queen rearing:
A proven, prolific queen sells for R250–R450 to beekeepers managing laying failures, combining operations, or starting new hives. Using the Nicot cup kit method (R400 equipment investment), a 30-hive apiary can rear 10–15 queens per month during build-up season with 2 hours' work per batch. At R350/queen × 10/month × 6 active months = R21,000/yr. Scale to 25 queens/month on a 50-hive apiary = R52,500/yr. This is the highest-return-per-hour activity in commercial beekeeping.

Where to source hive stock in ${r.name}: Source established nucleus colonies (4–5 frames + queen) from disease-tested beekeepers — avoid purchasing unknown swarms which may carry American Foulbrood. Price: R${r.ewePrice.toLocaleString("en-ZA")}/nuc (established, disease-free). Contact the ${r.name} Beekeepers' Association or SA Beekeepers' Association (sabees.co.za) for a verified supplier list.

SUBSPECIES NOTE — ${r.subspecies === "capensis" ? "CAPE HONEY BEE (Apis mellifera capensis)" : r.subspecies === "hybrid_zone" ? "HYBRID ZONE (capensis × scutellata)" : "AFRICAN HONEY BEE (Apis mellifera scutellata)"}:
${r.subspecies === "capensis"
  ? `The Western Cape operates exclusively with Apis mellifera capensis, the Cape honey bee. Capensis is genetically distinct from all other SA subspecies: workers can lay fertilised diploid eggs via thelytoky, allowing colony recovery without a mated queen. This trait produces exceptional colony resilience on fynbos forage. Capensis colonies are noticeably gentler than scutellata — an important practical advantage for high-density apiary management in the Overberg and Swartland.\n\nCRITICAL BIOSECURITY WARNING: Capensis workers transported into scutellata-dominant provinces become "social parasites" — they infiltrate host colonies, reproduce at the expense of the host queen, and can collapse the entire apiary within weeks. NEVER transport capensis bees north of the hybrid zone boundary (roughly the Gamtoos River valley). This is not a management preference — it is a national apicultural biosecurity rule. Violation risks prosecution under the Agricultural Pests Act and destruction of neighbouring operations.`
  : r.subspecies === "hybrid_zone"
  ? `The Eastern Cape sits at the natural contact zone between capensis (south/west) and scutellata (north/inland). Colony behaviour varies significantly by location: coastal and southern Eastern Cape operations experience near-capensis behaviour (gentler, higher honey yield); northern and inland operations trend toward scutellata characteristics (more defensive, higher absconding rate under stress). Source local bees wherever possible — importing from outside the hybrid zone introduces unpredictable genetics.\n\nBiosecurity note: The capensis social parasitism risk is real in this zone. Avoid importing capensis nucleus colonies from the Western Cape into apiaries north of the Tsitsikamma mountains. Consult the Eastern Cape Beekeepers' Association for current regional mapping of colony behaviour zones.`
  : `${r.name} operates with Apis mellifera scutellata, the African honey bee — the commercial standard across seven of SA's nine provinces. Scutellata is highly productive in African conditions: it forages earlier in the morning, in lower temperatures, and across a larger flight radius than European subspecies. It demonstrates measurable Varroa hygienic behaviour, outperforming European breeds in mite resistance without chemical intervention. The defensive reputation is manageable: full protective equipment (8-frame veil minimum), smooth hive movements, and smoke-before-opening discipline are non-negotiable, not optional.\n\nScutellata absconding is the primary colony-loss risk in ${r.name}. Triggers: water shortage, forage dearth, excessive heat at hive entrance, or rough handling during inspection. Mitigation: shade cloth over hives from October to March, dedicated water within 100m, and a minimum 2-week acclimatisation period for newly placed apiaries at any new site.`}`,

    `This model applies a conservative commercial apiary benchmark for ${r.name}.

Revenue assumptions:
• Honey yield: ${r.liveKg}kg/hive/yr — ${r.name} commercial average. Well-managed intensive operations in peak forage areas exceed this. Poor forage years, Varroa pressure, or late season splits reduce yield.
• Honey price: R${carcass}/kg — ${r.name} bulk market benchmark. Direct retail (labelled origin honey) achieves R${Math.round(carcass * 1.8)}–R${Math.round(carcass * 2.5)}/kg — the single largest margin lever available.
• Beeswax/by-product income: ${ZAR(waxRevHive)}/hive/yr — conservative. Refined cosmetic-grade beeswax adds R50–R120/hive/yr.

Cost assumptions:
• Supplemental feeding (syrup): ${feedNote}
• Varroa & hive health: ${healthNote}
• Hive replacement: ${r.rep}% annually at ${ZAR(r.ewePrice)}/hive = ${ZAR(Math.round(r.ewePrice * r.rep / 100))}/hive/yr — covers colony losses, equipment replacement, and splits that don't return to honey production
• Overhead: ${ZAR(r.oh)}/mo — transport, vehicle wear (hive inspections), packaging, utilities
• Labour: ${lmNote}

The variable margin of ${ZAR(vm)}/hive is the key number. At ${flock} hives, fixed costs consume ${ZAR(Math.round(fa / flock))}/hive/yr. At 100 hives, fixed cost per hive drops to ${ZAR(Math.round(fa / 100))}. Scale dilutes fixed cost dramatically in beekeeping — the difference between 20 and 100 hives is often the difference between marginal and excellent returns.

Most likely wrong assumption: Honey price. At R${carcass}/kg bulk, you capture the lowest possible margin. Moving 30% of your crop to direct retail at R120/kg adds ${ZAR(Math.round(r.liveKg * 0.3 * 60 * flock))}/yr to apiary revenue at zero extra production cost.`,

    `The cashflow story for a ${r.name} apiary has three phases.

Phase 1 — Establishment (Months 1–${harvestMo - 1}): Hives are building up — feed costs, health treatment, inspections, and equipment maintenance. No honey income. Monthly operating cost: ${ZAR(Math.round(mc))}. This phase is shorter than livestock farming: bees are producing within ${harvestMo} months of establishment, not 13. At Month ${harvestMo - 1} the cumulative position is approximately ${ZAR(yr1)} — a fraction of the working capital required for equivalent livestock operations.

Phase 2 — First harvest (Month ${harvestMo}, ${harvestName} Year 1): The first honey extraction. With ${flock} hives averaging ${r.liveKg}kg each, the first harvest is approximately ${Math.round(flock * r.liveKg * 0.5)} kg (50% of annual yield — the balance harvested in the second flush). Packaged at R${carcass}/kg, this is a significant single cash event. Year 2 cumulative: ${ZAR(yr2)}.

Phase 3 — Normal production (Year 2+): ${flock} hives at ${r.liveKg}kg/hive = ${Math.round(flock * r.liveKg)} kg honey/yr. Annual revenue ${ZAR(Math.round(revPE * flock))}, annual costs ${ZAR(Math.round((varPE + fa / flock) * flock))}. Year 3 cumulative: ${ZAR(yr3)}.

${pp < 0 ? `WARNING: At ${flock} hives, this apiary never achieves a cumulative-positive position in 36 months. Increase to at least ${be ?? flock + 10} hives before proceeding.` : `The apiary ${yr2 >= 0 ? "recovers all working capital by Year 2" : "requires the full 36-month period to recover working capital"}.`}

Working capital requirement: ${ZAR(Math.round(Math.abs(Math.min(yr1, -fa)) * 1.15))} — significantly lower than cattle or sheep operations of equivalent revenue, making beekeeping accessible to self-funded entry.

Revenue concentration: Like all seasonal farming, honey income arrives in 1–2 events per year. Budget monthly expenses from a revolving savings buffer between harvests. Many commercial beekeepers supplement cash flow with nuc and queen sales during the off-honey season — this is the primary mechanism for maintaining year-round positive cash flow.`,

    `Breakeven: ${be ?? "N/A"} hives. The variable margin of ${ZAR(vm)}/hive covers fixed costs of ${ZAR(fa)}/yr exactly at this scale.

Scale table (at current honey price of R${carcass}/kg):
${scaleStr}

${scaleVi ? `First viable scale: ${scaleVi.n} hives — apiary profit ${ZAR(scaleVi.fp)}/yr, ROI ${PCT(scaleVi.roi)}.` : "No viable scale at current honey price — increase direct-retail proportion before scaling."}

Operational thresholds in SA commercial beekeeping:
• 1–20 hives: hobby/lifestyle scale — rarely covers full equipment and time costs
• 20–50 hives: semi-commercial, manageable part-time — covers costs with modest margin
• 50–150 hives: commercial scale, typically owner full-time — extraction equipment investment justified
• 150+ hives: requires dedicated extraction facility and seasonal labour
• 300+ hives: migratory commercial scale — pollination contracts become viable and significantly improve annual revenue

Your current position: ${flock} hives · ${flock >= (be ?? Infinity) ? `${flock - (be ?? 0)} hives above breakeven` : `${(be ?? flock) - flock} hives below breakeven`}.

Critical point: unlike livestock, hive count can be grown rapidly through your own splits at near-zero cost. A ${flock}-hive apiary producing 6 nucs per spring doubles to ${flock * 2} hives in ${Math.ceil(Math.log2(Math.max((be ?? flock + 10) / flock, 1.01))) || 1} split-seasons without purchasing additional stock.`,

    `1. VARROA MITE RISK (High — primary ongoing threat in ${r.name})
Varroa destructor is present throughout SA. Pressure: ${r.parasites}. Uncontrolled Varroa collapses colonies within 18–24 months.
Protocol: Sugar roll or alcohol wash every 4–6 weeks during active season — treat when mite load exceeds 2 per 100 bees. Oxalic acid vaporisation (R0.80–R1.20/treatment) is the gold-standard organic treatment: effective during broodless periods (winter) and through brood cycles with repeated application. Avoid relying solely on synthetic miticides — resistance is developing rapidly in SA populations.

2. AMERICAN FOULBROOD RISK (Low frequency, catastrophic consequence)
AFB (Paenibacillus larvae) is a notifiable disease — confirmed infection requires total hive and comb destruction by fire. There is no treatment. Insurance: register your hives with your provincial Department of Agriculture (required by law in most provinces) and maintain a Hive Registration certificate. Inspect for AFB signs at every opening: discoloured, sunken, or perforated cappings; foul smell; "ropiness" when a matchstick is inserted into a discoloured cell. Early detection saves the apiary; late detection costs everything.

3. PESTICIDE EXPOSURE RISK (${r.name === "Mpumalanga" || r.name === "Western Cape" ? "High — significant agricultural activity" : "Medium — manageable with site selection"})
Neonicotinoids and organophosphates applied during flowering cause acute colony loss and chronic sub-lethal effects. Monitor all apiary sites for agricultural spray activity. Establish relationships with neighbouring farmers — request spray schedule notification. Do not place hives near crops being treated during flowering. Move hives before spray season if necessary. Losses from one spray event can exceed R${Math.round(r.ewePrice * flock * 0.3 / 1000)}k — the cost of good site intelligence is zero.

4. DROUGHT AND FORAGE GAP RISK (${r.drought} in ${r.name})
${r.drought === "High" || r.drought === "Frequent" || r.drought === "Very frequent" ? `Drought is a serious risk for beekeeping in ${r.name}. During dearth periods, colonies rapidly consume stores — starvation can occur within 2 weeks of forage failure. Maintain supplemental feeding readiness: sugar syrup at 1:1 (spring) or 2:1 (autumn). Migratory beekeeping is standard practice in ${r.name} — plan seasonal moves to ensure year-round forage availability. Budget ${ZAR(feedCost * flock)} in supplemental syrup for drought contingency.` : `Drought management in ${r.name} is important but manageable. Monitor hive weight or food stores monthly during the dry season. Maintain supplemental syrup stock as insurance — ${ZAR(feedCost * flock)} covers one season's supplemental feeding for your apiary.`}

5. COLONY ABSCONDING RISK
African honeybees (Apis mellifera scutellata) have a natural tendency to abscond under stress — drought, pesticide residue, overcrowding, or sustained disturbance. Mitigation: maintain consistent water supply, avoid excessive opening during heat, ensure adequate space (add supers before bees are overcrowded), and replace queen stock that shows absconding behaviour.

6. HONEY PRICE SENSITIVITY
${sensTable}
The risk is less price decline and more channel dependency — bulk supply at R${carcass}/kg makes you entirely dependent on packer/co-op margins. A 30% shift to direct retail at R${Math.round(carcass * 1.8)}/kg adds ${ZAR(Math.round(r.liveKg * 0.3 * (carcass * 0.8) * flock))}/yr with no production change and zero risk of market collapse.`,

    `Total capital required: ${ZAR(capital)}.

Equipment per hive (new Langstroth standard):
• Brood box + frames + foundation: R400–R600
• 2 × honey supers + frames: R600–R900
• Queen excluder: R80–R120
• Hive stand + entrance reducer: R80–R120
• Total equipment per hive: R1,160–R1,740

Starting stock (per hive): ${ZAR(r.ewePrice)} for an established nucleus colony (4 frames, laying queen, bees, some stores) from a disease-tested source. Never purchase untested swarms.

Personal protective equipment (once-off):
• Full ventilated bee suit: R600–R900
• Gloves (2 pairs): R200
• Smoker: R350–R500
• Hive tool + uncapping fork: R150
• Total PPE: R1,300–R1,750

Extraction equipment (shared or hired initially):
• Manual radial extractor (4-frame): R3,500–R5,000
• Uncapping tank: R800–R1,200
• Storage tank (80L): R1,200–R1,800
• Honey strainer + buckets: R500
At startup, hire extraction equipment from a local beekeepers' association (R300–R500/session) rather than purchasing. Buy only once your annual yield justifies the capital.

Processing room: at ${flock} hives producing ${Math.round(flock * r.liveKg)}kg/year, a basic food-safe processing room is required (white walls, washable floor, fly screening). Budget R5,000–R15,000 for a converted outbuilding.

Funding options:
• Self-funded: preferred at startup scale — beekeeping capital requirements are low relative to livestock
• SEDA (Small Enterprise Development Agency — seda.org.za): non-repayable grants and equipment loans for emerging agri-enterprises. Applies to beekeeping operations under R1m turnover
• DAFF Comprehensive Agricultural Support Programme (CASP): equipment grants for qualifying small-scale producers
• Land Bank: typically not suited to apiaries at this scale — approach FNB Agri or ABSA Agri for working capital only if apiary exceeds 100 hives`,

    `MONTHS 1–2 — Site preparation and equipment:
• Select and prepare apiary sites: clear landing area, install hive stands (min 40cm off ground), install water source within 100m
• Order equipment: hive boxes, frames, supers, PPE — allow 3–4 weeks lead time from reputable suppliers
• Complete a beekeeping foundation course (SABIO or SA Beekeepers' Association — sabees.co.za). A single-day practical course saves many costly beginner errors
• Register your hives with your provincial Department of Agriculture (legally required in most provinces — cost R0 to R200)
• Contact your nearest beekeepers' association — access to mentors, local disease alerts, and a ready market for your nucs and honey

MONTH 3 — Hive establishment:
• Purchase ${flock} nucleus colonies (4–5 frames, laying queen, bees, and stores) at ${ZAR(r.ewePrice)}/nuc from a disease-tested source
• Install nucs in early morning or evening — minimal disturbance
• Feed 1:1 sugar syrup for 3–4 weeks to encourage comb drawing
• First inspection after 7 days: confirm laying queen, healthy brood pattern, no disease signs

MONTHS 4 TO ${harvestMo - 1} — Apiary management:
• Inspect every 10–14 days during active season
• Add supers once brood box is 80% full — prevent swarming
• Perform Varroa sugar roll monthly; treat if count exceeds 2 per 100 bees (oxalic acid)
• Establish relationships with neighbouring farmers for spray schedule notification

MONTH ${harvestMo} (${harvestName}) — First harvest:
• Extract once honey cells are 80%+ capped (moisture content below 20% — prevents fermentation)
• Filter through double strainer, fill 500g glass jars, label with floral origin
• Contact direct retail buyers: farmers markets, local delis, online stores
• Compare yield per hive against model (${r.liveKg}kg target) — identify top and bottom performers

YEAR 2 — Hive growth through splitting:
• Target: increase apiary size by 6–8 hives through spring splits from your strongest colonies
• This eliminates hive purchase cost for expansion
• All splits are potential nuc sales if apiary is already at target size

YEAR 2–3 INCOME OPPORTUNITY — Nucleus colony sales + queen rearing:
• Spring (September–November): identify the 5–8 strongest colonies as split candidates
• Perform walk-away split or Demaree split — both produce a saleable nuc within 4–6 weeks
• List nucs on SA Beekeepers' Association marketplace and local farming WhatsApp groups — R800–R1,500 each, reliably sold in advance
• Year 3: invest in a Nicot queen-rearing kit (R400) — rear 10–15 queens per batch, sell for R300–R450 each to the network of beekeepers you've met

FIVE ACTIONS THIS WEEK:
1. Contact the SA Beekeepers' Association (sabees.co.za) — register and request a verified local supplier list for disease-tested nucs
2. Book a foundation beekeeping course — SABIO or your provincial beekeeping association
3. Order your full PPE set now — 3–4 week lead time
4. Select your first 2 apiary sites: confirm water access, shade, sun orientation (south-facing hive entrance), and landowner permission if not on your own property
5. Register with your provincial Department of Agriculture — free hive registration, and you receive disease alerts for your district`,
  ];

  return {
    sections: TITLES.map((title, i) => ({ title, body: bodies[i] ?? "" })),
    raw: bodies.join("\n\n"),
    reportData, buyerName,
    generatedAt: new Date().toISOString(),
    isSandbox: false,
  };
}

// ── CATTLE REPORT ─────────────────────────────────────────────────────────────
function generateCattleReport(reportData, buyerName, T) {
  const { r, flock, lm, carcass, lab, fa, revPE, varPE, vm, be, pp, capital, npv5,
          scaleRows, cfRows, firstPositive, sensRows, yr1, yr2, yr3, mc,
          feedCost, healthCost, productionSystem, marketChannel, feedSource } = reportData;

  const calvesPerYear = Math.round(flock * (r.lambing / 100) * (r.survival / 100) * 0.85);
  const carcassKg     = Math.round(r.liveKg * r.dressing / 100);
  const revPerAnimal  = Math.round(carcassKg * carcass);
  const lmNote = lm === "owner"
    ? `owner-operated (${ZAR(lab)}/mo notional — BCEA 2024 hired benchmark ${ZAR(r.hired)}/mo)`
    : `hired manager at ${ZAR(r.hired)}/mo (BCEA 2024 Farm Worker Sectoral Determination)`;
  const feedNote   = feedCost !== r.feed
    ? `${ZAR(feedCost)}/cow/yr — client-specified (province benchmark: ${ZAR(r.feed)})`
    : `${ZAR(feedCost)}/cow/yr — Land Bank extensive benchmark including salt licks, drought supplement, and creep feed for calves. Actual costs in drought years can reach ${ZAR(Math.round(feedCost * 2))}/cow.`;
  const healthNote = healthCost !== r.health
    ? `${ZAR(healthCost)}/cow/yr — client-specified (province benchmark: ${ZAR(r.health)})`
    : `${ZAR(healthCost)}/cow/yr — covers tick control, dipping/pour-on, annual vaccinations, pregnancy diagnosis, and emergency vet allowance. High-tick-pressure environments regularly reach ${ZAR(Math.round(healthCost * 1.4))}.`;
  const profileLine = `Production system: ${productionSystem} · Market channel: ${marketChannel} · Feed source: ${feedSource}`;
  const s20 = sensRows.find(s => s.pct === -20);
  const s10 = sensRows.find(s => s.pct === -10);
  const scaleVi = scaleRows.find(rw => rw.ok);
  const viabilityVerdict = pp > 0
    ? `VIABLE — this ${flock}-cow ${r.breed} operation in ${r.name} is profitable at current input prices, generating ${ZAR(pp)}/cow/year net (${PCT(pp / r.ewePrice)} ROI on cow capital).`
    : `MARGINAL — at ${flock} cows, this herd falls below the ${be ?? "?"}-cow breakeven. Fixed costs of ${ZAR(fa)}/yr cannot be covered at this scale. Increasing to at least ${be ?? flock + 10} cows is the single most critical action before committing capital.`;
  const bankRating = pp > 0 && flock >= (be ?? 0) * 1.2 ? "STRONG" : pp > 0 ? "MODERATE" : "MARGINAL";
  const ccGuide = CATTLE_CC[r.name] || `4–8 ha/LSU depending on veld type — obtain a professional carrying-capacity assessment before stocking`;
  const breedSource = (CATTLE_BREED_SOURCES[r.breed] || CATTLE_BREED_SOURCES["_default"]);
  const droughtAdvice = (r.drought === "Severe, frequent" || r.drought === "Frequent" || r.drought === "Very frequent")
    ? `Drought is the defining operational risk in ${r.name}. Carry a 90-day emergency feed reserve at all times — ${ZAR(Math.round(feedCost / 12 * 3 * flock))} for your herd at current feed cost. Set a clear destocking trigger at 50% of normal rainfall: selling cattle at 70c in the rand during drought is far cheaper than feeding them at full cost until they die. AgriSure CP (Comprehensive Plan) coverage is mandatory — register before the season opens. Drought camps (kept completely rested until emergency) add carrying capacity resilience at near-zero cost.`
    : `Drought management is important but less acute in ${r.name}. Maintain a 60-day feed reserve (${ZAR(Math.round(feedCost / 12 * 2 * flock))} for your herd). AgriSure CP is recommended. Key discipline: move cattle off depleted camps before overgrazing damages veld — recovery from overgrazing takes 3–5 years.`;
  const scaleStr = scaleRows.filter((_, i) => i % 2 === 0)
    .map(rw => `${rw.n} cows: profit/cow ${ZAR(rw.pp)} · herd profit ${ZAR(rw.fp)} · ROI ${PCT(rw.roi)} · ${rw.ok ? (rw.roi > 0.12 ? "STRONG" : "VIABLE") : "BELOW BE"}`)
    .join("\n");
  const sensTable = sensRows.filter(s => [-20, -10, 0, 10, 20].includes(s.pct))
    .map(s => `  ${s.pct > 0 ? "+" : ""}${s.pct}% (R${s.adj.toFixed(0)}/kg): profit/cow ${ZAR(s.pp)} · ROI ${PCT(s.roi)} · BE ${s.be || "∞"} cows`)
    .join("\n");
  const primaryIncomeScale = vm > 0 ? Math.round((fa + 300000) / vm) : "N/A";

  const TITLES = [
    "Executive Summary",
    "Regional Analysis",
    "Breed & Performance Analysis",
    "Financial Model & Assumptions",
    "36-Month Cashflow Analysis",
    "Scale & Breakeven Analysis",
    "Risk Analysis & Sensitivity",
    "Capital Structure & Financing",
    "Implementation Roadmap",
  ];

  const bodies = [
    `${viabilityVerdict}

Operation profile: ${flock} ${r.breed} cows in ${r.name}. ${profileLine}. Labour: ${lmNote}. Carcass price basis: R${carcass}/kg A2 dressed beef (AgriOrbit Apr 2025 benchmark).

Production economics:
• Calving rate: ${r.lambing}% · Weaning survival: ${r.survival}% · Calves marketed per 100 cows: ${Math.round(r.lambing * r.survival * 0.85 / 100)}
• Live weight: ${r.liveKg}kg · Dressing: ${r.dressing}% · Carcass: ${carcassKg}kg · Revenue/animal: ${ZAR(revPerAnimal)}
• Revenue/cow/yr: ${ZAR(revPE)} · Variable cost/cow: ${ZAR(varPE)} · Variable margin/cow: ${ZAR(vm)}
• Fixed annual: ${ZAR(fa)} · Breakeven: ${be ?? "N/A"} cows · Profit/cow: ${ZAR(pp)} · Herd profit: ${ZAR(pp * flock)}/yr
• ROI on cow capital: ${PCT(pp / r.ewePrice)} · Capital required: ${ZAR(capital)} · 5-year NPV (10% discount): ${ZAR(npv5)}

First revenue: Month ${firstPositive?.m ?? 13} (${firstPositive?.mo ?? "Jan"} Year ${firstPositive?.yr ?? 2}) — first calves reach slaughter/weaner weight. The preceding 12 months require ${ZAR(Math.abs(yr1))} in working capital before a single rand of cattle income is received.

Three-year trajectory: Year 1 cumulative ${ZAR(yr1)} (entirely negative — working capital phase). Year 2 cumulative ${ZAR(yr2)}. Year 3 cumulative ${ZAR(yr3)}. From Year 3: ${ZAR(pp * flock)}/year sustainable herd profit.

Land Bank bankability rating: ${bankRating}. ${bankRating === "STRONG" ? `This operation covers its fixed costs with a ${PCT((flock - (be ?? flock)) / flock)} herd-size buffer above breakeven and presents a credible repayment schedule aligned to calf sales.` : bankRating === "MODERATE" ? "Viable at current scale but limited margin — a lender will require management experience and a 12-month cash reserve." : `Below the ${be}-cow breakeven — scale up or reduce costs before approaching a lender for production finance.`}

Recommended immediate action: ${be && flock < be ? `Increase herd to at least ${be} cows before committing capital — at ${flock} cows the operation cannot cover fixed costs.` : `Proceed with the ${flock}-cow operation, securing a revolving credit facility of ${ZAR(Math.round(Math.abs(yr1) * 1.1))} to bridge the working capital gap to Month ${firstPositive?.m ?? 13}.`}`,

    `${r.name} — ${r.climate}.

Production environment: Rainfall ${r.rainfall} · Season: ${r.season} · Frost: ${r.frost} · Humidity: ${r.humidity} · Tick pressure: ${r.parasites} · Drought frequency: ${r.drought} · Commercial cattle density: ${r.cattleDensity}.

Carrying capacity: ${ccGuide}. This is a district average — actual capacity depends on veld type, water infrastructure, and seasonal variability. A professional veld assessment (ARC-Animal Production Institute at arc.agric.za) before stocking prevents the most common error in ${r.name} cattle farming: overstocking in a good rainfall year and facing devastating losses when drought arrives.

Market infrastructure: ${r.market}. Weaner calves at 7–8 months sold live to feedlots at R22–28/kg live weight are the primary revenue mechanism for most ${r.name} commercial operations. Abattoir supply (slaughter at 18–24 months) achieves R${carcass}/kg dressed but requires a longer production cycle and higher feed investment.

${r.tip ? `Provincial insight: ${r.tip}` : ""}

Tick-borne disease management is the primary ongoing cost driver in ${r.name} (tick pressure: ${r.parasites}). The three critical tick-borne diseases in SA cattle are: Gallsickness (Anaplasmosis — acute, often fatal within 24 hours of clinical signs), Redwater (Babesiosis — fever, red urine, rapid decline), and Heartwater (Ehrlichiosis — neurological, high mortality). Preventive tick control via dipping or pour-on is cheaper than treatment; treatment is cheaper than mortality. Establish a tick-control protocol with your local veterinarian before animals arrive.

What separates successful ${r.name} cattle operations from failed ones: Water infrastructure drives everything — cattle will not walk more than 5km to water, and condition loss from daily water walks destroys calf weaning weights. Consistent, documented tick control prevents the emergency vet costs that wreck annual margins. Successful operations also sell weaners at the right biological time rather than holding them to gain weight that costs more in feed than it adds in market price.

Breeds to avoid in ${r.name}: ${r.avoid.length ? r.avoid.join(", ") + " — inadequate tick resistance and heat adaptation for these conditions." : "No specific breed exclusions — all commercial breeds are viable with appropriate management in this province."}`,

    `${r.breed} — ${r.type} — is the recommended primary breed for ${r.name}.

Why ${r.breed} suits ${r.name}: ${r.why}

Production parameters for this model:
• Calving rate: ${r.lambing}% — ${r.name} commercial benchmark (well-managed operations exceed this by 10–15%)
• Weaning survival: ${r.survival}% — accounts for normal calf mortality and culls
• Calves marketed per cow per year: ${((r.lambing / 100) * (r.survival / 100) * 0.85).toFixed(2)}
• Live weight at sale/slaughter: ${r.liveKg}kg · Dressing: ${r.dressing}% · Carcass: ${carcassKg}kg
• Secondary income: ${r.wool > 0 ? ZAR(r.wool) + "/cow/yr (hide or by-product)" : "R0 — no secondary product income modelled"}
• Revenue per cow at R${carcass}/kg A2: ${ZAR(revPE)}

${r.breed} genetic priorities for ${r.name}: Tick tolerance (measured by Tick Resistance Score in modern EBVs), heat adaptation (critical above 35°C — European breeds lose appetite and condition), and maternal fertility (calving interval below 370 days). Bull selection drives improvement across your entire cow herd — one excellent bull improves ${Math.ceil(flock / 28)} × 5-year calf crops = ${Math.ceil(flock / 28) * 5} additional calves at zero extra cost.

Where to source ${r.breed} in ${r.name}: ${breedSource}

At ${flock} cows, manage as a straight commercial herd — no reason to maintain a stud at this scale. Use production-tested bulls (1:25–30 cow ratio = ${Math.ceil(flock / 28)} bulls for your herd) sourced from a recording-scheme stud. Leasing bulls rather than purchasing is viable if capital is constrained: a proven commercial bull is available for lease at R2,500–R4,500/month during mating season from stud operations in ${r.name}.

HIDDEN INCOME STREAM 1 — Bull leasing:
Once your primary bull has two full seasons of weaner weights recorded, you have a valuable asset that sits idle for 10 months of the year. Lease him to neighbouring operations at R3,000–R5,000/month during mating season (6–8 weeks = R4,500–R10,000/year). The bull continues his full mating role on your own herd outside the lease period. Register bull performance with the ${r.breed === "Bonsmara" ? "Bonsmara SA Breeders' Society (bonsmara.co.za)" : r.breed === "Nguni" ? "Nguni Cattle Breeders' Society (nguni.co.za)" : r.breed === "Angus" ? "Angus SA (angus.co.za)" : "relevant SA breed society"} — this is the prerequisite for leasing at premium rates. A documented weaning weight index is the single most important factor in bull lease pricing.

HIDDEN INCOME STREAM 2 — Carbon credits via holistic planned grazing:
Most South African cattle farmers on natural veld are sitting on an untapped income stream. Holistic planned grazing (multi-camp rotational system that mimics natural herd movement) builds soil organic carbon. Register your farm under the Verra VCS (Verified Carbon Standard) or BioCarbon Fund voluntary programme. On 500ha of previously degraded veld, well-managed holistic grazing sequesters 0.3–1.2 tonnes CO₂/ha/year. At current voluntary carbon market prices of R150–400/tonne: 500ha = R22,500–R240,000/year in verified carbon income — stacked directly on top of your existing cattle production with no reduction in livestock numbers. Contact AgriCarbon (agricarbon.co.za) for the South African verification pathway and a free farm assessment.`,

    `This model applies a conservative commercial beef benchmark for ${r.name}.

Revenue assumptions:
• Calving rate: ${r.lambing}% — ${r.name} commercial average. Well-managed operations with flush feeding and pregnancy testing achieve 82–88%. Do not use a higher assumption until you have 2 seasons of measured data.
• Weaning survival: ${r.survival}% — accounts for normal mortality. KZN and Mpumalanga lowveld (high tick pressure) typically run lower; Free State and Western Cape run higher.
• Live weight at sale: ${r.liveKg}kg — ${r.breed} commercial benchmark in ${r.name}. Poor nutrition at weaning reduces this by 30–50kg, cutting revenue per animal by ${ZAR(Math.round(30 * r.dressing / 100 * carcass))}–${ZAR(Math.round(50 * r.dressing / 100 * carcass))}.
• Dressing percentage: ${r.dressing}% — A2 grade standard. Animals presented below condition score 2.5 dress at ${r.dressing - 3}–${r.dressing - 2}%, reducing revenue per carcass by ${ZAR(Math.round(r.liveKg * 0.025 * carcass))}.
• Carcass price: R${carcass}/kg A2 (AgriOrbit Apr 2025 benchmark — verify current price; feedlot contracts at R22–28/kg live weight for weaners are an alternative).

Cost assumptions:
• Feed: ${feedNote}
• Health: ${healthNote}
• Replacement: ${r.rep}% annually at ${ZAR(r.ewePrice)}/cow = ${ZAR(Math.round(r.ewePrice * r.rep / 100))}/cow/yr
• Overhead: ${ZAR(r.oh)}/mo — water, vehicle, maintenance, electricity, insurance
• Labour: ${lmNote}

The variable margin of ${ZAR(vm)}/cow is the key number. Fixed costs consume ${ZAR(Math.round(fa / flock))}/cow/yr at ${flock} cows. Every cow above breakeven drops ${ZAR(vm)} to profit — the dilution economics of fixed costs make scale the primary lever.

Most likely wrong assumption: Calving rate. A 5% improvement in calving rate (from ${r.lambing}% to ${r.lambing + 5}%) adds ${Math.round(flock * 0.05 * (r.survival / 100) * 0.85)} calves per year at zero extra fixed cost — worth ${ZAR(Math.round(flock * 0.05 * (r.survival / 100) * 0.85 * revPerAnimal))} in additional annual revenue.`,

    `Cattle cash flow has three distinct phases.

Phase 1 — Working capital (Months 1–12): Cows are purchased, mated, and carrying calves. Every month is cash-negative. Monthly operating cost: ${ZAR(Math.round(mc))} (labour, overhead, feed, health, replacement reserve). At Month 12 the cumulative position is ${ZAR(yr1)} — this is the biological investment in your first calf crop. Plan for it deliberately; operations that run out of working capital before first calf sales sell their breeding herd at the worst possible time.

Phase 2 — First revenue (Month ${firstPositive?.m ?? 13}, ${firstPositive?.mo ?? "January"} Year ${firstPositive?.yr ?? 2}): First calf cheque. With ${flock} cows at ${r.lambing}% calving, approximately ${Math.round(flock * (r.lambing / 100) * (r.survival / 100) * 0.5)} calves available in the first sale group (50% of crop). At R${carcass}/kg and ${carcassKg}kg carcass, this is a substantial single cash event. Year 2 cumulative: ${ZAR(yr2)}.

Phase 3 — Normal production (Year 3+): Annual revenue ${ZAR(Math.round(revPE * flock))}, annual costs ${ZAR(Math.round((varPE + fa / flock) * flock))}, sustainable free cash ${ZAR(Math.round(pp * flock))}/yr. Year 3 cumulative: ${ZAR(yr3)}.

${pp < 0 ? `WARNING: At ${flock} cows, this operation never achieves cumulative-positive in 36 months. Increase to at least ${be ?? flock + 10} cows before proceeding.` : `The operation ${yr2 >= 0 ? "recovers all working capital by Year 2" : "requires the full 36-month period to recover working capital"}.`}

Working capital requirement: ${ZAR(Math.round(Math.abs(yr1) * 1.15))} (Year 1 drawdown + 15% contingency). At ${ZAR(r.ewePrice)}/cow, cattle operations require more working capital than sheep operations of equivalent income — this is the primary reason cattle operations need formal production lending.

Recommended bridging instrument: 12-month revolving credit facility from FNB Agri or ABSA Agri, drawdown monthly, repay after first calf sales. Quarterly interest-only payments during the first year. Never use fixed-term loans for cattle working capital — the seasonal revenue pattern requires revolving facility flexibility.`,

    `Breakeven: ${be ?? "N/A"} cows. Variable margin ${ZAR(vm)}/cow covers fixed costs of ${ZAR(fa)}/yr at this scale.

Scale table (at current input prices):
${scaleStr}

${scaleVi ? `First viable scale: ${scaleVi.n} cows — herd profit ${ZAR(scaleVi.fp)}/yr, ROI ${PCT(scaleVi.roi)}.` : "No viable scale found at current input prices — review cost structure before committing capital."}

Commercial viability thresholds for SA beef operations:
• Under 20 cows: sub-economic — fixed costs cannot be diluted, land use inefficient
• 20–50 cows: marginal commercial — viable with zero debt and minimal overhead
• 50–150 cows: commercial viable — full-time operator income possible
• 150–300 cows: strong commercial — supports hired management and debt service
• 300+ cows: primary income at scale — optimal for Land Bank production finance

Your current position: ${flock} cows · ${flock >= (be ?? Infinity) ? `${flock - (be ?? 0)} cows above breakeven (${PCT((flock - (be ?? 0)) / flock)} safety buffer)` : `${(be ?? flock) - flock} cows below breakeven`}.

At what scale does this become a primary income? ${primaryIncomeScale === "N/A" ? "Not achievable at current variable margin — review input costs." : `${primaryIncomeScale} cows generate approximately R300,000/year net.`}

Most important Year 3 reinvestment decision: retain the best 15–20% of heifer calves instead of selling them. This grows your herd by ${Math.round(flock * (r.lambing / 100) * (r.survival / 100) * 0.175)} cows/year at zero purchase cost — compounding return on capital without additional debt.`,

    `1. DROUGHT RISK (${r.drought} in ${r.name})
${droughtAdvice}

2. TICK-BORNE DISEASE RISK (${r.parasites} pressure — primary ongoing health cost)
The three critical diseases: Gallsickness (Anaplasmosis — acute, often fatal within 24 hours), Redwater (Babesiosis — red urine, rapid decline), Heartwater (Ehrlichiosis — neurological signs, high mortality). Prevention protocol: strategic dipping or pour-on every 7–14 days during peak tick season, every 21–28 days in low season. A single Gallsickness death costs ${ZAR(Math.round(r.ewePrice * 1.1))} (replacement cow plus vet cost) — the annual dipping budget for your entire herd is ${ZAR(Math.round(healthCost * 0.6 * flock))}. Dip. Every time. Register with a local vet for emergency response within your area.

3. FOOT AND MOUTH DISEASE RISK (FMD — notifiable)
FMD outbreaks trigger immediate movement restrictions and market closure. Cattle in the FMD buffer zone (primarily Limpopo near the Mozambique border) require additional permits for movement. Register your herd with your provincial Department of Agriculture — mandatory for legal movement. Vaccination is available and strongly recommended in high-risk areas. An FMD outbreak in your district can close your market access for 6–12 months.

4. CARCASS PRICE RISK
${sensTable}
At -20% (R${(carcass * 0.8).toFixed(0)}/kg): profit/cow ${ZAR(s20?.pp ?? 0)} — ${(s20?.pp ?? 0) > -2000 ? "manageable with a cash reserve" : "severe — requires emergency cost reduction or strategic destocking"}.
Mitigation: develop relationships with at least 2 alternative buyers (auction, direct abattoir, feedlot contract). Feedlot weaner contracts at R22–28/kg live weight provide price certainty at the cost of a slight discount to spot.

5. CAPITAL CONCENTRATION RISK
At ${ZAR(r.ewePrice)}/cow, your ${flock}-cow herd represents ${ZAR(flock * r.ewePrice)} in a single asset class. A disease event, drought destocking, or theft incident affecting 20% of your herd costs ${ZAR(Math.round(flock * 0.2 * r.ewePrice))}. Insurance: AGRI SA multi-peril herd insurance covers theft (a growing risk — branded and ear-tagged cattle are harder to sell at auction, reducing theft profitability), FMD movement restriction losses, and drought emergency slaughter. Budget R200–R400/cow/year.

6. THEFT RISK
Cattle theft is a significant operational risk, especially for operations near urban areas or unfenced veld. Mitigation: fire-brand or freeze-brand every animal (legally required in most provinces), maintain a photographic ear-tag register, install a perimeter alarm on kraals where cattle are kraaled at night, and register with your local farm watch structure.

Recommended contingency reserve: ${ZAR(Math.round(fa * 0.5))} minimum (6 months fixed costs), held separately from operational accounts.`,

    `Total capital required: ${ZAR(capital)}.

Cow herd: ${ZAR(flock * r.ewePrice)} (${flock} cows × ${ZAR(r.ewePrice)}/cow)
Financing route: Land Bank production loan, typically prime + 1.5–2.5%, 3–5 year term, semi-annual repayments aligned to calf sales. Security: notarial livestock bond over animals, cession of multi-peril insurance, personal surety or property bond. Minimum own contribution: 30% (${ZAR(Math.round(flock * r.ewePrice * 0.3))}).

Bulls: ${Math.ceil(flock / 28)} bulls at ${ZAR(Math.round(r.ewePrice * 0.8 * Math.ceil(flock / 28)))} estimated. Alternatively, lease proven bulls at R3,000–R5,000/month during mating season — reduces upfront capital by ${ZAR(Math.round(r.ewePrice * 0.8 * Math.ceil(flock / 28)))} and eliminates year-round bull keep.

Infrastructure:
• Handling facility (crush, loading ramp, dip tank/spray race): R30,000–R80,000 depending on existing structures
• Water infrastructure: solar pump + JoJo tanks (5 points for ${flock} cows across recommended camps): R60,000–R120,000 — the single highest-ROI infrastructure investment for cattle
• Fencing (rotational grazing camps — minimum 4 camps): R35–R80/metre installed
• Total infrastructure estimate: R90,000–R200,000 depending on existing condition

Working capital: ${ZAR(Math.round(Math.abs(yr1) * 1.1))} (Year 1 cash requirement + 10% contingency)
Instrument: 12-month revolving credit facility from FNB Agri or ABSA Agri.

Land Bank products to investigate:
• Agri-Finance: primary production loan for commercial cattle operations
• Land Acquisition Finance: if land purchase is part of the plan (separate from production finance)
• MAFISA: if you qualify as a small-scale or emerging farmer — subsidised interest rate

FNB Agri vs Land Bank: FNB Agri approves faster (4–6 weeks vs Land Bank 8–14 weeks) but requires stronger collateral. Land Bank is preferred for first-time applicants — interest rates are typically 0.5–1.0% lower and moratorium terms better suit the cattle production cycle.

Optimal capital structure: 50/50 split (${ZAR(Math.round(capital / 2))} own equity, ${ZAR(Math.round(capital / 2))} debt). Full debt financing leaves zero contingency for the inevitable drought or disease year.

Critical timing note: budget 3–6 months from loan application to cattle on farm. Do not time your mating season around an assumed approval date — start the application 6 months before you want animals.`,

    `MONTHS 1–2 — Infrastructure and funding:
• Install or refurbish handling facilities: crush, loading ramp, dip tank or spray race (a functioning crush is mandatory before any cattle arrive)
• Confirm water supply: boreholes, dams, pipelines — cattle will not walk more than 5km to water; every extra km destroys condition and weaning weights
• Fence camps for rotational grazing — minimum 4 camps for ${flock} cows
• Open a dedicated farm bank account
• Apply for Land Bank or FNB Agri production loan NOW — 8–14 week process
• Register with your local veterinarian and establish a tick-control protocol before cattle arrive

MONTH 3 — Stock procurement:
• Source ${r.breed} cows from ${r.name} livestock auctions or registered breeders
• Price benchmark: ${ZAR(r.ewePrice)}/cow for pregnancy-tested in-calf cows
• Source ${Math.ceil(flock / 28)} bulls from a recording-scheme stud (1:28 ratio). Alternatively, arrange a bull lease for the mating season
• Transport with a veterinary health certificate; quarantine all new cattle 14 days

MONTHS 4–5 — Mating:
• Body condition score every cow before bull introduction — minimum BCS 3.0
• Run bulls at 1:28 ratio; replace any non-serving bull immediately
• Pregnancy diagnose at 6–8 weeks post-mating: cull non-pregnant cows

MONTHS 6–8 — Pregnancy management:
• Adjust nutrition for late-pregnant cows: third trimester energy requirements increase 25–30%
• Vaccinate against Lumpy Skin Disease, Bluetongue, and CBPP 4 weeks before calving
• Prepare calving camps: clean, sheltered, predator-proof

MONTHS 9–10 — Calving:
• Check every 4–6 hours during peak calving
• Colostrum management: calf must suckle within 4 hours of birth
• Tag and record every calf at birth with ear tag (legally required for movement)
• Castrate bull calves at 1–4 weeks using rubber rings or burdizzo

MONTHS 13–15 — First calf sales:
• Grade animals before booking — remove underweight or unthrifty calves
• Book with ${r.market.split("·")[0]?.trim() ?? "your nearest sale yard or abattoir"} 3 weeks in advance
• For weaner sales (live to feedlot): target 200–240kg at 7–8 months
• Compare actual calving%, weaning weight, and carcass grade against model assumptions

MONTHS 15–18 — Second mating cycle and herd development:
• Retain best 15–20% of heifer calves to grow herd organically
• Review Year 1 performance — identify and fix the single largest variance before expanding
• Begin bull performance data submission to breed society (prerequisite for Year 2 bull leasing)

YEAR 2 INCOME OPPORTUNITY — Bull leasing + carbon credits:
1. Once your primary bull has two seasons of weaner weights recorded, approach the local breed society about listing him for lease. R3,000–R5,000/month during mating season.
2. Contact AgriCarbon (agricarbon.co.za) for a free farm carbon assessment — holistic planned grazing registration takes 3–6 months, income from first verified period starts thereafter.

FIVE ACTIONS THIS WEEK:
1. Open a dedicated farm bank account and move initial working capital into it
2. Book a site visit with your regional Land Bank agri-assessor (landbank.co.za) or FNB Agri specialist
3. Contact ${r.name} livestock auction to register as a buyer and get the sale calendar for ${r.breed}
4. Get 3 quotes for dip tank installation and tick-control product pricing — this is your single biggest health cost driver
5. Register with ${r.breed === "Bonsmara" ? "Bonsmara SA Breeders' Society (bonsmara.co.za)" : r.breed === "Nguni" ? "Nguni Cattle Breeders' Society (nguni.co.za)" : r.breed === "Angus" ? "Angus SA (angus.co.za)" : "the relevant SA cattle breed society"} — bull performance data and stud directory access are critical for Year 2 bull sourcing and leasing`,
  ];

  return {
    sections: TITLES.map((title, i) => ({ title, body: bodies[i] ?? "" })),
    raw: bodies.join("\n\n"),
    reportData, buyerName,
    generatedAt: new Date().toISOString(),
    isSandbox: false,
  };
}

// ── DISPATCHER ────────────────────────────────────────────────────────────────
export function generateProReport(reportData, buyerName, terms) {
  const T = terms ?? { unit:"ewe", units:"ewes", group:"flock", young:"lamb", youngs:"lambs", rateLabel:"Lambing" };
  if (T.unit === "hive") return generateBeesReport(reportData, buyerName, T);
  if (T.unit === "cow")  return generateCattleReport(reportData, buyerName, T);
  return generateSheepReport(reportData, buyerName, T);
}
