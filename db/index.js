const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'fsjstd-restapi.db',
  logging: false
});

const db = {
  sequelize,
  Sequelize,
  models: {},
};

// initialize the models
db.models.User = require('./models/user.js')(sequelize);
db.models.Course = require('./models/course.js')(sequelize);

// initialize the assocations
db.models.User.associate(db.models);
db.models.Course.associate(db.models);

module.exports = db;