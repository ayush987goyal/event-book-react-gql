import React, { useState, useRef, useContext, useEffect } from 'react';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import EventList from '../components/Events/EventList/EventList';
import AuthContext from '../context/auth-context';
import './Events.css';

const EventsPage = () => {
  const { token } = useContext(AuthContext);
  const [creating, setCreating] = useState(false);
  const titleRef = useRef();
  const priceRef = useRef();
  const dateRef = useRef();
  const descriptionRef = useRef();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    let requestBody = {
      query: `
        query {
          events {
            _id
            title
            price
            description
            date
            creator {
              _id
              email
            }
          }
        }
      `
    };

    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(result => {
        if (result.status !== 200 && result.status !== 201) {
          throw new Error('Failed!');
        }
        return result.json();
      })
      .then(resData => {
        setEvents(resData.data.events);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const startCreateEventHandler = () => setCreating(true);

  const modalConfirmHandelr = () => {
    setCreating(false);
    const title = titleRef.current.value;
    const price = +priceRef.current.value;
    const date = dateRef.current.value;
    const description = descriptionRef.current.value;

    if (
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }

    let requestBody = {
      query: `
        mutation {
          createEvent(eventInput: {title: "${title}", price: ${price}, date: "${date}", description: "${description}"}) {
            _id
            title
            price
            description
            date
            creator {
              _id
              email
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
        if (result.status !== 200 && result.status !== 201) {
          throw new Error('Failed!');
        }
        return result.json();
      })
      .then(resData => {
        fetchEvents();
      })
      .catch(err => {
        console.log(err);
      });
  };

  const modalCancelHandler = () => {
    setCreating(false);
  };

  return (
    <>
      {creating && (
        <>
          <Backdrop />
          <Modal
            title="Add Event"
            canCancel
            canConfirm
            onCancel={modalCancelHandler}
            onConfirm={modalConfirmHandelr}
          >
            <form>
              <div className="form-control">
                <label htmlFor="title">Title</label>
                <input id="title" type="text" ref={titleRef} />
              </div>
              <div className="form-control">
                <label htmlFor="price">Price</label>
                <input id="price" type="number" ref={priceRef} />
              </div>
              <div className="form-control">
                <label htmlFor="date">Date</label>
                <input id="date" type="datetime-local" ref={dateRef} />
              </div>
              <div className="form-control">
                <label htmlFor="description">Description</label>
                <textarea id="title" rows="4" ref={descriptionRef} />
              </div>
            </form>
          </Modal>
        </>
      )}
      {token && (
        <div className="events-control">
          <p>Share your own Events!</p>
          <button className="btn" onClick={startCreateEventHandler}>
            Create Event
          </button>
        </div>
      )}
      <EventList events={events} />
    </>
  );
};

export default EventsPage;
