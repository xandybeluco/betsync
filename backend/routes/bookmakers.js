const express = require('express');
const router = express.Router();
const Bookmaker = require('../models/Bookmaker');
const validator = require('validator');

// Validation middleware
const validateBookmaker = (req, res, next) => {
  const { name } = req.body;
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Bookmaker name is required' });
  }
  
  next();
};

// GET /api/bookmakers - Get all bookmakers
router.get('/', async (req, res) => {
  try {
    const bookmakers = await Bookmaker.getAll();
    res.json(bookmakers);
  } catch (error) {
    console.error('Error fetching bookmakers:', error);
    res.status(500).json({ error: 'Failed to fetch bookmakers' });
  }
});

// GET /api/bookmakers/summary - Get balance summary (must be before /:id)
router.get('/summary', async (req, res) => {
  try {
    const summary = await Bookmaker.getBalanceSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error fetching bookmaker summary:', error);
    res.status(500).json({ error: 'Failed to fetch bookmaker summary' });
  }
});

// GET /api/bookmakers/:id - Get a specific bookmaker
router.get('/:id', async (req, res) => {
  try {
    const bookmaker = await Bookmaker.getById(req.params.id);
    
    if (!bookmaker) {
      return res.status(404).json({ error: 'Bookmaker not found' });
    }
    
    res.json(bookmaker);
  } catch (error) {
    console.error('Error fetching bookmaker:', error);
    res.status(500).json({ error: 'Failed to fetch bookmaker' });
  }
});

// POST /api/bookmakers - Create a new bookmaker
router.post('/', validateBookmaker, async (req, res) => {
  try {
    // Check if bookmaker already exists
    const existingBookmaker = await Bookmaker.getByName(req.body.name);
    if (existingBookmaker) {
      return res.status(400).json({ error: 'Bookmaker with this name already exists' });
    }
    
    const bookmaker = await Bookmaker.create(req.body);
    res.status(201).json(bookmaker);
  } catch (error) {
    console.error('Error creating bookmaker:', error);
    res.status(500).json({ error: 'Failed to create bookmaker' });
  }
});

// PUT /api/bookmakers/:id - Update a bookmaker
router.put('/:id', async (req, res) => {
  try {
    const bookmaker = await Bookmaker.getById(req.params.id);
    
    if (!bookmaker) {
      return res.status(404).json({ error: 'Bookmaker not found' });
    }
    
    // If updating name, check for duplicates
    if (req.body.name && req.body.name !== bookmaker.name) {
      const existingBookmaker = await Bookmaker.getByName(req.body.name);
      if (existingBookmaker) {
        return res.status(400).json({ error: 'Bookmaker with this name already exists' });
      }
    }
    
    const updatedBookmaker = await Bookmaker.update(req.params.id, req.body);
    res.json(updatedBookmaker);
  } catch (error) {
    console.error('Error updating bookmaker:', error);
    res.status(500).json({ error: 'Failed to update bookmaker' });
  }
});

// DELETE /api/bookmakers/:id - Delete a bookmaker
router.delete('/:id', async (req, res) => {
  try {
    const bookmaker = await Bookmaker.getById(req.params.id);
    
    if (!bookmaker) {
      return res.status(404).json({ error: 'Bookmaker not found' });
    }
    
    await Bookmaker.delete(req.params.id);
    res.json({ message: 'Bookmaker deleted successfully' });
  } catch (error) {
    console.error('Error deleting bookmaker:', error);
    if (error.message.includes('Cannot delete bookmaker with associated bets')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete bookmaker' });
    }
  }
});

// POST /api/bookmakers/:id/balance - Update bookmaker balance
router.post('/:id/balance', async (req, res) => {
  try {
    const { amount, type } = req.body;
    
    if (!validator.isFloat(amount.toString())) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    if (!['deposit', 'withdrawal', 'adjustment'].includes(type)) {
      return res.status(400).json({ error: 'Valid type (deposit, withdrawal, adjustment) is required' });
    }
    
    const result = await Bookmaker.updateBalance(req.params.id, parseFloat(amount), type);
    res.json(result);
  } catch (error) {
    console.error('Error updating bookmaker balance:', error);
    res.status(500).json({ error: 'Failed to update bookmaker balance' });
  }
});

module.exports = router;
