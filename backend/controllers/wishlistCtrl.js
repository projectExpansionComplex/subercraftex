const Wishlist = require('../models/wishlistModel');

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      const newWishlist = new Wishlist({
        user: req.user._id,
        products: [req.body.productId],
      });
      await newWishlist.save();
      return res.status(201).json(newWishlist);
    }

    wishlist.products.push(req.body.productId);
    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get wishlist for user
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      'products'
    );
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    wishlist.products = wishlist.products.filter(
      (productId) => productId.toString() !== req.body.productId
    );
    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
