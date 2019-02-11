import React, { useState, useEffect, useContext } from 'react';

import BookingList from '../components/Bookings/BookingList/BookingList';
import BookingsChart from '../components/Bookings/BookingsChart/BookingsChart';
import BookingControls from '../components/Bookings/BookingControls/BookingControl';
import Spinner from '../components/Spinner/Spinner';
import AuthContext from '../context/auth-context';

const BookingsPage = () => {
  const { token } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [outputType, setOutputType] = useState('list');

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = () => {
    setLoading(true);

    let requestBody = {
      query: `
        query {
          bookings {
            _id
            createdAt
            event {
              _id
              title
              date
              price
            }
          }
        }
      `
    };

    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then(result => {
        setLoading(false);
        if (result.status !== 200 && result.status !== 201) {
          throw new Error('Failed!');
        }
        return result.json();
      })
      .then(resData => {
        setBookings(resData.data.bookings);
      })
      .catch(err => {
        setLoading(false);
        console.log(err);
      });
  };

  const cancelBookingHandler = bookingId => {
    setLoading(true);

    let requestBody = {
      query: `
        mutation CancelBooking($id: ID!) {
          cancelBooking(bookingId: $id) {
              _id
              title
          }
        }
      `,
      variables: { id: bookingId }
    };

    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then(result => {
        setLoading(false);
        if (result.status !== 200 && result.status !== 201) {
          throw new Error('Failed!');
        }
        return result.json();
      })
      .then(resData => {
        setBookings(bookings.filter(b => b._id !== bookingId));
      })
      .catch(err => {
        setLoading(false);
        console.log(err);
      });
  };

  const changeOutputTypeHandler = optType => {
    setOutputType(optType);
  };

  return (
    <>
      {loading && <Spinner />}
      <>
        <BookingControls onChange={changeOutputTypeHandler} activeOutputType={outputType} />
        <div>
          {outputType === 'list' ? (
            <BookingList bookings={bookings} onCancel={cancelBookingHandler} />
          ) : (
            <BookingsChart bookings={bookings} />
          )}
        </div>
      </>
    </>
  );
};

export default BookingsPage;
