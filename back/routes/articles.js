const express = require('express');
const Article = require('../models/Article');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/articles - List all published articles (with search & pagination)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = { status: 'published' };
    if (search) {
      query = {
        ...query,
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { excerpt: { $regex: search, $options: 'i' } },
          { trendingTopic: { $regex: search, $options: 'i' } },
          { 'meta.keywords': { $in: [new RegExp(search, 'i')] } }
        ]
      };
    }
    const articles = await Article.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('title slug excerpt media.images trendingTopic publishedAt ogTags');
    const total = await Article.countDocuments(query);
    res.json({ articles, total });
  } catch (error) {
    console.error('[GET /api/articles] Error:', error);
    console.error('Request query:', req.query);
    if (error && error.stack) {
      console.error(error.stack);
    }
    res.status(500).json({ error: 'Failed to fetch articles', details: error.message });
  }
});

// GET /api/articles/:slug - Get article by slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug, status: 'published' });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    // Increment view count
    await article.incrementViewCount();
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// POST /api/articles - Create new article (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    // TODO: Validate data
    const article = new Article(data);
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create article', details: error.message });
  }
});

// PUT /api/articles/:slug - Update article (admin only)
router.put('/:slug', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      { new: true }
    );
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update article', details: error.message });
  }
});

// DELETE /api/articles/:slug - Delete article (admin only)
router.delete('/:slug', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const article = await Article.findOneAndDelete({ slug: req.params.slug });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json({ message: 'Article deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete article', details: error.message });
  }
});

module.exports = router; 