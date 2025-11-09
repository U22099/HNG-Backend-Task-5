import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import env from '@fastify/env';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';

const app = Fastify({ logger: true });

async function main() {
  const envSchema = {
    type: 'object',
    required: ['DATABASE_URL', 'JWT_SECRET', 'SERVICE_JWT_SECRET'],
    properties: {
      DATABASE_URL: { type: 'string' },
      JWT_SECRET: { type: 'string' },
      SERVICE_JWT_SECRET: { type: 'string' }
    }
  };

  await app.register(env, {
    schema: envSchema,
    dotenv: true,
    confKey: 'config'
  });

  await app.register(jwt, { secret: app.config.JWT_SECRET });

  await app.register(cors);

  authRoutes(app);
  userRoutes(app);

  app.get('/health', () => ({ status: 'ok' }));
  await app.listen({ port: 3001, host: '0.0.0.0' });
  console.log('User Service running on http://localhost:3001');
}

main().catch(err => {
  app.log.error(err);
  process.exit(1);
});