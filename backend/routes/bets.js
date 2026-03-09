const express = require('express');
const router = express.Router();
const Bet = require('../models/Bet');
const Bookmaker = require('../models/Bookmaker');
const validator = require('validator');

const ALLOWED_BET_TYPES = ['Aposta Simples', 'Super Odd', 'Aumentada', 'Tentativa de Duplo', 'Free Bet', 'Extração de FreeBet'];

// Validation middleware
const validateBet = (req, res, next) => {
  const { date, event, market, odds, stake, bookmaker_id, bet_type } = req.body;
  
  const errors = [];
  
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date).trim())) {
    errors.push('Valid date is required (YYYY-MM-DD)');
  }
  
  if (!event || (typeof event === 'string' && event.trim().length === 0)) {
    errors.push('Event is required');
  }
  
  if (!market || (typeof market === 'string' && market.trim().length === 0)) {
    errors.push('Market is required');
  }
  
  if (odds === undefined || odds === null || parseFloat(odds) <= 0) {
    errors.push('Valid odds greater than 0 are required');
  }
  
  if (stake === undefined || stake === null || parseFloat(stake) < 0) {
    errors.push('Valid stake greater or equal to 0 is required');
  }
  
  if (!bookmaker_id || !validator.isInt(String(bookmaker_id))) {
    errors.push('Valid bookmaker is required');
  }
  
  if (bet_type && !ALLOWED_BET_TYPES.includes(bet_type)) {
    errors.push('Invalid bet type');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  req.body.bet_type = bet_type && ALLOWED_BET_TYPES.includes(bet_type) ? bet_type : 'Aposta Simples';
  next();
};

// GET /api/bets/statistics - Get betting statistics (must be before /:id)
router.get('/statistics', async (req, res) => {
  try {
    const stats = await Bet.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/bets/daily-stats - Get daily statistics (must be before /:id)
router.get('/daily-stats', async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 30;
    const stats = await Bet.getDailyStats(days);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({ error: 'Failed to fetch daily stats' });
  }
});

// GET /api/bets - Get all bets with optional filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      bookmaker_id: req.query.bookmaker_id ? parseInt(req.query.bookmaker_id) : undefined,
      status: req.query.status,
      operation_id: req.query.operation_id,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };
    
    const bets = await Bet.getAll(filters);
    res.json(bets);
  } catch (error) {
    console.error('Error fetching bets:', error);
    res.status(500).json({ error: 'Failed to fetch bets' });
  }
});

// GET /api/bets/:id - Get a specific bet
router.get('/:id', async (req, res) => {
  try {
    const bet = await Bet.getById(req.params.id);
    
    if (!bet) {
      return res.status(404).json({ error: 'Bet not found' });
    }
    
    res.json(bet);
  } catch (error) {
    console.error('Error fetching bet:', error);
    res.status(500).json({ error: 'Failed to fetch bet' });
  }
});

// POST /api/bets - Create a new bet
router.post('/', validateBet, async (req, res) => {
  try {
    // Verify bookmaker exists
    const bookmaker = await Bookmaker.getById(req.body.bookmaker_id);
    if (!bookmaker) {
      return res.status(400).json({ error: 'Bookmaker not found' });
    }
    
    // Calculate potential return
    const potential_return = req.body.odds * req.body.stake;
    
    const betData = {
      ...req.body,
      potential_return,
      bet_type: req.body.bet_type || 'Aposta Simples',
      date: req.body.date
    };
    
    const bet = await Bet.create(betData);
    
    // Update bookmaker balance (subtract stake)
    await Bookmaker.updateBalance(req.body.bookmaker_id, -req.body.stake, 'adjustment');
    
    res.status(201).json(bet);
  } catch (error) {
    console.error('Error creating bet:', error);
    res.status(500).json({ error: 'Failed to create bet' });
  }
});

// PUT /api/bets/:id - Update a bet
router.put('/:id', async (req, res) => {
  try {
    const bet = await Bet.getById(req.params.id);
    if (!bet) {
      return res.status(404).json({ error: 'Bet not found' });
    }
    
    // If status is being updated to Won or Lost, calculate profit/loss
    if (req.body.status && (req.body.status === 'Won' || req.body.status === 'Lost')) {
      let profit_loss = 0;
      
      if (req.body.status === 'Won') {
        profit_loss = bet.potential_return - bet.stake;
      } else if (req.body.status === 'Lost') {
        profit_loss = -bet.stake;
      }
      
      req.body.profit_loss = profit_loss;
      
      // Update bookmaker balance
      await Bookmaker.updateBalance(bet.bookmaker_id, profit_loss, profit_loss > 0 ? 'profit' : 'loss');
    }
    
    await Bet.update(req.params.id, req.body);
    const updatedBet = await Bet.getById(req.params.id);
    res.json(updatedBet);
  } catch (error) {
    console.error('Error updating bet:', error);
    res.status(500).json({ error: 'Failed to update bet' });
  }
});

// DELETE /api/bets/:id - Delete a bet
router.delete('/:id', async (req, res) => {
  try {
    const bet = await Bet.getById(req.params.id);
    if (!bet) {
      return res.status(404).json({ error: 'Bet not found' });
    }
    
    // If bet was open, refund stake to bookmaker
    if (bet.status === 'Open') {
      await Bookmaker.updateBalance(bet.bookmaker_id, bet.stake, 'adjustment');
    }
    
    await Bet.delete(req.params.id);
    res.json({ message: 'Bet deleted successfully' });
  } catch (error) {
    console.error('Error deleting bet:', error);
    res.status(500).json({ error: 'Failed to delete bet' });
  }
});

module.exports = router;
