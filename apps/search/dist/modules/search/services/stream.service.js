"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamService = exports.StreamService = void 0;
const search_service_1 = require("./search.service");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)({ name: 'StreamService' });
class StreamService {
    /**
     * Stream search results via Server-Sent Events
     */
    async *streamResults(searchId) {
        const maxWait = 30000; // 30 seconds max wait
        const pollInterval = 500; // 500ms between checks
        const startTime = Date.now();
        logger.info({ searchId }, '📡 Starting SSE stream');
        while (Date.now() - startTime < maxWait) {
            const session = await search_service_1.searchService.getSearchStatus(searchId);
            if (!session) {
                yield `data: ${JSON.stringify({ error: 'Session expired' })}\n\n`;
                return;
            }
            if (session.status === 'completed') {
                // Send final results
                const results = await search_service_1.searchService.executeSearch(searchId);
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
exports.StreamService = StreamService;
exports.streamService = new StreamService();
//# sourceMappingURL=stream.service.js.map