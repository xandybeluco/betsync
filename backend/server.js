const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy when behind reverse proxy (e.g. React dev server forwarding)
if (process.env.NODE_ENV !== 'production') {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/bets', require('./routes/bets'));
app.use('/api/operations', require('./routes/operations'));
app.use('/api/bookmakers', require('./routes/bookmakers'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/calculators', require('./routes/calculators'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const db = require('./database/connection');
const { createTables, migrateBetsTable, insertDefaultBookmakers, insertDefaultSettings } = require('./database/init');

db.serialize(() => {
  console.log('Database connected successfully');
  createTables();
  migrateBetsTable(() => {
    insertDefaultBookmakers();
    insertDefaultSettings();
    setImmediate(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    });
  });
});

module.exports = app;
