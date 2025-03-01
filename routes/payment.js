const express = require('express');
const router = express.Router();
const stripe = require('stripe')('sk_test_51Qx6miEOViAAkwnZYBVUwhgUzt3SRrhatvc6WyUNYkXZuSYFv2ksQ3KjJVeLHHs9uOR306MjkSuWzSDQeS0oSltD00BOA4XtaL'); // Replace with your actual Stripe Secret Key

// Stripe Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Test Product', // Replace with your product name
            },
            unit_amount: 5000, // Amount in cents ($50.00)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:5173/thanks', // URL for successful payment
      cancel_url: 'http://localhost:5173/cancel', // URL for canceled payment
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Add additional routes here if needed in the future

module.exports = router;
