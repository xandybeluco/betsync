const { query } = require('./postgres');

const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing PostgreSQL database...');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        initial_bankroll DECIMAL(10, 2) DEFAULT 1000.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table created');

    // Create bookmakers table
    await query(`
      CREATE TABLE IF NOT EXISTS bookmakers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        current_balance DECIMAL(10, 2) DEFAULT 0,
        total_deposits DECIMAL(10, 2) DEFAULT 0,
        total_withdrawals DECIMAL(10, 2) DEFAULT 0,
        profit_generated DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, name)
      );
    `);
    console.log('✓ Bookmakers table created');

    // Create operations table
    await query(`
      CREATE TABLE IF NOT EXISTS operations (
        id VARCHAR(36) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL,
        total_exposure DECIMAL(10, 2) DEFAULT 0,
        guaranteed_profit DECIMAL(10, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Operations table created');

    // Create bets table
    await query(`
      CREATE TABLE IF NOT EXISTS bets (
        id VARCHAR(36) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        operation_id VARCHAR(36) REFERENCES operations(id) ON DELETE SET NULL,
        bookmaker_id INTEGER NOT NULL REFERENCES bookmakers(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        bet_type VARCHAR(100) NOT NULL,
        event VARCHAR(255) NOT NULL,
        market VARCHAR(100),
        odds DECIMAL(10, 4) NOT NULL,
        stake DECIMAL(10, 2) NOT NULL,
        potential_return DECIMAL(10, 2) NOT NULL,
        back_odds DECIMAL(10, 4),
        lay_odds DECIMAL(10, 4),
        exchange_commission DECIMAL(5, 2) DEFAULT 4.5,
        lay_stake DECIMAL(10, 2),
        liability DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'Open',
        profit_loss DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Bets table created');

    // Create bankroll_history table
    await query(`
      CREATE TABLE IF NOT EXISTS bankroll_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE UNIQUE NOT NULL,
        opening_balance DECIMAL(10, 2) NOT NULL,
        closing_balance DECIMAL(10, 2) NOT NULL,
        total_staked DECIMAL(10, 2) DEFAULT 0,
        total_returns DECIMAL(10, 2) DEFAULT 0,
        profit_loss DECIMAL(10, 2) DEFAULT 0,
        number_of_bets INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Bankroll history table created');

    // Create settings table
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        key VARCHAR(100) NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, key)
      );
    `);
    console.log('✓ Settings table created');

    // Create indexes for better performance
    await query(`CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_bets_date ON bets(date);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_bets_bookmaker_id ON bets(bookmaker_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_bookmakers_user_id ON bookmakers(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_operations_user_id ON operations(user_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_bankroll_history_user_id ON bankroll_history(user_id);`);
    console.log('✓ Indexes created');

    // Insert default bookmakers for demo user (if exists)
    const defaultBookmakers = [
      'Bet365',
      'Betano',
      'Sportingbet',
      'Betsul',
      'Betfair'
    ];

    // Check if demo user exists, if not create one
    const userExists = await query('SELECT id FROM users WHERE email = $1', ['demo@betsync.com']);
    
    if (userExists.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('demo123', 10);
      
      const userResult = await query(
        'INSERT INTO users (email, password, name, initial_bankroll) VALUES ($1, $2, $3, $4) RETURNING id',
        ['demo@betsync.com', hashedPassword, 'Demo User', 1000.00]
      );
      
      const userId = userResult.rows[0].id;
      
      // Insert default bookmakers for demo user
      for (const bookmakerName of defaultBookmakers) {
        await query(
          'INSERT INTO bookmakers (user_id, name, current_balance) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [userId, bookmakerName, 0]
        );
      }
      
      console.log('✓ Demo user created (email: demo@betsync.com, password: demo123)');
    }

    console.log('✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

module.exports = { initializeDatabase };
