import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);
  mongoose.connection.on("connected", () => {
    console.info(`MongoDB connected: ${mongoose.connection.host}`);
  });
  mongoose.connection.on("error", (error) => {
    console.error(`MongoDB connection error: ${error.message}`);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });
  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  } catch (error) {
    console.error(`MongoDB connection failed: ${(error as Error).message}`);
    process.exit(1);
  }
}
