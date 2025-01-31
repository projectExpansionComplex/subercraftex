const express = require('express');
const tagController = require('../controllers/tagCtrl');

const router = express.Router();

router.post('/', tagController.createTag);
router.get('/', tagController.getTags);
router.get('/:id', tagController.getTagById);
router.put('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

module.exports = router;
