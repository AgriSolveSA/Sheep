// Example: Using the SheepFarmModel

// 1. Create input object
const farmInputs = {
  landHa: 120,                  // hectares
  flockSize: 180,              // number of ewes
  breed: "Merino",             // Merino, Dorper, DohneMerino, Other
  productionSystem: "semiIntensive", // extensive, semiIntensive, intensive
  marketChannel: "direct",     // auction, abattoir, direct
  feedSource: "mixed",         // purchased, homeGrown, mixed
  studOperation: false,
  agriTourism: true,
  // Optional overrides:
  // customMeatPrice: 110,
  // customWoolPrice: 180,
  // customLabourRate: 65
};

// 2. Create model instance and calculate
const model = new SheepFarmModel(farmInputs);
const results = model.calculate();

// 3. Get full report object
const report = model.getReport();
console.log("Net Profit:", report.summary.netProfit);
console.log("Status:", report.summary.status);

// 4. Print formatted report to console
model.printConsoleReport();

// 5. Access detailed metrics
console.log("\nDetailed metrics:");
console.log(`Lambs weaned: ${results.lambsWeaned}`);
console.log(`Meat revenue: R${results.meatRevenue.toFixed(0)}`);
console.log(`Wool revenue: R${results.woolRevenue.toFixed(0)}`);
console.log(`Profit per ewe: R${results.profitPerEwe.toFixed(0)}`);

// 6. Integration example: React component or API endpoint
// You can stringify the report and send as JSON:
// res.json(report);