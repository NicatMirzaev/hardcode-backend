module.exports = (sequelize, Sequelize, DataTypes) => {
  sequelize.define('Users', {
      id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING(40),
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isConfirmed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
  })
  sequelize.define('Subscribers', {
    email: {
      type: DataTypes.STRING,
      allowNull: false
    }
  })
}
