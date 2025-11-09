import { FastifyInstance } from "fastify";
import { getUser, getUserContact } from "../services/user.service";
import { authorize } from "../utils/authorize";

export function userRoutes(app: FastifyInstance) {

  app.get("/v1/users/:user_id", async (req, reply) => {
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
  });

  app.get("/v1/users/:user_id/contact", async (req, reply) => {
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
  });

  
}
