import http from "http";
import app from "./app";
import { ENV } from "./config/env";
import { connectDB } from "./config/db";

const server = http.createServer(app);

const startServer = async (): Promise<void> => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Start HTTP Listener (0.0.0.0 binds to all network interfaces for Render and cloud VPS)
    server.listen(ENV.PORT, "0.0.0.0", () => {
      console.log(`=======================================================`);
      console.log(`⚖️  LAW FIRM SOLUTIONS - SUPREME COURT CHAMBER SERVER`);
      console.log(`🚀 Server running on: http://0.0.0.0:${ENV.PORT}`);
      console.log(`📦 Environment:       ${ENV.NODE_ENV}`);
      console.log(`🛡️  JWT Auth Secret:   CONFIGURED`);
      console.log(`🌐 Health Endpoint:   http://localhost:${ENV.PORT}/api/v1/health`);
      console.log(`=======================================================`);
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
