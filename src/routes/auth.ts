import { FastifyInstance } from 'fastify';
import { register, login } from '../services/auth.service';
import { refreshToken } from '../services/token.service';

export function authRoutes(app: FastifyInstance) {
  app.post('/v1/auth/register', async (req, reply) => {
    const data = await register(req.body);
    reply.code(201).send({ success: true, message: 'User registered successfully', data });
  });

  app.post('/v1/auth/login', async (req, reply) => {
    const data = await login(app, req.body);
    reply.send({ success: true, message: 'Login successful', data });
  });

  app.post('/v1/auth/refresh', async (req, reply) => {
    const data = await refreshToken(app, req.body);
    reply.send({ success: true, message: 'Login successful', data });
  });
}