const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const craftexSkillLevel = require('../models/craftexSkillLevel');

// GET /api/skill-levels - Fetch all skill levels
router.get('/api/skill-levels', async (req, res) => {
  try {
    const skillLevels = await craftexSkillLevel.find();
    res.status(200).json(skillLevels);
  } catch (err) {
    console.error('Error fetching skill levels:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/skill-levels - Create a new skill level
router.post(
  '/api/skill-levels',
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

      // Check if skill level already exists
      const existingSkillLevel = await craftexSkillLevel.findOne({ name });
      if (existingSkillLevel) {
        return res.status(400).json({ message: 'Skill level with this name already exists' });
      }

      // Create new skill level
      const newSkillLevel = new craftexSkillLevel({
        name,
        description,
      });

      // Save skill level to the database
      const savedSkillLevel = await newSkillLevel.save();

      // Return the saved skill level
      res.status(201).json(savedSkillLevel);
    } catch (err) {
      console.error('Error creating skill level:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// PUT /api/skill-levels/:id - Update a skill level
router.put(
  '/api/skill-levels/:id',
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

      // Find the skill level by ID
      const skillLevel = await craftexSkillLevel.findById(id);
      if (!skillLevel) {
        return res.status(404).json({ message: 'Skill level not found' });
      }

      // Update fields if provided
      if (name) skillLevel.name = name;
      if (description) skillLevel.description = description;

      // Save updated skill level
      const updatedSkillLevel = await skillLevel.save();

      // Return the updated skill level
      res.status(200).json(updatedSkillLevel);
    } catch (err) {
      console.error('Error updating skill level:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE /api/skill-levels/:id - Delete a skill level
router.delete('/api/skill-levels/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the skill level by ID
    const deletedSkillLevel = await craftexSkillLevel.findByIdAndDelete(id);
    if (!deletedSkillLevel) {
      return res.status(404).json({ message: 'Skill level not found' });
    }

    // Return success message
    res.status(200).json({ message: 'Skill level deleted successfully' });
  } catch (err) {
    console.error('Error deleting skill level:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;