const axios = require('axios');
const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');

const authController = {
  async kakaoLogin(req, res) {
    try {
      // 요청 코드 받기
      const { code } = req.query;

      // 카카오 토큰 받기
      const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', {
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_REST_API_KEY,
        client_secret: process.env.KAKAO_CLIENT_SECRET,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code,
      });

      // 카카오 사용자 정보 받기
      const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      });

      // 사용자 정보 조회 또는 생성
      let user = await UserModel.findByEmail(userResponse.data.kakao_account.email);
      if (!user) {
        user = await UserModel.create({
          email: userResponse.data.kakao_account.email,
          name: userResponse.data.properties.nickname,
          profile_image: userResponse.data.properties.profile_image,
        });
      }

      // JWT 토큰 생성
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });

      res.json({ token, user });
    } catch (error) {
      console.error('Kakao Login Error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async kakaoCallback(req, res) {
    try {
      // 요청 코드 받기
      const { code } = req.query;

      // 카카오 토큰 받기
      const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', {
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_REST_API_KEY,
        client_secret: process.env.KAKAO_CLIENT_SECRET,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code,
      });

      // 카카오 사용자 정보 받기
      const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      });

      // 사용자 정보 조회 또는 생성
      let user = await UserModel.findByEmail(userResponse.data.kakao_account.email);
      if (!user) {
        user = await UserModel.create({
          email: userResponse.data.kakao_account.email,
          name: userResponse.data.properties.nickname,
          profile_image: userResponse.data.properties.profile_image,
        });
      }

      // JWT 토큰 생성
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });

      res.json({ token, user });
    } catch (error) {
      console.error('Kakao Callback Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = authController;