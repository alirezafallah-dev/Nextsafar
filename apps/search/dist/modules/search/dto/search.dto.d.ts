import { z } from 'zod';
export declare const searchRequestSchema: z.ZodObject<{
    type: z.ZodEnum<{
        tour: "tour";
        hotel: "hotel";
    }>;
    query: z.ZodObject<{
        destination: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
        minPrice: z.ZodOptional<z.ZodNumber>;
        maxPrice: z.ZodOptional<z.ZodNumber>;
        startDateFrom: z.ZodOptional<z.ZodString>;
        startDateTo: z.ZodOptional<z.ZodString>;
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type SearchRequestDto = z.infer<typeof searchRequestSchema>;
export interface SearchResponse {
    search_id: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    total_results: number;
    results: any[];
    filters: any;
    sort_options: string[];
    pagination: {
        page: number;
        total_pages: number;
    };
    response_time_ms: number;
    providers_used: string[];
    error?: string;
}
export interface SearchSession {
    id: string;
    type: 'tour' | 'hotel';
    query: any;
    status: 'pending' | 'processing' | 'completed' | 'error';
    results: any[];
    createdAt: number;
    expiresAt: number;
}
//# sourceMappingURL=search.dto.d.ts.map