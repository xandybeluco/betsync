const { Pool } = require('pg');
require('dotenv').config();

let pool;

if (process.env.DATABASE_URL) {
  // Railway / production
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // Local development
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'betsync',
  });
}

// Connection events
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error', err);
});

// Query helper
const query = async (text, params) => {
  const start = Date.now();
  try {

    const res = await pool.query(text, params);

    const duration = Date.now() - start;

    console.log(`✓ Query executed (${duration}ms)`);

    return res;

  } catch (error) {

    console.error('❌ Query error:', error);

    throw error;

  }
};

module.exports = {
  query,
  pool,
  close: async () => {
    await pool.end();
    console.log('PostgreSQL connection pool closed');
  }
};