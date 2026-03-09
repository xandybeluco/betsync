const { query } = require('./postgres');

async function initializeDatabase() {

  try {

    console.log('🔄 Creating database tables...');

    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS bets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        bookmaker VARCHAR(100),
        sport VARCHAR(100),
        stake DECIMAL,
        odds DECIMAL,
        result VARCHAR(50),
        profit DECIMAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS bookmakers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      )
    `);

    console.log('✅ Database ready');

  } catch (error) {

    console.error('❌ Error initializing database:', error);
    throw error;

  }

}

module.exports = initializeDatabase;