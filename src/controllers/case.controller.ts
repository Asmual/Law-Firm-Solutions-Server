import { Response } from "express";
import { Case } from "../models/Case.model";
import { ActivityLog } from "../models/ActivityLog.model";
import { AuthenticatedRequest } from "../types";
import { sendSuccess, sendError } from "../utils/response";

export const getCases = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "50",
      search = "",
      status = "",
      institutionId = "",
      associateId = "",
    } = req.query as Record<string, string>;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    // Filter query
    const filter: Record<string, unknown> = {};

    if (status) {
      filter.status = status;
    }

    if (institutionId) {
      filter.institutionId = institutionId;
    }

    if (associateId) {
      filter["assignedAssociate.associateId"] = associateId;
    }

    if (search.trim()) {
      const q = search.trim();
      filter.$or = [
        { chamberFileNo: { $regex: q, $options: "i" } },
        { institutionName: { $regex: q, $options: "i" } },
        { matter: { $regex: q, $options: "i" } },
        { "caseNumbers.caseNumber": { $regex: q, $options: "i" } },
        { "parties.partyNameDetails": { $regex: q, $options: "i" } },
      ];
    }

    // Role-based filtering: associates can only see their assigned cases if not unrestricted
    if (req.user?.role === "associate") {
      filter.$or = [
        ...(filter.$or ? (filter.$or as unknown[]) : []),
        { "assignedAssociate.associateId": req.user.id },
      ];
    }

    const [cases, total] = await Promise.all([
      Case.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limitNum),
      Case.countDocuments(filter),
    ]);

    sendSuccess({
      res,
      message: "Cases retrieved successfully.",
      data: {
        cases,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    console.error("[Case Controller] getCases Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to retrieve case records." });
  }
};

export const getCaseById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const caseDoc = await Case.findById(id).populate("institutionId", "name shortCode branch");

    if (!caseDoc) {
      sendError({ res, statusCode: 404, message: "Case not found." });
      return;
    }

    sendSuccess({
      res,
      message: "Case details retrieved.",
      data: caseDoc,
    });
  } catch (error) {
    console.error("[Case Controller] getCaseById Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to fetch case details." });
  }
};

export const createCase = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const newCase = await Case.create(req.body);

    if (req.user) {
      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: "case:create",
        entityType: "case",
        entityId: newCase._id.toString(),
        entityTitle: newCase.chamberFileNo,
        description: `Created case file ${newCase.chamberFileNo} (${newCase.matter}) for ${newCase.institutionName}`,
      }).catch(() => {});
    }

    sendSuccess({
      res,
      statusCode: 201,
      message: "Case file created successfully.",
      data: newCase,
    });
  } catch (error) {
    console.error("[Case Controller] createCase Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to create case file." });
  }
};

export const updateCase = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedCase = await Case.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedCase) {
      sendError({ res, statusCode: 404, message: "Case not found." });
      return;
    }

    if (req.user) {
      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: "case:update",
        entityType: "case",
        entityId: updatedCase._id.toString(),
        entityTitle: updatedCase.chamberFileNo,
        description: `Updated case file details for ${updatedCase.chamberFileNo}`,
      }).catch(() => {});
    }

    sendSuccess({
      res,
      message: "Case file updated successfully.",
      data: updatedCase,
    });
  } catch (error) {
    console.error("[Case Controller] updateCase Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to update case file." });
  }
};

export const addStatusUpdate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { updateDate, statusRemarks, orderDetails, nextHearingDate, courtName } = req.body;

    const caseDoc = await Case.findById(id);
    if (!caseDoc) {
      sendError({ res, statusCode: 404, message: "Case not found." });
      return;
    }

    caseDoc.statusUpdates.push({
      updateDate,
      statusRemarks,
      orderDetails,
      nextHearingDate,
      courtName,
      enteredBy: req.user?.name || "System Practitioner",
      createdAt: new Date(),
    });

    await caseDoc.save();

    if (req.user) {
      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: "case:status_add",
        entityType: "case",
        entityId: caseDoc._id.toString(),
        entityTitle: caseDoc.chamberFileNo,
        description: `Added hearing/status update on ${caseDoc.chamberFileNo}: ${statusRemarks.substring(0, 60)}...`,
      }).catch(() => {});
    }

    sendSuccess({
      res,
      message: "Status update added successfully.",
      data: caseDoc,
    });
  } catch (error) {
    console.error("[Case Controller] addStatusUpdate Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to add status update." });
  }
};

export const deleteCase = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedCase = await Case.findByIdAndDelete(id);

    if (!deletedCase) {
      sendError({ res, statusCode: 404, message: "Case not found." });
      return;
    }

    if (req.user) {
      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: "case:delete",
        entityType: "case",
        entityId: id,
        entityTitle: deletedCase.chamberFileNo,
        description: `Deleted case file ${deletedCase.chamberFileNo} (${deletedCase.matter})`,
      }).catch(() => {});
    }

    sendSuccess({
      res,
      message: "Case file deleted successfully.",
    });
  } catch (error) {
    console.error("[Case Controller] deleteCase Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to delete case file." });
  }
};
