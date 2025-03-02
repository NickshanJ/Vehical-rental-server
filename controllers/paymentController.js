const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const sendEmail = require('../utils/emailService');
const generateInvoice = require('../utils/invoiceService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');
const fs = require('fs');

// Get all payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Handle Stripe checkout session creation
exports.createCheckoutSession = async (req, res) => {
  try {
    const frontendUrl = 'https://online-vehicle-rental.netlify.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Vehicle Rental Payment' },
            unit_amount: req.body.totalAmount * 100, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/thank-you`, 
      cancel_url: `${frontendUrl}/checkout-cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Handle payment success
exports.handlePaymentSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    console.log('Received sessionId:', sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Retrieved session:', session);

    if (session.payment_status === 'paid') {
      const booking = await Booking.findByIdAndUpdate(
        session.metadata.bookingId,
        { status: 'completed' },
        { new: true }
      ).populate('user vehicle');
      console.log('Booking found:', booking);

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found.' });
      }

      // Prepare email details
      const emailSubject = 'Payment Confirmation';
      const emailText = `Thank you for your payment. Your payment details are: ${JSON.stringify(session)}`;

      console.log('Preparing to send email to:', booking.user.email);

      // Send confirmation email
      try {
        await sendEmail(booking.user.email, emailSubject, emailText);
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        return res.status(500).json({ message: 'Error sending email', error: emailError.message });
      }

      console.log(`Payment succeeded for booking ID: ${booking._id}`);
      return res.status(200).json({ message: 'Payment processed successfully!' });
    } else {
      console.log('Payment not completed.');
      return res.status(400).json({ message: 'Payment not completed.' });
    }
  } catch (error) {
    console.error('Error handling payment success:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    res.status(200).json({ message: 'Payment created successfully!' });
  } catch (error) {
    console.error('Error creating payment:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a payment by ID
exports.updatePayment = async (req, res) => {
  try {
    res.status(200).json({ message: 'Payment updated successfully!' });
  } catch (error) {
    console.error('Error updating payment:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a payment by ID
exports.deletePayment = async (req, res) => {
  try {
    res.status(200).json({ message: 'Payment deleted successfully!' });
  } catch (error) {
    console.error('Error deleting payment:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all completed payments
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'Completed' }).populate('user');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments.' });
  }
};