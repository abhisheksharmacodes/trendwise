const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const nodeCron = require('node-cron');
const contentService = require('./services/contentService');
const Article = require('./models/Article');
const trendingService = require('./services/trendingService');
const connectDB = require('./utils/db');

// Load environment variables
dotenv.config();

// Import routes
const articleRoutes = require('./routes/articles');
const commentRoutes = require('./routes/comments');
const authRoutes = require('./routes/auth');
const trendRoutes = require('./routes/trends');

// Import middleware
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection (singleton)
connectDB();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/trends', trendRoutes);

// Function to generate only 1 article from trends per run, with quota error handling
async function generateArticlesFromTrends() {
  try {
    console.log('[ARTICLE GENERATION] Fetching fresh trending topics and generating one article...');
    const trends = await trendingService.getAllTrends(true); // Force refresh
    console.log(`[ARTICLE GENERATION] Found ${trends.length} fresh trending topics`);
    let generatedCount = 0;
    for (const trend of trends) {
      if (generatedCount >= 1) break; // Only 1 article per run
      // Skip if article already exists for this trend
      const exists = await Article.findOne({ trendingTopic: trend.title });
      if (exists) {
        console.log(`[ARTICLE GENERATION] Skipping "${trend.title}" - article already exists`);
        continue;
      }
      try {
        console.log(`[ARTICLE GENERATION] Generating article for trend: "${trend.title}"`);
        const articleData = await contentService.generateArticleFromTrend(trend);
        const article = new Article(articleData);
        await article.save();
        console.log(`[ARTICLE GENERATION] ✅ Article generated and stored: "${article.title}"`);
        console.log(`[ARTICLE GENERATION] 📝 Slug: ${article.slug}`);
        console.log(`[ARTICLE GENERATION] 📊 SEO Score: ${article.seoScore}/100`);
        console.log(`[ARTICLE GENERATION] ⏱️ Read Time: ${article.readTime} minutes`);
        console.log(`[ARTICLE GENERATION] 🔗 URL: ${process.env.FRONTEND_URL}/article/${article.slug}`);
        console.log('---');
        generatedCount++;
      } catch (err) {
        if (err.message && err.message.includes('429')) {
          console.error('[ARTICLE GENERATION] Quota exceeded (429). Stopping further requests until reset.');
          break;
        }
        console.error(`[ARTICLE GENERATION] ❌ Failed to generate article for trend: "${trend.title}"`, err.message);
      }
    }
    console.log(`[ARTICLE GENERATION] Article generation cycle complete. Generated ${generatedCount} articles.`);
  } catch (err) {
    console.error('[ARTICLE GENERATION] Error in article generation:', err.message);
  }
}

// Schedule: Every hour, fetch trends and generate articles
nodeCron.schedule('0 * * * *', generateArticlesFromTrends);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 Starting initial article generation...');
  
  // Run initial article generation after a short delay to ensure everything is loaded
  setTimeout(() => {
    generateArticlesFromTrends();
  }, 5000); // 5 second delay
});

module.exports = app; 