const pool = require('../config/db');

class SessionModel {
  static async create(sessionData) {
    const {
      host_id,
      category_id,
      title,
      max_participants,
      start_time,
      end_time,
      latitude,
      longitude
    } = sessionData;

    const [result] = await pool.execute(
      `INSERT INTO sessions 
       (host_id, category_id, title, max_participants, 
        start_time, end_time, location, is_active)
       VALUES (?, ?, ?, ?, ?, ?, POINT(?, ?), TRUE)`,
      [host_id, category_id, title, max_participants, 
       start_time, end_time, latitude, longitude]
    );

    return result.insertId;
  }

  static async findNearby(latitude, longitude, radius = 5000) {
    const [rows] = await pool.execute(
      `SELECT s.*, 
              ST_Distance_Sphere(s.location, POINT(?, ?)) as distance,
              u.nickname as host_nickname,
              c.name as category_name,
              COUNT(sp.user_id) as current_participants
       FROM sessions s
       JOIN users u ON s.host_id = u.user_id
       JOIN categories c ON s.category_id = c.category_id
       LEFT JOIN session_participants sp ON s.session_id = sp.session_id
       WHERE s.is_active = TRUE 
       AND ST_Distance_Sphere(s.location, POINT(?, ?)) <= ?
       AND s.end_time > NOW()
       GROUP BY s.session_id
       HAVING current_participants < s.max_participants
       ORDER BY distance`,
      [latitude, longitude, latitude, longitude, radius]
    );
    return rows;
  }

  static async findById(sessionId) {
    const [rows] = await pool.execute(
      `SELECT s.*, 
              u.nickname as host_nickname,
              c.name as category_name,
              COUNT(sp.user_id) as current_participants
       FROM sessions s
       JOIN users u ON s.host_id = u.user_id
       JOIN categories c ON s.category_id = c.category_id
       LEFT JOIN session_participants sp ON s.session_id = sp.session_id
       WHERE s.session_id = ?
       GROUP BY s.session_id`,
      [sessionId]
    );
    return rows[0];
  }

  static async deactivate(sessionId) {
    await pool.execute(
      'UPDATE sessions SET is_active = FALSE WHERE session_id = ?',
      [sessionId]
    );
  }

  static async extend(sessionId) {
    await pool.execute(
      `UPDATE sessions 
       SET end_time = DATE_ADD(end_time, INTERVAL 30 MINUTE)
       WHERE session_id = ?`,
      [sessionId]
    );
  }
}

module.exports = SessionModel;