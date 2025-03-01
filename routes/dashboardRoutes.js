const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const {
  getUserDashboard
} = require('../controllers/dashboardController');

// Get user dashboard
router.get('/', authenticateToken, getUserDashboard);

module.exports = router;
