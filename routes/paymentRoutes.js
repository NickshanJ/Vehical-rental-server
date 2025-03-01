const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  handlePaymentSuccess,
  createCheckoutSession,
} = require('../controllers/paymentController');

// Define routes
router.post('/create-checkout-session', createCheckoutSession); // Stripe session creation
router.post('/payment-success', authenticateToken, handlePaymentSuccess); // Payment success handling
router.get('/', authenticateToken, getPayments); // Get all completed payments
router.get('/:id', authenticateToken, getPaymentById); // Get payment by ID

module.exports = router;