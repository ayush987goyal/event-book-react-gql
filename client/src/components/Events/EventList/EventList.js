import React from 'react';

import EventItem from './EventItem/EventItem';
import './EventList.css';

const EventList = props => (
  <ul className="event__list">
    {props.events.map(e => (
      <EventItem key={e._id} eventId={e._id} title={e.title} />
    ))}
  </ul>
);

export default EventList;
