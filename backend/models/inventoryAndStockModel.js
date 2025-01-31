const mongoose = require('mongoose')

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    color: String,
    size: String,
    style: String,
  },
  stockQuantity: {
    type: Number,
    required: true,
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
  },
  restockDate: Date,
});

module.exports = mongoose.model('Inventory', inventorySchema);
