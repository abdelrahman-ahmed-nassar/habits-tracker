import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/express";

// Extend Express Response interface with module augmentation
// We're intentionally not prefixing the Response interface here as we're augmenting
// Express's existing interface, not creating a new one
/* eslint-disable @typescript-eslint/naming-convention */
declare module "express-serve-static-core" {
  interface Response {
    success<T>(data: T, message?: string, statusCode?: number): Response;
    error(error: string, message?: string, statusCode?: number): Response;
    notFound(message?: string): Response;
  }
}
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * Adds response helper methods to the Response object
 */
export const responseHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Success response helper
  res.success = function <T>(
    this: Response,
    data: T,
    message = "Success",
    statusCode = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return this.status(statusCode).json(response);
  };

  // Error response helper
  res.error = function (
    this: Response,
    error: string,
    message = "Error",
    statusCode = 400
  ): Response {
    const response: ApiResponse<null> = {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
    };

    return this.status(statusCode).json(response);
  };

  // Not found response helper
  res.notFound = function (
    this: Response,
    message = "Resource not found"
  ): Response {
    // Use the error method directly
    return res.error("Not Found", message, 404);
  };

  next();
};
