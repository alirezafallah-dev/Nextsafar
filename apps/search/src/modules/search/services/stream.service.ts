import { searchService } from './search.service';
import pino from 'pino';

const logger = pino({ name: 'StreamService' });

export class StreamService {
  /**
   * Stream search results via Server-Sent Events
   */
  async *streamResults(searchId: string): AsyncGenerator<string, void, unknown> {
    const maxWait = 30000; // 30 seconds max wait
    const pollInterval = 500; // 500ms between checks
    const startTime = Date.now();

    logger.info({ searchId }, '📡 Starting SSE stream');

    while (Date.now() - startTime < maxWait) {
      const session = await searchService.getSearchStatus(searchId);

      if (!session) {
        yield `data: ${JSON.stringify({ error: 'Session expired' })}\n\n`;
        return;
      }

      if (session.status === 'completed') {
        // Send final results
        const results = await searchService.executeSearch(searchId);
        yield `data: ${JSON.stringify(results)}\n\n`;
        yield `event: complete\ndata: ${JSON.stringify({ message: 'Search completed' })}\n\n`;
        return;
      }

      if (session.status === 'error') {
        yield `data: ${JSON.stringify({ error: 'Search failed', details: session })}\n\n`;
        return;
      }

      // Send progress update
      yield `event: progress\ndata: ${JSON.stringify({ 
        status: session.status,
        message: 'Searching...'
      })}\n\n`;

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    // Timeout
    yield `data: ${JSON.stringify({ error: 'Search timeout' })}\n\n`;
  }
}

export const streamService = new StreamService();
