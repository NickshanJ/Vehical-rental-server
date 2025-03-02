router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    console.log('Received webhook event:', req.body); // Log the received event body
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('Webhook event verified:', event); // Log the verified event
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment Intent succeeded:', paymentIntent);

      const { vehicle, startDate, endDate, totalAmount, userId } = paymentIntent.metadata;

      try {
        const booking = new Booking({
          user: userId,
          vehicle,
          startDate,
          endDate,
          totalAmount,
        });
        await booking.save();
        console.log('Booking saved:', booking);

        const rentalHistory = new RentalHistory({
          user: userId,
          vehicle,
          startDate,
          endDate,
          totalAmount,
        });
        await rentalHistory.save();
        console.log('Rental history updated:', rentalHistory);

        const populatedBooking = await Booking.findById(booking._id)
          .populate({ path: 'user', select: 'username email' })
          .populate({ path: 'vehicle', select: 'model' });
        console.log('Populated booking:', populatedBooking);

        const invoicesDir = path.join(__dirname, '../invoices');
        if (!fs.existsSync(invoicesDir)) {
          fs.mkdirSync(invoicesDir);
        }

        const invoicePath = path.join(invoicesDir, `invoice_${booking._id}.pdf`);
        console.log(`Generating invoice for booking ID: ${booking._id}`);
        try {
          await generateInvoice(populatedBooking, invoicePath);
          console.log(`Invoice successfully generated at: ${invoicePath}`);
        } catch (error) {
          console.error('Error generating invoice:', error.message);
          throw new Error('Failed to generate invoice.');
        }

        if (!fs.existsSync(invoicePath)) {
          console.error(`Invoice file not found at: ${invoicePath}`);
          throw new Error(`Invoice file not found at: ${invoicePath}`);
        }

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
        console.error('Error handling payment intent:', error.message);
        throw new Error('Failed to handle payment intent.');
      }
      break;

    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout session completed:', session);

      try {
        const booking = await Booking.findByIdAndUpdate(
          session.metadata.bookingId,
          { status: 'completed' },
          { new: true }
        ).populate('user vehicle');

        if (!booking) {
          return res.status(404).json({ message: 'Booking not found.' });
        }

        // Prepare email details
        const emailSubject = 'Payment Confirmation';
        const emailText = `Thank you for your payment. Your payment details are: ${JSON.stringify(session)}`;

        console.log('Sending email to:', booking.user.email);

        // Send confirmation email
        await sendEmail(booking.user.email, emailSubject, emailText);
        console.log(`Email sent successfully to ${booking.user.email}`);
      } catch (error) {
        console.error('Error handling checkout session:', error.message);
        throw new Error('Failed to handle checkout session.');
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;