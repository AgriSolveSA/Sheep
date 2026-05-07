/**
 * SHEEP FARMING PROFITABILITY MODEL - SOUTH AFRICA
 * Stable Version 1.0 — 2025-2026 benchmarks
 */

const TABLES = {
    carryingCapacity: {
        Merino:      { extensive: 4.0, semiIntensive: 2.0, intensive: 0.6 },
        Dorper:      { extensive: 3.2, semiIntensive: 1.6, intensive: 0.5 },
        DohneMerino: { extensive: 3.8, semiIntensive: 1.8, intensive: 0.5 },
        Other:       { extensive: 3.5, semiIntensive: 1.8, intensive: 0.6 }
    },
    reproduction: {
        extensive:    { weaningRate: 0.60, preWeaningMortality: 0.15, postWeaningMortality: 0.045 },
        semiIntensive:{ weaningRate: 0.78, preWeaningMortality: 0.10, postWeaningMortality: 0.03  },
        intensive:    { weaningRate: 1.00, preWeaningMortality: 0.065,postWeaningMortality: 0.02  }
    },
    woolProduction: {
        Merino:      { avg: 4.8 },
        DohneMerino: { avg: 4.0 },
        Dorper:      { avg: 0   },
        Other:       { avg: 2.5 }
    },
    meatPrices:  { lamb: 100.08 },
    woolPrices:  { Merino: 104.97, DohneMerino: 92.10, Other: 63.82 },
    variableCosts: {
        extensive:    { feedPasture: 110,  feedConcentrate: 0,    vet: 45,  shearing: 32, transport: 75, waterUtilities: 20  },
        semiIntensive:{ feedPasture: 300,  feedConcentrate: 450,  vet: 90,  shearing: 32, transport: 75, waterUtilities: 55  },
        intensive:    { feedPasture: 900,  feedConcentrate: 1150, vet: 150, shearing: 32, transport: 75, waterUtilities: 140 }
    },
    fixedCostsAnnual: { fencingPerMeter: 150, handlingFacilities: 2500, shearingShed: 3000, waterInfra: 5000 },
    labour:      { minimumWage: 28.79, typicalSkilled: 70 },
    otherRevenue:{ manurePerEwe: 12, hidePerLamb: 25, studPremiumPerEwe: 250, agriTourismAnnual: 15000 },
    carcassWeight:{ lamb: 18 },
    feedlot:     { entryWeight: 25, finishWeight: 42, feedCostPerKgGain: 18, infrastructureCost: 100000 },
    stupidityBaselines: {
        fencing:      { rawMaterialPerMeter: 45,  deliveredPerMeter: 200  },
        feedPellets:  { rawPerTon: 3700,           deliveredPerTon: 6500   },
        lucerneHay:   { rawPerTon: 600,            deliveredPerTon: 1800   },
        vetMeds:      { rawPerDose: 5,             deliveredPerDose: 45    },
        shearing:     { rawPerSheep: 15,           deliveredPerSheep: 32   },
        transport100km:{ rawFuel: 10,              deliveredCost: 35       },
        land:         { rawPerHa: 15000,           deliveredPerHa: 40000   },
        studRam:      { rawCost: 3000,             deliveredCost: 30000    },
        waterInfra:   { rawCost: 8000,             deliveredCost: 80000    }
    }
};

class SheepFarmModel {
    constructor(inputs) {
        this.landHa           = inputs.landHa;
        this.flockSize        = inputs.flockSize;
        this.breed            = inputs.breed;
        this.productionSystem = inputs.productionSystem;
        this.marketChannel    = inputs.marketChannel  || 'auction';
        this.feedSource       = inputs.feedSource     || 'mixed';
        this.studOperation    = inputs.studOperation  || false;
        this.agriTourism      = inputs.agriTourism    || false;
        this.customMeatPrice  = inputs.customMeatPrice || null;
        this.customWoolPrice  = inputs.customWoolPrice || null;
        this.customLabourRate = inputs.customLabourRate|| null;
        this.results          = null;
        this.warnings         = [];
        this.recommendations  = [];
        this.stupidityReport  = null;
    }

    calculate() {
        this._validateInputs();
        const r = this._runCalculations();
        this.results = r;
        this._generateWarnings();
        this._generateRecommendations();
        this.stupidityReport = this._calculateStupidityIndex();
        return this.results;
    }

    getReport() {
        if (!this.results) this.calculate();
        return {
            summary: {
                totalRevenue:   this.results.totalRevenue,
                totalCosts:     this.results.totalCosts,
                netProfit:      this.results.netProfit,
                profitMargin:   this.results.profitMargin,
                breakEvenLambs: this.results.breakEvenLambs,
                status: this.results.netProfit > 0
                    ? (this.results.profitMargin > 15 ? 'PROFITABLE' : 'MARGINAL')
                    : 'LOSS'
            },
            details:        this.results,
            warnings:       this.warnings,
            recommendations:this.recommendations,
            stupidityIndex: this.stupidityReport
        };
    }

    _validateInputs() {
        if (this.landHa <= 0)                          throw new Error('Land area must be > 0 ha');
        if (this.flockSize <= 0)                       throw new Error('Flock size must be > 0 ewes');
        if (!TABLES.carryingCapacity[this.breed])      throw new Error(`Unknown breed: ${this.breed}`);
        if (!TABLES.reproduction[this.productionSystem]) throw new Error(`Unknown system: ${this.productionSystem}`);
    }

    _runCalculations() {
        const ccRate     = TABLES.carryingCapacity[this.breed][this.productionSystem];
        const maxStock   = this.landHa / ccRate;
        const isOverstocked = this.flockSize > maxStock;
        const repro      = TABLES.reproduction[this.productionSystem];
        const lambsWeaned = Math.floor(this.flockSize * repro.weaningRate * (1 - repro.preWeaningMortality));
        const lambsSold  = Math.floor(lambsWeaned * (1 - repro.postWeaningMortality));

        const meatRevenue    = this._calcMeatRevenue(lambsSold);
        const woolRevenue    = this._calcWoolRevenue();
        const otherRevenue   = this._calcOtherRevenue(lambsSold);
        const totalRevenue   = meatRevenue + woolRevenue + otherRevenue;

        const variableCosts  = this._calcVariableCosts();
        const labourCosts    = this._calcLabourCosts();
        const fixedCosts     = this._calcFixedCosts();
        const totalCosts     = variableCosts + labourCosts + fixedCosts;

        const netProfit      = totalRevenue - totalCosts;
        const grossMargin    = totalRevenue - variableCosts;
        const profitMargin   = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
        const profitPerLamb  = (meatRevenue + woolRevenue / Math.max(1, lambsSold)) - (variableCosts / Math.max(1, lambsSold));
        const breakEvenLambs = profitPerLamb > 0 ? Math.ceil(totalCosts / profitPerLamb) : Infinity;

        return {
            landHa: this.landHa, flockSize: this.flockSize,
            breed: this.breed, productionSystem: this.productionSystem,
            carryingCapacityRate: ccRate, maxRecommendedStock: maxStock,
            isOverstocked, stockingDeficit: isOverstocked ? this.flockSize - maxStock : 0,
            lambsWeaned, lambsSold,
            meatRevenue, woolRevenue, otherRevenue, totalRevenue,
            variableCosts, labourCosts, fixedCosts, totalCosts,
            grossMargin, netProfit, profitMargin, breakEvenLambs,
            profitPerEwe:        netProfit     / this.flockSize,
            revenuePerEwe:       totalRevenue  / this.flockSize,
            costPerEwe:          totalCosts    / this.flockSize,
            meatPriceEffective:  meatRevenue   / (lambsSold * TABLES.carcassWeight.lamb),
            woolPriceEffective:  woolRevenue   / (this.flockSize * (TABLES.woolProduction[this.breed]?.avg || 1))
        };
    }

    _calcMeatRevenue(lambsSold) {
        let price = this.customMeatPrice || TABLES.meatPrices.lamb;
        if (this.marketChannel === 'direct')   price *= 1.20;
        if (this.marketChannel === 'abattoir') price *= 1.05;
        return lambsSold * TABLES.carcassWeight.lamb * price;
    }

    _calcWoolRevenue() {
        const prod = TABLES.woolProduction[this.breed];
        if (!prod || prod.avg === 0) return 0;
        const price = this.customWoolPrice || TABLES.woolPrices[this.breed];
        return this.flockSize * prod.avg * price;
    }

    _calcOtherRevenue(lambsSold) {
        let total = this.flockSize * TABLES.otherRevenue.manurePerEwe;
        total += lambsSold * TABLES.otherRevenue.hidePerLamb;
        if (this.studOperation) total += this.flockSize * TABLES.otherRevenue.studPremiumPerEwe;
        if (this.agriTourism)   total += TABLES.otherRevenue.agriTourismAnnual;
        return total;
    }

    _calcVariableCosts() {
        const costs = TABLES.variableCosts[this.productionSystem];
        let feed = costs.feedPasture + costs.feedConcentrate;
        if (this.feedSource === 'homeGrown') feed *= 0.70;
        if (this.feedSource === 'mixed')     feed *= 0.85;
        return (feed + costs.vet + costs.shearing + costs.transport + costs.waterUtilities) * this.flockSize;
    }

    _calcLabourCosts() {
        const rate    = this.customLabourRate || TABLES.labour.typicalSkilled;
        const divisor = this.productionSystem === 'extensive' ? 200 : this.productionSystem === 'semiIntensive' ? 150 : 100;
        const workers = Math.max(1, Math.ceil(this.flockSize / divisor));
        return workers * 8 * 365 * rate;
    }

    _calcFixedCosts() {
        const perimeterM = Math.sqrt(this.landHa) * 4 * 100;
        const fencing    = (perimeterM * TABLES.fixedCostsAnnual.fencingPerMeter) / 10;
        return fencing + TABLES.fixedCostsAnnual.handlingFacilities + TABLES.fixedCostsAnnual.shearingShed + TABLES.fixedCostsAnnual.waterInfra;
    }

    _calculateStupidityIndex() {
        const b = TABLES.stupidityBaselines;
        return [
            { component: 'Fencing (per meter)',               rawCost: b.fencing.rawMaterialPerMeter,  deliveredCost: b.fencing.deliveredPerMeter,       index: b.fencing.deliveredPerMeter / b.fencing.rawMaterialPerMeter,          action: 'DIY install, electric rope, share costs with neighbour.' },
            { component: 'Feed pellets (per ton)',             rawCost: b.feedPellets.rawPerTon,         deliveredCost: b.feedPellets.deliveredPerTon,     index: b.feedPellets.deliveredPerTon / b.feedPellets.rawPerTon,              action: 'Buy in bulk from mill, or grow own maize/lucerne.' },
            { component: 'Lucerne hay (per ton)',              rawCost: b.lucerneHay.rawPerTon,          deliveredCost: b.lucerneHay.deliveredPerTon,      index: b.lucerneHay.deliveredPerTon / b.lucerneHay.rawPerTon,               action: 'Produce on-farm or negotiate direct from grower.' },
            { component: 'Veterinary medicines (per dose)',    rawCost: b.vetMeds.rawPerDose,            deliveredCost: b.vetMeds.deliveredPerDose,        index: b.vetMeds.deliveredPerDose / b.vetMeds.rawPerDose,                   action: 'Join buying cooperative, use generics, implement preventive health.' },
            { component: 'Shearing (per sheep)',               rawCost: b.shearing.rawPerSheep,          deliveredCost: b.shearing.deliveredPerSheep,      index: b.shearing.deliveredPerSheep / b.shearing.rawPerSheep,               action: 'Train own staff or negotiate group rate with shearers.' },
            { component: 'Transport (per 100 km per load)',   rawCost: b.transport100km.rawFuel,        deliveredCost: b.transport100km.deliveredCost,    index: b.transport100km.deliveredCost / b.transport100km.rawFuel,           action: 'Optimise routes, backload goods, cooperative transport.' },
            { component: 'Land (per hectare)',                 rawCost: b.land.rawPerHa,                 deliveredCost: b.land.deliveredPerHa,             index: b.land.deliveredPerHa / b.land.rawPerHa,                             action: 'Lease instead of buy, or buy in less competitive areas.' },
            { component: 'Stud ram (each)',                    rawCost: b.studRam.rawCost,               deliveredCost: b.studRam.deliveredCost,           index: b.studRam.deliveredCost / b.studRam.rawCost,                         action: 'Use AI with elite semen (R500/dose) instead of buying whole ram.' },
            { component: 'Water infrastructure (borehole)',   rawCost: b.waterInfra.rawCost,            deliveredCost: b.waterInfra.deliveredCost,        index: b.waterInfra.deliveredCost / b.waterInfra.rawCost,                   action: 'Share borehole, use solar pumping, or harvest rainwater.' }
        ];
    }

    _generateWarnings() {
        const r = this.results;
        this.warnings = [];
        if (r.isOverstocked)
            this.warnings.push({ type: 'STOCKING', severity: 'HIGH', message: `Overstocked by ${r.stockingDeficit.toFixed(0)} ewes. Max ${r.maxRecommendedStock.toFixed(0)}.` });
        if (this.flockSize < 100 && this.landHa < 50)
            this.warnings.push({ type: 'SCALE', severity: 'MEDIUM', message: 'Small operation (<100 ewes, <50ha). Diversification needed.' });
        if (r.netProfit < 0)
            this.warnings.push({ type: 'PROFIT', severity: 'CRITICAL', message: `Loss of R${Math.abs(r.netProfit).toFixed(0)}/year. Immediate action required.` });
        else if (r.profitMargin < 15)
            this.warnings.push({ type: 'PROFIT', severity: 'HIGH', message: `Margin ${r.profitMargin.toFixed(1)}% below 15% sustainable threshold.` });
    }

    _generateRecommendations() {
        const r = this.results;
        this.recommendations = [];
        if (r.profitMargin < 20 && this.flockSize < 200)
            this.recommendations.push({ category: 'DIVERSIFICATION', items: [`Manure: R${(this.flockSize * 15).toFixed(0)}/yr`, 'Agri-tourism: R15k–50k/yr', 'Direct sales: +15–25% margin'] });
        if (r.isOverstocked)
            this.recommendations.push({ category: 'STOCKING', items: [`Reduce flock to ${Math.floor(r.maxRecommendedStock)} ewes`, `Or expand land by ${((this.flockSize / r.carryingCapacityRate) - this.landHa).toFixed(1)} ha`] });
        if (r.profitMargin > 0 && r.profitMargin < 25)
            this.recommendations.push({ category: 'EFFICIENCY', items: [`Improve weaning by 5% → +R${(r.meatRevenue * 0.05).toFixed(0)}`, `Reduce mortality by 2% → +R${(r.meatRevenue * 0.02).toFixed(0)}`] });
    }
}

module.exports = SheepFarmModel;
