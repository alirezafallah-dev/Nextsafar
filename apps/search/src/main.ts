import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import { searchRoutes } from './modules/search/routes/search.routes';
import { config } from './config/environment';
import pino from 'pino';

const logger = pino({ name: 'SearchService', level: 'info' });

async function startServer() {
  const fastify = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register plugins
  await fastify.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Nextsafar Search Service API',
        description: 'Search service with SSE support',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${config.port}`,
          description: 'Development server',
        },
      ],
    },
  });

  // Register routes
  await fastify.register(searchRoutes, { prefix: '/api/v1' });

  // Health check
  fastify.get('/health', async () => {
    return {
      success: true,
      service: 'search',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // Start server
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    logger.info(`🚀 Search Service is running on http://localhost:${config.port}`);
    logger.info(`📚 API Documentation: http://localhost:${config.port}/documentation`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

startServer();
