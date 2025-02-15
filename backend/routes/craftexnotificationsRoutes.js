const express = require('express');
const craftexNotification = require( '../models/craftexNotification');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const craftexUser = require('../models/userModel')
const craftexCustomRequest = require('../models/craftexCustomRequest')
const path = require('path')
const sharp = require('sharp');
// Multer configuration for file blogpost
const upload3 = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', 'inspirations')); // Save files in 'uploads/products'
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





// POST route to create a new notification
router.post(
  '/api/craftexnotifications',
  [
    // Validation middleware using express-validator
    body('user').notEmpty().withMessage('User ID is required'),
    body('type').isIn(['success', 'error', 'info']).withMessage('Type must be one of: success, error, info'),
    body('message').notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, type, message } = req.body;

      // Validate user
      const existingUser = await craftexUser.findById(user);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Create new notification
      const notification = new craftexNotification({
        user,
        type,
        message,
      });

      // Save notification to the database
      const savedNotification = await notification.save();

      // Return the saved notification
      res.status(201).json(savedNotification);
    } catch (err) {
      console.error('Error creating notification:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all notifications for a user
router.get('/api/craftexnotifications/:userId', async (req, res) => {
  try {
    const notifications = await craftexNotification.find({ user: req.params.userId })
      .populate('user', 'name email'); // Populate user details
    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to mark a notification as read
router.put(
  '/api/craftexnotifications/:id/read',
  async (req, res) => {
    try {
      // Find the notification by ID
      const notification = await craftexNotification.findById(req.params.id);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      // Mark the notification as read
      notification.isRead = true;

      // Save updated notification
      const updatedNotification = await notification.save();

      // Return the updated notification
      res.status(200).json(updatedNotification);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete a notification by ID
router.delete('/api/craftexnotifications/:id', async (req, res) => {
  try {
    const notification = await craftexNotification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});




module.exports = router