const mongoose = require('mongoose');

const craftexproductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  }, // Product name
  description: { 
    type: String, 
    required: true 
  }, // Product description
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  }, // Product price (must be non-negative)
  craftexCategory: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'craftexCategory', 
    required: true 
  }, // Reference to the Category model
  thumbnail: { 
    type: String, 
    required: true 
  }, // URL to the product thumbnail image
  images: [{
    type: String, // Array of image URLs
    required: true,
  }],
  designer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true 
  }, // Reference to the User model (designer)
  stock: { 
    type: Number, 
    required: true, 
    min: 0 
  }, // Available stock (must be non-negative)
  isFeatured: { 
    type: Boolean, 
    default: false 
  }, // Whether the product is featured
  salesCount: { 
    type: Number, 
    default: 0, 
    min: 0 
  }, // Number of times the product has been sold
  ratings: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'craftexReview', // Reference to the Review model
  }],
  averageRating: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 5 
  }, // Average rating (calculated field)
  tags: { 
    type: [String], 
    default: [] 
  }, // Tags for personalized recommendations
  materials: {
    type: [String], // Array of materials (e.g., ["Cotton", "Polyester"])
    default: [],
  },
  dimensions: {
    length: { type: Number, default: 0 }, // Length in cm
    width: { type: Number, default: 0 }, // Width in cm
    height: { type: Number, default: 0 }, // Height in cm
  },
  weight: {
    type: Number, // Weight in kg
    default: 0,
  },
  country_of_origin: {
    type: String, // Country of origin (e.g., "USA", "China")
    default: '',
  },
  variants: [{
    name: {
      type: String,
      required: true,
    }, // Variant name (e.g., "Small", "Red")
    price: {
      type: Number,
      required: true,
      min: 0,
    }, // Variant price
    stock: {
      type: Number,
      required: true,
      min: 0,
    }, // Variant stock
    sku: {
      type: String,
      unique: true,
    }, // Unique SKU for the variant
    attributes: {
      type: Map,
      of: String, // Key-value pairs for variant attributes (e.g., "color": "red", "size": "small")
    },
  }],
  sustainability_metrics: { type: mongoose.Schema.Types.ObjectId, ref: 'craftexSustainability' },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }, // Timestamp of product creation
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }, // Timestamp of last update
});

// Middleware to update the averageRating before saving
craftexproductSchema.pre('save', function (next) {
  if (this.ratings.length > 0) {
    const totalRatings = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = totalRatings / this.ratings.length;
  } else {
    this.averageRating = 0;
  }
  next();
});

module.exports = mongoose.model('craftexProduct', craftexproductSchema);