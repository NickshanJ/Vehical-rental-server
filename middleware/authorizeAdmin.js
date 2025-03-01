const User = require('../models/User');
const Admin = require('../models/Admin');

const authorizeAdmin = async (req, res, next) => {
  try {
    console.log('authorizeAdmin: Checking admin status for user ID:', req.user._id);

    const admin = await Admin.findById(req.user._id);
    if (admin) {
      console.log('authorizeAdmin: Admin found in the `admins` collection:', admin);
      req.user.isAdmin = true;
      next();
      return;
    }

    console.log('authorizeAdmin: Admin not found in the `admins` collection, checking `users` collection');
    
    const user = await User.findById(req.user._id);
    if (user && user.isAdmin) {
      console.log('authorizeAdmin: Admin found in the `users` collection:', user);
      req.user.isAdmin = true;
      next();
      return;
    }

    console.log('authorizeAdmin: Access denied. User is not an admin.');
    res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    console.error('authorizeAdmin: Server error', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = authorizeAdmin;