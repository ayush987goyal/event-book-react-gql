import React, { useState, useRef, useContext, useEffect } from 'react';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import EventList from '../components/Events/EventList/EventList';
import Spinner from '../components/Spinner/Spinner';
import AuthContext from '../context/auth-context';
import './Events.css';

const EventsPage = () => {
  const { token, userId } = useContext(AuthContext);

  const [creating, setCreating] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const titleRef = useRef();
  const priceRef = useRef();
  const dateRef = useRef();
  const descriptionRef = useRef();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    setLoading(true);

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
        setLoading(false);
        if (result.status !== 200 && result.status !== 201) {
          throw new Error('Failed!');
        }
        return result.json();
      })
      .then(resData => {
        setEvents(resData.data.events);
      })
      .catch(err => {
        setLoading(false);
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
          }
        }
      `
    };

    setLoading(true);
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
        setEvents([...events, { ...resData.data.createEvent, creator: { _id: userId } }]);
      })
      .catch(err => {
        setLoading(false);
        console.log(err);
      });
  };

  const modalCancelHandler = () => {
    setCreating(false);
    setSelectedEvent(null);
  };

  const showDetailHandler = eventId => {
    setSelectedEvent(events.find(e => e._id === eventId));
  };

  const bookEventHandler = () => {
    if (!token) {
      setSelectedEvent(null);
      return;
    }

    let requestBody = {
      query: `
        mutation {
          bookEvent(eventId: "${selectedEvent._id}") {
            _id
            createdAt
            updatedAt
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
        setSelectedEvent(null);
        console.log(resData.data);
      })
      .catch(err => {
        console.log(err);
      });
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
            confirmText="Confirm"
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
      {selectedEvent && (
        <>
          <Backdrop />
          <Modal
            title={selectedEvent.title}
            canCancel
            canConfirm
            confirmText={token ? 'Book' : 'Confirm'}
            onCancel={modalCancelHandler}
            onConfirm={bookEventHandler}
          >
            <h1>{selectedEvent.title}</h1>
            <h2>
              ${selectedEvent.price} - {new Date(selectedEvent.date).toLocaleDateString()}
            </h2>
            <p>{selectedEvent.description}</p>
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
      {loading ? <Spinner /> : <EventList events={events} onViewDetail={showDetailHandler} />}
    </>
  );
};

export default EventsPage;
