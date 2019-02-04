const DataLoader = require('dataloader');

const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');

const eventLoader = new DataLoader(eventIds => {
  return events(eventIds);
});

const userLoader = new DataLoader(userIds => {
  return User.find({ _id: { $in: userIds } });
});

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
    const eventData = await eventLoader.load(eventId.toString());
    return eventData;
  } catch (err) {
    throw err;
  }
};

const user = async userId => {
  try {
    const userData = await userLoader.load(userId.toString());
    return {
      ...userData._doc,
      _id: userData.id,
      createdEvents: eventLoader.loadMany.bind(this, userData._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

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

module.exports = {
  transformEvent,
  transformBooking
};
