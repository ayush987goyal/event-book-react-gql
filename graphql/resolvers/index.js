const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');
const { dateToString } = require('../../helpers/date');

const transformEvent = event => {
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event._doc.creator)
  };
};

const transformBooking = booking => {
  return {
    ...booking,
    _id: booking.id,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt)
  };
};

const events = async eventIds => {
  try {
    const eventsData = await Event.find({ _id: { $in: eventIds } });
    return eventsData.map(event => transformEvent(event));
  } catch (err) {
    throw err;
  }
};

const singleEvent = async eventId => {
  try {
    const eventData = await Event.findById(eventId);
    return transformEvent(eventData);
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
      return events.map(e => transformEvent(e));
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => transformBooking(booking));
    } catch (err) {
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
  },

  bookEvent: async ({ eventId }) => {
    try {
      const fetchedEvent = await Event.findById(eventId);
      const booking = new Booking({
        user: '5c17ec109e846f4cf815b09b',
        event: fetchedEvent
      });
      const result = await booking.save();
      return transformBooking(result);
    } catch (err) {
      throw err;
    }
  },

  cancelBooking: async ({ bookingId }) => {
    try {
      const fetchedBooking = await Booking.findById(bookingId).populate('event');
      const event = transformEvent(fetchedBooking.event);
      await Booking.deleteOne({ _id: bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  }
};
