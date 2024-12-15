import client from './client';

export const userApi = {
    // 프로필 조회
    getProfile: async () => {
        try {
            const response = await client.get('/users/profile');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 프로필 업데이트
    updateProfile: async (profileData) => {
        try {
            const response = await client.put('/users/profile', profileData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 회원 탈퇴
    deleteAccount: async () => {
        try {
            const response = await client.delete('/users/account');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};