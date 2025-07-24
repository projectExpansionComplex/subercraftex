const mongoose = require('mongoose');

const designerPortfolioSchema = new mongoose.Schema({
  designer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'craftexDesigner', 
    required: true 
  }, // Reference to the designer
  title: { 
    type: String, 
    required: true 
  }, // Title of the portfolio item
  description: { 
    type: String 
  }, // Description of the portfolio item
  images: [{ 
    type: String 
  }], // Array of image URLs
  videoUrl: { 
    type: String 
  }, // URL of the video
  youtubeUrl: { 
    type: String 
  }, // URL of the YouTube video
  tags: [{ 
    type: String 
  }], // Tags for filtering and searching
  createdAt: { 
    type: Date, 
    default: Date.now 
  }, // Timestamp of portfolio item creation
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }, // Timestamp of last update
});

// Update the `updatedAt` field before saving
designerPortfolioSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DesignerPortfolio', designerPortfolioSchema);