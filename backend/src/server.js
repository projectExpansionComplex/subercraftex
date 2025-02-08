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



// Enable trust proxy to handle X-Forwarded-For headers correctly
app.set('trust proxy', 1); // or 'true' for multiple proxies

// Setup the rate limiter
const limiter = rateLimit({
  max: 200, // Limit to 200 requests per IP
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, Please try again later!' // Error message
});

// Apply the rate limiter to all requests below
app.use(limiter);

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './storage';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });



app.use('/api', limiter);

app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(bodyParser.json());

// Data sanitization against no sq attacks
app.use(mongoSanitize());

// Datata sanitization against XSS vulnerabilities
app.use(xss());

// Serving Static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

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
  app.use('public/uploads', express.static(path.join(__dirname, 'public/uploads')))
  
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


// Use Error Handler
app.use(globalErrorHandler);


module.exports = app;