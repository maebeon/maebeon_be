const axios = require('axios');
const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');

const authController = {
 async kakaoLogin(req, res) {
   try {
     const { code } = req.query;
     console.log('Authorization Code:', code);
     console.log('Environment variables:', {
       KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID,
       KAKAO_REDIRECT_URI: process.env.KAKAO_REDIRECT_URI
     });

     // API 요청 파라미터 확인
     const params = new URLSearchParams();
     params.append('grant_type', 'authorization_code');
     params.append('client_id', process.env.KAKAO_CLIENT_ID);
     params.append('client_secret', process.env.KAKAO_CLIENT_SECRET);
     params.append('redirect_uri', process.env.KAKAO_REDIRECT_URI);
     params.append('code', code);

     console.log('Token request params:', params.toString());

     try {
       // 카카오 토큰 받기
       const tokenResponse = await axios.post(
         'https://kauth.kakao.com/oauth/token',
         params,
         {
           headers: {
             'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
           }
         }
       );
       console.log('Token Response:', tokenResponse.data);

       // 카카오 사용자 정보 받기
       const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
         headers: {
           Authorization: `Bearer ${tokenResponse.data.access_token}`
         }
       });
       console.log('User Response:', userResponse.data);

       // 이메일 확인
       const email = userResponse.data.kakao_account?.email;
       if (!email) {
         throw new Error('Email not provided from Kakao');
       }

       // 사용자 정보 조회 또는 생성
       let user = await UserModel.findByEmail(email);
       if (!user) {
         user = await UserModel.create({
           email: email,
           name: userResponse.data.properties.nickname,
           profile_image: userResponse.data.properties.profile_image
         });
       }

       // JWT 토큰 생성
       const token = jwt.sign(
         { userId: user.user_id },
         process.env.JWT_SECRET,
         { expiresIn: '24h' }
       );

       res.json({ token, user });
     } catch (apiError) {
       console.error('API Error:', {
         message: apiError.message,
         response: apiError.response?.data
       });
       throw apiError;
     }
   } catch (error) {
     console.error('Kakao Login Error:', error.response?.data || error.message);
     res.status(500).json({ error: error.message });
   }
 },

 async kakaoCallback(req, res) {
  try {
    const { code, state } = req.query;
    
    if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
    }

    console.log('Received Authorization Code:', code);

    // 카카오 토큰 요청
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.KAKAO_CLIENT_ID);
    params.append('client_secret', process.env.KAKAO_CLIENT_SECRET);
    params.append('redirect_uri', process.env.KAKAO_REDIRECT_URI);
    params.append('code', code);

    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' } }
    );

    console.log('Access Token:', tokenResponse.data.access_token);

    // 사용자 정보 가져오기
    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
    });

    // 사용자 처리 로직
    const { id, properties } = userResponse.data;
    const email = `kakao_${id}@maebeon.com`;
    const name = properties?.nickname || `User${id}`;

    // 사용자 정보 저장
    let user = await UserModel.findByEmail(email);
    if (!user) {
      const userId = await UserModel.create({ email, name, nickname: name });
      user = await UserModel.findById(userId);
    }

    // JWT 토큰 생성
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user });
  } catch (error) {
    console.error('Kakao Callback Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
}
}
};

module.exports = authController;