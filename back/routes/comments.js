const express = require('express');
const Comment = require('../models/Comment');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/comments/:articleId - Get comments for an article (paginated)
router.get('/:articleId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const comments = await Comment.getArticleComments(req.params.articleId, page, limit);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST /api/comments/:articleId - Post a comment (auth required)
router.post('/:articleId', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.length < 1) {
      return res.status(400).json({ error: 'Comment content required' });
    }
    const comment = new Comment({
      articleId: req.params.articleId,
      userId: req.user.googleId,
      userName: req.user.name,
      userEmail: req.user.email,
      userAvatar: req.user.avatar,
      content
    });
    await comment.save();
    req.user.incrementCommentsCount();
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: 'Failed to post comment', details: error.message });
  }
});

// GET /api/comments/user/history - Get user's comment history (auth required)
router.get('/user/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const comments = await Comment.getUserComments(req.user.googleId, page, limit);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user comments' });
  }
});

module.exports = router; 