const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

class Bet {
  static create(betData) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const {
        operation_id,
        bookmaker_id,
        date,
        bet_type,
        event,
        market,
        odds,
        stake,
        potential_return,
        back_odds,
        lay_odds,
        exchange_commission = 4.5,
        lay_stake,
        liability,
        status = 'Open'
      } = betData;

      const sql = `
        INSERT INTO bets (
          id, operation_id, bookmaker_id, date, bet_type, event, market, odds, 
          stake, potential_return, back_odds, lay_odds, exchange_commission, 
          lay_stake, liability, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(sql, [
        id, operation_id, bookmaker_id, date, bet_type, event, market, odds,
        stake, potential_return, back_odds, lay_odds, exchange_commission,
        lay_stake, liability, status
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...betData });
        }
      });
    });
  }

  static getAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT b.*, bo.name as bookmaker_name, o.type as operation_type
        FROM bets b
        LEFT JOIN bookmakers bo ON b.bookmaker_id = bo.id
        LEFT JOIN operations o ON b.operation_id = o.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.date_from) {
        sql += ' AND b.date >= ?';
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        sql += ' AND b.date <= ?';
        params.push(filters.date_to);
      }

      if (filters.bookmaker_id) {
        sql += ' AND b.bookmaker_id = ?';
        params.push(filters.bookmaker_id);
      }

      if (filters.status) {
        sql += ' AND b.status = ?';
        params.push(filters.status);
      }

      if (filters.operation_id) {
        sql += ' AND b.operation_id = ?';
        params.push(filters.operation_id);
      }

      sql += ' ORDER BY b.date DESC, b.created_at DESC';

      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(filters.limit);
      }

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
        SELECT b.*, bo.name as bookmaker_name, o.type as operation_type
        FROM bets b
        LEFT JOIN bookmakers bo ON b.bookmaker_id = bo.id
        LEFT JOIN operations o ON b.operation_id = o.id
        WHERE b.id = ?
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

  static update(id, updateData) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);
      
      if (fields.length === 0) {
        reject(new Error('No fields to update'));
        return;
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const sql = `UPDATE bets SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      db.run(sql, [...values, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM bets WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  static getStatistics() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_bets,
          COUNT(CASE WHEN status = 'Won' THEN 1 ELSE NULL END) as won_bets,
          COUNT(CASE WHEN status = 'Lost' THEN 1 ELSE NULL END) as lost_bets,
          COUNT(CASE WHEN status = 'Open' THEN 1 ELSE NULL END) as open_bets,
          SUM(CASE WHEN status IN ('Won', 'Lost') THEN profit_loss ELSE 0 END) as total_profit_loss,
          SUM(stake) as total_staked,
          AVG(CASE WHEN status IN ('Won', 'Lost') THEN profit_loss / stake ELSE NULL END) as avg_roi,
          SUM(CASE WHEN status = 'Won' THEN profit_loss ELSE 0 END) as total_winnings,
          SUM(CASE WHEN status = 'Lost' THEN profit_loss ELSE 0 END) as total_losses
        FROM bets
      `;

      db.get(sql, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static getDailyStats(days = 30) {
    return new Promise((resolve, reject) => {
      const daysParam = `-${Math.min(Math.max(parseInt(days, 10) || 30, 1), 365)} days`;
      const sql = `
        SELECT 
          date,
          COUNT(*) as bets_count,
          SUM(stake) as total_staked,
          SUM(profit_loss) as daily_profit_loss,
          SUM(CASE WHEN status = 'Won' THEN profit_loss ELSE 0 END) as winnings,
          SUM(CASE WHEN status = 'Lost' THEN profit_loss ELSE 0 END) as losses
        FROM bets
        WHERE date >= date('now', ?)
        GROUP BY date
        ORDER BY date DESC
      `;

      db.all(sql, [daysParam], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = Bet;
