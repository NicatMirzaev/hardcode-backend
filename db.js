const { Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize('hardcode', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

require('./models.js')(sequelize, Sequelize, DataTypes);

async function syncDatabase(){
  await sequelize.sync({ alter: true });
  console.log("All models were synchronized successfully.");
}

syncDatabase()

module.exports = sequelize;
