import mongoose from "mongoose";
import { getDbConfig } from "./index";

export const connectDB = async () => {
  try {
    const dbConfig = getDbConfig();
    
    if (!dbConfig.mongoUri) {
      throw new Error("MongoDB URI is not configured");
    }
    
    await mongoose.connect(dbConfig.mongoUri);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};