const { Sequelize, DataTypes} = require('sequelize');
const settings = require('./settings.js');


const sequelize = new Sequelize(settings.db_name, settings.db_username, settings.db_password, {
  host: settings.db_host,
  dialect: 'mysql'
});

require('./models.js')(sequelize, Sequelize, DataTypes);

async function syncDatabase(){
  await sequelize.sync({ alter: true });
  console.log("All models were synchronized successfully.");
}

syncDatabase()

module.exports = sequelize;
