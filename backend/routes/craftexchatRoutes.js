const express = require('express');
const router = express.Router();
const Chat = require('../models/craftexchatModel');
const { body, validationResult } = require('express-validator');

// POST route to create a new chat session
router.post(
  '/api/chats',
  [
    body('participants').isArray({ min: 2 }).withMessage('At least two participants are required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { participants } = req.body;

      // Create a new chat session
      const chat = new Chat({
        participants,
      });

      await chat.save();

      res.status(201).json({ message: 'Chat session created successfully', chat });
    } catch (err) {
      console.error('Error creating chat session:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch chat sessions for a user
router.get('/api/chats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name avatar')
      .populate('messages.sender', 'name avatar');

    res.status(200).json(chats);
  } catch (err) {
    console.error('Error fetching chat sessions:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;