const express = require('express');
const craftexOrder = require( '../models/craftexOrder');
const craftexProduct = require( '../models/craftexProduct');
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



// POST route to create a new order
router.post(
  '/api/craftexorders',
  [
    // Validation middleware using express-validator
    body('user').notEmpty().withMessage('User ID is required'),
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.product').notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, items, shippingAddress, paymentMethod } = req.body;

      // Validate user
      const existingUser = await craftexUser.findById(user);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Validate products
      for (const item of items) {
        const existingProduct = await craftexProduct.findById(item.product);
        if (!existingProduct) {
          return res.status(400).json({ message: `Invalid product ID: ${item.product}` });
        }
      }

      // Calculate total cost
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Create new order
      const order = new craftexOrder({
        user,
        items,
        total,
        shippingAddress,
        paymentMethod,
      });

      // Save order to the database
      const savedOrder = await order.save();

      // Return the saved order
      res.status(201).json(savedOrder);
    } catch (err) {
      console.error('Error creating order:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all orders for a user
router.get('/api/craftexorders/:userId', async (req, res) => {
  try {
    const orders = await craftexOrder.find({ user: req.params.userId })
      .populate('user', 'name email') // Populate user details
      .populate('items.product', 'name price'); // Populate product details
    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single order by ID
router.get('/api/craftexorders/:id', async (req, res) => {
  try {
    const order = await craftexOrder.findById(req.params.id)
      .populate('user', 'name email') // Populate user details
      .populate('items.product', 'name price'); // Populate product details
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update an order by ID
router.put(
  '/api/craftexorders/:id',
  [
    // Validation middleware using express-validator
    body('status').optional().isIn(['pending', 'shipped', 'delivered']).withMessage('Invalid status'),
    body('shippingAddress').optional().notEmpty().withMessage('Shipping address cannot be empty'),
    body('paymentMethod').optional().notEmpty().withMessage('Payment method cannot be empty'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status, shippingAddress, paymentMethod } = req.body;

      // Find the order by ID
      const order = await craftexOrder.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Update fields if provided
      if (status) order.status = status;
      if (shippingAddress) order.shippingAddress = shippingAddress;
      if (paymentMethod) order.paymentMethod = paymentMethod;

      // Save updated order
      const updatedOrder = await order.save();

      // Return the updated order
      res.status(200).json(updatedOrder);
    } catch (err) {
      console.error('Error updating order:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete an order by ID
router.delete('/api/craftexorders/:id', async (req, res) => {
  try {
    const order = await craftexOrder.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});





module.exports = router