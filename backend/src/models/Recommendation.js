const { query } = require('../config/database');

class Recommendation {
  static async create(recommendationData) {
    const {
      userId,
      predictionId,
      recommendationType,
      title,
      description,
      priority
    } = recommendationData;

    const result = await query(
      `INSERT INTO recommendations 
       (user_id, prediction_id, recommendation_type, title, description, priority)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, predictionId, recommendationType, title, description, priority || 1]
    );

    return result.rows[0];
  }

  static async findByUserId(userId, unreadOnly = false) {
    let queryText = 'SELECT * FROM recommendations WHERE user_id = $1';
    const params = [userId];

    if (unreadOnly) {
      queryText += ' AND is_read = false';
    }

    queryText += ' ORDER BY created_at DESC, priority ASC';

    const result = await query(queryText, params);
    return result.rows;
  }

  static async markAsRead(id, userId) {
    const result = await query(
      `UPDATE recommendations 
       SET is_read = true 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    return result.rows[0];
  }
}

module.exports = Recommendation;

