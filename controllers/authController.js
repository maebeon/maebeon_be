const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const authController = {
  async kakaoLogin(req, res) {
    try {
      // 카카오 로그인 페이지로 리다이렉트
      const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`;
      res.redirect(kakaoAuthURL);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async kakaoCallback(req, res) {
    try {
      const { code } = req.query;
      
      // 카카오 토큰 받기
      const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', {
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID,
        client_secret: process.env.KAKAO_CLIENT_SECRET,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code
      });

      // 카카오 사용자 정보 받기
      const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`
        }
      });

      const kakaoUser = userResponse.data;
      
      // DB에서 사용자 찾기 또는 생성
      let user = await UserModel.findByEmail(kakaoUser.kakao_account.email);
      
      if (!user) {
        user = await UserModel.create({
          email: kakaoUser.kakao_account.email,
          name: kakaoUser.properties.nickname,
          profile_image: kakaoUser.properties.profile_image
        });
      }

      // JWT 토큰 생성
      const token = jwt.sign(
        { userId: user.user_id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token, user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = authController;