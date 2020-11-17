const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema.js');
const resolvers = require('./resolvers.js');


// Create an express server and a GraphQL endpoint
const app = express();

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: true
}));

app.listen(4000, () => console.log('GraphQL server now running on http://localhost:4000/graphql'));
