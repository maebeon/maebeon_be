const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.error('No token provided');
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);


    const user = await UserModel.findById(decoded.userId);
    console.log('User from DB:', user);
    if (!user) {
      console.error("User not found");
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    req.user = user; // 인증된 사용자 정보 추가
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};


module.exports = authMiddleware;
