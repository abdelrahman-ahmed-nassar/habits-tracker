import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/express';

/**
 * Adds response helper methods to the Response object
 */
export const responseHandler = (req: Request, res: Response, next: NextFunction) => {
  // Success response helper
  res.success = function<T>(data: T, message: string = 'Success', statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    
    return res.status(statusCode).json(response);
  };

  // Error response helper
  res.error = function(error: string, message: string = 'Error', statusCode: number = 400): Response {
    const response: ApiResponse<null> = {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString()
    };
    
    return res.status(statusCode).json(response);
  };

  // Not found response helper
  res.notFound = function(message: string = 'Resource not found'): Response {
    return res.error('Not Found', message, 404);
  };

  next();
};

// Extend Express Response interface
declare global {
  namespace Express {
    interface Response {
      success: <T>(data: T, message?: string, statusCode?: number) => Response;
      error: (error: string, message?: string, statusCode?: number) => Response;
      notFound: (message?: string) => Response;
    }
  }
} 