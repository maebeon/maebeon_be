const pool = require('../config/db');

class UserModel {
  static async create(userData) {
    const { email, name, nickname, profile_image } = userData;
    const [result] = await pool.execute(
      `INSERT INTO users (email, name, nickname, profile_image) 
       VALUES (?, ?, ?, ?)`,
      [email, name, nickname || name, profile_image || null] // profile_image가 없으면 null 사용
    );
    return result.insertId;
  }

  static async findById(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null; // 사용자 데이터를 반환하거나 null 반환
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findByNickname(nickname) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE nickname = ?',
      [nickname]
    );
    return rows[0];
  }

  static async updateProfile(userId, profileData) {
    const { nickname, profile_image, gender, age, mbti, introduction } = profileData;
    await pool.execute(
      `UPDATE users 
       SET nickname = ?, profile_image = ?, gender = ?, 
           age = ?, mbti = ?, introduction = ?
       WHERE user_id = ?`,
      [nickname, profile_image, gender, age, mbti, introduction, userId]
    );
  }
}

module.exports = UserModel;