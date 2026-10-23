"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchService = exports.SearchService = void 0;
const uuid_1 = require("uuid");
const redis_service_1 = require("../../cache/redis.service");
const environment_1 = require("../../../config/environment");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)({ name: 'SearchService' });
class SearchService {
    /**
     * Create a new search session and return search_id
     */
    async createSearchSession(dto) {
        const searchId = (0, uuid_1.v4)();
        const session = {
            id: searchId,
            type: dto.type,
            query: dto.query,
            status: 'pending',
            results: [],
            createdAt: Date.now(),
            expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        };
        const cacheKey = `search:session:${searchId}`;
        await redis_service_1.redisService.set(cacheKey, session, 600); // 10 minutes TTL
        logger.info({ searchId, type: dto.type }, '🔍 Created search session');
        return searchId;
    }
    /**
     * Execute search and return results
     */
    async executeSearch(searchId) {
        const startTime = Date.now();
        const cacheKey = `search:session:${searchId}`;
        const session = await redis_service_1.redisService.get(cacheKey);
        if (!session) {
            throw new Error('Search session not found or expired');
        }
        // Update status to processing
        session.status = 'processing';
        await redis_service_1.redisService.set(cacheKey, session, 600);
        try {
            // Check cache first
            const cacheKeyResults = `search:results:${session.type}:${this.generateQueryHash(session.query)}`;
            const cachedResults = await redis_service_1.redisService.get(cacheKeyResults);
            let results;
            let totalResults;
            if (cachedResults) {
                logger.info({ searchId }, '✅ Cache hit');
                results = cachedResults.results;
                totalResults = cachedResults.total;
            }
            else {
                logger.info({ searchId }, '🔄 Cache miss, executing search');
                // Execute actual search based on type
                if (session.type === 'tour') {
                    const searchResult = await this.searchTours(session.query);
                    results = searchResult.results;
                    totalResults = searchResult.total;
                }
                else {
                    const searchResult = await this.searchHotels(session.query);
                    results = searchResult.results;
                    totalResults = searchResult.total;
                }
                // Cache results
                const ttl = session.type === 'tour' ? environment_1.config.cache.tourTTL : environment_1.config.cache.hotelTTL;
                await redis_service_1.redisService.set(cacheKeyResults, { results, total: totalResults }, ttl);
            }
            // Update session with results
            session.status = 'completed';
            session.results = results;
            await redis_service_1.redisService.set(cacheKey, session, 600);
            const responseTime = Date.now() - startTime;
            return {
                search_id: searchId,
                status: 'completed',
                total_results: totalResults,
                results,
                filters: this.generateFilters(session.type),
                sort_options: ['price_asc', 'price_desc', 'rating_desc', 'date_asc'],
                pagination: {
                    page: session.query.page || 1,
                    total_pages: Math.ceil(totalResults / (session.query.limit || 20)),
                },
                response_time_ms: responseTime,
                providers_used: ['internal'],
            };
        }
        catch (error) {
            logger.error({ searchId, error }, '❌ Search execution failed');
            session.status = 'error';
            await redis_service_1.redisService.set(cacheKey, session, 600);
            return {
                search_id: searchId,
                status: 'error',
                total_results: 0,
                results: [],
                filters: {},
                sort_options: [],
                pagination: { page: 1, total_pages: 0 },
                response_time_ms: Date.now() - startTime,
                providers_used: [],
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Get search session status
     */
    async getSearchStatus(searchId) {
        const cacheKey = `search:session:${searchId}`;
        return await redis_service_1.redisService.get(cacheKey);
    }
    /**
     * Search tours (internal database via Core API)
     */
    async searchTours(query) {
        // In production, this would call Node.js Core API
        // For now, we'll simulate with mock data
        // TODO: Replace with actual API call to Core
        // const response = await fetch(`${config.coreApi.baseUrl}/api/v1/internal/tours/search`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'X-Internal-Secret': config.coreApi.secret,
        //   },
        //   body: JSON.stringify(query),
        // });
        // const data = await response.json();
        // return { results: data.data, total: data.meta.total };
        // Mock data for demonstration
        const mockTours = [
            {
                id: '1',
                title: 'Istanbul 7 Days Tour',
                slug: 'istanbul-tour-7-days',
                destination: 'Istanbul',
                price: 15000000,
                rating: 4.8,
                duration: '7 days',
                startDate: '2026-10-30',
            },
            {
                id: '2',
                title: 'Dubai 5 Days Tour',
                slug: 'dubai-tour-5-days',
                destination: 'Dubai',
                price: 25000000,
                rating: 4.9,
                duration: '5 days',
                startDate: '2026-11-05',
            },
        ];
        // Apply filters
        let filtered = mockTours;
        if (query.destination) {
            filtered = filtered.filter(t => t.destination.toLowerCase().includes(query.destination.toLowerCase()));
        }
        if (query.minPrice) {
            filtered = filtered.filter(t => t.price >= query.minPrice);
        }
        if (query.maxPrice) {
            filtered = filtered.filter(t => t.price <= query.maxPrice);
        }
        // Pagination
        const page = query.page || 1;
        const limit = query.limit || 20;
        const start = (page - 1) * limit;
        const paginatedResults = filtered.slice(start, start + limit);
        return {
            results: paginatedResults,
            total: filtered.length,
        };
    }
    /**
     * Search hotels (internal database via Core API)
     */
    async searchHotels(query) {
        // Similar to tours, this would call Core API
        // Mock data for demonstration
        const mockHotels = [
            {
                id: '1',
                name: 'Espinas Palace Hotel',
                slug: 'espinas-palace-tehran',
                city: 'Tehran',
                rating: 4.8,
                pricePerNight: 5000000,
            },
            {
                id: '2',
                name: 'Parsian Azadi Hotel',
                slug: 'parsian-azadi-hotel',
                city: 'Tehran',
                rating: 4.7,
                pricePerNight: 4500000,
            },
        ];
        let filtered = mockHotels;
        if (query.city) {
            filtered = filtered.filter(h => h.city.toLowerCase().includes(query.city.toLowerCase()));
        }
        const page = query.page || 1;
        const limit = query.limit || 20;
        const start = (page - 1) * limit;
        const paginatedResults = filtered.slice(start, start + limit);
        return {
            results: paginatedResults,
            total: filtered.length,
        };
    }
    /**
     * Generate hash for query (used for caching)
     */
    generateQueryHash(query) {
        const sorted = JSON.stringify(query, Object.keys(query).sort());
        return Buffer.from(sorted).toString('base64').substring(0, 16);
    }
    /**
     * Generate filters based on search type
     */
    generateFilters(type) {
        if (type === 'tour') {
            return {
                destinations: ['Istanbul', 'Dubai', 'Paris', 'Rome'],
                priceRanges: [
                    { label: 'Under 10M', min: 0, max: 10000000 },
                    { label: '10M - 20M', min: 10000000, max: 20000000 },
                    { label: 'Over 20M', min: 20000000, max: null },
                ],
                durations: ['3-5 days', '5-7 days', '7-10 days', '10+ days'],
            };
        }
        else {
            return {
                cities: ['Tehran', 'Mashhad', 'Shiraz', 'Isfahan'],
                starRatings: [5, 4, 3, 2, 1],
                amenities: ['Pool', 'Spa', 'Gym', 'Free WiFi', 'Restaurant'],
            };
        }
    }
}
exports.SearchService = SearchService;
exports.searchService = new SearchService();
//# sourceMappingURL=search.service.js.map