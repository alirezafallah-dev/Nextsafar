import { SearchRequestDto, SearchResponse, SearchSession } from '../dto/search.dto';
export declare class SearchService {
    /**
     * Create a new search session and return search_id
     */
    createSearchSession(dto: SearchRequestDto): Promise<string>;
    /**
     * Execute search and return results
     */
    executeSearch(searchId: string): Promise<SearchResponse>;
    /**
     * Get search session status
     */
    getSearchStatus(searchId: string): Promise<SearchSession | null>;
    /**
     * Search tours (internal database via Core API)
     */
    private searchTours;
    /**
     * Search hotels (internal database via Core API)
     */
    private searchHotels;
    /**
     * Generate hash for query (used for caching)
     */
    private generateQueryHash;
    /**
     * Generate filters based on search type
     */
    private generateFilters;
}
export declare const searchService: SearchService;
//# sourceMappingURL=search.service.d.ts.map