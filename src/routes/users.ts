import { FastifyInstance } from 'fastify';
import { getContact } from '../services/user.service';

export function userRoutes(app: FastifyInstance) {
  app.get('/v1/users/:user_id/contact', async (req, reply) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return reply.code(401).send({ success: false, error: 'No token' });

    const { user_id } = req.params as any;

    try {
      const payload: any = app.jwt.verify(token);
      if (payload.sub !== user_id) return reply.code(403).send({ success: false, error: 'Forbidden' });
    } catch {
      return reply.code(401).send({ success: false, error: 'Invalid token' });
    }
    
    const data = await getContact(user_id);
    reply.send({ success: true, message: 'Contact retrieved', data });
  });
}