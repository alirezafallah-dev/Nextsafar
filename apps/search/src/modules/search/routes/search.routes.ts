import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { searchService } from '../services/search.service';
import { streamService } from '../services/stream.service';
import { searchRequestSchema, SearchRequestDto } from '../dto/search.dto';

export async function searchRoutes(fastify: FastifyInstance) {
  /**
   * POST /search - Create search session
   */
  fastify.post<{ Body: SearchRequestDto }>(
    '/search',
    {
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
    },
    async (request, reply) => {
      try {
        const validated = searchRequestSchema.parse(request.body);
        const searchId = await searchService.createSearchSession(validated);

        return reply.code(201).send({
          success: true,
          data: { search_id: searchId },
          meta: {
            message: 'Search session created. Use GET /search/:id to retrieve results.',
          },
        });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error instanceof Error ? error.message : 'Invalid request',
          },
        });
      }
    }
  );

  /**
   * GET /search/:id - Get search results
   */
  fastify.get<{ Params: { id: string } }>(
    '/search/:id',
    async (request, reply) => {
      try {
        const { id } = request.params;
        const results = await searchService.executeSearch(id);

        return reply.send({
          success: true,
          data: results,
        });
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error instanceof Error ? error.message : 'Search not found',
          },
        });
      }
    }
  );

  /**
   * GET /search/:id/stream - Stream search results via SSE
   */
  fastify.get<{ Params: { id: string } }>(
    '/search/:id/stream',
    async (request, reply) => {
      const { id } = request.params;

      // Set SSE headers
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      // Stream results
      for await (const chunk of streamService.streamResults(id)) {
        reply.raw.write(chunk);
      }

      reply.raw.end();
    }
  );

  /**
   * GET /search/:id/status - Get search status
   */
  fastify.get<{ Params: { id: string } }>(
    '/search/:id/status',
    async (request, reply) => {
      const { id } = request.params;
      const session = await searchService.getSearchStatus(id);

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
    }
  );
}
