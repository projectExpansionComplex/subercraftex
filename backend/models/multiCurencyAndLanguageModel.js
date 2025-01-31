const mongoose = require('mongoose')

const currencySchema = new mongoose.Schema({
  currencyCode: {
    type: String,
    required: true,
  },
  conversionRate: {
    type: Number,
    required: true,
  },
});

const languageSchema = new mongoose.Schema({
  languageCode: {
    type: String,
    required: true,
  },
  translations: Map, // Store key-value pairs for translations
});

module.exports = mongoose.model('Currency', currencySchema);
module.exports = mongoose.model('Language', languageSchema);
