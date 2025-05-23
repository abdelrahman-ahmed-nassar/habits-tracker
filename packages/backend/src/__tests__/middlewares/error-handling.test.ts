import request from "supertest";
import express from "express";
import {
  AppError,
  errorHandler,
  notFoundHandler,
} from "../../middlewares/errorMiddleware";
import env from "../../config/env";

describe("Error Handling Middleware", () => {
  // Save original NODE_ENV and restore after tests
  const originalNodeEnv = env.NODE_ENV;

  afterAll(() => {
    // Restore the environment
    Object.defineProperty(env, "NODE_ENV", {
      value: originalNodeEnv,
    });
  });

  it("should handle custom AppError with correct status code", async () => {
    const app = express();

    app.get("/test-error", (req, res, next) => {
      next(new AppError("Custom error message", 422));
    });

    app.use(errorHandler);

    const response = await request(app).get("/test-error");

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Custom error message");
  });

  it("should handle standard Error with 500 status code", async () => {
    const app = express();

    app.get("/standard-error", (req, res, next) => {
      next(new Error("Standard error"));
    });

    app.use(errorHandler);

    const response = await request(app).get("/standard-error");

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  it("should handle 404 errors with notFoundHandler", async () => {
    const app = express();

    // Apply the notFoundHandler after all routes
    app.get("/existing-route", (req, res) => {
      res.json({ exists: true });
    });

    app.use(notFoundHandler);
    app.use(errorHandler);

    const response = await request(app).get("/non-existing-route");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("not found");
  });

  it("should hide error details in production mode", async () => {
    // Temporarily set NODE_ENV to production
    Object.defineProperty(env, "NODE_ENV", {
      value: "production",
    });

    const app = express();

    app.get("/error", (req, res, next) => {
      next(new Error("Detailed error that should be hidden"));
    });

    app.use(errorHandler);

    const response = await request(app).get("/error");

    expect(response.status).toBe(500);
    expect(response.body.message).not.toContain("Detailed error");
    expect(response.body.stack).toBeUndefined();

    // Reset NODE_ENV back to the test value
    Object.defineProperty(env, "NODE_ENV", {
      value: "test",
    });
  });

  it("should show error details in development mode", async () => {
    // Ensure we're in development mode
    Object.defineProperty(env, "NODE_ENV", {
      value: "development",
    });

    const app = express();

    app.get("/error", (req, res, next) => {
      next(new Error("Detailed error that should be shown"));
    });

    app.use(errorHandler);

    const response = await request(app).get("/error");

    expect(response.status).toBe(500);
    expect(response.body.message).toContain("Detailed error");
    expect(response.body.stack).toBeDefined();
  });
});
