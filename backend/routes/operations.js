const express = require('express');
const router = express.Router();
const Operation = require('../models/Operation');
const Bet = require('../models/Bet');

// GET /api/operations - Get all operations (with bets for each)
router.get('/', async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status
    };
    
    const operations = await Operation.getAll(filters);
    // Attach bets to each operation for frontend
    for (const op of operations) {
      op.bets = await Operation.getBets(op.id);
    }
    res.json(operations);
  } catch (error) {
    console.error('Error fetching operations:', error);
    res.status(500).json({ error: 'Failed to fetch operations' });
  }
});

// GET /api/operations/:id - Get a specific operation with its bets
router.get('/:id', async (req, res) => {
  try {
    const operation = await Operation.getById(req.params.id);
    
    if (!operation) {
      return res.status(404).json({ error: 'Operation not found' });
    }
    
    const bets = await Operation.getBets(req.params.id);
    
    res.json({
      ...operation,
      bets
    });
  } catch (error) {
    console.error('Error fetching operation:', error);
    res.status(500).json({ error: 'Failed to fetch operation' });
  }
});

const ALLOWED_OPERATION_TYPES = ['Aposta Simples', 'Super Odd', 'Aumentada', 'Tentativa de Duplo', 'Free Bet', 'Extração de FreeBet'];

// POST /api/operations - Create a new operation
router.post('/', async (req, res) => {
  try {
    const { type, bets } = req.body;
    
    if (!type || !ALLOWED_OPERATION_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Valid operation type is required (e.g. Aposta Simples, Super Odd, Free Bet)' });
    }
    
    if (!bets || !Array.isArray(bets) || bets.length === 0) {
      return res.status(400).json({ error: 'At least one bet is required' });
    }
    
    // Calculate total exposure
    const totalExposure = bets.reduce((sum, bet) => sum + (parseFloat(bet.stake) || 0), 0);
    
    // Create operation
    const operationData = {
      type,
      total_exposure: totalExposure,
      guaranteed_profit: 0
    };
    
    const operation = await Operation.create(operationData);
    
    // Create associated bets (include bet_type from operation type and date)
    const createdBets = [];
    const today = new Date().toISOString().split('T')[0];
    for (const betData of bets) {
      const bet = await Bet.create({
        ...betData,
        operation_id: operation.id,
        bet_type: betData.bet_type || type,
        date: betData.date || today,
        potential_return: (parseFloat(betData.odds) || 0) * (parseFloat(betData.stake) || 0)
      });
      createdBets.push(bet);
    }
    
    // Recalculate operation totals
    await Operation.recalculateOperation(operation.id);
    
    // Get updated operation with bets
    const updatedOperation = await Operation.getById(operation.id);
    const operationBets = await Operation.getBets(operation.id);
    
    res.status(201).json({
      ...updatedOperation,
      bets: operationBets
    });
  } catch (error) {
    console.error('Error creating operation:', error);
    res.status(500).json({ error: 'Failed to create operation' });
  }
});

// PUT /api/operations/:id - Update an operation
router.put('/:id', async (req, res) => {
  try {
    const operation = await Operation.getById(req.params.id);
    
    if (!operation) {
      return res.status(404).json({ error: 'Operation not found' });
    }
    
    const updatedOperation = await Operation.update(req.params.id, req.body);
    res.json(updatedOperation);
  } catch (error) {
    console.error('Error updating operation:', error);
    res.status(500).json({ error: 'Failed to update operation' });
  }
});

// DELETE /api/operations/:id - Delete an operation
router.delete('/:id', async (req, res) => {
  try {
    const operation = await Operation.getById(req.params.id);
    
    if (!operation) {
      return res.status(404).json({ error: 'Operation not found' });
    }
    
    await Operation.delete(req.params.id);
    res.json({ message: 'Operation deleted successfully' });
  } catch (error) {
    console.error('Error deleting operation:', error);
    res.status(500).json({ error: 'Failed to delete operation' });
  }
});

// POST /api/operations/:id/recalculate - Recalculate operation totals
router.post('/:id/recalculate', async (req, res) => {
  try {
    const result = await Operation.recalculateOperation(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error recalculating operation:', error);
    res.status(500).json({ error: 'Failed to recalculate operation' });
  }
});

// POST /api/operations/:id/add-bet - Add a bet to existing operation
router.post('/:id/add-bet', async (req, res) => {
  try {
    const operation = await Operation.getById(req.params.id);
    
    if (!operation) {
      return res.status(404).json({ error: 'Operation not found' });
    }
    
    // Create bet with operation_id
    const betData = {
      ...req.body,
      operation_id: req.params.id,
      potential_return: req.body.odds * req.body.stake
    };
    
    const bet = await Bet.create(betData);
    
    // Recalculate operation totals
    await Operation.recalculateOperation(req.params.id);
    
    // Get updated operation
    const updatedOperation = await Operation.getById(req.params.id);
    
    res.status(201).json({
      bet,
      operation: updatedOperation
    });
  } catch (error) {
    console.error('Error adding bet to operation:', error);
    res.status(500).json({ error: 'Failed to add bet to operation' });
  }
});

module.exports = router;
