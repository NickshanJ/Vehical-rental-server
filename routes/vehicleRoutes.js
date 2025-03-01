const express = require('express');
const router = express.Router();
const {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleAvailability
} = require('../controllers/vehicleController');
const authenticateToken = require('../middleware/authenticateToken');
const { searchVehicles } = require('../controllers/vehicleController');

// Get all vehicles
router.get('/', getAllVehicles);

// Get vehicle by ID
router.get('/:id', getVehicleById);

// Create new vehicle
router.post('/', authenticateToken, createVehicle);

// Update vehicle
router.put('/:id', authenticateToken, updateVehicle);

// Delete vehicle
router.delete('/:id', authenticateToken, deleteVehicle);

// Add search route
router.get('/search', searchVehicles); 

// Route to get the availability for a specific vehicle
router.get('/:id/availability', getVehicleAvailability);

module.exports = router;