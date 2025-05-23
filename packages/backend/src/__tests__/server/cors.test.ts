import request from "supertest";
import createApp from "../../server";
import env from "../../config/env";

describe("CORS Configuration", () => {
  const app = createApp();

  it("should allow requests from configured origin", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", env.CORS_ORIGIN);

    expect(response.headers["access-control-allow-origin"]).toBe(
      env.CORS_ORIGIN
    );
  });

  it("should allow defined HTTP methods", async () => {
    const response = await request(app)
      .options("/api/health")
      .set("Origin", env.CORS_ORIGIN)
      .set("Access-Control-Request-Method", "GET");

    expect(response.headers["access-control-allow-methods"]).toContain("GET");
    expect(response.headers["access-control-allow-methods"]).toContain("POST");
    expect(response.headers["access-control-allow-methods"]).toContain("PUT");
    expect(response.headers["access-control-allow-methods"]).toContain(
      "DELETE"
    );
  });

  it("should allow defined headers", async () => {
    const response = await request(app)
      .options("/api/health")
      .set("Origin", env.CORS_ORIGIN)
      .set("Access-Control-Request-Method", "GET")
      .set("Access-Control-Request-Headers", "Content-Type, Authorization");

    expect(response.headers["access-control-allow-headers"]).toContain(
      "Content-Type"
    );
    expect(response.headers["access-control-allow-headers"]).toContain(
      "Authorization"
    );
  });
});
