import { Response } from "express";
import { ActivityLog } from "../models/ActivityLog.model";
import { AuthenticatedRequest } from "../types";
import { sendSuccess, sendError } from "../utils/response";

export const getActivityLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "25",
      entityType = "",
      userRole = "",
      search = "",
    } = req.query as Record<string, string>;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};

    if (entityType && entityType !== "all") {
      filter.entityType = entityType;
    }

    if (userRole && userRole !== "all") {
      filter.userRole = userRole;
    }

    if (search.trim()) {
      const q = search.trim();
      filter.$or = [
        { userName: { $regex: q, $options: "i" } },
        { userEmail: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { entityTitle: { $regex: q, $options: "i" } },
        { action: { $regex: q, $options: "i" } },
      ];
    }

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      ActivityLog.countDocuments(filter),
    ]);

    sendSuccess({
      res,
      message: "Activity audit logs retrieved successfully.",
      data: {
        logs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    console.error("[ActivityLog Controller] getActivityLogs Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to retrieve activity audit logs." });
  }
};
