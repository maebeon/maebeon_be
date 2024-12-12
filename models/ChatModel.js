const pool = require('../config/db');

class ChatModel {
  static async createChatRoom(sessionId) {
    const [result] = await pool.execute(
      'INSERT INTO chat_rooms (session_id) VALUES (?)',
      [sessionId]
    );
    return result.insertId;
  }

  static async getChatHistory(roomId) {
    const [messages] = await pool.execute(
      `SELECT m.*, u.nickname 
       FROM chat_messages m 
       JOIN users u ON m.user_id = u.user_id 
       WHERE m.room_id = ? 
       ORDER BY m.created_at ASC`,
      [roomId]
    );
    return messages;
  }
}

module.exports = ChatModel;