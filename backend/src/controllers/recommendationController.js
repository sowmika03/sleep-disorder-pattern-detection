const { AppError } = require('../utils/errors');
const Recommendation = require('../models/Recommendation');

const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { unreadOnly } = req.query;

    const recommendations = await Recommendation.findByUserId(
      userId,
      unreadOnly === 'true'
    );

    res.json({
      status: 'success',
      data: {
        recommendations,
        count: recommendations.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const recommendation = await Recommendation.markAsRead(id, userId);

    if (!recommendation) {
      throw new AppError('Recommendation not found', 404);
    }

    res.json({
      status: 'success',
      data: {
        recommendation,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  markAsRead,
};

