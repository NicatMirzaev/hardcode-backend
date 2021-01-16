const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema.js');
const db = require('./lib/db.js');
const resolvers = require('./resolvers.js')(db);
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const { authSecret } = require('./lib/settings.js');

// Create an express server and a GraphQL endpoint
const app = express();

// authentication middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.get('Authorization').slice(7);
    if(!token){
      req.user = null;
    }
    else {
      req.user = jwt.verify(token, authSecret);
    }
    next();
  }
  catch(error){
    req.user = null;
    next();
  }
}
app.use(bodyParser.json())
app.use(authMiddleware);
app.use(cors());
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: false
}));

app.listen(8080, () => console.log('GraphQL server now running.'));
