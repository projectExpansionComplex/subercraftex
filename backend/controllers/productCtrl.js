const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Tag = require('../models/tagModel');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all products with filtering, sorting, and pagination
exports.getProducts = async (req, res) => {
  try {
    const { category, tag, sortBy, limit = 10, page = 1 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag] };

    const products = await Product.find(filter)
      .sort(sortBy)
      .limit(parseInt(limit))
      .skip((page - 1) * limit)
      .populate('category')
      .populate('tags');

    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('tags');

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
