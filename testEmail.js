const sendEmail = require('./utils/emailService');
require('dotenv').config(); // Ensure dotenv is configured

const testSendEmail = async () => {
  try {
    await sendEmail(
      'johnnickshan9114@gmail.com',
      'Test Email',
      'This is a test email.',
      []
    );
    console.log('Test email sent successfully.');
  } catch (error) {
    console.error('Error sending test email:', error);
  }
};

testSendEmail();