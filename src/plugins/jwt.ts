import { FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';

export async function jwtPlugin(fastify: FastifyInstance) {
  fastify.register(jwt, {
    secret: fastify.config.JWT_SECRET,
    sign: { expiresIn: '1h' },
    verify: { complete: true }
  });

  fastify.decorate('signServiceToken', () => {
    return fastify.jwt.sign(
      {
        sub: 'service_notification_gateway',
        service_name: 'notification-gateway',
        role: 'service',
        permissions: ['read:user_contact']
      },
      { key: fastify.config.SERVICE_JWT_SECRET, expiresIn: '90d' }
    );
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      JWT_SECRET: string;
      SERVICE_JWT_SECRET: string;
    };
    signServiceToken: () => string;
  }
}