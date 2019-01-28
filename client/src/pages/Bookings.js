import React, { useState, useEffect, useContext } from 'react';

import Spinner from '../components/Spinner/Spinner';
import AuthContext from '../context/auth-context';

const BookingsPage = () => {
  const { token } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);

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
        console.log(resData);
        setBookings(resData.data.bookings);
      })
      .catch(err => {
        setLoading(false);
        console.log(err);
      });
  };

  return (
    <>
      {loading && <Spinner />}
      <ul>
        {bookings.map(b => (
          <li key={b._id}>
            {b.event.title} - {new Date(b.createdAt).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </>
  );
};

export default BookingsPage;
