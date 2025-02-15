const express = require('express');
const craftexCategory = require( '../models/craftexCategory');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const craftexUser = require('../models/userModel')
const path = require('path')
// Multer configuration for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', 'product-category')); // Save files in 'uploads/products'
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

router.get('/api/craftexcategories-all', async (req, res) => {
  try {
    const categories = await craftexCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// 2. Category Products
router.get('/api/category-products', async (req, res) => {
  try {
    const categories = await craftexCategory.find().populate('craftexProducts');

    const categoryProducts = {};
    categories.forEach(category => {
      categoryProducts[category.name] = category.craftexProducts;
    });
    res.json(categoryProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST route to create a new category
router.post(
  '/api/craftexcategories',
  upload.single('image'), // Single file upload for the category image
  [
    // Validation middleware using express-validator
    body('name').notEmpty().withMessage('Name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description } = req.body;

      // Check if the category already exists
      const existingCategory = await craftexCategory.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }

      // Get file path for the uploaded image
      const imageUrl = req.file
        ? `/uploads/categories/${req.file.filename}`
        : null;

      // Create new category
      const category = new craftexCategory({
        name,
        description,
        imageUrl,
        craftexProducts: [], // Initialize with an empty array of products
      });

      // Save category to the database
      const savedCategory = await category.save();

      // Return the saved category
      res.status(201).json(savedCategory);
    } catch (err) {
      console.error('Error creating category:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

router.put('/api/craftexcategories/:id', async (req, res) => {
  try {
    const updatedCategory = await craftexCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/api/craftexcategories/:id', async (req, res) => {
  try {
    await craftexCategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router