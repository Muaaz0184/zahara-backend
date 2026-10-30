import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const getIndianDateTime = () => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  }).format(new Date());
};

let bookings = [
  {
    id: '1',
    code: 'ZRL-74821',
    pickup: 'Peenya Industrial Area, Bengaluru',
    drop: 'New Mangalore Port (NMPT), Mangaluru',
    truck: 'Eicher Canter (13T)',
    weight: 11.5,
    goods: 'Industrial Steel Rods',
    status: 'IN_TRANSIT',
    bookingTimestamp: '26 Aug 2026, 02:30:00 PM',
    driverOtp: '8492',
    pickupCoordinates: '13.0285° N, 77.5197° E',
    dropCoordinates: '12.9344° N, 74.8117° E'
  },
  {
    id: '2',
    code: 'ZRL-39201',
    pickup: 'APMC Yard, Yeshwanthpur, Bengaluru',
    drop: 'Electronic City Phase 2, Bengaluru',
    truck: 'Tata Intra Goods (3T)',
    weight: 2.2,
    goods: 'FMCG Packaged Goods',
    status: 'ACCEPTED',
    bookingTimestamp: '26 Aug 2026, 06:15:00 PM',
    driverOtp: '5120',
    pickupCoordinates: '13.0211° N, 77.5514° E',
    dropCoordinates: '12.8452° N, 77.6602° E'
  }
];

app.get('/api/status', (req, res) => {
  res.json({ status: 'online', server: 'Zahara Road Lines API' });
});

app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
  const { pickup, drop, truck, weight, goods } = req.body;
  const newBooking = {
    id: Date.now().toString(),
    code: `ZRL-${Math.floor(10000 + Math.random() * 90000)}`,
    pickup: pickup || 'Bengaluru Hub',
    drop: drop || 'Destination Hub',
    truck,
    weight: Number(weight) || 1,
    goods: goods || 'General Freight',
    status: 'ACCEPTED',
    bookingTimestamp: getIndianDateTime(),
    driverOtp: Math.floor(1000 + Math.random() * 9000).toString(),
    pickupCoordinates: '12.9716° N, 77.5946° E',
    dropCoordinates: '13.3408° N, 74.7421° E'
  };

  bookings.unshift(newBooking);
  res.status(201).json(newBooking);
});

app.patch('/api/bookings/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const target = bookings.find((b) => b.id === id);
  if (!target) return res.status(404).json({ error: 'Booking not found' });

  target.status = status;
  res.json(target);
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Zahara Road Lines Server running on http://127.0.0.1:${PORT}`);
});