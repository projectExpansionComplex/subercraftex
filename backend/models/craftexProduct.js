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
  imageUrl: { 
    type: String, 
    required: true 
  }, // URL to the main product image
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
  ratings: [
    {
      user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
      }, // Reference to the User model (reviewer)
      rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
      }, // Rating (1-5 stars)
      comment: { 
        type: String 
      }, // Optional review comment
      createdAt: { 
        type: Date, 
        default: Date.now 
      }, // Timestamp of the review
    },
  ],
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