const mongoose = require("mongoose");
const dotenv = require("dotenv");
const logger = require("../utils/logger");

dotenv.config();

const connectDB = async () => {
  try {
    console.log(`📡 Connecting to MongoDB...`);
    await mongoose.connect(process.env.MONGODB_URL);
    logger.info("MongoDB connected successfully");
    console.log(`✅ MongoDB Connection Established`);
  } catch (err) {
    logger.error("MongoDB connection failed", {
      error: err.message,
      stack: err.stack
    });
    process.exit(1);
  }
};

module.exports = connectDB;
