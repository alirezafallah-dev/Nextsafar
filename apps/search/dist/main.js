"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const search_routes_1 = require("./modules/search/routes/search.routes");
const environment_1 = require("./config/environment");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)({ name: 'SearchService', level: 'info' });
async function startServer() {
    const fastify = (0, fastify_1.default)({
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
    await fastify.register(cors_1.default, {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    });
    await fastify.register(swagger_1.default, {
        openapi: {
            info: {
                title: 'Nextsafar Search Service API',
                description: 'Search service with SSE support',
                version: '1.0.0',
            },
            servers: [
                {
                    url: `http://localhost:${environment_1.config.port}`,
                    description: 'Development server',
                },
            ],
        },
    });
    // Register routes
    await fastify.register(search_routes_1.searchRoutes, { prefix: '/api/v1' });
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
        await fastify.listen({ port: environment_1.config.port, host: '0.0.0.0' });
        logger.info(`🚀 Search Service is running on http://localhost:${environment_1.config.port}`);
        logger.info(`📚 API Documentation: http://localhost:${environment_1.config.port}/documentation`);
    }
    catch (err) {
        logger.error(err);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=main.js.map