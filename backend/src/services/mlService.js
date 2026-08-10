const axios = require('axios');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
const ML_SERVICE_TIMEOUT = parseInt(process.env.ML_SERVICE_TIMEOUT) || 30000;

const mlServiceClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: ML_SERVICE_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

const predict = async (activities) => {
  try {
    // Transform activities to format expected by ML service
    const formattedActivities = activities.map(activity => ({
      event_type: activity.event_type,
      app_category: activity.app_category,
      timestamp: activity.timestamp,
      session_duration: activity.session_duration,
      charging_status: activity.charging_status,
      metadata: activity.metadata,
    }));

    const response = await mlServiceClient.post('/predict', {
      activities: formattedActivities,
    });

    return response.data;
  } catch (error) {
    logger.error('ML Service error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      throw new AppError('ML service is not available', 503);
    }
    
    if (error.response) {
      throw new AppError(
        error.response.data?.message || 'ML service error',
        error.response.status || 500
      );
    }
    
    throw new AppError('Failed to get prediction from ML service', 500);
  }
};

const healthCheck = async () => {
  try {
    const response = await mlServiceClient.get('/health');
    return response.data;
  } catch (error) {
    logger.error('ML Service health check failed:', error.message);
    return { status: 'unhealthy', error: error.message };
  }
};

module.exports = {
  predict,
  healthCheck,
};

