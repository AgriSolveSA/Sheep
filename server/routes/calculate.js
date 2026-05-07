const express           = require('express');
const { optionalAuth }  = require('../middleware/auth');
const limits            = require('../middleware/rateLimiter');
const SheepFarmModel    = require('../models/sheepFarmModel');
const InefficiencyEngine = require('../models/inefficiencyEngine');
const RecommendationEngine = require('../models/recommendationEngine');

const router = express.Router();

const VALID_BREEDS   = ['Merino', 'Dorper', 'DohneMerino', 'Other'];
const VALID_SYSTEMS  = ['extensive', 'semiIntensive', 'intensive'];
const VALID_CHANNELS = ['auction', 'direct', 'abattoir'];
const VALID_FEED     = ['purchased', 'homeGrown', 'mixed'];

// POST /api/calculate
router.post('/', limits.calculate, optionalAuth, (req, res) => {
    const {
        landHa, flockSize, breed, productionSystem,
        marketChannel, feedSource, studOperation, agriTourism,
        customMeatPrice, customWoolPrice, customLabourRate,
        // optional enrichment
        rainfall_mm, soilType, distanceToNearestTown_km,
        lambMortalityRate, woolMicron, hasSolar, cooperativeMember
    } = req.body;

    // Validate required inputs
    const errors = {};
    if (!landHa || isNaN(landHa) || landHa <= 0)          errors.landHa = 'Must be a positive number.';
    if (!flockSize || isNaN(flockSize) || flockSize <= 0)  errors.flockSize = 'Must be a positive number.';
    if (!breed || !VALID_BREEDS.includes(breed))           errors.breed = `Must be one of: ${VALID_BREEDS.join(', ')}.`;
    if (!productionSystem || !VALID_SYSTEMS.includes(productionSystem)) errors.productionSystem = `Must be one of: ${VALID_SYSTEMS.join(', ')}.`;

    if (Object.keys(errors).length)
        return res.status(400).json({ error: true, code: 'VALIDATION_ERROR', message: 'Invalid inputs.', details: errors });

    const inputs = {
        landHa:            parseFloat(landHa),
        flockSize:         parseInt(flockSize, 10),
        breed,
        productionSystem,
        marketChannel:     VALID_CHANNELS.includes(marketChannel) ? marketChannel : 'auction',
        feedSource:        VALID_FEED.includes(feedSource) ? feedSource : 'mixed',
        studOperation:     !!studOperation,
        agriTourism:       !!agriTourism,
        customMeatPrice:   customMeatPrice  ? parseFloat(customMeatPrice)  : null,
        customWoolPrice:   customWoolPrice  ? parseFloat(customWoolPrice)  : null,
        customLabourRate:  customLabourRate ? parseFloat(customLabourRate) : null,
        // enrichment
        rainfall_mm, soilType, distanceToNearestTown_km,
        lambMortalityRate, woolMicron, hasSolar, cooperativeMember
    };

    const model       = new SheepFarmModel(inputs);
    const farmResults = model.getReport();

    const ineffEngine  = new InefficiencyEngine(inputs, farmResults.details);
    const ineffList    = ineffEngine.runAudit();

    const recEngine    = new RecommendationEngine(inputs, farmResults.details, ineffList);
    const recOutput    = recEngine.generate();

    const savingsEstimate = recOutput.summary.improvementPotential;

    res.json({
        results:          farmResults,
        inefficiencies:   ineffList,
        recommendations:  recOutput,
        savingsEstimate
    });
});

module.exports = router;
