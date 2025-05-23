import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import env from "../config/env";

// Define a custom interface for our response locals
interface IResponseLocals {
  body?: string | Buffer;
}

// Define proper send function type
type SendFunction = (body: unknown) => Response;

/**
 * Request logging middleware
 * Logs information about incoming requests and their responses
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip logging for health check routes in production to avoid log pollution
  if (env.NODE_ENV === "production" && req.path === "/api/health") {
    return next();
  }

  const start = Date.now();
  const reqId = Math.random().toString(36).substring(2, 10);

  // Log the request
  logger.info(`[${reqId}] Request: ${req.method} ${req.originalUrl}`);

  // Log the request body in debug mode with explicit type checking
  if (
    env.LOG_LEVEL === "debug" &&
    typeof req.body === "object" &&
    req.body !== null &&
    Object.keys(req.body).length > 0
  ) {
    // TypeScript doesn't infer the safety here, but we've checked req.body is a non-null object
    logger.debug(`[${reqId}] Request body:`, req.body);
  }

  // Capture the response
  const originalSend = res.send.bind(res) as SendFunction;
  res.send = function (body: unknown): Response {
    // Store the body in locals for logging
    if (typeof body === "string" || Buffer.isBuffer(body)) {
      // Use type assertion to add our custom property
      (res.locals as IResponseLocals).body = body;
    }
    return originalSend(body);
  };

  // Log when response is finished
  res.on("finish", () => {
    const duration = Date.now() - start;
    const contentLength = res.get("content-length");
    const size =
      contentLength !== undefined && contentLength !== null
        ? contentLength
        : "0";

    logger.info(
      `[${reqId}] Response: ${res.statusCode} ${res.statusMessage} - ${duration}ms - ${size} bytes`
    );

    // Type assertion for res.locals
    const locals = res.locals as IResponseLocals;

    // Log the response body in debug mode, but avoid logging large responses
    if (
      env.LOG_LEVEL === "debug" &&
      locals.body !== undefined &&
      res.statusCode >= 400
    ) {
      try {
        if (typeof locals.body === "string") {
          // We're explicitly checking the type before parsing
          const parsedBody = JSON.parse(locals.body);
          logger.debug(`[${reqId}] Response body:`, parsedBody);
        }
      } catch (e) {
        // If we can't parse it, just log the first part
        if (typeof locals.body === "string") {
          logger.debug(
            `[${reqId}] Response body: ${locals.body.substring(0, 200)}`
          );
        } else if (Buffer.isBuffer(locals.body)) {
          logger.debug(
            `[${reqId}] Response body: [Buffer of length ${locals.body.length}]`
          );
        }
      }
    }
  });

  next();
};
