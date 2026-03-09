const express = require('express');
const router = express.Router();
const Bet = require('../models/Bet');
const Bookmaker = require('../models/Bookmaker');
const db = require('../database/connection');

// GET /api/dashboard/overview - Get dashboard overview statistics
router.get('/overview', async (req, res) => {
  try {
    // Get betting statistics
    const betStats = await Bet.getStatistics();
    
    // Get bookmaker balance summary
    const bookmakerSummary = await Bookmaker.getBalanceSummary();
    
    // Get current bankroll (sum of all bookmaker balances)
    const currentBankroll = bookmakerSummary.total_balance || 0;
    
    // Get initial bankroll from settings
    db.get('SELECT value FROM settings WHERE key = ?', ['initial_bankroll'], (err, row) => {
      if (err) {
        console.error('Error fetching initial bankroll:', err);
        return res.status(500).json({ error: 'Failed to fetch initial bankroll' });
      }
      
      const initialBankroll = parseFloat(row?.value) || 1000;
      
      // Calculate daily profit (last 24 hours)
      const dailyProfitSql = `
        SELECT COALESCE(SUM(profit_loss), 0) as daily_profit
        FROM bets
        WHERE date >= date('now')
        AND status IN ('Won', 'Lost')
      `;
      
      db.get(dailyProfitSql, [], (err, dailyRow) => {
        if (err) {
          console.error('Error fetching daily profit:', err);
          return res.status(500).json({ error: 'Failed to fetch daily profit' });
        }
        
        // Calculate monthly profit (current month)
        const monthlyProfitSql = `
          SELECT COALESCE(SUM(profit_loss), 0) as monthly_profit
          FROM bets
          WHERE date >= date('now', 'start of month')
          AND status IN ('Won', 'Lost')
        `;
        
        db.get(monthlyProfitSql, [], (err, monthlyRow) => {
          if (err) {
            console.error('Error fetching monthly profit:', err);
            return res.status(500).json({ error: 'Failed to fetch monthly profit' });
          }
          
          const totalProfitLoss = betStats.total_profit_loss || 0;
          const roi = currentBankroll > 0 ? (totalProfitLoss / initialBankroll) * 100 : 0;
          
          const overview = {
            current_bankroll: currentBankroll,
            total_profit_loss: totalProfitLoss,
            daily_profit: dailyRow.daily_profit || 0,
            monthly_profit: monthlyRow.monthly_profit || 0,
            roi: roi,
            total_bets: betStats.total_bets || 0,
            won_bets: betStats.won_bets || 0,
            lost_bets: betStats.lost_bets || 0,
            open_bets: betStats.open_bets || 0,
            win_rate: betStats.total_bets > 0 ? (betStats.won_bets / betStats.total_bets) * 100 : 0
          };
          
          res.json(overview);
        });
      });
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
});

// GET /api/dashboard/bankroll-history - Get bankroll evolution data
router.get('/bankroll-history', async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
    const daysParam = `-${days} days`;
    
    const sql = `
      SELECT 
        date,
        SUM(
          CASE 
            WHEN status = 'Won' THEN profit_loss
            WHEN status = 'Lost' THEN profit_loss
            ELSE 0
          END
        ) as daily_profit_loss
      FROM bets
      WHERE date >= date('now', ?)
      GROUP BY date
      ORDER BY date ASC
    `;
    
    db.all(sql, [daysParam], (err, rows) => {
      if (err) {
        console.error('Error fetching bankroll history:', err);
        return res.status(500).json({ error: 'Failed to fetch bankroll history' });
      }
      
      // Get initial bankroll
      db.get('SELECT value FROM settings WHERE key = ?', ['initial_bankroll'], (err, settingRow) => {
        if (err) {
          console.error('Error fetching initial bankroll:', err);
          return res.status(500).json({ error: 'Failed to fetch initial bankroll' });
        }
        
        const initialBankroll = parseFloat(settingRow?.value) || 1000;
        
        // Calculate cumulative bankroll
        let cumulativeBankroll = initialBankroll;
        const bankrollHistory = [];
        
        // Generate all dates in the range
        for (let i = days; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayData = rows.find(row => row.date === dateStr);
          if (dayData) {
            cumulativeBankroll += dayData.daily_profit_loss;
          }
          
          bankrollHistory.push({
            date: dateStr,
            bankroll: cumulativeBankroll,
            daily_profit_loss: dayData?.daily_profit_loss || 0
          });
        }
        
        res.json(bankrollHistory);
      });
    });
  } catch (error) {
    console.error('Error fetching bankroll history:', error);
    res.status(500).json({ error: 'Failed to fetch bankroll history' });
  }
});

// GET /api/dashboard/recent-bets - Get recent bets
router.get('/recent-bets', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    
    const sql = `
      SELECT 
        b.*,
        bo.name as bookmaker_name,
        o.type as operation_type
      FROM bets b
      LEFT JOIN bookmakers bo ON b.bookmaker_id = bo.id
      LEFT JOIN operations o ON b.operation_id = o.id
      ORDER BY b.created_at DESC
      LIMIT ?
    `;
    
    db.all(sql, [limit], (err, rows) => {
      if (err) {
        console.error('Error fetching recent bets:', err);
        return res.status(500).json({ error: 'Failed to fetch recent bets' });
      }
      
      res.json(rows);
    });
  } catch (error) {
    console.error('Error fetching recent bets:', error);
    res.status(500).json({ error: 'Failed to fetch recent bets' });
  }
});

// GET /api/dashboard/performance - Get performance metrics
router.get('/performance', async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 30;
    
    const daysParam = `-${days} days`;
    // Performance by bet type
    const betTypeSql = `SELECT 
        bet_type,
        COUNT(*) as total_bets,
        SUM(stake) as total_staked,
        SUM(profit_loss) as total_profit_loss,
        AVG(CASE WHEN status IN ('Won', 'Lost') THEN profit_loss / stake ELSE NULL END) * 100 as avg_roi
      FROM bets
      WHERE date >= date('now', ?)
      AND status IN ('Won', 'Lost')
      GROUP BY bet_type`;
    
    // Performance by bookmaker
    const bookmakerSql = `SELECT 
        bo.name,
        COUNT(b.id) as total_bets,
        SUM(b.stake) as total_staked,
        SUM(b.profit_loss) as total_profit_loss,
        AVG(CASE WHEN b.status IN ('Won', 'Lost') THEN b.profit_loss / b.stake ELSE NULL END) * 100 as avg_roi
      FROM bets b
      LEFT JOIN bookmakers bo ON b.bookmaker_id = bo.id
      WHERE b.date >= date('now', ?)
      AND b.status IN ('Won', 'Lost')
      GROUP BY bo.id, bo.name
      HAVING COUNT(b.id) > 0
      ORDER BY total_profit_loss DESC`;
    
    db.all(betTypeSql, [daysParam], (err, betTypeRows) => {
      if (err) {
        console.error('Error fetching bet type performance:', err);
        return res.status(500).json({ error: 'Failed to fetch bet type performance' });
      }
      
      db.all(bookmakerSql, [daysParam], (err, bookmakerRows) => {
        if (err) {
          console.error('Error fetching bookmaker performance:', err);
          return res.status(500).json({ error: 'Failed to fetch bookmaker performance' });
        }
        
        res.json({
          by_bet_type: betTypeRows,
          by_bookmaker: bookmakerRows
        });
      });
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

module.exports = router;
