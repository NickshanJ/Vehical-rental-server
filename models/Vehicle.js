const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  make: String,
  model: String,
  year: Number,
  pricePerDay: Number,
  availability: Boolean,
  images: [String],
  description: String,
  location: String,
  status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
