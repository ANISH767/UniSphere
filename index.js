require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registration');
const attendanceRoutes = require('./routes/attendance');
const clubRoutes = require('./routes/clubs');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const userRoutes = require('./routes/users');
const feedbackRoutes = require('./routes/feedback');
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4 // Forces IPv4 instead of IPv6 lookup
    });
    console.log('MongoDB Cloud Cluster connected successfully!');
  } catch (err) {
    console.error('\n--- RAW MONGO CONNECTION ERROR TRACE ---');
    console.error(err.message);
    console.error('----------------------------------------\n');
    // Intentionally omitting process.exit(1) so the process doesn't hang/crash abruptly
  }
};

connectDB();

app.get('/', (req, res) => {
  res.send('Event Management System API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
