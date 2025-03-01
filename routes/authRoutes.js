const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  updateUserProfile,
  requestPasswordReset,
  resetPassword,
  getProfile // Import the getProfile function
} = require('../controllers/authController');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authenticateToken, getProfile);  // Ensure this points to getProfile
router.put('/profile', authenticateToken, upload.single('image'), updateUserProfile);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;