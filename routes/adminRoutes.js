const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const authorizeAdmin = require('../middleware/authorizeAdmin');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking
} = require('../controllers/adminController');

// User management routes
router.get('/users', authenticateToken, authorizeAdmin, getAllUsers);
router.get('/users/:id', authenticateToken, authorizeAdmin, getUserById);
router.put('/users/:id', authenticateToken, authorizeAdmin, updateUser);
router.delete('/users/:id', authenticateToken, authorizeAdmin, deleteUser);

// Vehicle management routes
router.get('/vehicles', authenticateToken, authorizeAdmin, getAllVehicles);
router.get('/vehicles/:id', authenticateToken, authorizeAdmin, getVehicleById);
router.post('/vehicles', authenticateToken, authorizeAdmin, createVehicle);
router.put('/vehicles/:id', authenticateToken, authorizeAdmin, updateVehicle);
router.delete('/vehicles/:id', authenticateToken, authorizeAdmin, deleteVehicle);

// Booking management routes
router.get('/bookings', authenticateToken, authorizeAdmin, getAllBookings);
router.get('/bookings/:id', authenticateToken, authorizeAdmin, getBookingById);
router.put('/bookings/:id', authenticateToken, authorizeAdmin, updateBooking);
router.delete('/bookings/:id', authenticateToken, authorizeAdmin, deleteBooking);

module.exports = router;