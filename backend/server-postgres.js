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
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (no auth required)
app.use('/api/auth', authRoutes);

// Protected routes (auth required)
app.use('/api/bets', authMiddleware, betsRoutes);
app.use('/api/bookmakers', authMiddleware, bookmakersRoutes);
app.use('/api/operations', authMiddleware, operationsRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/calculators', authMiddleware, calculatorsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting BetSync server with PostgreSQL...');
    
    // Initialize database
    await initializeDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 API available at http://localhost:${PORT}/api`);
      console.log(`🔐 Demo credentials: email=demo@betsync.com, password=demo123`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  const { close } = require('./database/postgres');
  await close();
  process.exit(0);
});

startServer();

module.exports = app;
