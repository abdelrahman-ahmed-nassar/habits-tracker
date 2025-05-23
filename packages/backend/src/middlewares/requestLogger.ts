import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import env from '../config/env';

/**
 * Request logging middleware
 * Logs information about incoming requests and their responses
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Skip logging for health check routes in production to avoid log pollution
  if (env.NODE_ENV === 'production' && req.path === '/api/health') {
    return next();
  }

  const start = Date.now();
  const reqId = Math.random().toString(36).substring(2, 10);
  
  // Log the request
  logger.info(`[${reqId}] Request: ${req.method} ${req.originalUrl}`);
  
  // Log the request body in debug mode
  if (env.LOG_LEVEL === 'debug' && req.body && Object.keys(req.body).length) {
    logger.debug(`[${reqId}] Request body:`, req.body);
  }

  // Capture the response
  const originalSend = res.send;
  res.send = function(body) {
    res.locals.body = body;
    return originalSend.call(this, body);
  };

  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const size = res.get('content-length') || 0;
    
    logger.info(
      `[${reqId}] Response: ${res.statusCode} ${res.statusMessage} - ${duration}ms - ${size} bytes`
    );
    
    // Log the response body in debug mode, but avoid logging large responses
    if (env.LOG_LEVEL === 'debug' && res.locals.body && res.statusCode >= 400) {
      try {
        const parsedBody = JSON.parse(res.locals.body);
        logger.debug(`[${reqId}] Response body:`, parsedBody);
      } catch (e) {
        // If we can't parse it, just log the first part
        logger.debug(`[${reqId}] Response body: ${res.locals.body.toString().substring(0, 200)}`);
      }
    }
  });

  next();
}; 