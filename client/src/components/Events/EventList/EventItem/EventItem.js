import React from 'react';

import './EventItem.css';

const EventItem = props => (
  <li key={props.eventId} className="events__list-item">
    {props.title}
  </li>
);

export default EventItem;
