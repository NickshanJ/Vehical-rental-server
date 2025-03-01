const express = require('express');
const router = express.Router();
const {
  createSupportTicket,
  getSupportTickets,
  getSupportTicketById,
  updateSupportTicket,
  deleteSupportTicket
} = require('../controllers/supportController');
const authenticateToken = require('../middleware/authenticateToken');

// Create support ticket
router.post('/', authenticateToken, createSupportTicket);

// Get all support tickets
router.get('/', authenticateToken, getSupportTickets);

// Get support ticket by ID
router.get('/:id', authenticateToken, getSupportTicketById);

// Update support ticket
router.put('/:id', authenticateToken, updateSupportTicket);

// Delete support ticket
router.delete('/:id', authenticateToken, deleteSupportTicket);

module.exports = router;
