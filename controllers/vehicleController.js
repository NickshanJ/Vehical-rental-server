const Vehicle = require('../models/Vehicle'); // Import your Vehicle model
const Booking = require('../models/Booking'); // Import your Booking model

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new vehicle
exports.createVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search and filter vehicles
exports.searchVehicles = async (req, res) => {
    const { type, minPrice, maxPrice, available } = req.query;
    try {
      const query = {};
      if (type) query.type = type;
      if (minPrice) query.price = { $gte: minPrice };
      if (maxPrice) query.price = query.price ? { ...query.price, $lte: maxPrice } : { $lte: maxPrice };
      if (available !== undefined) query.availability = available === 'true';
  
      const vehicles = await Vehicle.find(query);
      res.status(200).json(vehicles);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  // Function to get availability of a specific vehicle
  exports.getVehicleAvailability = async (req, res) => {
    try {
      const vehicleId = req.params.id;
      console.log('Vehicle ID:', vehicleId);
  
      const bookings = await Booking.find({ vehicle: vehicleId });
      console.log('Bookings found:', bookings);
  
      if (!bookings || bookings.length === 0) {
        return res.status(200).json({ availability: [] });
      }
  
      const availability = bookings.map(booking => ({
        startDate: booking.startDate,
        endDate: booking.endDate
      }));
  
      res.status(200).json({ availability });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };