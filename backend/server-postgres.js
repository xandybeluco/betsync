const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { initializeDatabase } = require('./database/postgres-init');
const authMiddleware = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const betsRoutes = require('./routes/bets');
const bookmakersRoutes = require('./routes/bookmakers');
const operationsRoutes = require('./routes/operations');
const dashboardRoutes = require('./routes/dashboard');
const calculatorsRoutes = require('./routes/calculators');

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// MIDDLEWARE
// =======================

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// HEALTHCHECK
// =======================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'betsync-api',
    timestamp: new Date().toISOString()
  });
});

// Root route (útil para teste no navegador)
app.get('/', (req, res) => {
  res.send('BetSync API running 🚀');
});

// =======================
// ROUTES
// =======================

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/bets', authMiddleware, betsRoutes);
app.use('/api/bookmakers', authMiddleware, bookmakersRoutes);
app.use('/api/operations', authMiddleware, operationsRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/calculators', authMiddleware, calculatorsRoutes);

// =======================
// ERROR HANDLING
// =======================

app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

// =======================
// SERVER START
// =======================

const startServer = async () => {

  console.log('🚀 Starting BetSync server...');

  // Start server FIRST (important for Railway)
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });

  // Initialize database after server start
  try {

    console.log('📦 Connecting to PostgreSQL...');

    await initializeDatabase();

    console.log('✅ PostgreSQL connected');

  } catch (error) {

    console.error('❌ Database connection failed:', error);

  }
};

// =======================
// GRACEFUL SHUTDOWN
// =======================

process.on('SIGINT', async () => {

  console.log('\n🛑 Shutting down server...');

  try {

    const { close } = require('./database/postgres');
    await close();

    console.log('✅ Database connection closed');

  } catch (error) {

    console.error('Error closing database:', error);

  }

  process.exit(0);

});

startServer();

module.exports = app;