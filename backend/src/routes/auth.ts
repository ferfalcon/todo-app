import type { FastifyPluginAsync } from 'fastify';
import { usersRepository } from '../persistence/usersRepository';
import { hashPassword, verifyPassword } from '../auth/passwords';
import {
  signupRouteOptions,
  loginRouteOptions,
  meRouteOptions,
} from '../schemas/authSchemas';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /auth/signup
  fastify.post('/auth/signup', signupRouteOptions, async (request, reply) => {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };

      const existing = await usersRepository.findByEmail(email);
      if (existing) {
        reply.code(409);
        return { error: 'Email is already in use' };
      }

      const passwordHash = await hashPassword(password);
      const user = await usersRepository.createUser(email, passwordHash);

      const token = fastify.jwt.sign({
        userId: user.id,
        email: user.email,
      });

      reply.code(201);
      return {
        user: { id: user.id, email: user.email },
        token,
      };
    },
  );

  // POST /auth/login
  fastify.post('/auth/login', loginRouteOptions, async (request, reply) => {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };

      const user = await usersRepository.findByEmail(email);
      if (!user) {
        reply.code(401);
        return { error: 'Invalid email or password' };
      }

      const ok = await verifyPassword(password, user.passwordHash);
      if (!ok) {
        reply.code(401);
        return { error: 'Invalid email or password' };
      }

      const token = fastify.jwt.sign({
        userId: user.id,
        email: user.email,
      });

      return {
        user: { id: user.id, email: user.email },
        token,
      };
    },
  );

  // GET /me (authenticated)
  fastify.get('/me', { ...meRouteOptions, preHandler: fastify.authenticate as any }, async (request, reply) => {
      // request.user is populated by jwtVerify()
      const user = request.user as { userId: string; email: string };

      return {
        id: user.userId,
        email: user.email,
      };
    },
  );
};

export default authRoutes;
