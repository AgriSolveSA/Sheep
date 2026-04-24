/**
 * Inefficiency Engine — adapted from brainstorm spec
 * Takes current app inputs + calcFull result, returns audit findings with
 * severity, Stupidity Index, and quantified annual savings in ZAR.
 */

const SEVERITY_ORDER = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

export function runInefficiencyAudit(inputs, result) {
  const { productionSystem, marketChannel, feedSource, flockSize } = inputs;
  const findings = [];

  // 1. Water infrastructure — always relevant for non-intensive operations
  if (productionSystem !== "intensive") {
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

  // 2. Veterinary medicines — universal high-impact saving
  const vetAnnualSaving = Math.round((result.healthCost ?? 0) * flockSize * 0.70);
  findings.push({
    component: "Veterinary Medicines",
    severity: "CRITICAL",
    si: 9.0,
    currentLabel: `R${result.healthCost ?? "?"}/ewe/yr (retail price)`,
    optimizedLabel: `R${Math.round((result.healthCost ?? 0) * 0.30)}/ewe/yr (co-op + generic)`,
    annualSaving: vetAnnualSaving,
    capitalSaving: 0,
    action:
      "Join or form a buying cooperative to purchase generic animal health products from " +
      "wholesalers (Pharmed, ANB Vet). Switch to generic equivalents where registered. " +
      "Implement a preventive FAMACHA-based dosing protocol to reduce frequency. " +
      "Potential 70% cost reduction — biggest single annual saving for most operations.",
  });

  // 3. Fencing — relevant for all land-based operations
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

  // 4. Transport & logistics — if not selling direct
  if (marketChannel !== "direct") {
    findings.push({
      component: "Transport & Logistics",
      severity: "MEDIUM",
      si: 3.5,
      currentLabel: "R35/100km per load (solo trip)",
      optimizedLabel: "R26/100km (shared, route-optimised)",
      annualSaving: null,
      capitalSaving: 0,
      action:
        "Form or join a livestock transport cooperative in your district. " +
        "Coordinate multi-drop trips to the same abattoir — split fixed costs across farms. " +
        "Use free route-optimisation apps to avoid dead-mileage. " +
        "Shared bulk transport reduces cost per farm by 15–25% per run.",
    });
  }

  // 5. Animal feed — only flagged if buying from retailers
  if (feedSource === "purchased") {
    const feedAnnualSaving = Math.round((result.feedCost ?? 0) * flockSize * 0.40);
    findings.push({
      component: "Animal Feed",
      severity: "HIGH",
      si: 1.76,
      currentLabel: `R${result.feedCost ?? "?"}/ewe/yr (retail purchased feed)`,
      optimizedLabel: `R${Math.round((result.feedCost ?? 0) * 0.60)}/ewe/yr (bulk + home-grown)`,
      annualSaving: feedAnnualSaving,
      capitalSaving: 0,
      action:
        "Transition to home-grown forage: lucerne or sorghum on idle irrigable land. " +
        "Utilise maize and soybean crop residues as cost-free winter supplement. " +
        "Buy bulk commercial feed during summer months when prices are 15–25% lower. " +
        "Combined approach achieves a 40–50% reduction in purchased feed costs.",
    });
  }

  // 6. Market access — if selling at auction (lowest-margin channel)
  if (marketChannel === "auction") {
    const marketRevGain = Math.round((result.flockRev ?? 0) * 0.20);
    findings.push({
      component: "Market Access",
      severity: "MEDIUM",
      si: null,
      currentLabel: "Auction — 3–5% commission + transport",
      optimizedLabel: "Direct sale — full carcass price captured",
      annualSaving: marketRevGain,
      capitalSaving: 0,
      action:
        "Add direct-to-consumer channels alongside auction sales. " +
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
