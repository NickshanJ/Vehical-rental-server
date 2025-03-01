const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimiter = require('./middleware/rateLimiter'); // Import the rate limiter
const path = require('path');

// Import routes
const vehicleRoutes = require('./routes/vehicleRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // Ensure this is correct
const reviewRoutes = require('./routes/reviewRoutes');
const supportRoutes = require('./routes/supportRoutes');
const rentalHistoryRoutes = require('./routes/rentalHistoryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Ensure this path is correct
const supportQueriesRoutes = require('./routes/supportQueriesRoutes'); // New route for support queries
const stripeWebhook = require('./routes/stripeWebhook'); // Import the Stripe webhook route

const app = express();

// Middleware
app.use(bodyParser.json());
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local development
    'https://online-vehicle-rental.netlify.app' // Production frontend
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Allow pre-flight requests

// Apply rate limiter to all routes
app.use(rateLimiter);

// Connect to MongoDB (removed deprecated options)
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: 'VehicleRentalSystem', // Specify database name
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => res.send('API Running'));
app.use('/api/auth', authRoutes); // Public route
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes); // Payment route
app.use('/api/reviews', reviewRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/rental-history', rentalHistoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', supportQueriesRoutes); // Ensure the path is correct for the new support queries
app.use('/api', stripeWebhook); // Use Stripe webhook route

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));