require('dotenv').config();
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
app.use('/uploads', express.static('../uploads'));

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
const craftexProductRoutes = require('../routes/craftexproductRoutes')
const craftexcategoryRoutes = require('../routes/craftexcategoryRoutes')
const craftexblogRoutes = require('../routes/craftexblogRoutes')
const craftexdesignerRoutes = require('../routes/craftexdesignerRoutes')
const craftexCartRoutes = require('../routes/craftexCartRoutes')
const craftexcustomrequestsRoutes = require('../routes/craftexcustomrequestsRoutes')
const craftexeventsRoutes = require('../routes/craftexeventsRoutes')
const craftexforumsRoutes = require('../routes/craftexforumsRoutes')
const craftexinspirationsRoutes = require('../routes/craftexinspirationsRoutes')
const craftexlearningresourcesRoutes = require('../routes/craftexlearningresourcesRoutes')
const craftexnotificationsRoutes = require('../routes/craftexnotificationsRoutes')
const craftexordersRoutes = require('../routes/craftexordersRoutes')
const craftexordertrackingsRoutes = require('../routes/craftexordertrackingsRoutes')
const craftexprojectsRoutes = require('../routes/craftexprojectsRoutes')
const craftexreviewsRoutes = require('../routes/craftexreviewsRoutes')
const craftexsustainabilityRoutes = require('../routes/craftexsustainabilityRoutes')
const craftexvirtualshowroomsRoutes = require('../routes/craftexvirtualshowroomsRoutes')
const craftexwishlistRoutes = require('../routes/craftexwishlistRoutes')
const craftexuserRoutes = require('../routes/craftexuserRoutes')
const craftextutorialCategoryRoutes = require('../routes/craftextutorialCategoryRoutes');
const craftexskillLevelRoutes = require('../routes/craftexskillLevelRoutes');
const craftexforumCategoryRoutes = require('../routes/craftexforumCategoryRoutes');
const craftexProjectCategoryRoutes = require('../routes/craftexProjectCategoryRoutes');
const craftexBlogPostCategoryRoutes = require('../routes/craftexBlogPostCategoryRoutes');

// -----------------subercraftex routes
app.use('/api', craftexProductRoutes);

//subercraftext correntrouts
//  ---------------------------------------------------------------- CRUD Operations for Categories
app.use('/api', craftexcategoryRoutes);
// --------------------------------------------------------------------------------------------------------------------------------CRUD Operations for Blog Posts
app.use('/api', craftexblogRoutes);
//----------------------------------------------------------------working with Cart
app.use('/api', craftexCartRoutes);
//---------------------------------------------------------------customRequest
app.use('/api', craftexcustomrequestsRoutes);
//---------------------------------------------------------------------//working on desinger
app.use('/api', craftexdesignerRoutes);
//----------------------------------------------------------------events------------------------------------------------------------
app.use('/api', craftexeventsRoutes);
//---------------------------------------------------------------forum  --------------------------------------------------------------
app.use('/api', craftexforumsRoutes);

//----------------------------------------------------------------inspiration-----------------------------------------------------------------------
app.use('/api', craftexinspirationsRoutes);

//----------------------------------------------------------------learning resource----------------------------------------------------------------
app.use('/api', craftexlearningresourcesRoutes);


//----------------------------------------------------------------notification--------------------------------------------------------------------
app.use('/api', craftexnotificationsRoutes);
//----------------------------------------------------------------orders--------------------------------------------------------------
app.use('/api', craftexordersRoutes);
//-------------------------------------------------oreder tracking--------
app.use('/api', craftexordertrackingsRoutes);
//----------------------------------------------crud onproject model
app.use('/api', craftexprojectsRoutes);
// ----------------------------------------------revies----------
app.use('/api', craftexreviewsRoutes);
//------------------------------------------------sustainability-----------------
app.use('/api', craftexsustainabilityRoutes);

//--------------------virtual show room -----------------------

app.use('/api', craftexvirtualshowroomsRoutes);
//--------------------------------------------wishlist------------------------------------
app.use('/api', craftexwishlistRoutes);
app.use('/api', craftexuserRoutes);
app.use('/api', craftextutorialCategoryRoutes);
app.use('/api', craftexskillLevelRoutes);
app.use('/api', craftexforumCategoryRoutes);
app.use('/api', craftexProjectCategoryRoutes);
app.use('/api', craftexBlogPostCategoryRoutes);

//auth routes
app.use('/api', require('../routes/userRouter'))
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
//routes
app.use('/api', require('../routes/authRouter'))
// Mount routes

// Use Error Handler
app.use(globalErrorHandler);

module.exports = app;