import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

// Import environment configuration
import env from "./config/env";
import logger from "./utils/logger";

// Import middleware
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware";
import { requestLogger } from "./middlewares/requestLogger";
import { responseHandler } from "./middlewares/responseHandler";

// Import routes
import habitRoutes from "./routes/habitRoutes";
import backupRoutes from "./routes/backupRoutes";

/**
 * Creates and configures an Express application
 */
export function createApp() {
  // Initialize express app
  const app = express();

  // Apply middleware
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Apply custom middleware
  app.use(requestLogger);
  app.use(responseHandler);

  // Development logging
  if (env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.success(
      {
        status: "ok",
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
      "API is running"
    );
  });

  // Register API routes
  app.use("/api/habits", habitRoutes);
  app.use("/api/backups", backupRoutes);
  // TODO: Add other routes
  // app.use('/api/completions', completionsRouter);
  // app.use('/api/notes', notesRouter);
  // app.use('/api/analytics', analyticsRouter);
  // app.use('/api/settings', settingsRouter);

  // Handle 404 routes
  app.use(notFoundHandler);

  // Global error handling
  app.use(errorHandler);

  return app;
}

/**
 * Only start the server if this file is executed directly
 */
if (require.main === module) {
  const app = createApp();
  const PORT = env.PORT;

  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    logger.info(`Data directory: ${env.DATA_DIR}`);
  });

  // Handle unhandled promise rejections and exceptions
  process.on("unhandledRejection", (reason: Error) => {
    logger.error("Unhandled Promise Rejection:", reason);
    // In production, you might want to exit the process and let a process manager restart it
    // process.exit(1);
  });

  process.on("uncaughtException", (error: Error) => {
    logger.error("Uncaught Exception:", error);
    // It's generally unsafe to continue after an uncaught exception
    process.exit(1);
  });
}

export default createApp;
