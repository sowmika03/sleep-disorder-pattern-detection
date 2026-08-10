const { AppError } = require('../utils/errors');
const Prediction = require('../models/Prediction');
const ActivityLog = require('../models/ActivityLog');
const SleepSession = require('../models/SleepSession');
const Recommendation = require('../models/Recommendation');
const predictionService = require('../services/predictionService');
const logger = require('../utils/logger');

const runPrediction = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { days = 7 } = req.body;

    // Get recent activity data
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const activities = await ActivityLog.findByUserId(userId, startDate, endDate, 1000);

    if (activities.length === 0) {
      throw new AppError('Insufficient activity data for prediction', 400);
    }

    // Call ML service for prediction
    const predictionResult = await predictionService.predict(activities);

    // Save prediction to database
    const prediction = await Prediction.create({
      userId,
      predictionType: predictionResult.prediction,
      probability: predictionResult.probability,
      sleepStartEstimate: predictionResult.sleep_start_estimate,
      wakeEstimate: predictionResult.wake_estimate,
      confidenceScore: predictionResult.confidence,
      featuresUsed: predictionResult.features,
      modelVersion: predictionResult.model_version || '1.0.0',
    });

    // Generate recommendations based on prediction
    await generateRecommendations(userId, prediction.id, predictionResult);

    logger.info(`Prediction generated for user ${userId}: ${predictionResult.prediction}`);

    res.json({
      status: 'success',
      data: {
        prediction: {
          id: prediction.id,
          type: prediction.prediction_type,
          probability: parseFloat(prediction.probability),
          sleepStartEstimate: prediction.sleep_start_estimate,
          wakeEstimate: prediction.wake_estimate,
          confidenceScore: parseFloat(prediction.confidence_score),
          modelAccuracy: parseFloat(predictionResult.model_accuracy),
          createdAt: prediction.created_at,
        },
        features: predictionResult.features,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getLatest = async (req, res, next) => {
  try {
    const userId = req.userId;

    const prediction = await Prediction.getLatest(userId);

    if (!prediction) {
      return res.json({
        status: 'success',
        data: {
          prediction: null,
          message: 'No predictions found',
        },
      });
    }

    res.json({
      status: 'success',
      data: {
        prediction: {
          id: prediction.id,
          type: prediction.prediction_type,
          probability: parseFloat(prediction.probability),
          sleepStartEstimate: prediction.sleep_start_estimate,
          wakeEstimate: prediction.wake_estimate,
          confidenceScore: parseFloat(prediction.confidence_score),
          modelAccuracy: prediction.model_accuracy ? parseFloat(prediction.model_accuracy) : 0.885,
          featuresUsed: prediction.features_used,
          createdAt: prediction.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const generateRecommendations = async (userId, predictionId, predictionResult) => {
  const recommendations = [];

  if (predictionResult.prediction === 'insomnia') {
    recommendations.push({
      userId,
      predictionId,
      recommendationType: 'sleep_hygiene',
      title: 'Improve Sleep Hygiene',
      description: 'Try to maintain a consistent sleep schedule. Avoid screens 1 hour before bedtime and create a relaxing bedtime routine.',
      priority: 1,
    });

    recommendations.push({
      userId,
      predictionId,
      recommendationType: 'activity_reduction',
      title: 'Reduce Late Night Activity',
      description: 'Your activity patterns show frequent late-night usage. Try to reduce screen time after 10 PM.',
      priority: 1,
    });
  } else if (predictionResult.prediction === 'dsps') {
    recommendations.push({
      userId,
      predictionId,
      recommendationType: 'schedule_adjustment',
      title: 'Gradual Schedule Adjustment',
      description: 'Your sleep pattern suggests Delayed Sleep Phase Syndrome. Consider gradually shifting your sleep time earlier by 15 minutes each day.',
      priority: 2,
    });

    recommendations.push({
      userId,
      predictionId,
      recommendationType: 'light_exposure',
      title: 'Morning Light Exposure',
      description: 'Get exposure to bright light in the morning to help reset your circadian rhythm.',
      priority: 2,
    });
  } else {
    recommendations.push({
      userId,
      predictionId,
      recommendationType: 'maintenance',
      title: 'Maintain Healthy Sleep',
      description: 'Your sleep patterns appear normal. Continue maintaining good sleep hygiene practices.',
      priority: 3,
    });
  }

  // Save recommendations
  for (const rec of recommendations) {
    await Recommendation.create(rec);
  }
};

module.exports = {
  runPrediction,
  getLatest,
};

