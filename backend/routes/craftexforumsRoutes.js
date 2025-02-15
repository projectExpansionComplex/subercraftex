const express = require('express');
const craftexForum = require( '../models/craftexForum');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const craftexUser = require('../models/userModel')
const craftexCustomRequest = require('../models/craftexCustomRequest')
const path = require('path')
const sharp = require('sharp');

// Multer configuration for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', 'products')); // Save files in 'uploads/products'
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const sanitizedFilename = file.originalname.replace(/\s+/g, '_'); // Replace spaces with underscores
      cb(null, uniqueSuffix + '-' + sanitizedFilename); // Unique filename
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept only image files
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});




// POST route to create a new forum topic
router.post(
  '/api/craftexforums',
  [
    // Validation middleware using express-validator
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('user').notEmpty().withMessage('User ID is required'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, user } = req.body;

      // Validate user
      const existingUser = await craftexUser.findById(user);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Create new forum topic
      const forumTopic = new craftexForum({
        title,
        description,
        user,
      });

      // Save forum topic to the database
      const savedForumTopic = await forumTopic.save();

      // Return the saved forum topic
      res.status(201).json(savedForumTopic);
    } catch (err) {
      console.error('Error creating forum topic:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all forum topics
router.get('/api/craftexforums', async (req, res) => {
  try {
    const forumTopics = await craftexForum.find()
      .populate('user', 'name email') // Populate user details
      .populate('comments.user', 'name'); // Populate commenter details
    res.status(200).json(forumTopics);
  } catch (err) {
    console.error('Error fetching forum topics:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single forum topic by ID
router.get('/api/craftexforums/:id', async (req, res) => {
  try {
    const forumTopic = await craftexForum.findById(req.params.id)
      .populate('user', 'name email') // Populate user details
      .populate('comments.user', 'name'); // Populate commenter details
    if (!forumTopic) {
      return res.status(404).json({ message: 'Forum topic not found' });
    }
    res.status(200).json(forumTopic);
  } catch (err) {
    console.error('Error fetching forum topic:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update a forum topic by ID
router.put(
  '/api/craftexforums/:id',
  [
    // Validation middleware using express-validator
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description } = req.body;

      // Find the forum topic by ID
      const forumTopic = await craftexForum.findById(req.params.id);
      if (!forumTopic) {
        return res.status(404).json({ message: 'Forum topic not found' });
      }

      // Update fields if provided
      if (title) forumTopic.title = title;
      if (description) forumTopic.description = description;

      // Save updated forum topic
      const updatedForumTopic = await forumTopic.save();

      // Return the updated forum topic
      res.status(200).json(updatedForumTopic);
    } catch (err) {
      console.error('Error updating forum topic:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete a forum topic by ID
router.delete('/api/craftexforums/:id', async (req, res) => {
  try {
    const forumTopic = await craftexForum.findByIdAndDelete(req.params.id);
    if (!forumTopic) {
      return res.status(404).json({ message: 'Forum topic not found' });
    }
    res.status(200).json({ message: 'Forum topic deleted successfully' });
  } catch (err) {
    console.error('Error deleting forum topic:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST route to add a comment to a forum topic
router.post(
  '/api/craftexforums/:id/comments',
  [
    // Validation middleware using express-validator
    body('user').notEmpty().withMessage('User ID is required'),
    body('text').notEmpty().withMessage('Comment text is required'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, text } = req.body;

      // Validate user
      const existingUser = await craftexUser.findById(user);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Find the forum topic by ID
      const forumTopic = await craftexForum.findById(req.params.id);
      if (!forumTopic) {
        return res.status(404).json({ message: 'Forum topic not found' });
      }

      // Add the comment
      forumTopic.comments.push({
        user,
        text,
      });

      // Save updated forum topic
      const updatedForumTopic = await forumTopic.save();

      // Return the updated forum topic
      res.status(201).json(updatedForumTopic);
    } catch (err) {
      console.error('Error adding comment:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);




module.exports = router