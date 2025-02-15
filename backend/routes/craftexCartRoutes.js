const express = require('express');
const craftexProduct = require( '../models/craftexProduct');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const craftexUser = require('../models/userModel')
const craftexCart = require('../models/craftexCart')
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

// POST route to add an item to the cart
router.post(
  '/api/craftexcarts',
  [
    // Validation middleware using express-validator
    body('user').notEmpty().withMessage('User ID is required'),
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.product').notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, items } = req.body;

      // Validate user
      const existingUser = await User.findById(user);
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

      // Create new cart
      const cart = new craftexCart({
        user,
        items,
        total,
      });

      // Save cart to the database
      const savedCart = await cart.save();

      // Return the saved cart
      res.status(201).json(savedCart);
    } catch (err) {
      console.error('Error creating cart:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch a user's cart
router.get('/api/craftexcarts/:userId', async (req, res) => {
  try {
    const cart = await craftexCart.findOne({ user: req.params.userId }).populate('items.product', 'name price');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.status(200).json(cart);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update a cart item
router.put(
  '/api/craftexcarts/:cartId/items/:itemId',
  [
    // Validation middleware using express-validator
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { quantity, price } = req.body;

      // Find the cart by ID
      const cart = await craftexCart.findById(req.params.cartId);
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      // Find the item in the cart
      const item = cart.items.id(req.params.itemId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }

      // Update item fields if provided
      if (quantity) item.quantity = quantity;
      if (price) item.price = price;

      // Recalculate total cost
      cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Save updated cart
      const updatedCart = await cart.save();

      // Return the updated cart
      res.status(200).json(updatedCart);
    } catch (err) {
      console.error('Error updating cart item:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to remove an item from the cart
router.delete('/api/craftexcarts/:cartId/items/:itemId', async (req, res) => {
  try {
    // Find the cart by ID
    const cart = await craftexCart.findById(req.params.cartId);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove the item from the cart
    cart.items.pull(req.params.itemId);

    // Recalculate total cost
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Save updated cart
    const updatedCart = await cart.save();

    // Return the updated cart
    res.status(200).json(updatedCart);
  } catch (err) {
    console.error('Error deleting cart item:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE route to clear the entire cart
router.delete('/api/craftexcarts/:cartId', async (req, res) => {
  try {
    const cart = await craftexCart.findByIdAndDelete(req.params.cartId);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router