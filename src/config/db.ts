import mongoose from "mongoose";
import { ENV } from "./env";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host} (${conn.connection.name})`);
  } catch (error) {
    console.error("[Database] Connection Error (Will retry in background):", error);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("[Database] MongoDB disconnected. Attempting reconnection...");
});

mongoose.connection.on("error", (err) => {
  console.error("[Database] Runtime Error:", err);
});
