const { query } = require('../config/database');

class SleepSession {
  static async create(sessionData) {
    const { userId, sleepStart, sleepEnd, estimatedDuration, qualityScore } = sessionData;

    const result = await query(
      `INSERT INTO sleep_sessions 
       (user_id, sleep_start, sleep_end, estimated_duration, quality_score)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, sleepStart, sleepEnd, estimatedDuration, qualityScore]
    );

    return result.rows[0];
  }

  static async findByUserId(userId, limit = 30) {
    const result = await query(
      `SELECT * FROM sleep_sessions 
       WHERE user_id = $1 
       ORDER BY sleep_start DESC 
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }

  static async getLatest(userId) {
    const result = await query(
      `SELECT * FROM sleep_sessions 
       WHERE user_id = $1 
       ORDER BY sleep_start DESC 
       LIMIT 1`,
      [userId]
    );

    return result.rows[0] || null;
  }
}

module.exports = SleepSession;

