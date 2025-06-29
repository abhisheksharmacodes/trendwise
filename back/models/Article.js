const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300
  },
  content: {
    type: String,
    required: true
  },
  meta: {
    title: {
      type: String,
      required: true,
      maxlength: 60
    },
    description: {
      type: String,
      required: true,
      maxlength: 300
    },
    keywords: [{
      type: String,
      trim: true
    }]
  },
  media: {
    images: [{
      url: String,
      alt: String,
      caption: String
    }],
    videos: [{
      url: String,
      title: String,
      platform: String // youtube, vimeo, etc.
    }],
    tweets: [{
      url: String,
      content: String,
      author: String
    }]
  },
  ogTags: {
    title: String,
    description: String,
    image: String,
    url: String
  },
  trendingTopic: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['google_trends', 'twitter', 'manual', 'gemini_ai'],
    default: 'manual'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  seoScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  readTime: {
    type: Number,
    default: 0 // in minutes
  },
  viewCount: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
articleSchema.index({ slug: 1 });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ trendingTopic: 1 });
articleSchema.index({ 'meta.keywords': 1 });

// Pre-save middleware to update updatedAt
articleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for full URL
articleSchema.virtual('fullUrl').get(function() {
  return `${process.env.FRONTEND_URL}/article/${this.slug}`;
});

// Method to increment view count
articleSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Static method to get trending articles
articleSchema.statics.getTrendingArticles = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ viewCount: -1, publishedAt: -1 })
    .limit(limit)
    .select('title slug excerpt media.images trendingTopic viewCount publishedAt');
};

// Static method to search articles
articleSchema.statics.searchArticles = function(query) {
  return this.find({
    $and: [
      { status: 'published' },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { excerpt: { $regex: query, $options: 'i' } },
          { 'meta.keywords': { $in: [new RegExp(query, 'i')] } },
          { trendingTopic: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  })
  .sort({ publishedAt: -1 })
  .select('title slug excerpt media.images trendingTopic publishedAt');
};

module.exports = mongoose.model('Article', articleSchema); 