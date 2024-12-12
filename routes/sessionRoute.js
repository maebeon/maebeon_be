// routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// 근처 활성화된 세션 찾기
router.get('/nearby', sessionController.getNearbyActiveSessions);

// 세션 생성
router.post('/', sessionController.createSession);

// 세션 상세 정보 조회
router.get('/:session_id', sessionController.getSessionDetail);

// 세션 참여
router.post('/join', sessionController.joinSession);

// 세션 연장
router.post('/:session_id/extend', sessionController.extendSession);

module.exports = router;