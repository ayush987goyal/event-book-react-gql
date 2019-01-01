const Event = require('../../models/event');
const User = require('../../models/user');
const { transformEvent } = require('./merge');

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(e => transformEvent(e));
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  createEvent: async ({ eventInput: { title, description, price, date } }, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    const createdEvent = new Event({
      title,
      description,
      price: +price,
      date: new Date(date),
      creator: req.userId
    });

    try {
      const result = await createdEvent.save();

      const foundUser = await User.findById(req.userId);
      if (!foundUser) {
        throw new Error('User not found!');
      }
      foundUser.createdEvents.push(createdEvent);
      await foundUser.save();

      return transformEvent(result);
    } catch (err) {
      throw err;
    }
  }
};
