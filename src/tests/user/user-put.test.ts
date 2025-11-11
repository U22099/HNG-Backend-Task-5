import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { buildServer } from "../../server";
import supertest from "supertest";

describe("User – PUT /v1/users/:user_id", () => {
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

  it("200 – update own profile", async () => {
    const payload = {
      firstName: "Janet",
      lastName: "Doer",
      phoneNumber: "0987654321",
    };
    const res = await request
      .put(`/api/v1/users/${targetId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(payload)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Profile updated successfully");
    expect(res.body.data.id).toBe(targetId);
    expect(res.body.data.updated_at).toBeDefined();
  });

  it("400 – empty payload", async () => {
    const res = await request
      .put(`/api/v1/users/${targetId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({})
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  it("401 – no token", async () => {
    await request.put(`/api/v1/users/${targetId}`).send({ firstName: "X" }).expect(401);
  });

  it("403 – trying to edit another user", async () => {
    const res = await request
      .put(`/api/v1/users/22222222-2222-2222-2222-222222222222`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ firstName: "Hack" })
      .expect(403);
    expect(res.body.success).toBe(false);
  });

  it("404 – user not found", async () => {
    const res = await request
      .put(`/api/v1/users/33333333-3333-3333-3333-333333333333`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ firstName: "Ghost" })
      .expect(404);
    expect(res.body.success).toBe(false);
  });
});