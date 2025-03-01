const express = require('express');
const router = express.Router();
const {
  addReview,
  getReviewsByVehicle,
  getReviewsByUser
} = require('../controllers/reviewController');
const authenticateToken = require('../middleware/authenticateToken');

// Add review
router.post('/', authenticateToken, addReview);

// Get reviews by vehicle ID
router.get('/vehicle/:vehicleId', getReviewsByVehicle);

// Get reviews by user ID
router.get('/user/:userId', authenticateToken, getReviewsByUser);

module.exports = router;
