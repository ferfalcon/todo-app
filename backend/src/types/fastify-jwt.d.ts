import '@fastify/jwt';
import 'fastify';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string; email: string };
    user: { userId: string; email: string };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: import('fastify').HookHandlerDoneFunction | ((
      request: import('fastify').FastifyRequest,
      reply: import('fastify').FastifyReply,
    ) => Promise<void>);
  }
}
