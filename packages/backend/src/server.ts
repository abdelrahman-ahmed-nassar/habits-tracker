import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Apply middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// TODO: Import and use route handlers
// app.use('/api/habits', habitsRouter);
// app.use('/api/completions', completionsRouter);
// app.use('/api/notes', notesRouter);
// app.use('/api/analytics', analyticsRouter);
// app.use('/api/settings', settingsRouter);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "production"
          ? "Something went wrong"
          : err.message,
    });
  }
);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
