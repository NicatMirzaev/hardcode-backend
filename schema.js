const { buildSchema } = require('graphql');

const schema = buildSchema(`
    type User {
        id: String!
        username: String!
        email: String!
        isConfirmed: Boolean!
        profileImg: String!
        twitterURL: String!
        GitHubURL: String!
        LinkedinURL: String!
        level: Int!
        exp: Int!
        likes: [Category]
        requiredExp: Int!
        completedTasks: Int!
        createdAt: String!
    }

    type Category {
      id: String!
      name: String!
      image: String!
      views: Int!
      likes: Int!
      isLiked: Boolean!
    }

    type AuthPayload {
      token: String!
      user: User!
    }

    type Task {
      id: String!
      categoryId: String!
      name: String!
      difficulty: String!
      solvedCount: Int!
      isSolved: Boolean!
      step: Int!
    }

    type TasksPayload {
      category: Category!
      tasks: [Task]
    }

    type Query {
      user(id: String!): User!
      me: User!
      getCategories: [Category]
      getLeaderboard: [User]
      getTasks(categoryId: String!): TasksPayload!
    }

    type Mutation {
      registerUser(username: String!, password: String!, email: String!): AuthPayload!
      loginUser(email: String!, password: String!): AuthPayload!
      confirmUser(token: String!): User
      sendResetPasswordConfirmation(email: String!): Boolean!
      resetPassword(token: String!, newPassword: String!, type: Int!): Boolean!
      subscribeEmail(email: String!): Boolean!
      unsubscribeEmail(email: String!): Boolean!
      updateProfile(currentPassword: String!, newPassword: String!, LinkedinURL: String!, GitHubURL: String!, TwitterURL: String!, ProfileImg: String!, username: String!): User!
      likeCategory(categoryId: String!): Category!
    }
`);

module.exports = schema;
