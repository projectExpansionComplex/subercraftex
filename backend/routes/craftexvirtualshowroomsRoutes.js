const express = require('express');
const craftexVirtualShowroom = require( '../models/craftexVirtualShowroom');
const craftexDesigner = require( '../models/craftexDesigner');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const craftexUser = require('../models/userModel')
const craftexReview = require('../models/craftexReview')
const path = require('path')
const sharp = require('sharp');
// Multer configuration for file virtual room
const upload5 = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', 'virtual-showrooms')); // Save files in 'uploads/products'
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

// POST Route to Create a New Review


router.post(
  '/api/craftexvirtualshowrooms',
  upload5.array('images', 10), // Allow up to 10 images
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('createdBy').notEmpty().withMessage('CreatedBy user ID is required').isMongoId().withMessage('Invalid User ID'),
  ],
  async (req, res) => {
    try {
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

      // Get file paths
      const images = req.files.map((file) => `/uploads/virtual-showrooms/${file.filename}`);

      const newVirtualShowroom = new craftexVirtualShowroom({
        title,
        description,
        images,
        createdBy,
      });

      const savedVirtualShowroom = await newVirtualShowroom.save();
      res.status(201).json(savedVirtualShowroom);
    } catch (err) {
      console.error('Error creating virtual showroom:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// 3. PUT Route to Update a Virtual Showroom with Image Uploads
router.put(
  '/api/craftexvirtualshowrooms/:id',
  upload5.array('images', 10), // Allow up to 10 images
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description } = req.body;

      const virtualShowroom = await craftexVirtualShowroom.findById(req.params.id);
      if (!virtualShowroom) {
        return res.status(404).json({ message: 'Virtual showroom not found' });
      }

      // Update fields if provided
      if (title) virtualShowroom.title = title;
      if (description) virtualShowroom.description = description;

      // Handle image updates
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => `/uploads/virtual-showrooms/${file.filename}`);
        virtualShowroom.images = [...virtualShowroom.images, ...newImages]; // Append new images
      }

      virtualShowroom.updatedAt = Date.now(); // Update the timestamp

      const updatedVirtualShowroom = await virtualShowroom.save();
      res.status(200).json(updatedVirtualShowroom);
    } catch (err) {
      console.error('Error updating virtual showroom:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// 4. GET Route to Fetch All Virtual Showrooms
router.get('/api/craftexvirtualshowrooms', async (req, res) => {
  try {
    const virtualShowrooms = await craftexVirtualShowroom.find()
      .populate('createdBy', 'name email'); // Populate the user who created the showroom

    res.status(200).json(virtualShowrooms);
  } catch (err) {
    console.error('Error fetching virtual showrooms:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// 5. GET Route to Fetch a Single Virtual Showroom by ID
router.get('/api/craftexvirtualshowrooms/:id', async (req, res) => {
  try {
    const virtualShowroom = await craftexVirtualShowroom.findById(req.params.id)
      .populate('createdBy', 'name email'); // Populate the user who created the showroom

    if (!virtualShowroom) {
      return res.status(404).json({ message: 'Virtual showroom not found' });
    }

    res.status(200).json(virtualShowroom);
  } catch (err) {
    console.error('Error fetching virtual showroom:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// . DELETE Route to Delete a Virtual Showroom by ID
router.delete('/api/craftexvirtualshowrooms/:id', async (req, res) => {
  try {
    const virtualShowroom = await craftexVirtualShowroom.findByIdAndDelete(req.params.id);
    if (!virtualShowroom) {
      return res.status(404).json({ message: 'Virtual showroom not found' });
    }
    res.status(200).json({ message: 'Virtual showroom deleted successfully' });
  } catch (err) {
    console.error('Error deleting virtual showroom:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 7. DELETE Route to Remove Specific Images from a Virtual Showroom
router.delete('/api/craftexvirtualshowrooms/:id/images', async (req, res) => {
  try {
    const { imageUrl } = req.body; // URL of the image to delete

    const virtualShowroom = await craftexVirtualShowroom.findById(req.params.id);
    if (!virtualShowroom) {
      return res.status(404).json({ message: 'Virtual showroom not found' });
    }

    // Remove the image from the array
    virtualShowroom.images = virtualShowroom.images.filter((image) => image !== imageUrl);

    await virtualShowroom.save();
    res.status(200).json({ message: 'Image removed successfully', virtualShowroom });
  } catch (err) {
    console.error('Error removing image from virtual showroom:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});






module.exports = router