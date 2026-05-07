class RecommendationEngine {
    constructor(farmInputs, baseResults, inefficiencyList) {
        this.inputs          = farmInputs;
        this.results         = baseResults;
        this.inefficiencies  = inefficiencyList;
        this.recommendations = [];
        this.missingData     = [];
        this.benchmarkGaps   = {};
        this.confidenceScore = 0;
    }

    generate() {
        this._benchmarkComparison();
        this._prioritizeInefficiencies();
        this._generateStrategicActions();
        this._identifyDataGaps();
        this._assignConfidenceScores();
        return {
            recommendations: this.recommendations,
            missingData:     this.missingData,
            confidenceScore: this._overallConfidence(),
            summary:         this._executiveSummary()
        };
    }

    _benchmarkComparison() {
        const benchmarks = {
            profitMargin:       { good: 25, average: 15, poor: 10 },
            weaningRate:        { good: 85, average: 70, poor: 55 },
            costPerEwe:         { good: 800, average: 1200, poor: 1600 },
            lambsWeanedPerEwe:  { good: 1.2, average: 0.9, poor: 0.6 }
        };
        const actual = {
            profitMargin:      this.results.profitMargin,
            weaningRate:       (this.results.lambsWeaned / this.inputs.flockSize) * 100,
            costPerEwe:        this.results.costPerEwe,
            lambsWeanedPerEwe: this.results.lambsWeaned / this.inputs.flockSize
        };
        for (const key in benchmarks) {
            const val = actual[key];
            if (val == null) { this.missingData.push({ metric: key, reason: 'Not calculated' }); continue; }
            if (val < benchmarks[key].poor)    this.benchmarkGaps[key] = 'critical';
            else if (val < benchmarks[key].average) this.benchmarkGaps[key] = 'below_average';
            else if (val < benchmarks[key].good)    this.benchmarkGaps[key] = 'average';
            else                                     this.benchmarkGaps[key] = 'good';
        }
    }

    _prioritizeInefficiencies() {
        const weights = {
            'Water Infrastructure': 3, 'Veterinary Medicines': 5,
            'Fencing': 2, 'Transport & Logistics': 2,
            'Animal Feed': 4, 'Market Access': 3
        };
        this.prioritizedIneff = this.inefficiencies
            .map(i => ({ ...i, priorityWeight: weights[i.component] || 1 }))
            .sort((a, b) => b.priorityWeight - a.priorityWeight);
    }

    _generateStrategicActions() {
        const r = this.results;

        if (r.netProfit < 0) {
            this.recommendations.push({
                id: 'fin_001', priority: 'CRITICAL', effort: 'High', impact: 'Very High', timeline: '0–3 months',
                title: 'Immediate loss mitigation',
                description: `Farm is losing R${Math.abs(r.netProfit).toFixed(0)}/year.`,
                actions: ['Reduce flock to carrying capacity', 'Switch to direct marketing (+20% margin)', 'Implement top 2 inefficiency fixes']
            });
        } else if (r.profitMargin < 15) {
            this.recommendations.push({
                id: 'fin_002', priority: 'HIGH', effort: 'Medium', impact: 'High', timeline: '3–6 months',
                title: 'Improve margin to sustainable level',
                description: `Current margin ${r.profitMargin.toFixed(1)}% — below 15% benchmark.`,
                actions: ['Reduce feed costs 15% (see feed inefficiency)', 'Improve weaning rate 5%', 'Add one diversification stream']
            });
        }

        if (r.isOverstocked) {
            this.recommendations.push({
                id: 'stock_001', priority: 'CRITICAL', effort: 'High', impact: 'Very High', timeline: '6–12 months',
                title: 'Resolve overstocking',
                description: `Overstocked by ${r.stockingDeficit.toFixed(0)} ewes.`,
                actions: [
                    `Reduce flock to ${Math.floor(r.maxRecommendedStock)} ewes within 6 months`,
                    `Or expand land by ${((this.inputs.flockSize / r.carryingCapacityRate) - this.inputs.landHa).toFixed(1)} ha`,
                    'Implement rotational grazing (+20% effective carrying capacity)'
                ]
            });
        }

        for (const ineff of this.prioritizedIneff) {
            this.recommendations.push({
                id:          `ineff_${ineff.component.replace(/\s/g, '_')}`,
                priority:    ineff.severity,
                effort:      this._estimateEffort(ineff.component),
                impact:      this._estimateImpact(ineff.component),
                timeline:    this._estimateTimeline(ineff.component),
                title:       `Reduce inefficiency: ${ineff.component}`,
                description: ineff.action,
                actions:     this._breakdownActions(ineff.component)
            });
        }

        if (this.inputs.flockSize < 100 && r.profitMargin < 20) {
            this.recommendations.push({
                id: 'div_001', priority: 'MEDIUM', effort: 'Low', impact: 'Medium', timeline: '3–6 months',
                title: 'Add complementary revenue streams',
                description: 'Small flocks need diversification to stabilise income.',
                actions: ['Manure composting → R5–20/ewe', 'Farm tours / shearing demos → R5k–50k/yr', 'Biltong/droëwors from 10% of lambs → +50% margin']
            });
        }

        if (['below_average','critical'].includes(this.benchmarkGaps.weaningRate)) {
            this.recommendations.push({
                id: 'prod_001', priority: 'HIGH', effort: 'Medium', impact: 'High', timeline: '6–12 months',
                title: 'Improve lamb weaning rate',
                description: `Current rate ${((this.results.lambsWeaned / this.inputs.flockSize) * 100).toFixed(0)}% below 70% industry average.`,
                actions: ['Pre-lambing vaccination programme', 'Better nutrition 6 weeks before lambing', 'Cull poor-performing ewes', 'Assisted lambing for difficult births']
            });
        }
    }

    _breakdownActions(component) {
        return {
            'Water Infrastructure': ['Install solar pump (R20k–R80k)', 'Add rainwater harvesting (R8k–R15k)', 'Share borehole with neighbours'],
            'Veterinary Medicines': ['Join buying cooperative (save 60%)', 'Switch to generic alternatives', 'Implement preventive health schedule'],
            'Fencing':              ['Use temporary electric fencing (polywire)', 'DIY installation (save 35%)', 'Stone packing at base'],
            'Transport & Logistics':['Form transport cooperative', 'Coordinate multi-drop trips', 'Route optimisation'],
            'Animal Feed':          ['Grow lucerne on idle land', 'Buy bulk in summer (save 15–25%)', 'Use maize residues as winter feed'],
            'Market Access':        ['Start direct freezer lamb sales', 'Attend farmers market', 'Create CSA subscription model']
        }[component] || ['Implement inefficiency reduction strategy'];
    }

    _estimateEffort(c)    { return { 'Water Infrastructure':'High','Veterinary Medicines':'Low','Fencing':'Medium','Transport & Logistics':'Medium','Animal Feed':'Medium','Market Access':'Low' }[c] || 'Medium'; }
    _estimateImpact(c)    { return { 'Water Infrastructure':'High','Veterinary Medicines':'Very High','Fencing':'Medium','Transport & Logistics':'Medium','Animal Feed':'High','Market Access':'High' }[c] || 'Medium'; }
    _estimateTimeline(c)  { return { 'Water Infrastructure':'3–6 months','Veterinary Medicines':'1–3 months','Fencing':'1–3 months','Transport & Logistics':'3–6 months','Animal Feed':'6–12 months','Market Access':'1–3 months' }[c] || '3–6 months'; }

    _identifyDataGaps() {
        const checks = [
            ['rainfall_mm',              'Annual rainfall (mm) — for rainwater harvesting recommendations'],
            ['soilType',                 'Soil type — affects carrying capacity and crop selection'],
            ['distanceToNearestTown_km', 'Distance to nearest town — transport cost and market access'],
            ['lambMortalityRate',        'Pre-weaning mortality rate — to fine-tune profitability'],
            ['woolMicron',               'Wool micron (Merino) — to determine price premium potential'],
            ['hasSolar',                 'Existing solar infrastructure — to size water pump recommendation'],
            ['cooperativeMember',        'Cooperative membership — bulk buying or shared transport recommendation']
        ];
        this.missingData = checks
            .filter(([key]) => this.inputs[key] == null || this.inputs[key] === '')
            .map(([, label]) => ({ field: label, importance: 'High' }));
    }

    _assignConfidenceScores() {
        const weights = {
            landHa: 10, flockSize: 10, breed: 5, productionSystem: 5,
            marketChannel: 5, feedSource: 5, rainfall_mm: 8, soilType: 7,
            distanceToNearestTown_km: 6, lambMortalityRate: 8, woolMicron: 4,
            hasSolar: 4, cooperativeMember: 3
        };
        let total = 0, filled = 0;
        for (const [key, w] of Object.entries(weights)) {
            total += w;
            if (this.inputs[key] != null && this.inputs[key] !== '') filled += w;
        }
        this.confidenceScore = (filled / total) * 100;
    }

    _overallConfidence() { return Math.min(100, Math.max(0, this.confidenceScore)); }

    _executiveSummary() {
        return {
            status:             this.results.netProfit > 0 ? (this.results.profitMargin > 15 ? 'Profitable' : 'Marginally profitable') : 'Loss-making',
            topPriority:        this.recommendations.filter(r => r.priority === 'CRITICAL').map(r => r.title),
            improvementPotential: this._calculateImprovementPotential(),
            dataCompleteness:   `${this._overallConfidence().toFixed(0)}%`
        };
    }

    _calculateImprovementPotential() {
        const total = this.inefficiencies.reduce((sum, i) => {
            return sum + (i.currentCostEstimate && i.optimizedCostEstimate ? i.currentCostEstimate - i.optimizedCostEstimate : 0);
        }, 0);
        return `R${total.toFixed(0)} – R${(total * 1.5).toFixed(0)} per year`;
    }
}

module.exports = RecommendationEngine;
