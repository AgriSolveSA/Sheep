class InefficiencyEngine {
    constructor(farmInputs, farmResults) {
        this.inputs        = farmInputs;
        this.results       = farmResults;
        this.inefficiencies= [];
    }

    runAudit() {
        this._assessWaterInfrastructure();
        this._assessVeterinaryCosts();
        this._assessFencingCosts();
        this._assessTransportCosts();
        this._assessFeedCosts();
        this._assessMarketAccess();
        return this.inefficiencies;
    }

    _assessWaterInfrastructure() {
        if (this.inputs.productionSystem !== 'intensive') {
            this.inefficiencies.push({
                component:             'Water Infrastructure',
                severity:              'HIGH',
                currentCostEstimate:   80000,
                optimizedCostEstimate: 25000,
                stupidityIndex:        10.0,
                action: 'Install solar-powered pumping (R20k–R80k, 5–10kW + DC pump). For >600mm rainfall: 10,000L rainwater harvesting (R8k–R15k). Combined approach reduces water costs 60–70%.'
            });
        }
    }

    _assessVeterinaryCosts() {
        this.inefficiencies.push({
            component:             'Veterinary Medicines',
            severity:              'CRITICAL',
            currentCostEstimate:   45,
            optimizedCostEstimate: 15,
            stupidityIndex:        9.0,
            action: 'Form or join buying cooperative — purchase generics from Pharmed/ANB Vet. Implement preventive health protocol. Potential 70% cost reduction.'
        });
    }

    _assessFencingCosts() {
        if (this.inputs.landHa > 0) {
            this.inefficiencies.push({
                component:             'Fencing',
                severity:              'HIGH',
                currentCostEstimate:   200,
                optimizedCostEstimate: 130,
                stupidityIndex:        4.4,
                action: 'Temporary electric fencing (polywire/polytape) with lightweight posts for rotational grazing. DIY installation saves 35%. Stone packing at base for predator deterrence.'
            });
        }
    }

    _assessTransportCosts() {
        if (this.inputs.marketChannel !== 'direct') {
            this.inefficiencies.push({
                component:             'Transport & Logistics',
                severity:              'MEDIUM',
                currentCostEstimate:   35,
                optimizedCostEstimate: 26,
                stupidityIndex:        3.5,
                action: 'Join or form livestock transport cooperative. Coordinate multi-drop trips to abattoirs. Shared bulk transport reduces cost per farm 15–25%.'
            });
        }
    }

    _assessFeedCosts() {
        const feedFraction = this.results.variableCosts > 0
            ? (this.results.variableCosts * 0.7) / this.results.variableCosts
            : 0;
        if (this.inputs.feedSource === 'purchased' && feedFraction > 0.6) {
            this.inefficiencies.push({
                component:             'Animal Feed',
                severity:              'HIGH',
                currentCostEstimate:   6500,
                optimizedCostEstimate: 3700,
                stupidityIndex:        1.76,
                action: 'Grow own forage (lucerne, sorghum, cowpeas). Use maize/soybean crop residues as winter feed. Buy bulk in summer (15–25% cheaper). 40–50% feed cost reduction possible.'
            });
        }
    }

    _assessMarketAccess() {
        if (this.inputs.marketChannel === 'auction') {
            this.inefficiencies.push({
                component:             'Market Access',
                severity:              'MEDIUM',
                currentCostEstimate:   100,
                optimizedCostEstimate: 125,
                stupidityIndex:        null,
                action: 'Direct-to-consumer: freezer lamb, farmers markets, CSA subscriptions, online pre-orders. Capture 20–30% additional margin by cutting middlemen.'
            });
        }
    }
}

module.exports = InefficiencyEngine;
