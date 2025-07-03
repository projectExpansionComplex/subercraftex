const express = require('express');
const craftexForum = require('../models/craftexForum');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const craftexUser = require('../models/userModel');

// GET route to fetch all forum categories
// 

// GET route to fetch all forum topics with pagination and search
router.get('/api/forum-topics', async (req, res) => {
  try {
    const { page = 1, category = '', search = '' } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const totalTopics = await craftexForum.countDocuments(query);
    const topics = await craftexForum.find(query)
      .populate('user', 'name email')
      .populate('comments.user', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      data: topics,
      current_page: parseInt(page),
      total_pages: Math.ceil(totalTopics / limit),
      total_topics: totalTopics
    });
  } catch (err) {
    console.error('Error fetching forum topics:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch a single forum topic by ID
router.get('/api/forum-topics/:uid', async (req, res) => {
  try {
    const forumTopic = await craftexForum.findOne({ uid: req.params.uid })
      .populate('user', 'name email')
      .populate('comments.user', 'name');
    if (!forumTopic) {
      return res.status(404).json({ message: 'Forum topic not found' });
    }
    res.status(200).json(forumTopic);
  } catch (err) {
    console.error('Error fetching forum topic:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST route to create a new forum topic
router.post(
  '/api/forum-topics',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('category').notEmpty().withMessage('Category ID is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content, category } = req.body;

      const newTopic = new craftexForum({
        title,
        content,
        category, // Reference to the ForumCategory
        user: req.user.id, // Assuming user is attached to the request by auth middleware
      });

      const savedTopic = await newTopic.save();
      res.status(201).json(savedTopic);
    } catch (err) {
      console.error('Error creating forum topic:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// POST route to add a reply to a forum topic
router.post(
  '/api/forum-replies',
  [
    body('topic_uid').notEmpty().withMessage('Topic UID is required'),
    body('content').notEmpty().withMessage('Content is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { topic_uid, content } = req.body;

      const topic = await craftexForum.findOne({ uid: topic_uid });
      if (!topic) {
        return res.status(404).json({ message: 'Topic not found' });
      }

      topic.comments.push({
        user: req.user.id, // Assuming user is attached to the request by auth middleware
        text: content,
      });

      const updatedTopic = await topic.save();
      res.status(201).json(updatedTopic);
    } catch (err) {
      console.error('Error adding reply:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// POST route to upvote a topic or reply
router.post('/api/forum-upvote/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { isReply } = req.body;

    const topic = await craftexForum.findOne({ uid });
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (isReply) {
      const reply = topic.comments.id(uid);
      if (!reply) {
        return res.status(404).json({ message: 'Reply not found' });
      }
      reply.upvotes += 1;
    } else {
      topic.upvotes += 1;
    }

    const updatedTopic = await topic.save();
    res.status(200).json(updatedTopic);
  } catch (err) {
    console.error('Error upvoting:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;