const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Use the Stripe secret key from .env
const Booking = require('../models/Booking');
const RentalHistory = require('../models/RentalHistory');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const generateInvoice = require('../utils/invoiceService');
const fs = require('fs');
const path = require('path');

// Create booking after payment confirmation
const paymentConfirmation = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Verify the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not confirmed' });
    }

    const { vehicle, startDate, endDate, totalAmount, userId } = paymentIntent.metadata;

    // Create and save the booking
    const booking = new Booking({
      user: userId,
      vehicle,
      startDate,
      endDate,
      totalAmount,
    });
    await booking.save();
    console.log('Booking saved:', booking);

    // Add booking to user's bookings array
    await User.findByIdAndUpdate(userId, { $push: { bookings: booking._id } });

    // Update rental history
    const rentalHistory = new RentalHistory({
      user: userId,
      vehicle,
      startDate,
      endDate,
      totalAmount,
    });
    await rentalHistory.save();
    console.log('Rental history updated:', rentalHistory);

    // Populate user and vehicle fields
    const populatedBooking = await Booking.findById(booking._id)
      .populate({ path: 'user', select: 'username email' })
      .populate({ path: 'vehicle', select: 'model' });
    console.log('Populated booking:', populatedBooking);

    // Ensure 'invoices/' directory exists
    const invoicesDir = path.join(__dirname, '../invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir);
    }

    // Generate the invoice
    const invoicePath = path.join(invoicesDir, `invoice_${booking._id}.pdf`);
    console.log(`Generating invoice for booking ID: ${booking._id}`);
    try {
      await generateInvoice(populatedBooking, invoicePath);
      console.log(`Invoice successfully generated at: ${invoicePath}`);
    } catch (error) {
      console.error('Error generating invoice:', error.message);
      throw new Error('Failed to generate invoice.');
    }

    // Verify the invoice exists before sending email
    if (!fs.existsSync(invoicePath)) {
      console.error(`Invoice file not found at: ${invoicePath}`);
      throw new Error(`Invoice file not found at: ${invoicePath}`);
    }

    // Send confirmation email with the invoice attached
    const emailText = `
      Dear ${populatedBooking.user.username},

      Your booking for the vehicle "${populatedBooking.vehicle.model}" has been successfully confirmed!

      Booking Details:
      - Start Date: ${new Date(booking.startDate).toISOString().split('T')[0]}
      - End Date: ${new Date(booking.endDate).toISOString().split('T')[0]}
      - Total Price: ₹${booking.totalAmount}

      Please find your invoice attached.

      Thank you for choosing our service!
    `;

    try {
      console.log('Sending email to:', populatedBooking.user.email);
      await sendEmail(
        populatedBooking.user.email,
        'Booking Confirmation and Invoice',
        emailText,
        [
          {
            filename: `invoice_${booking._id}.pdf`,
            path: invoicePath,
          },
        ]
      );
      console.log(`Email sent successfully to ${populatedBooking.user.email}`);
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw new Error('Failed to send email with invoice.');
    }

    res.status(201).json({
      message: 'Booking successfully created, confirmation email sent, and invoice generated.',
      booking,
      invoicePath, // Include path for debugging
    });
  } catch (error) {
    console.error('Error creating booking:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Other exported functions
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user vehicle');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user vehicle');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId }).populate('vehicle').sort({ startDate: -1 });
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found' });
    }
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  paymentConfirmation,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getUserBookings,
  createBooking: paymentConfirmation // or other function if needed
};