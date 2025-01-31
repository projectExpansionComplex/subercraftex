const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  _parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  description: String,
  file: {
    originalName: String,
    fileName: String,
    imageUrl: String,
    fileType: String,
    fileSize: String,
  },
  _user: { type: mongoose.Types.ObjectId, ref: "user" },

},
{ timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
