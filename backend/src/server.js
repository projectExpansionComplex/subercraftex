const express = require('express')
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')
const bodyParser = require('body-parser');
const globalErrorHandler = require('../controllers/errorController');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const app = express();
const Jimp = require('jimp');
const sharp = require('sharp');
const { body, validationResult } = require('express-validator');



// Enable trust proxy to handle X-Forwarded-For headers correctly
app.set('trust proxy', 1); // or 'true' for multiple proxies
// Secure Headers
app.disable('x-powered-by');

// Prevent NoSQL Injection & Sanitize Data
app.use(mongoSanitize());


// Prevent XSS Attacks
app.use(xss());

// Prevent HTTP Parameter Pollution
const hpp = require( 'hpp');

app.use(hpp());

// Setup the rate limiter
// const limiter = rateLimit({
//   max: 200, // Limit to 200 requests per IP
//   windowMs: 60 * 60 * 1000, // 1 hour
//   message: 'Too many requests from this IP, Please try again later!' // Error message
// });

// // Apply the rate limiter to all requests below
// app.use(limiter);



// app.use('/api', limiter);

app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(bodyParser.json());

// Data sanitization against no sq attacks
app.use(mongoSanitize());

// Datata sanitization against XSS vulnerabilities
app.use(xss());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// Serving Static files


// const uploadsubercrafteximage = multer({ craftexproductstorage });
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

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


// Multer configuration for file blogpost
const upload2 = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', 'blog-posts')); // Save files in 'uploads/products'
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

// Multer configuration for file sustainability
const upload4 = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', 'sustainability')); // Save files in 'uploads/products'
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
// Multer configuration for file virtual room
const upload5 = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', 'virtual-showrooms')); // Save files in 'uploads/products'
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




//on production
if(process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(__dirname,'../../frontend/dist')))
  app.get('/',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/explore',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/design/:design_uid',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/designers',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/designer/:designer_uid',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})

  app.get('/profile',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/post-project',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/projects',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/project/:project_uid',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/shop',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/cart',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/checkout',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/order-confirmation/:order_uid',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/challenges',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/forums',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/learn',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/events',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/admin',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/category/:category_uid',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/product/:product_uid',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/inspiration',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/custom-request',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/forum/:topic_uid',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/virtual-showroom',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/order-tracking/:order_uid',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  app.get('/sustainability',(req,res)=>{res.sendFile(path.join(__dirname,'../../frontend','dist','index.html'))})
  
  
  

}else{
  // on development
  
  app.get('/', (req,res)=>{
    res.send('pesEcommerce Api running');
    // res.render("index")
  })

}

// Routes
const comingSoonRoutes = require('../routes/comingSoonRoutes');
const subscriptionRoutes = require('../routes/subscriptionRoutes');
const announcementRoutes = require('../routes/announcementRoutes');

//routes
app.use('/api', require('../routes/authRouter'))
app.use('/api', require('../routes/userRouter'))

// Mount routes
app.use('/api/products', require('../routes/productRoutes'))
app.use('/api', require('../routes/categoryRouter'));
app.use('/api/tags', require('../routes/tagRouter'));
app.use('/api/wishlist', require('../routes/wishlistRoutes'));
app.use('/api/coupons', require('../routes/couponRoutes'));
app.use('/api/inventory', require('../routes/inventoryRoutes'));
app.use('/api/shipping', require('../routes/shippingRoutes'));
app.use('/api/coming-soon', comingSoonRoutes);
app.use('/api/subscribe', subscriptionRoutes);
app.use('/api/announcements', announcementRoutes);

//subercraftext correntrouts
// Routes
const craftexProduct = require( '../models/craftexProduct');
const craftexCategory = require( '../models/craftexCategory');
const craftexDesigner = require( '../models/craftexDesigner');
const craftexBlogPost = require( '../models/craftexBlogPost');
const craftexUser = require('../models/userModel')


// Import Models

//------------------------------------------------------ CRUD Operations for Products
app.get('/api/products-all', async (req, res) => {
  try {
    const products = await craftexProduct.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 1. Featured Products
app.get('/api/featured-products', async (req, res) => {
  try {
    const featuredProducts = await craftexProduct.find({ isFeatured: true });
    res.json(featuredProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post(
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
          .resize(150, 150) // Resize to 150x150
          .toFile(resizedThumbnailPath); // Save resized image to a new path

        thumbnailUrl = `/uploads/products/${req.files['thumbnail'][0].filename.replace(
          '.jpg',
          '-resized.jpg'
        )}`;
      }
      console.log(imageUrl, "this is image")
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

app.put('/api/craftexproducts/:id', async (req, res) => {
  try {
    const updatedProduct = await craftexProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/craftexproducts/:id', async (req, res) => {
  try {
    await craftexProduct.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Trending Products
app.get('/api/trending-products', async (req, res) => {
  try {
    const trendingProducts = await craftexProduct.find().sort({ salesCount: -1 }).limit(4);
    res.json(trendingProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//  ---------------------------------------------------------------- CRUD Operations for Categories
app.get('/api/craftexcategories-all', async (req, res) => {
  try {
    const categories = await craftexCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// 2. Category Products
app.get('/api/category-products', async (req, res) => {
  try {
    const categories = await craftexCategory.find().populate('craftexProducts');

    const categoryProducts = {};
    categories.forEach(category => {
      categoryProducts[category.name] = category.craftexProducts;
    });
    res.json(categoryProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST route to create a new category
app.post(
  '/api/craftexcategories',
  upload.single('image'), // Single file upload for the category image
  [
    // Validation middleware using express-validator
    body('name').notEmpty().withMessage('Name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description } = req.body;

      // Check if the category already exists
      const existingCategory = await craftexCategory.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }

      // Get file path for the uploaded image
      const imageUrl = req.file
        ? `/uploads/categories/${req.file.filename}`
        : null;

      // Create new category
      const category = new craftexCategory({
        name,
        description,
        imageUrl,
        craftexProducts: [], // Initialize with an empty array of products
      });

      // Save category to the database
      const savedCategory = await category.save();

      // Return the saved category
      res.status(201).json(savedCategory);
    } catch (err) {
      console.error('Error creating category:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

app.put('/api/craftexcategories/:id', async (req, res) => {
  try {
    const updatedCategory = await craftexCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/craftexcategories/:id', async (req, res) => {
  try {
    await craftexCategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// --------------------------------------------------------------------------------------------------------------------------------CRUD Operations for Blog Posts
app.get('/api/blog-posts', async (req, res) => {
  try {
    const blogPosts = await craftexBlogPost.find();
    res.json(blogPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Latest Blog Posts
app.get('/api/latest-blog-posts', async (req, res) => {
  try {
    const latestBlogPosts = await craftexBlogPost.find().sort({ publishDate: -1 }).limit(3);
    res.json(latestBlogPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.post('/api/blog-posts', async (req, res) => {
  const blogPost = new craftexBlogPost(req.body);
  try {
    const savedBlogPost = await blogPost.save();
    res.status(201).json(savedBlogPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/blog-posts/:id', async (req, res) => {
  try {
    const updatedBlogPost = await craftexBlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBlogPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/blog-posts/:id', async (req, res) => {
  try {
    await craftexBlogPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



//----------------------------------------------------------------blog post routes
// POST route to create a new blog post
app.post(
  '/api/craftexblogposts',
  upload2.single('image'), // Single file upload for the blog post image
  [
    // Validation middleware using express-validator
    body('title').notEmpty().withMessage('Title is required'),
    body('excerpt').notEmpty().withMessage('Excerpt is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('author').notEmpty().withMessage('Author ID is required'),
    body('tags').optional().isArray().withMessage('Tags must be an array of strings'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, excerpt, content, author, tags } = req.body;

      // Validate author
      const existingAuthor = await craftexUser.findById(author);
      if (!existingAuthor) {
        return res.status(400).json({ message: 'Invalid author ID' });
      }

      // Get file path for the uploaded image
      const imageUrl = req.file
        ? `/uploads/blog-posts/${req.file.filename}`
        : null;

      // Create new blog post
      const blogPost = new craftexBlogPost({
        title,
        excerpt,
        content,
        imageUrl,
        author,
        tags: tags || [], // Initialize tags as an empty array if not provided
      });

      // Save blog post to the database
      const savedBlogPost = await blogPost.save();

      // Return the saved blog post
      res.status(201).json(savedBlogPost);
    } catch (err) {
      console.error('Error creating blog post:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all blog posts
app.get('/api/craftexblogposts', async (req, res) => {
  try {
    const blogPosts = await craftexBlogPost.find().populate('author', 'name email'); // Populate author details
    res.status(200).json(blogPosts);
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single blog post by ID
app.get('/api/craftexblogposts/:id', async (req, res) => {
  try {
    const blogPost = await craftexBlogPost.findById(req.params.id).populate('author', 'name email'); // Populate author details
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.status(200).json(blogPost);
  } catch (err) {
    console.error('Error fetching blog post:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update a blog post by ID
app.put(
  '/api/craftexblogposts/:id',
  upload.single('image'), // Single file upload for the blog post image
  [
    // Validation middleware using express-validator
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('excerpt').optional().notEmpty().withMessage('Excerpt cannot be empty'),
    body('content').optional().notEmpty().withMessage('Content cannot be empty'),
    body('tags').optional().isArray().withMessage('Tags must be an array of strings'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, excerpt, content, tags } = req.body;

      // Find the blog post by ID
      const blogPost = await craftexBlogPost.findById(req.params.id);
      if (!blogPost) {
        return res.status(404).json({ message: 'Blog post not found' });
      }

      // Update fields if provided
      if (title) blogPost.title = title;
      if (excerpt) blogPost.excerpt = excerpt;
      if (content) blogPost.content = content;
      if (tags) blogPost.tags = tags;

      // Update image if provided
      if (req.file) {
        blogPost.imageUrl = `/uploads/blog-posts/${req.file.filename}`;
      }

      // Save updated blog post
      const updatedBlogPost = await blogPost.save();

      // Return the updated blog post
      res.status(200).json(updatedBlogPost);
    } catch (err) {
      console.error('Error updating blog post:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete a blog post by ID
app.delete('/api/craftexblogposts/:id', async (req, res) => {
  try {
    const blogPost = await craftexBlogPost.findByIdAndDelete(req.params.id);
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.status(200).json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog post:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//----------------------------------------------------------------working with Cart
// POST route to add an item to the cart
app.post(
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
app.get('/api/craftexcarts/:userId', async (req, res) => {
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
app.put(
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
app.delete('/api/craftexcarts/:cartId/items/:itemId', async (req, res) => {
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
app.delete('/api/craftexcarts/:cartId', async (req, res) => {
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


//customRequest
// POST route to create a new custom request
app.post(
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
      const existingUser = await User.findById(user);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Validate designer (if provided)
      if (designer) {
        const existingDesigner = await Designer.findById(designer);
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
app.get('/api/craftexcustomrequests', async (req, res) => {
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
app.get('/api/craftexcustomrequests/:id', async (req, res) => {
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
app.put(
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
        const existingDesigner = await Designer.findById(designer);
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
app.delete('/api/craftexcustomrequests/:id', async (req, res) => {
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

//---------------------------------------------------------------------//working on desinger

// POST route to create a new designer profile
app.post(
  '/api/craftexdesigners',
  [
    // Validation middleware using express-validator
    body('user').notEmpty().withMessage('User ID is required'),
    body('specialty').notEmpty().withMessage('Specialty is required'),
    body('bio').optional().isString().withMessage('Bio must be a string'),
    body('portfolio').optional().isArray().withMessage('Portfolio must be an array of URLs'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, specialty, bio, portfolio } = req.body;

      // Validate user
      const existingUser = await User.findById(user);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Check if the user already has a designer profile
      const existingDesigner = await craftexDesigner.findOne({ user });
      if (existingDesigner) {
        return res.status(400).json({ message: 'Designer profile already exists for this user' });
      }

      // Create new designer profile
      const designer = new craftexDesigner({
        user,
        specialty,
        bio,
        portfolio: portfolio || [], // Initialize portfolio as an empty array if not provided
      });

      // Save designer profile to the database
      const savedDesigner = await designer.save();

      // Return the saved designer profile
      res.status(201).json(savedDesigner);
    } catch (err) {
      console.error('Error creating designer profile:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all designers
app.get('/api/craftexdesigners', async (req, res) => {
  try {
    const designers = await craftexDesigner.find()
      .populate('user', 'name email') // Populate user details
      .populate('reviews.user', 'name'); // Populate reviewer details
    res.status(200).json(designers);
  } catch (err) {
    console.error('Error fetching designers:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single designer by ID
app.get('/api/craftexdesigners/:id', async (req, res) => {
  try {
    const designer = await craftexDesigner.findById(req.params.id)
      .populate('user', 'name email') // Populate user details
      .populate('reviews.user', 'name'); // Populate reviewer details
    if (!designer) {
      return res.status(404).json({ message: 'Designer not found' });
    }
    res.status(200).json(designer);
  } catch (err) {
    console.error('Error fetching designer:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update a designer profile by ID
app.put(
  '/api/craftexdesigners/:id',
  [
    // Validation middleware using express-validator
    body('specialty').optional().notEmpty().withMessage('Specialty cannot be empty'),
    body('bio').optional().isString().withMessage('Bio must be a string'),
    body('portfolio').optional().isArray().withMessage('Portfolio must be an array of URLs'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { specialty, bio, portfolio } = req.body;

      // Find the designer by ID
      const designer = await craftexDesigner.findById(req.params.id);
      if (!designer) {
        return res.status(404).json({ message: 'Designer not found' });
      }

      // Update fields if provided
      if (specialty) designer.specialty = specialty;
      if (bio) designer.bio = bio;
      if (portfolio) designer.portfolio = portfolio;

      // Save updated designer profile
      const updatedDesigner = await designer.save();

      // Return the updated designer profile
      res.status(200).json(updatedDesigner);
    } catch (err) {
      console.error('Error updating designer profile:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete a designer profile by ID
app.delete('/api/craftexdesigners/:id', async (req, res) => {
  try {
    const designer = await craftexDesigner.findByIdAndDelete(req.params.id);
    if (!designer) {
      return res.status(404).json({ message: 'Designer not found' });
    }
    res.status(200).json({ message: 'Designer profile deleted successfully' });
  } catch (err) {
    console.error('Error deleting designer profile:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST route to add a review to a designer profile
app.post(
  '/api/craftexdesigners/:id/reviews',
  [
    // Validation middleware using express-validator
    body('user').notEmpty().withMessage('User ID is required'),
    body('comment').optional().isString().withMessage('Comment must be a string'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, comment, rating } = req.body;

      // Validate user
      const existingUser = await User.findById(user);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Find the designer by ID
      const designer = await craftexDesigner.findById(req.params.id);
      if (!designer) {
        return res.status(404).json({ message: 'Designer not found' });
      }

      // Add the review
      designer.reviews.push({
        user,
        comment,
        rating,
      });

      // Recalculate the average rating
      const totalRatings = designer.reviews.reduce((sum, review) => sum + review.rating, 0);
      designer.rating = totalRatings / designer.reviews.length;

      // Save updated designer profile
      const updatedDesigner = await designer.save();

      // Return the updated designer profile
      res.status(201).json(updatedDesigner);
    } catch (err) {
      console.error('Error adding review:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// CRUD Operations for Designers
app.get('/api/designers', async (req, res) => {
  try {
    const designers = await craftexDesigner.find();
    res.json(designers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Featured Designers
app.get('/api/featured-designers', async (req, res) => {
  try {
    const featuredDesigners = await craftexDesigner.find({ isFeatured: true });
    res.json(featuredDesigners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/designers', async (req, res) => {
  const designer = new craftexDesigner(req.body);
  try {
    const savedDesigner = await designer.save();
    res.status(201).json(savedDesigner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/designers/:id', async (req, res) => {
  try {
    const updatedDesigner = await craftexDesigner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedDesigner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/designers/:id', async (req, res) => {
  try {
    await craftexDesigner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Designer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//----------------------------------------------------------------events------------------------------------------------------------


// POST route to create a new event
app.post(
  '/api/craftexevents',
  [
    // Validation middleware using express-validator
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('location').notEmpty().withMessage('Location is required'),
    body('organizer').notEmpty().withMessage('Organizer ID is required'),
    body('attendees').optional().isArray().withMessage('Attendees must be an array of user IDs'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, date, location, organizer, attendees } = req.body;

      // Validate organizer
      const existingOrganizer = await User.findById(organizer);
      if (!existingOrganizer) {
        return res.status(400).json({ message: 'Invalid organizer ID' });
      }

      // Validate attendees (if provided)
      if (attendees) {
        for (const attendee of attendees) {
          const existingAttendee = await User.findById(attendee);
          if (!existingAttendee) {
            return res.status(400).json({ message: `Invalid attendee ID: ${attendee}` });
          }
        }
      }

      // Create new event
      const event = new craftexEvent({
        title,
        description,
        date,
        location,
        organizer,
        attendees: attendees || [], // Initialize attendees as an empty array if not provided
      });

      // Save event to the database
      const savedEvent = await event.save();

      // Return the saved event
      res.status(201).json(savedEvent);
    } catch (err) {
      console.error('Error creating event:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all events
app.get('/api/craftexevents', async (req, res) => {
  try {
    const events = await craftexEvent.find()
      .populate('organizer', 'name email') // Populate organizer details
      .populate('attendees', 'name email'); // Populate attendee details
    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single event by ID
app.get('/api/craftexevents/:id', async (req, res) => {
  try {
    const event = await craftexEvent.findById(req.params.id)
      .populate('organizer', 'name email') // Populate organizer details
      .populate('attendees', 'name email'); // Populate attendee details
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update an event by ID
app.put(
  '/api/craftexevents/:id',
  [
    // Validation middleware using express-validator
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('location').optional().notEmpty().withMessage('Location cannot be empty'),
    body('attendees').optional().isArray().withMessage('Attendees must be an array of user IDs'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, date, location, attendees } = req.body;

      // Find the event by ID
      const event = await craftexEvent.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Update fields if provided
      if (title) event.title = title;
      if (description) event.description = description;
      if (date) event.date = date;
      if (location) event.location = location;
      if (attendees) {
        // Validate attendees
        for (const attendee of attendees) {
          const existingAttendee = await User.findById(attendee);
          if (!existingAttendee) {
            return res.status(400).json({ message: `Invalid attendee ID: ${attendee}` });
          }
        }
        event.attendees = attendees;
      }

      // Save updated event
      const updatedEvent = await event.save();

      // Return the updated event
      res.status(200).json(updatedEvent);
    } catch (err) {
      console.error('Error updating event:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete an event by ID
app.delete('/api/craftexevents/:id', async (req, res) => {
  try {
    const event = await craftexEvent.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST route to add an attendee to an event
app.post(
  '/api/craftexevents/:id/attendees',
  [
    // Validation middleware using express-validator
    body('attendee').notEmpty().withMessage('Attendee ID is required'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { attendee } = req.body;

      // Validate attendee
      const existingAttendee = await User.findById(attendee);
      if (!existingAttendee) {
        return res.status(400).json({ message: 'Invalid attendee ID' });
      }

      // Find the event by ID
      const event = await craftexEvent.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check if the attendee is already registered
      if (event.attendees.includes(attendee)) {
        return res.status(400).json({ message: 'Attendee is already registered for this event' });
      }

      // Add the attendee
      event.attendees.push(attendee);

      // Save updated event
      const updatedEvent = await event.save();

      // Return the updated event
      res.status(201).json(updatedEvent);
    } catch (err) {
      console.error('Error adding attendee:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);


//---------------------------------------------------------------forum  --------------------------------------------------------------

// POST route to create a new forum topic
app.post(
  '/api/craftexforums',
  [
    // Validation middleware using express-validator
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('user').notEmpty().withMessage('User ID is required'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, user } = req.body;

      // Validate user
      const existingUser = await User.findById(user);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Create new forum topic
      const forumTopic = new craftexForum({
        title,
        description,
        user,
      });

      // Save forum topic to the database
      const savedForumTopic = await forumTopic.save();

      // Return the saved forum topic
      res.status(201).json(savedForumTopic);
    } catch (err) {
      console.error('Error creating forum topic:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all forum topics
app.get('/api/craftexforums', async (req, res) => {
  try {
    const forumTopics = await craftexForum.find()
      .populate('user', 'name email') // Populate user details
      .populate('comments.user', 'name'); // Populate commenter details
    res.status(200).json(forumTopics);
  } catch (err) {
    console.error('Error fetching forum topics:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single forum topic by ID
app.get('/api/craftexforums/:id', async (req, res) => {
  try {
    const forumTopic = await craftexForum.findById(req.params.id)
      .populate('user', 'name email') // Populate user details
      .populate('comments.user', 'name'); // Populate commenter details
    if (!forumTopic) {
      return res.status(404).json({ message: 'Forum topic not found' });
    }
    res.status(200).json(forumTopic);
  } catch (err) {
    console.error('Error fetching forum topic:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update a forum topic by ID
app.put(
  '/api/craftexforums/:id',
  [
    // Validation middleware using express-validator
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description } = req.body;

      // Find the forum topic by ID
      const forumTopic = await craftexForum.findById(req.params.id);
      if (!forumTopic) {
        return res.status(404).json({ message: 'Forum topic not found' });
      }

      // Update fields if provided
      if (title) forumTopic.title = title;
      if (description) forumTopic.description = description;

      // Save updated forum topic
      const updatedForumTopic = await forumTopic.save();

      // Return the updated forum topic
      res.status(200).json(updatedForumTopic);
    } catch (err) {
      console.error('Error updating forum topic:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete a forum topic by ID
app.delete('/api/craftexforums/:id', async (req, res) => {
  try {
    const forumTopic = await craftexForum.findByIdAndDelete(req.params.id);
    if (!forumTopic) {
      return res.status(404).json({ message: 'Forum topic not found' });
    }
    res.status(200).json({ message: 'Forum topic deleted successfully' });
  } catch (err) {
    console.error('Error deleting forum topic:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST route to add a comment to a forum topic
app.post(
  '/api/craftexforums/:id/comments',
  [
    // Validation middleware using express-validator
    body('user').notEmpty().withMessage('User ID is required'),
    body('text').notEmpty().withMessage('Comment text is required'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, text } = req.body;

      // Validate user
      const existingUser = await User.findById(user);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Find the forum topic by ID
      const forumTopic = await craftexForum.findById(req.params.id);
      if (!forumTopic) {
        return res.status(404).json({ message: 'Forum topic not found' });
      }

      // Add the comment
      forumTopic.comments.push({
        user,
        text,
      });

      // Save updated forum topic
      const updatedForumTopic = await forumTopic.save();

      // Return the updated forum topic
      res.status(201).json(updatedForumTopic);
    } catch (err) {
      console.error('Error adding comment:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);


//----------------------------------------------------------------inspiration-----------------------------------------------------------------------

// POST route to create a new inspiration post
app.post(
  '/api/craftexinspirations',
  upload3.single('image'), // Single file upload for the inspiration image
  [
    // Validation middleware using express-validator
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('createdBy').notEmpty().withMessage('User ID is required'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, createdBy } = req.body;

      // Validate user
      const existingUser = await User.findById(createdBy);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Get file path for the uploaded image
      const imageUrl = req.file
        ? `/uploads/inspirations/${req.file.filename}`
        : null;

      // Create new inspiration post
      const inspiration = new craftexInspiration({
        title,
        description,
        imageUrl,
        createdBy,
      });

      // Save inspiration post to the database
      const savedInspiration = await inspiration.save();

      // Return the saved inspiration post
      res.status(201).json(savedInspiration);
    } catch (err) {
      console.error('Error creating inspiration post:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all inspiration posts
app.get('/api/craftexinspirations', async (req, res) => {
  try {
    const inspirations = await craftexInspiration.find()
      .populate('createdBy', 'name email'); // Populate user details
    res.status(200).json(inspirations);
  } catch (err) {
    console.error('Error fetching inspiration posts:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single inspiration post by ID
app.get('/api/craftexinspirations/:id', async (req, res) => {
  try {
    const inspiration = await craftexInspiration.findById(req.params.id)
      .populate('createdBy', 'name email'); // Populate user details
    if (!inspiration) {
      return res.status(404).json({ message: 'Inspiration post not found' });
    }
    res.status(200).json(inspiration);
  } catch (err) {
    console.error('Error fetching inspiration post:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update an inspiration post by ID
app.put(
  '/api/craftexinspirations/:id',
  upload3.single('image'), // Single file upload for the inspiration image
  [
    // Validation middleware using express-validator
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description } = req.body;

      // Find the inspiration post by ID
      const inspiration = await craftexInspiration.findById(req.params.id);
      if (!inspiration) {
        return res.status(404).json({ message: 'Inspiration post not found' });
      }

      // Update fields if provided
      if (title) inspiration.title = title;
      if (description) inspiration.description = description;

      // Update image if provided
      if (req.file) {
        inspiration.imageUrl = `/uploads/inspirations/${req.file.filename}`;
      }

      // Save updated inspiration post
      const updatedInspiration = await inspiration.save();

      // Return the updated inspiration post
      res.status(200).json(updatedInspiration);
    } catch (err) {
      console.error('Error updating inspiration post:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete an inspiration post by ID
app.delete('/api/craftexinspirations/:id', async (req, res) => {
  try {
    const inspiration = await craftexInspiration.findByIdAndDelete(req.params.id);
    if (!inspiration) {
      return res.status(404).json({ message: 'Inspiration post not found' });
    }
    res.status(200).json({ message: 'Inspiration post deleted successfully' });
  } catch (err) {
    console.error('Error deleting inspiration post:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//----------------------------------------------------------------learning resource----------------------------------------------------------------


// POST route to create a new learning resource
app.post(
  '/api/craftexlearningresources',
  [
    // Validation middleware using express-validator
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('type').isIn(['article', 'video', 'tutorial']).withMessage('Type must be one of: article, video, tutorial'),
    body('url').notEmpty().withMessage('URL is required'),
    body('createdBy').notEmpty().withMessage('User ID is required'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, type, url, createdBy } = req.body;

      // Validate user
      const existingUser = await User.findById(createdBy);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Create new learning resource
      const learningResource = new craftexLearningResource({
        title,
        description,
        type,
        url,
        createdBy,
      });

      // Save learning resource to the database
      const savedLearningResource = await learningResource.save();

      // Return the saved learning resource
      res.status(201).json(savedLearningResource);
    } catch (err) {
      console.error('Error creating learning resource:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all learning resources
app.get('/api/craftexlearningresources', async (req, res) => {
  try {
    const learningResources = await craftexLearningResource.find()
      .populate('createdBy', 'name email'); // Populate user details
    res.status(200).json(learningResources);
  } catch (err) {
    console.error('Error fetching learning resources:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single learning resource by ID
app.get('/api/craftexlearningresources/:id', async (req, res) => {
  try {
    const learningResource = await craftexLearningResource.findById(req.params.id)
      .populate('createdBy', 'name email'); // Populate user details
    if (!learningResource) {
      return res.status(404).json({ message: 'Learning resource not found' });
    }
    res.status(200).json(learningResource);
  } catch (err) {
    console.error('Error fetching learning resource:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to update a learning resource by ID
app.put(
  '/api/craftexlearningresources/:id',
  [
    // Validation middleware using express-validator
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('type').optional().isIn(['article', 'video', 'tutorial']).withMessage('Type must be one of: article, video, tutorial'),
    body('url').optional().notEmpty().withMessage('URL cannot be empty'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, type, url } = req.body;

      // Find the learning resource by ID
      const learningResource = await craftexLearningResource.findById(req.params.id);
      if (!learningResource) {
        return res.status(404).json({ message: 'Learning resource not found' });
      }

      // Update fields if provided
      if (title) learningResource.title = title;
      if (description) learningResource.description = description;
      if (type) learningResource.type = type;
      if (url) learningResource.url = url;

      // Save updated learning resource
      const updatedLearningResource = await learningResource.save();

      // Return the updated learning resource
      res.status(200).json(updatedLearningResource);
    } catch (err) {
      console.error('Error updating learning resource:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete a learning resource by ID
app.delete('/api/craftexlearningresources/:id', async (req, res) => {
  try {
    const learningResource = await craftexLearningResource.findByIdAndDelete(req.params.id);
    if (!learningResource) {
      return res.status(404).json({ message: 'Learning resource not found' });
    }
    res.status(200).json({ message: 'Learning resource deleted successfully' });
  } catch (err) {
    console.error('Error deleting learning resource:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//----------------------------------------------------------------notification--------------------------------------------------------------------

// POST route to create a new notification
app.post(
  '/api/craftexnotifications',
  [
    // Validation middleware using express-validator
    body('user').notEmpty().withMessage('User ID is required'),
    body('type').isIn(['success', 'error', 'info']).withMessage('Type must be one of: success, error, info'),
    body('message').notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { user, type, message } = req.body;

      // Validate user
      const existingUser = await User.findById(user);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Create new notification
      const notification = new craftexNotification({
        user,
        type,
        message,
      });

      // Save notification to the database
      const savedNotification = await notification.save();

      // Return the saved notification
      res.status(201).json(savedNotification);
    } catch (err) {
      console.error('Error creating notification:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// GET route to fetch all notifications for a user
app.get('/api/craftexnotifications/:userId', async (req, res) => {
  try {
    const notifications = await craftexNotification.find({ user: req.params.userId })
      .populate('user', 'name email'); // Populate user details
    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT route to mark a notification as read
app.put(
  '/api/craftexnotifications/:id/read',
  async (req, res) => {
    try {
      // Find the notification by ID
      const notification = await craftexNotification.findById(req.params.id);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      // Mark the notification as read
      notification.isRead = true;

      // Save updated notification
      const updatedNotification = await notification.save();

      // Return the updated notification
      res.status(200).json(updatedNotification);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// DELETE route to delete a notification by ID
app.delete('/api/craftexnotifications/:id', async (req, res) => {
  try {
    const notification = await craftexNotification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
//----------------------------------------------------------------orders--------------------------------------------------------------


// POST route to create a new order
app.post(
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
app.get('/api/craftexorders/:userId', async (req, res) => {
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
app.get('/api/craftexorders/:id', async (req, res) => {
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
app.put(
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
app.delete('/api/craftexorders/:id', async (req, res) => {
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

//-------------------------------------------------oreder tracking--------


// POST route to create a new order tracking record
app.post(
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
app.get('/api/craftexordertrackings/:orderId', async (req, res) => {
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
app.get('/api/craftexordertrackings/:id', async (req, res) => {
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
app.put(
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
app.delete('/api/craftexordertrackings/:id', async (req, res) => {
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

//----------------------------------------------crud onproject model

app.post(
  '/api/craftexprojects',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('user').notEmpty().withMessage('User ID is required'),
    body('designer').optional().isMongoId().withMessage('Invalid Designer ID'),
    body('status').optional().isIn(['open', 'in-progress', 'completed']).withMessage('Invalid status'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, user, designer, status } = req.body;

      // Validate user
      const existingUser = await User.findById(user);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Validate designer if provided
      if (designer) {
        const existingDesigner = await Designer.findById(designer);
        if (!existingDesigner) {
          return res.status(400).json({ message: 'Invalid designer ID' });
        }
      }

      const newProject = new craftexProject({
        title,
        description,
        user,
        designer,
        status,
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
app.get('/api/craftexprojects', async (req, res) => {
  try {
    const projects = await craftexProject.find()
      .populate('user', 'name email')
      .populate('designer', 'name email');
    res.status(200).json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET Route to Fetch a Single Project by ID
app.get('/api/craftexprojects/:id', async (req, res) => {
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
app.put(
  '/api/craftexprojects/:id',
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('designer').optional().isMongoId().withMessage('Invalid Designer ID'),
    body('status').optional().isIn(['open', 'in-progress', 'completed']).withMessage('Invalid status'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, designer, status } = req.body;

      const project = await craftexProject.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (title) project.title = title;
      if (description) project.description = description;
      if (designer) {
        const existingDesigner = await Designer.findById(designer);
        if (!existingDesigner) {
          return res.status(400).json({ message: 'Invalid designer ID' });
        }
        project.designer = designer;
      }
      if (status) project.status = status;

      const updatedProject = await project.save();
      res.status(200).json(updatedProject);
    } catch (err) {
      console.error('Error updating project:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// 5. DELETE Route to Delete a Project by ID
app.delete('/api/craftexprojects/:id', async (req, res) => {
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
app.post(
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

      const existingUser = await User.findById(user);
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
// ----------------------------------------------revies----------
// POST Route to Create a New Review

app.post(
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
      const existingUser = await User.findById(user);
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
      res.status(201).json(savedReview);
    } catch (err) {
      console.error('Error creating review:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// 2. GET Route to Fetch All Reviews
app.get('/api/craftexreviews', async (req, res) => {
  try {
    const reviews = await craftexReview.find()
      .populate('user', 'name email')
      .populate('product', 'name')
      .populate('designer', 'name');

    res.status(200).json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
//3. GET Route to Fetch a Single Review by ID
app.get('/api/craftexreviews/:id', async (req, res) => {
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
app.put(
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
app.delete('/api/craftexreviews/:id', async (req, res) => {
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
// 6. GET Route to Fetch Reviews by Product or Designer
app.get('/api/craftexreviews', async (req, res) => {
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

//------------------------------------------------sustainability-----------------
// 1. POST Route to Create a New Sustainability Content

app.post(
  '/api/craftexsustainability',
  upload4.fields([
    { name: 'image', maxCount: 1 }, // Main image
    { name: 'thumbnail', maxCount: 1 }, // Thumbnail
  ]),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('createdBy').notEmpty().withMessage('CreatedBy user ID is required').isMongoId().withMessage('Invalid User ID'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, content, tags, createdBy } = req.body;

      // Validate user
      const existingUser = await User.findById(createdBy);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Get file paths
      const imageUrl = req.files['image']
        ? `/uploads/sustainability/${req.files['image'][0].filename}`
        : null;

      let thumbnailUrl = null;
      if (req.files['thumbnail']) {
        const thumbnailPath = path.join(
          __dirname,
          '..',
          'uploads',
          'sustainability',
          req.files['thumbnail'][0].filename
        );
        const resizedThumbnailPath = thumbnailPath.replace('.jpg', '-resized.jpg'); // New path for resized image

        // Resize thumbnail using sharp
        await sharp(req.files['thumbnail'][0].path)
          .resize(150, 150) // Resize to 150x150
          .toFile(resizedThumbnailPath); // Save resized image to a new path

        thumbnailUrl = `/uploads/sustainability/${req.files['thumbnail'][0].filename.replace(
          '.jpg',
          '-resized.jpg'
        )}`;
      }

      const newSustainability = new craftexSustainability({
        title,
        description,
        imageUrl,
        thumbnail: thumbnailUrl, // Save thumbnail URL
        content,
        tags,
        createdBy,
      });

      const savedSustainability = await newSustainability.save();
      res.status(201).json(savedSustainability);
    } catch (err) {
      console.error('Error creating sustainability content:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);
// 3. PUT Route to Update Sustainability Content with Image Upload
app.put(
  '/api/craftexsustainability/:id',
  upload.fields([
    { name: 'image', maxCount: 1 }, // Main image
    { name: 'thumbnail', maxCount: 1 }, // Thumbnail
  ]),
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('content').optional().notEmpty().withMessage('Content cannot be empty'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, content, tags } = req.body;

      const sustainability = await craftexSustainability.findById(req.params.id);
      if (!sustainability) {
        return res.status(404).json({ message: 'Sustainability content not found' });
      }

      // Update fields if provided
      if (title) sustainability.title = title;
      if (description) sustainability.description = description;
      if (content) sustainability.content = content;
      if (tags) sustainability.tags = tags;

      // Handle image updates
      if (req.files['image']) {
        sustainability.imageUrl = `/uploads/sustainability/${req.files['image'][0].filename}`;
      }

      if (req.files['thumbnail']) {
        const thumbnailPath = path.join(
          __dirname,
          '..',
          'uploads',
          'sustainability',
          req.files['thumbnail'][0].filename
        );
        const resizedThumbnailPath = thumbnailPath.replace('.jpg', '-resized.jpg');

        // Resize thumbnail using sharp
        await sharp(req.files['thumbnail'][0].path)
          .resize(150, 150)
          .toFile(resizedThumbnailPath);

        sustainability.thumbnail = `/uploads/sustainability/${req.files['thumbnail'][0].filename.replace(
          '.jpg',
          '-resized.jpg'
        )}`;
      }

      sustainability.updatedAt = Date.now(); // Update the timestamp

      const updatedSustainability = await sustainability.save();
      res.status(200).json(updatedSustainability);
    } catch (err) {
      console.error('Error updating sustainability content:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// 4. GET Route to Fetch All Sustainability Content
app.get('/api/craftexsustainability', async (req, res) => {
  try {
    const sustainabilityContent = await craftexSustainability.find()
      .populate('createdBy', 'name email'); // Populate the user who created the content

    res.status(200).json(sustainabilityContent);
  } catch (err) {
    console.error('Error fetching sustainability content:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 5. GET Route to Fetch a Single Sustainability Content by ID
app.get('/api/craftexsustainability/:id', async (req, res) => {
  try {
    const sustainability = await craftexSustainability.findById(req.params.id)
      .populate('createdBy', 'name email'); // Populate the user who created the content

    if (!sustainability) {
      return res.status(404).json({ message: 'Sustainability content not found' });
    }

    res.status(200).json(sustainability);
  } catch (err) {
    console.error('Error fetching sustainability content:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// 6. DELETE Route to Delete Sustainability Content by ID
app.delete('/api/craftexsustainability/:id', async (req, res) => {
  try {
    const sustainability = await craftexSustainability.findByIdAndDelete(req.params.id);
    if (!sustainability) {
      return res.status(404).json({ message: 'Sustainability content not found' });
    }
    res.status(200).json({ message: 'Sustainability content deleted successfully' });
  } catch (err) {
    console.error('Error deleting sustainability content:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//--------------------virtual show room -----------------------


app.post(
  '/api/craftexvirtualshowrooms',
  upload5.array('images', 10), // Allow up to 10 images
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('createdBy').notEmpty().withMessage('CreatedBy user ID is required').isMongoId().withMessage('Invalid User ID'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, createdBy } = req.body;

      // Validate user
      const existingUser = await User.findById(createdBy);
      if (!existingUser) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Get file paths
      const images = req.files.map((file) => `/uploads/virtual-showrooms/${file.filename}`);

      const newVirtualShowroom = new craftexVirtualShowroom({
        title,
        description,
        images,
        createdBy,
      });

      const savedVirtualShowroom = await newVirtualShowroom.save();
      res.status(201).json(savedVirtualShowroom);
    } catch (err) {
      console.error('Error creating virtual showroom:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// 3. PUT Route to Update a Virtual Showroom with Image Uploads
app.put(
  '/api/craftexvirtualshowrooms/:id',
  upload.array('images', 10), // Allow up to 10 images
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description } = req.body;

      const virtualShowroom = await craftexVirtualShowroom.findById(req.params.id);
      if (!virtualShowroom) {
        return res.status(404).json({ message: 'Virtual showroom not found' });
      }

      // Update fields if provided
      if (title) virtualShowroom.title = title;
      if (description) virtualShowroom.description = description;

      // Handle image updates
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => `/uploads/virtual-showrooms/${file.filename}`);
        virtualShowroom.images = [...virtualShowroom.images, ...newImages]; // Append new images
      }

      virtualShowroom.updatedAt = Date.now(); // Update the timestamp

      const updatedVirtualShowroom = await virtualShowroom.save();
      res.status(200).json(updatedVirtualShowroom);
    } catch (err) {
      console.error('Error updating virtual showroom:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// 4. GET Route to Fetch All Virtual Showrooms
app.get('/api/craftexvirtualshowrooms', async (req, res) => {
  try {
    const virtualShowrooms = await craftexVirtualShowroom.find()
      .populate('createdBy', 'name email'); // Populate the user who created the showroom

    res.status(200).json(virtualShowrooms);
  } catch (err) {
    console.error('Error fetching virtual showrooms:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// 5. GET Route to Fetch a Single Virtual Showroom by ID
app.get('/api/craftexvirtualshowrooms/:id', async (req, res) => {
  try {
    const virtualShowroom = await craftexVirtualShowroom.findById(req.params.id)
      .populate('createdBy', 'name email'); // Populate the user who created the showroom

    if (!virtualShowroom) {
      return res.status(404).json({ message: 'Virtual showroom not found' });
    }

    res.status(200).json(virtualShowroom);
  } catch (err) {
    console.error('Error fetching virtual showroom:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// . DELETE Route to Delete a Virtual Showroom by ID
app.delete('/api/craftexvirtualshowrooms/:id', async (req, res) => {
  try {
    const virtualShowroom = await craftexVirtualShowroom.findByIdAndDelete(req.params.id);
    if (!virtualShowroom) {
      return res.status(404).json({ message: 'Virtual showroom not found' });
    }
    res.status(200).json({ message: 'Virtual showroom deleted successfully' });
  } catch (err) {
    console.error('Error deleting virtual showroom:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 7. DELETE Route to Remove Specific Images from a Virtual Showroom
app.delete('/api/craftexvirtualshowrooms/:id/images', async (req, res) => {
  try {
    const { imageUrl } = req.body; // URL of the image to delete

    const virtualShowroom = await craftexVirtualShowroom.findById(req.params.id);
    if (!virtualShowroom) {
      return res.status(404).json({ message: 'Virtual showroom not found' });
    }

    // Remove the image from the array
    virtualShowroom.images = virtualShowroom.images.filter((image) => image !== imageUrl);

    await virtualShowroom.save();
    res.status(200).json({ message: 'Image removed successfully', virtualShowroom });
  } catch (err) {
    console.error('Error removing image from virtual showroom:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});







// Use Error Handler
app.use(globalErrorHandler);


module.exports = app;