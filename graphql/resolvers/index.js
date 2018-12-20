const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

const events = async eventIds => {
  try {
    const eventsData = await Event.find({ _id: { $in: eventIds } });
    return eventsData.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event._doc.creator)
      };
    });
  } catch (err) {
    throw err;
  }
};

const user = async userId => {
  try {
    const userData = await User.findById(userId);
    return {
      ...userData._doc,
      _id: userData.id,
      createdEvents: events.bind(this, userData._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(e => {
        return {
          ...e._doc,
          _id: e.id,
          date: new Date(e._doc.date).toISOString(),
          creator: user.bind(this, e._doc.creator)
        };
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

      const foundUser = await User.findById('5c17ec109e846f4cf815b09b');
      if (!foundUser) {
        throw new Error('User not found!');
      }
      foundUser.createdEvents.push(event);
      await foundUser.save();

      return {
        ...result._doc,
        _id: result.id,
        date: new Date(result._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator)
      };
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
};
