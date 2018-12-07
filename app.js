const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use(bodyParser.json());

app.use(
  '/graphql',
  graphqlHttp({
    schema: buildSchema(`
      type RootQuery {
        events: [String!]!
      }

      type RootMutation {
        createEvent(name: String): String
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue: {
      events: () => {
        return ['Hi', 'there', 'yo!'];
      },
      createEvent: args => {
        return args.name;
      }
    },
    graphiql: true
  })
);

app.listen(3000, () => console.log('Server running at http://localhost:3000/'));
