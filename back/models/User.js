const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Method to increment comments count
userSchema.methods.incrementCommentsCount = function() {
  if (!this.stats) this.stats = {};
  if (typeof this.stats.commentsCount !== 'number') this.stats.commentsCount = 0;
  this.stats.commentsCount += 1;
  return this.save();
};

// Method to add viewed article
userSchema.methods.addViewedArticle = function(articleId) {
  const existingView = this.stats.articlesViewed.find(
    view => view.articleId.toString() === articleId.toString()
  );
  
  if (existingView) {
    existingView.viewedAt = new Date();
  } else {
    this.stats.articlesViewed.push({ articleId });
  }
  
  return this.save();
};

// Static method to find or create user from Google profile
userSchema.statics.findOrCreateFromGoogle = async function(googleProfile) {
  let user = await this.findOne({ googleId: googleProfile.id });
  
  if (!user) {
    user = new this({
      googleId: googleProfile.id,
      name: googleProfile.displayName,
      email: googleProfile.emails[0].value,
      avatar: googleProfile.photos[0]?.value
    });
    await user.save();
  } else {
    // Update existing user info
    user.name = googleProfile.displayName;
    user.email = googleProfile.emails[0].value;
    user.avatar = googleProfile.photos[0]?.value;
    user.lastLogin = new Date();
    await user.save();
  }
  
  return user;
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.name.split(' ')[0];
});

module.exports = mongoose.model('User', userSchema); 