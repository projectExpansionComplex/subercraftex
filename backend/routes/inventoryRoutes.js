const express = require('express');
const inventoryController = require('../controllers/inventoryCtrl');
const authMiddleware = require('../middleware/authMiddlerware'); // Only admin or vendor users should manage inventory

const router = express.Router();

router.post('/', authMiddleware.protect, authMiddleware.restrictTo('admin', 'vendor'), inventoryController.addInventory);
router.get('/:productId', inventoryController.getInventory);
router.put('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin', 'vendor'), inventoryController.updateInventory);
router.delete('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin', 'vendor'), inventoryController.deleteInventory);

module.exports = router;
