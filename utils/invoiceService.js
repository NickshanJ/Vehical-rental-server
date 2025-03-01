const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateInvoice = (booking, invoicePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(invoicePath);

    doc.pipe(writeStream);

    doc.fontSize(25).text('Booking Invoice', { align: 'center' });

    doc.moveDown();
    doc.fontSize(16).text(`Booking ID: ${booking._id}`);
    doc.fontSize(16).text(`Username: ${booking.user.username}`);
    doc.fontSize(16).text(`Email: ${booking.user.email}`);
    doc.fontSize(16).text(`Vehicle Model: ${booking.vehicle.model}`);
    doc.fontSize(16).text(`Start Date: ${new Date(booking.startDate).toISOString().split('T')[0]}`);
    doc.fontSize(16).text(`End Date: ${new Date(booking.endDate).toISOString().split('T')[0]}`);
    doc.fontSize(16).text(`Total Price: ₹${booking.totalAmount}`);

    doc.end();

    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
};

module.exports = generateInvoice;