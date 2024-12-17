const express = require('express');
const http = require('http');
const { Server } = require('socket.io');  // 이 부분 추가
require('dotenv').config();
const cors = require('cors');
const routes = require('./routes');
const sessionRoutes = require("./routes/sessionRoutes"); // 라우트 파일 경로 확인

const app = express();
const server = http.createServer(app);

// Socket.IO 설정
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// CORS 설정 수정
app.use(cors({
    origin: 'http://localhost:5173', // Vite 개발 서버 주소
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 기존 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use("/api/sessions", sessionRoutes);

// 소켓 연결 핸들링
io.on('connection', (socket) => {
  console.log('새로운 클라이언트 연결');

  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    console.log(`${socket.id}가 ${roomName} 방에 입장`);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.room).emit('receiveMessage', {
      text: data.text,
      sender: data.sender,
      nickname: data.nickname
    });
  });

  socket.on('leaveRoom', (roomName) => {
    socket.leave(roomName);
    console.log(`${socket.id}가 ${roomName} 방에서 퇴장`);
  });

  socket.on('disconnect', () => {
    console.log('클라이언트 연결 해제');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});