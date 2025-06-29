const express = require('express');
const trendingService = require('../services/trendingService');

const router = express.Router();

// GET /api/trends - Get trending topics
router.get('/', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const trends = await trendingService.getAllTrends(forceRefresh);
    res.json({ trends, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trending topics' });
  }
});

// POST /api/trends/refresh - Force refresh trending topics
router.post('/refresh', async (req, res) => {
  try {
    console.log('[TRENDS] Force refreshing trending topics...');
    const trends = await trendingService.getAllTrends(true);
    res.json({ 
      trends, 
      message: 'Trending topics refreshed successfully',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Error refreshing trends:', error);
    res.status(500).json({ error: 'Failed to refresh trending topics' });
  }
});

// GET /api/trends/status - Get trending service status
router.get('/status', async (req, res) => {
  try {
    const status = {
      lastFetchTime: trendingService.lastFetchTime,
      cacheAge: trendingService.lastFetchTime ? 
        Math.round((Date.now() - trendingService.lastFetchTime) / 1000) : null,
      cacheDuration: Math.round(trendingService.cacheDuration / 1000),
      hasCachedData: !!trendingService.cachedTrends,
      cachedTrendsCount: trendingService.cachedTrends ? trendingService.cachedTrends.length : 0
    };
    res.json(status);
  } catch (error) {
    console.error('Error getting trends status:', error);
    res.status(500).json({ error: 'Failed to get trends status' });
  }
});

module.exports = router; 