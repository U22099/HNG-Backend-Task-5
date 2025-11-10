import { FastifyInstance } from "fastify";
import { register, login } from "../services/auth.service";
import { refreshToken } from "../services/token.service";

export function authRoutes(app: FastifyInstance) {
  app.post("/v1/auth/register", async (req, reply) => {
    try {
      const data = await register(req.body);
      reply
        .code(201)
        .send({ success: true, message: "User registered successfully", data });
    } catch (error: any) {
      console.error("Error in POST /v1/auth/register:", error);
      if (error.message === "Missing required fields") {
        return reply
          .code(400)
          .send({ success: false, error: "Missing required fields" });
      } else if (error.message === "Registration failed") {
        return reply
          .code(400)
          .send({ success: false, error: "Registration failed" });
      } else
        return reply
          .code(500)
          .send({ success: false, error: "Internal Server Error" });
    }
  });

  app.post("/v1/auth/login", async (req, reply) => {
    try {
      const data = await login(app, req.body);
      reply.send({ success: true, message: "Login successful", data });
    } catch (error: any) {
      console.error("Error in POST /v1/auth/login:", error);
      if (error.message === "Missing email or password") {
        return reply
          .code(400)
          .send({ success: false, error: "Missing email or password" });
      } else if (error.message === "Invalid credentials") {
        return reply
          .code(400)
          .send({ success: false, error: "Invalid credentials" });
      } else if (error.message === "Login failed") {
        return reply.code(400).send({ success: false, error: "Login failed" });
      } else
        return reply
          .code(500)
          .send({ success: false, error: "Internal Server Error" });
    }
  });

  app.post("/v1/auth/refresh", async (req, reply) => {
    try {
      const data = await refreshToken(app, req.body);
      reply.send({ success: true, message: "Login successful", data });
    } catch (error: any) {
      console.error("Error in POST /v1/auth/login:", error);
      if (error.message === "Unauthorised") {
        return reply.code(401).send({ success: false, error: "Unauthorised" });
      } else
        return reply
          .code(500)
          .send({ success: false, error: "Internal Server Error" });
    }
  });
}
