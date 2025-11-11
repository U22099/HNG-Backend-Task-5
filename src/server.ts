import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import env from "@fastify/env";
import fastifyStatic from "@fastify/static";
import path from "path";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";

export const buildServer = async () => {
  const app = Fastify();

  const envSchema = {
    type: "object",
    required: ["DATABASE_URL", "JWT_SECRET", "SERVICE_JWT_SECRET"],
    properties: {
      DATABASE_URL: { type: "string" },
      JWT_SECRET: { type: "string" },
      SERVICE_JWT_SECRET: { type: "string" },
    },
  };

  await app.register(env, {
    schema: envSchema,
    dotenv: true,
    confKey: "config",
  });

  await app.register(jwt, { secret: app.config.JWT_SECRET });

  await app.register(cors);

  await app.register(fastifyStatic, {
    root: path.join(process.cwd(), "public"),
    prefix: "/",
  });

  await app.register(
    async function (fastify) {
      authRoutes(fastify);
      userRoutes(fastify);
      app.get("/health", () => ({ status: "ok" }));
    },
    { prefix: "/api" }
  );

  return app;
};


async function main() {
  const app = await buildServer();

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
  const host = "0.0.0.0";

  await app.listen({ port, host });
  console.log(`User Service running on ${host}:${port}`);
}

main();