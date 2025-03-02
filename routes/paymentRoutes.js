const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  createCheckoutSession,
  handleWebhook, // Ensure this is defined and imported
} = require('../controllers/paymentController');

// Define routes
router.post('/create-checkout-session', createCheckoutSession); // Stripe session creation
router.post('/webhook', handleWebhook); // Stripe webhook handling
router.get('/', authenticateToken, getPayments); // Get all completed payments
router.get('/:id', authenticateToken, getPaymentById); // Get payment by ID
router.put('/:id', authenticateToken, updatePayment); // Update payment by ID
router.delete('/:id', authenticateToken, deletePayment); // Delete payment by ID

module.exports = router;