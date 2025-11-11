import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { buildServer } from "../../server";
import supertest from "supertest";

describe("User – PUT /v1/users/:user_id/push_token", () => {
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
  const fakeToken = "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]";

  it("200 – set push token", async () => {
    const res = await request
      .put(`/api/v1/users/${uid}/push_token`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ push_token: fakeToken })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Push token updated successfully");
    expect(res.body.data.id).toBe(uid);
    expect(res.body.data.push_token).toBe(fakeToken);
    expect(res.body.data.push_token_last_updated).toBeDefined();
  });

  it("400 – missing push_token", async () => {
    const res = await request
      .put(`/api/v1/users/${uid}/push_token`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({})
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  it("401 – no auth", async () => {
    await request
      .put(`/api/v1/users/${uid}/push_token`)
      .send({ push_token: fakeToken })
      .expect(401);
  });

  it("403 – other user", async () => {
    await request
      .put(`/api/v1/users/88888888-8888-8888-8888-888888888888/push_token`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ push_token: fakeToken })
      .expect(403);
  });

  it("404 – user not found", async () => {
    await request
      .put(`/api/v1/users/99999999-9999-9999-9999-999999999999/push_token`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ push_token: fakeToken })
      .expect(404);
  });
});