import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import {
  taskSchema,
  taskListResponseSchema,
  taskCreateBodySchema,
  taskUpdateBodySchema,
  taskReorderBodySchema
} from '../schemas/taskSchemas';

import {
  userSchema,
  authSignupBodySchema,
  authLoginBodySchema,
  authUserWithTokenSchema,
} from '../schemas/authSchemas';

const swaggerPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Todo API',
        description: 'OpenAPI docs for the Todo app backend',
        version: '0.1.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      servers: [
        {
          url: 'http://127.0.0.1:3000',
          description: 'Local dev',
        },
      ],
    },
  });

  fastify.addSchema(taskSchema);
  fastify.addSchema(taskListResponseSchema);
  fastify.addSchema(taskCreateBodySchema);
  fastify.addSchema(taskUpdateBodySchema);
  fastify.addSchema(taskReorderBodySchema);

  fastify.addSchema(userSchema);
  fastify.addSchema(authSignupBodySchema);
  fastify.addSchema(authLoginBodySchema);
  fastify.addSchema(authUserWithTokenSchema);

  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
};

export default fp(swaggerPlugin);
