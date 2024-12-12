const SessionModel = require('../models/SessionModel');
const ChatModel = require('../models/ChatModel');

class SessionService {
  static async createSession(sessionData) {
    // 세션 생성
    const sessionId = await SessionModel.create(sessionData);
    
    // 채팅방 생성
    await ChatModel.createChatRoom(sessionId);
    
    // 30분 후 자동 종료 설정
    setTimeout(async () => {
      await SessionModel.deactivate(sessionId);
    }, 30 * 60 * 1000);

    return sessionId;
  }

  static async getNearbyActiveSessions(latitude, longitude) {
    return await SessionModel.findNearby(latitude, longitude);
  }

  static async extendSession(sessionId) {
    const [extensions] = await pool.execute(
      'SELECT COUNT(*) as count FROM session_extensions WHERE session_id = ?',
      [sessionId]
    );

    if (extensions[0].count >= 2) {
      throw new Error('Maximum extension limit reached');
    }

    await SessionModel.extend(sessionId);
    
    // 연장 기록 추가
    await pool.execute(
      'INSERT INTO session_extensions (session_id) VALUES (?)',
      [sessionId]
    );
  }
}

module.exports = SessionService;