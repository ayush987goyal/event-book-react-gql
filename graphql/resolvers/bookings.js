const Event = require('../../models/event');
const Booking = require('../../models/booking');
const { transformBooking, transformEvent } = require('./merge');

module.exports = {
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => transformBooking(booking));
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
