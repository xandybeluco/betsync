const db = require('./connection');

// Create tables
const createTables = () => {
  // Bookmakers table
  db.run(`
    CREATE TABLE IF NOT EXISTS bookmakers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      current_balance REAL DEFAULT 0,
      total_deposits REAL DEFAULT 0,
      total_withdrawals REAL DEFAULT 0,
      profit_generated REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Operations table (for multi-bet operations)
  db.run(`
    CREATE TABLE IF NOT EXISTS operations (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('Aposta Simples', 'Super Odd', 'Aumentada', 'Tentativa de Duplo', 'Free Bet', 'Extração de FreeBet')),
      total_exposure REAL DEFAULT 0,
      guaranteed_profit REAL DEFAULT 0,
      status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Completed', 'Cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bets table
  db.run(`
    CREATE TABLE IF NOT EXISTS bets (
      id TEXT PRIMARY KEY,
      operation_id TEXT,
      bookmaker_id INTEGER,
      date DATE NOT NULL,
      bet_type TEXT NOT NULL CHECK (bet_type IN ('Aposta Simples', 'Super Odd', 'Aumentada', 'Tentativa de Duplo', 'Free Bet', 'Extração de FreeBet')),
      event TEXT NOT NULL,
      market TEXT NOT NULL,
      odds REAL NOT NULL CHECK (odds > 0),
      stake REAL NOT NULL CHECK (stake >= 0),
      potential_return REAL NOT NULL,
      back_odds REAL,
      lay_odds REAL,
      exchange_commission REAL DEFAULT 4.5,
      lay_stake REAL,
      liability REAL,
      status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Won', 'Lost', 'Cancelled')),
      profit_loss REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE SET NULL,
      FOREIGN KEY (bookmaker_id) REFERENCES bookmakers(id) ON DELETE SET NULL
    )
  `);

  // Bankroll history table
  db.run(`
    CREATE TABLE IF NOT EXISTS bankroll_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE UNIQUE NOT NULL,
      opening_balance REAL NOT NULL,
      closing_balance REAL NOT NULL,
      total_staked REAL DEFAULT 0,
      total_returns REAL DEFAULT 0,
      profit_loss REAL DEFAULT 0,
      number_of_bets INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database tables created successfully');
};

// Migrate existing bets table if it was created with old schema (e.g. without operation_id)
const migrateBetsTable = (done) => {
  db.all('PRAGMA table_info(bets)', [], (err, rows) => {
    if (err) {
      if (done) done();
      return;
    }
    const columns = (rows || []).map(r => r.name);
    let pending = 0;
    const maybeDone = () => {
      pending--;
      if (pending <= 0 && done) done();
    };

    const ensureColumn = (name, alterSql, logLabel) => {
      if (columns.includes(name)) {
        return;
      }
      pending++;
      db.run(alterSql, (alterErr) => {
        if (!alterErr) {
          console.log(`Migration: added ${logLabel} to bets`);
        } else {
          console.error(`Migration error adding ${logLabel}:`, alterErr.message);
        }
        maybeDone();
      });
    };

    ensureColumn('operation_id', "ALTER TABLE bets ADD COLUMN operation_id TEXT", 'operation_id');
    ensureColumn('bet_type', "ALTER TABLE bets ADD COLUMN bet_type TEXT DEFAULT 'Aposta Simples'", 'bet_type');
    ensureColumn('back_odds', "ALTER TABLE bets ADD COLUMN back_odds REAL", 'back_odds');
    ensureColumn('lay_odds', "ALTER TABLE bets ADD COLUMN lay_odds REAL", 'lay_odds');
    ensureColumn('exchange_commission', "ALTER TABLE bets ADD COLUMN exchange_commission REAL DEFAULT 4.5", 'exchange_commission');
    ensureColumn('lay_stake', "ALTER TABLE bets ADD COLUMN lay_stake REAL", 'lay_stake');
    ensureColumn('liability', "ALTER TABLE bets ADD COLUMN liability REAL", 'liability');

    if (pending === 0 && done) done();
  });
};

// Insert default bookmakers
const insertDefaultBookmakers = () => {
  const defaultBookmakers = [
    'Bet365', 'Betano', 'Sportingbet', 'Betsul', 'Betfair'
  ];

  defaultBookmakers.forEach(bookmaker => {
    db.run(
      'INSERT OR IGNORE INTO bookmakers (name) VALUES (?)',
      [bookmaker],
      (err) => {
        if (err) console.error(`Error inserting ${bookmaker}:`, err.message);
      }
    );
  });
};

// Insert default settings
const insertDefaultSettings = () => {
  const defaultSettings = [
    ['initial_bankroll', '1000'],
    ['exchange_commission', '4.5'],
    ['currency', 'USD'],
    ['timezone', 'UTC']
  ];

  defaultSettings.forEach(([key, value]) => {
    db.run(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      [key, value],
      (err) => {
        if (err) console.error(`Error inserting setting ${key}:`, err.message);
      }
    );
  });
};

// Initialize database
const initDatabase = () => {
  console.log('Initializing database...');
  
  createTables();
  insertDefaultBookmakers();
  insertDefaultSettings();
  
  console.log('Database initialization completed');
  process.exit(0);
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initDatabase();
}

module.exports = { createTables, migrateBetsTable, insertDefaultBookmakers, insertDefaultSettings };
