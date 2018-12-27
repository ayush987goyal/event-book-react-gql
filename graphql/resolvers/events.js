const Event = require('../../models/event');
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

  createEvent: async ({ eventInput: { title, description, price, date } }) => {
    const createdEvent = new Event({
      title,
      description,
      price: +price,
      date: new Date(date),
      creator: '5c17ec109e846f4cf815b09b'
    });

    try {
      const result = await createdEvent.save();

      const foundUser = await User.findById('5c17ec109e846f4cf815b09b');
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
