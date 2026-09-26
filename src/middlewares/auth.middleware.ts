import { Response, NextFunction } from "express";
import { AuthenticatedRequest, UserRole } from "../types";
import { verifyAccessToken } from "../utils/jwt";
import { User } from "../models/User.model";
import { sendError } from "../utils/response";

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization Header: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
      // Check Cookies
      token = req.cookies.accessToken;
    }

    if (!token) {
      sendError({
        res,
        statusCode: 401,
        message: "Authentication required. No access token provided.",
      });
      return;
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.id) {
      sendError({
        res,
        statusCode: 401,
        message: "Invalid or expired access token. Please login again.",
      });
      return;
    }

    const user = await User.findById(decoded.id).select(
      "name email role chamberDesignation associateId allowedInstitutions isActive"
    );

    if (!user) {
      sendError({
        res,
        statusCode: 401,
        message: "User associated with this token no longer exists.",
      });
      return;
    }

    if (!user.isActive) {
      sendError({
        res,
        statusCode: 403,
        message: "Account has been deactivated. Please contact the Lead Advocate / Admin.",
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      chamberDesignation: user.chamberDesignation,
      associateId: user.associateId,
      allowedInstitutions: user.allowedInstitutions?.map((id) => id.toString()),
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    console.error("[Auth Middleware] Error:", error);
    sendError({
      res,
      statusCode: 500,
      message: "Internal authentication error.",
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError({
        res,
        statusCode: 401,
        message: "Authentication required.",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError({
        res,
        statusCode: 403,
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.`,
      });
      return;
    }

    next();
  };
};
