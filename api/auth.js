import client from './client';

export const authApi = {
    // 카카오 로그인
    kakaoLogin: async (code) => {
        try {
            const response = await client.get('/auth/kakao/callback', {
                params: { 
                    code,
                    state: Math.random().toString(36).substr(2, 11) // 중복 방지를 위한 state 추가
                }
            });
            return response.data;
        } catch (error) {
            console.error('Auth API Error:', error.response?.data || error);
            throw error;
        }
    },

    // 회원가입 약관 동의
    submitTerms: async (termsData) => {
        const response = await client.post('/auth/terms', termsData);
        return response.data;
    },

    // 이름 등록
    submitName: async (name) => {
        const response = await client.post('/auth/name', { name });
        return response.data;
    },

    // 닉네임 등록
    submitNickname: async (nickname) => {
        const response = await client.post('/auth/nickname', { nickname });
        return response.data;
    },

    // 휴대폰 인증 요청
    requestPhoneVerification: async (phoneNumber) => {
        const response = await client.post('/auth/phone/verify', { phoneNumber });
        return response.data;
    },

    // 인증번호 확인
    verifyPhoneNumber: async (phoneNumber, code) => {
        const response = await client.post('/auth/phone/confirm', {
            phoneNumber,
            verificationCode: code
        });
        return response.data;
    }
};
