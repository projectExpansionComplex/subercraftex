const express = require('express');
const craftexSustainability = require( '../models/craftexSustainability');
const craftexDesigner = require( '../models/craftexDesigner');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const craftexUser = require('../models/userModel')
const craftexReview = require('../models/craftexReview')
const path = require('path')
const sharp = require('sharp');
const { auth2 } = require('../middleware/authMiddlerware2');
// Multer configuration for file sustainability
const upload4 = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', 'sustainability')); // Save files in 'uploads/products'
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

// 1. POST Route to Create a New Sustainability Content

// POST Route to Create a New Sustainability Content
router.post(
  '/api/craftexsustainability',
  upload4.fields([
    { name: 'image', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('createdBy').notEmpty().withMessage('CreatedBy user ID is required').isMongoId().withMessage('Invalid User ID'),
    body('sustainability_metrics').optional().isObject().withMessage('Sustainability metrics must be an object')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, content, tags, createdBy, sustainability_metrics } = req.body;
      

      const existingUser = await craftexUser.findById(createdBy);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const imageUrl = req.files['image'] ? `/uploads/sustainability/${req.files['image'][0].filename}` : null;
      let thumbnailUrl = null;
      if (req.files['thumbnail']) {
        const thumbnailPath = path.join(__dirname, '..', 'uploads', 'sustainability', req.files['thumbnail'][0].filename);
        const resizedThumbnailPath = thumbnailPath.replace('.jpg', '-resized.jpg');

        // Resize thumbnail using sharp
        await sharp(req.files['thumbnail'][0].path)
          .resize(150, 150, {
            fit: 'inside', // Preserve aspect ratio, fit within 150x150
            withoutEnlargement: true, // Do not enlarge the image if it's smaller than 150x150
          })
          .toFile(resizedThumbnailPath); // Save resized image to a new path


        thumbnailUrl = `/uploads/sustainability/${req.files['thumbnail'][0].filename.replace('.jpg', '-resized.jpg')}`;
      }

      const newSustainability = new craftexSustainability({
        title,
        description,
        imageUrl,
        thumbnail: thumbnailUrl,
        content,
        tags,
        sustainability_metrics,
        createdBy
      });

      const savedSustainability = await newSustainability.save();
      res.status(201).json(savedSustainability);
    } catch (err) {
      console.error('Error creating sustainability content:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);
// 3. PUT Route to Update Sustainability Content with Image Upload
// PUT Route to Update Sustainability Content
router.put(
  '/api/craftexsustainability/:id',
  upload4.fields([
    { name: 'image', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('content').optional().notEmpty().withMessage('Content cannot be empty'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('sustainability_metrics').optional().isObject().withMessage('Sustainability metrics must be an object')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, content, tags, sustainability_metrics } = req.body;
      const sustainability = await craftexSustainability.findById(req.params.id);
      if (!sustainability) {
        return res.status(404).json({ message: 'Sustainability content not found' });
      }

      if (title) sustainability.title = title;
      if (description) sustainability.description = description;
      if (content) sustainability.content = content;
      if (tags) sustainability.tags = tags;
      if (sustainability_metrics) sustainability.sustainability_metrics = sustainability_metrics;

      if (req.files['image']) {
        sustainability.imageUrl = `/uploads/sustainability/${req.files['image'][0].filename}`;
      }
      if (req.files['thumbnail']) {
        const thumbnailPath = path.join(__dirname, '..', 'uploads', 'sustainability', req.files['thumbnail'][0].filename);
        const resizedThumbnailPath = thumbnailPath.replace('.jpg', '-resized.jpg');

         // Resize thumbnail using sharp
         await sharp(req.files['thumbnail'][0].path)
         .resize(150, 150, {
           fit: 'inside', // Preserve aspect ratio, fit within 150x150
           withoutEnlargement: true, // Do not enlarge the image if it's smaller than 150x150
         })
         .toFile(resizedThumbnailPath); // Save resized image to a new path

        sustainability.thumbnail = `/uploads/sustainability/${req.files['thumbnail'][0].filename.replace('.jpg', '-resized.jpg')}`;
      }

      sustainability.updatedAt = Date.now();
      const updatedSustainability = await sustainability.save();
      res.status(200).json(updatedSustainability);
    } catch (err) {
      console.error('Error updating sustainability content:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// 4. GET Route to Fetch All Sustainability Content
router.get('/api/craftexsustainability', async (req, res) => {
  try {
    const sustainabilityContent = await craftexSustainability.find()
      .populate('createdBy', 'name email'); // Populate the user who created the content

    res.status(200).json(sustainabilityContent);
  } catch (err) {
    console.error('Error fetching sustainability content:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 5. GET Route to Fetch a Single Sustainability Content by ID
router.get('/api/craftexsustainability/:id', async (req, res) => {
  try {
    const sustainability = await craftexSustainability.findById(req.params.id)
      .populate('createdBy', 'name email'); // Populate the user who created the content

    if (!sustainability) {
      return res.status(404).json({ message: 'Sustainability content not found' });
    }

    res.status(200).json(sustainability);
  } catch (err) {
    console.error('Error fetching sustainability content:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// 6. DELETE Route to Delete Sustainability Content by ID
router.delete('/api/craftexsustainability/:id', async (req, res) => {
  try {
    const sustainability = await craftexSustainability.findByIdAndDelete(req.params.id);
    if (!sustainability) {
      return res.status(404).json({ message: 'Sustainability content not found' });
    }
    res.status(200).json({ message: 'Sustainability content deleted successfully' });
  } catch (err) {
    console.error('Error deleting sustainability content:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});





module.exports = router