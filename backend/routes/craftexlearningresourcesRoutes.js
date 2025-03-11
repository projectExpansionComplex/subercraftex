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
      cb(null, path.join(__dirname, '..', 'uploads', 'educational-resources')); // Save files in 'uploads/educational-resources'
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const sanitizedFilename = file.originalname.replace(/\s+/g, '_'); // Replace spaces with underscores
      cb(null, uniqueSuffix + '-' + sanitizedFilename); // Unique filename
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true); // Accept only image and video files
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
});


// POST route to create a new learning resource
router.post(
  '/api/craftexlearningresources',
  upload3.fields([
    { name: 'images', maxCount: 5 }, // Allow up to 5 images
    { name: 'thumbnail', maxCount: 1 }, // Thumbnail
    { name: 'videoFile', maxCount: 1 }, // Uploaded video file
  ]),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('type').isIn(['article', 'video', 'tutorial']).withMessage('Type must be one of: article, video, tutorial'),
    body('url').optional(), // Optional for non-video resources
    body('videoType')
      .optional() // Make videoType optional
      .custom((value, { req }) => {
        if (req.body.type === 'video' && !['uploaded', 'youtube'].includes(value)) {
          throw new Error('Video type must be one of: uploaded, youtube');
        }
        return true;
      }),
    body('videoUrl')
      .optional() // Make videoUrl optional
      .custom((value, { req }) => {
        if (req.body.type === 'video' && req.body.videoType === 'youtube' && !value) {
          throw new Error('YouTube URL is required for YouTube videos');
        }
        return true;
      }),
    body('videoFile')
      .optional() // Make videoFile optional
      .custom((value, { req }) => {
        if (req.body.type === 'video' && req.body.videoType === 'uploaded' && !value) {
          throw new Error('Video file is required for uploaded videos');
        }
        return true;
      }),
    body('thumbnail').optional(), // Optional thumbnail
    body('images').optional(), // Optional images
    body('category').notEmpty().withMessage('Category ID is required'), // Category is required
    body('skill_level').optional(), // Optional skill level
    body('createdBy').notEmpty().withMessage('User ID is required'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, type, url, videoType, videoUrl, category, skill_level, createdBy } = req.body;

      // Validate user
      const existingUser = await craftexUser.findById(createdBy);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Validate category
      const existingCategory = await craftexTutorialCategory.findById(category);
      if (!existingCategory) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      // Validate skill level (if provided)
      let existingSkillLevel = null;
      if (skill_level) {
        existingSkillLevel = await craftexSkillLevel.findById(skill_level);
        if (!existingSkillLevel) {
          return res.status(400).json({ message: 'Invalid skill level ID' });
        }
      }

      // Validate video type
      if (type === 'video') {
        if (videoType === 'youtube' && !videoUrl) {
          return res.status(400).json({ message: 'YouTube URL is required for YouTube videos' });
        }
        if (videoType === 'uploaded' && !req.files['videoFile']) {
          return res.status(400).json({ message: 'Video file is required for uploaded videos' });
        }
      }

      // Process multiple images
      const imageUrls = req.files['images']
        ? req.files['images'].map(file => `/uploads/educational-resources/${file.filename}`)
        : [];

      let thumbnailUrl = null;
      if (req.files['thumbnail']) {
        const thumbnailPath = path.join(
          __dirname,
          '..',
          'uploads',
          'educational-resources',
          req.files['thumbnail'][0].filename
        );
        const resizedThumbnailPath = thumbnailPath.replace('.jpg', '-resized.jpg'); // New path for resized image

        // Resize thumbnail using sharp
        await sharp(req.files['thumbnail'][0].path)
          .resize(150, 150, {
            fit: 'inside', // Preserve aspect ratio, fit within 150x150
            withoutEnlargement: true, // Do not enlarge the image if it's smaller than 150x150
          })
          .toFile(resizedThumbnailPath); // Save resized image to a new path

        thumbnailUrl = `/uploads/educational-resources/${req.files['thumbnail'][0].filename.replace(
          '.jpg',
          '-resized.jpg'
        )}`;
      }

      // Process uploaded video file
      let videoFileUrl = null;
      if (req.files['videoFile']) {
        videoFileUrl = `/uploads/educational-resources/${req.files['videoFile'][0].filename}`;
      }

      // Create new learning resource
      const learningResource = new craftexLearningResource({
        title,
        description,
        type,
        url: type === 'video' && videoType === 'youtube' ? videoUrl : url, // Use videoUrl for YouTube videos, otherwise use url
        videoType: type === 'video' ? videoType : undefined, // Set videoType only for video resources
        videoUrl: type === 'video' && videoType === 'youtube' ? videoUrl : undefined, // Set videoUrl only for YouTube videos
        videoFile: type === 'video' && videoType === 'uploaded' ? videoFileUrl : undefined, // Set videoFile only for uploaded videos
        thumbnail: thumbnailUrl, // Save thumbnail URL
        images: imageUrls, // Save array of image URLs
        category, // Reference to the tutorial category
        skill_level: existingSkillLevel ? existingSkillLevel._id : undefined, // Reference to the skill level (if valid)
        createdBy,
      });

      // Save learning resource to the database
      const savedLearningResource = await learningResource.save();

      // Add the learning resource to the category's learningResources array
      existingCategory.learningResources.push(savedLearningResource._id);
      await existingCategory.save();

      // Return the saved learning resource
      res.status(201).json(savedLearningResource);
    } catch (err) {
      console.error('Error creating learning resource:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);
router.get('/api/educational-resources', async (req, res) => {
  try {
    const { category, skill_level, page = 1, limit = 12, search } = req.query;

    // Build the query object
    const query = {};
    if (category && category !== 'all') query.category = category;
    if (skill_level && skill_level !== 'all') query.skill_level = skill_level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch resources with filtering, sorting, and pagination
    const resources = await craftexLearningResource.find(query)
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count of resources (for pagination metadata)
    const totalCount = await craftexLearningResource.countDocuments(query);

    // Send response with resources and pagination metadata
    res.status(200).json({
      success: true,
      total_count: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      resources,
    });
  } catch (err) {
    console.error('Error fetching learning resources:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/api/educational-resources/:id/rate', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, userId } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Find the resource
    const resource = await craftexLearningResource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Add or update the user's rating
    const existingRatingIndex = resource.ratings.findIndex(r => r.user.toString() === userId);
    if (existingRatingIndex >= 0) {
      resource.ratings[existingRatingIndex].score = rating;
    } else {
      resource.ratings.push({ user: userId, score: rating });
    }

    // Calculate the average rating
    const totalRatings = resource.ratings.reduce((sum, r) => sum + r.score, 0);
    resource.rating = totalRatings / resource.ratings.length;

    // Save the updated resource
    await resource.save();

    res.status(200).json({ success: true, message: 'Rating submitted successfully' });
  } catch (err) {
    console.error('Error rating resource:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/api/educational-resources/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, userId } = req.body;

    // Validate progress
    if (progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be between 0 and 100' });
    }

    // Find the resource
    const resource = await craftexLearningResource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Update user progress
    resource.user_progress = { user: userId, progress };

    // Save the updated resource
    await resource.save();

    res.status(200).json({ success: true, message: 'Progress updated successfully' });
  } catch (err) {
    console.error('Error updating progress:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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
  upload3.fields([
    { name: 'images', maxCount: 5 }, // Allow up to 5 images
    { name: 'thumbnail', maxCount: 1 }, // Thumbnail
    { name: 'videoFile', maxCount: 1 }, // Uploaded video file
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, type, url, videoType, videoUrl, category, skill_level } = req.body;

      // Find the learning resource by ID
      const learningResource = await craftexLearningResource.findById(id);
      if (!learningResource) {
        return res.status(404).json({ message: 'Learning resource not found' });
      }

      // Validate video type
      if (type === 'video') {
        if (videoType === 'youtube' && !videoUrl) {
          return res.status(400).json({ message: 'YouTube URL is required for YouTube videos' });
        }
        if (videoType === 'uploaded' && !req.files['videoFile']) {
          return res.status(400).json({ message: 'Video file is required for uploaded videos' });
        }
      }

      // Process multiple images
      if (req.files['images']) {
        learningResource.images = req.files['images'].map(
          file => `/uploads/educational-resources/${file.filename}`
        );
      }

      // Process thumbnail
      if (req.files['thumbnail']) {
        const thumbnailPath = path.join(
          __dirname,
          '..',
          'uploads',
          'educational-resources',
          req.files['thumbnail'][0].filename
        );
        const resizedThumbnailPath = thumbnailPath.replace('.jpg', '-resized.jpg'); // New path for resized image

        // Resize thumbnail using sharp
        await sharp(req.files['thumbnail'][0].path)
          .resize(150, 150, {
            fit: 'inside', // Preserve aspect ratio, fit within 150x150
            withoutEnlargement: true, // Do not enlarge the image if it's smaller than 150x150
          })
          .toFile(resizedThumbnailPath); // Save resized image to a new path

        learningResource.thumbnail = `/uploads/educational-resources/${req.files['thumbnail'][0].filename.replace(
          '.jpg',
          '-resized.jpg'
        )}`;
      }

      // Process uploaded video file
      if (req.files['videoFile']) {
        learningResource.videoFile = `/uploads/educational-resources/${req.files['videoFile'][0].filename}`;
      }

      // Update fields if provided
      if (title) learningResource.title = title;
      if (description) learningResource.description = description;
      if (type) learningResource.type = type;
      if (type === 'video') {
        learningResource.videoType = videoType;
        if (videoType === 'youtube') {
          learningResource.videoUrl = videoUrl;
          learningResource.videoFile = undefined; // Clear uploaded video file
        } else if (videoType === 'uploaded') {
          learningResource.videoUrl = undefined; // Clear YouTube URL
        }
      }
      if (category) learningResource.category = category;
      if (skill_level) learningResource.skill_level = skill_level;

      // Save updated learning resource
      const updatedLearningResource = await learningResource.save();
      consol.log(updatedLearningResource,"is ther this")
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