const express = require('express');
const craftexUser = require('../models/userModel');
const craftexProject = require('../models/craftexProject');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// 1. Fetch All Users
router.get('/api/craftexusers-all', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default: page 1, limit 10
    const skip = (page - 1) * limit;

    const users = await craftexUser.find({}, { _id: 1, name: 1, email: 1 })
      .skip(skip)
      .limit(Number(limit));

    const totalUsers = await craftexUser.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users,
      totalPages,
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Fetch User by ID
router.get('/api/craftexusers/:id', async (req, res) => {
  try {
    const user = await craftexUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Fetch Saved Projects for a User
router.get('/api/craftexusers/:id/saved-projects', async (req, res) => {
  try {
    const user = await craftexUser.findById(req.params.id).populate('savedProjects');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.savedProjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Save a Project for a User
router.post(
  '/api/craftexusers/:id/saved-projects/:projectId',
  async (req, res) => {
    try {
      const user = await craftexUser.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const project = await craftexProject.findById(req.params.projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Check if the project is already saved
      if (user.savedProjects.includes(project._id)) {
        return res.status(400).json({ message: 'Project already saved' });
      }

      // Add the project to the user's saved projects
      user.savedProjects.push(project._id);
      await user.save();

      res.status(201).json({ message: 'Project saved successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// 5. Unsave a Project for a User
router.delete(
  '/api/craftexusers/:id/saved-projects/:projectId',
  async (req, res) => {
    try {
      const user = await craftexUser.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const project = await craftexProject.findById(req.params.projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Remove the project from the user's saved projects
      user.savedProjects = user.savedProjects.filter(
        (savedProjectId) => savedProjectId.toString() !== project._id.toString()
      );
      await user.save();

      res.json({ message: 'Project unsaved successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// 6. Update User Details
router.put(
  '/api/craftexusers/:id',
  [
    body('name').optional().isString().withMessage('Name must be a string'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await craftexUser.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// 7. Delete User (Soft Delete)
router.delete('/api/craftexusers/:id', async (req, res) => {
  try {
    const user = await craftexUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete
    user.isDeleted = true;
    await user.save();

    res.json({ message: 'User soft deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;