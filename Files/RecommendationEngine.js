/**
 * RECOMMENDATION ENGINE - Closed Loop
 * Integrates base model results + inefficiency audit
 * Outputs prioritized action plan with data gap analysis
 */

class RecommendationEngine {
  constructor(farmInputs, baseResults, inefficiencyList) {
    this.inputs = farmInputs;
    this.results = baseResults;
    this.inefficiencies = inefficiencyList; // from InefficiencyEngine
    this.recommendations = [];
    this.missingData = [];
  }

  /**
   * Main entry point: generates final recommendations
   * @returns {Object} { recommendations, missingData, confidenceScore }
   */
  generate() {
    this._benchmarkComparison();
    this._prioritizeInefficiencies();
    this._generateStrategicActions();
    this._identifyDataGaps();
    this._assignConfidenceScores();
    return {
      recommendations: this.recommendations,
      missingData: this.missingData,
      confidenceScore: this._overallConfidence(),
      summary: this._executiveSummary()
    };
  }

  // ---------- Benchmarking ----------
  _benchmarkComparison() {
    const benchmarks = {
      profitMargin: { good: 25, average: 15, poor: 10 },
      weaningRate: { good: 85, average: 70, poor: 55 },
      mortalityPre: { good: 8, average: 12, poor: 18 },
      costPerEwe: { good: 800, average: 1200, poor: 1600 },
      lambsWeanedPerEwe: { good: 1.2, average: 0.9, poor: 0.6 }
    };
    const actual = {
      profitMargin: this.results.profitMargin,
      weaningRate: (this.results.lambsWeaned / this.inputs.flockSize) * 100,
      mortalityPre: null, // not directly available – flag missing
      costPerEwe: this.results.costPerEwe,
      lambsWeanedPerEwe: this.results.lambsWeaned / this.inputs.flockSize
    };
    this.benchmarkGaps = {};
    for (let key in benchmarks) {
      let actualVal = actual[key];
      if (actualVal !== undefined) {
        if (actualVal < benchmarks[key].poor) this.benchmarkGaps[key] = 'critical';
        else if (actualVal < benchmarks[key].average) this.benchmarkGaps[key] = 'below_average';
        else if (actualVal < benchmarks[key].good) this.benchmarkGaps[key] = 'average';
        else this.benchmarkGaps[key] = 'good';
      } else {
        this.missingData.push({ metric: key, reason: 'Not calculated – requires mortality data input' });
      }
    }
  }

  // ---------- Prioritize Inefficiencies ----------
  _prioritizeInefficiencies() {
    // Map inefficiencies to priority based on SI and farm context
    const priorityMap = {
      'Water Infrastructure': { severity: 'HIGH', weight: 3 },
      'Veterinary Medicines': { severity: 'CRITICAL', weight: 5 },
      'Fencing': { severity: 'HIGH', weight: 2 },
      'Transport & Logistics': { severity: 'MEDIUM', weight: 2 },
      'Animal Feed': { severity: 'HIGH', weight: 4 },
      'Market Access': { severity: 'MEDIUM', weight: 3 }
    };
    this.prioritizedIneff = this.inefficiencies.map(ineff => {
      const p = priorityMap[ineff.component] || { severity: 'LOW', weight: 1 };
      return { ...ineff, priorityWeight: p.weight, severity: p.severity };
    }).sort((a,b) => b.priorityWeight - a.priorityWeight);
  }

  // ---------- Generate Strategic Actions (closing the loop) ----------
  _generateStrategicActions() {
    // 1. Critical financial actions
    if (this.results.netProfit < 0) {
      this.recommendations.push({
        id: 'fin_001',
        title: 'Immediate loss mitigation',
        description: `Your farm is losing R${Math.abs(this.results.netProfit).toFixed(0)}/year. Immediate action required.`,
        actions: [
          'Reduce flock to carrying capacity (see stocking recommendation)',
          'Switch to direct marketing to capture 20%+ margin',
          'Implement at least two inefficiency fixes from high-priority list'
        ],
        priority: 'CRITICAL',
        effort: 'High',
        impact: 'Very High',
        timeline: '0-3 months'
      });
    } else if (this.results.profitMargin < 15) {
      this.recommendations.push({
        id: 'fin_002',
        title: 'Improve profit margin to sustainable level',
        description: `Current margin ${this.results.profitMargin.toFixed(1)}% is below 15% benchmark.`,
        actions: [
          'Reduce feed costs by 15% (see feed inefficiency)',
          'Increase weaning rate by 5% (health & genetics)',
          'Add one diversification stream (agri-tourism or direct sales)'
        ],
        priority: 'HIGH',
        effort: 'Medium',
        impact: 'High',
        timeline: '3-6 months'
      });
    }

    // 2. Stocking density action
    if (this.results.isOverstocked) {
      this.recommendations.push({
        id: 'stock_001',
        title: 'Resolve overstocking',
        description: `Overstocked by ${this.results.stockingDeficit.toFixed(0)} ewes.`,
        actions: [
          `Reduce flock to ${Math.floor(this.results.maxRecommendedStock)} ewes within 6 months`,
          `Or expand land by ${((this.inputs.flockSize / this.results.carryingCapacityRate) - this.inputs.landHa).toFixed(1)} ha (cost ~R${( ((this.inputs.flockSize / this.results.carryingCapacityRate) - this.inputs.landHa) * 40000).toFixed(0) })`,
          'Implement rotational grazing to increase effective carrying capacity by 20%'
        ],
        priority: 'CRITICAL',
        effort: 'High',
        impact: 'Very High',
        timeline: '6-12 months'
      });
    }

    // 3. Map inefficiencies to actionable modules
    for (let ineff of this.prioritizedIneff) {
      let actionItem = {
        id: `ineff_${ineff.component.replace(/\s/g,'_')}`,
        title: `Reduce inefficiency: ${ineff.component}`,
        description: ineff.action,
        actions: this._breakdownActions(ineff.component),
        priority: ineff.severity,
        effort: this._estimateEffort(ineff.component),
        impact: this._estimateImpact(ineff.component),
        timeline: this._estimateTimeline(ineff.component)
      };
      this.recommendations.push(actionItem);
    }

    // 4. Diversification if small scale
    if (this.inputs.flockSize < 100 && this.results.profitMargin < 20) {
      this.recommendations.push({
        id: 'div_001',
        title: 'Add complementary revenue streams',
        description: 'Small flocks struggle on meat/wool alone. Diversify to stabilize income.',
        actions: [
          'Start manure composting and sell to gardeners (potential R5-20/ewe)',
          'Offer farm tours or shearing demonstrations (R5k-50k/year)',
          'Process 10% of lambs into biltong/droëwors for direct sale (+50% margin)'
        ],
        priority: 'MEDIUM',
        effort: 'Low',
        impact: 'Medium',
        timeline: '3-6 months'
      });
    }

    // 5. Benchmark-based improvements
    if (this.benchmarkGaps.weaningRate === 'below_average' || this.benchmarkGaps.weaningRate === 'critical') {
      this.recommendations.push({
        id: 'prod_001',
        title: 'Improve lamb weaning rate',
        description: `Current weaning rate ${((this.results.lambsWeaned / this.inputs.flockSize)*100).toFixed(0)}% is below industry average of 70%.`,
        actions: [
          'Implement pre-lambing vaccination program',
          'Provide better nutrition 6 weeks before lambing',
          'Cull poor-performing ewes',
          'Use assisted lambing for difficult births'
        ],
        priority: 'HIGH',
        effort: 'Medium',
        impact: 'High',
        timeline: '6-12 months'
      });
    }
  }

  _breakdownActions(component) {
    const actionMap = {
      'Water Infrastructure': ['Install solar pump (R20k-80k)', 'Add rainwater harvesting (R8k-15k for 10kL tank)', 'Share borehole with neighbours'],
      'Veterinary Medicines': ['Join buying cooperative (save 60%)', 'Switch to generic alternatives', 'Implement preventive health schedule'],
      'Fencing': ['Use temporary electric fencing (polywire)', 'DIY installation (save 35%)', 'Stone packing at base for predator control'],
      'Transport & Logistics': ['Form transport cooperative', 'Use route optimization software', 'Coordinate multi-drop trips'],
      'Animal Feed': ['Grow lucerne on idle land', 'Buy bulk in summer (save 15-25%)', 'Use maize residues as winter feed'],
      'Market Access': ['Start direct freezer lamb sales', 'Attend farmers market', 'Create CSA subscription model']
    };
    return actionMap[component] || ['Implement inefficiency reduction strategy'];
  }

  _estimateEffort(component) {
    const effortMap = {
      'Water Infrastructure': 'High',
      'Veterinary Medicines': 'Low',
      'Fencing': 'Medium',
      'Transport & Logistics': 'Medium',
      'Animal Feed': 'Medium',
      'Market Access': 'Low'
    };
    return effortMap[component] || 'Medium';
  }

  _estimateImpact(component) {
    const impactMap = {
      'Water Infrastructure': 'High',
      'Veterinary Medicines': 'Very High',
      'Fencing': 'Medium',
      'Transport & Logistics': 'Medium',
      'Animal Feed': 'High',
      'Market Access': 'High'
    };
    return impactMap[component] || 'Medium';
  }

  _estimateTimeline(component) {
    const timelineMap = {
      'Water Infrastructure': '3-6 months',
      'Veterinary Medicines': '1-3 months',
      'Fencing': '1-3 months',
      'Transport & Logistics': '3-6 months',
      'Animal Feed': '6-12 months',
      'Market Access': '1-3 months'
    };
    return timelineMap[component] || '3-6 months';
  }

  // ---------- Identify missing data to enrich model ----------
  _identifyDataGaps() {
    const requiredButMissing = [];

    if (!this.inputs.rainfall_mm) requiredButMissing.push('Annual rainfall (mm) – to recommend rainwater harvesting or irrigation');
    if (!this.inputs.soilType) requiredButMissing.push('Soil type – affects carrying capacity and crop selection');
    if (!this.inputs.distanceToNearestTown_km) requiredButMissing.push('Distance to nearest town – transport cost and market access');
    if (!this.inputs.lambMortalityRate) requiredButMissing.push('Pre-weaning mortality rate – to fine-tune profitability');
    if (!this.inputs.woolMicron) requiredButMissing.push('Wool micron (for Merino) – to determine price premium potential');
    if (!this.inputs.hasSolar) requiredButMissing.push('Existing solar infrastructure – to size water pump recommendation');
    if (!this.inputs.cooperativeMember) requiredButMissing.push('Cooperative membership – to recommend bulk buying or shared transport');

    this.missingData = requiredButMissing.map(item => ({ field: item, importance: 'High' }));
  }

  // ---------- Confidence scoring ----------
  _assignConfidenceScores() {
    let totalWeight = 0;
    let filledWeight = 0;
    const weightMap = {
      'landHa': 10, 'flockSize': 10, 'breed': 5, 'productionSystem': 5,
      'marketChannel': 5, 'feedSource': 5, 'rainfall_mm': 8, 'soilType': 7,
      'distanceToNearestTown_km': 6, 'lambMortalityRate': 8, 'woolMicron': 4,
      'hasSolar': 4, 'cooperativeMember': 3
    };
    for (let key in weightMap) {
      totalWeight += weightMap[key];
      if (this.inputs[key] !== undefined && this.inputs[key] !== null && this.inputs[key] !== '') {
        filledWeight += weightMap[key];
      }
    }
    this.confidenceScore = (filledWeight / totalWeight) * 100;
  }

  _overallConfidence() {
    return Math.min(100, Math.max(0, this.confidenceScore));
  }

  _executiveSummary() {
    return {
      status: this.results.netProfit > 0 ? (this.results.profitMargin > 15 ? 'Profitable' : 'Marginally profitable') : 'Loss-making',
      topPriority: this.recommendations.filter(r => r.priority === 'CRITICAL').map(r => r.title),
      estimatedImprovementPotential: this._calculateImprovementPotential(),
      dataCompleteness: `${this._overallConfidence().toFixed(0)}%`
    };
  }

  _calculateImprovementPotential() {
    // Rough estimate based on inefficiencies
    let totalSavings = 0;
    for (let ineff of this.inefficiencies) {
      if (ineff.currentCostEstimate && ineff.optimizedCostEstimate) {
        totalSavings += (ineff.currentCostEstimate - ineff.optimizedCostEstimate);
      }
    }
    return `R${totalSavings.toFixed(0)} - R${(totalSavings * 1.5).toFixed(0)} per year`;
  }
}

// Export for integration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecommendationEngine;
} else {
  window.RecommendationEngine = RecommendationEngine;
}