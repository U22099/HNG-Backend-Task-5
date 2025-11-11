import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { buildServer } from "../../server";
import supertest from "supertest";

describe("User – PUT /v1/users/:user_id/contact", () => {
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

  it("200 – update preferences", async () => {
    const payload = { prefers_email: false, prefers_push: true };
    const res = await request
      .put(`/api/v1/users/${uid}/contact`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(payload)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Preference updated successfully");
    expect(res.body.data.id).toBe(uid);
    expect(res.body.data.prefers_email).toBe(false);
    expect(res.body.data.prefers_push).toBe(true);
  });

  it("400 – empty body", async () => {
    const res = await request
      .put(`/api/v1/users/${uid}/contact`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({})
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  it("401 – no token", async () => {
    await request
      .put(`/api/v1/users/${uid}/contact`)
      .send({ prefers_email: true })
      .expect(401);
  });

  it("403 – other user", async () => {
    await request
      .put(`/api/v1/users/66666666-6666-6666-6666-666666666666/contact`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ prefers_email: true })
      .expect(403);
  });

  it("404 – not found", async () => {
    await request
      .put(`/api/v1/users/77777777-7777-7777-7777-777777777777/contact`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ prefers_email: true })
      .expect(404);
  });
});