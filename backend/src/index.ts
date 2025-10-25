import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
const path = require("path");

import habitRoutes from "./routes/habitRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import noteRoutes from "./routes/noteRoutes";
import recordsRoutes from "./routes/recordsRoutes";
import completionsRoutes from "./routes/completionsRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import optionsRoutes from "./routes/optionsRoutes";
import backupRoutes from "./routes/backupRoutes";
import tagRoutes from "./routes/tagRoutes";
import templateRoutes from "./routes/templateRoutes";
import counterRoutes from "./routes/counterRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { invalidateAnalyticsCache } from "./middleware/cacheMiddleware";

const app: Express = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Cache invalidation middleware - should come after express.json()
// to have access to the request body
app.use(invalidateAnalyticsCache);

// Routes
app.use("/api/habits", habitRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/completions", completionsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/options", optionsRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/counters", counterRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, "../../../build")));

// Serve React app for all other routes (should be last)
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "../../../build", "index.html"));
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
  console.log(`################################`);
  console.log(`#                              #`);
  console.log(`#       Ctrl + Click           #`);
  console.log(`#                              #`);
  console.log(`#            ||                #`);
  console.log(`#            \\/                #`);
  console.log(`#                              #`);
  console.log(`#     http://localhost:${PORT}    #`);
  console.log(`#                              #`);
  console.log(`#                              #`);
  console.log(`################################`);
});

export default app;
