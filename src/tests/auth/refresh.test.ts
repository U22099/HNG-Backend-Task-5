import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { buildServer } from "../../server";
import supertest from "supertest";

describe("Auth – Refresh Token", () => {
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

  it("POST /api/v1/auth/refresh → 200 (new access token)", async () => {
    const res = await request
      .post("/api/v1/auth/refresh")
      .send({ refresh_token: (global as any).testCtx.refreshToken })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.data.access_token).toBeDefined();
    expect(res.body.data.expires_in).toBe(3600);

    (global as any).testCtx.accessToken = res.body.data.access_token;
  });

  it("401 – invalid/expired refresh token", async () => {
    const res = await request
      .post("/api/v1/auth/refresh")
      .send({ refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid" })
      .expect(401);
    expect(res.body.success).toBe(false);
  });

  it("400 – missing refresh_token", async () => {
    const res = await request.post("/api/v1/auth/refresh").send({}).expect(400);
    expect(res.body.success).toBe(false);
  });
});