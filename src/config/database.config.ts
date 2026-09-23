import mongoose from "mongoose";
import { env } from "./env.config.js";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    console.log("MongoDB connected Succesfully");
  } catch (error) {
    console.log("MongoDB connection error:", error);
    process.exit(1);
  }
};

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection lost. Driver attempting reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected successfully");
});

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed cleanly");
};
