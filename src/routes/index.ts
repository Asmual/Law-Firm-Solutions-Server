import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import caseRoutes from "./case.routes";
import institutionRoutes from "./institution.routes";
import activityLogRoutes from "./activityLog.routes";

const router = Router();

// Health Check Route
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Law Firm Solutions Backend API is healthy and running.",
    timestamp: new Date().toISOString(),
  });
});

// Mounted Sub-routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/cases", caseRoutes);
router.use("/institutions", institutionRoutes);
router.use("/activity-logs", activityLogRoutes);

export default router;
