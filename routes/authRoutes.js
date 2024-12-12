const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/kakao', authController.kakaoLogin);
router.get('/kakao/callback', authController.kakaoCallback);

router.get('/kakao', authController.kakaoLogin);       // 여기서 authController.kakaoLogin이 undefined
router.get('/kakao/callback', authController.kakaoCallback);  // 여기서 authController.kakaoCallback이 undefined

module.exports = router;