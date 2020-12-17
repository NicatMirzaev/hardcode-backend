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
      },
      profileImg: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ""
      },
      twitterURL: {
        type: DataTypes.STRING(124),
        allowNull: true,
        defaultValue: ""
      },
      GitHubURL: {
        type: DataTypes.STRING(124),
        allowNull: true,
        defaultValue: ""
      },
      LinkedinURL: {
        type: DataTypes.STRING(124),
        allowNull: true,
        defaultValue: ""
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      exp: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
  })
  sequelize.define('Subscribers', {
    email: {
      type: DataTypes.STRING,
      allowNull: false
    }
  })
}
