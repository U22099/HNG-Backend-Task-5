import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { buildServer } from "../../server";
import supertest from "supertest";

describe("Auth – Logout", () => {
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    const app = await buildServer();
    await app.ready();
    request = supertest(app.server) as any;
    (global as any).testCtx = { ...(global as any).testCtx, app };
  });

  afterAll(async () => {
    await (global as any).testCtx.app.close();
  });

  it("POST /api/v1/auth/logout → 200 (tokens)", async () => {
    const res = await request
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${(global as any).testCtx.accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Logged out successfully");

    (global as any).testCtx.accessToken = null;
    (global as any).testCtx.refreshToken = null;
  });

  it("400 – missing authorization headers", async () => {
    const res = await request.post("/api/v1/auth/logout").expect(400);
    expect(res.body.success).toBe(false);
  });
});
