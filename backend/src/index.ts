import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import habitRoutes from "./routes/habitRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import noteRoutes from "./routes/noteRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/habits", habitRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notes", noteRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
