const sequelize = require('../config/db');
const User = require('./User')(sequelize);
const Session = require('./Session')(sequelize);

// 모델 간의 관계 설정
User.hasMany(Session, { foreignKey: 'hostId' });
Session.belongsTo(User, { foreignKey: 'hostId' });

module.exports = {
  User,
  Session,
};