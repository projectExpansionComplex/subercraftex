const express = require('express');
const craftexProduct = require( '../models/craftexProduct');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const craftexUser = require('../models/userModel')
const craftexCategory = require('../models/craftexCategory')
const craftexDesigner= require('../models/craftexDesigner')
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
// GET /api/products-all with filtering, pagination, and sorting
router.get('/api/products-all', async (req, res) => {
  try {
    // Extract query parameters
    const {
      category_uid,
      page = 1,
      limit = 20,
      sort = 'popularity',
      price_min,
      price_max,
      designer,
      country,
      material,
    } = req.query;

    // Build the query object
    const query = {};

    // Filter by category_uid (category name)
    if (category_uid) {
      // Find the category by its name to get its ObjectId
      const category = await craftexCategory.findOne({ name: category_uid });
      
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      query.craftexCategory = category._id; // Use the ObjectId of the category
    }

    // Filter by price range
    if (price_min || price_max) {
      query.price = {};
      if (price_min) query.price.$gte = parseFloat(price_min);
      if (price_max) query.price.$lte = parseFloat(price_max);
    }

    // Filter by designer
    if (designer) {
      query.designer = designer;
    }

    // Filter by country
    if (country) {
      query.country = country;
    }

    // Filter by material
    if (material) {
      query.material = material;
    }

    // Build the sort object
    const sortOptions = {};
    if (sort === 'popularity') {
      sortOptions.popularity = -1; // Sort by popularity in descending order
    } else if (sort === 'price_asc') {
      sortOptions.price = 1; // Sort by price in ascending order
    } else if (sort === 'price_desc') {
      sortOptions.price = -1; // Sort by price in descending order
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch products with filtering, sorting, and pagination
    const products = await craftexProduct
      .find(query)
      .populate('craftexCategory') // Populate the category details
      .populate('designer')
      .populate('ratings')
      .populate('sustainability_metrics')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count of products (for pagination metadata)
    const totalProducts = await craftexProduct.countDocuments(query);

    // Send response with products and pagination metadata
    res.json({
      success: true,
      totalProducts,
      page: parseInt(page),
      limit: parseInt(limit),
      products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/api/products-all-shop', async (req, res) => {
  try {
    // Extract query parameters
    const {
      category_uid,
      page = 1,
      limit = 20,
      sort = 'popularity',
      price_min,
      price_max,
      designer,
      country,
      material,
      search, // Add search query parameter
    } = req.query;

    // Build the query object
    const query = {};

    // Filter by category_uid (category name)
    if (category_uid) {
      query.craftexCategory = category_uid; // Use the ObjectId of the category
    }

    // Filter by price range
    if (price_min || price_max) {
      query.price = {};
      if (price_min) query.price.$gte = parseFloat(price_min);
      if (price_max) query.price.$lte = parseFloat(price_max);
    }

    // Filter by designer
    if (designer) {
      query.designer = designer;
    }

    // Filter by country
    if (country) {
      query.country = country;
    }

    // Filter by material
    if (material) {
      query.material = material;
    }

    // Handle search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } }, // Case-insensitive search in name
        { description: { $regex: search, $options: 'i' } }, // Case-insensitive search in description
        // Add other fields you want to search in
      ];
    }

    // Build the sort object
    const sortOptions = {};
    if (sort === 'popularity') {
      sortOptions.popularity = -1; // Sort by popularity in descending order
    } else if (sort === 'price_asc') {
      sortOptions.price = 1; // Sort by price in ascending order
    } else if (sort === 'price_desc') {
      sortOptions.price = -1; // Sort by price in descending order
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch products with filtering, sorting, and pagination
    const products = await craftexProduct
      .find(query)
      .populate('craftexCategory') // Populate the category details
      .populate('designer')
      .populate('ratings')
      .populate('sustainability_metrics')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count of products (for pagination metadata)
    const totalProducts = await craftexProduct.countDocuments(query);

    // Send response with products and pagination metadata
    res.json({
      success: true,
      totalProducts,
      page: parseInt(page),
      limit: parseInt(limit),
      products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    { name: 'images', maxCount: 5 }, // Allow up to 5 images
    { name: 'thumbnail', maxCount: 1 }, // Thumbnail
  ]),
  [
    // Validation middleware using express-validator
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('category').notEmpty().withMessage('Category ID is required'),
    body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
    body('variants').optional().isArray().withMessage('Variants must be an array'),
    body('variants.*.name').notEmpty().withMessage('Variant name is required'),
    body('variants.*.price').isFloat({ min: 0 }).withMessage('Variant price must be a non-negative number'),
    body('variants.*.stock').isInt({ min: 0 }).withMessage('Variant stock must be a non-negative integer'),
    body('materials').optional().isArray().withMessage('Materials must be an array'),
    body('dimensions.length').optional().isFloat({ min: 0 }).withMessage('Length must be a non-negative number'),
    body('dimensions.width').optional().isFloat({ min: 0 }).withMessage('Width must be a non-negative number'),
    body('dimensions.height').optional().isFloat({ min: 0 }).withMessage('Height must be a non-negative number'),
    body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a non-negative number'),
    body('country_of_origin').optional().isString().withMessage('Country of origin must be a string'),
    body('sustainability_metrics').notEmpty().withMessage('Sustainability metrics ID is required'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { 
        name, 
        description, 
        price, 
        isFeatured, 
        category, 
        designer, 
        stock, 
        variants, 
        materials, 
        dimensions, 
        weight, 
        country_of_origin,
        sustainability_metrics // Add sustainability_metrics
      } = req.body;

      // Validate category
      const existingCategory = await craftexCategory.findById(category);
      if (!existingCategory) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }

      // Validate designer
      const existingDesigner = await craftexDesigner.findById(designer);
      if (!existingDesigner) {
        return res.status(400).json({ message: 'Invalid designer ID' });
      }

      // Process multiple images
      const imageUrls = req.files['images']
        ? req.files['images'].map(file => `/uploads/products/${file.filename}`)
        : [];

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

      // Convert attributes to Map if using Map type
      const processedVariants = variants.map(variant => ({
        ...variant,
        attributes: new Map(Object.entries(variant.attributes || {})),
      }));

      // Create new product
      const product = new craftexProduct({
        name,
        description,
        images: imageUrls, // Save array of image URLs
        thumbnail: thumbnailUrl, // Save thumbnail URL
        price,
        isFeatured: isFeatured || false, // Default to false if not provided
        salesCount: 0, // Initialize sales count to 0
        craftexCategory: category,
        designer,
        stock,
        variants: processedVariants, // Save variants if provided
        materials: materials || [], // Save materials if provided
        dimensions: dimensions || { length: 0, width: 0, height: 0 }, // Save dimensions if provided
        weight: weight || 0, // Save weight if provided
        country_of_origin: country_of_origin || '', // Save country of origin if provided
        sustainability_metrics: sustainability_metrics || null, // Save sustainability metrics if provided
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
    const { 
      variants, 
      materials, 
      dimensions, 
      weight, 
      country_of_origin, 
      ...otherUpdates 
    } = req.body;

    // Update product fields
    const updatedProduct = await craftexProduct.findByIdAndUpdate(
      req.params.id,
      { 
        ...otherUpdates, 
        variants: variants || [], // Update variants if provided
        materials: materials || [], // Update materials if provided
        dimensions: dimensions || { length: 0, width: 0, height: 0 }, // Update dimensions if provided
        weight: weight || 0, // Update weight if provided
        country_of_origin: country_of_origin || '', // Update country of origin if provided
      },
      { new: true }
    );

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



// New route: Filter products by category and limit results
router.get('/api/craftexproductsbycategory', async (req, res) => {
  try {
    const { category_uid, limit } = req.query;

    if (!category_uid) {
      return res.status(400).json({ message: 'Category UID is required' });
    }

    // Check if category exists
    const categoryExists = await craftexCategory.findById(category_uid);
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Fetch products by category
    const query = { craftexCategory: category_uid };
    

    const products = await craftexProduct
      .find(query)
      .populate('craftexCategory') // Include category details
      .limit(limit ? parseInt(limit) : 0) // Apply limit if provided
      .exec();

    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products by category:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.get('/api/craftexproducts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product by ID and populate category & designer details
    const product = await craftexProduct
      .findById(id)
      .populate('craftexCategory') // Include category details
      .populate('designer', 'name email') // Include designer name & email only
      .populate('sustainability_metrics') // Include sustainability metrics details
      .populate('ratings') // Include rating details
      .exec();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error('Error fetching product by ID:', err);
    res.status(500).json({ message: 'Internal server error' });
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