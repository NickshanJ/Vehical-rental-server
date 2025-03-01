const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Mock Data
const queries = [
  { id: 1, user: 'Nickshan', query: 'How do I reset my password?', reply: null },
  { id: 2, user: 'John Doe', query: 'Where can I find the terms and conditions?', reply: null },
];

// Fetch all queries
router.get('/queries', (req, res) => {
  res.json(queries);
});

// Post a reply
router.post('/queries/:id/reply', [check('reply', 'Reply is required').not().isEmpty()], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const query = queries.find((q) => q.id === parseInt(req.params.id));
  if (query) {
    query.reply = req.body.reply;
    res.json(query);
  } else {
    res.status(404).json({ msg: 'Query not found' });
  }
});

module.exports = router;