const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  userId: {
    type: String, // Google user ID
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userAvatar: {
    type: String
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'spam'],
    default: 'approved'
  },
  likes: [{
    userId: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    userId: String,
    userName: String,
    userEmail: String,
    userAvatar: String,
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
commentSchema.index({ articleId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ status: 1 });

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Method to add like
commentSchema.methods.addLike = function(userId) {
  if (!this.likes.find(like => like.userId === userId)) {
    this.likes.push({ userId });
  }
  return this.save();
};

// Method to remove like
commentSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.userId !== userId);
  return this.save();
};

// Method to add reply
commentSchema.methods.addReply = function(replyData) {
  this.replies.push(replyData);
  return this.save();
};

// Static method to get comments for an article
commentSchema.statics.getArticleComments = function(articleId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ 
    articleId, 
    status: 'approved' 
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('articleId', 'title slug');
};

// Static method to get user comments
commentSchema.statics.getUserComments = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ userId })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('articleId', 'title slug');
};

module.exports = mongoose.model('Comment', commentSchema); 