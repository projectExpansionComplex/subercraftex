const mongoose = require('mongoose');

const craftexproductSchema = new mongoose.Schema({
  name: String,
  description: String,
  imageUrl: String,
  thumbnail: String,
  price: Number,
  isFeatured: Boolean,
  salesCount: Number,
  craftexCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'craftexCategory' }
});

module.exports = mongoose.model('craftexProduct', craftexproductSchema);