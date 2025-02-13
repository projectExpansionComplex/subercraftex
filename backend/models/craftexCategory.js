const mongoose = require('mongoose');

const craftexcategorySchema = new mongoose.Schema({
  name: String,
  craftexProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'craftexProduct' }]
});

module.exports = mongoose.model('craftexCategory', craftexcategorySchema);