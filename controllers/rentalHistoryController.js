const RentalHistory = require('../models/RentalHistory');

// Get all rental history
exports.getRentalHistory = async (req, res) => {
  try {
    const rentalHistories = await RentalHistory.find().populate('user vehicle');
    res.status(200).json(rentalHistories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get rental history by user ID
exports.getRentalHistoryByUser = async (req, res) => {
  try {
    const rentalHistories = await RentalHistory.find({ user: req.params.userId }).populate('vehicle');
    res.status(200).json(rentalHistories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
