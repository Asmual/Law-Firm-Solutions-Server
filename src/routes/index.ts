import { Router } from "express";
import mongoose from "mongoose";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import caseRoutes from "./case.routes";
import institutionRoutes from "./institution.routes";
import activityLogRoutes from "./activityLog.routes";
import { User } from "../models/User.model";
import { Case } from "../models/Case.model";
import { Institution } from "../models/Institution.model";

const router = Router();

// Health & Database Status Endpoint
router.get("/health", async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
  const isConnected = dbState === 1;

  let dbStats: Record<string, unknown> = {};
  if (isConnected && mongoose.connection.db) {
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      dbStats = {
        databaseName: mongoose.connection.name,
        collectionsCount: collections.length,
        collections: collections.map((c) => c.name),
      };
    } catch {
      // Ignored for graceful fallback
    }
  }

  res.status(200).json({
    status: "ok",
    server: "running",
    database: {
      status: states[dbState] || "Unknown",
      connected: isConnected,
      ...dbStats,
    },
    timestamp: new Date().toISOString(),
  });
});

// Live Database Data Verification Endpoint (Physical Test)
router.get("/test-db", async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      res.status(503).json({
        success: false,
        message: "MongoDB Atlas is not connected yet.",
        state: mongoose.connection.readyState,
      });
      return;
    }

    const [userCount, caseCount, institutionCount, sampleInstitutions] = await Promise.all([
      User.countDocuments().catch(() => 0),
      Case.countDocuments().catch(() => 0),
      Institution.countDocuments().catch(() => 0),
      Institution.find().select("name shortCode category branch").limit(5).catch(() => []),
    ]);

    res.status(200).json({
      success: true,
      message: "MongoDB Atlas live query executed successfully!",
      databaseName: mongoose.connection.name,
      host: mongoose.connection.host,
      liveDataCounts: {
        totalUsers: userCount,
        totalCases: caseCount,
        totalInstitutions: institutionCount,
      },
      sampleInstitutions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching data from MongoDB Atlas",
      error: error instanceof Error ? error.message : error,
    });
  }
});

// Mounted Sub-routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/cases", caseRoutes);
router.use("/institutions", institutionRoutes);
router.use("/activity-logs", activityLogRoutes);

export default router;
