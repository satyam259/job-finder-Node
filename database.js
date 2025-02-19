const mongoose = require('mongoose');

const connectToDatabase = async () => {
  try {
    await mongoose.connect(`mongodb+srv://${process.env.DATABASE}@job-finder.oes47.mongodb.net/`);
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1); // Exit process if connection fails
  }
};

module.exports = connectToDatabase;