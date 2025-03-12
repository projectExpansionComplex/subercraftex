const express = require('express');
const craftexBlogPostCategory = require('../models/craftexBlogPostCategory');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// POST Route to Create a New Blog Post Category
router.post(
  '/api/craftexblogpostcategories',
  [
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
      const existingCategory = await craftexBlogPostCategory.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category already exists' });
      }

      // Create new category
      const newCategory = new craftexBlogPostCategory({
        name,
        description,
      });

      // Save category to the database
      const savedCategory = await newCategory.save();

      // Return the saved category
      res.status(201).json(savedCategory);
    } catch (err) {
      console.error('Error creating blog post category:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET Route to Fetch All Blog Post Categories
router.get('/api/craftexblogpostcategories', async (req, res) => {
  try {
    const categories = await craftexBlogPostCategory.find();
    res.status(200).json(categories);
  } catch (err) {
    console.error('Error fetching blog post categories:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET Route to Fetch a Single Blog Post Category by ID
router.get('/api/craftexblogpostcategories/:id', async (req, res) => {
  try {
    const category = await craftexBlogPostCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (err) {
    console.error('Error fetching blog post category:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT Route to Update a Blog Post Category by ID
router.put(
  '/api/craftexblogpostcategories/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
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

      // Find the category by ID
      const category = await craftexBlogPostCategory.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Update fields if provided
      if (name) category.name = name;
      if (description) category.description = description;

      // Save updated category
      const updatedCategory = await category.save();

      // Return the updated category
      res.status(200).json(updatedCategory);
    } catch (err) {
      console.error('Error updating blog post category:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE Route to Delete a Blog Post Category by ID
router.delete('/api/craftexblogpostcategories/:id', async (req, res) => {
  try {
    const category = await craftexBlogPostCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog post category:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;