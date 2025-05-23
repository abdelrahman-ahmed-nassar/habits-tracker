import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import { responseHandler } from "../../middlewares/responseHandler";

// Helper function to create test request with middleware
const createTestApp = (middleware: any[]) => {
  const app = express();

  // Apply all middlewares in order
  middleware.forEach((mw) => app.use(mw));

  // Test endpoint
  app.get("/test", (req, res: any) => {
    if ("success" in res) {
      res.success({ test: true });
    } else {
      res.status(200).json({ test: true });
    }
  });

  return app;
};

describe("Middleware Chain", () => {
  it("should execute middleware in correct order", async () => {
    // Create middleware that track execution order
    const executionOrder: string[] = [];

    const middleware1 = (req: Request, res: Response, next: NextFunction) => {
      executionOrder.push("middleware1");
      next();
    };

    const middleware2 = (req: Request, res: Response, next: NextFunction) => {
      executionOrder.push("middleware2");
      next();
    };

    const middleware3 = (req: Request, res: Response, next: NextFunction) => {
      executionOrder.push("middleware3");
      next();
    };

    const app = createTestApp([middleware1, middleware2, middleware3]);

    // Make request
    await request(app).get("/test");

    // Check execution order
    expect(executionOrder).toEqual([
      "middleware1",
      "middleware2",
      "middleware3",
    ]);
  });

  it("should stop middleware chain on error", async () => {
    // Create middleware that track execution order
    const executionOrder: string[] = [];

    const middleware1 = (req: Request, res: Response, next: NextFunction) => {
      executionOrder.push("middleware1");
      next();
    };

    const errorMiddleware = (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      executionOrder.push("errorMiddleware");
      next(new Error("Test error"));
    };

    const neverExecuted = (req: Request, res: Response, next: NextFunction) => {
      executionOrder.push("neverExecuted");
      next();
    };

    const errorHandler = (
      err: Error,
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      executionOrder.push("errorHandler");
      res.status(500).json({ error: err.message });
    };

    const app = createTestApp([
      middleware1,
      errorMiddleware,
      neverExecuted,
      errorHandler,
    ]);

    // Make request
    await request(app).get("/test");

    // Check execution order - neverExecuted should not be called
    expect(executionOrder).toEqual([
      "middleware1",
      "errorMiddleware",
      "errorHandler",
    ]);
  });

  it("should apply responseHandler middleware correctly", async () => {
    const app = createTestApp([responseHandler]);

    const response = await request(app).get("/test");

    // Check that response formatter was applied
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({ test: true });
    expect(response.body.timestamp).toBeDefined();
  });
});
