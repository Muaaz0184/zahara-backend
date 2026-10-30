import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// In-memory persistent database store for demo/backend sync
let bookings = [
  {
    id: '1',
    code: 'ZRL-74821',
    pickup: 'Peenya Industrial Area, Bengaluru',
    drop: 'New Mangalore Port, Panambur',
    truck: 'Eicher Canter (13T)',
    weight: 11.5,
    goods: 'Industrial Steel Rods',
    status: 'IN_TRANSIT',
    date: '2026-08-26 14:30',
    driverOtp: '8492',
    pickupCoordinates: '13.0285° N, 77.5197° E',
    dropCoordinates: '12.9344° N, 74.8117° E'
  },
  {
    id: '2',
    code: 'ZRL-39201',
    pickup: 'APMC Yard, Yeshwanthpur',
    drop: 'Electronic City Phase 2',
    truck: 'Tata Intra Goods (3T)',
    weight: 2.2,
    goods: 'FMCG Packaged Goods',
    status: 'ACCEPTED',
    date: '2026-08-26 18:15',
    driverOtp: '5120',
    pickupCoordinates: '13.0211° N, 77.5514° E',
    dropCoordinates: '12.8452° N, 77.6602° E'
  }
];

// 1. Health check
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', server: 'Zahara Road Lines API' });
});

// 2. Fetch all bookings (Used by Owner & Driver portals)
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// 3. Create new customer booking
app.post('/api/bookings', (req, res) => {
  const { pickup, drop, truck, weight, goods } = req.body;
  const newBooking = {
    id: Date.now().toString(),
    code: `ZRL-${Math.floor(10000 + Math.random() * 90000)}`,
    pickup,
    drop,
    truck,
    weight: Number(weight) || 1,
    goods: goods || 'General Freight',
    status: 'ACCEPTED',
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    driverOtp: Math.floor(1000 + Math.random() * 9000).toString(),
    pickupCoordinates: '12.9716° N, 77.5946° E',
    dropCoordinates: '13.3408° N, 74.7421° E'
  };

  bookings.unshift(newBooking);
  res.status(201).json(newBooking);
});

// 4. Update booking status (Used by Owner)
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