import type { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import fp from 'fastify-plugin';

const corsPlugin: FastifyPluginAsync = async (fastify) => {
  const DEFAULT_ORIGIN = 'http://localhost:5173';

  const originEnv = process.env.FRONTEND_ORIGIN;

  const origins = originEnv
    ? originEnv.split(',').map((origin) => origin.trim())
    : [DEFAULT_ORIGIN];

  await fastify.register(cors, {
    origin: origins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
};

export default fp(corsPlugin);
