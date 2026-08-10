const { query } = require('../config/database');

class ActivityLog {
  static async create(activityData) {
    const { userId, eventType, appCategory, timestamp, sessionDuration, chargingStatus, metadata } = activityData;

    const result = await query(
      `INSERT INTO activity_logs 
       (user_id, event_type, app_category, timestamp, session_duration, charging_status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, eventType, appCategory, timestamp, sessionDuration, chargingStatus, metadata || null]
    );

    return result.rows[0];
  }

  static async bulkCreate(activities) {
    if (activities.length === 0) return [];

    const values = [];
    const params = [];
    let paramCount = 1;

    activities.forEach(activity => {
      const valuePlaceholders = [];
      valuePlaceholders.push(`$${paramCount++}`); // user_id
      valuePlaceholders.push(`$${paramCount++}`); // event_type
      valuePlaceholders.push(`$${paramCount++}`); // app_category
      valuePlaceholders.push(`$${paramCount++}`); // timestamp
      valuePlaceholders.push(`$${paramCount++}`); // session_duration
      valuePlaceholders.push(`$${paramCount++}`); // charging_status
      valuePlaceholders.push(`$${paramCount++}`); // metadata

      params.push(
        activity.userId,
        activity.eventType,
        activity.appCategory || null,
        activity.timestamp,
        activity.sessionDuration || null,
        activity.chargingStatus || false,
        activity.metadata ? JSON.stringify(activity.metadata) : null
      );

      values.push(`(${valuePlaceholders.join(', ')})`);
    });

    const result = await query(
      `INSERT INTO activity_logs 
       (user_id, event_type, app_category, timestamp, session_duration, charging_status, metadata)
       VALUES ${values.join(', ')}
       RETURNING *`,
      params
    );

    return result.rows;
  }

  static async findByUserId(userId, startDate, endDate, limit = 100) {
    let queryText = 'SELECT * FROM activity_logs WHERE user_id = $1';
    const params = [userId];
    let paramCount = 2;

    if (startDate) {
      queryText += ` AND timestamp >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      queryText += ` AND timestamp <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    queryText += ` ORDER BY timestamp DESC LIMIT $${paramCount}`;
    params.push(limit);

    const result = await query(queryText, params);
    return result.rows;
  }

  static async getActivityStats(userId, startDate, endDate) {
    const result = await query(
      `SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN event_type = 'screen_on' THEN 1 END) as screen_ons,
        COUNT(CASE WHEN event_type = 'screen_off' THEN 1 END) as screen_offs,
        AVG(session_duration) as avg_session_duration,
        COUNT(CASE WHEN EXTRACT(HOUR FROM timestamp) >= 23 OR EXTRACT(HOUR FROM timestamp) < 4 THEN 1 END) as late_night_events
       FROM activity_logs
       WHERE user_id = $1 AND timestamp >= $2 AND timestamp <= $3`,
      [userId, startDate, endDate]
    );

    return result.rows[0];
  }
}

module.exports = ActivityLog;

