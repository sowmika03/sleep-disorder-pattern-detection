const { AppError } = require('../utils/errors');
const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');

const uploadActivity = async (req, res, next) => {
  try {
    const { activities } = req.body;
    const userId = req.userId;

    if (!Array.isArray(activities) || activities.length === 0) {
      throw new AppError('Activities array is required and must not be empty', 400);
    }

    // Validate and prepare activities
    const validatedActivities = activities.map((activity, index) => {
      if (!activity.eventType || !activity.timestamp) {
        throw new AppError(`Activity ${index + 1} must have eventType and timestamp`, 400);
      }

      // Ensure appCategory is string or null
      let appCategory = activity.appCategory;
      if (appCategory !== null && appCategory !== undefined && typeof appCategory !== 'string') {
        appCategory = String(appCategory);
      }
      if (appCategory === '' || appCategory === undefined) {
        appCategory = null;
      }

      // Ensure sessionDuration is integer or null
      let sessionDuration = activity.sessionDuration;
      if (sessionDuration !== null && sessionDuration !== undefined) {
        sessionDuration = parseInt(sessionDuration);
        if (isNaN(sessionDuration) || sessionDuration < 0) {
          sessionDuration = null;
        }
      } else {
        sessionDuration = null;
      }

      // Ensure chargingStatus is boolean
      let chargingStatus = activity.chargingStatus;
      if (typeof chargingStatus !== 'boolean') {
        chargingStatus = Boolean(chargingStatus);
      }

      return {
        userId,
        eventType: activity.eventType,
        appCategory: appCategory,
        timestamp: new Date(activity.timestamp),
        sessionDuration: sessionDuration,
        chargingStatus: chargingStatus,
        metadata: activity.metadata || null,
      };
    });

    const savedActivities = await ActivityLog.bulkCreate(validatedActivities);

    logger.info(`User ${userId} uploaded ${savedActivities.length} activities`);

    res.status(201).json({
      status: 'success',
      data: {
        activities: savedActivities,
        count: savedActivities.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { startDate, endDate, limit } = req.query;

    const activities = await ActivityLog.findByUserId(
      userId,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null,
      limit ? parseInt(limit) : 100
    );

    // Get statistics
    const stats = await ActivityLog.getActivityStats(
      userId,
      startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default: last 7 days
      endDate ? new Date(endDate) : new Date()
    );

    res.json({
      status: 'success',
      data: {
        activities,
        statistics: stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadActivity,
  getHistory,
};
