const initializeDatabase = require('./database/postgres-init');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (necessário no Railway)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

app.use(cors({
  origin: '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =====================
// API ROUTES
// =====================

app.use('/api/auth', require('./routes/auth'));
app.use('/api/bets', require('./routes/bets'));
app.use('/api/operations', require('./routes/operations'));
app.use('/api/bookmakers', require('./routes/bookmakers'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/calculators', require('./routes/calculators'));

// =====================
// HEALTH CHECK
// =====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'betsync-api',
    timestamp: new Date().toISOString()
  });
});

// =====================
// ERROR HANDLER
// =====================

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    error: 'Something went wrong',
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// =====================
// 404 HANDLER
// =====================

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

// =====================
// START SERVER
// =====================

const startServer = async () => {
  try {

    await initializeDatabase();

    app.listen(PORT, () => {
      console.log('🚀 BetSync API running');
      console.log(`🌍 Port: ${PORT}`);
      console.log(`⚙️ Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server');
    console.error(error);
    process.exit(1);
  }
};

startServer();

module.exports = app;