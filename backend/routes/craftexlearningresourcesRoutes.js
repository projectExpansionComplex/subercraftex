const express = require('express');
const craftexLearningResource = require( '../models/craftexLearningResource');
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




// POST route to create a new learning resource
router.post(
  '/api/craftexlearningresources',
  [
    // Validation middleware using express-validator
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('type').isIn(['article', 'video', 'tutorial']).withMessage('Type must be one of: article, video, tutorial'),
    body('url').notEmpty().withMessage('URL is required'),
    body('createdBy').notEmpty().withMessage('User ID is required'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, type, url, createdBy } = req.body;

      // Validate user
      const existingUser = await craftexUser.findById(createdBy);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Create new learning resource
      const learningResource = new craftexLearningResource({
        title,
        description,
        type,
        url,
        createdBy,
      });

      // Save learning resource to the database
      const savedLearningResource = await learningResource.save();

      // Return the saved learning resource
      res.status(201).json(savedLearningResource);
    } catch (err) {
      console.error('Error creating learning resource:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all learning resources
router.get('/api/craftexlearningresources', async (req, res) => {
  try {
    const learningResources = await craftexLearningResource.find()
      .populate('createdBy', 'name email'); // Populate user details
    res.status(200).json(learningResources);
  } catch (err) {
    console.error('Error fetching learning resources:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single learning resource by ID
router.get('/api/craftexlearningresources/:id', async (req, res) => {
  try {
    const learningResource = await craftexLearningResource.findById(req.params.id)
      .populate('createdBy', 'name email'); // Populate user details
    if (!learningResource) {
      return res.status(404).json({ message: 'Learning resource not found' });
    }
    res.status(200).json(learningResource);
  } catch (err) {
    console.error('Error fetching learning resource:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update a learning resource by ID
router.put(
  '/api/craftexlearningresources/:id',
  [
    // Validation middleware using express-validator
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('type').optional().isIn(['article', 'video', 'tutorial']).withMessage('Type must be one of: article, video, tutorial'),
    body('url').optional().notEmpty().withMessage('URL cannot be empty'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, type, url } = req.body;

      // Find the learning resource by ID
      const learningResource = await craftexLearningResource.findById(req.params.id);
      if (!learningResource) {
        return res.status(404).json({ message: 'Learning resource not found' });
      }

      // Update fields if provided
      if (title) learningResource.title = title;
      if (description) learningResource.description = description;
      if (type) learningResource.type = type;
      if (url) learningResource.url = url;

      // Save updated learning resource
      const updatedLearningResource = await learningResource.save();

      // Return the updated learning resource
      res.status(200).json(updatedLearningResource);
    } catch (err) {
      console.error('Error updating learning resource:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete a learning resource by ID
router.delete('/api/craftexlearningresources/:id', async (req, res) => {
  try {
    const learningResource = await craftexLearningResource.findByIdAndDelete(req.params.id);
    if (!learningResource) {
      return res.status(404).json({ message: 'Learning resource not found' });
    }
    res.status(200).json({ message: 'Learning resource deleted successfully' });
  } catch (err) {
    console.error('Error deleting learning resource:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});





module.exports = router