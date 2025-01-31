const Tag = require('../models/tagModel');

// Create a new tag
exports.createTag = async (req, res) => {
  try {
    const tag = new Tag(req.body);
    await tag.save();
    res.status(201).json(tag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all tags
exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.find();
    res.status(200).json(tags);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a single tag by ID
exports.getTagById = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    res.status(200).json(tag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a tag by ID
exports.updateTag = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    res.status(200).json(tag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a tag by ID
exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id);

    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
