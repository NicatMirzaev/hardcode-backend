const { buildSchema } = require('graphql');

const schema = buildSchema(`
    type User {
        id: String!
        username: String!
        password: String!
        email: String!
        isConfirmed: Boolean!
    }
    type AuthPayload {
      token: String!
      user: User!
    }
    type Query {
      user(id: String!): User
      me: User
    }
    type Mutation {
      registerUser(username: String!, password: String!, email: String!): AuthPayload!
      loginUser(email: String!, password: String!): AuthPayload!
      confirmUser(token: String!): User
    }
`);

module.exports = schema;
