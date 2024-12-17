const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 중복 제거
router.get('/kakao', authController.kakaoLogin);
router.get('/kakao/callback', authController.kakaoCallback);

module.exports = router;