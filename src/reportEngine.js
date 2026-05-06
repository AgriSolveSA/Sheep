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
  "Blackhead Persian":
    "The Blackhead Persian is one of the oldest fat-tail breeds in southern Africa. Source from registered breeders in the Northern Cape and North West via the SA Blackhead Persian Breeders' Society. Extremely heat and drought tolerant; thrives on sparse Karoo veld where other breeds fail.",
  "Namaqua Afrikaner":
    "An indigenous fat-tail breed adapted to the arid Namaqualand and Northern Cape. The Namaqua Afrikaner Breeders' Society coordinates periodic production sales in Springbok and Loeriesfontein. This breed stores energy in its fat tail, requires minimal supplementary feeding, and suits low-input Karoo operations.",
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
  "Beefmaster":
    "Beefmaster SA coordinates performance-tested bull sales. A triple-purpose breed (beef, hardiness, fertility), the Beefmaster excels in hot, semi-arid environments such as Limpopo and the Northern Cape. Source bulls with Frame Score 5–6 and documented tick-resistance pedigree for best commercial performance.",
  "Simbra":
    "Simbra — a Simmentaler × Brahman composite — combines hybrid vigour with tick tolerance. The Simbra Breeders' Society of SA coordinates production sales in KZN and the Eastern Cape. Best suited as a terminal sire on Nguni or Bonsmara cow herds for maximum weaner weight in tick-pressured environments.",
  "Charolais":
    "Charolais SA (charolais.co.za) coordinates production sales. As the heaviest-muscled European breed used in SA, Charolais is most effective as a terminal sire in feedlot-orientated systems. Source bulls with Frame Score 6–7 and above-average retail beef yield EBVs for maximum carcass value.",
  "Hereford":
    "Hereford SA coordinates production-tested bull sales. Herefords offer docility, good carcass quality, and strong performance on mixed veld/pasture. The polled Hereford is favoured for low-input operations — request polled genetics where available to reduce dehorning costs.",
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
    operationMode    = "breeding",
    weanerPrice      = null,
    sellWeightKg     = null,
    livePriceKg      = null,
    bondMonthly      = 0,
    fencingMonthly   = 0,
    miscMonthly      = 0,
  } = inputs;

  // Apply client inputs with floors and fallbacks
  const MIN_OWNER_LABOUR = 1500;
  const lab = lm === "hired"
    ? r.hired
    : Math.max(MIN_OWNER_LABOUR, labourOverride !== null ? labourOverride : r.labour);
  const feedCost   = feedOverride   !== null ? feedOverride   : r.feed;
  const healthCost = healthOverride !== null ? healthOverride : r.health;
  const extraFixed = (bondMonthly || 0) + (fencingMonthly || 0) + (miscMonthly || 0);

  const ck        = r.liveKg * (r.dressing / 100);
  const isPig     = r.lambing > 1000;
  const isPoultry = !isPig && r.liveKg < 5 && r.dressing !== 100;
  const lpe       = isPig
    ? r.lambing / 100
    : isPoultry
    ? (r.lambing / 100) * (r.survival / 100)
    : (r.lambing / 100) * (r.survival / 100) * 0.85;
  const fa  = (lab + r.oh + extraFixed) * 12;
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
  const isBee    = r.dressing === 100;
  const isCattle = !isBee && !isPig && !isPoultry && r.liveKg >= 100;
  let cum = -(flock * r.ewePrice);
  const cfRows = Array.from({ length: 36 }, (_, i) => {
    const m  = i + 1;
    const ev = [];
    if (m === 1)                               ev.push(isBee ? "Hives installed" : "Stock purchased");
    if (!isBee && (m === 4 || m === 16))       ev.push("Mating");
    if (m === 9  || m === 21)                  ev.push(isBee ? "Hive inspection" : isCattle ? "Calving" : "Lambing");
    if ([2, 7, 11, 14, 19, 23].includes(m))   ev.push(isBee ? "Varroa check" : isCattle ? "Tick dosing" : "Dosing");
    if (!isBee && (m === 6  || m === 18))      ev.push("Preg scan");
    if (isWool(m))                             ev.push(isBee ? "Beeswax harvest" : "Wool clip");
    if (isSale(m))                             ev.push(isBee ? "Honey harvest" : isCattle ? "Calf sales" : "Lamb sales");
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
  // ── Pig (farrowing-cycle) branch ─────────────────────────────────────────────
  if (isPig) {
    const sowPurchase  = flock * r.ewePrice;
    const monthlyRev   = (lpe * ck * carcass * flock) / 12;
    const pigMc        = mc;
    let cumP = -sowPurchase;
    const cfRowsPig = Array.from({ length: 36 }, (_, i) => {
      const m   = i + 1;
      const rev = m >= 6 ? monthlyRev : 0;
      const profit = rev - pigMc;
      cumP += profit;
      const ev = [];
      if (m === 1)                               ev.push("Gilts / sows introduced");
      if (m === 5)                               ev.push("First batch to slaughter");
      if (m >= 6 && m % 3 === 0)                ev.push("Batch to slaughter");
      if ([3, 9, 15, 21, 27, 33].includes(m))   ev.push("Herd health protocol");
      return { m, mo: MONTHS[(m - 1) % 12], yr: Math.ceil(m / 12), rev, cost: pigMc, profit, cum: Math.round(cumP), events: ev.join(", ") };
    });
    const firstPositivePig = cfRowsPig.find(d => d.rev > 0);
    const sensRowsPig = [-20, -15, -10, -5, 0, 5, 10, 15, 20].map(pct => {
      const adj   = carcass * (1 + pct / 100);
      const rAdj  = lpe * ck * adj;
      const vmAdj = rAdj - feedCost - healthCost - r.ewePrice * (r.rep / 100);
      const pAdj  = rAdj - varPE - fa / flock;
      const beAdj = vmAdj > 0 ? Math.ceil(fa / vmAdj) : null;
      return { pct, adj, pp: pAdj, fp: pAdj * flock, roi: pAdj / r.ewePrice, be: beAdj };
    });
    return {
      r, flock, lm, carcass,
      lab, ck, lpe, fa, revPE, varPE, vm, be, pp, capital, npv5,
      scaleRows, cfRows: cfRowsPig, firstPositive: firstPositivePig,
      sensRows: sensRowsPig, mc,
      feedCost, healthCost, productionSystem, marketChannel, feedSource,
      yr1: cfRowsPig[11]?.cum ?? 0,
      yr2: cfRowsPig[23]?.cum ?? 0,
      yr3: cfRowsPig[35]?.cum ?? 0,
      isPig: true,
    };
  }

  // ── Poultry (batch broiler) branch ───────────────────────────────────────────
  if (isPoultry) {
    const batchesPerYear   = r.lambing / 100;
    const survivalRate     = r.survival / 100;
    const carcassKg        = r.liveKg * (r.dressing / 100);
    const chickCostPerYear = batchesPerYear * r.ewePrice;
    const varPEPoultry     = feedCost + healthCost + chickCostPerYear;
    const revPEPoultry     = batchesPerYear * survivalRate * carcassKg * carcass;
    const vmPoultry        = revPEPoultry - varPEPoultry;
    const ppPoultry        = revPEPoultry - varPEPoultry - fa / flock;
    const bePoultry        = vmPoultry > 0 ? Math.ceil(fa / vmPoultry) : null;

    const infraPerSlot      = 300;
    const monthlyOpexPoultry = (varPEPoultry / 12) * flock + lab + r.oh + extraFixed;
    const infraCostPoultry  = flock * infraPerSlot;
    const capitalPoultry    = infraCostPoultry + Math.round(monthlyOpexPoultry * 2);
    const npv5Poultry       = [-infraCostPoultry, ...Array(5).fill(ppPoultry * flock)]
      .reduce((acc, v, i) => acc + v / Math.pow(1.10, i), 0);

    const monthlyRevPoultry = (revPEPoultry * flock) / 12;
    let cumP = -infraCostPoultry;
    const cfRowsPoultry = Array.from({ length: 36 }, (_, i) => {
      const m      = i + 1;
      const rev    = m >= 2 ? monthlyRevPoultry : 0;
      const profit = rev - monthlyOpexPoultry;
      cumP += profit;
      const ev = [];
      if (m === 1)                             ev.push("House setup · Batch 1 placed");
      if (m === 2)                             ev.push("Batch 1 harvested · Batch 2 placed");
      if (m > 2 && m % 2 === 0)               ev.push(`Batch ${m / 2} harvested`);
      if (m > 2 && m % 2 === 1)               ev.push(`Batch ${Math.ceil(m / 2)} placed`);
      if ([6, 12, 18, 24, 30, 36].includes(m)) ev.push("Biosecurity audit");
      return { m, mo: MONTHS[(m - 1) % 12], yr: Math.ceil(m / 12), rev, cost: monthlyOpexPoultry, profit, cum: Math.round(cumP), events: ev.join(", ") };
    });

    const firstPositivePoultry = cfRowsPoultry.find(d => d.rev > 0);
    const scaleRowsPoultry = [500, 1000, 2000, 5000, 10000, 20000].map(n => {
      const ls = fa / n;
      const p  = revPEPoultry - varPEPoultry - ls;
      return { n, pp: p, fp: p * n, rev: revPEPoultry * n, roi: p / infraPerSlot, cap: n * infraPerSlot + Math.round(monthlyOpexPoultry * 2), ok: p > 0 };
    });
    const sensRowsPoultry = [-20, -15, -10, -5, 0, 5, 10, 15, 20].map(pct => {
      const adj   = carcass * (1 + pct / 100);
      const rAdj  = batchesPerYear * survivalRate * carcassKg * adj;
      const vmAdj = rAdj - varPEPoultry;
      const pAdj  = rAdj - varPEPoultry - fa / flock;
      const beAdj = vmAdj > 0 ? Math.ceil(fa / vmAdj) : null;
      return { pct, adj, pp: pAdj, fp: pAdj * flock, roi: pAdj / infraPerSlot, be: beAdj };
    });

    return {
      r, flock, lm, carcass,
      lab, ck: carcassKg, lpe: batchesPerYear * survivalRate, fa,
      revPE: revPEPoultry, varPE: varPEPoultry, vm: vmPoultry,
      be: bePoultry, pp: ppPoultry, capital: capitalPoultry, npv5: npv5Poultry,
      scaleRows: scaleRowsPoultry, cfRows: cfRowsPoultry, firstPositive: firstPositivePoultry,
      sensRows: sensRowsPoultry, mc: monthlyOpexPoultry,
      feedCost, healthCost, productionSystem, marketChannel, feedSource,
      yr1: cfRowsPoultry[11]?.cum ?? 0,
      yr2: cfRowsPoultry[23]?.cum ?? 0,
      yr3: cfRowsPoultry[35]?.cum ?? 0,
      isPoultry: true, chickCostPerYear, infraPerSlot,
    };
  }

  // ── Grow-out (buy-and-finish) branch ─────────────────────────────────────────
  if (operationMode === "growout" && r.liveKg !== undefined) {
    const isCattle      = r.liveKg >= 200;
    const cyclesPerYear = isCattle ? 1.3 : 2.2;
    const growDays      = isCattle ? 280 : 165;
    const goWPrice      = weanerPrice ?? (r.weanerPrice ?? (isCattle ? 5500 : 1400));
    const goFeed        = feedOverride   !== null ? feedCost : Math.round((isCattle ? 3500 : 750)  * cyclesPerYear);
    const goHealth      = healthOverride !== null ? healthCost : Math.round((isCattle ? 200  : 80)   * cyclesPerYear);
    const carcassKgGO   = r.liveKg * (r.dressing / 100);
    const revPerAnimal  = (sellWeightKg && livePriceKg) ? sellWeightKg * livePriceKg : carcassKgGO * carcass;
    const annualRevPS   = revPerAnimal * cyclesPerYear;  // revenue per batch slot per year
    const wearerCostPY  = goWPrice * cyclesPerYear;
    const fixedAnnualGO = (lab + r.oh + extraFixed) * 12;
    const labShareGO    = fixedAnnualGO / flock;
    const totalCostPS   = wearerCostPY + goFeed + goHealth + labShareGO;
    const profitPS      = annualRevPS - totalCostPS;
    const roiGO         = profitPS / goWPrice;
    const varMarginPA   = revPerAnimal - goWPrice - goFeed / cyclesPerYear - goHealth / cyclesPerYear;
    const varMarginPY   = varMarginPA * cyclesPerYear;
    const beGO          = varMarginPY > 0 ? Math.ceil(fixedAnnualGO / varMarginPY) : null;
    const weanerBatch   = flock * goWPrice;
    const cycleMonths   = Math.round(12 / cyclesPerYear);
    const growMonths    = Math.round(growDays / 30);
    const monthlyOpex   = (goFeed / 12 + goHealth / 12) * flock + lab + r.oh;
    const workingCap    = Math.round(monthlyOpex * growMonths);
    const capitalGO     = weanerBatch + workingCap;
    const npv5GO        = [-weanerBatch, ...Array(5).fill(profitPS * flock)]
      .reduce((acc, v, i) => acc + v / Math.pow(1.10, i), 0);
    const scalePointsGO = isCattle ? [5, 10, 20, 50, 100, 200] : [10, 20, 50, 100, 200, 500];
    const scaleRowsGO   = scalePointsGO.map(n => {
      const ls = fixedAnnualGO / n;
      const p  = annualRevPS - wearerCostPY - goFeed - goHealth - ls;
      return { n, pp: p, fp: p * n, rev: annualRevPS * n, roi: p / goWPrice, cap: n * goWPrice + workingCap, ok: p > 0 };
    });
    const batchRev = revPerAnimal * flock;
    const cf36GO = Array.from({ length: 36 }, (_, i) => {
      const m = i + 1;
      const isHarv = m % cycleMonths === 0;
      const rev = isHarv ? batchRev : 0;
      return { m, mo: MONTHS[(m - 1) % 12], yr: Math.ceil(m / 12), rev, lambRev: rev, woolRev: 0, cost: monthlyOpex, profit: rev - monthlyOpex, events: isHarv ? "Harvest & restock" : "" };
    });
    let cumGO = -weanerBatch;
    cf36GO.forEach(row => { cumGO += row.profit; row.cum = Math.round(cumGO); });
    const firstPositiveGO = cf36GO.find(row => row.rev > 0) ?? null;
    const sensRowsGO = [-20,-15,-10,-5,0,5,10,15,20].map(pct => {
      const basePrice = livePriceKg ?? carcass;
      const adjP2     = basePrice * (1 + pct / 100);
      const adjRev    = (sellWeightKg && livePriceKg)
        ? sellWeightKg * adjP2 * cyclesPerYear
        : carcassKgGO * adjP2 * cyclesPerYear;
      const adjProfit = adjRev - wearerCostPY - goFeed - goHealth - labShareGO;
      const adjRevPA  = adjRev / cyclesPerYear;
      const adjVm     = (adjRevPA - goWPrice - goFeed / cyclesPerYear - goHealth / cyclesPerYear) * cyclesPerYear;
      const adjBe     = adjVm > 0 ? Math.ceil(fixedAnnualGO / adjVm) : null;
      return { pct, adj: adjP2, pp: adjProfit, fp: adjProfit * flock, roi: adjProfit / goWPrice, be: adjBe };
    });
    return {
      r, flock, lm, carcass, lab, fa: fixedAnnualGO,
      revPE: annualRevPS, varPE: wearerCostPY + goFeed + goHealth, vm: varMarginPY,
      be: beGO, pp: profitPS, capital: capitalGO, npv5: npv5GO,
      scaleRows: scaleRowsGO, cfRows: cf36GO, firstPositive: firstPositiveGO,
      sensRows: sensRowsGO, mc: monthlyOpex,
      feedCost: goFeed, healthCost: goHealth,
      productionSystem, marketChannel, feedSource,
      yr1: cf36GO[11]?.cum ?? 0,
      yr2: cf36GO[23]?.cum ?? 0,
      yr3: cf36GO[35]?.cum ?? 0,
      isGrowOut: true, cyclesPerYear, weanerPrice: goWPrice, growDays,
    };
  }

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
          feedCost, healthCost, productionSystem, marketChannel, feedSource,
          isGrowOut, cyclesPerYear, weanerPrice: goWPrice } = reportData;

  // ── Grow-out mode: completely different narrative ─────────────────────────
  if (isGrowOut) {
    const lmNote  = lm === "owner" ? `owner-operated (${ZAR(lab)}/mo notional)` : `hired worker at ${ZAR(r.hired)}/mo (BCEA 2024)`;
    const s20     = sensRows.find(s => s.pct === -20);
    const verdict = pp > 0
      ? `VIABLE — this ${flock}-slot buy-and-finish operation in ${r.name} generates ${ZAR(pp)}/slot/year net (${PCT(pp / goWPrice)} ROI on weaner capital).`
      : `MARGINAL — at ${flock} batch slots, this operation falls below the ${be ?? "?"}-slot breakeven. Purchase cost and fixed overhead exceed current margin. Scale to at least ${be ?? flock + 10} slots or reduce weaner purchase price before committing capital.`;
    const bankRatingGO = pp > 0 && flock >= (be ?? 0) * 1.2 ? "STRONG" : pp > 0 ? "MODERATE" : "MARGINAL";
    const scaleStr = scaleRows.filter((_,i) => i % 2 === 0)
      .map(rw => `${rw.n} slots: profit/slot ${ZAR(rw.pp)} · batch profit ${ZAR(rw.fp)} · ROI ${PCT(rw.roi)} · ${rw.ok ? "VIABLE" : "BELOW BE"}`)
      .join("\n");
    const sensTable = sensRows.filter(s => [-20,-10,0,10,20].includes(s.pct))
      .map(s => `  ${s.pct>0?"+":""}${s.pct}% (R${s.adj.toFixed(0)}/kg): profit/slot ${ZAR(s.pp)} · ROI ${PCT(s.roi)} · BE ${s.be||"∞"} slots`)
      .join("\n");
    const cfTable = cfRows.filter(r => r.rev > 0 || r.m === 1 || r.m % 12 === 0)
      .map(rw => `Mo ${rw.m} (${rw.mo} Yr${rw.yr}): Rev ${ZAR(rw.rev)} · Cost ${ZAR(rw.cost)} · P&L ${ZAR(rw.profit)} · Cum ${ZAR(rw.cum)}`)
      .join("\n");
    const TITLES = [
      "Executive Summary", "Regional Analysis", "Breed Analysis",
      "Financial Model & Assumptions", "36-Month Cashflow Analysis",
      "Scale & Breakeven Analysis", "Risk Analysis & Sensitivity",
      "Capital Structure & Financing", "Implementation Roadmap",
    ];
    const bodies = [
      `${verdict}

Operation profile: ${flock} ${r.breed} batch slots — buy-and-finish in ${r.name}. ${cyclesPerYear.toFixed(1)} cycles/year (~${Math.round(365/cyclesPerYear)} days/cycle). Production system: ${productionSystem} · Market: ${marketChannel} · Labour: ${lmNote}. Carcass basis: R${carcass}/kg A2 (AgriOrbit Apr 2025).

Key financials: Revenue ${ZAR(revPE)}/slot/yr · Variable cost (incl. weaners) ${ZAR(varPE)}/slot · Variable margin ${ZAR(vm)}/slot · Fixed annual ${ZAR(fa)} · Breakeven ${be ?? "N/A"} slots · Profit/slot ${ZAR(pp)}/yr · Batch profit ${ZAR(pp*flock)}/yr · ROI on weaner capital ${PCT(pp/goWPrice)} · Capital required ${ZAR(capital)} · 5-year NPV at 10%: ${ZAR(npv5)}.

Weaner purchase price used: ${ZAR(goWPrice)}/head. First revenue: Month ${firstPositive?.m ?? cyclesPerYear <= 1.5 ? 7 : 6}.

Three-year trajectory: Year 1 cumulative ${ZAR(yr1)}. Year 2 cumulative ${ZAR(yr2)}. Year 3 cumulative ${ZAR(yr3)}. Sustainable annual batch profit from Year 2: ${ZAR(pp*flock)}/yr.

Land Bank bankability rating: ${bankRatingGO}. ${bankRatingGO === "STRONG" ? "Strong cash-on-cash return with rapid capital turnover." : bankRatingGO === "MODERATE" ? "Viable but scale up — margin improves rapidly as fixed costs are diluted across more slots." : `Below the ${be}-slot breakeven — increase batch size or negotiate lower weaner purchase price before committing capital.`}`,

      `${r.name} — ${r.climate}.

Buy-and-finish context: ${r.name} suits batch operations where market proximity or intensive feed availability makes rapid turnover viable. Carcass price basis: R${carcass}/kg A2. Transport to abattoir: R15–45/animal (calculate exact distance cost).

Market infrastructure: ${r.market}.

${r.tip ? `Provincial insight: ${r.tip}` : ""}`,

      `${r.breed} — buy-and-finish parameters used in this model.

Carcass weight: ${Math.round(r.liveKg * r.dressing / 100)} kg (${r.liveKg} kg live × ${r.dressing}% dressing).
Revenue per animal at R${carcass}/kg: ${ZAR(Math.round(r.liveKg * r.dressing / 100 * carcass))}.
Cycles per year: ${cyclesPerYear.toFixed(1)} (~${Math.round(365/cyclesPerYear)}-day grow period).
Annual revenue per batch slot: ${ZAR(Math.round(revPE))}.

Weaner sourcing: ${BREED_SOURCES[r.breed] || BREED_SOURCES["_default"]}`,

      `Buy-and-finish model assumptions — conservative, Land Bank-style benchmark.

Revenue assumptions:
• Weaner purchase price: ${ZAR(goWPrice)}/head
• Slaughter weight: ${r.liveKg} kg live · Dressing: ${r.dressing}% · Carcass: ${Math.round(r.liveKg * r.dressing / 100)} kg
• Carcass price: R${carcass}/kg A2 (AgriOrbit Apr 2025 — verify before finalising)
• Cycles/year: ${cyclesPerYear.toFixed(1)} (~${Math.round(365/cyclesPerYear)}-day grow-out period)

Cost assumptions:
• Feed: ${ZAR(Math.round(feedCost))}/slot/yr (35% above breeding benchmark for intensive grow diet)
• Health/vet: ${ZAR(Math.round(healthCost))}/slot/yr (25% below breeding — no reproductive costs)
• Labour: ${lmNote}
• Overhead: ${ZAR(r.oh ?? 600)}/mo — water, fuel, repairs, electricity, insurance

Variable margin of ${ZAR(vm)}/slot/year is the critical number. Every slot above breakeven (${be ?? "N/A"}) drops ${ZAR(vm)} straight to profit.`,

      `Buy-and-finish cashflow — ${flock} batch slots at ${cyclesPerYear.toFixed(1)} cycles/year.

Revenue arrives at the end of each grow cycle (~month ${Math.round(12/cyclesPerYear)}).
Monthly operating cost: ${ZAR(Math.round(mc))}.
Initial weaner purchase: ${ZAR(flock * goWPrice)}.

Key cashflow milestones:
${cfTable}

Year 1 cumulative: ${ZAR(yr1)}. Year 2: ${ZAR(yr2)}. Year 3: ${ZAR(yr3)}.

Working capital requirement: ${ZAR(capital)} (weaner purchase + ${Math.round(365/cyclesPerYear)}-day operating costs + 15% contingency).`,

      `Breakeven: ${be ?? "N/A"} batch slots. Variable margin ${ZAR(vm)}/slot/yr covers fixed overhead of ${ZAR(fa)}/yr at this scale.

${scaleStr}

Your position: ${flock} slots${be && flock < be ? ` — ${be - flock} slots below breakeven` : be ? ` — ${flock - be} slots above breakeven` : ""}.

At what scale does this become a primary income? ${vm > 0 ? `${Math.round((fa + 180000) / vm)} slots generate approximately R180,000/year net.` : "Improve variable margin first."}`,

      `1. PRICE RISK (High probability, manageable)
${sensTable}

2. SOURCING RISK
Weaner price volatility is the biggest input cost variable. Lock in supply agreements with 2–3 established farms in ${r.name}. A 10% weaner price increase reduces profit by ${ZAR(Math.round(goWPrice * cyclesPerYear * 0.1))}/slot/yr.

3. WEIGHT RISK
Growth rate shortfalls reduce revenue directly. Weigh animals at intake and at 30-day intervals — remove underperforming animals early.

4. DISEASE RISK
Internal parasites are the primary health cost in grow-out. FAMACHA-based dosing at entry, mid-cycle, and pre-slaughter. Budget: ${ZAR(Math.round(healthCost))}/slot/yr.`,

      `Total capital required: ${ZAR(capital)}.

Weaner purchase component: ${ZAR(flock * goWPrice)} (${flock} × ${ZAR(goWPrice)}/head)
Working capital (${Math.round(365/cyclesPerYear)}-day grow-out period): ${ZAR(capital - flock * goWPrice)}

Financing options:
• Short-term livestock finance (FNB Agri, ABSA Agri): 3–6 month term aligned to grow cycle — most appropriate structure.
• Own capital preferred: ROI of ${PCT(pp/goWPrice)} on weaner cost makes this self-funding within 2 cycles if initial capital is available.
• Land Bank production loan: applicable if integrated with own property and breeding stock.

Cash-on-cash payback: ${pp > 0 ? `${(goWPrice / pp).toFixed(1)} years on weaner capital` : "not yet viable at current scale"}.`,

      `MONTHS 1–2 — Setup:
• Secure pen space, water, and handling equipment
• Source ${flock} weaners at target weight (${Math.round(r.liveKg * 0.4)}–${Math.round(r.liveKg * 0.5)} kg intake)
• Book abattoir slot for target slaughter date

MONTH 1 — Weaner intake:
• Weigh every animal at intake — discard underweight
• Dose at intake: broad-spectrum anthelmintic + vitamin booster
• Record: weight, date, batch number

MONTHS 2–${Math.round(12/cyclesPerYear)} — Grow phase:
• Monitor weight gain weekly (target ${Math.round((r.liveKg - r.liveKg * 0.45) / (365/cyclesPerYear/30))} kg/month)
• FAMACHA score and dose at month 2 and mid-cycle
• Adjust feed if animals fall below growth curve

MONTH ${Math.round(12/cyclesPerYear)} — Harvest:
• Grade animals — only send animals above ${Math.round(r.liveKg * 0.9)} kg to abattoir
• Negotiate directly if volume exceeds 10 animals
• Immediately restock next batch

FIVE ACTIONS THIS WEEK:
1. Get 3 quotes from weaner suppliers in ${r.name} — compare price per kg intake weight
2. Visit target abattoir — confirm booking process and minimum animal requirements
3. Check pen capacity: ${flock} animals at ${Math.round(r.liveKg * 0.5)} kg need ${Math.round(flock * 2.5)} m² minimum
4. Open a dedicated batch account — track cash separately from household
5. Calculate exact transport cost per animal to your nearest abattoir`,
    ];
    return {
      sections: TITLES.map((title, i) => ({ title, body: bodies[i] ?? "" })),
      raw: bodies.join("\n\n"),
      reportData, buyerName, generatedAt: new Date().toISOString(), isSandbox: false,
    };
  }

  const lmNote = lm === "owner"
    ? `owner-operated (${ZAR(lab)}/mo notional — BCEA 2024 hired benchmark ${ZAR(r.hired)}/mo for reference)`
    : `hired worker at ${ZAR(r.hired)}/mo (BCEA 2024 Sectoral Determination + UIF + SDL + housing allowance R800)`;
  const feedNote   = feedCost !== r.feed
    ? `${ZAR(feedCost)}/${T.unit}/yr — client-specified (province benchmark: ${ZAR(r.feed)})`
    : `${ZAR(feedCost)}/${T.unit}/yr — Land Bank extensive benchmark including salt, drought supplement, creep feed`;
  const healthNote = healthCost !== r.health
    ? `${ZAR(healthCost)}/${T.unit}/yr — client-specified (province benchmark: ${ZAR(r.health)})`
    : `${ZAR(healthCost)}/${T.unit}/yr — ProAgri 3-cycle dosing schedule plus foot care and annual vet`;
  const profileLine = `Production system: ${productionSystem} · Market channel: ${marketChannel} · Feed source: ${feedSource}`;
  const s20 = sensRows.find(s => s.pct === -20);
  const s10 = sensRows.find(s => s.pct === -10);
  const scaleVi = scaleRows.find(rw => rw.ok);
  const viabilityVerdict = pp > 0
    ? `VIABLE — this ${flock}-${T.unit} ${r.breed} operation in ${r.name} is profitable at current input prices, generating ${ZAR(pp)}/${T.unit}/year net (${PCT(pp / r.ewePrice)} ROI on stock capital).`
    : `MARGINAL — at ${flock} ${T.units}, this operation falls below the ${be ?? "?"}-${T.unit} breakeven. Fixed costs of ${ZAR(fa)}/yr cannot be covered by the current ${T.group}. Increasing to at least ${be ?? flock + 20} ${T.units} is the single most critical action before committing capital.`;
  const bankRating = pp > 0 && flock >= (be ?? 0) * 1.2 ? "STRONG" : pp > 0 ? "MODERATE" : "MARGINAL";
  const ccGuide = PROV_CC[r.name] || `4–8 ha/${T.unit} depending on rainfall zone — obtain a professional carrying-capacity assessment before stocking`;
  const breedSource = (BREED_SOURCES[r.breed] || BREED_SOURCES["_default"]).replace(/\$\{r => ZAR\(r\.wool\)\}/g, ZAR(r.wool));
  const droughtAdvice = (r.drought === "Severe, frequent" || r.drought === "Frequent")
    ? `Drought is the defining operational risk in ${r.name}. Carry a 90-day supplementary feed reserve at all times — ${ZAR(Math.round(feedCost / 12 * 3 * flock))} for your ${T.group} at current feed cost. AgriSure CP (Comprehensive Plan) coverage is mandatory — register before the production season opens. Set a trigger stocking rate reduction at 50% of normal rainfall.`
    : `Drought is a periodic risk in ${r.name}, manageable with preparation. Maintain a 60-day supplementary feed reserve (${ZAR(Math.round(feedCost / 12 * 2 * flock))} for your ${T.group}). AgriSure CP is strongly recommended. Key discipline: sell the right animals at the right time rather than holding through drought waiting for better prices.`;
  const scaleStr = scaleRows.filter((_, i) => i % 2 === 0)
    .map(rw => `${rw.n} ${T.units}: profit/${T.unit} ${ZAR(rw.pp)} · ${T.group} profit ${ZAR(rw.fp)} · ROI ${PCT(rw.roi)} · ${rw.ok ? (rw.roi > 0.15 ? "STRONG" : "VIABLE") : "BELOW BE"}`)
    .join("\n");
  const sensTable = sensRows.filter(s => [-20, -10, 0, 10, 20].includes(s.pct))
    .map(s => `  ${s.pct > 0 ? "+" : ""}${s.pct}% (R${s.adj.toFixed(0)}/kg): profit/${T.unit} ${ZAR(s.pp)} · ROI ${PCT(s.roi)} · BE ${s.be || "∞"} ${T.units}`)
    .join("\n");
  const primaryIncomeScale = vm > 0 ? Math.round((fa + 180000) / vm) : "N/A";

  const TITLES = [
    "Executive Summary", "Regional Analysis", "Breed Analysis",
    "Financial Model & Assumptions", "36-Month Cashflow Analysis",
    "Scale & Breakeven Analysis", "Risk Analysis & Sensitivity",
    "Capital Structure & Financing", "Implementation Roadmap",
  ];

  const bodies = [
    `${viabilityVerdict}

Operation profile: ${flock} ${r.breed} ${T.units} in ${r.name}. ${profileLine}. Labour: ${lmNote}. Carcass price basis: R${carcass}/kg A2 (AgriOrbit Apr 2025).

Key financials: Revenue ${ZAR(revPE)}/${T.unit}/yr · Variable cost ${ZAR(varPE)}/${T.unit}/yr · Variable margin ${ZAR(vm)}/${T.unit} · Fixed annual ${ZAR(fa)} · Breakeven ${be ?? "N/A"} ${T.units} · Profit/${T.unit} ${ZAR(pp)} · ${T.group.charAt(0).toUpperCase() + T.group.slice(1)} profit ${ZAR(pp * flock)}/yr · ROI on stock capital ${PCT(pp / r.ewePrice)} · Capital required ${ZAR(capital)} · 5-year NPV at 10% discount rate: ${ZAR(npv5)}.

Cashflow turning point: Month ${firstPositive?.m ?? 13} (${firstPositive?.mo ?? "Jan"} Year ${firstPositive?.yr ?? 2}) — first ${T.young} cheque. The preceding 12 months require ${ZAR(Math.abs(yr1))} in working capital before revenue arrives.

Three-year trajectory: Year 1 cumulative ${ZAR(yr1)} (working capital phase). Year 2 cumulative ${ZAR(yr2)}. Year 3 cumulative ${ZAR(yr3)}. From Year 3 onwards: ${ZAR(pp * flock)}/year sustainable ${T.group} profit.

Land Bank bankability rating: ${bankRating}. ${bankRating === "STRONG" ? `This operation covers fixed costs with a ${PCT((flock - (be ?? flock)) / flock)} safety buffer above breakeven.` : bankRating === "MODERATE" ? "Viable but limited margin — a lender will require management experience and a 12-month cash reserve." : `Below the ${be}-${T.unit} breakeven — ${T.group} expansion or cost reduction is required before applying for production finance.`}

Recommended immediate action: ${be && flock < be ? `Increase ${T.group} size to at least ${be} ${T.units} before committing capital.` : `Proceed with the ${flock}-${T.unit} operation, securing a revolving credit facility of ${ZAR(Math.round(Math.abs(yr1) * 1.1))} to bridge the working capital gap to Month ${firstPositive?.m ?? 13}.`}`,

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
• Effective ${T.youngs} sold/${T.unit}/yr: ${((r.lambing / 100) * (r.survival / 100) * 0.85).toFixed(2)} (85% selection rate applied)
• Slaughter weight: ${r.liveKg}kg live · Dressing: ${r.dressing}% · Carcass: ${(r.liveKg * r.dressing / 100).toFixed(1)}kg
• Wool income: ${r.wool > 0 ? ZAR(r.wool) + `/${T.unit}/yr` : "R0 — hair breed, zero shearing cost and shearing labour requirement"}

Revenue per ${T.unit} at R${carcass}/kg A2: ${ZAR(revPE)} (${T.young} carcass ${ZAR(Math.round(((r.lambing / 100) * (r.survival / 100) * 0.85) * (r.liveKg * r.dressing / 100) * carcass))}${r.wool > 0 ? ` + wool ${ZAR(r.wool)}` : ""}).

Where to source ${r.breed} in ${r.name}: ${breedSource}

At ${flock} ${T.units}, a commercial flock is appropriate — no reason to maintain a stud. Use performance-tested stud rams (1:35 ratio = ${Math.ceil(flock / 35)} rams) sourced from a recording-scheme stud. Stud overhead adds cost without proportionate benefit below 500 ${T.units}.

Health priorities for ${r.breed} in ${r.name}: ${r.parasites !== "Very low" && r.parasites !== "Low" ? `Internal parasite management is the primary ongoing cost driver. Implement FAMACHA-based dosing — this reduces anthelmintic use by 30–40% and delays resistance development. The health budget of ${ZAR(healthCost)}/${T.unit}/yr assumes 3 strategic dosings per year. Maintain a ${ZAR(Math.round(healthCost * 0.5 * flock))} contingency for outbreak years.` : `Low parasite pressure in ${r.name} reduces health costs. Maintain prophylactic dosing at minimum 2 cycles/year and monitor for Bluetongue in summer months.`}

HIDDEN INCOME STREAM — Carbon credits + direct freezer-lamb sales:
Most sheep operations in ${r.name} leave two significant income streams untapped. First: register your veld under a voluntary carbon programme (Verra VCS or BioCarbon Fund at agricarbon.co.za for the SA verification pathway). Holistic planned grazing on 500ha of degraded veld generates R22,500–R60,000/year in verified carbon credits — pure income addition with no reduction in livestock numbers, no extra land required. Second: direct freezer-lamb sales to urban consumers at R90–110/kg deadweight vs R52/kg abattoir price add R1,500–R2,300 per animal. A WhatsApp order group in your nearest town and a licensed mobile abattoir booking (R250–R400/animal) is the entire infrastructure required. Start with 5% of your crop — price discovery is immediate.`,

    `This model applies a conservative, Land Bank-style extensive farming benchmark.

Revenue assumptions:
• Lambing rate: ${r.lambing}% — ${r.name} commercial benchmark
• Survival to weaning: ${r.survival}%
• Live weight at slaughter: ${r.liveKg}kg — market standard for ${r.breed} in ${r.name}
• Dressing percentage: ${r.dressing}% — A2 grade standard
• Carcass price: R${carcass}/kg A2 (AgriOrbit Apr 2025 — verify current price before finalising finance)
• Wool: ${r.wool > 0 ? ZAR(r.wool) + `/${T.unit}/yr — clip weight × current Cape Wools A-grade price` : "R0 — hair breed"}

Cost assumptions:
• Feed: ${feedNote}
• Health: ${healthNote}
• Replacement: ${r.rep}% annually at ${ZAR(r.ewePrice)}/${T.unit} = ${ZAR(Math.round(r.ewePrice * r.rep / 100))}/${T.unit}/yr
• Overhead: ${ZAR(r.oh)}/mo — water, fuel, repairs, electricity, insurance
• Labour: ${lmNote}

The variable margin of ${ZAR(vm)}/${T.unit} is the most important number in this model. At ${flock} ${T.units}, fixed costs consume ${ZAR(Math.round(fa / flock))}/${T.unit}/yr. At 200 ${T.units}, fixed cost per ${T.unit} drops to ${ZAR(Math.round(fa / 200))}. Every ${T.unit} above breakeven drops ${ZAR(vm)} straight to profit.

Most likely wrong assumption: Carcass price. A ±R10/kg swing changes profit/${T.unit} by ${ZAR(Math.round(((r.lambing / 100) * (r.survival / 100) * 0.85) * (r.liveKg * r.dressing / 100) * 10))} — review the sensitivity analysis in Section 7.`,

    `The cashflow story has three distinct phases.

Phase 1 — Working capital (Months 1–${(firstPositive?.m ?? 13) - 1}): Every month is cash-negative. Monthly operating cost: ${ZAR(Math.round(mc))}. At Month 12 the cumulative position is ${ZAR(yr1)} — this is the working capital investment in your first crop, not a loss.

Phase 2 — First revenue (Month ${firstPositive?.m ?? 13}, ${firstPositive?.mo ?? "January"} Year ${firstPositive?.yr ?? 2}): First ${T.young} cheque. With ${flock} ${T.units} at ${r.lambing}% lambing, approximately ${Math.round(flock * (r.lambing / 100) * (r.survival / 100) * 0.5)} ${T.youngs} available in the first batch. At R${carcass}/kg and ${(r.liveKg * r.dressing / 100).toFixed(1)}kg carcass. Year 2 cumulative: ${ZAR(yr2)}.

Phase 3 — Normalisation (Year 3+): Annual revenue ${ZAR(Math.round(revPE * flock))}, annual costs ${ZAR(Math.round((varPE + fa / flock) * flock))}, sustainable free cash ${ZAR(Math.round(pp * flock))}/yr. Year 3 cumulative: ${ZAR(yr3)}.

${pp < 0 ? `WARNING: At ${flock} ${T.units}, this operation never turns cumulative-positive in 36 months. Increase to at least ${be ?? flock + 20} ${T.units} before proceeding.` : `The operation ${yr2 >= 0 ? "recovers working capital by Year 2" : "requires the full 36-month period to recover working capital — a long-term view is required"}.`}

Working capital requirement: ${ZAR(Math.round(Math.abs(yr1) * 1.15))} (Year 1 drawdown + 15% contingency).

Best bridging instrument: 12-month revolving credit facility from FNB Agri or ABSA Agri, with monthly drawdowns and repayment timed to the January/February ${T.young} sales. Avoid fixed-term loans for working capital.`,

    `Breakeven: ${be ?? "N/A"} ${T.units}. Variable margin ${ZAR(vm)}/${T.unit} covers fixed costs of ${ZAR(fa)}/yr at this scale.

Scale table (at current input prices):
${scaleStr}

${scaleVi ? `First viable scale: ${scaleVi.n} ${T.units} — ${T.group} profit ${ZAR(scaleVi.fp)}/yr, ROI ${PCT(scaleVi.roi)}.` : "No viable scale found at current input prices — review cost structure."}

Your current position: ${flock} ${T.units} · ${flock >= (be ?? Infinity) ? `${flock - (be ?? 0)} ${T.units} above breakeven (${PCT((flock - (be ?? 0)) / flock)} safety buffer)` : `${(be ?? flock) - flock} ${T.units} below breakeven`}.

At what scale does this become a primary income? ${primaryIncomeScale === "N/A" ? "Not achievable at current variable margin — review input costs." : `${primaryIncomeScale} ${T.units} generate approximately R180,000/year net.`}

Most important reinvestment decision in Year 3: retain the best 20% of ${T.youngs} instead of selling them — grows your ${T.group} by ${Math.round(flock * (r.lambing / 100) * (r.survival / 100) * 0.2)} ${T.units}/year at zero purchase cost.`,

    `1. PRICE RISK (High probability, manageable with planning)
${sensTable}
At -20% (R${(carcass * 0.8).toFixed(0)}/kg): profit/${T.unit} ${ZAR(s20?.pp ?? 0)} — ${(s20?.pp ?? 0) > -500 ? "survivable with a cash reserve" : "severe — emergency cost reduction required"}.
Mitigation: forward-sale relationship with your nearest abattoir (some accept 3-month forward contracts).

2. DROUGHT RISK (${r.drought} in ${r.name})
${droughtAdvice}

3. DISEASE RISK
Key threats for ${r.breed} in ${r.name}: ${r.parasites !== "Very low" ? "internal parasites (primary cost driver — " + r.parasites + " pressure)" : "low parasite pressure — maintain prevention"}, Bluetongue (notifiable, vaccine available), Rift Valley Fever (cyclical outbreak risk), foot rot (wet conditions). Health budget ${ZAR(healthCost)}/${T.unit}/yr covers prevention — budget ${ZAR(Math.round(healthCost * 0.5 * flock))} contingency for outbreak years.

4. MARKET RISK
${r.market}. Develop at least 2 active sale relationships — never be 100% dependent on a single buyer.

5. MANAGEMENT RISK (Most underestimated)
The most common cause of sheep operation failure in ${r.name} is under-capitalisation, not drought or disease. Operations that start without sufficient working capital are forced to sell animals at the wrong biological time.

Recommended contingency reserve: ${ZAR(Math.round(fa * 0.5))} minimum (6 months fixed costs), held separately.`,

    `Total capital required: ${ZAR(capital)}.

Stock component: ${ZAR(flock * r.ewePrice)} (${flock} ${T.units} × ${ZAR(r.ewePrice)}/${T.unit})
Route: Land Bank production loan, typically prime + 1.5–2.5%, 3–5 year term, quarterly repayments aligned to ${T.young} sales. Security: notarial livestock bond, cession of fire and multi-peril insurance, personal surety. Minimum own contribution: 30% (${ZAR(Math.round(flock * r.ewePrice * 0.3))}).

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
• Fence 4 camps minimum for ${flock} ${T.units} (7-day rotational grazing)
• Open a dedicated farm bank account
• Apply for Land Bank / FNB Agri production loan NOW (8–14 week process)
• Register with your local veterinarian

MONTH 3 — Stock procurement:
• Source ${r.breed} ${T.units} from ${r.name} livestock auctions or registered breeders
• Price benchmark: ${ZAR(r.ewePrice)}/${T.unit} for certified breeding-status animals
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
  const cfTable = cfRows.filter(row => row.rev > 0 || row.m === 1 || row.m % 12 === 0)
    .map(rw => `Mo ${rw.m} (${rw.mo} Yr${rw.yr}): Rev ${ZAR(rw.rev)} · Cost ${ZAR(rw.cost)} · P&L ${ZAR(rw.profit)} · Cum ${ZAR(rw.cum)}`)
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

First honey harvest: Month ${harvestMo} (${harvestName}) — ${r.name}'s primary forage peak. Establishment phase: ${harvestMo - 1} months of outgoings before first harvest revenue. Working capital required before first harvest: ${ZAR(Math.round((harvestMo - 1) * mc * 1.15))}. First cash-positive month: Month ${firstPositive?.m ?? harvestMo}.

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

Phase 1 — Establishment (Months 1–${harvestMo - 1}): Hives build up strength — feed, health treatments, inspections, equipment maintenance. No honey income. Monthly operating cost: ${ZAR(Math.round(mc))}. This phase is shorter than any livestock breeding alternative: bees deliver first revenue in Month ${harvestMo}, versus 12–18+ months for a new breeding herd. Establishment outlay: ${ZAR(Math.round((harvestMo - 1) * mc))}.

Phase 2 — First harvest (Month ${harvestMo}, ${harvestName} Year 1): First honey extraction. With ${flock} hives averaging ${r.liveKg}kg each, the first harvest yields approximately ${Math.round(flock * r.liveKg * 0.5)} kg (50% of annual yield — the balance in the second flush). At R${carcass}/kg, this is a significant single cash event. Year 2 cumulative: ${ZAR(yr2)}.

Phase 3 — Normal production (Year 2+): ${flock} hives × ${r.liveKg}kg/hive = ${Math.round(flock * r.liveKg)} kg honey/yr. Annual revenue ${ZAR(Math.round(revPE * flock))} · Annual costs ${ZAR(Math.round((varPE + fa / flock) * flock))}. Year 3 cumulative: ${ZAR(yr3)}.

Month-by-month cashflow (harvest months and year-ends shown):
${cfTable}

${pp < 0 ? `WARNING: At ${flock} hives, this apiary never achieves a cumulative-positive position in 36 months. Increase to at least ${be ?? flock + 10} hives before proceeding.` : `The apiary ${yr2 >= 0 ? "recovers all working capital by Year 2" : "requires the full 36-month period to recover working capital"}.`}

Working capital required before first harvest: ${ZAR(Math.round((harvestMo - 1) * mc * 1.15))} — lower than equivalent livestock operations of the same revenue scale, making beekeeping one of the most accessible farming enterprises to self-fund from startup.

Revenue concentration: Honey income arrives in 1–2 events per year. Budget monthly expenses from a revolving savings buffer between harvests. Many commercial beekeepers smooth cash flow with nuc and queen sales during the off-honey season — the primary mechanism for year-round positive cash flow.`,

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

Critical point: unlike livestock, hive count can be grown organically through your own splits at near-zero cost. A strong colony preparing swarm cells in spring (September–November) can be split to produce a saleable nucleus colony — the parent colony rebuilds queen-right within 4 weeks without losing a honey season. A ${flock}-hive apiary can realistically add ${Math.max(Math.round(flock * 0.25), 4)}–${Math.max(Math.round(flock * 0.40), 7)} hives per split-season at zero additional stock cost, reaching approximately ${Math.round(flock * 1.33)} hives by Year 2. Any nuc not needed for your own expansion sells for R800–R1,500 — a built-in off-season revenue stream.`,

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
${r.subspecies === "capensis"
  ? `Apis mellifera capensis (Cape honey bee) absconds at a significantly lower rate than scutellata — capensis workers can initiate emergency queen rearing via thelytoky, giving the colony resilience under stress. Primary colony-loss risk for ${r.name} operations is spring swarming (September–November) rather than absconding. Manage with timely supering, regular swarm-cell inspections, and walk-away splits to capture and monetise swarm energy rather than losing it.`
  : r.subspecies === "hybrid_zone"
  ? `The Eastern Cape hybrid zone produces variable colony behaviour. Operations in the south and coastal strip (near-capensis genetics) experience gentler bees with lower absconding tendency; northern and inland operations trend toward scutellata — more defensive and quicker to abscond under heat, drought, or disturbance. Source local bees for your specific district and maintain water within 100m of every apiary site year-round.`
  : `African honey bees (Apis mellifera scutellata) have a strong evolved tendency to abscond under stress — drought, pesticide exposure, forage failure, overcrowding, or repeated rough handling. This is a survival strategy, not a management failure, but it means permanent colony loss. Mitigation: maintain water within 100m of every site, avoid inspections during peak midday heat, add supers before overcrowding triggers swarm preparation, and replace queen stock from any colony that has absconded.`}

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
          feedCost, healthCost, productionSystem, marketChannel, feedSource,
          isGrowOut, cyclesPerYear, weanerPrice: goWPrice } = reportData;

  // ── Grow-out (buy-and-finish) mode ────────────────────────────────────────
  if (isGrowOut) {
    const lmNote  = lm === "owner" ? `owner-operated (${ZAR(lab)}/mo notional)` : `hired worker at ${ZAR(r.hired)}/mo (BCEA 2024)`;
    const carcassKgGO = Math.round(r.liveKg * r.dressing / 100);
    const verdict = pp > 0
      ? `VIABLE — this ${flock}-slot buy-and-finish cattle operation in ${r.name} generates ${ZAR(pp)}/slot/year net (${PCT(pp/goWPrice)} ROI on calf capital).`
      : `MARGINAL — at ${flock} slots, this operation falls below the ${be ?? "?"}-slot breakeven. Increase to at least ${be ?? flock + 5} slots or reduce calf purchase price before committing capital.`;
    const bankRatingGO = pp > 0 && flock >= (be ?? 0) * 1.2 ? "STRONG" : pp > 0 ? "MODERATE" : "MARGINAL";
    const scaleStr = scaleRows.filter((_,i) => i % 2 === 0)
      .map(rw => `${rw.n} slots: profit/slot ${ZAR(rw.pp)} · batch profit ${ZAR(rw.fp)} · ROI ${PCT(rw.roi)} · ${rw.ok ? "VIABLE" : "BELOW BE"}`)
      .join("\n");
    const sensTable = sensRows.filter(s => [-20,-10,0,10,20].includes(s.pct))
      .map(s => `  ${s.pct>0?"+":""}${s.pct}% (R${s.adj.toFixed(0)}/kg): profit/slot ${ZAR(s.pp)} · ROI ${PCT(s.roi)} · BE ${s.be||"∞"} slots`)
      .join("\n");
    const TITLES = [
      "Executive Summary", "Regional Analysis", "Breed Analysis",
      "Financial Model & Assumptions", "36-Month Cashflow Analysis",
      "Scale & Breakeven Analysis", "Risk Analysis & Sensitivity",
      "Capital Structure & Financing", "Implementation Roadmap",
    ];
    const bodies = [
      `${verdict}

Operation: ${flock} ${r.breed} calf slots — buy-and-finish in ${r.name}. ${cyclesPerYear.toFixed(1)} cycles/year (~${Math.round(365/cyclesPerYear)}-day grow period). System: ${productionSystem} · Market: ${marketChannel} · Labour: ${lmNote}. Carcass basis: R${carcass}/kg.

Key financials: Revenue ${ZAR(revPE)}/slot/yr · Variable cost (incl. calves) ${ZAR(varPE)}/slot · Variable margin ${ZAR(vm)}/slot · Fixed annual ${ZAR(fa)} · Breakeven ${be ?? "N/A"} slots · Profit/slot ${ZAR(pp)}/yr · Batch profit ${ZAR(pp*flock)}/yr · ROI ${PCT(pp/goWPrice)} on calf capital · Capital required ${ZAR(capital)} · 5-yr NPV: ${ZAR(npv5)}.

Calf purchase price: ${ZAR(goWPrice)}/head. Slaughter weight: ${r.liveKg} kg · Carcass: ${carcassKgGO} kg.

Three-year trajectory: Year 1 ${ZAR(yr1)} · Year 2 ${ZAR(yr2)} · Year 3 ${ZAR(yr3)}. Sustainable batch profit from Year 2: ${ZAR(pp*flock)}/yr.

Land Bank bankability: ${bankRatingGO}. ${bankRatingGO !== "MARGINAL" ? "Short-term livestock finance aligned to grow cycle is the appropriate instrument." : `Scale to ${be} slots minimum before approaching lenders.`}`,

      `${r.name} — ${r.climate}.\n\nMarket infrastructure: ${r.market}.\n\n${r.tip ? `Provincial insight: ${r.tip}` : ""}`,

      `${r.breed} — buy-and-finish parameters.\n\nCarcass: ${carcassKgGO} kg (${r.liveKg} kg × ${r.dressing}%). Revenue/animal at R${carcass}/kg: ${ZAR(carcassKgGO * carcass)}.\n\n${CATTLE_BREED_SOURCES[r.breed] || CATTLE_BREED_SOURCES["_default"]}`,

      `Buy-and-finish model assumptions.\n\n• Calf purchase: ${ZAR(goWPrice)}/head\n• Cycles/year: ${cyclesPerYear.toFixed(1)} (~${Math.round(365/cyclesPerYear)} days)\n• Feed: ${ZAR(Math.round(feedCost))}/slot/yr (intensive grow diet)\n• Health: ${ZAR(Math.round(healthCost))}/slot/yr (tick control, vaccinations)\n• Labour: ${lmNote}\n• Overhead: ${ZAR(r.oh ?? 600)}/mo\n\nVariable margin ${ZAR(vm)}/slot/yr — every slot above ${be ?? "N/A"} is pure profit.`,

      `36-month cashflow — revenue arrives every ~${Math.round(12/cyclesPerYear)} months.\n\nMonthly operating cost: ${ZAR(Math.round(mc))}. Initial calf purchase: ${ZAR(flock * goWPrice)}.\n\nYear 1 cumulative: ${ZAR(yr1)}. Year 2: ${ZAR(yr2)}. Year 3: ${ZAR(yr3)}.\n\nWorking capital required: ${ZAR(capital)}.`,

      `Breakeven: ${be ?? "N/A"} slots.\n\n${scaleStr}`,

      `Price sensitivity (carcass price ±%):\n${sensTable}\n\nPurchase price risk: R500 increase in calf price reduces profit by ${ZAR(Math.round(500 * cyclesPerYear))}/slot/yr — negotiate forward supply agreements.`,

      `Total capital: ${ZAR(capital)}.\n\nCalf purchase: ${ZAR(flock * goWPrice)}\nWorking capital (${Math.round(365/cyclesPerYear)}-day period): ${ZAR(capital - flock * goWPrice)}\n\nBest instrument: short-term livestock finance (FNB Agri, ABSA Agri) with 6–9 month term aligned to harvest. Cash-on-cash payback: ${pp > 0 ? `${(goWPrice/pp).toFixed(1)} years` : "not yet viable"}.`,

      `Month 1 — Calf intake:\n• Source ${flock} weaner calves at ${ZAR(goWPrice)}/head\n• Weigh, tag, dose on arrival\n• 14-day quarantine before joining existing animals\n\nMonths 2–${Math.round(12/cyclesPerYear)} — Grow phase:\n• Target ${Math.round((r.liveKg * 0.55) / (365/cyclesPerYear/30))} kg/month gain\n• Weekly tick count inspection — treat immediately if >10 ticks/animal\n• Tick control critical in ${r.name}\n\nMonth ${Math.round(12/cyclesPerYear)} — Harvest & restock:\n• Grade and book abattoir 2–3 weeks in advance\n• Immediately restock next batch\n\nFIVE ACTIONS:\n1. Source calves — 3 supplier quotes in ${r.name}\n2. Book abattoir slot\n3. Verify pen capacity (${flock} animals, ${Math.round(flock * 5)} m² minimum)\n4. Open dedicated batch account\n5. Register for tick control programme with local vet`,
    ];
    return {
      sections: TITLES.map((title, i) => ({ title, body: bodies[i] ?? "" })),
      raw: bodies.join("\n\n"),
      reportData, buyerName, generatedAt: new Date().toISOString(), isSandbox: false,
    };
  }

  const calvesPerYear = Math.round(flock * (r.lambing / 100) * (r.survival / 100) * 0.85);
  const carcassKg     = Math.round(r.liveKg * r.dressing / 100);
  const revPerAnimal  = Math.round(carcassKg * carcass);
  const lmNote = lm === "owner"
    ? `owner-operated (${ZAR(lab)}/mo notional — BCEA 2024 hired benchmark ${ZAR(r.hired)}/mo)`
    : `hired manager at ${ZAR(r.hired)}/mo (BCEA 2024 Farm Worker Sectoral Determination)`;
  const feedNote   = feedCost !== r.feed
    ? `${ZAR(feedCost)}/${T.unit}/yr — client-specified (province benchmark: ${ZAR(r.feed)})`
    : `${ZAR(feedCost)}/${T.unit}/yr — Land Bank extensive benchmark including salt licks, drought supplement, and creep feed for calves. Actual costs in drought years can reach ${ZAR(Math.round(feedCost * 2))}/${T.unit}.`;
  const healthNote = healthCost !== r.health
    ? `${ZAR(healthCost)}/${T.unit}/yr — client-specified (province benchmark: ${ZAR(r.health)})`
    : `${ZAR(healthCost)}/${T.unit}/yr — covers tick control, dipping/pour-on, annual vaccinations, pregnancy diagnosis, and emergency vet allowance. High-tick-pressure environments regularly reach ${ZAR(Math.round(healthCost * 1.4))}.`;
  const profileLine = `Production system: ${productionSystem} · Market channel: ${marketChannel} · Feed source: ${feedSource}`;
  const s20 = sensRows.find(s => s.pct === -20);
  const s10 = sensRows.find(s => s.pct === -10);
  const scaleVi = scaleRows.find(rw => rw.ok);
  const viabilityVerdict = pp > 0
    ? `VIABLE — this ${flock}-${T.unit} ${r.breed} operation in ${r.name} is profitable at current input prices, generating ${ZAR(pp)}/${T.unit}/year net (${PCT(pp / r.ewePrice)} ROI on ${T.unit} capital).`
    : `MARGINAL — at ${flock} ${T.units}, this ${T.group} falls below the ${be ?? "?"}-${T.unit} breakeven. Fixed costs of ${ZAR(fa)}/yr cannot be covered at this scale. Increasing to at least ${be ?? flock + 10} ${T.units} is the single most critical action before committing capital.`;
  const bankRating = pp > 0 && flock >= (be ?? 0) * 1.2 ? "STRONG" : pp > 0 ? "MODERATE" : "MARGINAL";
  const ccGuide = CATTLE_CC[r.name] || `4–8 ha/LSU depending on veld type — obtain a professional carrying-capacity assessment before stocking`;
  const breedSource = (CATTLE_BREED_SOURCES[r.breed] || CATTLE_BREED_SOURCES["_default"]);
  const droughtAdvice = (r.drought === "Severe, frequent" || r.drought === "Frequent" || r.drought === "Very frequent")
    ? `Drought is the defining operational risk in ${r.name}. Carry a 90-day emergency feed reserve at all times — ${ZAR(Math.round(feedCost / 12 * 3 * flock))} for your herd at current feed cost. Set a clear destocking trigger at 50% of normal rainfall: selling cattle at 70c in the rand during drought is far cheaper than feeding them at full cost until they die. AgriSure CP (Comprehensive Plan) coverage is mandatory — register before the season opens. Drought camps (kept completely rested until emergency) add carrying capacity resilience at near-zero cost.`
    : `Drought management is important but less acute in ${r.name}. Maintain a 60-day feed reserve (${ZAR(Math.round(feedCost / 12 * 2 * flock))} for your herd). AgriSure CP is recommended. Key discipline: move cattle off depleted camps before overgrazing damages veld — recovery from overgrazing takes 3–5 years.`;
  const scaleStr = scaleRows.filter((_, i) => i % 2 === 0)
    .map(rw => `${rw.n} ${T.units}: profit/${T.unit} ${ZAR(rw.pp)} · ${T.group} profit ${ZAR(rw.fp)} · ROI ${PCT(rw.roi)} · ${rw.ok ? (rw.roi > 0.12 ? "STRONG" : "VIABLE") : "BELOW BE"}`)
    .join("\n");
  const sensTable = sensRows.filter(s => [-20, -10, 0, 10, 20].includes(s.pct))
    .map(s => `  ${s.pct > 0 ? "+" : ""}${s.pct}% (R${s.adj.toFixed(0)}/kg): profit/${T.unit} ${ZAR(s.pp)} · ROI ${PCT(s.roi)} · BE ${s.be || "∞"} ${T.units}`)
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

Operation profile: ${flock} ${r.breed} ${T.units} in ${r.name}. ${profileLine}. Labour: ${lmNote}. Carcass price basis: R${carcass}/kg A2 dressed beef (AgriOrbit Apr 2025 benchmark).

Production economics:
• Calving rate: ${r.lambing}% · Weaning survival: ${r.survival}% · ${T.youngs.charAt(0).toUpperCase() + T.youngs.slice(1)} marketed per 100 ${T.units}: ${Math.round(r.lambing * r.survival * 0.85 / 100)}
• Live weight: ${r.liveKg}kg · Dressing: ${r.dressing}% · Carcass: ${carcassKg}kg · Revenue/animal: ${ZAR(revPerAnimal)}
• Revenue/${T.unit}/yr: ${ZAR(revPE)} · Variable cost/${T.unit}: ${ZAR(varPE)} · Variable margin/${T.unit}: ${ZAR(vm)}
• Fixed annual: ${ZAR(fa)} · Breakeven: ${be ?? "N/A"} ${T.units} · Profit/${T.unit}: ${ZAR(pp)} · ${T.group.charAt(0).toUpperCase() + T.group.slice(1)} profit: ${ZAR(pp * flock)}/yr
• ROI on ${T.unit} capital: ${PCT(pp / r.ewePrice)} · Capital required: ${ZAR(capital)} · 5-year NPV (10% discount): ${ZAR(npv5)}

First revenue: Month ${firstPositive?.m ?? 13} (${firstPositive?.mo ?? "Jan"} Year ${firstPositive?.yr ?? 2}) — first ${T.youngs} reach slaughter/weaner weight. The preceding 12 months require ${ZAR(Math.abs(yr1))} in working capital before a single rand of cattle income is received.

Three-year trajectory: Year 1 cumulative ${ZAR(yr1)} (entirely negative — working capital phase). Year 2 cumulative ${ZAR(yr2)}. Year 3 cumulative ${ZAR(yr3)}. From Year 3: ${ZAR(pp * flock)}/year sustainable ${T.group} profit.

Land Bank bankability rating: ${bankRating}. ${bankRating === "STRONG" ? `This operation covers its fixed costs with a ${PCT((flock - (be ?? flock)) / flock)} ${T.group}-size buffer above breakeven and presents a credible repayment schedule aligned to ${T.young} sales.` : bankRating === "MODERATE" ? "Viable at current scale but limited margin — a lender will require management experience and a 12-month cash reserve." : `Below the ${be}-${T.unit} breakeven — scale up or reduce costs before approaching a lender for production finance.`}

Recommended immediate action: ${be && flock < be ? `Increase ${T.group} to at least ${be} ${T.units} before committing capital — at ${flock} ${T.units} the operation cannot cover fixed costs.` : `Proceed with the ${flock}-${T.unit} operation, securing a revolving credit facility of ${ZAR(Math.round(Math.abs(yr1) * 1.1))} to bridge the working capital gap to Month ${firstPositive?.m ?? 13}.`}`,

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
• Secondary income: ${r.wool > 0 ? ZAR(r.wool) + `/${T.unit}/yr (hide or by-product)` : "R0 — no secondary product income modelled"}
• Revenue per ${T.unit} at R${carcass}/kg A2: ${ZAR(revPE)}

${r.breed} genetic priorities for ${r.name}: Tick tolerance (measured by Tick Resistance Score in modern EBVs), heat adaptation (critical above 35°C — European breeds lose appetite and condition), and maternal fertility (calving interval below 370 days). Bull selection drives improvement across your entire cow herd — one excellent bull improves ${Math.ceil(flock / 28)} × 5-year calf crops = ${Math.ceil(flock / 28) * 5} additional calves at zero extra cost.

Where to source ${r.breed} in ${r.name}: ${breedSource}

At ${flock} ${T.units}, manage as a straight commercial herd — no reason to maintain a stud at this scale. Use production-tested bulls (1:25–30 ${T.unit} ratio = ${Math.ceil(flock / 28)} bulls for your ${T.group}) sourced from a recording-scheme stud. Leasing bulls rather than purchasing is viable if capital is constrained: a proven commercial bull is available for lease at R2,500–R4,500/month during mating season from stud operations in ${r.name}.

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
• Replacement: ${r.rep}% annually at ${ZAR(r.ewePrice)}/${T.unit} = ${ZAR(Math.round(r.ewePrice * r.rep / 100))}/${T.unit}/yr
• Overhead: ${ZAR(r.oh)}/mo — water, vehicle, maintenance, electricity, insurance
• Labour: ${lmNote}

The variable margin of ${ZAR(vm)}/${T.unit} is the key number. Fixed costs consume ${ZAR(Math.round(fa / flock))}/${T.unit}/yr at ${flock} ${T.units}. Every ${T.unit} above breakeven drops ${ZAR(vm)} to profit — the dilution economics of fixed costs make scale the primary lever.

Most likely wrong assumption: Calving rate. A 5% improvement in calving rate (from ${r.lambing}% to ${r.lambing + 5}%) adds ${Math.round(flock * 0.05 * (r.survival / 100) * 0.85)} calves per year at zero extra fixed cost — worth ${ZAR(Math.round(flock * 0.05 * (r.survival / 100) * 0.85 * revPerAnimal))} in additional annual revenue.`,

    `Cattle cash flow has three distinct phases.

Phase 1 — Working capital (Months 1–12): Cows are purchased, mated, and carrying calves. Every month is cash-negative. Monthly operating cost: ${ZAR(Math.round(mc))} (labour, overhead, feed, health, replacement reserve). At Month 12 the cumulative position is ${ZAR(yr1)} — this is the biological investment in your first calf crop. Plan for it deliberately; operations that run out of working capital before first calf sales sell their breeding herd at the worst possible time.

Phase 2 — First revenue (Month ${firstPositive?.m ?? 13}, ${firstPositive?.mo ?? "January"} Year ${firstPositive?.yr ?? 2}): First ${T.young} cheque. With ${flock} ${T.units} at ${r.lambing}% calving, approximately ${Math.round(flock * (r.lambing / 100) * (r.survival / 100) * 0.5)} ${T.youngs} available in the first sale group (50% of crop). At R${carcass}/kg and ${carcassKg}kg carcass, this is a substantial single cash event. Year 2 cumulative: ${ZAR(yr2)}.

Phase 3 — Normal production (Year 3+): Annual revenue ${ZAR(Math.round(revPE * flock))}, annual costs ${ZAR(Math.round((varPE + fa / flock) * flock))}, sustainable free cash ${ZAR(Math.round(pp * flock))}/yr. Year 3 cumulative: ${ZAR(yr3)}.

${pp < 0 ? `WARNING: At ${flock} ${T.units}, this operation never achieves cumulative-positive in 36 months. Increase to at least ${be ?? flock + 10} ${T.units} before proceeding.` : `The operation ${yr2 >= 0 ? "recovers all working capital by Year 2" : "requires the full 36-month period to recover working capital"}.`}

Working capital requirement: ${ZAR(Math.round(Math.abs(yr1) * 1.15))} (Year 1 drawdown + 15% contingency). At ${ZAR(r.ewePrice)}/cow, the high per-unit capital cost of cattle means the absolute working capital requirement is substantial — this is the primary reason cattle operations need formal production lending rather than personal savings bridges.

Recommended bridging instrument: 12-month revolving credit facility from FNB Agri or ABSA Agri, drawdown monthly, repay after first calf sales. Quarterly interest-only payments during the first year. Never use fixed-term loans for cattle working capital — the seasonal revenue pattern requires revolving facility flexibility.`,

    `Breakeven: ${be ?? "N/A"} ${T.units}. Variable margin ${ZAR(vm)}/${T.unit} covers fixed costs of ${ZAR(fa)}/yr at this scale.

Scale table (at current input prices):
${scaleStr}

${scaleVi ? `First viable scale: ${scaleVi.n} ${T.units} — ${T.group} profit ${ZAR(scaleVi.fp)}/yr, ROI ${PCT(scaleVi.roi)}.` : "No viable scale found at current input prices — review cost structure before committing capital."}

Commercial viability thresholds for SA beef operations:
• Under 20 ${T.units}: sub-economic — fixed costs cannot be diluted, land use inefficient
• 20–50 ${T.units}: marginal commercial — viable with zero debt and minimal overhead
• 50–150 ${T.units}: commercially viable — full-time operator income possible
• 150–300 ${T.units}: strong commercial — supports hired management and debt service
• 300+ ${T.units}: primary income at scale — optimal for Land Bank production finance

Your current position: ${flock} ${T.units} · ${flock >= (be ?? Infinity) ? `${flock - (be ?? 0)} ${T.units} above breakeven (${PCT((flock - (be ?? 0)) / flock)} safety buffer)` : `${(be ?? flock) - flock} ${T.units} below breakeven`}.

At what scale does this become a primary income? ${primaryIncomeScale === "N/A" ? "Not achievable at current variable margin — review input costs." : `${primaryIncomeScale} ${T.units} generate approximately R300,000/year net.`}

Most important Year 3 reinvestment decision: retain the best 15–20% of heifer ${T.youngs} instead of selling them. This grows your ${T.group} by ${Math.round(flock * (r.lambing / 100) * (r.survival / 100) * 0.175)} ${T.units}/year at zero purchase cost — compounding return on capital without additional debt.`,

    `1. DROUGHT RISK (${r.drought} in ${r.name})
${droughtAdvice}

2. TICK-BORNE DISEASE RISK (${r.parasites} pressure — primary ongoing health cost)
The three critical diseases: Gallsickness (Anaplasmosis — acute, often fatal within 24 hours), Redwater (Babesiosis — red urine, rapid decline), Heartwater (Ehrlichiosis — neurological signs, high mortality). Prevention protocol: strategic dipping or pour-on every 7–14 days during peak tick season, every 21–28 days in low season. A single Gallsickness death costs ${ZAR(Math.round(r.ewePrice * 1.1))} (replacement cow plus vet cost) — the annual dipping budget for your entire herd is ${ZAR(Math.round(healthCost * 0.6 * flock))}. Dip. Every time. Register with a local vet for emergency response within your area.

3. FOOT AND MOUTH DISEASE RISK (FMD — notifiable)
FMD outbreaks trigger immediate movement restrictions and market closure. Cattle in the FMD buffer zone (primarily Limpopo near the Mozambique border) require additional permits for movement. Register your herd with your provincial Department of Agriculture — mandatory for legal movement. Vaccination is available and strongly recommended in high-risk areas. An FMD outbreak in your district can close your market access for 6–12 months.

4. CARCASS PRICE RISK
${sensTable}
At -20% (R${(carcass * 0.8).toFixed(0)}/kg): profit/${T.unit} ${ZAR(s20?.pp ?? 0)} — ${(s20?.pp ?? 0) > -2000 ? "manageable with a cash reserve" : "severe — requires emergency cost reduction or strategic destocking"}.
Mitigation: develop relationships with at least 2 alternative buyers (auction, direct abattoir, feedlot contract). Feedlot weaner contracts at R22–28/kg live weight provide price certainty at the cost of a slight discount to spot.

5. CAPITAL CONCENTRATION RISK
At ${ZAR(r.ewePrice)}/${T.unit}, your ${flock}-${T.unit} ${T.group} represents ${ZAR(flock * r.ewePrice)} in a single asset class. A disease event, drought destocking, or theft incident affecting 20% of your ${T.group} costs ${ZAR(Math.round(flock * 0.2 * r.ewePrice))}. Insurance: AGRI SA multi-peril herd insurance covers theft (a growing risk — branded and ear-tagged cattle are harder to sell at auction, reducing theft profitability), FMD movement restriction losses, and drought emergency slaughter. Budget R200–R400/${T.unit}/year.

6. THEFT RISK
Cattle theft is a significant operational risk, especially for operations near urban areas or unfenced veld. Mitigation: fire-brand or freeze-brand every animal (legally required in most provinces), maintain a photographic ear-tag register, install a perimeter alarm on kraals where cattle are kraaled at night, and register with your local farm watch structure.

Recommended contingency reserve: ${ZAR(Math.round(fa * 0.5))} minimum (6 months fixed costs), held separately from operational accounts.`,

    `Total capital required: ${ZAR(capital)}.

Breeding ${T.group}: ${ZAR(flock * r.ewePrice)} (${flock} ${T.units} × ${ZAR(r.ewePrice)}/${T.unit})
Financing route: Land Bank production loan, typically prime + 1.5–2.5%, 3–5 year term, semi-annual repayments aligned to ${T.young} sales. Security: notarial livestock bond over animals, cession of multi-peril insurance, personal surety or property bond. Minimum own contribution: 30% (${ZAR(Math.round(flock * r.ewePrice * 0.3))}).

Bulls: ${Math.ceil(flock / 28)} bulls at ${ZAR(Math.round(r.ewePrice * 0.8 * Math.ceil(flock / 28)))} estimated. Alternatively, lease proven bulls at R3,000–R5,000/month during mating season — reduces upfront capital by ${ZAR(Math.round(r.ewePrice * 0.8 * Math.ceil(flock / 28)))} and eliminates year-round bull keep.

Infrastructure:
• Handling facility (crush, loading ramp, dip tank/spray race): R30,000–R80,000 depending on existing structures
• Water infrastructure: solar pump + JoJo tanks (5 points for ${flock} ${T.units} across recommended camps): R60,000–R120,000 — the single highest-ROI infrastructure investment for cattle
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
• Fence camps for rotational grazing — minimum 4 camps for ${flock} ${T.units}
• Open a dedicated farm bank account
• Apply for Land Bank or FNB Agri production loan NOW — 8–14 week process
• Register with your local veterinarian and establish a tick-control protocol before cattle arrive

MONTH 3 — Stock procurement:
• Source ${r.breed} ${T.units} from ${r.name} livestock auctions or registered breeders
• Price benchmark: ${ZAR(r.ewePrice)}/${T.unit} for pregnancy-tested in-calf ${T.units}
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

// ── GOAT CARRYING CAPACITY ────────────────────────────────────────────────────
const GOAT_CC = {
  "Limpopo":       "3–5 ha/doe on bushveld — acacia, mopane, and mixed thorn scrub provide excellent year-round browse. Goats outperform sheep on sparse Limpopo veld where grass cover is insufficient for ewes.",
  "North West":    "3–6 ha/doe across the Kalahari fringe — Boer goats thrive on mixed Kalahari scrub and thorn. Better-rainfall areas (Magaliesberg) support 2–4 ha/doe with rotational management.",
  "Gauteng":       "1–2 ha/doe on improved pasture — land cost is the binding constraint. Semi-intensive and intensive management justified only where market proximity offsets land premium.",
  "Mpumalanga":    "2–4 ha/doe on mixed highveld — goats utilise forbs and shrubs not available to cattle. Avoid waterlogged soils in the eastern lowveld where internal parasite burden peaks severely.",
  "Free State":    "3–6 ha/doe — northern Free State grassland suits semi-intensive Boer goat production. Karoo transition zone (Trompsburg/Springfontein) is excellent goat country at 4–6 ha/doe.",
  "KwaZulu-Natal": "1.5–3 ha/doe in the coastal midlands — high humidity increases internal parasite pressure dramatically. FAMACHA monitoring is non-negotiable and must be performed every 4–6 weeks without exception.",
  "Western Cape":  "2–4 ha/doe — the Klein Karoo (Oudtshoorn/Calitzdorp) is SA's most productive commercial goat region. Karoo scrub, renosterveld, and fynbos provide high-energy browse year-round for Boer and Kalahari Red does.",
  "Eastern Cape":  "2–5 ha/doe — Karoo interior is prime goat country; goats outcompete sheep on sparse Karoo scrub. Midlands suits semi-intensive production at 2–3 ha/doe. One of SA's most versatile goat provinces.",
  "Northern Cape": "4–12 ha/doe in the Kalahari — Kalahari Red and Boer goats are the natural inhabitants of this veld type. Namaqualand requires 10–15 ha/doe. Supplement with licks; never rely solely on natural browse in drought years.",
};

// ── GOAT BREED SOURCES ────────────────────────────────────────────────────────
const GOAT_BREED_SOURCES = {
  "Boer Goat":
    "The SA Boer Goat Breeders' Society (SABGA — sabga.co.za) is the primary registration and stud directory. Premier production events: National Boer Goat Show (Kimberly, September — Northern Cape), Free State Production Sale (Bloemfontein, May), Limpopo Stud Sale (Mokopane, April). Insist on animals from the SA National Small Stock Improvement Scheme (NSSIS) with published BLUP index values — top-indexed does improve kidding rate by 10–15% over unrecorded stock. Source bucks from performance-tested studs only: a single poor buck depresses the entire kid crop.",
  "Kalahari Red":
    "The SA Kalahari Red Goat Breeders' Society (kalaharired.co.za) coordinates annual production days in Upington, Kenhardt, and Calvinia. The Kalahari Red's pigmented skin and red coat reduce UV damage and heat stress in the Northern Cape — this is a practical production advantage, not cosmetic. For harsh semi-arid conditions where Boer Goat does struggle with browse scarcity, the Kalahari Red's fat reserves and tolerance for sparse veld are measurable commercial assets. Source from registered breeders with at least two generations of performance records in the specific environment (Kalahari/Namaqualand) — do not cross-source from high-rainfall areas.",
  "_default":
    "Contact the relevant SA goat breed society for your province — both SABGA (sabga.co.za) and the SA Kalahari Red Breeders' Society coordinate annual production events with performance-tested animals. For commercial replacements, district livestock auctions offer certified breeding-status does at competitive prices. Always request health history, kidding records, and FAMACHA scores before purchase — internal parasite susceptibility is heritable and a single high-susceptible doe can skew your entire health cost.",
};

// ── GOATS REPORT ──────────────────────────────────────────────────────────────
function generateGoatsReport(reportData, buyerName, T) {
  const { r, flock, lm, carcass, lab, fa, revPE, varPE, vm, be, pp, capital, npv5,
          scaleRows, cfRows, firstPositive, sensRows, yr1, yr2, yr3, mc,
          feedCost, healthCost, productionSystem, marketChannel, feedSource,
          isGrowOut, cyclesPerYear, weanerPrice: goWPrice } = reportData;

  // ── Grow-out (kid-finishing) mode ─────────────────────────────────────────
  if (isGrowOut) {
    const lmNote      = lm === "owner" ? `owner-operated (${ZAR(lab)}/mo notional)` : `hired worker at ${ZAR(r.hired)}/mo (BCEA 2024)`;
    const carcassKgGO = Math.round(r.liveKg * r.dressing / 100);
    const intakeKg    = Math.round(r.liveKg * 0.35);
    const verdict = pp > 0
      ? `VIABLE — this ${flock}-slot buy-and-finish kid operation in ${r.name} generates ${ZAR(pp)}/slot/year net (${PCT(pp / goWPrice)} ROI on weaner kid capital).`
      : `MARGINAL — at ${flock} slots, this operation falls below the ${be ?? "?"}-slot breakeven. Purchase cost and fixed overhead exceed current margin. Scale to at least ${be ?? flock + 10} slots or reduce weaner kid purchase price before committing capital.`;
    const bankRatingGO = pp > 0 && flock >= (be ?? 0) * 1.2 ? "STRONG" : pp > 0 ? "MODERATE" : "MARGINAL";
    const s20 = sensRows.find(s => s.pct === -20);
    const scaleStr = scaleRows.filter((_,i) => i % 2 === 0)
      .map(rw => `${rw.n} slots: profit/slot ${ZAR(rw.pp)} · batch profit ${ZAR(rw.fp)} · ROI ${PCT(rw.roi)} · ${rw.ok ? "VIABLE" : "BELOW BE"}`)
      .join("\n");
    const sensTable = sensRows.filter(s => [-20,-10,0,10,20].includes(s.pct))
      .map(s => `  ${s.pct>0?"+":""}${s.pct}% (R${s.adj.toFixed(0)}/kg): profit/slot ${ZAR(s.pp)} · ROI ${PCT(s.roi)} · BE ${s.be||"∞"} slots`)
      .join("\n");
    const cfTable = cfRows.filter(row => row.rev > 0 || row.m === 1 || row.m % 12 === 0)
      .map(rw => `Mo ${rw.m} (${rw.mo} Yr${rw.yr}): Rev ${ZAR(rw.rev)} · Cost ${ZAR(rw.cost)} · P&L ${ZAR(rw.profit)} · Cum ${ZAR(rw.cum)}`)
      .join("\n");
    const TITLES = [
      "Executive Summary", "Regional Analysis", "Breed Analysis",
      "Financial Model & Assumptions", "36-Month Cashflow Analysis",
      "Scale & Breakeven Analysis", "Risk Analysis & Sensitivity",
      "Capital Structure & Financing", "Implementation Roadmap",
    ];
    const bodies = [
      `${verdict}

Operation profile: ${flock} ${r.breed} kid slots — buy-and-finish in ${r.name}. ${cyclesPerYear.toFixed(1)} cycles/year (~${Math.round(365/cyclesPerYear)} days/cycle). System: ${productionSystem} · Market: ${marketChannel} · Labour: ${lmNote}. Carcass basis: R${carcass}/kg (SA fresh chevon/goat market).

Key financials: Revenue ${ZAR(revPE)}/slot/yr · Variable cost (incl. weaner kids) ${ZAR(varPE)}/slot · Variable margin ${ZAR(vm)}/slot · Fixed annual ${ZAR(fa)} · Breakeven ${be ?? "N/A"} slots · Profit/slot ${ZAR(pp)}/yr · Batch profit ${ZAR(pp * flock)}/yr · ROI on kid capital ${PCT(pp / goWPrice)} · Capital required ${ZAR(capital)} · 5-year NPV at 10%: ${ZAR(npv5)}.

Weaner kid purchase price: ${ZAR(goWPrice)}/head. Slaughter weight: ${r.liveKg}kg live · Carcass: ${carcassKgGO}kg (${r.dressing}%). First revenue: Month ${firstPositive?.m ?? Math.round(12/cyclesPerYear + 1)}.

Three-year trajectory: Year 1 cumulative ${ZAR(yr1)}. Year 2 cumulative ${ZAR(yr2)}. Year 3 cumulative ${ZAR(yr3)}. Sustainable annual batch profit from Year 2: ${ZAR(pp * flock)}/yr.

Land Bank bankability: ${bankRatingGO}. ${bankRatingGO === "STRONG" ? "Strong cash-on-cash return with rapid capital turnover — kid-finishing cycles faster than sheep or cattle." : bankRatingGO === "MODERATE" ? "Viable but scale up — fixed cost dilution improves rapidly across more slots." : `Below the ${be}-slot breakeven — increase batch size or negotiate lower weaner kid price before committing capital.`}`,

      `${r.name} — ${r.climate}.

Buy-and-finish context: Kid finishing in ${r.name} is driven by the halaal sacrificial market (Eid al-Adha, June/July) and the fresh chevon retail market. Market-ready kids (22–28kg live weight) fetch R10–20/kg premium through certified halaal abattoirs relative to off-peak pricing. Aligning your grow cycle to deliver kids at ${r.liveKg}kg 4–6 weeks before Eid is the single most reliable way to improve per-slot returns.

Market infrastructure: ${r.market}.

Halaal premium opportunity: R10–20/kg above base carcass price for certified halaal animals — adds ${ZAR(Math.round(carcassKgGO * 15))}/animal at R15/kg premium. Confirm certification requirements with your target abattoir before purchasing the first batch.

${r.tip ? `Provincial insight: ${r.tip}` : ""}`,

      `${r.breed} — buy-and-finish parameters used in this model.

Carcass: ${carcassKgGO}kg (${r.liveKg}kg live × ${r.dressing}% dressing).
Revenue per kid at R${carcass}/kg: ${ZAR(carcassKgGO * carcass)}.
Cycles per year: ${cyclesPerYear.toFixed(1)} (~${Math.round(365/cyclesPerYear)}-day grow period from ~${intakeKg}kg intake to ${r.liveKg}kg slaughter).
Annual revenue per slot: ${ZAR(Math.round(revPE))}.

${r.breed} finishing performance: Both Boer Goat and Kalahari Red lay down muscle rapidly on browse supplemented with concentrates. The wide, blocky hindquarters of commercial meat goat breeds translate directly to premium carcass classification at halaal abattoir. The primary risk in kid-finishing is internal parasite load — weaners have zero acquired immunity and wireworm burden accumulates faster in young animals than in adults. A rigorous FAMACHA-at-intake protocol is non-negotiable.

Weaner kid sourcing: ${GOAT_BREED_SOURCES[r.breed] || GOAT_BREED_SOURCES["_default"]}`,

      `Buy-and-finish model assumptions — conservative SA chevon market benchmark.

Revenue assumptions:
• Weaner kid purchase price: ${ZAR(goWPrice)}/head (intake weight ~${intakeKg}kg, typically 10–14 weeks old)
• Slaughter weight: ${r.liveKg}kg live · Dressing: ${r.dressing}% · Carcass: ${carcassKgGO}kg
• Carcass price: R${carcass}/kg fresh chevon (verify current SA goat market price before finalising)
• Cycles/year: ${cyclesPerYear.toFixed(1)} (~${Math.round(365/cyclesPerYear)}-day grow-out period)
• Halaal premium: R10–20/kg above base price for certified halaal slaughter

Cost assumptions:
• Feed (concentrate supplement for grow phase): ${ZAR(Math.round(feedCost))}/slot/yr — browse access reduces this; full feedlot diet increases by 30–50%
• Health (FAMACHA-based parasite management): ${ZAR(Math.round(healthCost))}/slot/yr — dose at intake, mid-cycle, and pre-slaughter only
• Labour: ${lmNote}
• Overhead: ${ZAR(r.oh ?? 500)}/mo — water, fuel, handling, transport to abattoir

Variable margin of ${ZAR(vm)}/slot/year is the critical number. Every slot above breakeven (${be ?? "N/A"}) adds ${ZAR(vm)} straight to profit. Internal parasite health cost is the most volatile input — a wet season with missed FAMACHA can double this cost and collapse the margin for that cycle.`,

      `Buy-and-finish cashflow — ${flock} kid slots at ${cyclesPerYear.toFixed(1)} cycles/year.

Revenue arrives at the end of each grow cycle (~month ${Math.round(12/cyclesPerYear)}).
Monthly operating cost: ${ZAR(Math.round(mc))}.
Initial weaner kid purchase: ${ZAR(flock * goWPrice)}.

Key cashflow milestones:
${cfTable}

Year 1 cumulative: ${ZAR(yr1)}. Year 2: ${ZAR(yr2)}. Year 3: ${ZAR(yr3)}.
Working capital requirement: ${ZAR(capital)} (weaner kid purchase + ${Math.round(365/cyclesPerYear)}-day operating costs + 15% contingency).

Eid al-Adha timing: Structure your purchase-and-grow cycle so kids reach ${r.liveKg}kg 4–6 weeks before Eid (June/July). Book halaal abattoir slots 3–4 weeks in advance — they fill early for Eid. The premium adds ${ZAR(Math.round(flock * carcassKgGO * 15))} to a single Eid batch at R15/kg above base.`,

      `Breakeven: ${be ?? "N/A"} batch slots. Variable margin ${ZAR(vm)}/slot/yr covers fixed overhead of ${ZAR(fa)}/yr at this scale.

${scaleStr}

Your position: ${flock} slots${be && flock < be ? ` — ${be - flock} slots below breakeven` : be ? ` — ${flock - be} slots above breakeven` : ""}.

At what scale does this become a primary income? ${vm > 0 ? `${Math.round((fa + 180000) / vm)} slots generate approximately R180,000/year net.` : "Improve variable margin first."}

Kid-finishing has a shorter capital cycle than a breeding herd — revenue every ${Math.round(12/cyclesPerYear)} months versus 12+ months for breeding. Faster feedback on profitability and faster scaling if the model works.`,

      `1. PRICE RISK (Carcass price ±%)
${sensTable}

At a 20% carcass price drop (to R${s20?.adj.toFixed(0) ?? "?"}/kg): ${s20 && s20.pp < 0 ? `this operation falls below breakeven — ${flock} slots is insufficient scale to absorb the shock. Increase to at least ${be ?? flock + 10} slots.` : `profit/slot drops to ${ZAR(s20?.pp ?? 0)} — the operation remains viable.`}

2. WEANER KID SOURCING RISK
Weaner kid price volatility is the largest input cost variable. A 10% price increase reduces profit by ${ZAR(Math.round(goWPrice * cyclesPerYear * 0.1))}/slot/yr. Lock in supply agreements with 2–3 breeding operations in ${r.name}. Source kids at a fixed price per kilogram intake weight — not per head — to protect against underweight animals eroding your margin.

3. INTERNAL PARASITE RISK (Critical — primary mortality and margin risk)
Haemonchus contortus kills weaner kids faster than adults — weaners have zero acquired immunity. A single missed FAMACHA cycle in a high-rainfall period can lose 15–25% of a batch to anaemia without warning. Protocol: FAMACHA at intake (dose all score 4–5 animals), FAMACHA at day 45, FAMACHA pre-slaughter. Use combination drenches and rotate actives — anthelmintic resistance is already present in most SA goat populations. Budget: ${ZAR(Math.round(healthCost))}/slot/yr.

4. WEIGHT RISK (Growth shortfall)
Kids failing to hit target weight reduce revenue and extend cycle length, cutting cycles-per-year. Target average daily gain: ${((r.liveKg - intakeKg) / (365/cyclesPerYear)).toFixed(0)}g/day. Weigh every animal at intake and at day 30 — remove underperformers before they become a cash drain.

5. PREDATION RISK (Lower than breeding, not zero)
Caracal and jackal are less of a threat in a confined camp or feedlot setup but remain a risk at night. Night kraaling for the first 2 weeks post-intake is recommended — stressed new arrivals are most vulnerable. Ensure perimeter fencing is predator-proof around kid-finishing camps.`,

      `Total capital required: ${ZAR(capital)}.

Weaner kid purchase: ${ZAR(flock * goWPrice)} (${flock} × ${ZAR(goWPrice)}/head)
Working capital (${Math.round(365/cyclesPerYear)}-day grow period): ${ZAR(capital - flock * goWPrice)}

Financing options:
• Short-term livestock finance (FNB Agri, ABSA Agri): 3–6 month revolving facility aligned to the grow cycle — the most appropriate instrument for kid-finishing.
• Own capital preferred: ROI of ${PCT(pp / goWPrice)} on weaner kid cost makes this self-funding within 2–3 cycles if initial capital is available.
• Land Bank production loan: applicable if integrated with an owned property where a breeding herd supplements kid supply.

Cash-on-cash payback: ${pp > 0 ? `${(goWPrice / pp).toFixed(1)} years on weaner kid capital` : "not yet viable at current scale"}.

Honest caution: The halaal premium is real but halaal abattoir slots are competitive during Eid. Do not build your base case on Eid premium pricing — use the standard chevon price as the floor and treat Eid premium as upside. Confirm halaal certification requirements with your target abattoir before committing the first batch.`,

      `MONTHS 1–2 — Setup and sourcing:
• Install kid-finishing camps: minimum 1.5m² per kid in a confined pen, or 50–100m² per kid in a browse camp
• Confirm water supply — kids at grow weight need 2–3 litres/day
• Source ${flock} ${r.breed} weaner kids at ${ZAR(goWPrice)}/head (target intake weight ~${intakeKg}kg, 10–14 weeks old)
• Book halaal abattoir slot for target slaughter date (align to Eid if purchasing February–May)
• Confirm FAMACHA protocol with your veterinarian before animals arrive

MONTH 1 — Weaner kid intake:
• Weigh every kid at intake — remove underweight animals before payment if possible
• 7-day quarantine: FAMACHA score (dose all score 4–5), vitamin B12 injection, clostridial vaccination booster
• Tag and record: intake weight, date, FAMACHA score, batch number
• Night kraal for the first 2 weeks — new arrivals are stressed and predator-vulnerable

MONTHS 2–${Math.round(12/cyclesPerYear)} — Grow phase:
• Weigh fortnightly — target ${((r.liveKg - intakeKg) / (365/cyclesPerYear)).toFixed(0)}g/day average gain
• FAMACHA mid-cycle (~day 45): dose only score 4–5 animals — never blanket-dose
• Adjust browse access and concentrate supplement if growth falls below target
• Confirm abattoir slot and halaal paperwork at month ${Math.max(1, Math.round(12/cyclesPerYear) - 1)}

MONTH ${Math.round(12/cyclesPerYear)} — Harvest and restock:
• Grade all animals — send only animals above ${Math.round(r.liveKg * 0.9)}kg to abattoir; hold underweight animals for one more cycle
• FAMACHA pre-slaughter: observe anthelmintic withdrawal periods before slaughter
• Calculate and record true cycle profit: sale revenue minus all costs including kid purchase
• Immediately plan and book next batch restock

FIVE ACTIONS THIS WEEK:
1. Get 3 price quotes from ${r.breed} weaner kid suppliers in ${r.name} — compare price per kg intake weight, not per head
2. Contact a certified halaal abattoir — confirm booking process, minimum batch size, and certification requirements
3. Check pen and camp capacity: ${flock} kids need at least ${Math.round(flock * 1.5)}m² enclosed plus supplementary browse or feed access
4. Open a dedicated batch account to track cash flow per cycle accurately
5. Book a FAMACHA training session with your nearest veterinarian before the first batch arrives`,
    ];
    return {
      sections: TITLES.map((title, i) => ({ title, body: bodies[i] ?? "" })),
      raw: bodies.join("\n\n"),
      reportData, buyerName, generatedAt: new Date().toISOString(), isSandbox: false,
    };
  }

  const kidsPerYear   = Math.round(flock * (r.lambing / 100) * (r.survival / 100) * 0.85);
  const carcassKg     = Math.round(r.liveKg * r.dressing / 100);
  const revPerKid     = Math.round(carcassKg * carcass);
  const lmNote = lm === "owner"
    ? `owner-operated (${ZAR(lab)}/mo notional — BCEA 2024 hired benchmark ${ZAR(r.hired)}/mo for reference)`
    : `hired worker at ${ZAR(r.hired)}/mo (BCEA 2024 Sectoral Determination + UIF + SDL + housing allowance R800)`;
  const feedNote = feedCost !== r.feed
    ? `${ZAR(feedCost)}/doe/yr — client-specified (province benchmark: ${ZAR(r.feed)})`
    : `${ZAR(feedCost)}/doe/yr — browse access + protein lick + kidding supplement. Fully home-grown browse eliminates this cost entirely.`;
  const healthNote = healthCost !== r.health
    ? `${ZAR(healthCost)}/doe/yr — client-specified (province benchmark: ${ZAR(r.health)})`
    : `${ZAR(healthCost)}/doe/yr — FAMACHA-based dosing (4–6 cycles/yr), foot care, clostridial vaccinations, and emergency vet allowance. Internal parasite pressure is the primary variable — wet regions add 30–40% to this benchmark.`;
  const profileLine = `Production system: ${productionSystem} · Market channel: ${marketChannel} · Feed source: ${feedSource}`;
  const s20 = sensRows.find(s => s.pct === -20);
  const s10 = sensRows.find(s => s.pct === -10);
  const scaleVi = scaleRows.find(rw => rw.ok);
  const viabilityVerdict = pp > 0
    ? `VIABLE — this ${flock}-doe ${r.breed} operation in ${r.name} is profitable at current input prices, generating ${ZAR(pp)}/doe/year net (${PCT(pp / r.ewePrice)} ROI on doe capital).`
    : `MARGINAL — at ${flock} does, this herd falls below the ${be ?? "?"}-doe breakeven. Fixed costs of ${ZAR(fa)}/yr cannot be covered at this scale. Increasing to at least ${be ?? flock + 20} does is the single most critical action before committing capital.`;
  const bankRating = pp > 0 && flock >= (be ?? 0) * 1.2 ? "STRONG" : pp > 0 ? "MODERATE" : "MARGINAL";
  const ccGuide = GOAT_CC[r.name] || `3–6 ha/doe depending on veld type — obtain a professional veld assessment before stocking`;
  const breedSource = GOAT_BREED_SOURCES[r.breed] || GOAT_BREED_SOURCES["_default"];
  const droughtAdvice = (r.drought === "Severe, frequent" || r.drought === "Frequent" || r.drought === "Very frequent")
    ? `Drought is the defining risk in ${r.name}. ${r.breed} is more drought-resilient than sheep — their browsing habit and fat reserves provide a buffer. However, internal parasite larvae concentrate on the remaining moist browse in dry spells: paradoxically, drought often increases worm burden. Carry a 90-day supplementary lick reserve (${ZAR(Math.round(feedCost / 12 * 3 * flock))} at current feed cost). Destocking trigger: when body condition drops below 2.5, sell before condition loss becomes irreversible. AgriSure CP coverage is recommended.`
    : `Drought is a periodic risk but ${r.breed} in ${r.name} are well-adapted to browse on sparse veld. Maintain a 60-day feed and lick reserve (${ZAR(Math.round(feedCost / 12 * 2 * flock))} for your herd). Key discipline: move does off depleted camps early — overgrazing removes the shrubs and forbs that goats rely on, and unlike grass, shrub regeneration takes 2–5 years.`;
  const scaleStr = scaleRows.filter((_, i) => i % 2 === 0)
    .map(rw => `${rw.n} does: profit/doe ${ZAR(rw.pp)} · herd profit ${ZAR(rw.fp)} · ROI ${PCT(rw.roi)} · ${rw.ok ? (rw.roi > 0.14 ? "STRONG" : "VIABLE") : "BELOW BE"}`)
    .join("\n");
  const sensTable = sensRows.filter(s => [-20, -10, 0, 10, 20].includes(s.pct))
    .map(s => `  ${s.pct > 0 ? "+" : ""}${s.pct}% (R${s.adj.toFixed(0)}/kg): profit/doe ${ZAR(s.pp)} · ROI ${PCT(s.roi)} · BE ${s.be || "∞"} does`)
    .join("\n");
  const primaryIncomeScale = vm > 0 ? Math.round((fa + 180000) / vm) : "N/A";

  const TITLES = [
    "Executive Summary", "Regional Analysis", "Breed Analysis",
    "Financial Model & Assumptions", "36-Month Cashflow Analysis",
    "Scale & Breakeven Analysis", "Risk Analysis & Sensitivity",
    "Capital Structure & Financing", "Implementation Roadmap",
  ];

  const bodies = [
    `${viabilityVerdict}

Operation profile: ${flock} ${r.breed} does in ${r.name}. ${profileLine}. Labour: ${lmNote}. Carcass price basis: R${carcass}/kg (SA fresh goat/chevon market).

Key financials: Revenue ${ZAR(revPE)}/doe/yr · Variable cost ${ZAR(varPE)}/doe/yr · Variable margin ${ZAR(vm)}/doe · Fixed annual ${ZAR(fa)} · Breakeven ${be ?? "N/A"} does · Profit/doe ${ZAR(pp)} · Herd profit ${ZAR(pp * flock)}/yr · ROI on doe capital ${PCT(pp / r.ewePrice)} · Capital required ${ZAR(capital)} · 5-year NPV at 10% discount rate: ${ZAR(npv5)}.

Production parameters: Kidding rate ${r.lambing}% · Kid survival ${r.survival}% · Kids marketed/doe/yr ${(r.lambing / 100 * r.survival / 100 * 0.85).toFixed(2)} · Slaughter weight ${r.liveKg}kg · Carcass weight ${carcassKg}kg (${r.dressing}% dressing) · Revenue/kid at R${carcass}/kg: ${ZAR(revPerKid)}.

Cashflow turning point: Month ${firstPositive?.m ?? 13} (${firstPositive?.mo ?? "Jan"} Year ${firstPositive?.yr ?? 2}) — first kid sales. The preceding months require ${ZAR(Math.abs(yr1))} in working capital before revenue arrives.

Three-year trajectory: Year 1 cumulative ${ZAR(yr1)} (establishment phase). Year 2 cumulative ${ZAR(yr2)}. Year 3 cumulative ${ZAR(yr3)}. From Year 3 onwards: ${ZAR(pp * flock)}/year sustainable herd profit.

Land Bank bankability: ${bankRating}. ${bankRating === "STRONG" ? `This operation covers fixed costs with a ${PCT((flock - (be ?? flock)) / flock)} safety buffer above breakeven.` : bankRating === "MODERATE" ? "Viable but limited margin — a lender will require management experience and a 12-month cash reserve." : `Below the ${be}-doe breakeven — herd expansion or cost reduction is required before applying for production finance.`}

Recommended immediate action: ${be && flock < be ? `Increase herd size to at least ${be} does before committing capital.` : `Proceed with the ${flock}-doe operation, securing a revolving credit facility of ${ZAR(Math.round(Math.abs(yr1) * 1.1))} to bridge the working capital gap to Month ${firstPositive?.m ?? 13}.`}`,

    `${r.name} — ${r.climate}.

Climate and production environment: Rainfall ${r.climate.match(/\d+[–\-]\d+mm/)?.[0] ?? "variable"} · Season: ${r.season ?? "summer"} · Frost: ${r.frost} · Parasite pressure: ${r.parasites} · Drought frequency: ${r.drought}.

Carrying capacity: ${ccGuide}. Goats are browsers by nature — they preferentially select leaves, forbs, and shrubs over grass. This means they can productively utilise veld that is unsuitable or marginal for cattle and sheep. However, goats must never be confined to camps without browse cover — forced grazing of grass under starvation pressure damages the rumen flora developed for a browse diet and suppresses production dramatically.

Internal parasite management is the defining success factor in ${r.name} goat farming. Unlike sheep, goats do not develop significant acquired immunity to Haemonchus contortus (wireworm) — a mature doe is almost as susceptible to fatal anaemia as a kid. FAMACHA scoring every 4–6 weeks is non-negotiable and must be performed by the farmer or a trained farm worker, not estimated visually at distance. A reactive dosing protocol (dose only FAMACHA score 4–5 animals) reduces anthelmintic resistance — the greatest long-term threat to goat farming in ${r.name}.

Market infrastructure: ${r.market}. The Islamic halaal market — Eid al-Adha sacrificial demand in June/July — consistently pays R10–20/kg premium above standard fresh goat price for certified halaal animals. Align your kidding season to have market-ready animals (22–28kg live weight) available 6 weeks before Eid al-Adha.

${r.tip ? `Provincial insight: ${r.tip}` : ""}

Predation risk in ${r.name}: Caracal and black-backed jackal are the primary predators of goat kids. Losses of 5–15% of the kid crop are common without active predator management. Night-kraaling (100% of kids in secure pens overnight) is non-negotiable for the first 6 weeks of life. Livestock guard dogs (Anatolian Shepherd, Kangal) are the most cost-effective long-term solution at R3,000–R6,000 per trained dog — a single dog protects 100–200 does and pays back in 1–2 kidding seasons.`,

    `${r.breed} is the dominant commercial meat goat breed in ${r.name} and the most widely produced goat breed in South Africa.

Production parameters in ${r.name}:
• Kidding rate: ${r.lambing}% (twin kids are common in ${r.breed} — over 50% of does in a well-managed herd produce twins annually)
• Kid survival to 90 days: ${r.survival}% — primary losses are predation (night), hypothermia in frost areas, and scours in the first 72 hours
• Slaughter weight: ${r.liveKg}kg live weight at 4–6 months
• Carcass weight: ${carcassKg}kg (${r.dressing}% dressing percentage)
• Revenue per kid at R${carcass}/kg: ${ZAR(revPerKid)}

What the breed selection means for your operation in ${r.name}:
${r.breed} produces a wide, blocky carcass with high muscle-to-bone ratio — the commercial standard for SA fresh goat and export chevon. ${r.breed === "Kalahari Red" ? "The Kalahari Red's pigmented red coat provides UV protection and heat resilience — a practical production advantage in arid conditions." : "The white body with red head is the Boer Goat registration standard, but commercial does show colour variation without affecting production."} ${r.breed}'s primary weakness is internal parasite susceptibility — selected for meat production, not parasite resistance. Any management system for ${r.breed} in ${r.name} must have FAMACHA built into the monthly routine.

${breedSource}

HIDDEN INCOME STREAM — Stud buck leasing:
A performance-tested ${r.breed} buck from a top-decile NSSIS stud sells for R8,000–R25,000. Rather than purchasing and depreciating a buck, lease a proven sire from a registered stud at R1,500–R3,000/season (6–8 weeks). This eliminates the capital cost and the genetic risk of a single poor sire inflating your replacement buck expense. Conversely, if you invest in a top buck and your own herd is performing well, leasing him to neighbouring commercial farmers at R2,000/season recovers 40–60% of his annual ownership cost.`,

    `This model applies a conservative commercial ${r.breed} benchmark for ${r.name}.

Revenue assumptions:
• Kidding rate: ${r.lambing}% × survival ${r.survival}% × 85% marketing rate = ${(r.lambing / 100 * r.survival / 100 * 0.85).toFixed(2)} kids marketed/doe/yr
• Carcass: ${carcassKg}kg × R${carcass}/kg = ${ZAR(revPerKid)}/kid
• Revenue/doe/yr: ${ZAR(Math.round(revPE))} (no wool — ${r.breed} is a pure meat breed)
• Halaal premium opportunity: R10–20/kg above base price for certified halaal slaughter — adds ${ZAR(Math.round(kidsPerYear * carcassKg * 15))} annually on ${kidsPerYear} kids if marketed through halaal channels

Cost assumptions:
• Feed / browse supplement: ${feedNote}
• Health (FAMACHA-based dosing): ${healthNote}
• Doe replacement: ${r.rep}% annually at ${ZAR(r.ewePrice)}/doe = ${ZAR(Math.round(r.ewePrice * r.rep / 100))}/doe/yr
• Overhead: ${ZAR(r.oh)}/mo — handling, transport, guard dogs, equipment maintenance
• Labour: ${lmNote}

The variable margin of ${ZAR(vm)}/doe is the key driver. At ${flock} does, fixed costs consume ${ZAR(Math.round(fa / flock))}/doe/yr. At 200 does, this drops to ${ZAR(Math.round(fa / 200))} — scale is the primary lever for profitability in extensive ${r.breed} operations.

Most likely wrong assumption: Internal parasite cost. In high-rainfall or KZN coastal environments, health costs can run 1.5–2× the benchmark without a rigorous FAMACHA protocol. If ${r.name} has parasite pressure rated '${r.parasites}', budget an additional ${ZAR(Math.round(healthCost * 0.4))}/doe/yr as a contingency until you have two seasons of actual dosing records.`,

    `The cashflow story for a ${r.name} goat operation has three phases.

Phase 1 — Establishment (Months 1–12): Does are mated in Month 1–2. Gestation is 150 days (5 months) — kids arrive in Month 6–7. No revenue during establishment. Monthly operating cost: ${ZAR(Math.round(mc))}. Cumulative Year 1 position: ${ZAR(yr1)}.

Phase 2 — First kid sales (Month 13–14): First crop of kids reaches market weight (${r.liveKg}kg live). With ${flock} does at ${r.lambing}% kidding and ${r.survival}% survival, approximately ${Math.round(flock * r.lambing / 100 * r.survival / 100 * 0.85 * 0.5)} kids are marketed in the first batch. Year 2 cumulative: ${ZAR(yr2)}.

Phase 3 — Normal production (Year 2+): ${flock} does × ${(r.lambing / 100 * r.survival / 100 * 0.85).toFixed(2)} kids/doe/yr = ${kidsPerYear} kids/yr. Annual revenue ${ZAR(Math.round(revPE * flock))}, annual costs ${ZAR(Math.round((varPE + fa / flock) * flock))}. Year 3 cumulative: ${ZAR(yr3)}.

${pp < 0 ? `WARNING: At ${flock} does, this herd does not reach cumulative-positive in 36 months. Scale to at least ${be ?? flock + 20} does before committing capital.` : `The operation ${yr2 >= 0 ? "recovers working capital by Year 2" : "requires the full 36-month period to recover working capital — normal for first-time operations where establishment costs peak in Year 1"}.`}

Working capital requirement: ${ZAR(Math.round(Math.abs(yr1) * 1.1))} — budget this before a single animal is purchased. The most common cause of goat operation failure is insufficient working capital in the 12-month establishment phase, not drought or disease.

Seasonal cash flow pattern: Align mating with your target market. Kidding 5 months later should produce market-weight animals for the halaal peak (Eid), September Braai Day demand, or December/January Christmas retail — all of which pay 15–25% above off-peak prices.`,

    `Breakeven: ${be ?? "N/A"} does. The variable margin of ${ZAR(vm)}/doe covers fixed costs of ${ZAR(fa)}/yr exactly at this scale.

Scale table (at current carcass price of R${carcass}/kg):
${scaleStr}

${scaleVi ? `First viable scale: ${scaleVi.n} does — herd profit ${ZAR(scaleVi.fp)}/yr, ROI ${PCT(scaleVi.roi)}.` : "No viable scale at current carcass price — consider increasing direct-market proportion or reducing fixed costs."}

Commercial thresholds for SA commercial goat operations:
• 1–30 does: hobby/smallholder — rarely covers all fixed and opportunity costs
• 30–80 does: entry commercial, owner-managed — viable with good market access
• 80–200 does: established commercial — full-time owner justified, buck leasing becomes viable
• 200–500 does: large commercial — employed labour, volume abattoir contracts, stud buck investment returns justified
• 500+ does: industrial — migratory or multi-farm, requires full management infrastructure

Your position: ${flock} does · ${flock >= (be ?? Infinity) ? `${flock - (be ?? 0)} does above breakeven` : `${(be ?? flock) - flock} does below breakeven — increase herd size before committing to infrastructure`}.

To reach primary income at R180,000/yr net: ${typeof primaryIncomeScale === "number" ? `${primaryIncomeScale} does required` : "improve variable margin first"}.`,

    `1. INTERNAL PARASITE RISK (Critical — primary ongoing cost and mortality driver)
Haemonchus contortus (wireworm/bloodworm) is the number one killer of commercial goats in SA. Goats do not develop the acquired immunity that adult sheep build over time — a 4-year-old doe is almost as susceptible as a 4-month-old kid. Parasite pressure: ${r.parasites}.
Protocol: FAMACHA score every 4–6 weeks. Dose only animals scoring 4–5 (pale/white conjunctiva). Never blanket-dose — resistance develops within 3–5 years of routine whole-herd treatment. Use combination drenches (benzimidazole + levamisole) and rotate with macrocyclic lactones. Record every dosing event with individual animal ID — this data is your resistance early-warning system.
Cost of failure: A parasite outbreak in a ${flock}-doe herd can kill 20–30% of kids and 5–10% of does in a single season. The annual cost of FAMACHA monitoring (R${Math.round(flock * 5)}/yr in time and materials) is trivially small compared to the losses.

2. PREDATION RISK (High in ${r.name})
Caracal and black-backed jackal cause 5–15% kid losses in unprotected operations. Night-kraaling all kids under 6 weeks is the most effective intervention (zero capital cost). Livestock guard dogs (Anatolian Shepherd, Kangal — R3,000–R6,000 per trained dog) are the preferred long-term solution. Jackal-proof netting (1.2m high + 30cm underground apron) costs R130–R180/m installed — calculate the perimeter of your kidding camps and compare against predation losses at ${ZAR(revPerKid)}/kid.

3. PRICE SENSITIVITY (Carcass price ±%)
${sensTable}

At a 20% price drop (to R${s20?.adj.toFixed(0) ?? "?"}/kg): ${s20 && s20.pp < 0 ? `this operation moves below breakeven — ${flock} does is insufficient scale to absorb the shock.` : `profit/doe drops to ${ZAR(s20?.pp ?? 0)} — the herd remains viable but margin is compressed.`}
At a 10% price drop (to R${s10?.adj.toFixed(0) ?? "?"}/kg): profit/doe ${ZAR(s10?.pp ?? 0)}.

4. DROUGHT RISK
${droughtAdvice}

5. ANTHELMINTIC RESISTANCE RISK (Long-term, systemic)
Routine blanket dosing is already causing resistance in most SA goat populations. The risk is that within 5–10 years, effective chemical control of internal parasites may no longer be possible on your farm. Mitigation now: FAMACHA-based selective treatment, genetic selection for FAMACHA resistance (cull does that consistently score 4–5), rotational browsing camps with 6–8 week rest periods to break larval life cycles.`,

    `Total capital required: ${ZAR(capital)}.

Doe component: ${ZAR(flock * r.ewePrice)} (${flock} does × ${ZAR(r.ewePrice)}/doe)
Buck component: ${ZAR(Math.round(Math.ceil(flock / 30) * r.ewePrice * 2.5))} (${Math.ceil(flock / 30)} bucks at 1:30 ratio — alternatively lease at R2,000/season)
Working capital (Year 1): ${ZAR(Math.round(Math.abs(yr1) * 1.1))}

Lending instruments:
• Land Bank Agri-Finance: primary instrument for doe purchase. Term 3–5 years, quarterly repayments aligned to kid sales. Minimum own contribution: 30% (${ZAR(Math.round(flock * r.ewePrice * 0.3))}). Security: notarial livestock bond + insurance cession.
• FNB Agri: faster approval (4–6 weeks vs Land Bank 8–14 weeks) — preferred if you have existing collateral and cannot wait for Land Bank processing.
• MAFISA: applicable for emerging/small-scale farmers — subsidised interest rate, smaller loan sizes.

Optimal capital structure at ${ZAR(capital)}: 40% own equity (${ZAR(Math.round(capital * 0.4))}), 60% debt (${ZAR(Math.round(capital * 0.6))}). Goat operations have faster capital recovery than cattle (shorter production cycle) — a 3-year loan term is achievable if kidding rates exceed ${r.lambing - 10}%.

Insurance: Register with AgriSure CP for multi-peril livestock cover before the first animals arrive. Goat cover is available at 2.5–4% of livestock value — for ${ZAR(flock * r.ewePrice)} of does, annual premium is ${ZAR(Math.round(flock * r.ewePrice * 0.03))}. Non-negotiable in drought-prone areas.

Honest caution: Buck quality is undervalued by most first-time goat producers. A poor-performance buck is the most expensive animal on the farm — every substandard kid he sires costs you at every sale for the next 5 years. Spend on buck genetics before any other optional capital item.`,

    `MONTHS 1–2 — Site preparation and funding:
• Install night kraal for kids: minimum 30m² per 10 does, predator-proof, lockable
• Confirm water supply — does with kids will not walk more than 1.5km to water
• Fence 4–6 browse camps for rotational management
• Install salt/mineral lick stations in each camp
• Apply for Land Bank / FNB Agri production loan NOW (8–14 week process)
• Engage a local veterinarian familiar with small stock FAMACHA protocol

MONTH 3 — Doe procurement:
• Source ${r.breed} does from ${r.name} livestock auctions or registered SABGA studs
• Price benchmark: ${ZAR(r.ewePrice)}/doe for certified breeding-status animals
• Purchase ${Math.ceil(flock / 30)} proven bucks (1:30 ratio) — or arrange leasing from a registered stud at R1,500–R2,500/season
• 14-day quarantine: FAMACHA score, dose for internal parasites, and vaccinate all incoming animals before joining existing herd

MONTH 4–5 — Mating:
• Remove bucks after 6 weeks — record mating dates for each camp
• Pregnancy scan 45 days post-mating: sort singles, twins, empties
• Increase does' feed and browse access from Month 4 of pregnancy

MONTHS 6–7 — Kidding:
• Check every 3–4 hours during peak kidding (first 72 hours are critical for bonding and colostrum)
• Night-kraal all kids for the first 6 weeks — no exceptions, regardless of weather
• Tag and weigh every kid at birth
• FAMACHA score all does within 2 weeks of kidding — parturition depresses immunity sharply

MONTHS 10–12 — First kid sales:
• Grade animals before booking — target ${r.liveKg}kg+ live weight
• Book directly with halaal abattoir 3–4 weeks in advance for Eid premium pricing
• Compare actual kidding%, survival%, and carcass weight against model assumptions — adjust next year's plan accordingly

FIVE ACTIONS THIS WEEK:
1. Contact SABGA (sabga.co.za) — register as a member and request the stud directory for ${r.name}
2. Source a predator-proof night kraal design — local agricultural extension officer or AGRI SA can provide drawings
3. Register with your nearest livestock auction house as a buyer — get the ${r.name} sale calendar
4. Contact your regional Land Bank agri-assessor — book an initial consultation before submitting an application
5. Speak to a local veterinarian about FAMACHA training — most offer a 2-hour on-farm session at no charge for new producers`,
  ];

  return {
    sections: TITLES.map((title, i) => ({ title, body: bodies[i] ?? "" })),
    raw: bodies.join("\n\n"),
    reportData, buyerName,
    generatedAt: new Date().toISOString(),
    isSandbox: false,
  };
}

// ── PIG BREED SOURCES ─────────────────────────────────────────────────────────
const PIG_BREED_SOURCES = {
  "Large White":
    "The SA Studbook (studbook.co.za) maintains the Large White register. Source gilts from SAPPO-registered studs with published EBV data — particularly Average Daily Gain (ADG), Feed Conversion Ratio (FCR), and Loin Eye Area (LEA). Top commercial Large White studs in Gauteng (Midvaal area) and Free State (Hoopstad, Jacobsdal) offer tested gilts with full health clearance. Insist on Mycoplasma hyopneumoniae-free herd certification before purchase.",
  "Landrace":
    "The SA Landrace is the dominant dam-line breed in SA commercial production. Source from SAPPO-registered studs with BLUP-indexed sows — Landrace maternal traits (litter size, milk production) are heritable and measurable. Landrace × Large White F1 gilts (the commercial dam line) are available from several contract multiplier herds in Gauteng and the Western Cape. Avoid herds without documented PRRS vaccination history.",
  "Duroc":
    "The Duroc is SA's primary terminal sire breed — strong growth, good FCR, and superior pork quality (intramuscular fat). Source terminal Duroc boars from performance-tested studs. The Duroc × (Landrace × Large White) three-way cross is the standard commercial pork model in SA. Consider AI with tested Duroc semen from SANSOR (sansor.co.za) to access elite genetics without housing a boar.",
  "Pietrain":
    "The Pietrain produces lean, heavily muscled carcasses and suits premium retail pork specifications. Not recommended for extensive or semi-intensive systems — Pietrain is stress-susceptible (PSS gene) and requires controlled housing and handling. Source from registered studs with documented PSE-free (pork quality) genetics.",
  "Large White × Landrace":
    "The Large White × Landrace F1 is the standard SA commercial dam line — combining Landrace maternal ability with Large White robustness. Source from SAPPO-registered F1 multiplier herds, typically in Gauteng and the Western Cape, where biosecurity and vaccination programs are documented. A good commercial F1 gilt should farrow 11+ live piglets per litter and wean 10+ under standard conditions.",
  "_default":
    "The SA Pork Producers' Organisation (SAPPO — pork.co.za) maintains a directory of registered stud breeders and commercial gilt multipliers. Contact SAPPO for your province's nearest recommended gilt supplier. Insist on health clearance documentation (Mycoplasma, PRRS, APP) before purchase — respiratory disease is the single largest productivity destroyer in SA commercial piggeries.",
};

// ── PIGS REPORT ───────────────────────────────────────────────────────────────
function generatePigsReport(reportData, buyerName, T) {
  const { r, flock, lm, carcass, lab, fa, revPE, varPE, vm, be, pp, capital, npv5,
          scaleRows, cfRows, firstPositive, sensRows, yr1, yr2, yr3, mc,
          feedCost, healthCost, productionSystem, marketChannel, feedSource } = reportData;

  const pigsPerSow  = r.lambing / 100;
  const carcassKg   = Math.round(r.liveKg * r.dressing / 100);
  const lmNote      = lm === "owner"
    ? `owner-operated (${ZAR(lab)}/mo notional — BCEA 2024 hired benchmark ${ZAR(r.hired)}/mo for reference)`
    : `hired worker at ${ZAR(r.hired)}/mo (BCEA 2024 Sectoral Determination + UIF + SDL)`;
  const feedNote    = feedCost !== r.feed
    ? `${ZAR(feedCost)}/sow/yr — client-specified (province benchmark: ${ZAR(r.feed)})`
    : `${ZAR(feedCost)}/sow/yr — includes sow rations + creep feed + grower/finisher rations for ${pigsPerSow.toFixed(0)} finishers/sow/yr`;
  const healthNote  = healthCost !== r.health
    ? `${ZAR(healthCost)}/sow/yr — client-specified (province benchmark: ${ZAR(r.health)})`
    : `${ZAR(healthCost)}/sow/yr — vaccination programs, routine vet, farrowing support, and finisher treatments`;
  const profileLine = `Production system: ${productionSystem} · Market channel: ${marketChannel} · Feed source: ${feedSource}`;
  const s20 = sensRows.find(s => s.pct === -20);
  const viabilityVerdict = pp > 0
    ? `VIABLE — this ${flock}-sow ${r.breed} piggery in ${r.name} is profitable at current input prices, generating ${ZAR(pp)}/sow/year net (${PCT(pp / r.ewePrice)} ROI on gilt capital).`
    : `MARGINAL — at ${flock} sows, this operation falls below the ${be ?? "?"}-sow breakeven. Fixed costs of ${ZAR(fa)}/yr cannot be covered at current scale. Increasing to at least ${be ?? flock + 10} sows is the single most critical action before committing capital.`;
  const bankRating = pp > 0 && flock >= (be ?? 0) * 1.2 ? "STRONG" : pp > 0 ? "MODERATE" : "MARGINAL";
  const breedSource = PIG_BREED_SOURCES[r.breed] || PIG_BREED_SOURCES["_default"];
  const scaleStr = scaleRows.filter((_,i) => i % 2 === 0)
    .map(rw => `${rw.n} sows: profit/sow ${ZAR(rw.profit / rw.n)} · herd profit ${ZAR(rw.profit)} · ROI ${PCT(rw.roi)}`)
    .join("\n");
  const sensTable = sensRows.filter(s => [-20,-10,0,10,20].includes(s.pct))
    .map(s => `  ${s.pct>0?"+":""}${s.pct}% (R${s.adj.toFixed(0)}/kg): profit/sow ${ZAR(s.pp)} · ROI ${PCT(s.roi)} · BE ${s.be||"∞"} sows`)
    .join("\n");
  const cfTable = cfRows.filter(row => row.rev > 0 || row.m === 1 || row.m % 12 === 0)
    .map(rw => `Mo ${rw.m} (${rw.mo} Yr${rw.yr}): Rev ${ZAR(rw.rev)} · Cost ${ZAR(rw.cost)} · P&L ${ZAR(rw.profit)} · Cum ${ZAR(rw.cum)}`)
    .join("\n");

  const TITLES = [
    "Executive Summary", "Regional Analysis", "Breed Analysis",
    "Financial Model & Assumptions", "36-Month Cashflow Analysis",
    "Scale & Breakeven Analysis", "Risk Analysis & Sensitivity",
    "Capital Structure & Financing", "Implementation Roadmap",
  ];

  const bodies = [
    `${viabilityVerdict}

Operation profile: ${flock}-sow commercial piggery in ${r.name}. Target: ${pigsPerSow.toFixed(0)} finisher pigs/sow/yr at ${r.liveKg}kg slaughter weight (${carcassKg}kg carcass, ${r.dressing}% dressing). System: ${productionSystem} · Market: ${marketChannel} · Labour: ${lmNote}.

Key financials: Revenue ${ZAR(revPE)}/sow/yr · Variable cost ${ZAR(varPE)}/sow · Variable margin ${ZAR(vm)}/sow · Fixed annual ${ZAR(fa)} · Breakeven ${be ?? "N/A"} sows · Profit/sow ${ZAR(pp)}/yr · Herd profit ${ZAR(pp * flock)}/yr · ROI ${PCT(pp / r.ewePrice)} on gilt capital · Capital required ${ZAR(capital)} · 5-year NPV at 10%: ${ZAR(npv5)}.

Cashflow: First batch to slaughter Month 5. Monthly pork revenue steady from Month 6. Three-year trajectory: Year 1 cumulative ${ZAR(yr1)}. Year 2 cumulative ${ZAR(yr2)}. Year 3 cumulative ${ZAR(yr3)}.

Land Bank bankability: ${bankRating}. ${bankRating === "STRONG" ? "Strong cash-on-cash return with continuous monthly revenue from Month 6 — pigs are the most cash-flow-positive of all SA livestock enterprises at scale." : bankRating === "MODERATE" ? "Viable margin but scale up — fixed cost dilution is rapid in piggeries, and breakeven requires only a few more sows." : `Below the ${be}-sow breakeven — this piggery cannot cover fixed costs at current scale. Scale to breakeven or improve variable margin before committing capital.`}`,

    `${r.name} — ${r.climate}.

Commercial pig farming in ${r.name}: ${r.why}

Market infrastructure: ${r.market}.

Provincial productivity context: ${r.name} commercial piggeries achieve approximately ${pigsPerSow.toFixed(0)} finisher pigs per sow per year — reflecting local feed access, climate, and management intensity. SA industry top-quartile: 22+ finishers/sow/yr. National commercial average: 18–20. Below-average operations: <16 finishers/sow/yr.

Feed cost is the dominant input in ${r.name}: ${feedNote}. Feed represents 70–75% of total production cost in a well-run SA piggery. The feed efficiency of your finishers (FCR — kg feed per kg gain) is the single largest lever on profitability after selling price.

${r.tip ? `Provincial insight: ${r.tip}` : ""}`,

    `${r.breed} — the primary commercial breed for ${r.name}.

Production parameters used in this model:
• Finisher pigs per sow per year: ${pigsPerSow.toFixed(0)} (encodes litter size, litters/yr, and piglet survival)
• Slaughter weight: ${r.liveKg}kg live · Carcass: ${carcassKg}kg (${r.dressing}% dressing yield)
• Revenue per sow per year at R${carcass}/kg pork: ${ZAR(Math.round(revPE))}
• Sow productive life: ~3 years (replacement rate ${r.rep}%/yr)

${r.breed} performance in ${r.name}: ${r.breed.includes("Large White") || r.breed.includes("Landrace")
  ? `The Large White × Landrace (or pure-line) combination delivers the best combination of litter size, milk production, and feed efficiency available in SA commercial production. On a correctly balanced diet (16% CP finisher ration with maize-soya base), these breeds consistently achieve FCR 2.8–3.2 and average daily gain 700–850g in SA tunnel-ventilated houses.`
  : `This breed delivers consistent commercial pork production in ${r.name}'s conditions. Select for high Average Daily Gain (ADG) and Feed Conversion Ratio (FCR) — the two performance traits with the highest correlation to profitability.`}

Sow replacement strategy: At ${r.rep}% annual replacement, ${Math.round(flock * r.rep / 100)} gilts per year are required for this ${flock}-sow unit. Source gilts from the same stud to maintain genetic consistency. Replacement cost: ${ZAR(Math.round(flock * r.ewePrice * r.rep / 100))}/yr (${flock} sows × ${ZAR(r.ewePrice)} gilt price × ${r.rep}%).

Where to source stock: ${breedSource}`,

    `Financial model assumptions — SA commercial pork benchmark.

Revenue assumptions:
• Pigs marketed per sow per year: ${pigsPerSow.toFixed(0)}
• Slaughter weight: ${r.liveKg}kg live · Dressing: ${r.dressing}% · Carcass: ${carcassKg}kg
• Pork price: R${carcass}/kg carcass (verify current SA producer price before finalising — SAPPO publishes weekly indicator prices at pork.co.za)
• Revenue per sow per year: ${ZAR(Math.round(revPE))}

Cost assumptions:
• Feed: ${feedNote}
• Health / vet: ${healthNote}
• Labour: ${lmNote}
• Overhead: ${ZAR(r.oh)}/mo — electricity (ventilation, heating), water, vehicle, admin
• Sow replacement: ${ZAR(r.ewePrice)}/gilt × ${r.rep}%/yr = ${ZAR(Math.round(r.ewePrice * r.rep / 100))}/sow/yr
• ${profileLine}

Variable margin of ${ZAR(vm)}/sow/yr is the critical number. Every sow above breakeven (${be ?? "N/A"}) adds ${ZAR(vm)} straight to profit. Feed cost volatility is the most dangerous input — maize prices moved ±25% in 2022–2024. A 10% maize price increase increases feed cost by approximately ${ZAR(Math.round(feedCost * 0.07))}/sow/yr (assuming 70% of feed is maize-based).

Note on pork price sensitivity: SA pork prices (producer level) follow the SA Pig Price Index published weekly by SAPPO. The R${carcass}/kg used here represents current market conditions — cross-check before locking in expansion decisions.`,

    `Piggery cashflow — ${flock} sows, rolling batch production.

Establishment phase (Months 1–5): Feed, labour, and overhead with no revenue as gilts are served, gestate (114 days), and farrow before first weaners reach slaughter weight. Monthly cost during establishment: ${ZAR(Math.round(mc))}.
First batch to slaughter: Month 5.
Steady-state monthly pork revenue: ${ZAR(Math.round((revPE * flock) / 12))}/month from Month 6.

Month-by-month cashflow (revenue months and year-ends shown):
${cfTable}

Year 1 cumulative: ${ZAR(yr1)}. Year 2: ${ZAR(yr2)}. Year 3: ${ZAR(yr3)}.

Working capital observation: The 5-month establishment phase before first revenue requires ${ZAR(Math.round(mc * 5))} operating capital on top of the sow purchase cost of ${ZAR(flock * r.ewePrice)}. This is non-negotiable — it is the minimum cash reserve before a single pig can be sold.

Key advantage over other livestock: from Month 6, pigs generate monthly pork revenue — unlike sheep (annual) or cattle (18-month cycles). Cash-flow predictability is significantly better in a well-run piggery than in any pastoral enterprise.`,

    `Breakeven: ${be ?? "N/A"} sows. Variable margin ${ZAR(vm)}/sow/yr covers fixed overhead of ${ZAR(fa)}/yr at this scale.

${scaleStr}

Your position: ${flock} sows${be && flock < be ? ` — ${be - flock} sows below breakeven` : be ? ` — ${flock - be} sows above breakeven` : ""}.

At what scale does this become a primary income? ${vm > 0 ? `${Math.round((fa + 360000) / vm)} sows generate approximately R360,000/year net — a single full-time income.` : "Improve variable margin first."}

Critical insight: unlike pastoral farming, piggery economics scale rapidly because feed and labour are volume-driven. The difference between a 50-sow and a 100-sow unit is not double the work — a single additional employee manages the extra 50 sows. This fixed-cost leverage is why piggery breakevens are typically low in sow count but the capital requirement (infrastructure) remains the real barrier to entry.`,

    `1. PORK PRICE RISK (Revenue volatility)
${sensTable}

At a 20% pork price drop (to R${s20?.adj.toFixed(0) ?? "?"}/kg): ${s20 && s20.pp < 0 ? `this ${flock}-sow unit falls below breakeven. The SA pig industry experiences cyclical price troughs — budget for 2–3 months of thin or negative margin per year. A cash reserve of ${ZAR(Math.round(mc * 3))} is the minimum safety buffer.` : `profit/sow drops to ${ZAR(s20?.pp ?? 0)} — this operation remains viable even in a price trough.`}

2. FEED COST RISK (Dominant input — 70–75% of total cost)
Maize price is the single most volatile input. A 20% maize price increase (e.g., drought year) increases total feed cost by approximately ${ZAR(Math.round(feedCost * 0.14 * flock))}/yr for this ${flock}-sow unit (assuming 70% maize content). Mitigation: buy maize forward when possible; negotiate multi-month supply contracts with local cooperatives; consider on-farm grain storage if scale justifies it (breakeven on a 200-tonne silo at a ${flock}-sow scale: approximately 2–3 years).

3. DISEASE RISK (Catastrophic — can collapse a piggery in weeks)
African Swine Fever (ASF): SA does not currently have ASF but neighbouring countries do. ASF is a notifiable disease that results in mandatory culling — full operation loss with no compensation. Strict biosecurity (no live pig movement from unknown sources, no kitchen waste, rodent control, visitor control) is the only defense. Contact the DAFF Animal Health Directorate for the current provincial ASF risk level before siting a new operation.
Porcine Reproductive and Respiratory Syndrome (PRRS): Not present in SA as of 2025 but is a major risk factor in any expansion. Source gilts from PRRS-free certified herds only.
Routine risks: Foot and Mouth Disease vaccination is mandatory. Mycoplasma pneumonia is endemic in SA pig herds — vaccinate from weaning.

4. ENERGY COST RISK (Ventilation and heating — 8–12% of operating cost)
A ${flock}-sow tunnel-ventilated piggery uses approximately ${Math.round(flock * 180)} kWh/month (all fans, lights, farrowing heaters). At Eskom tariff R2.50/kWh = ${ZAR(Math.round(flock * 180 * 2.5))}/month electricity cost. Load-shedding above Stage 4 is operationally dangerous — farrowing houses without backup power lose piglets to cold stress within 2–3 hours. Budget for a generator sized to run all farrowing heaters as minimum backup.

5. SOW PRODUCTIVITY RISK (Herd management is the key variable)
The gap between 14 finishers/sow/yr and 22 finishers/sow/yr is pure management — it is not climate or feed. Key drivers: farrowing rate (% of sows that farrow on time), litter size (genetic + nutrition), pre-weaning mortality (farrowing house management, heater reliability), and weaning-to-service interval. Track these four KPIs daily — they are the leading indicators of your annual revenue before any pigs are sold.`,

    `Total capital required: ${ZAR(capital)}.

Sow/gilt purchase: ${ZAR(flock * r.ewePrice)} (${flock} sows × ${ZAR(r.ewePrice)}/gilt)
5-month working capital (establishment phase): ${ZAR(capital - flock * r.ewePrice)}
  (Monthly opex ${ZAR(Math.round(mc))} × 5 months before first revenue)

Infrastructure capital (not included above — farmer-owned):
• Tunnel-ventilated farrowing unit: R8,000–R15,000/sow space
• Gestation barn: R4,000–R8,000/sow space
• Finisher pens: R1,200–R2,000/pig space (need ${Math.round(pigsPerSow * flock / 4)} spaces for quarterly rolling batches)
• Feed storage and mixing: R80,000–R200,000 depending on scale
• Effluent management (lagoon or biodigester): R150,000–R500,000
• Estimated total infrastructure for ${flock}-sow unit: ${ZAR(flock * 25000)}–${ZAR(flock * 40000)} (highly variable by spec)

Financing options:
• ABSA Agri Mortgage / FNB Agri Production Loan: piggeries qualify for agricultural lending at 1–3% above prime. The monthly pork revenue from Month 6 is a strong serviceable cashflow for a term loan.
• Land Bank: eligible for production credit facilities aligned to the sow herd as collateral. Contact your nearest Land Bank branch with this feasibility report.
• Own capital preferred for infrastructure: the 5-month establishment loan is short enough to self-fund with a cash reserve of ${ZAR(capital)}.
• SAPPO levy fund and Agri-SA grants: contact SAPPO (pork.co.za) for current industry support programs for new entrants.

Payback on gilt capital: ${pp > 0 ? `${(r.ewePrice / pp).toFixed(1)} years per sow at current margin` : "not yet viable at current scale"}.`,

    `MONTHS 1–2 — Infrastructure and gilt sourcing:
• Confirm house design with a pig production consultant — ventilation is not negotiable
• Source ${flock} commercial gilts from a SAPPO-registered stud in ${r.name}: ${breedSource.split(".")[0]}.
• Set up feed storage: minimum ${Math.round(flock * feedCost / 12 * 2 / 1000)} tonnes of initial feed inventory (2-month buffer)
• Establish relationship with your nearest SAPPO-registered abattoir and confirm slaughter specs (weight, finish grade)
• Register as a pig producer with your provincial DAFF office — mandatory for disease reporting

MONTH 1 — Gilt introduction:
• Introduce all ${flock} gilts simultaneously — staggered batches create farrowing chaos in small operations
• Acclimatisation period: 3–4 weeks in quarantine pens before contact with the main herd
• Day 1: blood test for PRRS (even if sourcing from a certified herd — confirm clean)
• Vaccinate: FMD, Mycoplasma hyopneumoniae, Clostridium, E. coli (rotavirus if history)
• Body condition score (BCS) target at first service: 3.0 out of 5

MONTHS 2–4 — Gestation (114 days):
• Gestation length: 3 months, 3 weeks, 3 days (114 days) — predictable and bookable
• Preg check at 21–28 days post-service: ultrasound or Doppler device (R8,000–R20,000)
• Return-to-oestrus protocol: gilts that don't conceive must be re-served within 21 days or culled
• Move gilts to farrowing crates at day 110 — 4 days for acclimatisation before farrowing
• Target average daily gain during gestation: 500–600g/day for gilts

MONTH 5 — First farrowing and first slaughter:
• Farrowing supervision 24/7 — highest piglet mortality is in the first 6 hours
• Piglet targets: 11+ born alive, 10+ weaned per litter at 28 days
• First finisher batch to slaughter: expect initial batch to be smaller — rolling production stabilises from Month 9
• Confirm slaughter booking with abattoir 2 weeks ahead

FIVE ACTIONS THIS WEEK:
1. Contact SAPPO (pork.co.za) — request a list of registered gilt suppliers in ${r.name} and ask for their current weekly producer price indicator
2. Get a quote from a pig production consultant for house design and ventilation spec — this is the highest-impact single decision in the project
3. Open a dedicated piggery cash account — track feed costs, health costs, and pork revenue separately from day one
4. Source your first 2-month feed supply: contact your nearest Feed SA member (feedsa.co.za) for a quote on a ${flock}-sow ration package
5. Verify load-shedding backup power requirements — contact your nearest Eskom office and a generator supplier for farrowing house spec`,
  ];

  return {
    sections: TITLES.map((title, i) => ({ title, body: bodies[i] ?? "" })),
    raw: bodies.join("\n\n"),
    reportData, buyerName, generatedAt: new Date().toISOString(), isSandbox: false,
  };
}

// ── POULTRY BREED SOURCES ─────────────────────────────────────────────────────
const POULTRY_BREED_SOURCES = {
  "Ross 308 Broiler":
    "Ross 308 is the dominant commercial broiler in SA, supplied by Aviagen through local integrators (Astral Foods, Country Bird Holdings, RCL Foods). Day-old Ross 308 chicks are available from hatcheries in Gauteng (Tsakane), Free State (Hennenman), and Western Cape (Paarl). Independent producers without an integrator contract source directly from the hatchery — contact Astral Foods (astral.co.za) or Country Bird (countrybird.co.za) for commercial chick supply agreements. Request the current Ross 308 performance objectives document to benchmark your FCR and mortality against breed standard.",
  "Cobb 500":
    "The Cobb 500 is the second most common commercial broiler in SA, known for slightly higher breast yield than the Ross 308. Cobb genetics are supplied through Cobb-Vantress (cobb-vantress.com) distributors in SA — contact the Cobb Africa technical team for local hatchery referrals. The Cobb 500 performs best under precision ventilation and high-density management. Confirm that your local abattoir or integrator accepts Cobb-line birds before committing to a supply agreement.",
  "Ross 308 Broiler / Free-range":
    "Free-range broiler production in the Western Cape uses the same Ross 308 or Cobb genetics as conventional systems but under slower grow-out (slower-growing strains increasingly available). Genuine free-range certification (SAPA free-range standards — sapa.org.za) adds 30–50% price premium but requires lower stocking density (≤25kg/m²), outdoor access, and third-party audit. Contact SAPA (sapa.org.za) for the free-range certification requirements and approved auditors in the Western Cape.",
  "Lohmann Brown (layers)":
    "The Lohmann Brown is the dominant commercial layer breed in SA. Lohmann genetics are available from Hendrix Genetics (hendrix-genetics.com) South African distributors. Layer pullets (17 weeks) can be sourced from commercial pullet rearers in Gauteng and Western Cape. Layer operations differ fundamentally from broiler economics — consult the layer section of this platform when it becomes available.",
  "Arbor Acres":
    "Arbor Acres is a Cobb-Vantress line used in some SA integrator operations. Performance is similar to Ross 308. Source only through established hatchery supply agreements — Arbor Acres is not widely available to independent producers.",
  "_default":
    "Contact the South African Poultry Association (SAPA — sapa.org.za) for a directory of approved hatcheries and integrators in your province. The SAPA broiler producer members include Country Bird Holdings, Astral Foods, RCL Foods Chicken, and Quantum Foods — all of whom offer contract-growing arrangements in appropriate provinces. For independent day-old chick purchases, request SAPA-registered hatchery referrals and always verify health status (Marek's, IB, ND vaccination at hatch) before accepting a consignment.",
};

// ── POULTRY REPORT ────────────────────────────────────────────────────────────
function generatePoultryReport(reportData, buyerName, T) {
  const { r, flock, lm, carcass, lab, fa, revPE, varPE, vm, be, pp, capital, npv5,
          scaleRows, cfRows, firstPositive, sensRows, yr1, yr2, yr3, mc,
          feedCost, healthCost, productionSystem, marketChannel, feedSource,
          chickCostPerYear, infraPerSlot } = reportData;

  const batchesPerYear  = r.lambing / 100;
  const survivalRate    = r.survival / 100;
  const carcassKgNum    = r.liveKg * (r.dressing / 100);
  const birdsPerSlotPY  = batchesPerYear * survivalRate;

  const lmNote     = lm === "owner"
    ? `owner-operated (${ZAR(lab)}/mo notional — BCEA 2024 hired benchmark ${ZAR(r.hired)}/mo)`
    : `hired worker at ${ZAR(r.hired)}/mo (BCEA 2024 Sectoral Determination + UIF + SDL)`;
  const feedNote   = feedCost !== r.feed
    ? `${ZAR(feedCost)}/slot/yr — client-specified (province benchmark: ${ZAR(r.feed)})`
    : `${ZAR(feedCost)}/slot/yr — ${batchesPerYear.toFixed(0)} batches × feed at FCR ~1.7–1.9 × ${r.liveKg}kg target weight`;
  const healthNote = healthCost !== r.health
    ? `${ZAR(healthCost)}/slot/yr — client-specified (province benchmark: ${ZAR(r.health)})`
    : `${ZAR(healthCost)}/slot/yr — Marek's, Newcastle, IB, Gumboro, IBD at placement + water-soluble vitamins`;
  const chickNote  = `${ZAR(chickCostPerYear ?? batchesPerYear * r.ewePrice)}/slot/yr — ${batchesPerYear.toFixed(0)} batches × R${r.ewePrice}/day-old chick`;
  const profileLine = `Production system: ${productionSystem} · Market channel: ${marketChannel} · Feed source: ${feedSource}`;

  const s20 = sensRows.find(s => s.pct === -20);
  const viabilityVerdict = pp > 0
    ? `VIABLE — this ${flock}-bird-slot commercial broiler operation in ${r.name} is profitable at R${carcass}/kg carcass, generating ${ZAR(pp)}/slot/year net.`
    : `MARGINAL — at ${flock} bird slots, this operation falls below the ${be ?? "?"}-slot breakeven. Fixed costs of ${ZAR(fa)}/yr cannot be covered at current scale. Scale to at least ${be ?? flock + 500} slots to reach viability.`;
  const bankRating = pp > 0 && flock >= (be ?? 0) * 1.2 ? "STRONG" : pp > 0 ? "MODERATE" : "MARGINAL";
  const breedSource = POULTRY_BREED_SOURCES[r.breed] || POULTRY_BREED_SOURCES["_default"];
  const scaleStr = scaleRows.filter((_,i) => i % 2 === 0)
    .map(rw => `${rw.n.toLocaleString()} slots: profit/slot ${ZAR(rw.fp / rw.n)} · total profit ${ZAR(rw.fp)} · ROI ${PCT(rw.roi)}`)
    .join("\n");
  const sensTable = sensRows.filter(s => [-20,-10,0,10,20].includes(s.pct))
    .map(s => `  ${s.pct>0?"+":""}${s.pct}% (R${s.adj.toFixed(0)}/kg): profit/slot ${ZAR(s.pp)} · ROI ${PCT(s.roi)} · BE ${s.be?.toLocaleString()||"∞"} slots`)
    .join("\n");
  const cfTable = cfRows.filter(row => row.rev > 0 || row.m === 1 || row.m % 12 === 0)
    .map(rw => `Mo ${rw.m} (${rw.mo} Yr${rw.yr}): Rev ${ZAR(rw.rev)} · Cost ${ZAR(rw.cost)} · P&L ${ZAR(rw.profit)} · Cum ${ZAR(rw.cum)}`)
    .join("\n");
  const infraTotal = (infraPerSlot ?? 300) * flock;

  const TITLES = [
    "Executive Summary", "Regional Analysis", "Breed & Production System",
    "Financial Model & Assumptions", "36-Month Cashflow Analysis",
    "Scale & Breakeven Analysis", "Risk Analysis & Sensitivity",
    "Capital Structure & Financing", "Implementation Roadmap",
  ];

  const bodies = [
    `${viabilityVerdict}

Operation profile: ${flock.toLocaleString()}-slot commercial broiler operation in ${r.name}. ${batchesPerYear.toFixed(0)} batches/year · ${r.liveKg}kg target weight · ${r.dressing}% dressing · ${(survivalRate * 100).toFixed(0)}% flock survival. System: ${productionSystem} · Market: ${marketChannel} · Labour: ${lmNote}.

Key financials: Revenue ${ZAR(revPE)}/slot/yr · Variable cost ${ZAR(varPE)}/slot · Variable margin ${ZAR(vm)}/slot · Fixed annual ${ZAR(fa)} · Breakeven ${be?.toLocaleString() ?? "N/A"} slots · Profit/slot ${ZAR(pp)}/yr · Total flock profit ${ZAR(pp * flock)}/yr · Capital required ${ZAR(capital)} · 5-year NPV at 10%: ${ZAR(npv5)}.

Cashflow: First batch harvested Month 2. Steady monthly revenue from Month 2. Three-year trajectory: Year 1 cumulative ${ZAR(yr1)} · Year 2 ${ZAR(yr2)} · Year 3 ${ZAR(yr3)}.

Land Bank bankability: ${bankRating}. ${bankRating === "STRONG" ? "Strong continuous monthly revenue from Month 2 — commercial broilers generate the most predictable monthly cashflow of all SA livestock enterprises." : bankRating === "MODERATE" ? "Viable at current scale — fixed-cost dilution improves rapidly with additional bird slots." : `Below the ${be?.toLocaleString()}-slot breakeven. Scale up or improve variable margin before committing infrastructure capital.`}`,

    `${r.name} — ${r.climate}.

Commercial broiler production in ${r.name}: ${r.why}

Market infrastructure: ${r.market}.

${r.name} broiler productivity context: The model uses ${batchesPerYear.toFixed(0)} batches/year at ${r.liveKg}kg target weight and ${(survivalRate * 100).toFixed(0)}% flock survival — reflecting local climate, ventilation requirements, and market cycle. SA commercial benchmark: 6.0–6.5 batches/yr at FCR 1.60–1.75 in well-managed tunnel-ventilated houses. Below-average operations: >1.90 FCR, <94% survival.

Feed cost is the largest input in ${r.name}: ${feedNote}. Feed (maize-soya ration) represents 60–65% of total production cost at commercial scale. Maize price is the single most volatile variable — SA producers experienced 35–40% maize price spikes during the 2022–2023 drought cycle.

${r.tip ? `Provincial insight: ${r.tip}` : ""}`,

    `${r.breed} — the primary commercial broiler for ${r.name}.

Production parameters used in this model:
• Batches per year: ${batchesPerYear.toFixed(0)} (38-day grow cycle + 7-day cleanout)
• Birds marketed per slot per year: ${birdsPerSlotPY.toFixed(2)} (batches × survival rate)
• Slaughter weight: ${r.liveKg}kg live · Carcass: ${carcassKgNum.toFixed(2)}kg (${r.dressing}% dressing)
• Chick cost: R${r.ewePrice}/day-old chick · Annual chick spend: ${chickNote}
• Revenue per slot per year at R${carcass}/kg carcass: ${ZAR(Math.round(revPE))}

Breed note for ${r.name}: ${r.breed.includes("free-range") || r.breed.includes("Free-range")
  ? `Free-range certification (SAPA standards) requires outdoor access, lower stocking density (≤25kg/m²), and slower grow-out to 56–63 days. Revenue premium: 30–50% above conventional — but capital cost per slot is 40–60% higher and throughput is lower (4–5 batches/yr vs 6). Confirm premium market access before committing to free-range spec.`
  : `The Ross 308 / Cobb 500 commercial broiler delivers the best FCR (1.60–1.80) and growth rate available in SA commercial production. On a correctly balanced ration (18–20% CP starter / 17% grower / 16% finisher), these breeds consistently achieve 2.4–2.6kg live weight at 38 days in SA tunnel-ventilated houses.`}

Contract growing vs independent:
${r.name === "Gauteng" || r.name === "Free State" || r.name === "Western Cape"
  ? `${r.name} has active integrator operations (Astral Foods, Country Bird, RCL Foods). Contract growing eliminates chick, feed, and medication procurement risk — the integrator supplies all inputs and pays a contract growing fee of approximately R1.80–2.50 per kg live weight produced. The trade-off: margin is lower but risk is dramatically reduced. For new entrants, contract growing is the recommended starting model.`
  : `${r.name} has limited integrator coverage — most operations are independent. This means direct chick, feed, and medication procurement, and direct abattoir relationships. Independent operations have higher upside but require active supply chain management.`}

Where to source stock: ${breedSource}`,

    `Financial model assumptions — SA commercial broiler benchmark.

Revenue assumptions:
• Batches per year: ${batchesPerYear.toFixed(0)} · Survival: ${(survivalRate*100).toFixed(0)}%
• Slaughter weight: ${r.liveKg}kg live · Dressing: ${r.dressing}% · Carcass: ${carcassKgNum.toFixed(2)}kg
• Carcass price: R${carcass}/kg (verify current SAPA producer indicator — sapa.org.za)
• Revenue per slot per year: ${ZAR(Math.round(revPE))}

Cost assumptions:
• Feed: ${feedNote}
• Chick cost: ${chickNote}
• Health / vaccines: ${healthNote}
• Labour: ${lmNote}
• Overhead: ${ZAR(r.oh)}/mo — electricity (ventilation, heating, lighting), water, vehicle, cleaning materials
• ${profileLine}

Variable margin of ${ZAR(vm)}/slot/yr is the key driver. Every slot above breakeven (${be?.toLocaleString() ?? "N/A"}) adds ${ZAR(vm)} directly to profit. Feed (60–65% of variable cost) and chick price (15–18%) are the two inputs to track weekly — they move together when maize prices spike.

Note on carcass price: SA producer prices for whole broiler carcass track the SAPA weekly price indicator. The R${carcass}/kg used here represents current market conditions — recheck quarterly when reviewing expansion decisions.`,

    `Broiler cashflow — ${flock.toLocaleString()} bird slots, continuous batch cycling.

Month 1 — Setup: House preparation, biosecurity setup, first chick placement. No revenue. Monthly cost: ${ZAR(Math.round(mc))}.
Month 2 onwards — Steady revenue: First batch harvested at ~38 days. Monthly carcass revenue: ${ZAR(Math.round((revPE * flock) / 12))}/month continuously.

Month-by-month cashflow (harvest months and year-ends shown):
${cfTable}

Year 1 cumulative: ${ZAR(yr1)}. Year 2: ${ZAR(yr2)}. Year 3: ${ZAR(yr3)}.

Cash-flow advantage: Commercial broilers generate monthly revenue from Month 2 — the fastest cash cycle of all SA livestock enterprises. At steady state, you receive payment every 38–45 days. This predictability makes broiler cashflow substantially more bankable than sheep (annual) or cattle (18-month cycles).

Working capital: The 2-batch working capital buffer of ${ZAR(Math.round(mc * 2))} covers input costs for two batch cycles before revenue arrives. Do not start a broiler operation with less than this reserve — late payment from processors has caused multiple SA small-producer insolvencies.`,

    `Breakeven: ${be?.toLocaleString() ?? "N/A"} bird slots. Variable margin of ${ZAR(vm)}/slot/yr covers fixed overhead of ${ZAR(fa)}/yr at this scale.

${scaleStr}

Your position: ${flock.toLocaleString()} slots${be && flock < be ? ` — ${(be - flock).toLocaleString()} slots below breakeven` : be ? ` — ${(flock - be).toLocaleString()} slots above breakeven (${PCT((flock - be) / be)} headroom)` : ""}.

Scale insight: Broiler economics improve sharply between 1,000 and 10,000 bird slots because fixed costs (one worker, one overhead account) are spread over more slots. The difference between 2,000 and 5,000 slots does not require an additional worker — it requires a larger house. This fixed-cost leverage makes scaling up the single most powerful profitability lever in broiler production.

At what scale does this become a primary income? ${vm > 0 ? `${Math.round((fa + 400000) / vm).toLocaleString()} slots generate approximately R400,000/year net — a single full-time income.` : "Improve variable margin first."}`,

    `1. CHICKEN PRICE RISK (Revenue volatility)
${sensTable}

At a 20% price drop (to R${s20?.adj.toFixed(0) ?? "?"}/kg): ${s20 && s20.pp < 0 ? `this ${flock.toLocaleString()}-slot operation falls below breakeven. SA broiler prices track SAPA's weekly index — plan a 3-month cash buffer of ${ZAR(Math.round(mc * 3))} for sustained price troughs.` : `profit/slot drops to ${ZAR(s20?.pp ?? 0)} — this operation remains viable even in a price trough.`}

Import competition note: SA chicken imports (primarily EU and US bone-in portions) are the primary price-depressing force in the local market. Anti-dumping duties help but are unpredictable in duration. Whole-bird fresh market (vs frozen portions) is less exposed to import competition.

2. FEED / MAIZE PRICE RISK (Dominant input — 60–65% of variable cost)
A 20% maize price increase in ${r.name} increases annual feed cost by approximately ${ZAR(Math.round(feedCost * 0.13 * flock))}/yr for this ${flock.toLocaleString()}-slot operation (assuming 65% maize content). Mitigation: negotiate fixed-price quarterly feed supply contracts; consider buying maize forward at cooperative grain stores; operations in maize-belt provinces (Free State, North West) have structural feed cost advantage.

3. DISEASE RISK (Notifiable — can shut down an operation in 24 hours)
Avian Influenza (H5N1): SA has experienced multiple H5N1 outbreaks since 2017. AI is a notifiable disease — all birds must be culled and the operation quarantined for 6–12 months. DAFF (daff.gov.za) compensates at regulated values, not market value. Biosecurity (footbaths, visitor log, separate clothing, rodent control) is mandatory.
Newcastle Disease (ND): Endemic in SA. Compulsory vaccination program — never skip. Unvaccinated flocks can suffer 80–100% mortality in 3–5 days.
Infectious Bronchitis (IB) and Gumboro (IBD): Standard vaccination at day 1 and 14. Ask your vet for a current vaccination schedule optimised for ${r.name} strains.

4. ESKOM / LOAD-SHEDDING RISK (Ventilation is life-critical)
A ${flock.toLocaleString()}-slot tunnel-ventilated broiler house uses approximately ${Math.round(flock * 0.025)} kW of ventilation capacity. Above Stage 4, temperatures inside an unventilated house can reach 40°C+ within 30 minutes — causing rapid heat-stress mortality. Budget for a diesel generator sized to run all fans (minimum ${Math.round(flock * 0.025)} kW) as a non-negotiable capital item. Monthly generator fuel allowance: approximately ${ZAR(Math.round(flock * 0.8))}/month for Stage 4+ load-shedding.

5. WATER SUPPLY RISK
Broilers consume approximately 1.8× their body weight in water daily — a ${flock.toLocaleString()}-slot house at peak consumes ${Math.round(flock * 2.5 * 0.0018 * 1000)} litres/day. A 3-day water failure will cause significant mortality and condemns birds at slaughter for dehydration. Install a minimum ${Math.round(flock * 0.003)} m³ reserve water tank and service nipple drinkers monthly.`,

    `Total capital required: ${ZAR(capital)}.

Infrastructure (bird house + equipment): ${ZAR(infraTotal)}
  (${flock.toLocaleString()} bird slots × R${infraPerSlot ?? 300}/slot — tunnel-ventilated commercial house including curtains, feeders, drinkers, fans, and heaters)
Working capital (2-batch cycle buffer): ${ZAR(Math.round(mc * 2))}
  (Monthly opex ${ZAR(Math.round(mc))} × 2 months — covers inputs for the first two batches before first payment)

Note: The R${infraPerSlot ?? 300}/slot figure represents a moderate-spec tunnel house. Actual infrastructure cost ranges:
• Starter-spec (manual feeders, natural ventilation): R150–200/slot
• Standard commercial (semi-automated, 6 tunnel fans): R250–400/slot
• High-spec (fully automated, GPS evaporative cooling): R400–600/slot
Obtain 3 contractor quotes before committing — poultry house costs vary significantly by region and spec.

Generator capital (non-negotiable add-on): R${Math.round(flock * 0.025 * 4500).toLocaleString()} estimated — diesel generator rated ${Math.round(flock * 0.025)} kW.

Financing options:
• Land Bank Production Credit: broiler operations with confirmed integrator or abattoir contracts qualify for short-term seasonal credit. Contact your nearest Land Bank branch with this feasibility report and your supply contract.
• ABSA Agri / FNB Agri Asset Finance: broiler houses qualify as agricultural assets. 60–84 month financing at 1–3% above prime. Monthly instalment: approximately ${ZAR(Math.round(infraTotal * 0.022))}/month (at 84 months, prime+2%).
• SAPA financial support: SAPA (sapa.org.za) coordinates access to industry support programs and government CASP/MAFISA grants for smallholder and commercial entrants.
• Own capital: strongly preferred for infrastructure — the 2-batch working capital requirement is short enough to self-fund if infrastructure is financed separately.`,

    `PHASE 1 — Site preparation and approvals (Months 1–2):
• Select a site with reliable water supply, 3-phase power (or generator access), good drainage, and prevailing wind aligned with house orientation (long axis perpendicular to wind)
• Obtain municipal or rural council zoning approval — broiler houses require agricultural zoning and environmental impact (EIA) for operations above 10,000 birds in some provinces
• Engage a poultry production consultant for house design spec — tunnel ventilation orientation, fan sizing, evaporative cooling, and litter management are not DIY decisions
• Contact SAPA (sapa.org.za) — join as a producer member and request the Broiler Standards of Practice document

PHASE 2 — Construction (Months 2–4):
• House construction: ${Math.round(flock / 17)} m² floor area required (at 17 birds/m² commercial density)
• Install generator backup for all fans and farrowing heaters before first chick placement
• Litter preparation: 100mm pine shavings or rice husks; compost litter between batches
• Register the operation with your provincial DAFF office — mandatory biosecurity registration for bird flocks above 250 in SA

PHASE 3 — First batch and ramp-up (Month 1 of operation):
• Source ${flock.toLocaleString()} day-old chicks from an approved SAPA-registered hatchery: ${breedSource.split(".")[0]}.
• Chick placement: preheat house to 33°C and humidity 55–60% before chicks arrive — cold chicks in the first 24 hours cause irreversible production loss
• Weeks 1–2 (Brooding): maintain temperature gradient 33°C→28°C; check nipple drinkers every 4 hours; cull non-starters on Day 2
• Vaccinate at Day 1 (Marek's, ND, IB — done at hatchery), Day 7 (IB booster via drinking water), Day 14 (Gumboro via drinking water), Day 21 (ND booster)
• Week 3–5 (Grow-out): maintain 25–28°C; ad-libitum feeding; adjust stocking density as birds grow; monitor FCR weekly
• Day 38 (Harvest): book abattoir 2 weeks ahead; weigh test batch from 3 sections of house; catch and load at night to minimise stress

FIVE ACTIONS THIS WEEK:
1. Contact SAPA (sapa.org.za) — request the Broiler Producer Member directory and ask for the current weekly chicken price indicator in ${r.name}
2. Get a quote from a poultry house contractor — request a ${flock.toLocaleString()}-slot tunnel-ventilated house spec with equipment (fans, feeders, drinkers, litter) included
3. Contact your nearest integrator (Astral Foods, Country Bird, RCL Foods) or abattoir and confirm chick supply availability and current contract-grower terms in ${r.name}
4. Apply for Land Bank or ABSA Agri pre-qualification — provide this feasibility report as supporting documentation
5. Confirm power supply: test 3-phase availability (or quote generator cost) and check water pressure at the proposed house site`,
  ];

  return {
    sections: TITLES.map((title, i) => ({ title, body: bodies[i] ?? "" })),
    raw: bodies.join("\n\n"),
    reportData, buyerName, generatedAt: new Date().toISOString(), isSandbox: false,
  };
}

// ── DISPATCHER ────────────────────────────────────────────────────────────────
export function generateProReport(reportData, buyerName, terms) {
  const T = terms ?? { unit:"ewe", units:"ewes", group:"flock", young:"lamb", youngs:"lambs", rateLabel:"Lambing" };
  if (T.unit === "hive")  return generateBeesReport(reportData, buyerName, T);
  if (T.unit === "cow")   return generateCattleReport(reportData, buyerName, T);
  if (T.unit === "doe")   return generateGoatsReport(reportData, buyerName, T);
  if (T.unit === "sow")   return generatePigsReport(reportData, buyerName, T);
  if (T.unit === "bird")  return generatePoultryReport(reportData, buyerName, T);
  return generateSheepReport(reportData, buyerName, T);
}
