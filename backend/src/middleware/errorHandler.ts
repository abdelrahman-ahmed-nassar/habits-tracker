import { Request, Response, NextFunction } from "express";

interface ApiError extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  console.error(`Error: ${message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

/**
 * Create a custom error with status code and optional validation errors
 */
export class AppError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(message: string, statusCode: number, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;

    // This is needed because we're extending a built-in class
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Async handler to catch errors in async route handlers
 */
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
