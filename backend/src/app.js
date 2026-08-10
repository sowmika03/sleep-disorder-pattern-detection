const express = require('express');
const cors = require('cors');
const { handleError } = require('./utils/errors');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const activityRoutes = require('./routes/activityRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'sleep-disorder-detection-api',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/recommendations', recommendationRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Error handler (must be last)
app.use(handleError);

module.exports = app;

