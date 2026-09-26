import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError({
    res,
    statusCode: 404,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (
  err: Error & { statusCode?: number; code?: number },
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || (err.name === "ValidationError" ? 400 : 500);
  const message = err.message || "An unexpected internal server error occurred.";

  sendError({
    res,
    statusCode,
    message,
    errors: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
