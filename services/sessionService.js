const { Session } = require('../models');

exports.createSession = async (data) => {
  try {
    const session = await Session.create(data);
    return session;
  } catch (error) {
    throw new Error('Failed to create session');
  }
};

exports.getSessions = async () => {
  try {
    const sessions = await Session.findAll();
    return sessions;
  } catch (error) {
    throw new Error('Failed to retrieve sessions');
  }
};