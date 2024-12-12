const express = require('express');
const app = express();
const routes = require('./routes');
const sequelize = require('./config/db');

// 미들웨어 설정
app.use(express.json());

// 라우트 설정
app.use('/api', routes);

// 데이터베이스 연결 및 서버 실행
sequelize.sync()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });