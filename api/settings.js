export const settingsApi = {
    // 설정 조회
    getSettings: async () => {
        const response = await client.get('/settings');
        return response.data;
    },

    // 설정 업데이트
    updateSettings: async (settingsData) => {
        const response = await client.put('/settings', settingsData);
        return response.data;
    }
};