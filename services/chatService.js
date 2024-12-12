const WebSocket = require('ws');
const ChatModel = require('../models/ChatModel');

class ChatService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.rooms = new Map();

    this.wss.on('connection', this.handleConnection.bind(this));
  }

  handleConnection(ws) {
    ws.on('message', async (message) => {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'join':
          this.handleJoin(ws, data);
          break;
        case 'message':
          await this.handleMessage(ws, data);
          break;
        case 'leave':
          this.handleLeave(ws, data);
          break;
      }
    });

    ws.on('close', () => {
      this.handleDisconnect(ws);
    });
  }

  handleJoin(ws, data) {
    const { roomId, userId, nickname } = data;
    
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    
    this.rooms.get(roomId).add(ws);
    ws.roomId = roomId;
    ws.userId = userId;
    ws.nickname = nickname;

    this.broadcast(roomId, {
      type: 'system',
      message: `${nickname}님이 입장하셨습니다.`
    });
  }

  async handleMessage(ws, data) {
    const { roomId, message } = data;
    
    // DB에 메시지 저장
    await ChatModel.saveMessage({
      roomId,
      userId: ws.userId,
      message
    });

    this.broadcast(roomId, {
      type: 'chat',
      userId: ws.userId,
      nickname: ws.nickname,
      message
    });
  }

  handleLeave(ws, data) {
    const { roomId } = data;
    this.removeFromRoom(ws, roomId);
  }

  handleDisconnect(ws) {
    if (ws.roomId) {
      this.removeFromRoom(ws, ws.roomId);
    }
  }

  removeFromRoom(ws, roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(ws);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      } else {
        this.broadcast(roomId, {
          type: 'system',
          message: `${ws.nickname}님이 퇴장하셨습니다.`
        });
      }
    }
  }

  broadcast(roomId, message) {
    const room = this.rooms.get(roomId);
    if (room) {
      const messageStr = JSON.stringify(message);
      room.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
        }
      });
    }
  }
}

module.exports = ChatService;