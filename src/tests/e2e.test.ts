import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { buildServer } from "../server";
import supertest from "supertest";

describe("E2E – Full API Flow", () => {
  let request: supertest.SuperTest<supertest.Test>;
  let userId = "";
  let accessToken = "";
  let refreshToken = "";

  beforeAll(async () => {
    const app = await buildServer();
    await app.ready();
    request = supertest(app.server) as any;
    (global as any).app = app;
  });

  afterAll(async () => {
    await (global as any).app.close();
  });

  describe("GET /health", () => {
    it("should return ok", async () => {
      const res = await request.get("/health").expect(200);
      expect(res.body).toEqual({ status: "ok" });
    });
  });

  describe("POST /api/v1/auth/register", () => {
    const payload = {
      email: `test@example.com`,
      password: "Secure123!",
      first_name: "E2E",
      last_name: "Tester",
      phone_number: "1234567890",
    };

    it("201 – registers a new user", async () => {
      const res = await request.post("/api/v1/auth/register").send(payload).expect(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("User registered successfully");
      expect(res.body.data.user_id).toBeDefined();
      expect(res.body.data.email).toBe(payload.email);
      userId = res.body.data.user_id;
    });

    it("400 – missing required fields", async () => {
      await request.post("/api/v1/auth/register").send({ email: "bad@example.com" }).expect(400);
    });

    it("400 – duplicate email", async () => {
      await request.post("/api/v1/auth/register").send(payload).expect(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    const known = {
      email: `test@example.com`,
      password: "Secure123!",
    };

    it("200 – returns tokens", async () => {
      const res = await request.post("/api/v1/auth/login").send(known).expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Login successful");
      expect(res.body.data.access_token).toBeDefined();
      expect(res.body.data.refresh_token).toBeDefined();
      expect(res.body.data.expires_in).toBe(3600);
      expect(res.body.data.token_type).toBe("Bearer");
      expect(res.body.data.user_id).toBeDefined();

      accessToken = res.body.data.access_token;
      refreshToken = res.body.data.refresh_token;
    });

    it("400 – missing credentials", async () => {
      await request.post("/api/v1/auth/login").send({ email: known.email }).expect(400);
    });

    it("400 – wrong password", async () => {
      await request
        .post("/api/v1/auth/login")
        .send({ email: known.email, password: "wrong" })
        .expect(400);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("200 – new access token", async () => {
      const res = await request
        .post("/api/v1/auth/refresh")
        .send({ refresh_token: refreshToken })
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Token refreshed successfully");
      expect(res.body.data.access_token).toBeDefined();
      expect(res.body.data.expires_in).toBe(3600);

      accessToken = res.body.data.access_token;
    });

    it("401 – invalid token", async () => {
      await request
        .post("/api/v1/auth/refresh")
        .send({ refresh_token: "bad" })
        .expect(401);
    });

    it("400 – missing token", async () => {
      await request.post("/api/v1/auth/refresh").send({}).expect(400);
    });
  });

  describe("GET /api/v1/users/:user_id", () => {
    it("200 – own profile", async () => {
      const res = await request
        .get(`/api/v1/users/${userId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user_id).toBe(userId);
      expect(res.body.data.email).toBeDefined();
    });

    it("401 – missing token", async () => {
      await request.get(`/api/v1/users/${userId}`).expect(401);
    });

    it("403 – user id mismatch token", async () => {
      await request
        .get("/api/v1/users/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(403);
    });
  });

  describe("PUT /api/v1/users/:user_id", () => {
    it("200 – update profile", async () => {
      const payload = { firstName: "Updated", lastName: "User", phoneNumber: "9999999999" };
      const res = await request
        .put(`/api/v1/users/${userId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Profile updated successfully");
      expect(res.body.data.id).toBe(userId);
    });

    it("400 – empty payload", async () => {
      await request
        .put(`/api/v1/users/${userId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({})
        .expect(400);
    });

    it("401 – no token", async () => {
      await request.put(`/api/v1/users/${userId}`).send({ firstName: "X" }).expect(401);
    });
  });

  describe("GET /api/v1/users/:user_id/contact", () => {
    it("200 – contact info", async () => {
      const res = await request
        .get(`/api/v1/users/${userId}/contact`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user_id).toBe(userId);
      expect(res.body.data.email).toBeDefined();
    });

    it("401 – missing token", async () => {
      await request.get(`/api/v1/users/${userId}/contact`).expect(401);
    });
  });

  describe("PUT /api/v1/users/:user_id/contact", () => {
    it("200 – update preferences", async () => {
      const payload = { prefers_email: false, prefers_push: true };
      const res = await request
        .put(`/api/v1/users/${userId}/contact`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Preference updated successfully");
      expect(res.body.data.id).toBe(userId);
      expect(res.body.data.prefers_email).toBe(false);
    });

    it("400 – empty payload", async () => {
      await request
        .put(`/api/v1/users/${userId}/contact`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({})
        .expect(400);
    });
  });

  describe("PUT /api/v1/users/:user_id/push_token", () => {
    const token = "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]";

    it("200 – set push token", async () => {
      const res = await request
        .put(`/api/v1/users/${userId}/push_token`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ push_token: token })
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Push token updated successfully");
      expect(res.body.data.id).toBe(userId);
      expect(res.body.data.push_token).toBe(token);
    });

    it("400 – missing token", async () => {
      await request
        .put(`/api/v1/users/${userId}/push_token`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({})
        .expect(400);
    });
  });

  describe("Auth – Logout", () => {  
    it("POST /api/v1/auth/logout → 200 (tokens)", async () => {
      const res = await request.post("/api/v1/auth/logout").set("Authorization", `Bearer ${accessToken}`).expect(200);
  
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Logged out successfully");
  
      accessToken = "";
      refreshToken = "";
    });
  
    it("400 – missing authorization headers", async () => {
      const res = await request
        .post("/api/v1/auth/logout")
        .expect(400);
      expect(res.body.success).toBe(false);
    });
  });
});