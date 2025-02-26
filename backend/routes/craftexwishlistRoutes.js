const express = require('express');
const router = express.Router();
const craftexUser = require('../models/userModel');
const craftexProduct = require('../models/craftexProduct');
const { auth2 } = require('../middleware/authMiddlerware2');

// Add a product to the wishlist
router.post('/api/wishlist/add', auth2, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_uid } = req.body;
    console.log('Product ID:', req.body);

    // Validate product ID
    const product = await craftexProduct.findById(product_uid);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Add product to user's wishlist
    const user = await craftexUser.findById(userId);
    if (!user.wishlist.includes(product_uid)) {
      user.wishlist.push(product_uid);
      await user.save();
    }

    res.status(200).json({ message: 'Product added to wishlist', wishlist: user.wishlist });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove a product from the wishlist
router.delete('/api/wishlist/remove', auth2, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    // Remove product from user's wishlist
    const user = await craftexUser.findById(userId);
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    res.status(200).json({ message: 'Product removed from wishlist', wishlist: user.wishlist });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get the user's wishlist
router.get('/api/wishlist', auth2, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's wishlist with product details
    const user = await craftexUser.findById(userId).populate('wishlist');
    res.status(200).json(user.wishlist);
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;