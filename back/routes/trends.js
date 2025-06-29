const express = require('express');
const trendingService = require('../services/trendingService');

const router = express.Router();

// GET /api/trends - Get all trending topics (Google + Twitter)
router.get('/', async (req, res) => {
  try {
    const trends = await trendingService.getAllTrends();
    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

module.exports = router; 