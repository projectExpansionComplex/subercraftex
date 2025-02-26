const express = require('express');
const craftexProduct = require( '../models/craftexProduct');
const craftexDesigner = require( '../models/craftexDesigner');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const craftexUser = require('../models/userModel')
const craftexReview = require('../models/craftexReview')
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

// Helper function to recalculate average rating for the product
const updateProductAverageRating = async (productUid) => {
  const product = await craftexProduct.findOne({ _id: productUid }).populate('ratings');
  if (product && product.ratings.length > 0) {
    const totalRatings = product.ratings.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRatings / product.ratings.length;

    // Update the average rating in the product
    await craftexProduct.findOneAndUpdate(
      { uid: productUid },
      { averageRating }
    );
  }
};

// POST Route to Create a New Review
router.get('/api/craftexreviews/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    // Find reviews related to the specific product ID
    const reviews = await craftexReview.find({ product: productId })
    .populate('user', 'name email')
    .populate('product', 'name')
    .populate('designer', 'name');

    if (!reviews.length) {
      return res.status(404).json({ message: 'No reviews found for this product' });
    }

    res.status(200).json(reviews);
  } catch (err) {
    console.error('Error fetching reviews by product ID:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 6. GET Route to Fetch Reviews by Product or Designer
router.get('/api/craftexreviews', async (req, res) => {
  try {
    const { product, designer } = req.query;
    const filter = {};

    if (product) filter.product = product;
    if (designer) filter.designer = designer;

    const reviews = await craftexReview.find(filter)
      .populate('user', 'name email')
      .populate('product', 'name')
      .populate('designer', 'name');

    res.status(200).json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});





router.post(
  '/api/craftexreviews',
  [
    body('user').notEmpty().withMessage('User ID is required').isMongoId().withMessage('Invalid User ID'),
    body('product').optional().isMongoId().withMessage('Invalid Product ID'),
    body('designer').optional().isMongoId().withMessage('Invalid Designer ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().withMessage('Comment must be a string'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, product, designer, rating, comment } = req.body;

      // Validate user
      const existingUser = await craftexUser.findById(user);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Validate product (if provided)
      if (product) {
        const existingProduct = await craftexProduct.findById(product);
        if (!existingProduct) {
          return res.status(400).json({ message: 'Invalid product ID' });
        }
      }

      // Validate designer (if provided)
      if (designer) {
        const existingDesigner = await craftexDesigner.findById(designer);
        if (!existingDesigner) {
          return res.status(400).json({ message: 'Invalid designer ID' });
        }
      }

      const newReview = new craftexReview({
        user,
        product,
        designer,
        rating,
        comment,
      });

      const savedReview = await newReview.save();
      // Update the product's ratings array to include this new review
    await craftexProduct.findOneAndUpdate(
      { _id: productUid },
      { $push: { ratings: review._id } } // Add the new review's ID to the ratings array
    );

    // Recalculate the average rating for the product
    await updateProductAverageRating(productUid);

    return review;
      res.status(201).json(savedReview);
    } catch (err) {
      console.error('Error creating review:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// 2. GET Route to Fetch All Reviews
router.get('/api/craftexreviews', async (req, res) => {
  try {
    const reviews = await craftexReview.find()
      .populate('user', 'name email')
      .populate('product', 'name')
      .populate('designer', 'name')
      

    res.status(200).json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
//3. GET Route to Fetch a Single Review by ID
router.get('/api/craftexreviews/:id', async (req, res) => {
  try {
    const review = await craftexReview.findById(req.params.id)
      .populate('user', 'name email')
      .populate('product', 'name')
      .populate('designer', 'name');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json(review);
  } catch (err) {
    console.error('Error fetching review:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 4. PUT Route to Update a Review by ID
router.put(
  '/api/craftexreviews/:id',
  [
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().withMessage('Comment must be a string'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { rating, comment } = req.body;

      const review = await craftexReview.findById(req.params.id);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      if (rating) review.rating = rating;
      if (comment) review.comment = comment;

      const updatedReview = await review.save();
      res.status(200).json(updatedReview);
    } catch (err) {
      console.error('Error updating review:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);
// 5. DELETE Route to Delete a Review by ID
router.delete('/api/craftexreviews/:id', async (req, res) => {
  try {
    const review = await craftexReview.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});




module.exports = router