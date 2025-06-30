const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    // Already connected
    return;
  }
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/trendwise';
  try {
    await mongoose.connect(mongoUri, {
      // useNewUrlParser: true, // Not needed in mongoose >= 6
      // useUnifiedTopology: true, // Not needed in mongoose >= 6
    });
    isConnected = true;
    console.log('Connected to MongoDB (singleton)');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

module.exports = connectDB; 