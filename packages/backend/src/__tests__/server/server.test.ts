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

    const statusValue = response.status;
    const successValue = response.body.success;
    const statusDataValue = response.body.data.status;

    expect(statusValue).toBe(200);
    expect(successValue).toBe(true);
    expect(statusDataValue).toBe("ok");
  });

  it("should return 404 for non-existing routes", async () => {
    const response = await request(app).get("/non-existing-route");

    const statusValue = response.status;
    const successValue = response.body.success;
    const errorValue = response.body.error;

    expect(statusValue).toBe(404);
    expect(successValue).toBe(false);
    expect(errorValue).toBe("Error");
  });

  it("should handle JSON parsing errors", async () => {
    const response = await request(app)
      .post("/api/habits")
      .set("Content-Type", "application/json")
      .send('{"invalid JSON');

    const statusValue = response.status;
    const successValue = response.body.success;

    expect(statusValue).toBe(500);
    expect(successValue).toBe(false);
  });

  it("should bind to a port when started", async () => {
    // Test that the server can actually bind to a port
    const PORT = 0; // Let the OS assign a free port

    server = app.listen(PORT);
    const address = server.address();

    const isAddressNull = address === null;
    expect(isAddressNull).toBe(false);

    if (typeof address === "object" && address !== null) {
      const portValue = address.port;
      expect(portValue).toBeGreaterThan(0);
    }
  });
});
