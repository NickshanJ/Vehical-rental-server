const Review = require('../models/Review');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

// Add review
exports.addReview = async (req, res) => {
  try {
    const { vehicle, rating, comment } = req.body;
    const userId = req.user._id; // Ensure you have the user's ID

    const review = new Review({
      user: userId,
      vehicle,
      rating,
      comment
    });

    await review.save();

    // Add review to user's reviews array
    await User.findByIdAndUpdate(userId, { $push: { reviews: review._id } });

    // Add review to vehicle's reviews array (optional, but recommended)
    await Vehicle.findByIdAndUpdate(vehicle, { $push: { reviews: review._id } });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get reviews by vehicle ID
exports.getReviewsByVehicle = async (req, res) => {
  try {
    const reviews = await Review.find({ vehicle: req.params.vehicleId }).populate('user');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get reviews by user ID
exports.getReviewsByUser = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.params.userId }).populate('vehicle');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
