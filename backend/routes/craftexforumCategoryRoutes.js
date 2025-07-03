const express = require('express');
const router = express.Router();
const ForumCategory = require('../models/craftexforumCategoryModel');
const { body, validationResult } = require('express-validator');
const craftexForum = require('../models/craftexForum');

// POST route to create a new forum category
router.post(
  '/api/forum-categories',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description } = req.body;

      const newCategory = new ForumCategory({
        name,
        description,
      });

      const savedCategory = await newCategory.save();
      res.status(201).json(savedCategory);
    } catch (err) {
      console.error('Error creating forum category:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all forum categories
router.get('/api/forum-categories', async (req, res) => {
  try {
    // Fetch all categories
    const categories = await ForumCategory.find()
      .sort({ order: 1 }) // Sort by order field (ascending)
      .lean(); // Convert Mongoose documents to plain JavaScript objects

    // Fetch topic count and recent topics for each category
    const categoriesWithDetails = await Promise.all(
      categories.map(async (category) => {
        // Get the number of topics in this category
        const topicCount = await craftexForum.countDocuments({ category: category._id });

        // Get the 3 most recent topics in this category
        const recentTopics = await craftexForum.find({ category: category._id })
          .sort({ createdAt: -1 }) // Sort by creation date (newest first)
          .limit(3) // Limit to 3 topics
          .select('title createdAt') // Select only the title and creation date
          .populate('user', 'username avatar_url') // Populate user details
          .lean();

        return {
          ...category,
          topic_count: topicCount,
          recent_topics: recentTopics,
        };
      })
    );

    res.status(200).json(categoriesWithDetails);
  } catch (err) {
    console.error('Error fetching forum categories:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single forum category by ID
router.get('/api/forum-categories/:id', async (req, res) => {
  try {
    const category = await ForumCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Forum category not found' });
    }
    res.status(200).json(category);
  } catch (err) {
    console.error('Error fetching forum category:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update a forum category by ID
router.put(
  '/api/forum-categories/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description } = req.body;

      const category = await ForumCategory.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Forum category not found' });
      }

      if (name) category.name = name;
      if (description) category.description = description;

      const updatedCategory = await category.save();
      res.status(200).json(updatedCategory);
    } catch (err) {
      console.error('Error updating forum category:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete a forum category by ID
router.delete('/api/forum-categories/:id', async (req, res) => {
  try {
    const category = await ForumCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Forum category not found' });
    }
    res.status(200).json({ message: 'Forum category deleted successfully' });
  } catch (err) {
    console.error('Error deleting forum category:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;