/**
 * Inefficiency Engine — adapted from brainstorm spec
 * Takes current app inputs + calcFull result, returns audit findings with
 * severity, Stupidity Index, and quantified annual savings in ZAR.
 */

const SEVERITY_ORDER = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

export function runInefficiencyAudit(inputs, result) {
  const { productionSystem, marketChannel, feedSource, flockSize, unit = "ewe" } = inputs;
  const isBee = unit === "hive";
  const findings = [];

  // 1. Infrastructure — land operations get water infrastructure; bees get hive placement advice
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

  // 2. Health / treatment costs — universal high-impact saving, species-specific language
  const healthAnnualSaving = Math.round((result.healthCost ?? 0) * flockSize * 0.60);
  findings.push({
    component: isBee ? "Varroa & Hive Treatment Costs" : "Veterinary Medicines",
    severity: "CRITICAL",
    si: 9.0,
    currentLabel: `R${result.healthCost ?? "?"}/${unit}/yr (${isBee ? "proprietary treatments" : "retail price"})`,
    optimizedLabel: `R${Math.round((result.healthCost ?? 0) * 0.40)}/${unit}/yr (${isBee ? "oxalic acid + organic" : "co-op + generic"})`,
    annualSaving: healthAnnualSaving,
    capitalSaving: 0,
    action: isBee
      ? "Switch to oxalic acid vaporisation (R0.80–R1.20/treatment vs R15–25/hive for synthetic miticides). " +
        "Combine with drone-brood trapping during spring to reduce mite load without chemicals. " +
        "Implement a monitoring-first protocol (sugar roll or alcohol wash) before every treatment cycle. " +
        "Potential 60–70% cost reduction per hive — the largest single annual saving for most apiaries."
      : "Join or form a buying cooperative to purchase generic animal health products from " +
        "wholesalers (Pharmed, ANB Vet). Switch to generic equivalents where registered. " +
        "Implement a preventive FAMACHA-based dosing protocol to reduce treatment frequency. " +
        "Potential 60–70% cost reduction — biggest single annual saving for most operations.",
  });

  // 3. Fencing — relevant for land-based operations only, not beekeepers
  if (!isBee) {
    findings.push({
      component: "Fencing",
      severity: "HIGH",
      si: 4.4,
      currentLabel: "R200/m installed (contractor, fixed)",
      optimizedLabel: "R130/m DIY electric (polywire + posts)",
      annualSaving: null,
      capitalSaving: 70, // rand per meter — multiply by perimeter for project saving
      action:
        "Use temporary electric fencing (polywire/polytape with lightweight step-in posts) " +
        "for rotational grazing camps. DIY installation saves 35% upfront. " +
        "Stone-pack base at corners adds predator deterrence at near-zero extra cost. " +
        "Maintenance savings of 40% over a 10-year horizon vs conventional wire.",
    });
  }

  // 4. Transport / distribution — species-specific framing
  if (marketChannel !== "direct") {
    findings.push({
      component: isBee ? "Honey Distribution" : "Transport & Logistics",
      severity: "MEDIUM",
      si: 3.5,
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

  // 5. Feed / supplemental feeding — only flagged if purchasing
  if (feedSource === "purchased") {
    const feedAnnualSaving = Math.round((result.feedCost ?? 0) * flockSize * 0.40);
    findings.push({
      component: isBee ? "Supplemental Feeding Costs" : "Animal Feed",
      severity: "HIGH",
      si: 1.76,
      currentLabel: `R${result.feedCost ?? "?"}/${unit}/yr (${isBee ? "purchased sugar syrup" : "retail purchased feed"})`,
      optimizedLabel: `R${Math.round((result.feedCost ?? 0) * 0.60)}/${unit}/yr (${isBee ? "forage placement + reduced syrup" : "bulk + home-grown"})`,
      annualSaving: feedAnnualSaving,
      capitalSaving: 0,
      action: isBee
        ? "Prioritise apiary placement near year-round forage (mixed bushveld, citrus orchards, wildflower zones) " +
          "to reduce or eliminate off-season syrup feeding. Migratory placement during dearth periods eliminates " +
          "syrup costs entirely. Bulk molasses-based supplement is 40% cheaper than commercial syrup."
        : "Transition to home-grown forage: lucerne or sorghum on idle irrigable land. " +
          "Utilise maize and soybean crop residues as cost-free winter supplement. " +
          "Buy bulk commercial feed during summer months when prices are 15–25% lower. " +
          "Combined approach achieves a 40–50% reduction in purchased feed costs.",
    });
  }

  // 6. Market access — if selling at the lowest-margin channel
  if (marketChannel === "auction") {
    const marketRevGain = Math.round((result.flockRev ?? 0) * 0.20);
    findings.push({
      component: isBee ? "Honey Marketing Channel" : "Market Access",
      severity: "MEDIUM",
      si: null,
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
          "and CSA-style monthly subscription boxes can add 20–30% to your net margin. " +
          "Start with 10% of the flock direct — minimal admin, immediate price discovery.",
    });
  }

  // Sort by severity
  findings.sort((a, b) => (SEVERITY_ORDER[b.severity] ?? 0) - (SEVERITY_ORDER[a.severity] ?? 0));

  const totalAnnualSaving = findings.reduce((s, f) => s + (f.annualSaving ?? 0), 0);
  const totalCapitalSaving = findings.reduce((s, f) => s + (f.capitalSaving ?? 0), 0);

  return { findings, totalAnnualSaving, totalCapitalSaving };
}
