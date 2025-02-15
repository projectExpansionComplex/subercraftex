const express = require('express');
const craftexInspiration = require( '../models/craftexInspiration');
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




// POST route to create a new inspiration post
router.post(
  '/api/craftexinspirations',
  upload3.single('image'), // Single file upload for the inspiration image
  [
    // Validation middleware using express-validator
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('createdBy').notEmpty().withMessage('User ID is required'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, createdBy } = req.body;

      // Validate user
      const existingUser = await craftexUser.findById(createdBy);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Get file path for the uploaded image
      const imageUrl = req.file
        ? `/uploads/inspirations/${req.file.filename}`
        : null;

      // Create new inspiration post
      const inspiration = new craftexInspiration({
        title,
        description,
        imageUrl,
        createdBy,
      });

      // Save inspiration post to the database
      const savedInspiration = await inspiration.save();

      // Return the saved inspiration post
      res.status(201).json(savedInspiration);
    } catch (err) {
      console.error('Error creating inspiration post:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all inspiration posts
router.get('/api/craftexinspirations', async (req, res) => {
  try {
    const inspirations = await craftexInspiration.find()
      .populate('createdBy', 'name email'); // Populate user details
    res.status(200).json(inspirations);
  } catch (err) {
    console.error('Error fetching inspiration posts:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single inspiration post by ID
router.get('/api/craftexinspirations/:id', async (req, res) => {
  try {
    const inspiration = await craftexInspiration.findById(req.params.id)
      .populate('createdBy', 'name email'); // Populate user details
    if (!inspiration) {
      return res.status(404).json({ message: 'Inspiration post not found' });
    }
    res.status(200).json(inspiration);
  } catch (err) {
    console.error('Error fetching inspiration post:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update an inspiration post by ID
router.put(
  '/api/craftexinspirations/:id',
  upload3.single('image'), // Single file upload for the inspiration image
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

      // Find the inspiration post by ID
      const inspiration = await craftexInspiration.findById(req.params.id);
      if (!inspiration) {
        return res.status(404).json({ message: 'Inspiration post not found' });
      }

      // Update fields if provided
      if (title) inspiration.title = title;
      if (description) inspiration.description = description;

      // Update image if provided
      if (req.file) {
        inspiration.imageUrl = `/uploads/inspirations/${req.file.filename}`;
      }

      // Save updated inspiration post
      const updatedInspiration = await inspiration.save();

      // Return the updated inspiration post
      res.status(200).json(updatedInspiration);
    } catch (err) {
      console.error('Error updating inspiration post:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete an inspiration post by ID
router.delete('/api/craftexinspirations/:id', async (req, res) => {
  try {
    const inspiration = await craftexInspiration.findByIdAndDelete(req.params.id);
    if (!inspiration) {
      return res.status(404).json({ message: 'Inspiration post not found' });
    }
    res.status(200).json({ message: 'Inspiration post deleted successfully' });
  } catch (err) {
    console.error('Error deleting inspiration post:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});





module.exports = router