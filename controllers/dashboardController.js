const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

// Get user dashboard
exports.getUserDashboard = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId }).populate('vehicle');
    const payments = await Payment.find({ user: req.user.userId });
    const reviews = await Review.find({ user: req.user.userId }).populate('vehicle');

    res.status(200).json({ bookings, payments, reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
