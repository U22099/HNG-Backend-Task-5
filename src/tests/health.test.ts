import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { buildServer } from "../server";
import supertest from "supertest";

describe("Health Check", () => {
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    const app = await buildServer();
    await app.ready();
    request = supertest(app.server) as any;
    (global as any).testCtx = { app };
  });

  afterAll(async () => {
    await (global as any).testCtx.app.close();
  });

  it("GET /api/health → 200 { status: 'ok' }", async () => {
    const res = await request.get("/health").expect(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});