import http from "http";
import app from "./app";
import { ENV } from "./config/env";
import { connectDB } from "./config/db";

const server = http.createServer(app);

const startServer = async (): Promise<void> => {
  try {
    // 1. Start HTTP Listener immediately on 0.0.0.0 for Render health checks
    server.listen(ENV.PORT, "0.0.0.0", () => {
      console.log(`=======================================================`);
      console.log(`⚖️  LAW FIRM SOLUTIONS - SUPREME COURT CHAMBER SERVER`);
      console.log(`🚀 Server running on: http://0.0.0.0:${ENV.PORT}`);
      console.log(`📦 Environment:       ${ENV.NODE_ENV}`);
      console.log(`🛡️  JWT Auth Secret:   CONFIGURED`);
      console.log(`🌐 Health Endpoint:   http://localhost:${ENV.PORT}/api/v1/health`);
      console.log(`=======================================================`);
    });

    // 2. Connect to Database asynchronously
    connectDB().catch((err) => {
      console.error("[Database] Initial connection issue:", err);
    });
  } catch (error) {
    console.error("Failed to start backend server:", error);
    process.exit(1);
  }
};

// Graceful Shutdown
const handleShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed. Exiting process.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

startServer();
