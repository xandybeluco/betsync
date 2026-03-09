const express = require('express');
const router = express.Router();
const validator = require('validator');

// POST /api/calculators/arbitrage - Calculate arbitrage opportunities
router.post('/arbitrage', (req, res) => {
  try {
    const { odds, totalStake = 100 } = req.body;
    
    if (!odds || !Array.isArray(odds) || odds.length < 2) {
      return res.status(400).json({ error: 'At least 2 odds are required' });
    }
    
    // Validate odds
    const validOdds = odds.filter(o => o && o.odds > 0);
    if (validOdds.length !== odds.length) {
      return res.status(400).json({ error: 'All odds must be greater than 0' });
    }
    
    // Calculate implied probabilities
    const impliedProbabilities = validOdds.map(o => ({
      ...o,
      impliedProbability: 1 / o.odds
    }));
    
    // Calculate total implied probability
    const totalImpliedProbability = impliedProbabilities.reduce((sum, o) => sum + o.impliedProbability, 0);
    
    // Calculate arbitrage percentage
    const arbitragePercentage = ((1 / totalImpliedProbability - 1) * 100);
    
    // Calculate stake distribution
    const stakeDistribution = impliedProbabilities.map(o => ({
      ...o,
      stakePercentage: (o.impliedProbability / totalImpliedProbability) * 100,
      stakeAmount: (o.impliedProbability / totalImpliedProbability) * totalStake,
      potentialReturn: (o.impliedProbability / totalImpliedProbability) * totalStake * o.odds
    }));
    
    // Calculate guaranteed profit
    const guaranteedProfit = stakeDistribution[0].potentialReturn - totalStake;
    const roi = totalStake > 0 ? (guaranteedProfit / totalStake) * 100 : 0;
    
    res.json({
      isArbitrage: totalImpliedProbability < 1,
      totalImpliedProbability: (totalImpliedProbability * 100).toFixed(2),
      arbitragePercentage: arbitragePercentage.toFixed(2),
      guaranteedProfit: guaranteedProfit.toFixed(2),
      roi: roi.toFixed(2),
      totalStake,
      stakeDistribution: stakeDistribution.map(o => ({
        ...o,
        stakePercentage: o.stakePercentage.toFixed(2),
        stakeAmount: o.stakeAmount.toFixed(2),
        potentialReturn: o.potentialReturn.toFixed(2),
        impliedProbability: (o.impliedProbability * 100).toFixed(2)
      }))
    });
  } catch (error) {
    console.error('Error calculating arbitrage:', error);
    res.status(500).json({ error: 'Failed to calculate arbitrage' });
  }
});

// POST /api/calculators/exchange - Calculate exchange betting
router.post('/exchange', (req, res) => {
  try {
    const { backOdds, layOdds, stake, commission = 4.5 } = req.body;
    
    if (!backOdds || backOdds <= 0 || !validator.isFloat(backOdds.toString())) {
      return res.status(400).json({ error: 'Valid back odds are required' });
    }
    
    if (!layOdds || layOdds <= 0 || !validator.isFloat(layOdds.toString())) {
      return res.status(400).json({ error: 'Valid lay odds are required' });
    }
    
    if (!stake || stake <= 0 || !validator.isFloat(stake.toString())) {
      return res.status(400).json({ error: 'Valid stake is required' });
    }
    
    if (!commission || commission < 0 || commission > 100) {
      return res.status(400).json({ error: 'Valid commission percentage (0-100) is required' });
    }
    
    // Calculate lay stake for equal profit/loss
    const layStake = (backOdds * stake) / (layOdds - (layOdds - 1) * (commission / 100));
    
    // Calculate liability
    const liability = layStake * (layOdds - 1);
    
    // Calculate profit if back bet wins
    const backWinProfit = (stake * (backOdds - 1)) - (layStake * (commission / 100));
    
    // Calculate profit if lay bet wins (back bet loses)
    const layWinProfit = layStake - stake;
    
    // Check if this is an arbitrage opportunity
    const isArbitrage = backWinProfit > 0 && layWinProfit > 0;
    const guaranteedProfit = isArbitrage ? Math.min(backWinProfit, layWinProfit) : 0;
    
    res.json({
      backOdds,
      layOdds,
      stake,
      commission,
      layStake: layStake.toFixed(2),
      liability: liability.toFixed(2),
      backWinProfit: backWinProfit.toFixed(2),
      layWinProfit: layWinProfit.toFixed(2),
      isArbitrage,
      guaranteedProfit: guaranteedProfit.toFixed(2),
      totalExposure: (parseFloat(stake) + parseFloat(liability)).toFixed(2)
    });
  } catch (error) {
    console.error('Error calculating exchange:', error);
    res.status(500).json({ error: 'Failed to calculate exchange' });
  }
});

// POST /api/calculators/odds-boost - Calculate odds boost with protection
router.post('/odds-boost', (req, res) => {
  try {
    const { boostedOdds, normalOdds, stake, protectionBets = [], boostPercentage } = req.body;
    
    if (!boostedOdds || boostedOdds <= 0) {
      return res.status(400).json({ error: 'Valid boosted odds are required' });
    }
    
    if (!normalOdds || normalOdds <= 0) {
      return res.status(400).json({ error: 'Valid normal odds are required' });
    }
    
    if (!stake || stake <= 0) {
      return res.status(400).json({ error: 'Valid stake is required' });
    }
    
    // Calculate boosted bet return
    const boostedReturn = stake * boostedOdds;
    const normalReturn = stake * normalOdds;
    const boostValue = boostedReturn - normalReturn;
    
    // Calculate total protection cost
    const totalProtectionCost = protectionBets.reduce((sum, bet) => sum + (bet.stake || 0), 0);
    
    // Calculate guaranteed profit
    const guaranteedProfit = boostValue - totalProtectionCost;
    
    // Calculate ROI
    const totalExposure = stake + totalProtectionCost;
    const roi = totalExposure > 0 ? (guaranteedProfit / totalExposure) * 100 : 0;
    
    // Calculate optimal protection stake distribution
    const optimalStake = boostValue / 2; // Simple strategy: use half the boost value for protection
    
    res.json({
      boostedOdds,
      normalOdds,
      stake,
      boostPercentage: boostPercentage || ((boostedOdds / normalOdds - 1) * 100).toFixed(2),
      boostedReturn: boostedReturn.toFixed(2),
      normalReturn: normalReturn.toFixed(2),
      boostValue: boostValue.toFixed(2),
      totalProtectionCost: totalProtectionCost.toFixed(2),
      guaranteedProfit: guaranteedProfit.toFixed(2),
      totalExposure: totalExposure.toFixed(2),
      roi: roi.toFixed(2),
      isProfitable: guaranteedProfit > 0,
      optimalProtectionStake: optimalStake.toFixed(2),
      protectionBets: protectionBets.map(bet => ({
        ...bet,
        potentialReturn: (bet.stake * bet.odds).toFixed(2)
      }))
    });
  } catch (error) {
    console.error('Error calculating odds boost:', error);
    res.status(500).json({ error: 'Failed to calculate odds boost' });
  }
});

// POST /api/calculators/dutching - Calculate Dutch betting (multiple outcomes)
router.post('/dutching', (req, res) => {
  try {
    const { outcomes, totalStake = 100 } = req.body;
    
    if (!outcomes || !Array.isArray(outcomes) || outcomes.length < 2) {
      return res.status(400).json({ error: 'At least 2 outcomes are required' });
    }
    
    // Validate outcomes
    for (const outcome of outcomes) {
      if (!outcome.odds || outcome.odds <= 0) {
        return res.status(400).json({ error: 'All outcomes must have valid odds greater than 0' });
      }
    }
    
    // Calculate implied probabilities
    const impliedProbabilities = outcomes.map(outcome => ({
      ...outcome,
      impliedProbability: 1 / outcome.odds
    }));
    
    // Calculate total implied probability
    const totalImpliedProbability = impliedProbabilities.reduce((sum, o) => sum + o.impliedProbability, 0);
    
    // Calculate stake distribution
    const stakeDistribution = impliedProbabilities.map(outcome => ({
      ...outcome,
      impliedProbability: (outcome.impliedProbability * 100).toFixed(2),
      stakePercentage: ((outcome.impliedProbability / totalImpliedProbability) * 100).toFixed(2),
      stakeAmount: ((outcome.impliedProbability / totalImpliedProbability) * totalStake).toFixed(2),
      potentialReturn: ((outcome.impliedProbability / totalImpliedProbability) * totalStake * outcome.odds).toFixed(2)
    }));
    
    // Calculate if this is profitable
    const potentialReturn = parseFloat(stakeDistribution[0].potentialReturn);
    const profit = potentialReturn - totalStake;
    const roi = totalStake > 0 ? (profit / totalStake) * 100 : 0;
    
    res.json({
      totalImpliedProbability: (totalImpliedProbability * 100).toFixed(2),
      totalStake,
      potentialReturn: potentialReturn.toFixed(2),
      profit: profit.toFixed(2),
      roi: roi.toFixed(2),
      isProfitable: profit > 0,
      stakeDistribution
    });
  } catch (error) {
    console.error('Error calculating Dutch betting:', error);
    res.status(500).json({ error: 'Failed to calculate Dutch betting' });
  }
});

// GET /api/calculators/kelly - Calculate Kelly criterion
router.get('/kelly', (req, res) => {
  try {
    const { odds, probability, bankroll, kellyFraction = 0.25 } = req.query;
    
    if (!odds || odds <= 0) {
      return res.status(400).json({ error: 'Valid odds are required' });
    }
    
    if (!probability || probability <= 0 || probability > 1) {
      return res.status(400).json({ error: 'Valid probability (0-1) is required' });
    }
    
    if (!bankroll || bankroll <= 0) {
      return res.status(400).json({ error: 'Valid bankroll is required' });
    }
    
    // Calculate Kelly criterion
    const b = parseFloat(odds) - 1; // Decimal odds minus 1
    const p = parseFloat(probability);
    const q = 1 - p;
    
    const kellyPercentage = ((b * p - q) / b) * 100;
    const fractionalkellyPercentage = kellyPercentage * parseFloat(kellyFraction);
    const recommendedStake = (fractionalkellyPercentage / 100) * parseFloat(bankroll);
    
    res.json({
      odds: parseFloat(odds),
      probability: p,
      bankroll: parseFloat(bankroll),
      kellyFraction: parseFloat(kellyFraction),
      kellyPercentage: kellyPercentage.toFixed(2),
      fractionalkellyPercentage: fractionalkellyPercentage.toFixed(2),
      recommendedStake: recommendedStake.toFixed(2),
      expectedValue: (b * p - q).toFixed(2)
    });
  } catch (error) {
    console.error('Error calculating Kelly criterion:', error);
    res.status(500).json({ error: 'Failed to calculate Kelly criterion' });
  }
});

module.exports = router;
