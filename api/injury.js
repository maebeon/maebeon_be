export const inquiryApi = {
    // 문의 목록 조회
    getList: async () => {
        const response = await client.get('/inquiries');
        return response.data;
    },

    // 문의 상세 조회
    getDetail: async (inquiryId) => {
        const response = await client.get(`/inquiries/${inquiryId}`);
        return response.data;
    },

    // 문의 작성
    create: async (inquiryData) => {
        const response = await client.post('/inquiries', inquiryData);
        return response.data;
    }
};