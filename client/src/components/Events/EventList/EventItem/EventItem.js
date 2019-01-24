import React, { useContext } from 'react';

import AuthContext from '../../../../context/auth-context';
import './EventItem.css';

const EventItem = props => {
  const { userId } = useContext(AuthContext);

  return (
    <li key={props.eventId} className="events__list-item">
      <div>
        <h1>{props.title}</h1>
        <h2>
          ${props.price} - {new Date(props.date).toLocaleDateString()}
        </h2>
      </div>
      <div>
        {userId !== props.creator ? (
          <button className="btn">View Details</button>
        ) : (
          <p>You're the owner of this event.</p>
        )}
      </div>
    </li>
  );
};

export default EventItem;
