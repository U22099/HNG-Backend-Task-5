import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { buildServer } from "../../server";
import supertest from "supertest";

describe("User – GET /v1/users/:user_id", () => {
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

  const { accessToken, registeredUserId, userId } = (global as any).testCtx;
  const targetId = registeredUserId || userId;

  it("200 – own profile", async () => {
    const res = await request
      .get(`/api/v1/users/${targetId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user_id).toBe(targetId);
    expect(res.body.data.first_name).toBeDefined();
    expect(res.body.data.email).toBeDefined();
  });

  it("401 – missing token", async () => {
    await request.get(`/api/v1/users/${targetId}`).expect(401);
  });

  it("403 – other user (if policy forbids)", async () => {
    const res = await request
      .get(`/api/v1/users/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(403);
    expect(res.body.success).toBe(false);
  });

  it("404 – non‑existent user", async () => {
    const res = await request
      .get(`/api/v1/users/11111111-1111-1111-1111-111111111111`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(404);
    expect(res.body.success).toBe(false);
  });
});