const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer 토큰 추출
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // JWT 검증
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user; // 요청 객체에 사용자 정보 추가
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
