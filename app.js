const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

app.use(
  '/graphql',
  graphqlHttp({
    schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      type User {
        _id: ID!
        email: String!
        password: String
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      input UserInput {
        email: String!
        password: String!
      }

      type RootQuery {
        events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput!): Event
        createUser(userInput: UserInput!): User
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue: {
      events: async () => {
        try {
          const events = await Event.find();
          return events.map(e => {
            return { ...e._doc, _id: e.id };
          });
        } catch (err) {
          console.log(err);
          throw err;
        }
      },

      createEvent: async ({ eventInput: { title, description, price, date } }) => {
        const event = new Event({
          title,
          description,
          price: +price,
          date: new Date(date),
          creator: '5c17ec109e846f4cf815b09b'
        });

        try {
          const result = await event.save();

          const user = await User.findById('5c17ec109e846f4cf815b09b');
          if (!user) {
            throw new Error('User not found!');
          }
          user.createdEvents.push(event);
          await user.save();

          return { ...result._doc, _id: result.id };
        } catch (err) {
          throw err;
        }
      },

      createUser: async ({ userInput: { email, password } }) => {
        try {
          const foundUser = await User.findOne({ email });
          if (foundUser) {
            throw new Error('User exists already!');
          }

          const hashedPassword = await bcrypt.hash(password, 12);
          const user = new User({ email, password: hashedPassword });
          const savedUser = await user.save();
          return { ...savedUser._doc, password: null, _id: savedUser.id };
        } catch (err) {
          throw err;
        }
      }
    },
    graphiql: true
  })
);

mongoose
  .connect(
    process.env.MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(() => {
    app.listen(3000, () => console.log('Server running at http://localhost:3000/'));
  })
  .catch(console.log);
