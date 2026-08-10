const { query } = require('../config/database');

class Prediction {
  static async create(predictionData) {
    const {
      userId,
      predictionType,
      probability,
      sleepStartEstimate,
      wakeEstimate,
      confidenceScore,
      featuresUsed,
      modelVersion
    } = predictionData;

    const result = await query(
      `INSERT INTO predictions 
       (user_id, prediction_type, probability, sleep_start_estimate, wake_estimate, 
        confidence_score, features_used, model_version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        predictionType,
        probability,
        sleepStartEstimate,
        wakeEstimate,
        confidenceScore,
        featuresUsed ? JSON.stringify(featuresUsed) : null,
        modelVersion
      ]
    );

    return result.rows[0];
  }

  static async findByUserId(userId, limit = 10) {
    const result = await query(
      `SELECT * FROM predictions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }

  static async getLatest(userId) {
    const result = await query(
      `SELECT * FROM predictions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId]
    );

    return result.rows[0] || null;
  }
}

module.exports = Prediction;

