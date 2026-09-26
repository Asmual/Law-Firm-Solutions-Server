import { Response } from "express";
import { User } from "../models/User.model";
import { ActivityLog } from "../models/ActivityLog.model";
import { AuthenticatedRequest, UserRole } from "../types";
import { sendSuccess, sendError } from "../utils/response";

export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role = "", search = "", active = "" } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = {};
    if (role && role !== "all") filter.role = role;
    if (active === "true") filter.isActive = true;
    if (active === "false") filter.isActive = false;

    if (search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { chamberDesignation: { $regex: q, $options: "i" } },
        { associateId: { $regex: q, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-passwordHash -twoFactorSecret -resetPasswordToken")
      .sort({ createdAt: -1 });

    sendSuccess({
      res,
      message: "Users retrieved successfully.",
      data: users,
    });
  } catch (error) {
    console.error("[User Controller] getUsers Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to retrieve users." });
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-passwordHash -twoFactorSecret");

    if (!user) {
      sendError({ res, statusCode: 404, message: "User not found." });
      return;
    }

    sendSuccess({
      res,
      message: "User details retrieved.",
      data: user,
    });
  } catch (error) {
    console.error("[User Controller] getUserById Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to retrieve user." });
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["admin", "advocate", "associate"].includes(role)) {
      sendError({ res, statusCode: 400, message: "Invalid role specified." });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      sendError({ res, statusCode: 404, message: "User not found." });
      return;
    }

    const previousRole = user.role;
    user.role = role as UserRole;
    await user.save();

    if (req.user) {
      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: "user:update",
        entityType: "user",
        entityId: id,
        entityTitle: user.name,
        description: `Changed role of ${user.name} from ${previousRole} to ${role}`,
      }).catch(() => {});
    }

    sendSuccess({
      res,
      message: `User role successfully updated to ${role}.`,
      data: { id: user._id, role: user.role },
    });
  } catch (error) {
    console.error("[User Controller] updateUserRole Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to update user role." });
  }
};

export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      sendError({ res, statusCode: 404, message: "User not found." });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    if (req.user) {
      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: "user:status_toggle",
        entityType: "user",
        entityId: id,
        entityTitle: user.name,
        description: `${user.isActive ? "Activated" : "Suspended"} account of ${user.name}`,
      }).catch(() => {});
    }

    sendSuccess({
      res,
      message: `User account has been ${user.isActive ? "activated" : "deactivated"}.`,
      data: { id: user._id, isActive: user.isActive },
    });
  } catch (error) {
    console.error("[User Controller] toggleUserStatus Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to toggle user status." });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError({ res, statusCode: 401, message: "Unauthorized." });
      return;
    }

    const { name, phone, chamberDesignation, barEnrollmentNo, bio, avatarUrl } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      sendError({ res, statusCode: 404, message: "User not found." });
      return;
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (chamberDesignation) user.chamberDesignation = chamberDesignation.trim();
    if (barEnrollmentNo !== undefined) user.barEnrollmentNo = barEnrollmentNo.trim();
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    await user.save();

    sendSuccess({
      res,
      message: "Profile updated successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        chamberDesignation: user.chamberDesignation,
        phone: user.phone,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("[User Controller] updateProfile Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to update profile." });
  }
};
