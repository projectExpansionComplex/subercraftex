const express = require('express');
const craftexBlogPost = require( '../models/craftexBlogPost');
const craftexBlogPostCategory = require( '../models/craftexBlogPostCategory');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const craftexUser = require('../models/userModel')
const path = require('path')
// Multer configuration for file uploads

// Multer configuration for blog post images and videos
const upload2 = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, path.join(__dirname, '..', 'uploads', 'blog-posts', 'images')); // Save images in 'uploads/blog-posts/images'
      } else if (file.mimetype.startsWith('video/')) {
        cb(null, path.join(__dirname, '..', 'uploads', 'blog-posts', 'videos')); // Save videos in 'uploads/blog-posts/videos'
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

router.get('/api/blog-posts', async (req, res) => {
  try {
    const blogPosts = await craftexBlogPost.find();
    res.json(blogPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Latest Blog Posts
router.get('/api/latest-blog-posts', async (req, res) => {
  try {
    const latestBlogPosts = await craftexBlogPost.find().populate('author', 'first_name last_name').sort({ publishDate: -1 }).limit(3);


    res.json(latestBlogPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// router.post('/api/blog-posts', async (req, res) => {
//   const blogPost = new craftexBlogPost(req.body);
//   try {
//     const savedBlogPost = await blogPost.save();
//     res.status(201).json(savedBlogPost);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

router.put('/api/blog-posts/:id', async (req, res) => {
  try {
    const updatedBlogPost = await craftexBlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBlogPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/api/blog-posts/:id', async (req, res) => {
  try {
    await craftexBlogPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST route to create a new blog post
router.post(
  '/api/craftexblogposts',
  upload2.fields([
    { name: 'featuredImage', maxCount: 1 }, // Featured image
    { name: 'video', maxCount: 1 }, // Video upload
  ]),
  [
    // Validation middleware using express-validator
    body('title').notEmpty().withMessage('Title is required'),
    body('excerpt').notEmpty().withMessage('Excerpt is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('author').notEmpty().withMessage('Author ID is required'),
    body('category').optional().isMongoId().withMessage('Invalid category ID'),
    body('tags').optional().isArray().withMessage('Tags must be an array of strings'),
    body('youtubeUrl').optional().isURL().withMessage('Invalid YouTube URL'),
    body('status').optional().isIn(['draft', 'published']).withMessage('Invalid status'),
  ],
  async (req, res) => {

    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, excerpt, content, author, category, tags, youtubeUrl, status } = req.body;

      // Validate author
      const existingAuthor = await craftexUser.findById(author);
      if (!existingAuthor) {
        return res.status(400).json({ message: 'Invalid author ID' });
      }

      // Validate category if provided
      if (category) {
        const existingCategory = await craftexBlogPostCategory.findById(category);
        if (!existingCategory) {
          return res.status(400).json({ message: 'Invalid category ID' });
        }
      }

      // Get file paths for the uploaded files
      const featuredImageUrl = req.files['featuredImage']
        ? `/uploads/blog-posts/images/${req.files['featuredImage'][0].filename}`
        : null;
      const videoUrl = req.files['video']
        ? `/uploads/blog-posts/videos/${req.files['video'][0].filename}`
        : null;

      // Create new blog post
      const blogPost = new craftexBlogPost({
        title,
        excerpt,
        content,
        featuredImage: featuredImageUrl,
        videoUrl,
        youtubeUrl,
        author,
        category,
        tags: tags || [], // Initialize tags as an empty array if not provided
        status: status || 'draft', // Default to 'draft' if not provided
      });

      // Save blog post to the database
      const savedBlogPost = await blogPost.save();

      // Return the saved blog post
      res.status(201).json(savedBlogPost);
    } catch (err) {
      console.error('Error creating blog post:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all blog posts
router.get('/api/craftexblogposts', async (req, res) => {
  try {
    const blogPosts = await craftexBlogPost.find().populate('author', 'name email'); // Populate author details
    res.status(200).json(blogPosts);
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single blog post by ID
router.get('/api/craftexblogposts/:id', async (req, res) => {
  try {
    const blogPost = await craftexBlogPost.findById(req.params.id).populate('author', 'name email'); // Populate author details
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.status(200).json(blogPost);
  } catch (err) {
    console.error('Error fetching blog post:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update a blog post by ID
router.put(
  '/api/craftexblogposts/:id',
  upload2.single('image'), // Single file upload for the blog post image
  [
    // Validation middleware using express-validator
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('excerpt').optional().notEmpty().withMessage('Excerpt cannot be empty'),
    body('content').optional().notEmpty().withMessage('Content cannot be empty'),
    body('tags').optional().isArray().withMessage('Tags must be an array of strings'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, excerpt, content, tags } = req.body;

      // Find the blog post by ID
      const blogPost = await craftexBlogPost.findById(req.params.id);
      if (!blogPost) {
        return res.status(404).json({ message: 'Blog post not found' });
      }

      // Update fields if provided
      if (title) blogPost.title = title;
      if (excerpt) blogPost.excerpt = excerpt;
      if (content) blogPost.content = content;
      if (tags) blogPost.tags = tags;

      // Update image if provided
      if (req.file) {
        blogPost.imageUrl = `/uploads/blog-posts/${req.file.filename}`;
      }

      // Save updated blog post
      const updatedBlogPost = await blogPost.save();

      // Return the updated blog post
      res.status(200).json(updatedBlogPost);
    } catch (err) {
      console.error('Error updating blog post:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete a blog post by ID
router.delete('/api/craftexblogposts/:id', async (req, res) => {
  try {
    const blogPost = await craftexBlogPost.findByIdAndDelete(req.params.id);
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.status(200).json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog post:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



module.exports = router