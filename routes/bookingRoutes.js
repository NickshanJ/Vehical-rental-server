const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getUserBookings,
  paymentConfirmation // Ensure this matches the exported name
} = require('../controllers/bookingController');
const authenticateToken = require('../middleware/authenticateToken');

// Place specific routes first
router.get('/my-bookings', authenticateToken, getUserBookings); // User-specific route

// General routes
router.post('/', authenticateToken, createBooking);
router.get('/', authenticateToken, getBookings);
router.get('/:id', authenticateToken, getBookingById); // Generic ID route
router.put('/:id', authenticateToken, updateBooking);
router.delete('/:id', authenticateToken, deleteBooking);

// Payment confirmation route
router.post('/payment-confirmation', authenticateToken, paymentConfirmation);

module.exports = router;