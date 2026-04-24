Sheep Farming Profitability Model for South Africa
===================================================

Files included:
- sheepFarmModel.js    : Core model (classes, tables, formulas, recommendations)
- exampleUsage.js      : Example integration script
- index.html           : Interactive test interface

How to use:
1. Place all files in the same folder.
2. Open index.html in a web browser to test interactively.
3. For integration into your JavaScript application:
   - Copy sheepFarmModel.js into your project.
   - Import or include the SheepFarmModel class.
   - Create an input object and call calculate().

Input object properties (all required unless noted):
{
  landHa: number,           // hectares
  flockSize: number,        // number of ewes
  breed: string,            // "Merino", "Dorper", "DohneMerino", "Other"
  productionSystem: string, // "extensive", "semiIntensive", "intensive"
  marketChannel: string,    // "auction", "abattoir", "direct"
  feedSource: string,       // "purchased", "homeGrown", "mixed"
  studOperation: boolean,   // optional, default false
  agriTourism: boolean,     // optional, default false
  // Optional overrides:
  customMeatPrice: number,  // R/kg
  customWoolPrice: number,  // R/kg
  customLabourRate: number  // R/hour
}

Output:
Call model.getReport() to receive an object with:
- summary: { totalRevenue, totalCosts, netProfit, profitMargin, breakEvenLambs, status }
- details: full breakdown (lambs weaned, revenue streams, costs, etc.)
- warnings: array of { type, message, severity }
- recommendations: array of { category, items }

All formulas, lookup tables, validation rules (R1-R10) are embedded in the model.
Based on South African 2025-2026 market data and industry benchmarks.

For any questions, refer to the code comments.