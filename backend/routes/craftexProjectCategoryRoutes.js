const express = require('express');
const craftexProjectCategory = require('../models/craftexProjectCategory');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// POST Route to Create a New Project Category
router.post(
  '/api/craftexprojectcategories',
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
      const existingCategory = await craftexProjectCategory.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category already exists' });
      }

      // Create new category
      const newCategory = new craftexProjectCategory({
        name,
        description,
      });

      // Save category to the database
      const savedCategory = await newCategory.save();

      // Return the saved category
      res.status(201).json(savedCategory);
    } catch (err) {
      console.error('Error creating project category:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET Route to Fetch All Project Categories
router.get('/api/craftexprojectcategories', async (req, res) => {
  try {
    const categories = await craftexProjectCategory.find();
    res.status(200).json(categories);
  } catch (err) {
    console.error('Error fetching project categories:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET Route to Fetch a Single Project Category by ID
router.get('/api/craftexprojectcategories/:id', async (req, res) => {
  try {
    const category = await craftexProjectCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (err) {
    console.error('Error fetching project category:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT Route to Update a Project Category by ID
router.put(
  '/api/craftexprojectcategories/:id',
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
      const category = await craftexProjectCategory.findById(req.params.id);
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
      console.error('Error updating project category:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE Route to Delete a Project Category by ID
router.delete('/api/craftexprojectcategories/:id', async (req, res) => {
  try {
    const category = await craftexProjectCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting project category:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;