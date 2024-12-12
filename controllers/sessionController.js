// sessionController.js
const mysql = require('mysql2/promise');
const config = require('../config/database');

const pool = mysql.createPool(config.db);

const sessionController = {
    // 근처 활성화된 세션 찾기 (반경 5km 이내)
    async getNearbyActiveSessions(req, res) {
        try {
            const { latitude, longitude } = req.query;
            const connection = await pool.getConnection();

            const [sessions] = await connection.execute(`
                SELECT s.*, 
                    ST_Distance_Sphere(s.location, POINT(?, ?)) as distance,
                    u.nickname as host_nickname,
                    c.name as category_name,
                    COUNT(sp.user_id) as current_participants
                FROM sessions s
                JOIN users u ON s.host_id = u.user_id
                JOIN categories c ON s.category_id = c.category_id
                LEFT JOIN session_participants sp ON s.session_id = sp.session_id
                WHERE s.is_active = TRUE 
                AND ST_Distance_Sphere(s.location, POINT(?, ?)) <= 5000
                AND s.end_time > NOW()
                GROUP BY s.session_id
                HAVING current_participants < s.max_participants
                ORDER BY distance
            `, [latitude, longitude, latitude, longitude]);

            connection.release();
            res.json(sessions);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // 세션 생성
    async createSession(req, res) {
        try {
            const { 
                host_id, 
                category_id, 
                title, 
                max_participants, 
                latitude,
                longitude
            } = req.body;

            const connection = await pool.getConnection();

            // 시작 시간은 현재 시간, 종료 시간은 30분 후로 설정
            const start_time = new Date();
            const end_time = new Date(start_time.getTime() + 30 * 60000); // 30분 = 30 * 60000 밀리초

            const [result] = await connection.execute(`
                INSERT INTO sessions 
                (host_id, category_id, title, max_participants, start_time, end_time, location, is_active) 
                VALUES (?, ?, ?, ?, ?, ?, POINT(?, ?), TRUE)
            `, [host_id, category_id, title, max_participants, start_time, end_time, latitude, longitude]);

            // 세션 자동 종료를 위한 타이머 설정
            setTimeout(async () => {
                try {
                    await connection.execute(
                        'UPDATE sessions SET is_active = FALSE WHERE session_id = ?',
                        [result.insertId]
                    );
                } catch (error) {
                    console.error('Error deactivating session:', error);
                }
            }, 30 * 60000); // 30분

            connection.release();
            res.json({ 
                message: 'Session created successfully', 
                session_id: result.insertId 
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // 세션 상세 정보 조회
    async getSessionDetail(req, res) {
        try {
            const { session_id } = req.params;
            const connection = await pool.getConnection();

            const [sessionDetails] = await connection.execute(`
                SELECT s.*, 
                    u.nickname as host_nickname,
                    c.name as category_name,
                    COUNT(sp.user_id) as current_participants
                FROM sessions s
                JOIN users u ON s.host_id = u.user_id
                JOIN categories c ON s.category_id = c.category_id
                LEFT JOIN session_participants sp ON s.session_id = sp.session_id
                WHERE s.session_id = ?
                GROUP BY s.session_id
            `, [session_id]);

            connection.release();

            if (sessionDetails.length === 0) {
                return res.status(404).json({ error: 'Session not found' });
            }

            res.json(sessionDetails[0]);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // 세션 참여
    async joinSession(req, res) {
        try {
            const { session_id, user_id } = req.body;
            const connection = await pool.getConnection();

            // 현재 참여자 수 확인
            const [participants] = await connection.execute(`
                SELECT COUNT(*) as count
                FROM session_participants
                WHERE session_id = ? AND status = 'ACCEPTED'
            `, [session_id]);

            // 세션 정보 확인
            const [session] = await connection.execute(`
                SELECT max_participants
                FROM sessions
                WHERE session_id = ?
            `, [session_id]);

            if (participants[0].count >= session[0].max_participants) {
                connection.release();
                return res.status(400).json({ error: 'Session is full' });
            }

            // 참여자 추가
            await connection.execute(`
                INSERT INTO session_participants (session_id, user_id, status)
                VALUES (?, ?, 'PENDING')
                ON DUPLICATE KEY UPDATE status = 'PENDING'
            `, [session_id, user_id]);

            connection.release();
            res.json({ message: 'Join request sent successfully' });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // 세션 연장
    async extendSession(req, res) {
        try {
            const { session_id } = req.params;
            const connection = await pool.getConnection();

            // 현재 세션의 연장 횟수 확인
            const [extensions] = await connection.execute(`
                SELECT COUNT(*) as count
                FROM session_extensions
                WHERE session_id = ?
            `, [session_id]);

            if (extensions[0].count >= 2) {
                connection.release();
                return res.status(400).json({ error: 'Maximum extension limit reached' });
            }

            // 세션 시간 30분 연장
            await connection.execute(`
                UPDATE sessions 
                SET end_time = DATE_ADD(end_time, INTERVAL 30 MINUTE)
                WHERE session_id = ?
            `, [session_id]);

            // 연장 기록 추가
            await connection.execute(`
                INSERT INTO session_extensions (session_id)
                VALUES (?)
            `, [session_id]);

            connection.release();
            res.json({ message: 'Session extended successfully' });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = sessionController;