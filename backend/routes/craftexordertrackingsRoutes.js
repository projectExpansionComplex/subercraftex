const express = require('express');
const craftexOrder = require( '../models/craftexOrder');
const craftexOrderTracking = require( '../models/craftexOrderTracking');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const craftexUser = require('../models/userModel')
const craftexCustomRequest = require('../models/craftexCustomRequest')
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


// POST route to create a new order tracking record
router.post(
  '/api/craftexordertrackings',
  [
    // Validation middleware using express-validator
    body('order').notEmpty().withMessage('Order ID is required'),
    body('status').isIn(['pending', 'shipped', 'out-for-delivery', 'delivered']).withMessage('Invalid status'),
    body('location').optional().isString().withMessage('Location must be a string'),
    body('estimatedDelivery').optional().isISO8601().withMessage('Estimated delivery must be a valid date'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { order, status, location, estimatedDelivery } = req.body;

      // Validate order
      const existingOrder = await craftexOrder.findById(order);
      if (!existingOrder) {
        return res.status(400).json({ message: 'Invalid order ID' });
      }

      // Create new order tracking record
      const orderTracking = new craftexOrderTracking({
        order,
        status,
        location,
        estimatedDelivery,
      });

      // Save order tracking record to the database
      const savedOrderTracking = await orderTracking.save();

      // Return the saved order tracking record
      res.status(201).json(savedOrderTracking);
    } catch (err) {
      console.error('Error creating order tracking record:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all order tracking records for an order
router.get('/api/craftexordertrackings/:orderId', async (req, res) => {
  try {
    const orderTrackings = await craftexOrderTracking.find({ order: req.params.orderId })
      .populate('order', 'status total'); // Populate order details
    res.status(200).json(orderTrackings);
  } catch (err) {
    console.error('Error fetching order tracking records:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single order tracking record by ID
router.get('/api/craftexordertrackings/:id', async (req, res) => {
  try {
    const orderTracking = await craftexOrderTracking.findById(req.params.id)
      .populate('order', 'status total'); // Populate order details
    if (!orderTracking) {
      return res.status(404).json({ message: 'Order tracking record not found' });
    }
    res.status(200).json(orderTracking);
  } catch (err) {
    console.error('Error fetching order tracking record:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update an order tracking record by ID
router.put(
  '/api/craftexordertrackings/:id',
  [
    // Validation middleware using express-validator
    body('status').optional().isIn(['pending', 'shipped', 'out-for-delivery', 'delivered']).withMessage('Invalid status'),
    body('location').optional().isString().withMessage('Location must be a string'),
    body('estimatedDelivery').optional().isISO8601().withMessage('Estimated delivery must be a valid date'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status, location, estimatedDelivery } = req.body;

      // Find the order tracking record by ID
      const orderTracking = await craftexOrderTracking.findById(req.params.id);
      if (!orderTracking) {
        return res.status(404).json({ message: 'Order tracking record not found' });
      }

      // Update fields if provided
      if (status) orderTracking.status = status;
      if (location) orderTracking.location = location;
      if (estimatedDelivery) orderTracking.estimatedDelivery = estimatedDelivery;

      // Save updated order tracking record
      const updatedOrderTracking = await orderTracking.save();

      // Return the updated order tracking record
      res.status(200).json(updatedOrderTracking);
    } catch (err) {
      console.error('Error updating order tracking record:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete an order tracking record by ID
router.delete('/api/craftexordertrackings/:id', async (req, res) => {
  try {
    const orderTracking = await craftexOrderTracking.findByIdAndDelete(req.params.id);
    if (!orderTracking) {
      return res.status(404).json({ message: 'Order tracking record not found' });
    }
    res.status(200).json({ message: 'Order tracking record deleted successfully' });
  } catch (err) {
    console.error('Error deleting order tracking record:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});






module.exports = router