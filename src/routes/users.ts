import { FastifyInstance } from "fastify";
import {
  getUser,
  getUserContact,
  updateUser,
  updateUserContact,
  updateUserPushToken,
} from "../services/user.service";
import { authorize } from "../utils/authorize";

export function userRoutes(app: FastifyInstance) {
  app.get("/v1/users/:user_id", async (req, reply) => {
    try {
      const token = await authorize(req.headers);

      const { user_id } = req.params as any;

      try {
        const payload: any = app.jwt.verify(token);
        if (payload.sub !== user_id)
          return reply.code(403).send({ success: false, error: "Forbidden" });
      } catch {
        return reply.code(401).send({ success: false, error: "Invalid token" });
      }

      const data = await getUser(user_id);
      reply.send({ success: true, data });
    } catch (error: any) {
      console.error("Error in GET /v1/users/:user_id:", error);
      if (error.message === "User not found") {
        return reply
          .code(404)
          .send({ success: false, error: error.message });
      } else if (error.message === "Unauthorised") {
        return reply.code(401).send({ success: false, error: error.message });
      } else
        return reply
          .code(500)
          .send({ success: false, error: "Internal Server Error" });
    }
  });

  app.get("/v1/users/:user_id/contact", async (req, reply) => {
    try {
      const token = await authorize(req.headers);

      const { user_id } = req.params as any;

      try {
        const payload: any = app.jwt.verify(token);
        if (payload.sub !== user_id)
          return reply.code(403).send({ success: false, error: "Forbidden" });
      } catch {
        return reply.code(401).send({ success: false, error: "Invalid token" });
      }

      const data = await getUserContact(user_id);
      reply.send({ success: true, data });
    } catch (error: any) {
      console.error("Error in GET /v1/users/:user_id/contact:", error);
      if (error.message === "User not found") {
        return reply
          .code(404)
          .send({ success: false, error: error.message });
      } else if (error.message === "Unauthorised") {
        return reply.code(401).send({ success: false, error: error.message });
      } else
        return reply
          .code(500)
          .send({ success: false, error: "Internal Server Error" });
    }
  });

  app.put("/v1/users/:user_id", async (req, reply) => {
    try {
      const token = await authorize(req.headers);

      const { user_id } = req.params as any;

      try {
        const payload: any = app.jwt.verify(token);
        if (payload.sub !== user_id)
          return reply.code(403).send({ success: false, error: "Forbidden" });
      } catch {
        return reply.code(401).send({ success: false, error: "Invalid token" });
      }

      const data = await updateUser(user_id, req.body);
      reply.send({
        success: true,
        message: "Profile updated successfully",
        data,
      });
    } catch (error: any) {
      console.error("Error in PUT /v1/users/:user_id:", error);
      if (error.message === "User not found") {
        return reply
          .code(404)
          .send({ success: false, error: error.message });
      } else if (error.message === "Unauthorised") {
        return reply.code(401).send({ success: false, error: error.message });
      } else if (error.message === "No data provided for update") {
        return reply
          .code(400)
          .send({ success: false, error: error.message });
      } else
        return reply
          .code(500)
          .send({ success: false, error: "Internal Server Error" });
    }
  });

  app.put("/v1/users/:user_id/contact", async (req, reply) => {
    try {
      const token = await authorize(req.headers);

      const { user_id } = req.params as any;

      try {
        const payload: any = app.jwt.verify(token);
        if (payload.sub !== user_id)
          return reply.code(403).send({ success: false, error: "Forbidden" });
      } catch {
        return reply.code(401).send({ success: false, error: "Invalid token" });
      }

      const data = await updateUserContact(user_id, req.body);
      reply.send({
        success: true,
        message: "Preference updated successfully",
        data,
      });
    } catch (error: any) {
      console.error("Error in PUT /v1/users/:user_id/contact:", error);
      if (error.message === "User not found") {
        return reply
          .code(404)
          .send({ success: false, error: error.message });
      } else if (error.message === "Unauthorised") {
        return reply.code(401).send({ success: false, error: error.message });
      } else if (error.message === "No data provided for update") {
        return reply
          .code(400)
          .send({ success: false, error: error.message });
      } else
        return reply
          .code(500)
          .send({ success: false, error: "Internal Server Error" });
    }
  });

  app.put("/v1/users/:user_id/push_token", async (req, reply) => {
    try {
      const token = await authorize(req.headers);

      const { user_id } = req.params as any;

      try {
        const payload: any = app.jwt.verify(token);
        if (payload.sub !== user_id)
          return reply.code(403).send({ success: false, error: "Forbidden" });
      } catch {
        return reply.code(401).send({ success: false, error: "Invalid token" });
      }

      const data = await updateUserPushToken(user_id, req.body);
      reply.send({
        success: true,
        message: "Push token updated successfully",
        data,
      });
    } catch (error: any) {
      console.error("Error in PUT /v1/users/:user_id/push_token:", error);
      if (error.message === "User not found") {
        return reply
          .code(404)
          .send({ success: false, error: error.message });
      } else if (error.message === "Unauthorised") {
        return reply.code(401).send({ success: false, error: error.message });
      } else if (error.message === "Push token is required") {
        return reply
          .code(400)
          .send({ success: false, error: error.message });
      } else
        return reply
          .code(500)
          .send({ success: false, error: "Internal Server Error" });
    }
  });
}
