const express = require('express');
const craftexDesigner = require( '../models/craftexDesigner');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const craftexUser = require('../models/userModel')
const craftexCustomRequest = require('../models/craftexCustomRequest')
const path = require('path')
const sharp = require('sharp');

// Multer configuration for avatar uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', 'designer-avatar')); // Save files in 'uploads/designer-avatar'
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


// POST route to create a new designer profile
router.post(
  '/api/craftexdesigners',
  upload.single('avatar'), // Handle single file upload for the 'avatar' field
  [
    // Validation middleware using express-validator
    body('user').notEmpty().withMessage('User ID is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('specialty').notEmpty().withMessage('Specialty is required'),
    body('bio').optional().isString().withMessage('Bio must be a string'),
    body('portfolio').optional().isArray().withMessage('Portfolio must be an array of URLs'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, name, specialty, bio, portfolio } = req.body;

      // Validate user
      const existingUser = await craftexUser.findById(user);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Check if the user already has a designer profile
      const existingDesigner = await craftexDesigner.findOne({ user });
      if (existingDesigner) {
        return res.status(400).json({ message: 'Designer profile already exists for this user' });
      }

      // Process avatar upload
      let avatarUrl = '/uploads/designer-avatar/default-avatar.jpg'; // Default avatar
      if (req.file) {
        const avatarPath = path.join(__dirname, '..', 'uploads', 'designer-avatar', req.file.filename);
        const resizedAvatarPath = avatarPath.replace('.jpg', '-resized.jpg');

        // Resize avatar using sharp
        await sharp(req.file.path)
          .resize(150, 150, {
            fit: 'inside', // Preserve aspect ratio, fit within 150x150
            withoutEnlargement: true, // Do not enlarge the image if it's smaller than 150x150
          })
          .toFile(resizedAvatarPath); // Save resized image to a new path

        avatarUrl = `/uploads/designer-avatar/${req.file.filename.replace('.jpg', '-resized.jpg')}`;
      }

      // Create new designer profile
      const designer = new craftexDesigner({
        user,
        name,
        avatar: avatarUrl, // Save the avatar file path
        specialty,
        bio,
        portfolio: portfolio || [],
      });

      // Save designer profile to the database
      const savedDesigner = await designer.save();

      // Return the saved designer profile
      res.status(201).json(savedDesigner);
    } catch (err) {
      console.error('Error creating designer profile:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all designers
router.get('/api/craftexdesigners', async (req, res) => {
  try {
    const designers = await craftexDesigner.find()
      .populate('user', 'first_name last_name email profile_picture_url') // Populate user details
      .populate('reviews.user', 'name'); // Populate reviewer details
    res.status(200).json(designers);
  } catch (err) {
    console.error('Error fetching designers:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single designer by ID
router.get('/api/craftexdesigners/:id', async (req, res) => {
  try {
    const designer = await craftexDesigner.findById(req.params.id)
      .populate('user', 'name email') // Populate user details
      .populate('reviews.user', 'name'); // Populate reviewer details
    if (!designer) {
      return res.status(404).json({ message: 'Designer not found' });
    }
    res.status(200).json(designer);
  } catch (err) {
    console.error('Error fetching designer:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update a designer profile by ID
router.put(
  '/api/craftexdesigners/:id',
  upload.single('avatar'), // Handle single file upload for the 'avatar' field
  [
    // Validation middleware using express-validator
    body('specialty').optional().notEmpty().withMessage('Specialty cannot be empty'),
    body('bio').optional().isString().withMessage('Bio must be a string'),
    body('portfolio').optional().isArray().withMessage('Portfolio must be an array of URLs'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { specialty, bio, portfolio } = req.body;

      // Find the designer by ID
      const designer = await craftexDesigner.findById(req.params.id);
      if (!designer) {
        return res.status(404).json({ message: 'Designer not found' });
      }

      // Update fields if provided
      if (specialty) designer.specialty = specialty;
      if (bio) designer.bio = bio;
      if (portfolio) designer.portfolio = portfolio;

      // Handle avatar upload
      if (req.file) {
        const avatarPath = path.join(__dirname, '..', 'uploads', 'designer-avatar', req.file.filename);
        const resizedAvatarPath = avatarPath.replace('.jpg', '-resized.jpg');

        // Resize avatar using sharp
        await sharp(req.file.path)
          .resize(150, 150, {
            fit: 'inside', // Preserve aspect ratio, fit within 150x150
            withoutEnlargement: true, // Do not enlarge the image if it's smaller than 150x150
          })
          .toFile(resizedAvatarPath); // Save resized image to a new path

        designer.avatar = `/uploads/designer-avatar/${req.file.filename.replace('.jpg', '-resized.jpg')}`;
      }

      // Save updated designer profile
      const updatedDesigner = await designer.save();

      // Return the updated designer profile
      res.status(200).json(updatedDesigner);
    } catch (err) {
      console.error('Error updating designer profile:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete a designer profile by ID
router.delete('/api/craftexdesigners/:id', async (req, res) => {
  try {
    const designer = await craftexDesigner.findByIdAndDelete(req.params.id);
    if (!designer) {
      return res.status(404).json({ message: 'Designer not found' });
    }
    res.status(200).json({ message: 'Designer profile deleted successfully' });
  } catch (err) {
    console.error('Error deleting designer profile:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST route to add a review to a designer profile
router.post(
  '/api/craftexdesigners/:id/reviews',
  [
    // Validation middleware using express-validator
    body('user').notEmpty().withMessage('User ID is required'),
    body('comment').optional().isString().withMessage('Comment must be a string'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, comment, rating } = req.body;

      // Validate user
      const existingUser = await craftexUser.findById(user);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Find the designer by ID
      const designer = await craftexDesigner.findById(req.params.id);
      if (!designer) {
        return res.status(404).json({ message: 'Designer not found' });
      }

      // Add the review
      designer.reviews.push({
        user,
        comment,
        rating,
      });

      // Recalculate the average rating
      const totalRatings = designer.reviews.reduce((sum, review) => sum + review.rating, 0);
      designer.rating = totalRatings / designer.reviews.length;

      // Save updated designer profile
      const updatedDesigner = await designer.save();

      // Return the updated designer profile
      res.status(201).json(updatedDesigner);
    } catch (err) {
      console.error('Error adding review:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// CRUD Operations for Designers
router.get('/api/designers', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, specialties, location, rating, search } = req.query;

    // Build the query object for filtering
    const query = {};

    if (specialties) {
      query.specialty = { $in: specialties.split(',') }; // Filter by specialties
    }

    if (location && location !== 'all') {
      query.location = location; // Filter by location (if not "all")
    }

    if (rating) {
      query.rating = { $gte: Number(rating) }; // Filter by minimum rating
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' }; // Case-insensitive search by name
    }

    // Fetch designers with pagination, sorting, and filtering
    const designers = await craftexDesigner
      .find(query)
      .sort(sort || '-createdAt') // Default sort by newest first
      .skip((page - 1) * limit) // Pagination
      .limit(Number(limit))
      .populate('user', 'username email'); // Populate user details if needed

    // Get total count of designers for pagination
    const totalCount = await craftexDesigner.countDocuments(query);

    // Return the response in the expected format
    res.json({
      designers,
      total_count: totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// 3. Featured Designers
router.get('/api/designers/featured', async (req, res) => {
  try {
    // Fetch featured designers
    const featuredDesigners = await craftexDesigner.find({ isFeatured: true });

    // Return the response in the expected format
    res.json({
      featured_designers: featuredDesigners, // Wrap the data in a `featured_designers` field
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/api/designers', async (req, res) => {
  const designer = new craftexDesigner(req.body);
  try {
    const savedDesigner = await designer.save();
    res.status(201).json(savedDesigner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/api/designers/:id', async (req, res) => {
  try {
    const updatedDesigner = await craftexDesigner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedDesigner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/api/designers/:id', async (req, res) => {
  try {
    await craftexDesigner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Designer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router