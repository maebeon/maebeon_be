// controllers/userController.js
const pool = require('../config/db');

const userController = {
    // 프로필 조회
    async getProfile(req, res) {
        try {
            const userId = req.user.user_id; // authMiddleware에서 설정된 user 정보

            const [rows] = await pool.execute(
                `SELECT user_id, email, name, nickname, phone_number, 
                        profile_image, gender, age, mbti, introduction
                 FROM users 
                 WHERE user_id = ?`,
                [userId]
            );

            if (!rows.length) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(rows[0]);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // 프로필 업데이트
    async updateProfile(req, res) {
        try {
            const userId = req.user.user_id;
            const { 
                nickname, 
                profile_image, 
                gender, 
                age, 
                mbti, 
                introduction 
            } = req.body;

            // 닉네임 중복 체크
            if (nickname) {
                const [existing] = await pool.execute(
                    'SELECT user_id FROM users WHERE nickname = ? AND user_id != ?',
                    [nickname, userId]
                );
                
                if (existing.length > 0) {
                    return res.status(400).json({ error: 'Nickname already exists' });
                }
            }

            await pool.execute(
                `UPDATE users 
                 SET nickname = COALESCE(?, nickname),
                     profile_image = COALESCE(?, profile_image),
                     gender = COALESCE(?, gender),
                     age = COALESCE(?, age),
                     mbti = COALESCE(?, mbti),
                     introduction = COALESCE(?, introduction)
                 WHERE user_id = ?`,
                [nickname, profile_image, gender, age, mbti, introduction, userId]
            );

            res.json({ message: 'Profile updated successfully' });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = userController;