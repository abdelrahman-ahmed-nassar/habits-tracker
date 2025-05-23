import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../types/express";
import logger from "../utils/logger";
import env from "../config/env";

// Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Not found middleware - for routes that don't exist
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
};

// Global error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorResponse: ErrorResponse = {
    error: "Server Error",
    message: "Something went wrong",
    statusCode: 500,
  };

  // If it's our custom AppError
  if (err instanceof AppError) {
    errorResponse.error = err.name;
    errorResponse.message = err.message;
    errorResponse.statusCode = err.statusCode;
  } else {
    // For unexpected errors, don't leak error details in production
    errorResponse.error = "Server Error";
    errorResponse.message =
      env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message || "Something went wrong";
  }

  // Add stack trace in non-production environments
  if (env.NODE_ENV !== "production") {
    errorResponse.stack = err.stack;
  }

  // Log the error
  logger.error(`${errorResponse.statusCode} - ${errorResponse.message}`, {
    path: req.path,
    method: req.method,
    error: err,
  });

  res.status(errorResponse.statusCode).json({
    success: false,
    error: errorResponse.error,
    message: errorResponse.message,
    ...(env.NODE_ENV !== "production" && { stack: errorResponse.stack }),
    timestamp: new Date().toISOString(),
  });
};
