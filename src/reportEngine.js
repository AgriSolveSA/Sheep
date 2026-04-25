import { ZAR, PCT, MONTHS } from "./utils.js";

// ── PROVINCE CARRYING-CAPACITY GUIDE ─────────────────────────────────────────
const PROV_CC = {
  "Limpopo":      "5–8 ha/ewe across most bushveld areas, improving to 3–4 ha with water development and controlled rotational grazing",
  "North West":   "6–10 ha/ewe in drier districts, 4–6 ha in better-rainfall areas near the Magaliesberg",
  "Gauteng":      "2–4 ha/ewe with good pasture management — the province's small size means every hectare counts",
  "Mpumalanga":   "3–5 ha/ewe on highveld (Ermelo/Standerton), 5–8 ha in the drier lowveld belt",
  "Free State":   "4–8 ha/ewe, highly variable by district — Karoo transition zone (Springfontein/Trompsburg) requires conservative stocking below 8 ha/ewe",
  "KwaZulu-Natal":"2–4 ha/ewe in the coastal midlands, 4–8 ha in drier western KZN near the Drakensberg foothills",
  "Western Cape": "3–6 ha/ewe in the Klein Karoo, improving to 1–3 ha on well-managed renosterveld in the Swartland",
  "Eastern Cape": "3–8 ha/ewe, ranging from Karoo (conservative) to fertile midlands — extremely variable by rainfall zone",
  "Northern Cape":"8–15 ha/ewe in Namaqualand/Bushmanland, improving to 5–8 ha in the Gordonia/Kenhardt area",
};

// ── BREED SOURCING GUIDE ──────────────────────────────────────────────────────
const BREED_SOURCES = {
  "Dorper":
    "The SA Dorper Sheep Breeders' Society (SADSBS — sadsbs.co.za) maintains a directory of production-tested studs. The premier sourcing events are the Vryburg Annual Dorper Show (North West, March), Prieska Production Sale (Northern Cape), and Kroonstad Livestock Auction (Free State). Insist on animals from the National Dorper Recording Scheme (NDRS) with published index values — rams from top-decile indexed studs consistently improve lambing percentage 8–12% over non-recorded stock.",
  "Meatmaster":
    "The Meatmaster Sheep Breeders' Society (meatmastersociety.co.za) coordinates annual evaluation days at which top studs present BLUP-indexed rams. Leading Limpopo studs are concentrated near Vaalwater, Mokopane, and Waterberg. Request the performance index report before purchase — top-10% rams on weaning weight index will meaningfully improve your margin per ewe. Avoid studs that cannot produce recording scheme data.",
  "Merino":
    "Merino SA (merinosa.co.za) coordinates regional Young Ram Sales — the most cost-efficient sourcing event for commercial operations. The Klein Karoo Agricultural Show (Oudtshoorn, June) is the premier Cape event; the Springfontein area hosts the key Free State/Northern Cape show. For commercial ewes, buy from established commercial flocks rather than studs — the premium rarely pays back at this scale. Cape Wools SA (capewoolssa.co.za) provides grading and price support for clip marketing.",
  "SAMM":
    "The SA Mutton Merino Breeders' Society holds production sales in Ermelo and Middelburg (Mpumalanga) annually. SAMM genetics are evaluated on both fleece weight and carcass traits — source rams with above-average BLUP indexes on both dimensions. The dual-purpose advantage is measurable: the wool clip adds a predictable R${r => ZAR(r.wool)}/ewe/yr income stream that reduces revenue concentration risk compared to pure meat operations.",
  "Dohne Merino":
    "The Dohne Merino Breed Society (dohnesa.co.za) coordinates annual sales in Stutterheim (Eastern Cape) and Bethlehem (Free State). Dohne Merino is a scientifically developed dual-purpose breed — insist on breeders using National Dohne Recording Scheme data and providing index values for both fleece and meat traits. The breed's adaptability to both summer and winter rainfall regions makes it one of the most versatile choices in SA commercial sheep farming.",
  "Damara":
    "The Damara Breeders' Society of SA holds annual production events — leading studs are concentrated in the Northern Cape (Upington/Kakamas) and North West. Damara's fat-tail reserve makes it uniquely drought-tolerant; it maintains condition on minimal supplementation during dry seasons when frame breeds require expensive top-up feeding. Source animals from DAFF-registered breeders and avoid informal auctions where health status cannot be verified.",
  "Van Rooy":
    "Van Rooy rams are available from specialist studs in the Northern Cape and North West. The breed is managed by the SA Van Rooy Sheep Breeders' Society. Fat-tail breeds outperform frame breeds in extreme arid conditions — their body reserves sustain ewe condition through dry periods without costly supplementary feeding. Best sourced at regional livestock auctions in Upington and Calvinia.",
  "Dormer":
    "The Dormer Sheep Breeders' Society of SA holds production sales in the Western Cape and Gauteng. Dormer was developed in SA specifically for intensive and irrigated conditions — it excels in peri-urban markets where buyers pay a premium for consistent carcass conformation. Commercial replacements from registered breeders maintain performance traits; avoid unregistered animals where genetic history is unknown.",
  "_default":
    "Contact the relevant SA breed society for your province — most coordinate annual production days where you can inspect performance-tested animals and meet stud breeders. For commercial replacements, local livestock auctions offer certified breeding-status ewes at competitive prices. Always request the animal's health and production history before purchase.",
};

// ── DEMO / PREVIEW REPORT ─────────────────────────────────────────────────────
// Shown in sandbox mode with SANDBOX DEMO labels. Not the production report.
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
    "Executive Summary", "Regional Analysis", "Breed Analysis",
    "Financial Model & Assumptions", "36-Month Cashflow Analysis",
    "Scale & Breakeven Analysis", "Risk Analysis & Sensitivity",
    "Capital Structure & Financing", "Implementation Roadmap",
  ];

  const bodies = [
    `${viabilityVerdict}\n\nOperation: ${flock} ${r.breed} ewes in ${r.name}, ${lmNote}. Carcass price basis: R${carcass}/kg A2 (AgriOrbit Apr 2025).\n\nKey financials: Revenue ${ZAR(revPE)}/ewe/yr · Variable cost ${ZAR(varPE)}/ewe/yr · Variable margin ${ZAR(vm)}/ewe · Fixed annual ${ZAR(fa)} · Breakeven ${be ?? "N/A"} ewes · Profit/ewe ${ZAR(pp)} · Flock profit ${ZAR(pp * flock)}/yr · ROI ${PCT(pp / r.ewePrice)} · Capital required ${ZAR(capital)}.\n\nFirst cashflow: Month ${firstPositive?.m ?? 13} (${firstPositive?.mo ?? "Jan"} Year ${firstPositive?.yr ?? 2}).\n\n⚠ SANDBOX DEMO — Purchase the full report for the AI-written analysis.`,
    `${r.name} — ${r.climate}.\n\nCarrying capacity: variable by district. Market: ${r.market}.\n\n${r.tip ? `Key insight: ${r.tip}` : ""}\n\n⚠ SANDBOX DEMO — Full regional analysis included in purchased report.`,
    `${r.breed} (${r.type}) — ${r.why}\n\nProduction: Lambing ${r.lambing}% · Survival ${r.survival}% · Live ${r.liveKg}kg · Dressing ${r.dressing}% · Wool ${r.wool > 0 ? ZAR(r.wool) + "/ewe/yr" : "nil"}.\n\n⚠ SANDBOX DEMO — Full breed analysis included in purchased report.`,
    `Revenue ${ZAR(revPE)}/ewe/yr · Costs ${ZAR(varPE)}/ewe/yr · Variable margin ${ZAR(vm)}/ewe · Fixed ${ZAR(fa)}/yr · Breakeven ${be ?? "N/A"} ewes · Profit/ewe ${ZAR(pp)}.\n\n⚠ SANDBOX DEMO — Full financial analysis included in purchased report.`,
    `Phase 1 (months 1–12): monthly cost ${ZAR(mc)}, no revenue. First lamb cheque: Month ${firstPositive?.m ?? 13}. Year 1: ${ZAR(yr1)} · Year 2: ${ZAR(yr2)} · Year 3: ${ZAR(yr3)}.\n\n⚠ SANDBOX DEMO — Full cashflow narrative in purchased report.`,
    `Breakeven: ${be ?? "N/A"} ewes. ${scaleStr}\n\n⚠ SANDBOX DEMO — Full scale analysis in purchased report.`,
    `Price risk: at -20% (R${(carcass * 0.8).toFixed(0)}/kg), profit/ewe = ${ZAR(s20?.pp ?? 0)}. Drought: ${r.drought}. Parasites: ${r.parasites}.\n\n⚠ SANDBOX DEMO — Full risk analysis in purchased report.`,
    `Total capital: ${ZAR(capital)}. Stock: ${ZAR(flock * r.ewePrice)}. Working capital: ${ZAR(Math.abs(yr1) * 1.1)}.\n\n⚠ SANDBOX DEMO — Full financing analysis in purchased report.`,
    `Month 1–3: infrastructure. Month 4: mating. Month 9–10: lambing. Month 13–14: first sales (${firstPositive?.mo ?? "January"} Year ${firstPositive?.yr ?? 2}).\n\n⚠ SANDBOX DEMO — Full implementation roadmap in purchased report.`,
  ];

  return {
    sections: TITLES.map((title, i) => ({ title, body: bodies[i] ?? "" })),
    raw: bodies.join("\n\n"),
    reportData, buyerName,
    generatedAt: new Date().toISOString(),
    isSandbox: true,
  };
}

// ── PROVINCE DATA FIELD MAPPING ───────────────────────────────────────────────
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
    yr1: cfRows[11]?.cum ?? 0,
    yr2: cfRows[23]?.cum ?? 0,
    yr3: cfRows[35]?.cum ?? 0,
  };
}

// ── TERM SUBSTITUTION ─────────────────────────────────────────────────────────
// Replaces sheep-specific terms with the correct livestock terminology.
function substituteTerms(text, terms) {
  if (!terms || terms.unit === "ewe") return text; // sheep = no change needed
  const U  = terms.unit;    // e.g. "cow" / "hive"
  const Us = terms.units;   // e.g. "cows" / "hives"
  const Yg = terms.young;   // e.g. "calf" / "nuc"
  const Ys = terms.youngs;  // e.g. "calves" / "nucs"
  const G  = terms.group;   // e.g. "herd" / "apiary"
  const RL = terms.rateLabel; // e.g. "Calving" / "Colony expansion"
  return text
    .replace(/\bewes\b/g,   Us).replace(/\bEwes\b/g,   Us.charAt(0).toUpperCase()+Us.slice(1))
    .replace(/\bewe\b/g,    U ).replace(/\bEwe\b/g,    U.charAt(0).toUpperCase()+U.slice(1))
    .replace(/\blambs\b/g,  Ys).replace(/\bLambs\b/g,  Ys.charAt(0).toUpperCase()+Ys.slice(1))
    .replace(/\blamb\b/g,   Yg).replace(/\bLamb\b/g,   Yg.charAt(0).toUpperCase()+Yg.slice(1))
    .replace(/\bflocks\b/g, G+"s").replace(/\bFlock\b/g, G.charAt(0).toUpperCase()+G.slice(1))
    .replace(/\bflock\b/g,  G )
    .replace(/\bLambing\b/g, RL).replace(/\blambing\b/g, RL.toLowerCase())
    .replace(/\bsheep farming\b/gi, terms.unit === "hive" ? "beekeeping" : "cattle farming")
    .replace(/\bsheep\b/gi, terms.unit === "hive" ? "bees" : "cattle");
}

// ── IN-HOUSE PRO REPORT ENGINE ────────────────────────────────────────────────
// Full 9-section feasibility report generated deterministically from model data.
// No API call, no per-report cost, instant generation.
export function generateProReport(reportData, buyerName, terms) {
  const { r, flock, lm, carcass, lab, fa, revPE, varPE, vm, be, pp, capital, npv5,
          scaleRows, cfRows, firstPositive, sensRows, yr1, yr2, yr3, mc } = reportData;

  const T = terms ?? { unit:"ewe", units:"ewes", group:"flock", young:"lamb", youngs:"lambs", rateLabel:"Lambing" };
  const U  = T.unit;
  const Us = T.units;
  const G  = T.group;
  const Ys = T.youngs;

  const lmNote = lm === "owner"
    ? "owner-operated (notional R1,500/mo — BCEA 2024 hired benchmark R5,594/mo for reference)"
    : "hired worker at R5,594/mo (BCEA 2024 Sectoral Determination + UIF + SDL + housing allowance R800)";

  const s20 = sensRows.find(s => s.pct === -20);
  const s10 = sensRows.find(s => s.pct === -10);
  const scaleVi = scaleRows.find(rw => rw.ok);

  const viabilityVerdict = pp > 0
    ? `VIABLE — this ${flock}-${U} ${r.breed} operation in ${r.name} is profitable at current input prices, generating ${ZAR(pp)}/${U}/year net (${PCT(pp / r.ewePrice)} ROI on stock capital).`
    : `MARGINAL — at ${flock} ${Us}, this operation falls below the ${be ?? "?"}-${U} breakeven. Fixed costs of ${ZAR(fa)}/yr cannot be covered by the current ${G}. Increasing to at least ${be ?? flock + 20} ${Us} is the single most critical action before committing capital.`;

  const bankRating = pp > 0 && flock >= (be ?? 0) * 1.2 ? "STRONG" : pp > 0 ? "MODERATE" : "MARGINAL";

  const stockDensity = r.sheepDensity || r.cattleDensity || r.beeDensity || "Medium";
  const stockDensityLabel = r.cattleDensity ? "Commercial cattle density" : r.beeDensity ? "Apiary density" : "Commercial stock density";

  const ccGuide = PROV_CC[r.name] || `4–8 ha/${U} depending on rainfall zone and grazing management — obtain a professional carrying-capacity assessment before stocking`;

  const breedSource = (BREED_SOURCES[r.breed] || BREED_SOURCES["_default"])
    .replace(/\$\{r => ZAR\(r\.wool\)\}/g, ZAR(r.wool));

  const droughtAdvice = (r.drought === "Severe, frequent" || r.drought === "Frequent")
    ? `Drought is the defining operational risk in ${r.name}. Carry a 90-day supplementary feed reserve at all times — ${ZAR(Math.round(r.feed / 12 * 3 * flock))} for your flock at current feed cost. Set a trigger stocking rate reduction at 50% of normal rainfall (obtain historical rainfall data from ARC at arc.agric.za). AgriSure CP (Comprehensive Plan) coverage is mandatory — register before the production season opens, not after. Maintain a reserve camp ungrazed until drought conditions require emergency grazing.`
    : `Drought is a periodic risk in ${r.name}, manageable with preparation. Maintain a 60-day supplementary feed reserve (${ZAR(Math.round(r.feed / 12 * 2 * flock))} for your flock). AgriSure CP coverage is strongly recommended — review the terms carefully and register before the season. Key discipline: sell the right animals at the right time. Holding animals through a drought waiting for better prices costs more in feed and condition loss than the price difference justifies.`;

  const scaleStr = scaleRows
    .filter((_, i) => i % 2 === 0)
    .map(rw => `${rw.n} ${Us}: profit/${U} ${ZAR(rw.pp)} · ${G} profit ${ZAR(rw.fp)} · ROI ${PCT(rw.roi)} · ${rw.ok ? (rw.roi > 0.15 ? "STRONG" : "VIABLE") : "BELOW BE"}`)
    .join("\n");

  const sensTable = sensRows
    .filter(s => [-20, -10, 0, 10, 20].includes(s.pct))
    .map(s => `  ${s.pct > 0 ? "+" : ""}${s.pct}% (R${s.adj.toFixed(0)}/kg): profit/${U} ${ZAR(s.pp)} · ROI ${PCT(s.roi)} · BE ${s.be || "∞"} ${Us}`)
    .join("\n");

  const primaryIncomeUnits = vm > 0 ? Math.round((fa + 180000) / vm) : "N/A";
  const primeParityUnits   = vm > r.ewePrice * 0.115 ? Math.round(fa / (vm - r.ewePrice * 0.115)) : "N/A";

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

    // ── 1. EXECUTIVE SUMMARY ────────────────────────────────────────────────
    `${viabilityVerdict}

Operation profile: ${flock} ${r.breed} ewes in ${r.name}, ${lmNote}. Carcass price basis: R${carcass}/kg A2 (AgriOrbit Apr 2025).

Key financials: Revenue ${ZAR(revPE)}/ewe/yr · Variable cost ${ZAR(varPE)}/ewe/yr · Variable margin ${ZAR(vm)}/ewe · Fixed annual ${ZAR(fa)} · Breakeven ${be ?? "N/A"} ewes · Profit/ewe ${ZAR(pp)} · Flock profit ${ZAR(pp * flock)}/yr · ROI on stock capital ${PCT(pp / r.ewePrice)} · Capital required ${ZAR(capital)} · 5-year NPV at 10% discount rate: ${ZAR(npv5)}.

Cashflow turning point: Month ${firstPositive?.m ?? 13} (${firstPositive?.mo ?? "Jan"} Year ${firstPositive?.yr ?? 2}) — this is when the first lamb cheque arrives. The preceding 12 months require ${ZAR(Math.abs(yr1))} in working capital before a single rand of revenue is received. This is not a loss — it is the biological investment in the first crop.

Three-year trajectory: Year 1 cumulative ${ZAR(yr1)} (entirely negative — working capital phase). Year 2 cumulative ${ZAR(yr2)}. Year 3 cumulative ${ZAR(yr3)}. From Year 3 onwards, the operation runs at a sustainable ${ZAR(pp * flock)}/year flock profit.

Land Bank bankability rating: ${bankRating}. ${bankRating === "STRONG" ? `This operation covers its fixed costs with a ${PCT((flock - (be ?? flock)) / flock)} flock-size buffer above breakeven and presents a credible repayment schedule aligned to lamb sales.` : bankRating === "MODERATE" ? "Viable at current flock size but limited margin for error — a lender will require evidence of management experience and a 12-month cash reserve." : `Below the ${be}-ewe breakeven — a lender will require flock expansion or a materially reduced cost structure before approving production finance.`}

Recommended immediate action: ${be && flock < be ? `Increase flock size to at least ${be} ewes before committing capital — at ${flock} ewes the operation cannot cover fixed costs and every month adds to the working capital shortfall.` : `Proceed with the ${flock}-ewe operation, securing a 12-month revolving credit facility of ${ZAR(Math.round(Math.abs(yr1) * 1.1))} to bridge the working capital gap to Month ${firstPositive?.m ?? 13}.`}`,

    // ── 2. REGIONAL ANALYSIS ────────────────────────────────────────────────
    `${r.name} — ${r.climate}.

Climate and production environment: Rainfall ${r.climate.match(/\d+[–\-]\d+mm/)?.[0] ?? "variable"} · Season: ${r.season ?? "summer"} rainfall · Frost: ${r.frost} · Parasite pressure: ${r.parasites} · Drought frequency: ${r.drought} · ${stockDensityLabel}: ${stockDensity}.

Carrying capacity: ${ccGuide}. This figure is a district average — actual capacity on your farm depends on veld type, water point distribution, and seasonal rainfall variability. A professional veld assessment (consult ARC-Range & Forage Institute at arc.agric.za or a local agricultural advisor) before stocking avoids the most common error in ${r.name} sheep farming: overstocking in a good rainfall year and being trapped when the next drought arrives.

Market infrastructure: ${r.market}. Distance to market is a silent margin killer — calculate your exact transport cost per animal (typically R15–45/animal depending on distance) and deduct it from your net carcass price before comparing buyer options. Abattoirs paying on deadweight require a higher condition score at delivery; auction markets accept a wider range but give up 10–18% to the auction premium and transport combination.

${r.tip ? `Provincial insight: ${r.tip}` : ""}

What separates successful ${r.name} operations from failed ones: The operations that survive manage water access first (sheep will not walk more than 3km to water — infrastructure drives carrying capacity), maintain lean fixed-cost structures, and sell at the biologically optimal time rather than holding animals waiting for price moves. Operations that fail consistently overstock in good years, underestimate the 12-month working capital gap before first lamb sales, and make capital decisions based on a single good season.

Breeds to avoid in ${r.name}: ${r.avoid.length ? r.avoid.join(", ") + " — " + (r.avoid.includes("Merino") ? "wool breeds suffer heat stress and parasite load in these conditions" : r.avoid.includes("Damara") ? "arid fat-tail breeds are not adapted to the frost and moisture conditions here" : "genetic characteristics do not suit the local climate") : "No specific breed avoidances — confirm with your local extension officer for your specific district."}`,

    // ── 3. BREED ANALYSIS ───────────────────────────────────────────────────
    `${r.breed} — ${r.type} breed — is the recommended primary breed for ${r.name}.

Why ${r.breed} suits ${r.name}: ${r.why}

Production parameters for this model:
• Lambing rate: ${r.lambing}% (${r.name} commercial average — well-managed intensive operations can exceed this by 15–20%)
• Survival to weaning: ${r.survival}% (accounts for normal mortality and early culls)
• Effective selling lambs/ewe/yr: ${((r.lambing / 100) * (r.survival / 100) * 0.85).toFixed(2)} (applying 85% selection rate — the balance retained for flock replacement or finishing)
• Slaughter weight: ${r.liveKg}kg live · Dressing: ${r.dressing}% · Carcass: ${(r.liveKg * r.dressing / 100).toFixed(1)}kg
• Wool income: ${r.wool > 0 ? ZAR(r.wool) + "/ewe/yr (clip weight × " + r.name + " market price)" : "R0 — hair breed, zero shearing cost and zero shearing labour requirement — a significant operational simplification"}

Revenue per ewe at R${carcass}/kg A2: ${ZAR(revPE)} (lamb carcass ${ZAR(Math.round(((r.lambing / 100) * (r.survival / 100) * 0.85) * (r.liveKg * r.dressing / 100) * carcass))}${r.wool > 0 ? ` + wool ${ZAR(r.wool)}` : ""}).

Where to source ${r.breed} in ${r.name}: ${breedSource}

At ${flock} ewes, a commercial flock is appropriate — there is no reason to maintain a stud. Use performance-tested stud rams (1:35 ewe ratio, meaning ${Math.ceil(flock / 35)} rams for your flock) sourced from a recording-scheme stud, and manage the ewes as a straight commercial operation. Stud overhead adds cost and management complexity without proportionate benefit below 500 ewes.

Health priorities for ${r.breed} in ${r.name}: ${r.parasites !== "Very low" && r.parasites !== "Low" ? `Internal parasite management is the primary ongoing cost driver. Implement a FAMACHA-based dosing protocol rather than calendar dosing — this reduces anthelmintic use by 30–40% and delays resistance development. The health budget of ${ZAR(r.health)}/ewe/yr assumes 3 strategic dosings per year. Any outbreak year can double this — maintain a ${ZAR(Math.round(r.health * 0.5 * flock))} contingency reserve for emergency vet costs.` : `Low parasite pressure in ${r.name} reduces health costs compared to higher-rainfall regions. Maintain prophylactic dosing at minimum 2 cycles/year and monitor for Bluetongue in summer months.`}

Year-1 performance red flags: Lambing rate below ${Math.round(r.lambing * 0.85)}% (15% below benchmark), ewe body condition score below 2.5 at mating (check 6 weeks before ram introduction), lamb losses above ${100 - r.survival}% (normal is ${100 - r.survival}% — above this, investigate predation, colostrum management, or disease). Any one of these in year 1 should trigger an immediate management review before they compound.`,

    // ── 4. FINANCIAL MODEL & ASSUMPTIONS ────────────────────────────────────
    `This model applies a conservative, Land Bank-style extensive farming benchmark. Every assumption is transparent and challengeable — that is the intent.

Revenue assumptions:
• Lambing rate: ${r.lambing}% — ${r.name} commercial benchmark. Intensive irrigated operations with flush feeding achieve 140–160%. Do not use a higher number until you have 2 seasons of measured data.
• Survival to weaning: ${r.survival}% — accounts for normal mortality. Exceptional management in low-parasite provinces can exceed this; high-parasite environments (KZN, Mpumalanga lowveld) typically fall below it.
• Live weight at slaughter: ${r.liveKg}kg — market standard for ${r.breed} in ${r.name}. Poor nutrition reduces this by 3–5kg, cutting carcass weight and revenue per lamb.
• Dressing percentage: ${r.dressing}% — A2 grade standard. Animals presented below condition score 2.5 dress at 44–45%, reducing revenue per carcass by ${ZAR(Math.round(r.liveKg * 0.025 * carcass))} per animal.
• Carcass price: R${carcass}/kg A2 (AgriOrbit Apr 2025 benchmark — verify current price before finalising any finance application).
• Wool: ${r.wool > 0 ? ZAR(r.wool) + "/ewe/yr — clip weight × current Cape Wools A-grade price. Wool income reduces revenue concentration risk significantly." : "R0 — hair breed. Zero shearing cost offsets the absence of wool income."}

Cost assumptions:
• Feed: ${ZAR(r.feed)}/ewe/yr — Land Bank extensive benchmark. Includes salt licks, drought supplementation, and creep feed for lambs. Excludes irrigated pasture establishment.
• Health: ${ZAR(r.health)}/ewe/yr — ProAgri 3-cycle dosing schedule plus foot care and annual vet consultation. Actual cost ranges from ${ZAR(100)} (arid Northern Cape) to ${ZAR(300)}+ (high-rainfall KZN).
• Replacement: ${r.rep}% annually at ${ZAR(r.ewePrice)}/ewe = ${ZAR(Math.round(r.ewePrice * r.rep / 100))}/ewe/yr — SA commercial norm for ${r.breed}. Stud flocks replace at lower rates; drought-stressed operations replace at higher rates.
• Overhead: ${ZAR(r.oh)}/mo — water, fuel, repairs, electricity, insurance. Conservative for a small flock; larger operations benefit from fixed-cost dilution.
• Labour: ${lmNote}.

The variable margin of ${ZAR(vm)}/ewe is the most important single number in this model. At ${flock} ewes, fixed costs consume ${ZAR(Math.round(fa / flock))}/ewe/yr. At 200 ewes, fixed cost per ewe drops to ${ZAR(Math.round(fa / 200))}. This is why every ewe above breakeven drops ${ZAR(vm)} straight to profit.

Most likely wrong assumption: Carcass price. A ±R10/kg swing changes profit/ewe by ${ZAR(Math.round(((r.lambing / 100) * (r.survival / 100) * 0.85) * (r.liveKg * r.dressing / 100) * 10))} — review the sensitivity analysis in Section 7 before finalising your capital commitment.`,

    // ── 5. 36-MONTH CASHFLOW ANALYSIS ───────────────────────────────────────
    `The cashflow story for this operation has three distinct phases.

Phase 1 — Working capital (Months 1–${(firstPositive?.m ?? 13) - 1}): Every month is cash-negative. You are funding the biological reality that ewes take 5 months to gestate and 5–7 months to produce a lamb at slaughter weight. Monthly operating cost: ${ZAR(Math.round(mc))} (covering labour, overhead, feed, health, and replacement reserve). At Month 12 the cumulative position is ${ZAR(yr1)} — this is not a loss on the operation, it is the working capital investment in your first crop. Plan for it deliberately: do not be surprised by it.

Phase 2 — First revenue (Month ${firstPositive?.m ?? 13}, ${firstPositive?.mo ?? "January"} Year ${firstPositive?.yr ?? 2}): The first lamb cheque arrives. With ${flock} ewes at ${r.lambing}% lambing, approximately ${Math.round(flock * (r.lambing / 100) * (r.survival / 100) * 0.5)} lambs are available for sale in the first batch (50% of crop — the balance retained or finishing). At R${carcass}/kg and ${(r.liveKg * r.dressing / 100).toFixed(1)}kg carcass, this is a significant single cash event. Year 2 cumulative: ${ZAR(yr2)}.

Phase 3 — Normalisation (Year 3+): With annual revenue of ${ZAR(Math.round(revPE * flock))} and annual costs of ${ZAR(Math.round((varPE + fa / flock) * flock))}, the operation settles into a sustainable run rate. Year 3 cumulative: ${ZAR(yr3)}. From this point, the annual free cash of ${ZAR(Math.round(pp * flock))} can fund flock expansion without additional borrowing.

${pp < 0 ? `WARNING: At ${flock} ewes, this operation never turns cumulative-positive in 36 months. The flock must be increased to at least ${be ?? flock + 20} ewes before proceeding — increasing flock size is the only lever that reduces fixed cost per ewe.` : `The operation ${yr2 >= 0 ? "recovers working capital by Year 2" : "requires the full 36-month period to recover working capital — a long-term view is required and the operation is not suited to short-term financing"}.`}

Working capital requirement: ${ZAR(Math.round(Math.abs(yr1) * 1.15))} (Year 1 drawdown + 15% contingency for cost overruns or price dips).

Best bridging instrument for this profile: a 12-month revolving credit facility from FNB Agri or ABSA Agri, with monthly drawdowns against the agreed limit and repayment timed to the January/February lamb sales. Avoid fixed-term loans for working capital — the seasonal revenue pattern requires the flexibility of a revolving facility.

Revenue concentration risk: All income arrives in 1–2 months per year. Budget monthly expenses from the revolving facility between sales and repay the facility in full after each sales event. This discipline prevents the creeping overdraft that kills otherwise viable operations.`,

    // ── 6. SCALE & BREAKEVEN ANALYSIS ───────────────────────────────────────
    `Breakeven: ${be ?? "N/A"} ewes. At this scale, the variable margin of ${ZAR(vm)}/ewe exactly covers the fixed costs of ${ZAR(fa)}/yr. Below ${be ?? "?"} ewes, every ewe adds to the loss. Above ${be ?? "?"} ewes, every additional ewe contributes ${ZAR(vm)} directly to profit — this is the dilution economics that makes scale the primary lever in sheep farming.

Scale table (at current input prices):
${scaleStr}

${scaleVi ? `First viable scale: ${scaleVi.n} ewes — profit ${ZAR(scaleVi.fp)}/yr, ROI ${PCT(scaleVi.roi)} on stock capital.` : "No viable scale found at current input prices — review cost structure before committing capital."}

Your current position: ${flock} ewes · ${flock >= (be ?? Infinity) ? `${flock - (be ?? 0)} ewes above breakeven (${PCT((flock - (be ?? 0)) / flock)} safety buffer)` : `${(be ?? flock) - flock} ewes below breakeven — fixed costs cannot be covered until flock reaches ${be ?? "?"}`}.

At what scale does this become a primary income? ${primaryIncomeUnits === "N/A" ? "Not achievable at current variable margin — review input costs." : `${primaryIncomeUnits} ${Us} generate approximately R180,000/year net — a minimum rural household income.`} At ${vm > 0 ? Math.round((fa + 360000) / vm) : "N/A"} ${Us}, the operation produces R360,000/year.

At what scale does it beat money in the bank (prime 11.5%)? ${primeParityUnits === "N/A" ? "ROI cannot reach prime at current variable margin — the cost structure requires attention." : `${primeParityUnits} ${Us} — below this, the same capital invested at prime earns more than the farming operation.`}

The most important reinvestment decision in Year 3: retain the best 20% of ewe lambs instead of selling them. This grows your flock by approximately ${Math.round(flock * (r.lambing / 100) * (r.survival / 100) * 0.2)} ewes/year at zero purchase cost — compounding the profit margin with each successive cycle without additional debt.

Infrastructure and land scale: ${flock} ewes require approximately ${Math.round(flock / 6)} ha minimum (conservative 6 ewes/ha benchmark for this region). At 200 ewes: ~35 ha. At 500 ewes: ~85 ha. Water point placement (max 3km spacing) and handling facility capacity are typically the binding constraints on scale before land area becomes limiting.`,

    // ── 7. RISK ANALYSIS & SENSITIVITY ──────────────────────────────────────
    `1. PRICE RISK (High probability, manageable with planning)
Sensitivity to carcass price:
${sensTable}
At -20% (R${(carcass * 0.8).toFixed(0)}/kg), profit/ewe is ${ZAR(s20?.pp ?? 0)} — ${(s20?.pp ?? 0) > -500 ? "painful but survivable with a cash reserve and cost discipline" : "severe — requires emergency cost reduction or flock reduction to survive"}. At -10% (R${(carcass * 0.9).toFixed(0)}/kg), profit/ewe is ${ZAR(s10?.pp ?? 0)}.
Mitigation: build a forward-sale relationship with your nearest abattoir; some accept 3-month forward contracts at a small discount to spot but eliminate the worst-case scenario. AgriSure price protection (limited instruments) and producer groups negotiate better floor prices.

2. DROUGHT RISK (${r.drought} in ${r.name})
${droughtAdvice}

3. DISEASE RISK (Medium probability, budget-dependent)
Key threats for ${r.breed} in ${r.name}: ${r.parasites !== "Very low" ? "internal parasites (primary cost driver — " + r.parasites + " pressure in this region)" : "low internal parasite pressure — maintain prevention protocol"}, Bluetongue (notifiable — peak risk in summer, vector-borne, no cure, vaccination available), Rift Valley Fever (notifiable — cyclical outbreak risk), foot rot (wet conditions), Johne's disease (chronic, no cost-effective treatment). The health budget of ${ZAR(r.health)}/ewe/yr covers the prevention protocol. Any outbreak or disease year can double this — budget a ${ZAR(Math.round(r.health * 0.5 * flock))} contingency for emergency veterinary costs.

4. MARKET RISK (Low-medium, manageable with diversification)
${r.market}. If your primary buyer changes grading, closes, or cuts prices: alternative channels include local auction markets, direct-to-consumer (WhatsApp sales groups are active in most ${r.name} districts), and cooperative buying groups that negotiate block rates. Never be 100% dependent on a single buyer — develop at least 2 active sale relationships.

5. MANAGEMENT RISK (The most underestimated risk)
The most common cause of sheep operation failure in ${r.name} is not drought or disease — it is under-capitalisation. Operations that start with insufficient working capital are forced to sell animals at the wrong biological time, or abandon the operation before Year 2 sales arrive. ${flock < (be ?? 0) ? `This operation at ${flock} ewes (below the ${be}-ewe breakeven) carries elevated management risk — the margin for error is zero.` : ""}

Recommended contingency reserve: ${ZAR(Math.round(fa * 0.5))} minimum (6 months of fixed costs), held in a separate savings account, not touched for operational expenses.`,

    // ── 8. CAPITAL STRUCTURE & FINANCING ────────────────────────────────────
    `Total capital required: ${ZAR(capital)}.

Stock component: ${ZAR(flock * r.ewePrice)} (${flock} ewes × ${ZAR(r.ewePrice)}/ewe)
Financing route: Land Bank production loan, typically prime + 1.5–2.5%, 3–5 year term, quarterly repayments aligned to lamb sales cycles. Security requirements: notarial livestock bond over animals, cession of fire and multi-peril insurance policy (AgriSure or equivalent), and personal surety. Minimum own contribution: 30% (${ZAR(Math.round(flock * r.ewePrice * 0.3))}) — Land Bank will not fund 100% of stock purchase for new applicants.

Working capital: ${ZAR(Math.round(Math.abs(yr1) * 1.1))} (Year 1 cash requirement + 10% buffer)
Recommended instrument: 12-month revolving credit facility — drawdown monthly against the approved limit, repay in full after each sales event (January/February). Interest-only for the first 12 months, capital repayment from Month 13 aligned to first lamb revenue. FNB Agri and ABSA Agri Revolving Credit are the most flexible products for this seasonal pattern.

Specific Land Bank products to investigate:
• Agri-Finance: standard production loan for commercial farmers — the primary instrument for stock purchase
• Land Acquisition Finance: if land purchase is part of the plan — separate from production finance, longer terms
• MAFISA (Micro-Agricultural Financial Institutions of SA): relevant if you qualify as a small-scale emerging farmer — subsidised interest rate, longer moratorium

FNB Agri vs Land Bank for this profile: FNB Agri offers faster approval (typically 4–6 weeks vs Land Bank's 8–14 weeks) and more flexible drawdown terms, but requires stronger collateral. Land Bank is the preferred route for first-time applicants and BBBEE-compliant operations — interest rates are typically 0.5–1.0% lower and the moratorium terms better suit the 13-month working capital cycle.

Optimal capital structure at ${ZAR(capital)}: 50/50 split (${ZAR(Math.round(capital / 2))} own equity, ${ZAR(Math.round(capital / 2))} debt) is the recommended structure for this scale and risk profile. Full debt financing leaves zero contingency margin for an inevitable Year 1 setback.

One honest caution: First-time applicants consistently underestimate the time between loan application and first livestock on farm. Budget 3–6 months for the full lending process — do not time your mating season around an assumed approval date. Start the application 6 months before you want animals on farm.`,

    // ── 9. IMPLEMENTATION ROADMAP ────────────────────────────────────────────
    `MONTHS 1–2 — Site preparation and funding:
• Install or refurbish handling facilities: crush, loading ramp, dip tank or spray race, weighbridge if budget allows (pays back in grading accuracy within 18 months)
• Confirm water supply: boreholes, dams, pipelines — sheep will not walk more than 3km to water; every additional km reduces effective carrying capacity by 15%
• Fence camps for rotational grazing — minimum 4 camps for ${flock} ewes (7-day rotation cycle per camp)
• Open a dedicated farm bank account — never mix farm and personal finances
• Apply for Land Bank / FNB Agri production loan NOW — the process takes 8–14 weeks; don't miss your stocking window
• Register with your local veterinarian — establish a health protocol before animals arrive

MONTH 3 — Stock procurement:
• Source ${r.breed} ewes at ${r.name} livestock auctions or from registered breeders (see Section 3 for specific sourcing guidance)
• Price benchmark: ${ZAR(r.ewePrice)}/ewe for certified breeding-status animals
• Purchase ${Math.ceil(flock / 35)} stud rams (1:35 ratio) from a performance-tested recording-scheme stud — ram quality is leveraged across every ewe in your flock
• Transport with a veterinary health certificate; quarantine all new animals for 14 days before joining the existing flock

MONTH 4 — Mating:
• Flush ewes 3 weeks before ram introduction: improve body condition to 3.0–3.5 (score on a 1–5 scale)
• Run rams at 1:35 ratio — monitor daily for serving activity and replace any non-serving rams immediately
• Use ram harnesses (raddle) in alternating colours to identify cycling ewes and confirm service; change colour at day 17
• Target: 95%+ of ewes mated in the first 17-day cycle

MONTHS 5–8 — Pregnancy management:
• Pregnancy scan at 5 weeks post-mating (ultrasound via local vet or scanning contractor): sort into singles, twins, and empties
• Adjust nutrition by class: twins require 20% higher feed allocation from Month 5
• Prepare lambing camps: clean, sheltered, predator-proof, familiar to ewes

MONTHS 9–10 — Lambing:
• Most common first-timer error: abandoning wet ewes. Check every 3–4 hours during the peak lambing period
• Colostrum management: lamb must suckle within 2 hours of birth or receive 50ml/kg of hand-expressed colostrum
• Tag and record every lamb at birth — building production records from Day 1 is the foundation of profitable flock management
• Castrate ram lambs and dock tails at 1–7 days using rubber rings

MONTHS 13–14 — First lamb sales (${firstPositive?.mo ?? "January"} Year ${firstPositive?.yr ?? 2}):
• Grade animals before booking — remove underweight animals from the sale group (they cost money to finish, not sell underprepared)
• Book with ${r.market.split("·")[0]?.trim() ?? "your nearest abattoir or auction"} 2–3 weeks in advance
• Present animals at body condition score 3.0+ — buyers and abattoirs grade on presentation
• This first sale is a benchmark: compare actual lambing %, survival, and carcass weight against the model assumptions and adjust accordingly

MONTHS 15–18 — Second cycle and expansion:
• Review Year 1 performance vs model assumptions: lambing %, survival %, carcass price achieved, actual feed cost
• If at or above model: retain the best 20% of ewe lambs to grow toward ${Math.round(flock * 1.3)} ewes in Year 2
• If below model: identify the single biggest variance and fix it before expanding — more ewes will only amplify an underlying management problem

FIVE ACTIONS THIS WEEK (priority order):
1. Open a dedicated farm bank account and move initial working capital into it
2. Book a site visit with your regional Land Bank agri-assessor or FNB Agri specialist
3. Contact ${r.name} livestock auction to register as a buyer and get the sale calendar
4. Get 3 quotes from local feed suppliers for bulk concentrate pricing — buying in bulk cuts feed cost 15–20%
5. Join the SA ${r.breed} Breeders' Society (or Merino SA / Cape Wools SA for wool breeds) — access to production data, stud directories, and auction calendars`,

  ];

  const finalBodies = bodies.map(b => substituteTerms(b, T));
  return {
    sections: TITLES.map((title, i) => ({ title, body: finalBodies[i] ?? "" })),
    raw: finalBodies.join("\n\n"),
    reportData, buyerName,
    generatedAt: new Date().toISOString(),
    isSandbox: false,
  };
}
