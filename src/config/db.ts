import mongoose from "mongoose";
import { ENV } from "./env";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      autoIndex: true,
    });

    console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host} (${conn.connection.name})`);
  } catch (error) {
    console.error("[Database] Connection Error:", error);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("[Database] MongoDB disconnected. Attempting reconnection...");
});

mongoose.connection.on("error", (err) => {
  console.error("[Database] Runtime Error:", err);
});
