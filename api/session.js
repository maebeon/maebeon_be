export const sessionApi = {
    // 근처 세션 조회
    getNearby: async (latitude, longitude) => {
        const response = await client.get('/sessions/nearby', {
            params: { latitude, longitude }
        });
        return response.data;
    },

    // 현재 참여중인 세션 조회
    getParticipating: async () => {
        const response = await client.get('/sessions/participating');
        return response.data;
    },

    // 과거 참여 기록 조회
    getHistory: async () => {
        const response = await client.get('/sessions/history');
        return response.data;
    },

    // 세션 생성
    createSession: async (sessionData) => {
        const response = await client.post('/sessions', sessionData);
        return response.data;
    },

    // 세션 참여
    joinSession: async (sessionId) => {
        const response = await client.post(`/sessions/${sessionId}/join`);
        return response.data;
    }
};