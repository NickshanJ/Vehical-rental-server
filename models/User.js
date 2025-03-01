const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  resetToken: { type: String }, // Add resetToken field
  resetTokenExpiration: { type: Date }, // Add resetTokenExpiration field
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }], // Add reference to bookings
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }] // Add reference to reviews
});

module.exports = mongoose.model('User', userSchema);