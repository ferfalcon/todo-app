import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';

const jwtAuthPlugin: FastifyPluginAsync = async (fastify) => {
  const secret = process.env.JWT_SECRET ?? 'dev-secret-change-me';

  await fastify.register(jwt, {
    secret,
  });

  fastify.decorate(
    'authenticate',
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' });
      }
    },
  );
};

export default fp(jwtAuthPlugin);
