/**
 * INPUT SENSITIVITY ANALYZER
 * Identifies which user inputs have highest impact on profit.
 * Provides smart defaults and recommendation priority.
 */

class InputSensitivityAnalyzer {
  constructor(model) {
    this.model = model;        // instance of SheepFarmModel
    this.defaults = this._getIndustryDefaults();
    this.sensitivityScores = {};
  }

  /**
   * Industry defaults for South Africa (2025-2026)
   */
  _getIndustryDefaults() {
    return {
      landHa: 100,
      flockSize: 150,
      breed: "Merino",
      productionSystem: "semiIntensive",
      marketChannel: "auction",
      feedSource: "mixed",
      studOperation: false,
      agriTourism: false,
      // New inputs for better accuracy
      annualVetBillPerEwe: 90,        // R/ewe (matches TABLES)
      annualLabourBillTotal: 0,       // 0 means model calculates automatically
      transportCostPer100km: 35,      // R per 100km per load
      feedCostPerTon: 6500,           // R/ton (commercial pellets)
      insurancePerEwe: 0,             // R/ewe (optional)
      theftRiskLevel: "medium",       // low/medium/high
      droughtRiskLevel: "medium",
      distanceToNearestMarket_km: 80,
      rainfall_mm: 500,
      soilType: "loam"
    };
  }

  /**
   * Run sensitivity analysis by varying each input by ±20%
   * and measuring change in net profit.
   * Returns sorted list of most impactful inputs.
   */
  analyze() {
    const baseInputs = { ...this.defaults };
    const baseModel = new SheepFarmModel(baseInputs);
    baseModel.calculate();
    const baseProfit = baseModel.results.netProfit;

    const candidateInputs = [
      { key: "flockSize", delta: 0.2, type: "numeric" },
      { key: "landHa", delta: 0.2, type: "numeric" },
      { key: "feedCostPerTon", delta: 0.2, type: "numeric" },
      { key: "transportCostPer100km", delta: 0.2, type: "numeric" },
      { key: "annualVetBillPerEwe", delta: 0.2, type: "numeric" },
      { key: "insurancePerEwe", delta: 0.2, type: "numeric" },
      { key: "marketChannel", delta: null, type: "categorical", alternatives: ["direct", "abattoir"] }
    ];

    let impacts = [];

    for (let inp of candidateInputs) {
      if (inp.type === "numeric") {
        let newInputs = { ...baseInputs };
        let originalVal = this.defaults[inp.key];
        newInputs[inp.key] = originalVal * (1 + inp.delta);
        let tempModel = new SheepFarmModel(newInputs);
        tempModel.calculate();
        let newProfit = tempModel.results.netProfit;
        let impact = Math.abs((newProfit - baseProfit) / baseProfit) * 100;
        impacts.push({
          key: inp.key,
          impactPercent: impact,
          recommended: impact > 5 ? "HIGH" : (impact > 2 ? "MEDIUM" : "LOW")
        });
      } else if (inp.type === "categorical") {
        for (let alt of inp.alternatives) {
          let newInputs = { ...baseInputs, [inp.key]: alt };
          let tempModel = new SheepFarmModel(newInputs);
          tempModel.calculate();
          let newProfit = tempModel.results.netProfit;
          let impact = Math.abs((newProfit - baseProfit) / baseProfit) * 100;
          impacts.push({
            key: inp.key,
            alternative: alt,
            impactPercent: impact,
            recommended: impact > 5 ? "HIGH" : (impact > 2 ? "MEDIUM" : "LOW")
          });
        }
      }
    }

    impacts.sort((a,b) => b.impactPercent - a.impactPercent);
    this.sensitivityScores = impacts;
    return impacts;
  }

  /**
   * Generate a list of recommended input fields to customize,
   * with default values and reasoning.
   */
  getRecommendationFields() {
    const sensitive = this.sensitivityScores.filter(s => s.recommended !== "LOW");
    const recommendations = [];

    for (let s of sensitive) {
      let displayName = this._humanReadable(s.key);
      let defaultValue = this.defaults[s.key];
      let reason = `Changing this by ±20% changes profit by ${s.impactPercent.toFixed(1)}%.`;
      recommendations.push({
        field: s.key,
        label: displayName,
        defaultValue: defaultValue,
        reason: reason,
        priority: s.recommended
      });
    }

    // Also add insurance if not already high sensitivity – but we add anyway because theft is real
    if (!recommendations.find(r => r.field === "insurancePerEwe")) {
      recommendations.push({
        field: "insurancePerEwe",
        label: "Annual insurance cost per ewe",
        defaultValue: 0,
        reason: "Insurance can protect against theft (5-10% loss risk). Highly recommended for flocks >200.",
        priority: "MEDIUM"
      });
    }

    return recommendations;
  }

  _humanReadable(key) {
    const map = {
      flockSize: "Number of ewes",
      landHa: "Land area (hectares)",
      feedCostPerTon: "Feed cost per ton (R)",
      transportCostPer100km: "Transport cost per 100km (R)",
      annualVetBillPerEwe: "Annual vet cost per ewe (R)",
      insurancePerEwe: "Insurance cost per ewe (R)",
      marketChannel: "Market channel (auction/abattoir/direct)"
    };
    return map[key] || key;
  }
}

module.exports = InputSensitivityAnalyzer;