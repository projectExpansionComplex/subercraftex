const mongoose = require('mongoose');

const craftexdesignerSchema = new mongoose.Schema({
  name: String,
  avatar: String,
  specialty: String,
  isFeatured: Boolean
});

module.exports = mongoose.model('craftexDesigner', craftexdesignerSchema);