import { z } from 'zod';

// Search Request Schema
export const searchRequestSchema = z.object({
  type: z.enum(['tour', 'hotel']),
  query: z.object({
    destination: z.string().optional(),
    search: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    startDateFrom: z.string().optional(),
    startDateTo: z.string().optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
  }),
});

export type SearchRequestDto = z.infer<typeof searchRequestSchema>;

// Search Response Structure
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

// Search Session (stored in Redis)
export interface SearchSession {
  id: string;
  type: 'tour' | 'hotel';
  query: any;
  status: 'pending' | 'processing' | 'completed' | 'error';
  results: any[];
  createdAt: number;
  expiresAt: number;
}
