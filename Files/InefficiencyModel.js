/**
 * INEFFICIENCY ENGINE MODULE
 * Confidential - For integration into SheepFarmModel
 */
class InefficiencyEngine {
    constructor(farmInputs, farmResults) {
        this.inputs = farmInputs;   // landHa, flockSize, productionSystem, etc.
        this.results = farmResults; // from core model
        this.inefficiencies = [];
    }

    /**
     * Runs the full inefficiency audit and returns actionable recommendations
     * @returns {Array} List of inefficiency objects with severity, impact, and trade-secret solutions
     */
    runAudit() {
        this._assessWaterInfrastructure();
        this._assessVeterinaryCosts();
        this._assessFencingCosts();
        this._assessTransportCosts();
        this._assessFeedCosts();
        this._assessMarketAccess();
        return this.inefficiencies;
    }

    // ---------------------- Private Assessment Methods ----------------------

    _assessWaterInfrastructure() {
        // Trigger if production system is extensive/semi-intensive and no mention of solar/rainwater
        if (this.inputs.productionSystem !== 'intensive') {
            this.inefficiencies.push({
                component: "Water Infrastructure",
                severity: "HIGH",
                currentCostEstimate: 80000,
                optimizedCostEstimate: 25000,
                stupidityIndex: 10.0,
                action: "🔒 TRADE SECRET: Install solar-powered pumping system (R20k–R80k) with 5-10kW panels and DC pump. For regions with >600mm annual rainfall, implement rainwater harvesting with 10,000L JoJo tanks (R8k–R15k). Combined approach reduces water costs by 60–70%."
            });
        }
    }

    _assessVeterinaryCosts() {
        // Always assess - high SI universal issue
        this.inefficiencies.push({
            component: "Veterinary Medicines",
            severity: "CRITICAL",
            currentCostEstimate: 45, // per dose
            optimizedCostEstimate: 15,
            stupidityIndex: 9.0,
            action: "🔒 TRADE SECRET: Form or join a buying cooperative to purchase generic animal health products from wholesalers (Pharmed, ANB Vet). Switch to generic equivalents where available. Implement preventive health protocol to reduce frequency. Potential 70% cost reduction."
        });
    }

    _assessFencingCosts() {
        // Trigger for all farms with perimeter fencing needs
        if (this.inputs.landHa > 0) {
            this.inefficiencies.push({
                component: "Fencing",
                severity: "HIGH",
                currentCostEstimate: 200, // per meter
                optimizedCostEstimate: 130,
                stupidityIndex: 4.4,
                action: "🔒 TRADE SECRET: Use temporary electric fencing (polywire/polytape) with lightweight posts for rotational grazing. DIY installation reduces costs by 35%. Combine with stone packing at base for predator deterrence. Maintenance savings of 40% over decade."
            });
        }
    }

    _assessTransportCosts() {
        // Trigger if marketChannel is not 'direct' (implies external transport)
        if (this.inputs.marketChannel !== 'direct') {
            this.inefficiencies.push({
                component: "Transport & Logistics",
                severity: "MEDIUM",
                currentCostEstimate: 35, // per 100km per load
                optimizedCostEstimate: 26,
                stupidityIndex: 3.5,
                action: "🔒 TRADE SECRET: Join or form a livestock transport cooperative. Use professional logistics providers with route optimization software. Coordinate multi-drop trips to abattoirs. Shared bulk transport reduces cost per farm by 15–25%."
            });
        }
    }

    _assessFeedCosts() {
        const feedCost = this.results.variableCosts * 0.7; // approximate feed proportion
        if (this.inputs.feedSource === 'purchased' && feedCost / this.results.variableCosts > 0.6) {
            this.inefficiencies.push({
                component: "Animal Feed",
                severity: "HIGH",
                currentCostEstimate: 6500, // per ton pellets
                optimizedCostEstimate: 3700,
                stupidityIndex: 1.76,
                action: "🔒 TRADE SECRET: Transition to home-grown forage (lucerne, sorghum, cowpeas). Utilize maize/soybean crop residues as winter feed. Buy bulk during summer months (prices 15–25% lower). Potential 40–50% reduction in purchased feed costs."
            });
        }
    }

    _assessMarketAccess() {
        // Trigger if marketChannel is 'auction' (lowest margin)
        if (this.inputs.marketChannel === 'auction') {
            this.inefficiencies.push({
                component: "Market Access",
                severity: "MEDIUM",
                currentCostEstimate: 100, // baseline price index
                optimizedCostEstimate: 125,
                stupidityIndex: null,
                action: "🔒 TRADE SECRET: Implement direct-to-consumer channels: freezer lamb sales, farmers' markets, CSA subscriptions, and online pre-orders. Capture 20–30% additional margin by eliminating middlemen. Build brand around quality and transparency."
            });
        }
    }
}