import { z } from 'zod';

// Zod schema برای validation در controller
export const hotelQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  city: z.string().optional(),
  country: z.string().optional(),
  search: z.string().optional(),
  stars: z.coerce.number().int().min(1).max(5).optional(),
  minRating: z.coerce.number().min(0).max(10).optional(),
});

// Type export برای استفاده در service
export type HotelQueryDto = z.infer<typeof hotelQuerySchema>;
