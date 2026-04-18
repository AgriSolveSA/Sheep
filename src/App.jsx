import { useState, useEffect, useMemo, useCallback, Component } from "react";
import { buildReportData, generateReport, generateSandboxReport } from "./reportEngine.js";
import { ZAR, PCT, SGN, MONTHS } from "./utils.js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";

// Fix Leaflet default icon URLs broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// GADM 4.1 province name → PROVINCE_DATA key
const PROV_NAME_MAP = {
  "Eastern Cape":  "eastern_cape",
  "Free State":    "free_state",
  "Gauteng":       "gauteng",
  "KwaZulu-Natal": "kwazulu_natal",
  "Limpopo":       "limpopo",
  "Mpumalanga":    "mpumalanga",
  "North West":    "north_west",
  "Northern Cape": "northern_cape",
  "Western Cape":  "western_cape",
};

const PROVINCE_DATA = {
  limpopo: {
    name:"Limpopo", short:"Limpopo",
    fill:"#d4510e", stroke:"#8a3408", hoverFill:"#e86522",
    climate:"Bushveld · Semi-arid · 400–600mm summer rain · Hot",
    rainfall:"400–600mm", season:"Summer", frost:"None", humidity:"Low",
    parasites:"Medium", drought:"Frequent", sheepDensity:"Medium",
    primary:["Meatmaster","Dorper"],
    secondary:["Damara","Van Rooy"],
    avoid:["Merino","Dohne Merino"],
    why:"Bushveld heat and summer rainfall suit hardy hair breeds perfectly. Meatmaster was specifically bred for these Limpopo conditions. Merino suffers heat stress and parasite load in the lowveld. Damara thrives in the drier western areas.",
    tip:"Vaalwater area: 21ha bushveld carries ~20–30 ewes. Need irrigated pasture or external grazing to scale beyond 50.",
    breed:"Meatmaster",  type:"Meat", market:"Polokwane abattoirs · Bela-Bela auction · RCL Polokwane",
    rep:15, oh:600, labour:1500, hired:5594, woolMonth:0,
    lambing:150, survival:85, liveKg:38, dressing:48, wool:0, feed:500, health:180, ewePrice:2800, be:41,
  },
  north_west: {
    name:"North West", short:"N. West",
    fill:"#c8900a", stroke:"#8a6006", hoverFill:"#daa812",
    climate:"Semi-arid Bushveld · 300–500mm · Hot and dry",
    rainfall:"300–500mm", season:"Summer", frost:"Light", humidity:"Low",
    parasites:"Low", drought:"Very frequent", sheepDensity:"Medium",
    primary:["Dorper","Meatmaster","Van Rooy"],
    secondary:["Damara"],
    avoid:["Merino","Dormer"],
    why:"Dry, hot conditions with sparse, unreliable grazing. Low-input hair breeds dominate commercial operations. Dorper is the commercial king with its year-round breeding advantage. Wool breeds struggle without irrigation.",
    tip:"Commercial Dorper operations in North West typically run 200–800 ewes. Smaller flocks become viable with irrigated lucerne supplementation.",
    breed:"Dorper", type:"Meat", market:"Vryburg abattoir · Lichtenburg auction · local feedlots",
    rep:15, oh:600, labour:1500, hired:5594, woolMonth:0,
    lambing:150, survival:83, liveKg:36, dressing:50, wool:0, feed:500, health:180, ewePrice:3200, be:51,
  },
  gauteng: {
    name:"Gauteng", short:"Gauteng",
    fill:"#1a70b0", stroke:"#104678", hoverFill:"#2288cc",
    climate:"Highveld · 700mm summer rain · Moderate temps",
    rainfall:"700mm", season:"Summer", frost:"Moderate", humidity:"Medium",
    parasites:"Medium", drought:"Occasional", sheepDensity:"Low",
    primary:["Dorper","Dormer","SAMM"],
    secondary:["Dohne Merino"],
    avoid:[],
    why:"Small province but excellent market access — proximity to Johannesburg abattoirs increases margins significantly. Moderate highveld climate suits most commercial breeds. Dorper for meat, dual-purpose where pasture available.",
    tip:"Gauteng's biggest advantage is logistics — you're 1–2 hours from the largest lamb markets in SA. Factor this into your price assumptions.",
    breed:"Dorper", type:"Meat", market:"Karan Beef Balfour · Irene abattoir · Joburg fresh market",
    rep:15, oh:600, labour:1500, hired:5594, woolMonth:0,
    lambing:130, survival:82, liveKg:38, dressing:48, wool:80, feed:550, health:190, ewePrice:2800, be:71,
  },
  mpumalanga: {
    name:"Mpumalanga", short:"Mpuma-\nlanga",
    fill:"#1a7a3c", stroke:"#0e4a24", hoverFill:"#229850",
    climate:"Highveld + Lowveld · 600–800mm · Moderate–hot",
    rainfall:"600–800mm", season:"Summer", frost:"Moderate highland", humidity:"High lowveld",
    parasites:"Medium–high", drought:"Rare", sheepDensity:"Medium",
    primary:["Dorper","Meatmaster","SAMM"],
    secondary:["Dohne Merino"],
    avoid:[],
    why:"Ermelo (highveld) is one of SA's largest wool-producing districts. The highveld suits dual-purpose breeds well. Lowveld areas face higher parasite pressure and follow Limpopo breed patterns.",
    tip:"Highveld Mpumalanga is ideal for SAMM dual-purpose. Wool adds R200–400/ewe supplementary income on top of meat.",
    breed:"SAMM", type:"Dual", market:"Ermelo wool auctions · Dawn Meats · local abattoirs",
    rep:15, oh:600, labour:1500, hired:5594, woolMonth:8,
    lambing:130, survival:82, liveKg:38, dressing:48, wool:120, feed:550, health:190, ewePrice:2700, be:61,
  },
  free_state: {
    name:"Free State", short:"Free State",
    fill:"#c44a14", stroke:"#883008", hoverFill:"#d85e22",
    climate:"Grassland · 400–600mm · Cold winters · Hard frost",
    rainfall:"400–600mm", season:"Summer", frost:"Heavy", humidity:"Low–medium",
    parasites:"Low", drought:"Moderate", sheepDensity:"High",
    primary:["Merino","SAMM","Dohne Merino"],
    secondary:["Dorper","Dormer"],
    avoid:["Damara","Namaqua Afrikaner"],
    why:"South Africa's wool heartland. The Karoo transition zone suits fine-wool Merino perfectly. Hard winters actually benefit Merino fleece weight and staple strength. Cold kills the hardiness advantage of arid breeds — Damara's fat reserves aren't adapted to prolonged frost.",
    tip:"Free State Merino farms typically run 300–1,500 ewes to be viable. Wool income (R400–700/ewe) is what makes the economics work at scale.",
    breed:"Merino", type:"Wool", market:"Cape Wool Board · Bloemfontein auction · local cooperatives",
    rep:15, oh:650, labour:1500, hired:5594, woolMonth:8,
    lambing:110, survival:80, liveKg:32, dressing:47, wool:550, feed:650, health:220, ewePrice:2400, be:87,
  },
  kwazulu_natal: {
    name:"KwaZulu-Natal", short:"KZN",
    fill:"#0a7c64", stroke:"#065040", hoverFill:"#0e9878",
    climate:"Subtropical coast + Drakensberg · High rainfall · Humid",
    rainfall:"600–1200mm", season:"Summer", frost:"Highlands only", humidity:"High",
    parasites:"High", drought:"Rare coastal", sheepDensity:"Low–medium",
    primary:["Dorper","Blackhead Persian"],
    secondary:["Meatmaster"],
    avoid:["Merino"],
    why:"High humidity and intense internal parasite pressure. Haemonchus contortus (wire worm) is particularly severe. Only breeds with genuine parasite resistance survive here. Merino wool felts in the humidity. Dorper's FAMACHA resistance traits give it a decisive advantage.",
    tip:"KZN farmers save significantly on veterinary costs with resistant breeds. Dorper dosing intervals can be 3–4x longer than wool breeds in this climate.",
    breed:"Dorper", type:"Meat", market:"Tongaat abattoir · Newcastle auction · coastal fresh markets",
    rep:15, oh:600, labour:1500, hired:5594, woolMonth:0,
    lambing:150, survival:83, liveKg:36, dressing:50, wool:0, feed:500, health:180, ewePrice:3200, be:51,
  },
  eastern_cape: {
    name:"Eastern Cape", short:"E. Cape",
    fill:"#a06410", stroke:"#6a4208", hoverFill:"#b87820",
    climate:"Karoo interior + Coastal · 200–700mm · Highly variable",
    rainfall:"200–700mm", season:"Mixed", frost:"Karoo interior", humidity:"Variable",
    parasites:"Low–medium", drought:"Karoo frequent", sheepDensity:"Very high",
    primary:["Merino","Dorper","Dohne Merino"],
    secondary:["SAMM"],
    avoid:[],
    why:"The most diverse sheep province in SA — nearly 40% of the country's commercial flock is here. The Great Karoo is the Merino heartland. Coastal midlands suit dual-purpose breeds. Dorper dominates in the arid Karoo. Eastern Cape has the most sophisticated sheep farming infrastructure of any province.",
    tip:"Eastern Cape auction prices are often 8–12% lower than Gauteng — transport costs real money. Calculate your abattoir distance carefully.",
    breed:"Merino", type:"Wool", market:"Cape Wool Board · Graaff-Reinet auction · Eastern Cape cooperatives",
    rep:15, oh:600, labour:1500, hired:5594, woolMonth:8,
    lambing:120, survival:82, liveKg:34, dressing:47, wool:260, feed:600, health:200, ewePrice:2600, be:109,
  },
  western_cape: {
    name:"Western Cape", short:"W. Cape",
    fill:"#6a2a94", stroke:"#481a64", hoverFill:"#8038b0",
    climate:"Mediterranean · Winter rainfall · 200–800mm · Cool winters",
    rainfall:"200–800mm", season:"Winter (Cape)", frost:"Light–moderate", humidity:"Moderate",
    parasites:"Low–medium", drought:"Summer droughts common", sheepDensity:"High",
    primary:["Dormer","Merino","SAMM"],
    secondary:["Ile de France","Dorper"],
    avoid:["Damara","Namaqua Afrikaner"],
    why:"The only winter-rainfall region in SA — a fundamentally different farming system. Dormer was bred in the 1920s specifically for this climate. Merino thrives on Renosterveld and fynbos. Cool winters produce excellent wool quality. Summer drought is the main risk.",
    tip:"Western Cape's biggest risk is summer feed gap. Successful operations plan winter grazing cycles precisely. Dormer ewes bred on cereal stubble after winter crop is the classic system.",
    breed:"Dormer", type:"Meat", market:"Abattoir Bragança · Boland Agri auction · Cape fresh markets",
    rep:15, oh:650, labour:1500, hired:5594, woolMonth:6,
    lambing:130, survival:82, liveKg:38, dressing:48, wool:220, feed:600, health:190, ewePrice:2600, be:54,
  },
  northern_cape: {
    name:"Northern Cape", short:"N. Cape",
    fill:"#a81818", stroke:"#700e0e", hoverFill:"#c02020",
    climate:"Karoo · Hyper-arid · 50–250mm · Extreme heat + cold",
    rainfall:"50–250mm", season:"Erratic", frost:"Heavy nights", humidity:"Very low",
    parasites:"Very low", drought:"Severe, frequent", sheepDensity:"Very low",
    primary:["Dorper","Damara","Namaqua Afrikaner"],
    secondary:["Van Rooy","Blackhead Persian"],
    avoid:["Merino","Dormer","Ile de France","Dohne Merino"],
    why:"SA's most extreme farming environment. 4–10 ha per sheep on natural Karoo grazing. Only breeds with genuine desert adaptation survive without heavy supplementation. Namaqua Afrikaner and Damara are indigenous to exactly these conditions — fat reserves, drought metabolism, and parasite resistance are unmatched.",
    tip:"Northern Cape farms measure land in hectares per sheep, not sheep per hectare. Capital cost is very low (no infrastructure needed) but scale requirement is very high (300+ ewes to cover fixed costs).",
    breed:"Dorper", type:"Meat", market:"Upington · De Aar · Prieska local abattoirs · long-haul to Gauteng",
    rep:15, oh:550, labour:1500, hired:5594, woolMonth:0,
    lambing:110, survival:88, liveKg:30, dressing:45, wool:0, feed:350, health:120, ewePrice:2200, be:148,
  },
};

function calcFull(reg, carcass, flockSize, labour, overhead = reg.oh ?? 600, extraCosts = {}) {
  // ── Extra farmer-entered costs ────────────────────────────────────────────
  const {
    bond        = 0,    // monthly bond / finance repayment
    feedOverride  = null, // per ewe/year override (null = use province default)
    healthOverride = null,
    fencing     = 0,    // monthly fencing / infrastructure maintenance
    misc        = 0,    // monthly miscellaneous
  } = extraCosts;

  const feedCost    = feedOverride   !== null ? feedOverride   : reg.feed;
  const healthCost  = healthOverride !== null ? healthOverride : reg.health;
  const extraFixed  = bond + fencing + misc; // extra monthly fixed outgoings

  // ── Per-ewe steady-state economics ───────────────────────────────────────
  const lambsPerEwe    = (reg.lambing / 100) * (reg.survival / 100) * 0.85;
  const carcassKg      = reg.liveKg * (reg.dressing / 100);
  const lambRevPerEwe  = lambsPerEwe * carcassKg * carcass;
  const woolRevPerEwe  = reg.wool;
  const totalRevPerEwe = lambRevPerEwe + woolRevPerEwe;

  const labourShare    = (labour * 12) / flockSize;
  const overheadShare  = ((overhead + extraFixed) * 12) / flockSize;
  const replaceCost    = reg.ewePrice * (reg.rep / 100);
  const totalCostPerEwe = feedCost + healthCost + labourShare + overheadShare + replaceCost;

  const profitPerEwe   = totalRevPerEwe - totalCostPerEwe;
  const roi            = profitPerEwe / reg.ewePrice;
  const payback        = profitPerEwe > 0 ? reg.ewePrice / profitPerEwe : null;

  // ── Breakeven (minimum viable flock size) ────────────────────────────────
  const varMargin   = lambRevPerEwe + woolRevPerEwe - feedCost - healthCost - replaceCost;
  const fixedAnnual = (labour + overhead + extraFixed) * 12;
  const breakeven   = varMargin > 0 ? Math.ceil(fixedAnnual / varMargin) : null;

  // ── Capital structure: ewe purchase + 12-month working capital buffer ────
  const ewePurchase    = flockSize * reg.ewePrice;
  const monthlyOpex    = (feedCost / 12 + healthCost / 12) * flockSize
                         + labour + overhead + extraFixed
                         + reg.ewePrice * (reg.rep / 100) * flockSize / 12;
  const workingCapital = Math.round(monthlyOpex * 12);
  const capital        = ewePurchase + workingCapital;

  // ── Cost breakdown for display ────────────────────────────────────────────
  const costBreakdown = {
    feed:     { label: "Feed",             annual: feedCost * flockSize,         perEwe: feedCost },
    health:   { label: "Meds / vet",       annual: healthCost * flockSize,       perEwe: healthCost },
    labour:   { label: "Labour",           annual: labour * 12,                  perEwe: labourShare },
    overhead: { label: "Overhead",         annual: overhead * 12,                perEwe: (overhead * 12) / flockSize },
    replace:  { label: "Replacements",     annual: replaceCost * flockSize,      perEwe: replaceCost },
    bond:     { label: "Bond repayment",   annual: bond * 12,                    perEwe: (bond * 12) / flockSize },
    fencing:  { label: "Fencing / infra",  annual: fencing * 12,                 perEwe: (fencing * 12) / flockSize },
    misc:     { label: "Miscellaneous",    annual: misc * 12,                    perEwe: (misc * 12) / flockSize },
  };

  // ── Scale rows: MVO → 2 000 ewes ─────────────────────────────────────────
  const scaleRows = [20, 50, 100, 200, 500, 1000, 2000].map(n => {
    const ls   = (labour * 12) / n;
    const os   = ((overhead + extraFixed) * 12) / n;
    const cost = feedCost + healthCost + ls + os + replaceCost;
    const p    = totalRevPerEwe - cost;
    return { n, rev: totalRevPerEwe * n, profit: p * n, roi: p / reg.ewePrice };
  });

  // ── 36-month cashflow with breeding cycles ────────────────────────────────
  const lambCropRev = lambRevPerEwe * flockSize;

  const cf36 = Array.from({ length: 36 }, (_, i) => {
    const m = i + 1;
    let lambRev = 0, woolRev = 0;
    if (m === 13 || m === 25) lambRev = lambCropRev;
    if (reg.wool > 0 && reg.woolMonth > 0) {
      for (let yr = 0; yr <= 2; yr++) {
        if (m === reg.woolMonth + yr * 12) woolRev = woolRevPerEwe * flockSize;
      }
    }
    const rev = lambRev + woolRev;
    return { m, rev, lambRev, woolRev, cost: monthlyOpex, profit: rev - monthlyOpex };
  });

  let cum = -ewePurchase;
  cf36.forEach(r => { cum += r.profit; r.cum = Math.round(cum); });

  const firstProfitMonth = cf36.find(r => r.profit > 0)?.m ?? null;
  const paybackMonth     = cf36.find(r => r.cum >= 0)?.m ?? null;

  // ── Year 1 slice (backward-compat with reportEngine) ─────────────────────
  const yr1 = cf36.slice(0, 12);

  // ── MVO capital ───────────────────────────────────────────────────────────
  let mvoCapital = null;
  if (breakeven) {
    const mvoOpex = (feedCost / 12 + healthCost / 12) * breakeven + labour + overhead + extraFixed
                    + reg.ewePrice * (reg.rep / 100) * breakeven / 12;
    mvoCapital = breakeven * reg.ewePrice + Math.round(mvoOpex * 12);
  }

  // ── 5-year NPV (10% discount rate) ───────────────────────────────────────
  const annualFlockProfit = profitPerEwe * flockSize;
  const npv5 = [-ewePurchase, ...Array(5).fill(annualFlockProfit)]
    .reduce((acc, v, i) => acc + v / Math.pow(1.10, i), 0);

  return {
    lambsPerEwe, carcassKg, lambRevPerEwe, woolRevPerEwe, totalRevPerEwe,
    labourShare, overheadShare, replaceCost, totalCostPerEwe,
    profitPerEwe, roi, payback, breakeven,
    ewePurchase, workingCapital, capital, mvoCapital,
    flockRev: totalRevPerEwe * flockSize,
    flockProfit: profitPerEwe * flockSize,
    varMargin, fixedAnnual,
    costBreakdown, feedCost, healthCost, extraFixed,
    scaleRows, yr1, cf36, npv5,
    firstProfitMonth, paybackMonth,
  };
}

const PF = {
  merchantId:  import.meta.env?.VITE_PF_MERCHANT_ID  || "REPLACE_MERCHANT_ID",
  merchantKey: import.meta.env?.VITE_PF_MERCHANT_KEY || "REPLACE_MERCHANT_KEY",
  passphrase:  import.meta.env?.VITE_PF_PASSPHRASE   || "REPLACE_PASSPHRASE",
  returnUrl:   "https://agrimodel.co.za/success",
  cancelUrl:   "https://agrimodel.co.za/",
  notifyUrl:   "https://agrimodel.co.za/api/payfast-notify",
  sandbox:     true,   // ← set false + add real creds in .env to go live
  price:       1500,
};

function buildPFUrl(name, email, region) {
  const base = PF.sandbox
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";
  const p = new URLSearchParams({
    merchant_id: PF.merchantId, merchant_key: PF.merchantKey,
    return_url: PF.returnUrl, cancel_url: PF.cancelUrl, notify_url: PF.notifyUrl,
    name_first: name.split(" ")[0] || name,
    name_last: name.split(" ").slice(1).join(" ") || ".",
    email_address: email || "customer@agrimodel.co.za",
    m_payment_id: `AGRI-${region}-${Date.now()}`,
    amount: PF.price.toFixed(2),
    item_name: `Agrimodel Pro — ${PROVINCE_DATA[region]?.name || "SA"} Sheep Feasibility Report`,
    item_description: "9-section professional sheep farming feasibility report",
  });
  return `${base}?${p.toString()}`;
}

const PALETTE = {
  bg:"#080f06", surface:"#0a140a", card:"#0e1a0e", border:"#1a3a0e",
  borderHover:"#3a5c2a", accent:"#82d448", gold:"#c8a84b", goldDim:"#8a6a28",
  text:"#cce3c0", muted:"#4a7a20", dim:"#2a4a1a", faint:"#1a3a0e",
  danger:"#e05c3a", dangerBg:"rgba(224,92,58,.08)",
  ocean:"#0a1520", land:"rgba(18,36,14,.6)",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Mono:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{height:100%;background:${PALETTE.bg};}
  body{font-family:'DM Mono','Courier New',monospace;color:${PALETTE.text};}
  svg{display:block;}
  .slide-up{animation:su .4s cubic-bezier(.22,.68,0,1.12) both;}
  @keyframes su{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .fade-in{animation:fi .3s ease both;}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}
  .map-loading{animation:pulse 1.8s ease-in-out infinite;}
  .loading-bar{animation:slide 1.8s linear infinite;}
  .glow-btn{transition:all .2s;}
  .leaflet-container{font-family:'DM Mono','Courier New',monospace;}
  .prov-tip{background:rgba(8,15,6,.92)!important;border:1px solid #1a3a0e!important;color:#cce3c0!important;font-family:'DM Mono','Courier New',monospace!important;font-size:11px!important;padding:3px 8px!important;border-radius:3px!important;box-shadow:none!important;}
  .prov-tip::before{display:none!important;}
  .leaflet-control-zoom{border:1px solid #1a3a0e!important;}
  .leaflet-control-zoom a{background:#0e1a0e!important;color:#82d448!important;border-bottom:1px solid #1a3a0e!important;}
  .leaflet-control-zoom a:hover{background:#1a3a0e!important;}
  .glow-btn:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 6px 24px rgba(200,168,75,.45)!important;}
  .tab-btn:hover{background:${PALETTE.card}!important;}
  .pill-btn:hover{border-color:${PALETTE.accent}!important;color:${PALETTE.accent}!important;}
  input:focus,select:focus{outline:none;}
  button{touch-action:manipulation;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:${PALETTE.bg};}
  ::-webkit-scrollbar-thumb{background:${PALETTE.faint};border-radius:2px;}
  ::-webkit-scrollbar-thumb:hover{background:${PALETTE.dim};}
  .risk-low{color:#82d448;} .risk-med{color:#c8a84b;} .risk-high{color:#e05c3a;}
  @media(max-width:480px){
    .leaflet-container{height:44vh!important;}
    .report-kpi-grid{grid-template-columns:repeat(3,1fr)!important;}
  }
  @media print{
    .no-print{display:none!important;}
    body{background:#fff!important;color:#000!important;}
    [style*="background"]{background:transparent!important;}
    [style*="color"]{color:#000!important;}
    [style*="border"]{border-color:#ccc!important;}
    button{display:none!important;}
    .leaflet-container{display:none!important;}
  }
`;


// Module-level constants — avoids recreation on every render
const TABS = ["Overview", "Breeds", "Model"];
const riskLabel = v => v === "Low" || v === "Very low" || v === "None" ? "risk-low" : v === "High" || v === "Very high" || v === "Severe, frequent" ? "risk-high" : "risk-med";
const PAY_METHODS = [
  {id:"card",    icon:"💳", label:"Credit / Debit Card",  sub:"Visa · Mastercard · All SA banks"},
  {id:"eft",     icon:"🏦", label:"Instant EFT",          sub:"FNB · Capitec · ABSA · Nedbank · Std Bank"},
  {id:"snap",    icon:"📱", label:"SnapScan / Zapper",    sub:"Scan QR with your banking app"},
  {id:"payshap", icon:"⚡", label:"PayShap",              sub:"Real-time · All major SA banks"},
];

// ── ERROR BOUNDARY ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("App error:", error, info); }
  render() {
    if (this.state.error) return (
      <div style={{ background: "#080f06", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Mono',monospace" }}>
        <div style={{ background: "#0a140a", border: "1px solid #1a3a0e", borderRadius: 16, padding: "32px 24px", maxWidth: 400, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: "#e8f5d8", marginBottom: 8 }}>Something went wrong</div>
          <div style={{ fontSize: 10, color: "#4a7a20", marginBottom: 20, lineHeight: 1.7 }}>{String(this.state.error.message)}</div>
          <button onClick={() => window.location.reload()}
            style={{ padding: "11px 24px", background: "#c8a84b", color: "#080f06", border: "none", borderRadius: 10, fontSize: 13, fontFamily: "'Playfair Display',serif", fontWeight: 700, cursor: "pointer" }}>
            Reload App
          </button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

// ── PAY MODAL ─────────────────────────────────────────────────────────────────
function PayModal({ region, onClose, onSuccess }) {
  const [step, setStep]       = useState("pitch");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [method, setMethod]   = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const prov = PROVINCE_DATA[region] || {};
  const validEmail = v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const canPay = name.trim().length >= 2 && (email === "" || validEmail(email));
  const W = {background:"#0a140a",border:`1px solid ${PALETTE.faint}`,borderRadius:16,maxWidth:400,width:"100%",overflow:"hidden"};
  const wrap = ch => (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}}>
      <div className="fade-in" style={{...W,padding:step==="pitch"?0:"24px"}}>{ch}</div>
    </div>
  );

  if (step==="done") return wrap(
    <div style={{textAlign:"center",padding:"32px 24px"}}>
      <div style={{fontSize:52,marginBottom:14}}>✅</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:700,color:"#e8f5d8",marginBottom:8}}>Payment Confirmed</div>
      <div style={{fontSize:10,color:PALETTE.muted,marginBottom:24,lineHeight:1.7}}>
        {PF.sandbox
          ? <><span>Sandbox mode — no real charge.</span><br/><span style={{color:PALETTE.dim}}>Add PayFast credentials + set sandbox:false to go live.</span></>
          : `Thank you, ${name}. Generating your report now.`}
      </div>
      <button className="glow-btn" onClick={() => { onSuccess && onSuccess(name, email); onClose(); }}
        style={{width:"100%",padding:"13px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:10,fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,cursor:"pointer"}}>
        Generate My Report →
      </button>
    </div>
  );

  if (step==="details") return wrap(
    <>
      {PF.sandbox && (
        <div style={{background:"rgba(200,168,75,.10)",border:`1px solid rgba(200,168,75,.25)`,borderRadius:8,padding:"7px 10px",marginBottom:12,fontSize:9,color:PALETTE.gold}}>
          🔧 Sandbox mode active — no real charge will be made
        </div>
      )}
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#e8f5d8",marginBottom:14}}>Almost done</div>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:9,color:PALETTE.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:4}}>Your Name *</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Adriaan van der Merwe"
          style={{width:"100%",padding:"10px 12px",background:PALETTE.surface,border:`1px solid ${name.trim().length>0&&name.trim().length<2?PALETTE.danger:PALETTE.faint}`,borderRadius:8,color:PALETTE.text,fontSize:12,fontFamily:"'DM Mono',monospace"}}/>
        {name.trim().length>0&&name.trim().length<2 && <div style={{fontSize:8,color:PALETTE.danger,marginTop:3}}>Name must be at least 2 characters</div>}
      </div>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:9,color:PALETTE.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:4}}>Email (for receipt)</div>
        <input value={email} onChange={e=>{setEmail(e.target.value);setEmailErr(false);}}
          onBlur={()=>setEmailErr(email.length>0&&!validEmail(email))}
          placeholder="you@email.com" type="email"
          style={{width:"100%",padding:"10px 12px",background:PALETTE.surface,border:`1px solid ${emailErr?PALETTE.danger:PALETTE.faint}`,borderRadius:8,color:PALETTE.text,fontSize:12,fontFamily:"'DM Mono',monospace"}}/>
        {emailErr && <div style={{fontSize:8,color:PALETTE.danger,marginTop:3}}>Enter a valid email address</div>}
      </div>
      <div style={{background:PALETTE.surface,border:`1px solid ${PALETTE.faint}`,borderRadius:8,padding:"10px 12px",marginBottom:16,display:"flex",gap:10,alignItems:"center"}}>
        <span style={{fontSize:20}}>{PAY_METHODS.find(m=>m.id===method)?.icon}</span>
        <div>
          <div style={{fontSize:11,color:PALETTE.text,fontWeight:500}}>{PAY_METHODS.find(m=>m.id===method)?.label}</div>
          <div style={{fontSize:9,color:PALETTE.muted}}>Secured by PayFast · 80,000+ SA merchants · 3D Secure</div>
        </div>
      </div>
      <button disabled={!canPay}
        onClick={() => {
          if (PF.sandbox) {
            setStep("done");
          } else {
            window.location.href = buildPFUrl(name, email, region);
          }
        }}
        className={canPay?"glow-btn":""}
        style={{width:"100%",padding:"13px",background:canPay?PALETTE.gold:PALETTE.faint,color:canPay?PALETTE.bg:PALETTE.muted,border:"none",borderRadius:10,fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,cursor:canPay?"pointer":"default",transition:"all .2s"}}>
        Pay R 1,500 →
      </button>
      <button onClick={()=>setStep("methods")} style={{width:"100%",marginTop:8,padding:"8px",background:"none",color:PALETTE.muted,border:"none",fontSize:10,cursor:"pointer"}}>← Back</button>
    </>
  );

  if (step==="methods") return wrap(
    <>
      <div style={{background:PALETTE.surface,padding:"20px 20px 16px",borderBottom:`1px solid ${PALETTE.faint}`,margin:"-24px -24px 16px"}}>
        <div style={{fontSize:9,color:PALETTE.gold,letterSpacing:3,textTransform:"uppercase",marginBottom:6}}>Agrimodel Pro</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,color:"#e8f5d8"}}>Choose how to pay</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:PALETTE.gold,marginTop:8}}>
          R 1,500 <span style={{fontSize:11,fontFamily:"monospace",color:PALETTE.muted,fontWeight:400}}>once-off · instant PDF</span>
        </div>
      </div>
      {PAY_METHODS.map(m=>(
        <button key={m.id} onClick={()=>{setMethod(m.id);setStep("details");}}
          style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px",background:PALETTE.surface,border:`1px solid ${PALETTE.faint}`,borderRadius:10,marginBottom:8,cursor:"pointer",textAlign:"left",transition:"border-color .15s"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=PALETTE.borderHover}
          onMouseLeave={e=>e.currentTarget.style.borderColor=PALETTE.faint}>
          <span style={{fontSize:22}}>{m.icon}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:PALETTE.text,fontWeight:500}}>{m.label}</div>
            <div style={{fontSize:9,color:PALETTE.muted}}>{m.sub}</div>
          </div>
          <span style={{color:PALETTE.muted,fontSize:16}}>›</span>
        </button>
      ))}
      <button onClick={onClose} style={{width:"100%",marginTop:4,padding:"9px",background:"none",color:PALETTE.muted,border:"none",fontSize:10,cursor:"pointer"}}>Keep exploring for free</button>
      <div style={{fontSize:8,color:PALETTE.faint,textAlign:"center",marginTop:10,lineHeight:1.6}}>
        🔒 Powered by PayFast · Card · EFT · SnapScan · Zapper · PayShap
      </div>
    </>
  );

  // PITCH
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}}>
      <div className="fade-in" style={W}>
        <div style={{background:"linear-gradient(135deg,#0e1a0e,#162814)",padding:"24px 24px 20px",borderBottom:`1px solid ${PALETTE.faint}`}}>
          <div style={{fontSize:9,color:PALETTE.gold,letterSpacing:3,textTransform:"uppercase",marginBottom:8}}>
            Agrimodel Pro · {prov.name || "SA"} Feasibility Report
          </div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:900,color:"#e8f5d8",lineHeight:1.3}}>
            Unlock your complete<br/>feasibility analysis
          </div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:PALETTE.gold,marginTop:12}}>
            R 1,500 <span style={{fontSize:11,fontFamily:"monospace",color:PALETTE.muted,fontWeight:400}}>once-off · instant PDF</span>
          </div>
        </div>
        <div style={{padding:"20px 24px"}}>
          {[
            ["📊","Executive summary — written for Land Bank / FNB Agri submission"],
            ["🗺",`Regional deep-dive — ${prov.name || "your province"} specific: abattoirs, auctions, carrying capacity`],
            ["🐑",`Breed analysis — why ${prov.primary?.[0] || "the recommended breed"} beats alternatives here`],
            ["💰","36-month cashflow — every rand, every month, exact date your cash turns positive"],
            ["📈","Scale projection — min viable → 500 ewes, exact profit at each step"],
            ["🏗","Capital structure + Land Bank / FNB Agri financing options"],
            ["📉","Sensitivity: 9 carcass price scenarios — what you survive, what breaks you"],
            ["⚠","Risk matrix: drought, disease, market — with mitigation strategies"],
            ["🗓","Implementation roadmap — month-by-month with specific SA contacts + auction dates"],
          ].map(([icon,txt],i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
              <span style={{fontSize:14,width:20,flexShrink:0,marginTop:1}}>{icon}</span>
              <span style={{fontSize:10,color:PALETTE.text,lineHeight:1.5}}>{txt}</span>
            </div>
          ))}
          <div style={{background:PALETTE.surface,border:`1px solid ${PALETTE.faint}`,borderRadius:8,padding:"10px 12px",margin:"12px 0",fontSize:10,color:PALETTE.muted,lineHeight:1.7}}>
            💡 The map shows 3 teaser numbers. This report is what a senior agricultural consultant would charge R3,000–R5,000 to write. You get it for R 1,500 — and it's ready in 30 seconds.
          </div>
          <button className="glow-btn" onClick={()=>setStep("methods")}
            style={{width:"100%",padding:"14px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:10,fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 20px rgba(200,168,75,.3)`,transition:"all .2s"}}>
            Get My Report — R 1,500 →
          </button>
          <button onClick={onClose} style={{width:"100%",marginTop:8,padding:"9px",background:"none",color:PALETTE.muted,border:"none",fontSize:10,cursor:"pointer"}}>Keep exploring the map</button>
        </div>
      </div>
    </div>
  );
}

// ── FIELD INPUT ───────────────────────────────────────────────────────────────
function Field({ label, value, onChange, pre, suf, hint, min=0, max=999999 }) {
  const [raw, setRaw]     = useState(String(value));
  const [focused, setFoc] = useState(false);
  useEffect(()=>{ if(!focused) setRaw(String(value)); }, [value, focused]);
  const commit = v => {
    const n = parseFloat(String(v).replace(/[^0-9.]/g,""));
    if (!isNaN(n)) { const c=Math.min(max,Math.max(min,n)); onChange(c); setRaw(String(c)); }
    else setRaw(String(value));
  };
  return (
    <div style={{marginBottom:11}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:9,color:PALETTE.muted,textTransform:"uppercase",letterSpacing:.7}}>{label}</span>
        {hint && <span style={{fontSize:8,color:PALETTE.dim,fontStyle:"italic"}}>{hint}</span>}
      </div>
      <div style={{display:"flex",border:`1.5px solid ${focused?PALETTE.borderHover:PALETTE.faint}`,borderRadius:7,overflow:"hidden",background:PALETTE.bg,transition:"border-color .15s"}}>
        {pre&&<span style={{padding:"7px 9px",background:PALETTE.surface,fontSize:11,color:PALETTE.goldDim,borderRight:`1px solid ${PALETTE.faint}`}}>{pre}</span>}
        <input type="text" inputMode="numeric"
          value={focused?raw:String(value)}
          onChange={e=>{setRaw(e.target.value);const n=parseFloat(e.target.value);if(!isNaN(n))onChange(Math.min(max,Math.max(min,n)));}}
          onFocus={e=>{setFoc(true);e.target.select();}}
          onBlur={e=>{setFoc(false);commit(e.target.value);}}
          style={{flex:1,padding:"7px 9px",background:"transparent",border:"none",color:PALETTE.accent,fontSize:13,fontWeight:600,fontFamily:"'DM Mono',monospace",width:"100%"}}/>
        {suf&&<span style={{padding:"7px 9px",background:PALETTE.surface,fontSize:11,color:PALETTE.goldDim,borderLeft:`1px solid ${PALETTE.faint}`}}>{suf}</span>}
      </div>
    </div>
  );
}

// ── MINI BAR CHART ────────────────────────────────────────────────────────────
function MiniBarChart({ data, height=44 }) {
  const vals = data.map(d=>d.profit);
  const max  = Math.max(...vals.map(Math.abs), 1);
  const hasPositive = vals.some(v=>v>=0);
  const hasNegative = vals.some(v=>v<0);
  const barsH = height - 8; // leave room for month label
  return (
    <div style={{position:"relative"}}>
      <div style={{display:"flex",alignItems:"flex-end",gap:2,height:barsH,marginTop:4}}>
        {data.map((d,i)=>(
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end"}}>
            <div style={{width:"100%",height:Math.max(Math.abs(d.profit/max)*(barsH-4),2),background:d.profit>=0?PALETTE.accent:PALETTE.danger,borderRadius:"2px 2px 0 0",opacity:.85}}/>
          </div>
        ))}
      </div>
      {/* Zero line + month labels */}
      <div style={{display:"flex",alignItems:"center",gap:2,marginTop:1}}>
        {data.map((d,i)=>(
          <div key={i} style={{flex:1,textAlign:"center"}}>
            <span style={{fontSize:6,color:PALETTE.dim}}>{MONTHS[i][0]}</span>
          </div>
        ))}
      </div>
      {!hasPositive && (
        <div style={{fontSize:7,color:PALETTE.danger,textAlign:"center",marginTop:2,opacity:.7}}>
          All months negative — working capital period
        </div>
      )}
    </div>
  );
}

// ── 36-MONTH CASHFLOW CHART ───────────────────────────────────────────────────
function MiniCashflow36({ cf36, ewePurchase }) {
  if (!cf36?.length) return null;
  const W = 360, H = 110;
  const PAD = { l: 2, r: 2, t: 6, b: 16 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;
  const bW = iW / 36;

  const maxAbsP = Math.max(...cf36.map(d => Math.abs(d.profit)), 1);
  const barArea = iH * 0.38;
  const barZeroY = PAD.t + iH * 0.60;

  const cums  = cf36.map(d => d.cum);
  const minC  = Math.min(...cums, -ewePurchase);
  const maxC  = Math.max(...cums, 0);
  const range = maxC - minC || 1;
  const toY   = c => PAD.t + iH * (1 - (c - minC) / range);
  const cumZeroY = toY(0);

  const pts = cf36.map((d, i) => {
    const x = PAD.l + i * bW + bW / 2;
    return `${x.toFixed(1)},${toY(d.cum).toFixed(1)}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:H,display:'block'}}>
      {[13, 25].map(m => {
        const x = PAD.l + (m - 1) * bW + bW / 2;
        return <line key={m} x1={x} y1={PAD.t} x2={x} y2={H - PAD.b}
                     stroke={PALETTE.gold} strokeWidth={0.8} strokeDasharray="2,2" opacity={0.45}/>;
      })}
      {cf36.map((d, i) => {
        const x  = PAD.l + i * bW + 0.5;
        const bH = Math.max((Math.abs(d.profit) / maxAbsP) * barArea, 1.5);
        const y  = d.profit >= 0 ? barZeroY - bH : barZeroY;
        return <rect key={i} x={x} y={y} width={Math.max(bW - 1, 1)} height={bH}
                     fill={d.profit >= 0 ? PALETTE.accent : PALETTE.danger} opacity={0.72} rx={0.7}/>;
      })}
      <line x1={PAD.l} y1={cumZeroY} x2={W - PAD.r} y2={cumZeroY}
            stroke="rgba(255,255,255,0.13)" strokeWidth={0.8} strokeDasharray="3,4}"/>
      <polyline points={pts} fill="none" stroke={PALETTE.gold} strokeWidth={1.5} strokeLinejoin="round"/>
      {cf36.map((d, i) => {
        if (i > 0 && d.cum >= 0 && cf36[i - 1].cum < 0) {
          const x = PAD.l + i * bW + bW / 2;
          return <circle key="pb" cx={x} cy={toY(0)} r={3.5} fill={PALETTE.accent}/>;
        }
        return null;
      })}
      {[1, 13, 24, 25, 36].map(m => {
        const x     = PAD.l + (m - 1) * bW + bW / 2;
        const isKey = m === 13 || m === 25;
        return <text key={m} x={x} y={H - 3} textAnchor="middle" fontSize={isKey ? 7 : 6}
                     fill={isKey ? PALETTE.gold : PALETTE.dim}>{m}</text>;
      })}
    </svg>
  );
}

// ── REPORT VIEWER ─────────────────────────────────────────────────────────────
function ReportViewer({ report, onClose }) {
  const [sec, setSec] = useState(0);
  const { sections, reportData, buyerName, generatedAt, isSandbox } = report;
  const { r, flock, lm, carcass, pp, capital, npv5, be, scaleRows, cfRows, sensRows, firstPositive } = reportData;

  const TITLES = sections.map(s => s.title);

  return (
    <div style={{position:"fixed",inset:0,background:PALETTE.bg,zIndex:9999,overflow:"auto",fontFamily:"'DM Mono',monospace"}}>
      {/* Report header */}
      <div style={{background:`linear-gradient(135deg,${PALETTE.surface},#162814)`,borderBottom:`2px solid ${PALETTE.dim}`,padding:"16px 16px 0",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <div style={{fontSize:8,color:PALETTE.gold,letterSpacing:3,textTransform:"uppercase",marginBottom:4}}>
              Agrimodel Pro · Professional Feasibility Report
            </div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,color:"#e8f5d8"}}>
              {r.name} — {r.breed}
            </div>
            <div style={{fontSize:9,color:PALETTE.muted,marginTop:3}}>
              Prepared for: {buyerName} · {new Date(generatedAt).toLocaleDateString("en-ZA",{year:"numeric",month:"long",day:"numeric"})}
            </div>
            {isSandbox && (
              <div style={{marginTop:5,padding:"3px 10px",background:"rgba(200,168,75,.12)",border:`1px solid rgba(200,168,75,.3)`,borderRadius:6,display:"inline-block",fontSize:8,color:PALETTE.gold,letterSpacing:.5}}>
                🔧 SANDBOX DEMO — Financial data is live · Narrative sections are template-based · Purchase report for full AI analysis
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            <button onClick={()=>window.print()} title="Print or Save as PDF"
              style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,color:PALETTE.muted,borderRadius:8,padding:"6px 10px",fontSize:10,cursor:"pointer"}}>
              🖨 Print
            </button>
            <button onClick={onClose} style={{background:PALETTE.card,border:`1px solid ${PALETTE.dim}`,color:PALETTE.muted,borderRadius:8,padding:"6px 12px",fontSize:10,cursor:"pointer"}}>
              ✕ Close
            </button>
          </div>
        </div>
        {/* KPI band */}
        <div className="report-kpi-grid" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:0}}>
          {[
            {l:"Flock",      v:`${flock} ewes`,                          c:"#e8f5d8"},
            {l:"Profit/Ewe", v:`${SGN(pp)}${ZAR(pp)}`,                  c:pp>=0?PALETTE.accent:PALETTE.danger},
            {l:"Breakeven",  v:`${be} ewes`,                             c:PALETTE.gold},
            {l:"Capital",    v:ZAR(capital),                             c:PALETTE.gold},
            {l:"5-yr NPV",   v:`${SGN(npv5)}${ZAR(Math.abs(npv5))}`,   c:npv5>=0?PALETTE.accent:PALETTE.danger},
          ].map((s,i) => (
            <div key={i} style={{background:"rgba(0,0,0,.35)",borderRadius:"7px 7px 0 0",padding:"8px 6px",textAlign:"center",borderTop:`2px solid ${s.c}44`}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:s.c}}>{s.v}</div>
              <div style={{fontSize:7,color:PALETTE.muted,marginTop:2,textTransform:"uppercase",letterSpacing:.4}}>{s.l}</div>
            </div>
          ))}
        </div>
        {/* Section tabs */}
        <div style={{display:"flex",gap:2,overflowX:"auto",marginTop:8,paddingBottom:1}}>
          {TITLES.map((t, i) => (
            <button key={i} onClick={() => setSec(i)}
              style={{flexShrink:0,padding:"6px 10px",background:"none",border:"none",borderBottom:sec===i?`2px solid ${PALETTE.accent}`:"2px solid transparent",color:sec===i?PALETTE.accent:PALETTE.muted,fontSize:8,cursor:"pointer",textTransform:"uppercase",letterSpacing:.4,whiteSpace:"nowrap",transition:"all .15s"}}>
              {i+1}. {t.split("—")[0].split(":")[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Section content */}
      <div style={{padding:"20px 16px",maxWidth:820,margin:"0 auto"}}>
        {sections[sec] && (
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#e8f5d8",marginBottom:16,paddingBottom:12,borderBottom:`1px solid ${PALETTE.faint}`}}>
              {sec+1}. {sections[sec].title}
            </div>
            <div style={{fontSize:11,color:PALETTE.text,lineHeight:2.1,whiteSpace:"pre-wrap",marginBottom:24}}>
              {sections[sec].body}
            </div>
          </div>
        )}

        {/* Embedded data tables */}
        {sec === 4 && (
          <div style={{marginTop:8}}>
            <div style={{fontSize:11,fontWeight:600,color:PALETTE.gold,marginBottom:10,fontFamily:"'Playfair Display',serif"}}>
              36-Month Cashflow — {flock} ewes · {lm === "owner" ? "Owner-operated" : "Hired worker"} · R{carcass}/kg
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:9}}>
                <thead>
                  <tr style={{background:PALETTE.bg}}>
                    {["Mo","Month","Yr","Events","Revenue","Op. Cost","P&L","Cumulative"].map(h => (
                      <th key={h} style={{padding:"5px 8px",color:PALETTE.muted,textAlign:"right",fontSize:8,textTransform:"uppercase",borderBottom:`1px solid ${PALETTE.faint}`,fontWeight:500}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cfRows.map((row, i) => (
                    <tr key={i} style={{background:row.rev>0?"rgba(130,212,72,.05)":i%2===0?PALETTE.card:PALETTE.bg,borderBottom:`1px solid ${PALETTE.faint}22`}}>
                      <td style={{padding:"4px 8px",color:PALETTE.muted,textAlign:"right"}}>{row.m}</td>
                      <td style={{padding:"4px 8px",color:row.rev>0?"#e8f5d8":PALETTE.muted,textAlign:"right",fontWeight:row.rev>0?600:400}}>{row.mo}</td>
                      <td style={{padding:"4px 8px",color:PALETTE.muted,textAlign:"right"}}>{row.yr}</td>
                      <td style={{padding:"4px 8px",color:PALETTE.borderHover,fontSize:8,maxWidth:160}}>{row.events || "—"}</td>
                      <td style={{padding:"4px 8px",color:row.rev>0?PALETTE.accent:PALETTE.muted,textAlign:"right",fontFamily:"'Playfair Display',serif",fontWeight:row.rev>0?700:400}}>{row.rev>0?ZAR(row.rev):"—"}</td>
                      <td style={{padding:"4px 8px",color:PALETTE.danger,textAlign:"right"}}>{ZAR(row.cost)}</td>
                      <td style={{padding:"4px 8px",color:row.profit>=0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontWeight:600}}>{SGN(row.profit)}{ZAR(Math.abs(row.profit))}</td>
                      <td style={{padding:"4px 8px",color:row.cum>=0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontFamily:"'Playfair Display',serif",fontWeight:row.cum>0&&(cfRows[i-1]?.cum??0)<=0?700:400}}>
                        {row.cum>=0&&(cfRows[i-1]?.cum??0)<0 && <span style={{fontSize:8,color:PALETTE.accent,marginRight:3}}>★</span>}
                        {SGN(row.cum)}{ZAR(Math.abs(row.cum))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{fontSize:8,color:PALETTE.dim,marginTop:6,lineHeight:1.6}}>
              ★ = First revenue month — first lamb sales (Month {firstPositive?.m}, {firstPositive?.mo} Year {firstPositive?.yr})
              · Costs include labour, overhead, feed, health, replacement reserve amortised monthly
            </div>
          </div>
        )}

        {sec === 5 && (
          <div style={{marginTop:8}}>
            <div style={{fontSize:11,fontWeight:600,color:PALETTE.gold,marginBottom:10,fontFamily:"'Playfair Display',serif"}}>
              Scale Projection Table — Fixed costs diluted across flock
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
              <thead>
                <tr style={{background:PALETTE.bg}}>
                  {["Flock","Annual Rev","Profit/Ewe","Flock Profit","ROI","vs Prime 11.5%","Capital","Status"].map(h => (
                    <th key={h} style={{padding:"6px 8px",color:PALETTE.muted,textAlign:"right",fontSize:8,textTransform:"uppercase",borderBottom:`1px solid ${PALETTE.faint}`,fontWeight:500}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scaleRows.map((row, i) => {
                  const isBE    = be && Math.abs(row.n - be) <= 3;
                  const isYours = Math.abs(row.n - flock) <= 5;
                  return (
                    <tr key={i} style={{background:isYours?"rgba(200,168,75,.07)":isBE?"rgba(130,212,72,.05)":i%2===0?PALETTE.card:PALETTE.bg,borderBottom:`1px solid ${PALETTE.faint}22`}}>
                      <td style={{padding:"6px 8px",textAlign:"right"}}>
                        <span style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:row.ok?"#e8f5d8":PALETTE.muted}}>{row.n}</span>
                        {isBE    && <span style={{fontSize:7,color:PALETTE.accent,marginLeft:4}}>BE</span>}
                        {isYours && <span style={{fontSize:7,color:PALETTE.gold,marginLeft:4}}>◄ yours</span>}
                      </td>
                      <td style={{padding:"6px 8px",color:PALETTE.accent,textAlign:"right",fontFamily:"'Playfair Display',serif",fontWeight:700}}>{ZAR(row.rev)}</td>
                      <td style={{padding:"6px 8px",color:row.pp>=0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontFamily:"'Playfair Display',serif"}}>{SGN(row.pp)}{ZAR(Math.abs(row.pp))}</td>
                      <td style={{padding:"6px 8px",color:row.fp>=0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontFamily:"'Playfair Display',serif",fontWeight:700}}>{SGN(row.fp)}{ZAR(Math.abs(row.fp))}</td>
                      <td style={{padding:"6px 8px",color:row.roi>0.15?PALETTE.accent:row.roi>0?PALETTE.gold:PALETTE.danger,textAlign:"right",fontWeight:600}}>{PCT(row.roi)}</td>
                      <td style={{padding:"6px 8px",color:row.vsB>0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontSize:9}}>{row.vsB>0?"+":""}{PCT(row.vsB)}</td>
                      <td style={{padding:"6px 8px",color:PALETTE.muted,textAlign:"right",fontSize:9}}>{ZAR(row.cap)}</td>
                      <td style={{padding:"6px 8px",textAlign:"right"}}>
                        <span style={{fontSize:8,padding:"2px 7px",borderRadius:10,background:row.ok?"rgba(130,212,72,.12)":"rgba(224,92,58,.12)",color:row.ok?PALETTE.accent:PALETTE.danger}}>
                          {row.ok ? (row.roi > 0.15 ? "Strong" : "Viable") : "Below BE"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{fontSize:8,color:PALETTE.dim,marginTop:7,lineHeight:1.6}}>
              BE = breakeven flock · ◄ = your current flock · vs Prime = ROI vs SARB prime 11.5% (2025)
              · Capital includes stock purchase + 12 months operating costs
            </div>
          </div>
        )}

        {sec === 6 && (
          <div style={{marginTop:8}}>
            <div style={{fontSize:11,fontWeight:600,color:PALETTE.gold,marginBottom:10,fontFamily:"'Playfair Display',serif"}}>
              Sensitivity Analysis — 9 Carcass Price Scenarios at {flock} ewes
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
              <thead>
                <tr style={{background:PALETTE.bg}}>
                  {["Scenario","Carcass R/kg","Profit/Ewe","Flock Profit","ROI","Breakeven"].map(h => (
                    <th key={h} style={{padding:"5px 8px",color:PALETTE.muted,textAlign:"right",fontSize:8,textTransform:"uppercase",borderBottom:`1px solid ${PALETTE.faint}`,fontWeight:500}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sensRows.map((s, i) => (
                  <tr key={i} style={{background:s.pct===0?"rgba(200,168,75,.07)":i%2===0?PALETTE.card:PALETTE.bg,borderBottom:`1px solid ${PALETTE.faint}22`}}>
                    <td style={{padding:"5px 8px",color:s.pct===0?PALETTE.gold:s.pct>0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontWeight:600}}>{s.pct>0?"+":""}{s.pct}%{s.pct===0?" ★":""}</td>
                    <td style={{padding:"5px 8px",color:PALETTE.text,textAlign:"right"}}>R{s.adj.toFixed(0)}/kg</td>
                    <td style={{padding:"5px 8px",color:s.pp>=0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontFamily:"'Playfair Display',serif"}}>{SGN(s.pp)}{ZAR(Math.abs(s.pp))}</td>
                    <td style={{padding:"5px 8px",color:s.fp>=0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontFamily:"'Playfair Display',serif",fontWeight:700}}>{SGN(s.fp)}{ZAR(Math.abs(s.fp))}</td>
                    <td style={{padding:"5px 8px",color:s.roi>0?PALETTE.accent:PALETTE.danger,textAlign:"right",fontWeight:600}}>{PCT(s.roi)}</td>
                    <td style={{padding:"5px 8px",color:PALETTE.gold,textAlign:"right"}}>{s.be || "∞"} ewes</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{fontSize:8,color:PALETTE.dim,marginTop:6}}>
              ★ = base scenario (R{carcass}/kg AgriOrbit A2 Apr 2025) · All scenarios at {flock} ewes {lm === "owner" ? "owner-operated" : "hired worker"}
            </div>
          </div>
        )}

        {/* Section navigation */}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:28,paddingTop:16,borderTop:`1px solid ${PALETTE.faint}`}}>
          <button onClick={() => setSec(Math.max(0, sec-1))} disabled={sec===0}
            style={{padding:"9px 16px",background:PALETTE.bg,border:`1px solid ${PALETTE.faint}`,borderRadius:8,color:sec===0?PALETTE.faint:PALETTE.muted,fontSize:10,cursor:sec===0?"default":"pointer"}}>
            ← Previous
          </button>
          <span style={{fontSize:9,color:PALETTE.dim,alignSelf:"center"}}>Section {sec+1} of {sections.length}</span>
          {sec < sections.length - 1
            ? <button onClick={() => setSec(sec+1)} style={{padding:"9px 16px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:8,fontSize:10,fontWeight:700,cursor:"pointer"}}>Next →</button>
            : <button onClick={onClose} style={{padding:"9px 16px",background:PALETTE.faint,color:PALETTE.muted,border:"none",borderRadius:8,fontSize:10,cursor:"pointer"}}>Close Report</button>
          }
        </div>
      </div>
    </div>
  );
}

// ── REPORT LOADING SCREEN ─────────────────────────────────────────────────────
function ReportLoading({ provName }) {
  const steps = [
    `Analysing ${provName} regional data...`,
    "Calculating 36-month cashflow model...",
    "Writing executive summary...",
    "Building scale & breakeven analysis...",
    "Drafting risk analysis...",
    "Structuring capital & financing section...",
    "Writing implementation roadmap...",
    "Formatting for Land Bank submission...",
  ];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 3200);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{position:"fixed",inset:0,background:"#080f06",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'DM Mono',monospace"}}>
      <div className="map-loading" style={{fontSize:52,marginBottom:20}}>🐑</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#e8f5d8",marginBottom:8,textAlign:"center"}}>
        Generating Your Report
      </div>
      <div style={{fontSize:9,color:"#4a7a20",marginBottom:8,textAlign:"center",lineHeight:1.8,minHeight:40}}>
        {steps[step]}
      </div>
      <div style={{width:240,height:3,background:PALETTE.faint,borderRadius:2,overflow:"hidden",marginBottom:8}}>
        <div className="loading-bar" style={{height:"100%",background:PALETTE.accent,borderRadius:2,width:"35%"}}/>
      </div>
      <div style={{fontSize:8,color:"#2a4a1a",textAlign:"center"}}>
        Senior agricultural consultant AI · 9 sections · typically 25–40 seconds
      </div>
    </div>
  );
}

// ── ADMIN LOGIN MODAL ─────────────────────────────────────────────────────────
function AdminModal({ onClose, onSuccess }) {
  const [user, setUser]   = useState("");
  const [pass, setPass]   = useState("");
  const [err,  setErr]    = useState(false);
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "Adriaan@12345";
  const attempt = () => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) { onSuccess(); onClose(); }
    else { setErr(true); setPass(""); }
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div className="fade-in" style={{background:PALETTE.surface,border:`1px solid ${PALETTE.borderHover}`,borderRadius:14,padding:"24px",maxWidth:320,width:"100%"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#e8f5d8",marginBottom:4}}>Admin Access</div>
        <div style={{fontSize:9,color:PALETTE.muted,marginBottom:18}}>Preview all locked sections without payment</div>
        {err && <div style={{fontSize:9,color:PALETTE.danger,marginBottom:10,padding:"6px 10px",background:PALETTE.dangerBg,borderRadius:6}}>Invalid credentials — try again</div>}
        {[
          {l:"Username", v:user, set:setUser, type:"text",   ph:"admin"},
          {l:"Password", v:pass, set:setPass, type:"password", ph:"••••••••"},
        ].map(f=>(
          <div key={f.l} style={{marginBottom:10}}>
            <div style={{fontSize:9,color:PALETTE.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:.7}}>{f.l}</div>
            <input type={f.type} value={f.v} onChange={e=>{f.set(e.target.value);setErr(false);}}
              onKeyDown={e=>e.key==="Enter"&&attempt()}
              placeholder={f.ph}
              style={{width:"100%",padding:"9px 12px",background:PALETTE.bg,border:`1px solid ${PALETTE.faint}`,borderRadius:7,color:PALETTE.accent,fontSize:12,fontFamily:"'DM Mono',monospace"}}/>
          </div>
        ))}
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <button onClick={onClose}
            style={{flex:1,padding:"10px",background:"transparent",border:`1px solid ${PALETTE.faint}`,color:PALETTE.muted,borderRadius:8,fontSize:11,cursor:"pointer"}}>
            Cancel
          </button>
          <button onClick={attempt}
            style={{flex:2,padding:"10px",background:PALETTE.borderHover,color:"#e8f5d8",border:"none",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer"}}>
            Login →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

function AgrimodelPro() {
  const [selected,  setSelected]  = useState(null);
  const [hovered,   setHovered]   = useState(null);
  const [showPay,   setShowPay]   = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0=Overview 1=Breeds 2=Model
  const [carcass,   setCarcass]   = useState(87);
  const [flockSize, setFlockSize] = useState(50);
  const [labour,    setLabour]    = useState(1500);
  const [labourMode,setLabourMode]= useState("owner"); // "owner" | "hired"
  // Extra input costs
  const [bondMonthly,     setBondMonthly]     = useState(0);
  const [feedOverride,    setFeedOverride]    = useState(null); // null = province default
  const [healthOverride,  setHealthOverride]  = useState(null);
  const [fencingMonthly,  setFencingMonthly]  = useState(0);
  const [miscMonthly,     setMiscMonthly]     = useState(0);
  const [showCosts,       setShowCosts]       = useState(false);
  // Admin
  const [isAdmin,         setIsAdmin]         = useState(false);
  const [showAdminLogin,  setShowAdminLogin]  = useState(false);
  // Report state
  const [reportStatus, setReportStatus] = useState(null); // null | "loading" | "ready" | "error"
  const [report,       setReport]       = useState(null);
  const [provGeo,      setProvGeo]      = useState(null);
  const [geoError,     setGeoError]     = useState(false);
  const prov = selected ? PROVINCE_DATA[selected] : null;

  // Load accurate province boundaries from GADM 4.1 (authoritative SA demarcation data)
  useEffect(() => {
    const GADM_URL = "/sa-provinces.json";
    fetch(GADM_URL)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setProvGeo)
      .catch(err => {
        console.warn("Province boundaries unavailable:", err);
        setGeoError(true);
      });
  }, []);

  const styleProvince = useCallback((feature) => {
    const id = PROV_NAME_MAP[feature.properties.NAME_1] || "";
    const pd = PROVINCE_DATA[id];
    if (!pd) return { fillOpacity: 0, opacity: 0, weight: 0 };
    return {
      fillColor:   pd.fill,
      fillOpacity: selected === id ? 0.80 : 0.38,
      color:       selected === id ? "#ffffff" : "rgba(255,255,255,0.5)",
      weight:      selected === id ? 2.2 : 0.8,
      opacity:     selected === id ? 0.9 : 0.55,
    };
  }, [selected]);

  const onEachProvince = useCallback((feature, layer) => {
    const id = PROV_NAME_MAP[feature.properties.NAME_1] || "";
    const pd = PROVINCE_DATA[id];
    if (!pd) return;
    layer.on({
      click: () => setSelected(prev => prev === id ? null : id),
      mouseover: (e) => {
        setHovered(id);
        if (id !== selected) e.target.setStyle({ fillOpacity: 0.62, weight: 1.4 });
      },
      mouseout: (e) => {
        setHovered(null);
        if (id !== selected) e.target.setStyle({ fillOpacity: 0.38, weight: 0.8 });
      },
    });
    layer.bindTooltip(pd.name, { className: "prov-tip", sticky: true, direction: "center" });
  }, [selected]);

  const handlePaySuccess = useCallback(async (buyerName, buyerEmail) => {
    setShowPay(false);
    setReportStatus("loading");
    const useSandbox = PF.sandbox || !import.meta.env.VITE_ANTHROPIC_API_KEY;
    try {
      const rd = buildReportData(
        PROVINCE_DATA[selected || "limpopo"],
        flockSize,
        labourMode,
        carcass
      );
      const result = useSandbox
        ? generateSandboxReport(rd, buyerName || "Valued Client")
        : await generateReport(rd, buyerName || "Valued Client");
      setReport({ ...result, buyerEmail });
      setReportStatus("ready");
    } catch (err) {
      console.error("Report generation failed:", err);
      setReportStatus("error");
    }
  }, [selected, flockSize, carcass, labourMode]);

  // Reset inputs when province changes
  useEffect(() => {
    if (prov) {
      setFlockSize(Math.max(20, (prov.be ?? 50) + 10));
      setLabour(1500);
      setLabourMode("owner");
      setBondMonthly(0);
      setFeedOverride(null);
      setHealthOverride(null);
      setFencingMonthly(0);
      setMiscMonthly(0);
      setShowCosts(false);
      setActiveTab(0);
    }
  }, [selected]);

  // Escape to clear
  useEffect(() => {
    const h = e => { if(e.key==="Escape") setSelected(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const result = useMemo(() => {
    if (!prov) return null;
    const effectiveLabour = labourMode === "owner" ? labour : (prov.hired ?? 5594);
    return calcFull(prov, carcass, flockSize, effectiveLabour, prov.oh ?? 600, {
      bond:           bondMonthly,
      feedOverride:   feedOverride,
      healthOverride: healthOverride,
      fencing:        fencingMonthly,
      misc:           miscMonthly,
    });
  }, [prov, carcass, flockSize, labour, labourMode, bondMonthly, feedOverride, healthOverride, fencingMonthly, miscMonthly]);

  const pc = result ? (result.profitPerEwe >= 0 ? PALETTE.accent : PALETTE.danger) : PALETTE.muted;

  return (
    <>
      <style>{CSS}</style>
      {showPay && <PayModal region={selected} onClose={()=>setShowPay(false)} onSuccess={handlePaySuccess}/>}
      {showAdminLogin && <AdminModal onClose={()=>setShowAdminLogin(false)} onSuccess={()=>setIsAdmin(true)}/>}
      {reportStatus==="loading" && <ReportLoading provName={prov?.name || "SA"} />}
      {reportStatus==="ready" && report && <ReportViewer report={report} onClose={()=>setReportStatus(null)} />}
      {reportStatus==="error" && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:PALETTE.surface,border:`1px solid ${PALETTE.faint}`,borderRadius:16,padding:"32px 24px",textAlign:"center",maxWidth:360,width:"100%"}}>
            <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#e8f5d8",marginBottom:8}}>Report Generation Failed</div>
            <div style={{fontSize:10,color:PALETTE.muted,marginBottom:8,lineHeight:1.7}}>The AI could not generate your report. This is usually a temporary API issue.</div>
            <div style={{fontSize:9,color:PALETTE.dim,marginBottom:20,lineHeight:1.6}}>Your payment intent has been recorded. Please try again — the report typically generates in 25–40 seconds.</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setReportStatus(null)} style={{flex:1,padding:"11px",background:PALETTE.faint,color:PALETTE.muted,border:"none",borderRadius:9,fontSize:12,cursor:"pointer"}}>Dismiss</button>
              <button className="glow-btn" onClick={()=>{setReportStatus(null);setTimeout(()=>setShowPay(true),100);}}
                style={{flex:2,padding:"11px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:9,fontFamily:"'Playfair Display',serif",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                Try Again →
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{background:PALETTE.bg,minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"'DM Mono',monospace"}}>

        {/* ── HEADER ── */}
        <div style={{background:PALETTE.surface,borderBottom:`1px solid ${PALETTE.faint}`,padding:"11px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:"#e8f5d8"}}>🐑 Agrimodel Pro</span>
            <span style={{fontSize:8,color:PALETTE.dim,letterSpacing:2,textTransform:"uppercase",marginLeft:10}}>SA Breed Recommender + Feasibility</span>
          </div>
          <button className="glow-btn" onClick={()=>setShowPay(true)} aria-label="Get full feasibility report for R 1,500"
            style={{padding:"7px 14px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:18,fontSize:10,fontWeight:700,cursor:"pointer",boxShadow:`0 2px 12px rgba(200,168,75,.28)`}}>
            Report R 1,500 →
          </button>
        </div>

        {/* ── HOVER BAR ── */}
        <div style={{height:26,background:PALETTE.surface,borderBottom:`1px solid ${PALETTE.faint}`,display:"flex",alignItems:"center",padding:"0 16px",flexShrink:0,overflow:"hidden"}}>
          {hovered ? (
            <span style={{fontSize:10,color:PALETTE.accent,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              <strong style={{fontFamily:"'Playfair Display',serif"}}>{PROVINCE_DATA[hovered]?.name}</strong>
              <span style={{color:PALETTE.muted,marginLeft:8}}>{PROVINCE_DATA[hovered]?.climate}</span>
              <span style={{color:PALETTE.dim,marginLeft:8}}>· Click to select</span>
            </span>
          ) : selected ? (
            <span style={{fontSize:9,color:PALETTE.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              <strong style={{color:PALETTE.accent,fontFamily:"'Playfair Display',serif",marginRight:6}}>{prov?.name}</strong>
              <span style={{color:PALETTE.dim}}>BE {prov?.be} ewes · {prov?.rainfall} rain · Primary: {prov?.primary?.[0]}</span>
              <span style={{color:PALETTE.faint,marginLeft:8}}>· ESC to clear</span>
            </span>
          ) : (
            <span style={{fontSize:9,color:PALETTE.dim,letterSpacing:.3}}>
              Hover over a province on the map · Click to select
            </span>
          )}
        </div>

        {/* ── MAP ── */}
        <div style={{position:"relative",flexShrink:0}}>
          {!provGeo && !geoError && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,pointerEvents:"none"}}>
              <span className="map-loading" style={{fontSize:9,color:PALETTE.muted,letterSpacing:1.5,textTransform:"uppercase",background:"rgba(8,15,6,.82)",padding:"5px 14px",borderRadius:20,border:`1px solid ${PALETTE.faint}`}}>
                ⟳ Loading province boundaries…
              </span>
            </div>
          )}
          {geoError && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,pointerEvents:"none"}}>
              <span style={{fontSize:9,color:PALETTE.danger,letterSpacing:1,background:"rgba(8,15,6,.82)",padding:"5px 12px",borderRadius:20,border:`1px solid rgba(224,92,58,.3)`}}>
                ⚠ Province boundaries unavailable — use list below
              </span>
            </div>
          )}
          <MapContainer
            bounds={[[-35.5, 16.2], [-21.5, 33.5]]}
            boundsOptions={{padding:[0,0]}}
            style={{width:"100%", height:"50vh", background:"#0a1520"}}
            attributionControl={false}
            zoomControl={true}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            aria-label="South Africa province selection map"
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Esri World Imagery"
            />
            {provGeo && (
              <GeoJSON
                key={selected ?? "none"}
                data={provGeo}
                style={styleProvince}
                onEachFeature={onEachProvince}
              />
            )}
          </MapContainer>
        </div>

        {/* ── REGION PANEL ── */}
        {selected && prov && (
          <div className="slide-up" style={{flex:1,overflow:"auto",background:PALETTE.surface,borderTop:`2px solid ${PALETTE.borderHover}`}}>
            <div style={{padding:"14px 16px 100px"}}>

              {/* Region header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#e8f5d8"}}>{prov.name}</div>
                  <div style={{fontSize:9,color:PALETTE.muted,marginTop:2}}>{prov.climate}</div>
                </div>
                <button onClick={()=>setSelected(null)}
                  style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,color:PALETTE.muted,borderRadius:6,padding:"4px 10px",fontSize:10,cursor:"pointer"}}>
                  ✕ ESC
                </button>
              </div>

              {/* Climate badges */}
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                {[
                  {l:`🌧 ${prov.rainfall}`, title:"rainfall"},
                  {l:`❄ Frost: ${prov.frost}`, title:"frost", cls:prov.frost==="None"?"risk-low":prov.frost.includes("Heavy")?"risk-high":"risk-med"},
                  {l:`🦟 Parasites: ${prov.parasites}`, title:"parasites", cls:riskLabel(prov.parasites)},
                  {l:`☀ Drought: ${prov.drought}`, title:"drought", cls:riskLabel(prov.drought)},
                ].map((b,i)=>(
                  <span key={i} title={b.title}
                    className={b.cls||""}
                    style={{fontSize:9,padding:"3px 8px",background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderRadius:12}}>
                    {b.l}
                  </span>
                ))}
              </div>

              {/* Tab nav */}
              <div style={{display:"flex",borderBottom:`1px solid ${PALETTE.faint}`,marginBottom:14}}>
                {TABS.map((t,i)=>(
                  <button key={i} className="tab-btn" onClick={()=>setActiveTab(i)}
                    style={{flex:1,padding:"8px 4px",background:"none",border:"none",borderBottom:activeTab===i?`2px solid ${PALETTE.accent}`:"2px solid transparent",color:activeTab===i?PALETTE.accent:PALETTE.muted,fontSize:10,textTransform:"uppercase",letterSpacing:.8,cursor:"pointer",transition:"all .15s"}}>
                    {t}
                  </button>
                ))}
              </div>

              {/* ── TAB 0: OVERVIEW ── */}
              {activeTab === 0 && (
                <div className="fade-in">
                  <div style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderLeft:`2px solid ${PALETTE.borderHover}`,borderRadius:8,padding:"10px 12px",marginBottom:12,fontSize:10,color:"#8aaa70",lineHeight:1.8}}>
                    {prov.why}
                  </div>

                  {prov.tip && (
                    <div style={{background:"rgba(200,168,75,.06)",border:`1px solid rgba(200,168,75,.2)`,borderRadius:8,padding:"8px 12px",marginBottom:12}}>
                      <span style={{fontSize:9,color:PALETTE.gold}}>💡 Pro tip: </span>
                      <span style={{fontSize:9,color:"#b8986a",lineHeight:1.7}}>{prov.tip}</span>
                    </div>
                  )}

                  {/* Avoid */}
                  {prov.avoid.length > 0 && (
                    <div style={{background:PALETTE.dangerBg,border:"1px solid rgba(224,92,58,.25)",borderRadius:8,padding:"8px 12px",marginBottom:12}}>
                      <span style={{fontSize:10,color:PALETTE.danger}}>⚠ Avoid in {prov.name}: <strong>{prov.avoid.join(", ")}</strong></span>
                    </div>
                  )}

                  {/* Key stats row */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:12}}>
                    {[
                      {l:"Lambing",   v:`${prov.lambing}%`},
                      {l:"Slaughter", v:`${prov.liveKg}kg / ${prov.dressing}%`},
                      {l:"Ewe price", v:ZAR(prov.ewePrice)},
                    ].map((s,i)=>(
                      <div key={i} style={{background:PALETTE.bg,border:`1px solid ${PALETTE.faint}`,borderRadius:7,padding:"7px 8px",textAlign:"center"}}>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:13,fontWeight:700,color:PALETTE.accent}}>{s.v}</div>
                        <div style={{fontSize:7,color:PALETTE.dim,marginTop:2,textTransform:"uppercase",letterSpacing:.5}}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Market access */}
                  <div style={{background:PALETTE.bg,border:`1px solid ${PALETTE.faint}`,borderRadius:7,padding:"8px 12px",marginBottom:12}}>
                    <div style={{fontSize:7,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Markets</div>
                    <div style={{fontSize:9,color:PALETTE.muted,lineHeight:1.7}}>{prov.market}</div>
                  </div>

                  {/* Quick breed pills */}
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:8,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:1.2,marginBottom:8}}>★ Recommended breeds</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                      {prov.primary.map(b=>(
                        <span key={b} style={{padding:"5px 11px",background:"#1a3a0e",border:`1px solid ${PALETTE.borderHover}`,borderRadius:20,color:PALETTE.accent,fontSize:10}}>★ {b}</span>
                      ))}
                    </div>
                    {prov.secondary.length > 0 && (
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {prov.secondary.map(b=>(
                          <span key={b} className="pill-btn" style={{padding:"4px 10px",background:"transparent",border:`1px solid ${PALETTE.faint}`,borderRadius:20,color:PALETTE.muted,fontSize:10,cursor:"default",transition:"all .15s"}}>◆ {b}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="glow-btn" onClick={()=>setActiveTab(2)}
                    style={{width:"100%",padding:"11px",background:PALETTE.borderHover,color:"#e8f5d8",border:"none",borderRadius:9,fontSize:11,fontWeight:600,cursor:"pointer",marginBottom:8}}>
                    Model the economics →
                  </button>
                </div>
              )}

              {/* ── TAB 1: BREEDS ── */}
              {activeTab === 1 && (
                <div className="fade-in">
                  <div style={{fontSize:8,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:1.2,marginBottom:10}}>
                    Breed performance at R{carcass}/kg carcass · default flock size
                  </div>
                  {[...prov.primary.map(n=>({n,primary:true})), ...prov.secondary.map(n=>({n,primary:false}))].map(({n,primary})=>{
                    const isMeat = !["Merino","SAMM","Dohne Merino","Ile de France"].includes(n);
                    const isProvBreed = n === prov.breed && result;
                    const roi       = isProvBreed ? result.roi        : (primary ? (isMeat ? 0.12 : 0.07) : 0.04);
                    const profitEwe = isProvBreed ? result.profitPerEwe : (primary ? (isMeat ? 250 : 120) : 60);
                    const woolEwe   = isProvBreed ? result.woolRevPerEwe : (isMeat ? 0 : 220);
                    const isReal    = !!isProvBreed;
                    return (
                      <div key={n} style={{background:PALETTE.card,border:`1px solid ${primary?PALETTE.faint:"#1a2a1a"}`,borderRadius:10,padding:"12px",marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            {primary && <span style={{fontSize:9,color:PALETTE.accent}}>★ PRIMARY</span>}
                            {!primary && <span style={{fontSize:9,color:PALETTE.muted}}>◆ VIABLE</span>}
                            <span style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:"#e8f5d8"}}>{n}</span>
                          </div>
                          <span style={{fontSize:9,color:PALETTE.muted}}>{isMeat?"Meat":"Dual Purpose"}</span>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                          {[
                            {l:isReal?"ROI":"Est. ROI",           v:PCT(roi),           c:roi>=0?PALETTE.accent:PALETTE.danger},
                            {l:isReal?"Profit/Ewe":"Est. Profit",  v:`${SGN(profitEwe)}${ZAR(Math.abs(profitEwe))}`, c:profitEwe>=0?PALETTE.accent:PALETTE.danger},
                            {l:"Wool/yr",                          v:ZAR(woolEwe),       c:woolEwe>0?PALETTE.gold:PALETTE.dim},
                          ].map((s,i)=>(
                            <div key={i} style={{background:PALETTE.bg,borderRadius:6,padding:"7px 6px",textAlign:"center",border:`1px solid ${PALETTE.faint}`}}>
                              <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:s.c}}>{s.v}</div>
                              <div style={{fontSize:7,color:PALETTE.dim,marginTop:2,textTransform:"uppercase"}}>{s.l}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{marginTop:8,fontSize:9,color:PALETTE.dim}}>
                          {isReal
                            ? `✓ Live model — based on your ${flockSize} ewes at R${carcass}/kg`
                            : primary ? `✓ Recommended for ${prov.name}'s conditions` : `◆ Works with good management and infrastructure`}
                        </div>
                      </div>
                    );
                  })}
                  {prov.avoid.length > 0 && (
                    <div style={{background:PALETTE.dangerBg,border:"1px solid rgba(224,92,58,.2)",borderRadius:10,padding:"12px",marginBottom:8}}>
                      <div style={{fontSize:9,color:PALETTE.danger,marginBottom:6}}>⚠ NOT RECOMMENDED</div>
                      {prov.avoid.map(n=>(
                        <div key={n} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid rgba(224,92,58,.1)`}}>
                          <span style={{fontSize:11,color:"#c05a4a"}}>{n}</span>
                          <span style={{fontSize:9,color:"#804040"}}>Poorly adapted</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{fontSize:9,color:PALETTE.dim,textAlign:"center",marginTop:8,lineHeight:1.6}}>
                    Full breed comparison table is in the PDF report →
                  </div>
                </div>
              )}

              {/* ── TAB 2: MODEL ── */}
              {activeTab === 2 && result && (
                <div className="fade-in">
                  <div style={{fontSize:8,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>
                    {prov.primary[0]} · adjust inputs to model your scenario
                  </div>

                  {/* Inputs */}
                  <div style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderRadius:10,padding:"12px",marginBottom:12}}>
                    <div style={{marginBottom:9}}>
                      <div style={{fontSize:9,color:PALETTE.muted,textTransform:"uppercase",letterSpacing:.7,marginBottom:5}}>Labour Mode</div>
                      <div style={{display:"flex",gap:4}}>
                        {[
                          {id:"owner", l:"Owner-operated", sub:"Notional cost"},
                          {id:"hired", l:"Hired Worker",   sub:`BCEA ${ZAR(prov.hired??5594)}/mo`},
                        ].map(m=>(
                          <button key={m.id} onClick={()=>setLabourMode(m.id)}
                            style={{flex:1,padding:"6px 8px",background:labourMode===m.id?PALETTE.dim:"transparent",border:`1px solid ${labourMode===m.id?PALETTE.borderHover:PALETTE.faint}`,borderRadius:7,cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
                            <div style={{fontSize:9,color:labourMode===m.id?PALETTE.accent:PALETTE.muted,fontWeight:labourMode===m.id?600:400}}>{m.l}</div>
                            <div style={{fontSize:7,color:PALETTE.dim}}>{m.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      <Field label="Carcass R/kg" value={carcass} onChange={setCarcass} pre="R" hint="A2 R87 AgriOrbit" min={40} max={250}/>
                      <Field label="Flock Size" value={flockSize} onChange={setFlockSize} suf="ewes" hint={result.breakeven?`MVO=${result.breakeven}`:`MVO=?`} min={1} max={10000}/>
                      {labourMode==="owner" && (
                        <Field label="Labour/mo" value={labour} onChange={setLabour} pre="R" hint="Owner R1,500+" min={0} max={50000}/>
                      )}
                    </div>

                    {/* Additional costs toggle */}
                    <button onClick={()=>setShowCosts(v=>!v)}
                      style={{width:"100%",marginTop:8,padding:"6px 10px",background:"transparent",border:`1px solid ${PALETTE.faint}`,borderRadius:6,color:PALETTE.muted,fontSize:9,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span>Additional costs (bond · feed · meds · fencing · misc)</span>
                      <span style={{color:PALETTE.accent,fontWeight:700}}>{showCosts?"▲":"▼"}</span>
                    </button>

                    {showCosts && (
                      <div style={{marginTop:8,borderTop:`1px solid ${PALETTE.faint}`,paddingTop:10}}>
                        <div style={{fontSize:8,color:PALETTE.dim,marginBottom:8,lineHeight:1.5}}>
                          Override province defaults to model your actual costs. Leave blank to use province estimate.
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                          <Field label="Bond repayment/mo" value={bondMonthly||""} onChange={v=>setBondMonthly(v||0)} pre="R" hint="Finance instalment" min={0} max={500000}/>
                          <Field label="Fencing/infra/mo"  value={fencingMonthly||""} onChange={v=>setFencingMonthly(v||0)} pre="R" hint="Maint + repairs" min={0} max={100000}/>
                          <Field label="Feed/ewe/yr"        value={feedOverride!==null?feedOverride:prov.feed} onChange={v=>setFeedOverride(v)} pre="R"
                            hint={`Default: ${ZAR(prov.feed)}`} min={0} max={10000}/>
                          <Field label="Meds+vet/ewe/yr"   value={healthOverride!==null?healthOverride:prov.health} onChange={v=>setHealthOverride(v)} pre="R"
                            hint={`Default: ${ZAR(prov.health)}`} min={0} max={5000}/>
                          <Field label="Misc/mo"            value={miscMonthly||""} onChange={v=>setMiscMonthly(v||0)} pre="R" hint="Other fixed costs" min={0} max={100000}/>
                        </div>
                        {/* Cost breakdown summary */}
                        <div style={{marginTop:10,background:PALETTE.bg,border:`1px solid ${PALETTE.faint}`,borderRadius:7,padding:"8px"}}>
                          <div style={{fontSize:8,color:PALETTE.dim,marginBottom:6,textTransform:"uppercase",letterSpacing:.7}}>Annual cost breakdown — {flockSize} ewes</div>
                          {Object.values(result.costBreakdown).filter(c=>c.annual>0).map((c,i)=>(
                            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid ${PALETTE.faint}22`,fontSize:9}}>
                              <span style={{color:PALETTE.muted}}>{c.label}</span>
                              <span style={{color:PALETTE.text,fontFamily:"'Playfair Display',serif",fontWeight:600}}>{ZAR(Math.round(c.annual))}</span>
                            </div>
                          ))}
                          <div style={{display:"flex",justifyContent:"space-between",paddingTop:5,marginTop:3,borderTop:`1px solid ${PALETTE.faint}`,fontSize:10}}>
                            <span style={{color:PALETTE.text,fontWeight:600}}>Total annual costs</span>
                            <span style={{color:PALETTE.danger,fontFamily:"'Playfair Display',serif",fontWeight:700}}>{ZAR(Math.round(result.totalCostPerEwe*flockSize))}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3 KPI cards */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                    {[
                      {l:"Profit/Ewe", v:`${SGN(result.profitPerEwe)}${ZAR(result.profitPerEwe)}`, c:pc, big:true},
                      {l:"Annual ROI", v:PCT(result.roi), c:pc, big:true},
                      {l:"Payback",    v:result.payback?(result.payback>20?">20 yr":`${result.payback.toFixed(1)} yr`):"∞", c:PALETTE.gold, big:true},
                    ].map((s,i)=>(
                      <div key={i} style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderRadius:8,padding:"12px 8px",textAlign:"center"}}>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:8,color:PALETTE.dim,marginTop:3,textTransform:"uppercase",letterSpacing:.5}}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Revenue + cost summary */}
                  <div style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderRadius:8,padding:"10px",marginBottom:6}}>
                    {[
                      {l:`Revenue (${flockSize} ewes)`,    v:ZAR(result.flockRev),                       c:PALETTE.accent},
                      {l:"Total cost",                      v:`−${ZAR(result.totalCostPerEwe*flockSize)}`, c:PALETTE.danger},
                      {l:"Flock profit/yr",                 v:`${SGN(result.flockProfit)}${ZAR(Math.abs(result.flockProfit))}`, c:pc},
                    ].map((row,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:i<2?`1px solid ${PALETTE.faint}22`:"none"}}>
                        <span style={{fontSize:9,color:PALETTE.muted}}>{row.l}</span>
                        <span style={{fontFamily:"'Playfair Display',serif",fontSize:13,fontWeight:700,color:row.c}}>{row.v}</span>
                      </div>
                    ))}
                  </div>
                  {/* Capital + NPV mini row */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                    {[
                      {l:"Capital needed",  v:ZAR(result.capital),                                               c:PALETTE.gold},
                      {l:"5-yr NPV (10%)", v:`${SGN(result.npv5)}${ZAR(Math.abs(result.npv5))}`, c:result.npv5>=0?PALETTE.accent:PALETTE.danger},
                    ].map((s,i)=>(
                      <div key={i} style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderRadius:7,padding:"7px 8px",textAlign:"center"}}>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:12,fontWeight:700,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:7,color:PALETTE.dim,marginTop:2,textTransform:"uppercase",letterSpacing:.4}}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {/* MVO + Capital structure */}
                  {result.breakeven && (
                    <div style={{background:"rgba(200,168,75,.06)",border:`1px solid rgba(200,168,75,.20)`,borderRadius:8,padding:"10px",marginBottom:10}}>
                      <div style={{fontSize:8,color:PALETTE.gold,textTransform:"uppercase",letterSpacing:.8,marginBottom:7}}>Minimum Viable Operation</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:7}}>
                        {[
                          {l:"Start with",     v:`${result.breakeven} ewes`,   c:PALETTE.text},
                          {l:"Capital needed", v:ZAR(result.mvoCapital),        c:PALETTE.gold},
                          {l:"First revenue",  v:"Month 13",                    c:PALETTE.accent},
                        ].map((s,i)=>(
                          <div key={i} style={{background:PALETTE.bg,borderRadius:5,padding:"5px 4px",textAlign:"center",border:`1px solid ${PALETTE.faint}`}}>
                            <div style={{fontSize:11,fontWeight:700,color:s.c,fontFamily:"'Playfair Display',serif"}}>{s.v}</div>
                            <div style={{fontSize:7,color:PALETTE.dim,marginTop:1,textTransform:"uppercase"}}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                      {flockSize < result.breakeven
                        ? <div style={{fontSize:9,color:PALETTE.danger,lineHeight:1.5}}>⚠ {flockSize} ewes is below MVO — increase flock or reduce costs to break even</div>
                        : <div style={{fontSize:9,color:PALETTE.muted,lineHeight:1.5}}>Strategy: Start at MVO ({result.breakeven} ewes), reinvest year-2 profit to reach {Math.round(result.breakeven * 1.5)} ewes by year 3</div>
                      }
                    </div>
                  )}

                  {/* Capital structure */}
                  <div style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderRadius:8,padding:"10px",marginBottom:10}}>
                    <div style={{fontSize:8,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>Capital structure — {flockSize} ewes</div>
                    {[
                      {l:`Ewe purchase (${flockSize} × ${ZAR(prov.ewePrice)})`, v:ZAR(result.ewePurchase), pct:result.ewePurchase/result.capital},
                      {l:"12-month working capital buffer",                      v:ZAR(result.workingCapital), pct:result.workingCapital/result.capital},
                    ].map((row,i)=>(
                      <div key={i} style={{marginBottom:7}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontSize:9,color:PALETTE.muted}}>{row.l}</span>
                          <span style={{fontSize:10,color:PALETTE.gold,fontFamily:"'Playfair Display',serif",fontWeight:700}}>{row.v}</span>
                        </div>
                        <div style={{height:5,background:PALETTE.bg,borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${(row.pct*100).toFixed(1)}%`,background:PALETTE.gold,borderRadius:3,transition:"width .4s"}}/>
                        </div>
                      </div>
                    ))}
                    <div style={{display:"flex",justifyContent:"space-between",paddingTop:6,borderTop:`1px solid ${PALETTE.faint}`}}>
                      <span style={{fontSize:10,color:PALETTE.text,fontWeight:600}}>Total capital required</span>
                      <span style={{fontSize:14,color:PALETTE.gold,fontFamily:"'Playfair Display',serif",fontWeight:700}}>{ZAR(result.capital)}</span>
                    </div>
                  </div>

                  {/* 36-month cashflow chart */}
                  <div style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderRadius:8,padding:"10px",marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                      <div style={{fontSize:8,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:.8}}>36-month cashflow</div>
                      <div style={{fontSize:7,color:PALETTE.gold}}>— cumulative balance</div>
                    </div>
                    <MiniCashflow36 cf36={result.cf36} ewePurchase={result.ewePurchase}/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:8}}>
                      {[
                        {l:"First revenue",  v:`Mo ${result.firstProfitMonth ?? "—"}`,  c:PALETTE.accent},
                        {l:"Payback",        v:result.paybackMonth?`Mo ${result.paybackMonth}`:">36mo", c:result.paybackMonth?PALETTE.accent:PALETTE.danger},
                        {l:"Yr 2 balance",   v:`${SGN(result.cf36[23]?.cum??0)}${ZAR(Math.abs(result.cf36[23]?.cum??0))}`, c:(result.cf36[23]?.cum??-1)>=0?PALETTE.accent:PALETTE.danger},
                      ].map((s,i)=>(
                        <div key={i} style={{background:PALETTE.bg,borderRadius:5,padding:"5px 4px",textAlign:"center",border:`1px solid ${PALETTE.faint}`}}>
                          <div style={{fontSize:10,fontWeight:700,color:s.c,fontFamily:"'Playfair Display',serif"}}>{s.v}</div>
                          <div style={{fontSize:7,color:PALETTE.dim,marginTop:1,textTransform:"uppercase"}}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:8,color:PALETTE.dim,marginTop:6,lineHeight:1.5}}>
                      Bars = monthly profit/loss · Gold line = cumulative balance from Day 0 · Dashed = lamb sale months (13, 25) · Green dot = payback
                    </div>
                  </div>

                  {/* Scale preview */}
                  <div style={{background:PALETTE.card,border:`1px solid ${PALETTE.faint}`,borderRadius:8,padding:"10px",marginBottom:14}}>
                    <div style={{fontSize:8,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>Scale — annual profit by flock size</div>
                    {result.scaleRows.map((row,i)=>{
                      const w = Math.min(Math.max(row.roi*400,0),100);
                      const c = row.profit>=0 ? (row.roi>0.2?PALETTE.accent:PALETTE.gold) : PALETTE.danger;
                      return (
                        <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                          <span style={{fontSize:9,color:PALETTE.muted,width:48,textAlign:"right",flexShrink:0}}>{row.n} ewes</span>
                          <div style={{flex:1,height:8,background:PALETTE.bg,borderRadius:4,overflow:"hidden"}}>
                            <div style={{width:`${w}%`,height:"100%",background:c,borderRadius:4,transition:"width .4s"}}/>
                          </div>
                          <span style={{fontSize:9,fontFamily:"'Playfair Display',serif",color:c,width:70,textAlign:"right",flexShrink:0}}>
                            {SGN(row.profit)}{ZAR(Math.abs(row.profit))}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Locked / Admin-unlocked sections */}
                  <div style={{position:"relative"}}>
                    {/* Content rows */}
                    <div style={{filter:isAdmin?"none":"blur(5px)",userSelect:isAdmin?"auto":"none",pointerEvents:isAdmin?"auto":"none",opacity:isAdmin?1:.45}}>
                      {(()=>{
                        const r200 = result.scaleRows.find(r=>r.n>=200)||result.scaleRows[result.scaleRows.length-1];
                        return [
                          {l:"Full 36-month cashflow table", v:"Month-by-month"},
                          {l:`Scale ${r200.n} ewes profit`, v:`${SGN(r200.profit)}${ZAR(Math.abs(r200.profit))}`},
                          {l:"Capital structure", v:ZAR(result.capital)},
                          {l:"Sensitivity (±20% carcass)", v:"9 scenarios"},
                          {l:"5-yr NPV (10% discount)", v:`${SGN(result.npv5)}${ZAR(Math.abs(result.npv5))}`},
                          {l:"Regional breed comparison", v:"9 breeds ranked"},
                        ];
                      })().map((t,i)=>(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 10px",borderBottom:`1px solid ${PALETTE.faint}`,fontSize:10}}>
                          <span style={{color:PALETTE.text}}>{t.l}</span>
                          <span style={{color:PALETTE.accent}}>{t.v}</span>
                        </div>
                      ))}
                    </div>
                    {/* Overlay — hidden when admin */}
                    {!isAdmin && (
                      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(8,15,6,.78)",borderRadius:8}}>
                        <div style={{fontSize:10,color:PALETTE.muted,marginBottom:10,textAlign:"center",lineHeight:1.7}}>
                          🔒 <strong style={{color:PALETTE.accent}}>6 more sections</strong> in the full report<br/>
                          <span style={{fontSize:9,color:PALETTE.dim}}>Cashflow · Scale · Capital · Sensitivity · 5yr NPV · Breed comparison</span>
                        </div>
                        <button className="glow-btn" onClick={()=>setShowPay(true)}
                          style={{padding:"10px 22px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 16px rgba(200,168,75,.38)`}}>
                          Unlock Full Report — R 1,500 →
                        </button>
                        <button onClick={()=>setShowAdminLogin(true)}
                          style={{marginTop:10,background:"transparent",border:"none",color:PALETTE.faint,fontSize:8,cursor:"pointer",letterSpacing:.5}}>
                          admin preview
                        </button>
                      </div>
                    )}
                    {isAdmin && (
                      <div style={{marginTop:8,display:"flex",justifyContent:"flex-end"}}>
                        <button onClick={()=>setIsAdmin(false)}
                          style={{background:"transparent",border:`1px solid ${PALETTE.faint}`,color:PALETTE.muted,borderRadius:6,padding:"3px 8px",fontSize:8,cursor:"pointer"}}>
                          Exit admin
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

        {/* ── NO SELECTION ── */}
        {!selected && (
          <div style={{flex:1,overflow:"auto",padding:"12px 16px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:8,color:PALETTE.dim,textTransform:"uppercase",letterSpacing:1.5}}>
                9 SA Sheep Provinces — tap any to explore
              </div>
              <div style={{fontSize:8,color:PALETTE.faint}}>↑ or click map</div>
            </div>
            {Object.keys(PROVINCE_DATA).map(key=>{
              const pd = PROVINCE_DATA[key];
              const typeColor = pd.type==="Wool"?PALETTE.gold:pd.type==="Dual"?"#5a9adc":PALETTE.accent;
              return (
                <div key={key} role="button" tabIndex={0} aria-label={`Select ${pd.name} province`}
                  onClick={()=>setSelected(key)}
                  onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelected(key);}}}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:PALETTE.surface,border:`1px solid ${PALETTE.faint}`,borderLeft:`3px solid ${pd.fill}`,borderRadius:8,marginBottom:6,cursor:"pointer",transition:"all .12s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=pd.fill;e.currentTarget.style.background=PALETTE.card;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderLeftColor=pd.fill;e.currentTarget.style.borderTopColor=PALETTE.faint;e.currentTarget.style.borderRightColor=PALETTE.faint;e.currentTarget.style.borderBottomColor=PALETTE.faint;e.currentTarget.style.background=PALETTE.surface;}}>
                  <div style={{width:11,height:11,borderRadius:"50%",background:pd.fill,flexShrink:0,boxShadow:`0 0 7px ${pd.fill}90`}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:11,color:"#e8f5d8",fontWeight:600}}>{pd.name}</span>
                      <span style={{fontSize:7,padding:"1px 5px",borderRadius:8,background:`${typeColor}18`,color:typeColor,border:`1px solid ${typeColor}33`}}>{pd.type}</span>
                    </div>
                    <div style={{fontSize:9,color:PALETTE.dim,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{pd.primary.join(" · ")}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:9,color:PALETTE.muted,fontFamily:"'Playfair Display',serif",fontWeight:600}}>BE {pd.be}</div>
                    <div style={{fontSize:7,color:PALETTE.dim,marginTop:1}}>{pd.rainfall}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── STICKY CTA ── */}
        {selected && (
          <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"10px 16px 14px",background:`linear-gradient(to top,${PALETTE.bg} 70%,transparent)`,zIndex:100}}>
            <button className="glow-btn" onClick={()=>setShowPay(true)}
              style={{width:"100%",padding:"13px",background:PALETTE.gold,color:PALETTE.bg,border:"none",borderRadius:11,fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 24px rgba(200,168,75,.4)`}}>
              Get Full {prov?.name} Report — R 1,500 →
            </button>
          </div>
        )}

      </div>
    </>
  );
}

export default function App() {
  return <ErrorBoundary><AgrimodelPro /></ErrorBoundary>;
}
