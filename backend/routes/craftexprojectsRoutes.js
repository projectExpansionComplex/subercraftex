const express = require('express');
const craftexProject = require( '../models/craftexProject');
const craftexDesigner = require( '../models/craftexDesigner');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const craftexUser = require('../models/userModel')
const craftexCategory = require('../models/craftexCategory')
const path = require('path')
const sharp = require('sharp');
// Multer configuration for file blogpost
const upload3 = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', 'inspirations')); // Save files in 'uploads/products'
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



router.post(
  '/api/craftexprojects',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('user').notEmpty().withMessage('User ID is required'),
    body('designer').optional().isMongoId().withMessage('Invalid Designer ID'),
    body('status').optional().isIn(['open', 'in-progress', 'completed']).withMessage('Invalid status'),
    body('budget_min').isNumeric().withMessage('Minimum budget must be a number'),
    body('budget_max').isNumeric().withMessage('Maximum budget must be a number'),
    body('deadline').isISO8601().withMessage('Invalid deadline format'),
    body('skills').isArray().withMessage('Skills must be an array'),
    body('category_uid').isMongoId().withMessage('Invalid category ID'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, user, designer, status, budget_min, budget_max, deadline, skills, category_uid } = req.body;

      // Validate user
      const existingUser = await craftexUser.findById(user);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Validate designer if provided
      if (designer) {
        const existingDesigner = await craftexDesigner.findById(designer);
        if (!existingDesigner) {
          return res.status(400).json({ message: 'Invalid designer ID' });
        }
      }

      // Validate category
      const existingCategory = await craftexCategory.findById(category_uid);
      if (!existingCategory) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      const newProject = new craftexProject({
        title,
        description,
        user,
        designer,
        status,
        budget_min,
        budget_max,
        deadline,
        skills,
        category_uid,
      });

      const savedProject = await newProject.save();
      res.status(201).json(savedProject);
    } catch (err) {
      console.error('Error creating project:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);
//GET Route to Fetch All Projects
router.get('/api/craftexprojects', async (req, res) => {
  try {
    const { status, category_uid, budget_min, budget_max, skills, sort, page } = req.query;

    // Build the filter object
    const filter = {};
    if (status) filter.status = status;
    if (category_uid) filter.category_uid = category_uid;
    if (budget_min) filter.budget_min = { $gte: Number(budget_min) };
    if (budget_max) filter.budget_max = { $lte: Number(budget_max) };
    if (skills) filter.skills = { $in: skills.split(',') };

    // Build the sort object
    const sortOptions = {};
    if (sort === 'created_at_desc') sortOptions.createdAt = -1;
    if (sort === 'created_at_asc') sortOptions.createdAt = 1;
    if (sort === 'budget_max_desc') sortOptions.budget_max = -1;
    if (sort === 'budget_max_asc') sortOptions.budget_max = 1;

    // Pagination
    const pageSize = 10; // Number of projects per page
    const currentPage = Number(page) || 1;
    const skip = (currentPage - 1) * pageSize;

    const totalProjects = await craftexProject.countDocuments(filter);
    const totalPages = Math.ceil(totalProjects / pageSize);

    const projects = await craftexProject.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize)
      .populate('user', 'name email')
      .populate('designer', 'name email')
      .populate('category_uid', 'name'); // Populate category_uid with category name

    res.status(200).json({
      projects,
      total_pages: totalPages,
    });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET Route to Fetch a Single Project by ID
router.get('/api/craftexprojects/:id', async (req, res) => {
  try {
    const project = await craftexProject.findById(req.params.id)
      .populate('user', 'name email')
      .populate('designer', 'name email')
      .populate('bids.user', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// PUT Route to Update a Project by ID
router.put(
  '/api/craftexprojects/:id',
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('designer').optional().isMongoId().withMessage('Invalid Designer ID'),
    body('status').optional().isIn(['open', 'in-progress', 'completed']).withMessage('Invalid status'),
    body('budget_min').optional().isNumeric().withMessage('Minimum budget must be a number'),
    body('budget_max').optional().isNumeric().withMessage('Maximum budget must be a number'),
    body('deadline').optional().isISO8601().withMessage('Invalid deadline format'),
    body('skills').optional().isArray().withMessage('Skills must be an array'),
    body('category_uid').optional().isMongoId().withMessage('Invalid category ID'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, designer, status, budget_min, budget_max, deadline, skills, category_uid } = req.body;

      const project = await craftexProject.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (title) project.title = title;
      if (description) project.description = description;
      if (designer) {
        const existingDesigner = await craftexDesigner.findById(designer);
        if (!existingDesigner) {
          return res.status(400).json({ message: 'Invalid designer ID' });
        }
        project.designer = designer;
      }
      if (status) project.status = status;
      if (budget_min) project.budget_min = budget_min;
      if (budget_max) project.budget_max = budget_max;
      if (deadline) project.deadline = deadline;
      if (skills) project.skills = skills;
      if (category_uid) {
        const existingCategory = await craftexCategory.findById(category_uid);
        if (!existingCategory) {
          return res.status(400).json({ message: 'Invalid category ID' });
        }
        project.category_uid = category_uid;
      }

      const updatedProject = await project.save();
      res.status(200).json(updatedProject);
    } catch (err) {
      console.error('Error updating project:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// 5. DELETE Route to Delete a Project by ID
router.delete('/api/craftexprojects/:id', async (req, res) => {
  try {
    const project = await craftexProject.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 6. POST Route to Add a Bid to a Project
router.post(
  '/api/craftexprojects/:id/bids',
  [
    body('user').notEmpty().withMessage('User ID is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('comment').optional().isString().withMessage('Comment must be a string'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, amount, comment } = req.body;

      const project = await craftexProject.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const existingUser = await craftexUser.findById(user);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const newBid = {
        user,
        amount,
        comment,
      };

      project.bids.push(newBid);
      const updatedProject = await project.save();

      res.status(201).json(updatedProject);
    } catch (err) {
      console.error('Error adding bid to project:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);





module.exports = router