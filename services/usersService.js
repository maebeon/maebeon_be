const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');

class UserService {
  static async createUser(userData) {
    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    if (userData.nickname) {
      const existingNickname = await UserModel.findByNickname(userData.nickname);
      if (existingNickname) {
        throw new Error('Nickname already exists');
      }
    }

    const userId = await UserModel.create(userData);
    return userId;
  }

  static async updateUserProfile(userId, profileData) {
    if (profileData.nickname) {
      const existingNickname = await UserModel.findByNickname(profileData.nickname);
      if (existingNickname && existingNickname.user_id !== userId) {
        throw new Error('Nickname already exists');
      }
    }

    await UserModel.updateProfile(userId, profileData);
  }

  static generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
  }
}

module.exports = UserService;