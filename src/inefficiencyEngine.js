/**
 * Inefficiency Engine — benchmark-based audit
 * Findings are only raised when the user's actual cost exceeds the SA efficient-operation
 * benchmark for that livestock unit. Saving = (current − benchmark) × flockSize.
 * This prevents the engine from recommending downward when the user is already efficient
 * (or entered a trivially small number).
 */

const SEVERITY_ORDER = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

// Realistic SA production benchmarks per livestock unit (2025 prices)
// These are the costs an efficient, well-run operation achieves — NOT the theoretical minimum.
const BENCH = {
  hive: { health: 25,  feed: 80  },  // R/hive/yr — oxalic acid protocol; forage-placed apiary
  cow:  { health: 200, feed: 900 },  // R/cow/yr  — co-op generics + tick protocol; bulk roughage
  ewe:  { health: 65,  feed: 300 },  // R/ewe/yr  — FAMACHA + co-op generics; bulk/part home-grown
  doe:  { health: 110, feed: 350 },  // R/doe/yr  — FAMACHA mandatory (goats > susceptible than sheep); browse + supplement
};

export function runInefficiencyAudit(inputs, result) {
  const { productionSystem, marketChannel, feedSource, flockSize, unit = "ewe", fencingMonthly = 0 } = inputs;
  const isBee    = unit === "hive";
  const isCattle = unit === "cow";
  const bench    = BENCH[unit] ?? BENCH.ewe;
  const findings = [];

  // 1. Infrastructure — land ops get water infrastructure; bees get hive placement advice
  if (productionSystem !== "intensive") {
    if (isBee) {
      findings.push({
        component: "Hive Placement & Water Access",
        severity: "HIGH",
        si: 10.0,
        currentLabel: "No dedicated water source near apiaries",
        optimizedLabel: "Shallow troughs / dripper system: R1k–R3k per site",
        annualSaving: null,
        capitalSaving: 2000,
        action:
          "Install shallow water troughs or wick-drinkers within 100m of every apiary. " +
          "Bees won't forage effectively more than 3km from water — on-site water increases " +
          "colony productivity by 15–25% and reduces absconding. Cost per site: R800–R2,500.",
      });
    } else {
      findings.push({
        component: "Water Infrastructure",
        severity: "HIGH",
        si: 10.0,
        currentLabel: "Mains / contractor bore: R60k–R80k+",
        optimizedLabel: "Solar pump + JoJo tanks: R25k–R30k",
        annualSaving: null,
        capitalSaving: 50000,
        action:
          "Install solar-powered pump (5–10kW panels + DC pump, R20k–R80k). " +
          "Where rainfall exceeds 600mm, add 10kL rainwater harvesting tank (R8k–R15k). " +
          "Combined approach cuts water infrastructure capital by R50k+ and ongoing electricity costs by 60–70%.",
      });
    }
  }

  // 2. Health / treatment costs — only flag if current cost exceeds the SA benchmark
  const currentHealth = result.healthCost ?? 0;
  if (currentHealth > bench.health) {
    const savingPerUnit   = currentHealth - bench.health;
    const healthAnnualSaving = Math.round(savingPerUnit * flockSize);
    findings.push({
      component: isBee ? "Varroa & Hive Treatment Costs" : "Veterinary Medicines",
      severity: "CRITICAL",
      si: 9.0,
      wizardStepId: "healthCost",
      currentLabel: `R${currentHealth}/${unit}/yr (your current cost)`,
      optimizedLabel: `R${bench.health}/${unit}/yr (SA ${isBee ? "organic-treatment" : "co-op generic"} benchmark)`,
      annualSaving: healthAnnualSaving,
      capitalSaving: 0,
      action: isBee
        ? `Switch to oxalic acid vaporisation (R0.80–R1.20/treatment vs R15–25/hive for synthetic miticides). ` +
          `Combine with drone-brood trapping during spring to reduce mite load without chemicals. ` +
          `Implement a monitoring-first protocol (sugar roll or alcohol wash) before every treatment cycle. ` +
          `SA benchmark for an efficient apiary: R${bench.health}/hive/yr. ` +
          `You can save R${savingPerUnit}/hive/yr — R${healthAnnualSaving.toLocaleString()} across your ${flockSize} hives.`
        : `Join or form a buying cooperative to purchase generic animal health products from ` +
          `wholesalers (Pharmed, ANB Vet). Switch to generic equivalents where registered. ` +
          `Implement a preventive FAMACHA-based dosing protocol to reduce treatment frequency. ` +
          `SA benchmark for an efficient operation: R${bench.health}/${unit}/yr. ` +
          `You can save R${savingPerUnit}/${unit}/yr — R${healthAnnualSaving.toLocaleString()} across your ${flockSize} ${unit}s.`,
    });
  }

  // 3. Fencing — land-based operations only
  if (!isBee) {
    if (fencingMonthly > 0) {
      // User has entered their actual monthly fencing cost — make the finding dynamic
      const annualFencing  = fencingMonthly * 12;
      const targetAnnual   = Math.round(annualFencing * 0.6); // 40% reduction via electric/DIY
      const fenceAnnualSaving = annualFencing - targetAnnual;
      findings.push({
        component: "Fencing & Infrastructure",
        severity: "HIGH",
        si: 4.4,
        currentLabel: `R${fencingMonthly}/month (R${annualFencing.toLocaleString()}/yr)`,
        optimizedLabel: `~R${Math.round(fencingMonthly * 0.6)}/month with electric fencing`,
        annualSaving: fenceAnnualSaving,
        capitalSaving: 0,
        action:
          `Your fencing/infrastructure cost of R${fencingMonthly}/month (R${annualFencing.toLocaleString()}/yr) ` +
          `can be cut by ~40% by switching rotational camp fencing to polywire/polytape with step-in posts. ` +
          `DIY electric installation costs R130/m vs R200/m for conventional contractor — a 35% capital saving on new runs. ` +
          `Stone-pack corners add predator deterrence at near-zero extra cost. ` +
          `Estimated annual maintenance saving: R${fenceAnnualSaving.toLocaleString()}.`,
      });
    } else {
      // No monthly cost entered — show generic capital recommendation
      findings.push({
        component: "Fencing",
        severity: "HIGH",
        si: 4.4,
        currentLabel: "Conventional contractor: R200/m installed",
        optimizedLabel: "DIY electric (polywire + posts): R130/m",
        annualSaving: null,
        capitalSaving: 70,
        action:
          "Use temporary electric fencing (polywire/polytape with lightweight step-in posts) " +
          "for rotational grazing camps. DIY installation saves 35% upfront vs a contractor. " +
          "Enter your monthly fencing/infra cost in the Model tab to see a quantified saving.",
      });
    }
  }

  // 4. Transport / distribution
  if (marketChannel !== "direct") {
    findings.push({
      component: isBee ? "Honey Distribution" : "Transport & Logistics",
      severity: "MEDIUM",
      si: 3.5,
      wizardStepId: "market",
      currentLabel: isBee ? "Bulk to co-op / packer at R40–65/kg" : "R35/100km per load (solo trip)",
      optimizedLabel: isBee ? "Direct retail / farmers market at R90–150/kg" : "R26/100km (shared, route-optimised)",
      annualSaving: null,
      capitalSaving: 0,
      action: isBee
        ? "Set up a direct-to-consumer channel: farmers markets, WhatsApp orders, or a simple online store. " +
          "Premium fynbos, citrus, or bushveld honey sells at R90–150/kg vs R45–65/kg bulk. " +
          "Start with 20% of your crop direct-retail — minimal overhead, immediate price discovery."
        : "Form or join a livestock transport cooperative in your district. " +
          "Coordinate multi-drop trips to the same abattoir — split fixed costs across farms. " +
          "Use free route-optimisation apps to avoid dead-mileage. " +
          "Shared bulk transport reduces cost per farm by 15–25% per run.",
    });
  }

  // 5. Feed — only flag if purchased AND current cost exceeds the SA benchmark
  if (feedSource === "purchased") {
    const currentFeed = result.feedCost ?? 0;
    if (currentFeed > bench.feed) {
      const savingPerUnit  = currentFeed - bench.feed;
      const feedAnnualSaving = Math.round(savingPerUnit * flockSize);
      findings.push({
        component: isBee ? "Supplemental Feeding Costs" : "Animal Feed",
        severity: "HIGH",
        si: 1.76,
        wizardStepId: "feedCost",
        currentLabel: `R${currentFeed}/${unit}/yr (your current cost)`,
        optimizedLabel: `R${bench.feed}/${unit}/yr (SA efficient-operation benchmark)`,
        annualSaving: feedAnnualSaving,
        capitalSaving: 0,
        action: isBee
          ? `Prioritise apiary placement near year-round forage (mixed bushveld, citrus orchards, wildflower zones) ` +
            `to reduce or eliminate off-season syrup feeding. Migratory placement during dearth periods eliminates ` +
            `syrup costs entirely. Bulk molasses-based supplement is 40% cheaper than commercial syrup. ` +
            `SA benchmark: R${bench.feed}/hive/yr. You can save R${savingPerUnit}/hive/yr — ` +
            `R${feedAnnualSaving.toLocaleString()} across your ${flockSize} hives.`
          : `Transition to home-grown forage: lucerne or sorghum on idle irrigable land. ` +
            `Utilise maize and soybean crop residues as cost-free winter supplement. ` +
            `Buy bulk commercial feed during summer months when prices are 15–25% lower. ` +
            `SA benchmark for an efficient operation: R${bench.feed}/${unit}/yr. ` +
            `You can save R${savingPerUnit}/${unit}/yr — R${feedAnnualSaving.toLocaleString()} across your ${flockSize} ${unit}s.`,
      });
    }
  }

  // 6. Market access — price premium vs auction (percentage of revenue is appropriate here)
  if (marketChannel === "auction") {
    const marketRevGain = Math.round((result.flockRev ?? 0) * 0.12);
    findings.push({
      component: isBee ? "Honey Marketing Channel" : "Market Access",
      severity: "MEDIUM",
      si: null,
      wizardStepId: "market",
      currentLabel: isBee ? "Wholesale / co-op — lowest margin" : "Auction — 3–5% commission + transport",
      optimizedLabel: isBee ? "Direct retail — full margin captured" : "Direct sale — full carcass price captured",
      annualSaving: marketRevGain,
      capitalSaving: 0,
      action: isBee
        ? "Build a direct honey brand: clear labelling, floral origin story (Karoo, Fynbos, Citrus), and 500g glass jars. " +
          "Farmers markets, local delis, and WhatsApp group orders each add R15–30/kg above wholesale. " +
          "Pollination service contracts (R700–1,200/hive/visit) often earn more per hour than honey production."
        : "Add direct-to-consumer channels alongside auction sales. " +
          "Freezer-lamb sales (whole or half carcass), farmers' market stalls, " +
          "and CSA-style monthly subscription boxes can add 12–20% to your net margin. " +
          "Start with 10% of the flock direct — minimal admin, immediate price discovery.",
    });
  }

  findings.sort((a, b) => (SEVERITY_ORDER[b.severity] ?? 0) - (SEVERITY_ORDER[a.severity] ?? 0));

  const totalAnnualSaving  = findings.reduce((s, f) => s + (f.annualSaving  ?? 0), 0);
  const totalCapitalSaving = findings.reduce((s, f) => s + (f.capitalSaving ?? 0), 0);

  return { findings, totalAnnualSaving, totalCapitalSaving };
}
