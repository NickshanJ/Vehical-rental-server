const express = require('express');
const router = express.Router();
const {
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile
} = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');

// Get user profile
router.get('/profile', authenticateToken, getProfile);

// Update user profile
router.put('/profile', authenticateToken, updateProfile);

// Get user by ID
router.get('/:id', authenticateToken, getUserById);

// Update user
router.put('/:id', authenticateToken, updateUser);

// Delete user
router.delete('/:id', authenticateToken, deleteUser);

module.exports = router;
