import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

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
          url: 'http://localhost:3000',
          description: 'Local dev',
        },
      ],
    },
  });

  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
});

export default swaggerPlugin;
