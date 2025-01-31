const Inventory = require('../models/inventoryAndStockModel');

// Add inventory for a product variant
exports.addInventory = async (req, res) => {
  try {
    const inventory = new Inventory(req.body);
    await inventory.save();
    res.status(201).json(inventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get inventory details for a product
exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({ product: req.params.productId });
    res.status(200).json(inventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update inventory for a product variant
exports.updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!inventory) return res.status(404).json({ message: 'Inventory not found' });

    res.status(200).json(inventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete inventory
exports.deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);

    if (!inventory) return res.status(404).json({ message: 'Inventory not found' });

    res.status(200).json({ message: 'Inventory deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
