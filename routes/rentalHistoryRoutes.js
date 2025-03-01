const express = require('express');
const router = express.Router();
const {
  getRentalHistory,
  getRentalHistoryByUser
} = require('../controllers/rentalHistoryController');
const authenticateToken = require('../middleware/authenticateToken');

// Get all rental history
router.get('/', authenticateToken, getRentalHistory);

// Get rental history by user ID
router.get('/user/:userId', authenticateToken, getRentalHistoryByUser);

module.exports = router;
