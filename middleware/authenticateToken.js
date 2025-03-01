const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified. Decoded:', decoded);

    const user = await User.findById(decoded.user.userId) || await Admin.findById(decoded.user.userId);
    if (!user) {
      console.log('User not found');
      return res.status(403).json({ message: 'User not found' });
    }

    req.user = user;
    console.log('authenticateToken: User authenticated:', req.user);
    next();
  } catch (err) {
    console.error('Error verifying token:', err);
    res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = authenticateToken;