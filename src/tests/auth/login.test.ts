import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { buildServer } from "../../server";
import supertest from "supertest";

describe("Auth – Login", () => {
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

  const knownUser = {
    email: 'test@example.com',
    password: "Secure123!",
  };

  it("POST /api/v1/auth/login → 200 (tokens)", async () => {
    const res = await request.post("/api/v1/auth/login").send(knownUser).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.data.access_token).toBeDefined();
    expect(res.body.data.refresh_token).toBeDefined();
    expect(res.body.data.expires_in).toBe(3600);
    expect(res.body.data.token_type).toBe("Bearer");
    expect(res.body.data.user_id).toBeDefined();

    (global as any).testCtx.accessToken = res.body.data.access_token;
    (global as any).testCtx.refreshToken = res.body.data.refresh_token;
    (global as any).testCtx.userId = res.body.data.user_id;
  });

  it("400 – missing email/password", async () => {
    const res = await request
      .post("/api/v1/auth/login")
      .send({ email: knownUser.email })
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  it("400 – invalid credentials", async () => {
    const res = await request
      .post("/api/v1/auth/login")
      .send({ email: knownUser.email, password: "wrong" })
      .expect(400);
    expect(res.body.success).toBe(false);
  });
});