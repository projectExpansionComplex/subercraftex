const express = require('express');
const craftexDesigner = require( '../models/craftexDesigner');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const craftexUser = require('../models/userModel')
const craftexCustomRequest = require('../models/craftexCustomRequest')
const path = require('path')
const sharp = require('sharp');

// Multer configuration for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', 'products')); // Save files in 'uploads/products'
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

// POST route to create a new custom request
router.post(
  '/api/craftexcustomrequests',
  [
    // Validation middleware using express-validator
    body('user').notEmpty().withMessage('User ID is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('designer').optional().isMongoId().withMessage('Invalid designer ID'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, description, designer } = req.body;

      // Validate user
      const existingUser = await craftexUser.findById(user);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Validate designer (if provided)
      if (designer) {
        const existingDesigner = await craftexDesigner.findById(designer);
        if (!existingDesigner) {
          return res.status(400).json({ message: 'Invalid designer ID' });
        }
      }

      // Create new custom request
      const customRequest = new craftexCustomRequest({
        user,
        description,
        designer,
      });

      // Save custom request to the database
      const savedCustomRequest = await customRequest.save();

      // Return the saved custom request
      res.status(201).json(savedCustomRequest);
    } catch (err) {
      console.error('Error creating custom request:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all custom requests
router.get('/api/craftexcustomrequests', async (req, res) => {
  try {
    const customRequests = await craftexCustomRequest.find()
      .populate('user', 'name email') // Populate user details
      .populate('designer', 'name specialty'); // Populate designer details
    res.status(200).json(customRequests);
  } catch (err) {
    console.error('Error fetching custom requests:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single custom request by ID
router.get('/api/craftexcustomrequests/:id', async (req, res) => {
  try {
    const customRequest = await craftexCustomRequest.findById(req.params.id)
      .populate('user', 'name email') // Populate user details
      .populate('designer', 'name specialty'); // Populate designer details
    if (!customRequest) {
      return res.status(404).json({ message: 'Custom request not found' });
    }
    res.status(200).json(customRequest);
  } catch (err) {
    console.error('Error fetching custom request:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update a custom request by ID
router.put(
  '/api/craftexcustomrequests/:id',
  [
    // Validation middleware using express-validator
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
    body('designer').optional().isMongoId().withMessage('Invalid designer ID'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { description, status, designer } = req.body;

      // Find the custom request by ID
      const customRequest = await craftexCustomRequest.findById(req.params.id);
      if (!customRequest) {
        return res.status(404).json({ message: 'Custom request not found' });
      }

      // Update fields if provided
      if (description) customRequest.description = description;
      if (status) customRequest.status = status;
      if (designer) {
        // Validate designer
        const existingDesigner = await craftexDesigner.findById(designer);
        if (!existingDesigner) {
          return res.status(400).json({ message: 'Invalid designer ID' });
        }
        customRequest.designer = designer;
      }

      // Save updated custom request
      const updatedCustomRequest = await customRequest.save();

      // Return the updated custom request
      res.status(200).json(updatedCustomRequest);
    } catch (err) {
      console.error('Error updating custom request:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete a custom request by ID
router.delete('/api/craftexcustomrequests/:id', async (req, res) => {
  try {
    const customRequest = await craftexCustomRequest.findByIdAndDelete(req.params.id);
    if (!customRequest) {
      return res.status(404).json({ message: 'Custom request not found' });
    }
    res.status(200).json({ message: 'Custom request deleted successfully' });
  } catch (err) {
    console.error('Error deleting custom request:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router