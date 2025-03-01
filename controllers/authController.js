const User = require('../models/User');
const Admin = require('../models/Admin'); // Import the Admin model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Booking = require('../models/Booking'); // Ensure Booking is correctly imported
const Payment = require('../models/Payment'); // Ensure Payment is correctly imported
const Review = require('../models/Review'); // Ensure Review is correctly imported
const Vehicle = require('../models/Vehicle'); // Ensure Vehicle is correctly imported
const multer = require('multer');
const path = require('path');

// Register user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user (updated to support both users and admins)
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log('loginUser: Attempting to log in with username:', username);

    // Check the `admins` collection first
    let user = await Admin.findOne({ username });
    console.log('loginUser: Admin user lookup result:', user);
    let isAdmin = true;

    // If not found in `admins`, check the `users` collection
    if (!user) {
      user = await User.findOne({ username });
      console.log('loginUser: Regular user lookup result:', user);
      isAdmin = false;
    }

    if (!user) {
      console.log('loginUser: User not found in both collections');
      return res.status(404).json({ message: 'Invalid username or password' });
    }

    console.log('loginUser: Comparing provided password:', password);
    console.log('loginUser: Stored hashed password:', user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('loginUser: Password match result:', isMatch);

    if (!isMatch) {
      console.log('loginUser: Password does not match');
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const payload = {
      user: {
        userId: user._id,
        username: user.username,
        isAdmin,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        console.log('loginUser: Token generated:', token);

        // Include the user object in the response
        res.json({
          token,
          user: {
            id: user._id,
            username: user.username,
            isAdmin,
          },
        });
      }
    );
  } catch (error) {
    console.error('loginUser: Server error', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch user profile
    const user = await User.findById(userId).select('-password');

    // Fetch user's bookings with vehicle details
    const bookings = await Booking.find({ user: userId }).populate('vehicle', 'name model');

    // Fetch user's payments
    const payments = await Payment.find({ user: userId });

    // Fetch user's reviews with vehicle details
    const reviews = await Review.find({ user: userId }).populate('vehicle', 'name model');

    res.json({
      profile: user,
      bookings: bookings,
      payments: payments,
      reviews: reviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    if (req.file) {
      user.imageUrl = req.file.path; // Save the file path in the database
    }

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiration = Date.now() + 3600000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiration = resetTokenExpiration;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link below to reset your password:\n\nhttp://localhost:5173/reset-password/${resetToken}`, // Update URL to point to port 5173
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset link sent' });
  } catch (error) {
    console.error('Error sending email:', error); // Log the error
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};