const express = require('express');
const multer = require('multer');
const router = express.Router();
const { getUserById, updateUser, deleteUser, getProfile, updateProfile } = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Get user profile
router.get('/profile', authenticateToken, getProfile);

// Update user profile with image upload
router.put('/profile', authenticateToken, upload.single('image'), updateProfile);

// Other routes
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, deleteUser);

module.exports = router;