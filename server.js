const express = require('express');
const http = require('http');
require('dotenv').config();
const cors = require('cors');
const routes = require('./routes');
const ChatService = require('./services/chatService');

const app = express();
const server = http.createServer(app);

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use('/api', routes);

// 채팅 서비스 초기화
const chatService = new ChatService(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});