import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { buildServer } from "../../server";
import supertest from "supertest";

describe("User – GET /v1/users/:user_id/contact", () => {
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
  const uid = registeredUserId || userId;

  it("200 – contact info", async () => {
    const res = await request
      .get(`/api/v1/users/${uid}/contact`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user_id).toBe(uid);
    expect(res.body.data.email).toBeDefined();
    expect(res.body.data.phone_number).toBeDefined();
    expect(typeof res.body.data.prefers_email).toBe("boolean");
  });

  it("401 – missing auth", async () => {
    await request.get(`/api/v1/users/${uid}/contact`).expect(401);
  });

  it("403 – other user", async () => {
    await request
      .get(`/api/v1/users/44444444-4444-4444-4444-444444444444/contact`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(403);
  });

  it("404 – not found", async () => {
    await request
      .get(`/api/v1/users/55555555-5555-5555-5555-555555555555/contact`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(404);
  });
});