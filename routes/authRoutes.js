const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile, updateUserProfile, requestPasswordReset, resetPassword } = require('../controllers/authController');
const authenticateToken = require('../middleware/authenticateToken'); // Ensure this middleware is imported

router.post('/register', registerUser);
router.post('/login', loginUser); // This is the endpoint for login
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;