const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const craftexTutorialCategory = require('../models/craftexTutorialCategory');
const craftexLearningResource = require('../models/craftexLearningResource');

// GET /api/tutorial-categories - Fetch all tutorial categories with their learning resources
router.get('/api/tutorial-categories', async (req, res) => {
  try {
    const categories = await craftexTutorialCategory.find().populate('learningResources');
    res.status(200).json(categories);
  } catch (err) {
    console.error('Error fetching tutorial categories:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/tutorial-categories - Create a new tutorial category
router.post(
  '/api/tutorial-categories',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').optional(),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description } = req.body;

      // Check if category already exists
      const existingCategory = await craftexTutorialCategory.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }

      // Create new category
      const newCategory = new craftexTutorialCategory({
        name,
        description,
      });

      // Save category to the database
      const savedCategory = await newCategory.save();

      // Return the saved category
      res.status(201).json(savedCategory);
    } catch (err) {
      console.error('Error creating tutorial category:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// PUT /api/tutorial-categories/:id - Update a tutorial category
router.put(
  '/api/tutorial-categories/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('description').optional(),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { name, description } = req.body;

      // Find the category by ID
      const category = await craftexTutorialCategory.findById(id);
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
      console.error('Error updating tutorial category:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE /api/tutorial-categories/:id - Delete a tutorial category and its associated learning resources
router.delete('/api/tutorial-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the category by ID
    const deletedCategory = await craftexTutorialCategory.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete all learning resources associated with this category
    await craftexLearningResource.deleteMany({ category: id });

    // Return success message
    res.status(200).json({ message: 'Category and associated learning resources deleted successfully' });
  } catch (err) {
    console.error('Error deleting tutorial category:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;