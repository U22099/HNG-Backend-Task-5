import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { buildServer } from "../../server";
import supertest from "supertest";

describe("Auth – Register", () => {
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

  it("POST /api/v1/auth/register → 201 (success)", async () => {
    const payload = {
      email: `test@example.com`, //reg-${Date.now()}@example.com
      password: "Secure123!",
      first_name: "John",
      last_name: "Doe",
      phone_number: "1234567890",
    };

    const res = await request
      .post("/api/v1/auth/register")
      .send(payload)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User registered successfully");
    expect(res.body.data.user_id).toBeDefined();
    expect(res.body.data.email).toBe(payload.email);
    expect(res.body.data.created_at).toBeDefined();

    // store for later tests
    (global as any).testCtx.registeredUserId = res.body.data.user_id;
  });

  it("400 – missing required fields", async () => {
    const res = await request
      .post("/api/v1/auth/register")
      .send({ email: "partial@example.com" })
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  it("400 – email already exists", async () => {
    const payload = {
      email: `dup-${Math.random() * 100}@example.com`,
      password: "Secure123!",
      first_name: "Jane",
      last_name: "Doe",
      phone_number: "1234567890",
    };
    await request.post("/api/v1/auth/register").send(payload).expect(201);
    const res = await request
      .post("/api/v1/auth/register")
      .send(payload)
      .expect(400);
    expect(res.body.success).toBe(false);
  });
});
