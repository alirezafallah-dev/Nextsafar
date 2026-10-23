"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRoutes = searchRoutes;
const search_service_1 = require("../services/search.service");
const stream_service_1 = require("../services/stream.service");
const search_dto_1 = require("../dto/search.dto");
async function searchRoutes(fastify) {
    /**
     * POST /search - Create search session
     */
    fastify.post('/search', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    type: { type: 'string', enum: ['tour', 'hotel'] },
                    query: { type: 'object' },
                },
                required: ['type', 'query'],
            },
        },
    }, async (request, reply) => {
        try {
            const validated = search_dto_1.searchRequestSchema.parse(request.body);
            const searchId = await search_service_1.searchService.createSearchSession(validated);
            return reply.code(201).send({
                success: true,
                data: { search_id: searchId },
                meta: {
                    message: 'Search session created. Use GET /search/:id to retrieve results.',
                },
            });
        }
        catch (error) {
            return reply.code(400).send({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: error instanceof Error ? error.message : 'Invalid request',
                },
            });
        }
    });
    /**
     * GET /search/:id - Get search results
     */
    fastify.get('/search/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const results = await search_service_1.searchService.executeSearch(id);
            return reply.send({
                success: true,
                data: results,
            });
        }
        catch (error) {
            return reply.code(404).send({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: error instanceof Error ? error.message : 'Search not found',
                },
            });
        }
    });
    /**
     * GET /search/:id/stream - Stream search results via SSE
     */
    fastify.get('/search/:id/stream', async (request, reply) => {
        const { id } = request.params;
        // Set SSE headers
        reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
        });
        // Stream results
        for await (const chunk of stream_service_1.streamService.streamResults(id)) {
            reply.raw.write(chunk);
        }
        reply.raw.end();
    });
    /**
     * GET /search/:id/status - Get search status
     */
    fastify.get('/search/:id/status', async (request, reply) => {
        const { id } = request.params;
        const session = await search_service_1.searchService.getSearchStatus(id);
        if (!session) {
            return reply.code(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Search session not found' },
            });
        }
        return reply.send({
            success: true,
            data: {
                search_id: session.id,
                status: session.status,
                results_count: session.results.length,
            },
        });
    });
}
//# sourceMappingURL=search.routes.js.map