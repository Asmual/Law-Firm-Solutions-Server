import { Response } from "express";
import { Institution } from "../models/Institution.model";
import { Case } from "../models/Case.model";
import { ActivityLog } from "../models/ActivityLog.model";
import { AuthenticatedRequest } from "../types";
import { sendSuccess, sendError } from "../utils/response";

export const getInstitutions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search = "", category = "" } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { shortCode: { $regex: q, $options: "i" } },
        { branch: { $regex: q, $options: "i" } },
      ];
    }

    const institutions = await Institution.find(filter).sort({ name: 1 });

    // Aggregate active and disposed case counts per institution
    const caseStats = await Case.aggregate([
      {
        $group: {
          _id: "$institutionId",
          totalCases: { $sum: 1 },
          activeCases: {
            $sum: {
              $cond: [{ $in: ["$status", ["running", "stay_granted", "adjourned"]] }, 1, 0],
            },
          },
          disposedCases: {
            $sum: {
              $cond: [{ $in: ["$status", ["disposed", "decreed"]] }, 1, 0],
            },
          },
        },
      },
    ]);

    const statsMap = new Map(caseStats.map((s) => [s._id?.toString(), s]));

    const result = institutions.map((inst) => {
      const stats = statsMap.get(inst._id.toString());
      return {
        ...inst.toObject(),
        totalCases: stats?.totalCases || 0,
        activeCases: stats?.activeCases || 0,
        disposedCases: stats?.disposedCases || 0,
      };
    });

    sendSuccess({
      res,
      message: "Institutions retrieved successfully.",
      data: result,
    });
  } catch (error) {
    console.error("[Institution Controller] getInstitutions Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to retrieve institutions." });
  }
};

export const getInstitutionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const inst = await Institution.findById(id);

    if (!inst) {
      sendError({ res, statusCode: 404, message: "Institution not found." });
      return;
    }

    sendSuccess({
      res,
      message: "Institution details retrieved.",
      data: inst,
    });
  } catch (error) {
    console.error("[Institution Controller] getInstitutionById Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to retrieve institution." });
  }
};

export const createInstitution = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const newInst = await Institution.create(req.body);

    if (req.user) {
      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: "institution:create",
        entityType: "institution",
        entityId: newInst._id.toString(),
        entityTitle: newInst.name,
        description: `Created new client institution: ${newInst.name} (${newInst.shortCode})`,
      }).catch(() => {});
    }

    sendSuccess({
      res,
      statusCode: 201,
      message: "Institution created successfully.",
      data: newInst,
    });
  } catch (error) {
    console.error("[Institution Controller] createInstitution Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to create institution." });
  }
};

export const updateInstitution = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedInst = await Institution.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedInst) {
      sendError({ res, statusCode: 404, message: "Institution not found." });
      return;
    }

    if (req.user) {
      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: "institution:update",
        entityType: "institution",
        entityId: updatedInst._id.toString(),
        entityTitle: updatedInst.name,
        description: `Updated institution details for ${updatedInst.name}`,
      }).catch(() => {});
    }

    sendSuccess({
      res,
      message: "Institution updated successfully.",
      data: updatedInst,
    });
  } catch (error) {
    console.error("[Institution Controller] updateInstitution Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to update institution." });
  }
};

export const deleteInstitution = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedInst = await Institution.findByIdAndDelete(id);

    if (!deletedInst) {
      sendError({ res, statusCode: 404, message: "Institution not found." });
      return;
    }

    if (req.user) {
      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: "institution:delete",
        entityType: "institution",
        entityId: id,
        entityTitle: deletedInst.name,
        description: `Deleted client institution: ${deletedInst.name}`,
      }).catch(() => {});
    }

    sendSuccess({
      res,
      message: "Institution deleted successfully.",
    });
  } catch (error) {
    console.error("[Institution Controller] deleteInstitution Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to delete institution." });
  }
};
