import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import {
  taskSchema,
  taskListResponseSchema,
  taskCreateBodySchema,
} from '../schemas/taskSchemas';

const swaggerPlugin: FastifyPluginAsync = fp(async (fastify) => {
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

  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
});

export default swaggerPlugin;
