import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { ENV } from "./config/env";
import apiRoutes from "./routes";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware";

const app: Application = express();

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing (CORS)
const allowedOrigins = [
  ENV.CLIENT_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive during setup / development
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Compression & Body Parsers
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Request Logging
if (ENV.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// API Routes Mounting
app.use("/api/v1", apiRoutes);
app.use("/api", apiRoutes); // Alias for convenience

// Root Landing Ping
app.get("/", (req, res) => {
  res.status(200).json({
    name: "Law Firm Solutions REST API",
    version: "1.0.0",
    description: "Supreme Court Chamber Litigation & Case Management Server",
    status: "online",
    docs: "/api/v1/health",
  });
});

// 404 and Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
