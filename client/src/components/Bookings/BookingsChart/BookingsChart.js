import React from 'react';
import { Bar as BarChart } from 'react-chartjs';

const BOOKINGS_BUCKETS = {
  Cheap: { min: 0, max: 100 },
  Normal: { min: 100, max: 200 },
  Expensive: { min: 200, max: 100000000 }
};

const BookingsChart = props => {
  const chartData = { labels: [], datasets: [] };

  for (let bucket in BOOKINGS_BUCKETS) {
    const filteredBookingsCount = props.bookings.reduce((acc, value) => {
      if (
        value.event.price > BOOKINGS_BUCKETS[bucket].min &&
        value.event.price <= BOOKINGS_BUCKETS[bucket].max
      ) {
        return acc + 1;
      } else {
        return acc;
      }
    }, 0);
    chartData.labels.push(bucket);
    chartData.datasets.push({
      fillColor: 'rgba(220,220,220,0.5)',
      strokeColor: 'rgba(220,220,220,0.8)',
      highlightFill: 'rgba(220,220,220,0.75)',
      highlightStroke: 'rgba(220,220,220,1)',
      data: [filteredBookingsCount]
    });
  }

  return <BarChart data={chartData} />;
};

export default BookingsChart;
