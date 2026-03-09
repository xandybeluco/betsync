const db = require('../database/connection');

class Bookmaker {
  static create(bookmakerData) {
    return new Promise((resolve, reject) => {
      const { name, current_balance = 0, total_deposits = 0, total_withdrawals = 0, profit_generated = 0 } = bookmakerData;

      const sql = `
        INSERT INTO bookmakers (name, current_balance, total_deposits, total_withdrawals, profit_generated)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.run(sql, [name, current_balance, total_deposits, total_withdrawals, profit_generated], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...bookmakerData });
        }
      });
    });
  }

  static getAll() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          id, name, current_balance, total_deposits, total_withdrawals, 
          profit_generated, created_at, updated_at
        FROM bookmakers
        ORDER BY name
      `;

      db.all(sql, [], (err, rows) => {
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
          b.*,
          COUNT(bet.id) as number_of_bets,
          SUM(bet.stake) as total_staked,
          SUM(bet.profit_loss) as total_profit_loss
        FROM bookmakers b
        LEFT JOIN bets bet ON b.id = bet.bookmaker_id
        WHERE b.id = ?
        GROUP BY b.id
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

  static getByName(name) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM bookmakers WHERE name = ?', [name], (err, row) => {
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
      const sql = `UPDATE bookmakers SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      db.run(sql, [...values, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  static updateBalance(id, amount, type = 'adjustment') {
    return new Promise((resolve, reject) => {
      // First get current balance
      db.get('SELECT current_balance, total_deposits, total_withdrawals FROM bookmakers WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          reject(new Error('Bookmaker not found'));
          return;
        }

        let newBalance = row.current_balance;
        let newDeposits = row.total_deposits;
        let newWithdrawals = row.total_withdrawals;

        switch (type) {
          case 'deposit':
            newBalance += amount;
            newDeposits += amount;
            break;
          case 'withdrawal':
            newBalance -= amount;
            newWithdrawals += amount;
            break;
          case 'profit':
            newBalance += amount;
            break;
          case 'loss':
            newBalance -= amount;
            break;
          case 'adjustment':
            newBalance += amount;
            break;
          default:
            reject(new Error('Invalid balance update type'));
            return;
        }

        const sql = `
          UPDATE bookmakers 
          SET current_balance = ?, total_deposits = ?, total_withdrawals = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

        db.run(sql, [newBalance, newDeposits, newWithdrawals, id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ 
              id, 
              previous_balance: row.current_balance,
              new_balance: newBalance,
              change: amount,
              type 
            });
          }
        });
      });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      // Check if there are any bets associated with this bookmaker
      db.get('SELECT COUNT(*) as count FROM bets WHERE bookmaker_id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count > 0) {
          reject(new Error('Cannot delete bookmaker with associated bets'));
          return;
        }

        // Delete the bookmaker
        db.run('DELETE FROM bookmakers WHERE id = ?', [id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, changes: this.changes });
          }
        });
      });
    });
  }

  static getBalanceSummary() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_bookmakers,
          SUM(current_balance) as total_balance,
          SUM(total_deposits) as total_deposits,
          SUM(total_withdrawals) as total_withdrawals,
          SUM(profit_generated) as total_profit,
          AVG(current_balance) as avg_balance
        FROM bookmakers
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
}

module.exports = Bookmaker;
