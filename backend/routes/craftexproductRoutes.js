const express = require('express');
const craftexProduct = require( '../models/craftexProduct');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const craftexUser = require('../models/userModel')
const craftexCategory = require('../models/craftexCategory')

const path = require('path')
const sharp = require('sharp');
const {auth, authorize} = require('../middleware/authMiddlerware')

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

//------------------------------------------------------ CRUD Operations for Products
router.get('/api/products-all', async (req, res) => {
  try {
    const products = await craftexProduct.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 1. Featured Products
router.get('/api/featured-products', async (req, res) => {
  try {
    const featuredProducts = await craftexProduct.find({ isFeatured: true });
    res.json(featuredProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  '/api/craftexproducts',
  upload.fields([
    { name: 'image', maxCount: 1 }, // Main image
    { name: 'thumbnail', maxCount: 1 }, // Thumbnail
  ]),
  [
    // Validation middleware using express-validator
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('category').notEmpty().withMessage('Category ID is required'),
    body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, price, isFeatured, category,designer,stock } = req.body;

      // Validate category
      const existingCategory = await craftexCategory.findById(category);
      
      if (!existingCategory) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }


      // Validate user
      const existingdesigner = await craftexUser.findById(designer);
      if (!existingdesigner) {
        return res.status(400).json({ message: 'Invalid desinger ID' });
      }

      // Get file paths
      const imageUrl = req.files['image']
        ? `/uploads/products/${req.files['image'][0].filename}`
        : null;

      let thumbnailUrl = null;
      if (req.files['thumbnail']) {
        const thumbnailPath = path.join(
          __dirname,
          '..',
          'uploads',
          'products',
          req.files['thumbnail'][0].filename
        );
        const resizedThumbnailPath = thumbnailPath.replace('.jpg', '-resized.jpg'); // New path for resized image

        // Resize thumbnail using sharp
        await sharp(req.files['thumbnail'][0].path)
        .resize(150, 150, {
          fit: 'inside', // Preserve aspect ratio, fit within 150x150
          withoutEnlargement: true, // Do not enlarge the image if it's smaller than 150x150
        })
          .toFile(resizedThumbnailPath); // Save resized image to a new path

        thumbnailUrl = `/uploads/products/${req.files['thumbnail'][0].filename.replace(
          '.jpg',
          '-resized.jpg'
        )}`;
      }
     
      // Create new product
      const product = new craftexProduct({
        name,
        description,
        imageUrl : imageUrl,
        thumbnail: thumbnailUrl, // Save thumbnail URL
        price,
        isFeatured: isFeatured || false, // Default to false if not provided
        salesCount: 0, // Initialize sales count to 0
        craftexCategory : category,
        designer,
        stock
      });

      // Save product to the database
      const savedProduct = await product.save();

      // Add the product to the category's products array
      existingCategory.craftexProducts.push(savedProduct._id);
      await existingCategory.save();

      // Return the saved product
      res.status(201).json(savedProduct);
    } catch (err) {
      console.error('Error creating product:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

router.put('/api/craftexproducts/:id', async (req, res) => {
  try {
    const updatedProduct = await craftexProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/api/craftexproducts/:id', async (req, res) => {
  try {
    await craftexProduct.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Trending Products
router.get('/api/trending-products', async (req, res) => {
  try {
    const trendingProducts = await craftexProduct.find().sort({ salesCount: -1 }).limit(4);
    res.json(trendingProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//------------------------------------------------------ Personalized Products
router.get('/api/personalized-products', auth, async (req, res) => {
  try {
  
    const userId = req.user.id; // Extracted from the JWT token

    // Find the user and their preferences
    const user = await craftexUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If the user has no preferences, return trending products
    if (!user.preferredCategories || user.preferredCategories.length === 0) {
      const trendingProducts = await craftexProduct.find().sort({ salesCount: -1 }).limit(8);
      return res.status(200).json(trendingProducts);
    }

    // Fetch products that match the user's preferred categories or tags
    const personalizedProducts = await craftexProduct.find({
      $or: [
        { craftexCategory: { $in: user.preferredCategories } }, // Match by category
        { tags: { $in: user.preferredTags || [] } }, // Match by tags (if available)
      ],
    }).limit(8); // Limit to 8 recommendations

    res.status(200).json(personalizedProducts);
  } catch (err) {
    console.error('Error fetching personalized products:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
module.exports = router