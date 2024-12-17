const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middleware/authMiddleware');

// 기존에 sessionController에 정의된 메서드들만 남깁니다
router.get('/', sessionController.getAllSessions);
router.get('/nearby', sessionController.getNearbyActiveSessions);
router.post('/', authMiddleware, sessionController.createSession);
router.get('/:sessionId', sessionController.getSessionDetail);
router.post('/join', authMiddleware, sessionController.joinSession);  // /:sessionId/join을 /join으로 수정
router.post('/:sessionId/extend', authMiddleware, sessionController.extendSession);
router.get('/category/:category', sessionController.getSessionsByCategory);

module.exports = router;
// chat 관련 라우트는 제거 (필요하다면 나중에 추가)
// router.get('/:sessionId/chat', authMiddleware, sessionController.getChatHistory);

module.exports = router;