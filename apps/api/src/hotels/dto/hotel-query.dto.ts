import { z } from 'zod';

export const hotelQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  city: z.string().optional(),
  search: z.string().optional(),
});

export type HotelQueryDto = z.infer<typeof hotelQuerySchema>;
