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

// File upload configuration
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const dir = './storage';
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir);
//     }
//     cb(null, dir);
//   },
//   filename: function (req, file, cb) {
//     cb(null, uuidv4() + path.extname(file.originalname));
//   }
// });
// const upload = multer({ storage: storage });



// Multer configuration for file uploads
// const craftexproductstorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = '../uploads/craftexproducts';
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir);
//     }
//     cb(null, 'uploads/craftexproducts'); // Save images in the 'uploads/craftexproducts' folder
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + '-' + file.originalname); // Unique filename
//   }
// });

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

// const upload = multer({ storage });


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



// Import Models

// CRUD Operations for Products
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

app.post('/api/craftexproducts', upload.fields([
  { name: 'image', maxCount: 1 }, // Main image
  { name: 'thumbnail', maxCount: 1 } // Thumbnail
]), async (req, res) => {
  try {


    const { name, description, price, isFeatured, category } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    } 
    
    // Validate category
    const existingCategory = await craftexCategory.findById(category);
    if (!existingCategory) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    // const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;
     // Get file paths
     const imageUrl = req.files['image'] ? `/uploads/products/${req.files['image'][0].filename}` : null;
     let thumbnailUrl = null;
     if (req.files['thumbnail']) {
       const thumbnailPath = path.join(__dirname, '..', 'uploads', 'products', req.files['thumbnail'][0].filename);
       const resizedThumbnailPath = thumbnailPath.replace('.jpg', '-resized.jpg'); // New path for resized image
 
       // Resize thumbnail using sharp
       await sharp(req.files['thumbnail'][0].path)
         .resize(150, 150) // Resize to 150x150
         .toFile(resizedThumbnailPath); // Save resized image to a new path
 
       thumbnailUrl = `/uploads/products/${req.files['thumbnail'][0].filename.replace('.jpg', '-resized.jpg')}`;
     }

    const product = new craftexProduct({
      name,
      description,
      imageUrl,
      thumbnail: thumbnailUrl, // Save thumbnail URL
      price,
      isFeatured,
      category
    });

    const savedProduct = await product.save();

     // Add the product to the category's products array
     existingCategory.craftexProducts.push(savedProduct._id);
     await existingCategory.save();
 
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }

});

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

// CRUD Operations for Categories
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

app.post('/api/craftexcategories', async (req, res) => {
  const category = new craftexCategory(req.body);
  try {
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

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

// CRUD Operations for Blog Posts
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

// Use Error Handler
app.use(globalErrorHandler);


module.exports = app;