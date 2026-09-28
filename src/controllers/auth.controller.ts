import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.model";
import { ActivityLog } from "../models/ActivityLog.model";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { sendSuccess, sendError } from "../utils/response";
import { AuthenticatedRequest, UserRole } from "../types";
import { ENV } from "../config/env";
import { generateUniqueUsername } from "../utils/username";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || "").toLowerCase().trim();

    if (!identifier || !password) {
      sendError({ res, statusCode: 400, message: "Email or username, and password are required." });
      return;
    }

    // Support login via either email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+passwordHash");

    if (!user) {
      sendError({ res, statusCode: 401, message: "Invalid email/username or password." });
      return;
    }

    if (!user.isActive) {
      sendError({
        res,
        statusCode: 403,
        message: "Your account has been deactivated. Please contact the chamber administrator.",
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      sendError({ res, statusCode: 401, message: "Invalid email/username or password." });
      return;
    }

    // Generate JWT Tokens with 30-day validity
    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Update lastActiveAt
    user.lastActiveAt = new Date();
    await user.save();

    // Log Activity
    await ActivityLog.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: "auth:login",
      entityType: "auth",
      description: `User ${user.name} logged into chamber management system.`,
      ipAddress: req.ip || req.socket.remoteAddress || "",
      userAgent: req.headers["user-agent"] || "",
    }).catch((err) => console.error("[ActivityLog] Failed to record login log:", err));

    // Set HTTP-Only Cookie with 30-day lifetime
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days active session
    });

    sendSuccess({
      res,
      message: "Login successful.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          chamberDesignation: user.chamberDesignation,
          associateId: user.associateId,
          avatarUrl: user.avatarUrl,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("[Auth Controller] Login Error:", error);
    sendError({ res, statusCode: 500, message: "Internal server error during login." });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = "associate", chamberDesignation, associateId } = req.body;

    if (!name || !email || !password) {
      sendError({ res, statusCode: 400, message: "Name, email, and password are required." });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      sendError({ res, statusCode: 409, message: "An account with this email already exists." });
      return;
    }

    const salt = await bcrypt.genSalt(ENV.BCRYPT_SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, salt);

    // Automatically generate unique username based on user name (e.g. tanvir102)
    const username = await generateUniqueUsername(name, role, async (candidate) => {
      const found = await User.findOne({ username: candidate });
      return !!found;
    });

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      username,
      passwordHash,
      role: role as UserRole,
      chamberDesignation: chamberDesignation || "Legal Practitioner",
      associateId: associateId || "",
      authProvider: "credentials",
      isActive: true,
    });

    const tokenPayload = {
      id: newUser._id.toString(),
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Log Activity
    await ActivityLog.create({
      userId: newUser._id,
      userName: newUser.name,
      userEmail: newUser.email,
      userRole: newUser.role,
      action: "user:create",
      entityType: "user",
      entityId: newUser._id.toString(),
      entityTitle: newUser.name,
      description: `New user account created: ${newUser.name} (${newUser.role})`,
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
    }).catch(() => {});

    sendSuccess({
      res,
      statusCode: 201,
      message: "User registered successfully.",
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
          chamberDesignation: newUser.chamberDesignation,
          associateId: newUser.associateId,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("[Auth Controller] Register Error:", error);
    sendError({ res, statusCode: 500, message: "Internal server error during registration." });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError({ res, statusCode: 401, message: "Unauthorized." });
      return;
    }

    const user = await User.findById(req.user.id).populate("allowedInstitutions", "name shortCode");
    if (!user) {
      sendError({ res, statusCode: 404, message: "User not found." });
      return;
    }

    sendSuccess({
      res,
      message: "Current authenticated user profile retrieved.",
      data: user,
    });
  } catch (error) {
    console.error("[Auth Controller] getMe Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to retrieve user profile." });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      sendError({ res, statusCode: 400, message: "Refresh token is required." });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || !decoded.id) {
      sendError({ res, statusCode: 401, message: "Invalid or expired refresh token." });
      return;
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      sendError({ res, statusCode: 401, message: "User is inactive or not found." });
      return;
    }

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    sendSuccess({
      res,
      message: "Tokens refreshed successfully.",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error("[Auth Controller] Refresh Token Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to refresh token." });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: "auth:logout",
        entityType: "auth",
        description: `User ${req.user.name} logged out.`,
      }).catch(() => {});
    }

    res.clearCookie("accessToken");

    sendSuccess({
      res,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("[Auth Controller] Logout Error:", error);
    sendError({ res, statusCode: 500, message: "Failed to logout." });
  }
};
