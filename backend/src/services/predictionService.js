const mlService = require('./mlService');
const logger = require('../utils/logger');

const predict = async (activities) => {
  try {
    logger.info(`Running prediction on ${activities.length} activities`);
    const result = await mlService.predict(activities);
    return result;
  } catch (error) {
    logger.error('Prediction service error:', error);
    throw error;
  }
};

module.exports = {
  predict,
};

