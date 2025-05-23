import { Response, NextFunction } from "express";
import { analyticsCache } from "../utils/cacheUtils";

/**
 * Middleware to invalidate analytics cache when habits or completions change
 */
export const invalidateAnalyticsCache = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  // Store the original send method
  const originalSend = res.send;

  // Override the send method
  res.send = function (body) {
    // Only invalidate cache if request was successful
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const method = req.method;
      const path = req.path;

      // Invalidate different cache segments based on the path
      if (path.includes("/habits")) {
        // If it's a specific habit
        if (path.match(/\/habits\/[a-zA-Z0-9-]+/)) {
          const habitId = path.split("/")[2];

          // Invalidate cache for this specific habit
          analyticsCache.invalidateByPrefix(`analytics:habit:${habitId}`);
        }

        // Invalidate overview analytics
        analyticsCache.invalidateByPrefix("analytics:overview");

        // If completing a habit, invalidate daily cache for that date
        if (path.includes("/complete")) {
          const requestBody = req.body;
          if (requestBody && requestBody.date) {
            analyticsCache.invalidateByPrefix(
              `analytics:daily:${requestBody.date}`
            );

            // Get month and year from date
            const dateParts = requestBody.date.split("-");
            if (dateParts.length === 3) {
              const year = dateParts[0];
              const month = parseInt(dateParts[1], 10);

              // Invalidate monthly cache
              analyticsCache.invalidateByPrefix(
                `analytics:monthly:${year}:${month}`
              );

              // Invalidate weekly caches that could include this date
              // This is a simplification - ideally we would only invalidate weeks containing this date
              analyticsCache.invalidateByPrefix("analytics:weekly:");
            }
          }
        }
      } else if (path.includes("/records")) {
        // Invalidate all analytics caches as records affect all levels
        analyticsCache.invalidateByPrefix("analytics:");
      }
    }

    // Call the original send method
    return originalSend.call(this, body);
  };

  next();
};
