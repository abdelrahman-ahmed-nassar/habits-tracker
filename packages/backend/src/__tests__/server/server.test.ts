import request from "supertest";
import createApp from "../../server";
import http from "http";

describe("Express Server", () => {
  let server: http.Server;
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    // Create app instance but don't start listening
    app = createApp();
  });

  afterAll(async () => {
    // If server is running from other tests, close it
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  });

  it("should respond to health check", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
  });

  it("should return 404 for non-existing routes", async () => {
    const response = await request(app).get("/non-existing-route");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Error");
  });

  it("should handle JSON parsing errors", async () => {
    const response = await request(app)
      .post("/api/habits")
      .set("Content-Type", "application/json")
      .send('{"invalid JSON');

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  it("should bind to a port when started", async () => {
    // Test that the server can actually bind to a port
    const PORT = 0; // Let the OS assign a free port

    server = app.listen(PORT);
    const address = server.address();

    expect(address).not.toBeNull();
    if (typeof address === "object" && address !== null) {
      expect(address.port).toBeGreaterThan(0);
    }
  });
});
