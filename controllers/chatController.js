const ChatModel = require('../models/ChatModel');
const ChatService = require('../services/chatService');

const chatController = {
  async getChatHistory(req, res) {
    try {
      const { roomId } = req.params;
      const messages = await ChatModel.getChatHistory(roomId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = chatController;
