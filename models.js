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
      },
      completedTasks: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
  }),
  sequelize.define('Categories', {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: ""
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: ""
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    likes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }),
  sequelize.define('Likes', {
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }),
  sequelize.define('Tasks', {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    step: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    exp: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.STRING(10),
      defaultValue: "Kolay",
      allowNull: false
    },
    solvedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    }
  }),
  sequelize.define('SolvedTasks', {
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  })
  sequelize.define('Subscribers', {
    email: {
      type: DataTypes.STRING,
      allowNull: false
    }
  })
}
