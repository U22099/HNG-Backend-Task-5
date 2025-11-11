import { FastifyInstance } from "fastify";
import { register, login, logout } from "../services/auth.service";
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
          .send({ success: false, error: error.message });
      } else if (error.message === "Registration failed") {
        return reply
          .code(400)
          .send({ success: false, error: error.message });
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
          .send({ success: false, error: error.message });
      } else if (error.message === "Invalid credentials") {
        return reply
          .code(400)
          .send({ success: false, error: error.message });
      } else if (error.message === "Login failed") {
        return reply.code(400).send({ success: false, error: error.message });
      } else
        return reply
          .code(500)
          .send({ success: false, error: "Internal Server Error" });
    }
  });

  app.post("/v1/auth/refresh", async (req, reply) => {
    try {
      const data = await refreshToken(app, req.body);
      reply.send({ success: true, message: "Token refreshed successfully", data });
    } catch (error: any) {
      console.error("Error in POST /v1/auth/refresh:", error);
      if (error.message === "Unauthorised") {
        return reply.code(401).send({ success: false, error: error.message });
      } else if (error.message === "Missing refresh token") {
        return reply.code(400).send({ success: false, error: error.message });
      } else
        return reply
          .code(500)
          .send({ success: false, error: "Internal Server Error" });
    }
  });

  app.post("/v1/auth/logout", async (req, reply) => {
    try {
      const data = await logout(app, req.headers);
      reply.send(data);
    } catch (error: any) {
      console.error("Error in POST /v1/auth/logout:", error);
      if (error.message === "Missing or invalid Authorization header") {
        return reply
          .code(400)
          .send({ success: false, error: error.message });
      } else if (error.message === "Invalid token payload on request.user") {
        return reply
          .code(400)
          .send({ success: false, error: error.message });
      } else if (error.message === "User not found for provided token") {
        return reply
          .code(400)
          .send({ success: false, error: error.message });
      } else if (error.message === "Logout failed") {
        return reply.code(400).send({ success: false, error: error.message });
      } else
        return reply
          .code(500)
          .send({ success: false, error: "Internal Server Error" });
    }
  });
}
