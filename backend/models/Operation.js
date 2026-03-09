const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

class Operation {
  static create(operationData) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const { type, total_exposure = 0, guaranteed_profit = 0, status = 'Open' } = operationData;

      const sql = `
        INSERT INTO operations (id, type, total_exposure, guaranteed_profit, status)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.run(sql, [id, type, total_exposure, guaranteed_profit, status], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...operationData });
        }
      });
    });
  }

  static getAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          o.*,
          COUNT(b.id) as number_of_bets,
          SUM(b.stake) as total_stake,
          SUM(b.profit_loss) as actual_profit_loss
        FROM operations o
        LEFT JOIN bets b ON o.id = b.operation_id
        WHERE 1=1
      `;
      const params = [];

      if (filters.type) {
        sql += ' AND o.type = ?';
        params.push(filters.type);
      }

      if (filters.status) {
        sql += ' AND o.status = ?';
        params.push(filters.status);
      }

      sql += ' GROUP BY o.id ORDER BY o.created_at DESC';

      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          o.*,
          COUNT(b.id) as number_of_bets,
          SUM(b.stake) as total_stake,
          SUM(b.profit_loss) as actual_profit_loss
        FROM operations o
        LEFT JOIN bets b ON o.id = b.operation_id
        WHERE o.id = ?
        GROUP BY o.id
      `;

      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static getBets(operationId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT b.*, bo.name as bookmaker_name
        FROM bets b
        LEFT JOIN bookmakers bo ON b.bookmaker_id = bo.id
        WHERE b.operation_id = ?
        ORDER BY b.created_at ASC
      `;

      db.all(sql, [operationId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static update(id, updateData) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);
      
      if (fields.length === 0) {
        reject(new Error('No fields to update'));
        return;
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const sql = `UPDATE operations SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      db.run(sql, [...values, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  static recalculateOperation(operationId) {
    return new Promise((resolve, reject) => {
      // First get all bets for this operation
      const sql = `
        SELECT * FROM bets WHERE operation_id = ?
      `;

      db.all(sql, [operationId], (err, bets) => {
        if (err) {
          reject(err);
          return;
        }

        if (bets.length === 0) {
          resolve({ total_exposure: 0, guaranteed_profit: 0 });
          return;
        }

        // Calculate total exposure and guaranteed profit
        const totalExposure = bets.reduce((sum, bet) => sum + bet.stake, 0);
        
        // For guaranteed profit, we need to consider different bet types
        let guaranteedProfit = 0;
        
        if (bets[0].bet_type === 'Surebet') {
          // For surebets, calculate guaranteed profit based on odds
          const outcomes = {};
          bets.forEach(bet => {
            const key = `${bet.event}_${bet.market}`;
            if (!outcomes[key]) {
              outcomes[key] = [];
            }
            outcomes[key].push(bet);
          });

          Object.values(outcomes).forEach(outcomeBets => {
            const totalStake = outcomeBets.reduce((sum, bet) => sum + bet.stake, 0);
            const maxReturn = Math.max(...outcomeBets.map(bet => bet.stake * bet.odds));
            guaranteedProfit += maxReturn - totalStake;
          });
        } else if (bets[0].bet_type === 'Odds Boost') {
          // For odds boost, calculate based on boosted odds vs protection bets
          const boostedBet = bets.find(bet => bet.odds > 2); // Assuming boosted odds are higher
          const protectionBets = bets.filter(bet => bet !== boostedBet);
          
          if (boostedBet && protectionBets.length > 0) {
            const boostedReturn = boostedBet.stake * boostedBet.odds;
            const protectionCost = protectionBets.reduce((sum, bet) => sum + bet.stake, 0);
            guaranteedProfit = boostedReturn - (boostedBet.stake + protectionCost);
          }
        }

        // Update the operation with calculated values
        const updateSql = `
          UPDATE operations 
          SET total_exposure = ?, guaranteed_profit = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

        db.run(updateSql, [totalExposure, guaranteedProfit, operationId], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ total_exposure: totalExposure, guaranteed_profit: guaranteedProfit });
          }
        });
      });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      // First update all bets to remove operation reference
      db.run('UPDATE bets SET operation_id = NULL WHERE operation_id = ?', [id], (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Then delete the operation
        db.run('DELETE FROM operations WHERE id = ?', [id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, changes: this.changes });
          }
        });
      });
    });
  }
}

module.exports = Operation;
