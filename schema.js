const { buildSchema } = require('graphql');

const schema = buildSchema(`
    type Query {
        message: String
    }
`);

module.exports = schema;
