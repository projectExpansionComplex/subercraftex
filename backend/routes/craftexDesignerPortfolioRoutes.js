const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');

// Import models
const DesignerPortfolio = require('../models/craftexDesignerPortfolio');
const craftexDesigner = require('../models/craftexDesigner');

// Multer configuration for portfolio uploads
const portfolioUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, path.join(__dirname, '..', 'uploads', 'portfolio', 'images')); // Save images in 'uploads/portfolio/images'
      } else if (file.mimetype.startsWith('video/')) {
        cb(null, path.join(__dirname, '..', 'uploads', 'portfolio', 'videos')); // Save videos in 'uploads/portfolio/videos'
      } else {
        cb(new Error('Unsupported file type'), false);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const sanitizedFilename = file.originalname.replace(/\s+/g, '_'); // Replace spaces with underscores
      cb(null, uniqueSuffix + '-' + sanitizedFilename); // Unique filename
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true); // Accept only image and video files
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  },
});

//------------------------------------------------------
// CRUD Operations for DesignerPortfolio
//------------------------------------------------------

// 1. Create a Portfolio Item
router.post(
  '/api/craftexdesigners/:id/portfolio',
  portfolioUpload.fields([
    { name: 'images', maxCount: 5 }, // Allow up to 5 images
    { name: 'video', maxCount: 1 }, // Allow 1 video
  ]),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('youtubeUrl').optional().isURL().withMessage('Invalid YouTube URL'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, youtubeUrl, tags } = req.body;

      // Get file paths for the uploaded files
      const imageUrls = req.files['images']
        ? req.files['images'].map(file => `/uploads/portfolio/images/${file.filename}`)
        : [];
      const videoUrl = req.files['video']
        ? `/uploads/portfolio/videos/${req.files['video'][0].filename}`
        : null;

      // Create a new portfolio item
      const portfolioItem = new DesignerPortfolio({
        designer: req.params.id,
        title,
        description,
        images: imageUrls,
        videoUrl,
        youtubeUrl,
        tags: tags || [],
      });

      // Save the portfolio item
      const savedPortfolioItem = await portfolioItem.save();

      // Add the portfolio item to the designer's portfolio
      const designer = await craftexDesigner.findById(req.params.id);
      if (!designer) {
        return res.status(404).json({ message: 'Designer not found' });
      }
      console.log(designer.portfolio);
      designer.portfolio.push(savedPortfolioItem._id);
     
      await designer.save();

      res.status(201).json(savedPortfolioItem);
    } catch (err) {
      console.error('Error creating portfolio item:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// 2. Get All Portfolio Items for a Designer
router.get('/api/craftexdesigners/:id/portfolio', async (req, res) => {
  try {
    const designer = await craftexDesigner.findById(req.params.id).populate('portfolio');
    if (!designer) {
      return res.status(404).json({ message: 'Designer not found' });
    }
    res.status(200).json(designer.portfolio);
  } catch (err) {
    console.error('Error fetching portfolio items:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 3. Get a Single Portfolio Item by ID
router.get('/api/portfolio/:portfolioId', async (req, res) => {
  try {
    const portfolioItem = await DesignerPortfolio.findById(req.params.portfolioId);
    if (!portfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    res.status(200).json(portfolioItem);
  } catch (err) {
    console.error('Error fetching portfolio item:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 4. Update a Portfolio Item
router.put(
  '/api/portfolio/:portfolioId',
  portfolioUpload.fields([
    { name: 'images', maxCount: 5 }, // Allow up to 5 images
    { name: 'video', maxCount: 1 }, // Allow 1 video
  ]),
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('youtubeUrl').optional().isURL().withMessage('Invalid YouTube URL'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, youtubeUrl, tags } = req.body;

      // Find the portfolio item by ID
      const portfolioItem = await DesignerPortfolio.findById(req.params.portfolioId);
      if (!portfolioItem) {
        return res.status(404).json({ message: 'Portfolio item not found' });
      }

      // Update fields if provided
      if (title) portfolioItem.title = title;
      if (description) portfolioItem.description = description;
      if (youtubeUrl) portfolioItem.youtubeUrl = youtubeUrl;
      if (tags) portfolioItem.tags = tags;

      // Update images if provided
      if (req.files['images']) {
        portfolioItem.images = req.files['images'].map(file => `/uploads/portfolio/images/${file.filename}`);
      }

      // Update video if provided
      if (req.files['video']) {
        portfolioItem.videoUrl = `/uploads/portfolio/videos/${req.files['video'][0].filename}`;
      }

      // Save updated portfolio item
      const updatedPortfolioItem = await portfolioItem.save();

      res.status(200).json(updatedPortfolioItem);
    } catch (err) {
      console.error('Error updating portfolio item:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// 5. Delete a Portfolio Item
router.delete('/api/portfolio/:portfolioId', async (req, res) => {
  try {
    // Find and delete the portfolio item
    const portfolioItem = await DesignerPortfolio.findByIdAndDelete(req.params.portfolioId);
    if (!portfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    // Remove the portfolio item from the designer's portfolio
    const designer = await craftexDesigner.findById(portfolioItem.designer);
    if (designer) {
      designer.portfolio = designer.portfolio.filter(item => item.toString() !== req.params.portfolioId);
      await designer.save();
    }

    res.status(200).json({ message: 'Portfolio item deleted successfully' });
  } catch (err) {
    console.error('Error deleting portfolio item:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;