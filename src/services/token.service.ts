import { FastifyInstance } from 'fastify';
import { prisma } from "../prisma";

export async function refreshToken(fastify: FastifyInstance, body: any) {
  const { refresh_token: token } = body;
  const payload = fastify.jwt.verify(token) as any;
  if (payload.type !== 'refresh') throw new Error("Unauthorised");

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new Error("Unauthorised");

  const access = fastify.jwt.sign(
    { sub: user.id, user_id: user.id, email: user.email },
    { expiresIn: '1h' }
  );

  return { access_token: access, expires_in: 3600 };
}