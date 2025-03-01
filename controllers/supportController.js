const SupportTicket = require('../models/SupportTicket');

// Create support ticket
exports.createSupportTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;
    const ticket = new SupportTicket({
      user: req.user.userId,
      subject,
      description
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all support tickets
exports.getSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().populate('user');
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get support ticket by ID
exports.getSupportTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate('user');
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update support ticket
exports.updateSupportTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete support ticket
exports.deleteSupportTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Support ticket not found' });
    }
    res.status(200).json({ message: 'Support ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
