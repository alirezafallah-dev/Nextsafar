import { z } from 'zod';
export declare const tourQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    destination: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    minPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    maxPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    startDateFrom: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    startDateTo: z.ZodOptional<z.ZodCoercedDate<unknown>>;
}, z.core.$strip>;
export type TourQueryDto = z.infer<typeof tourQuerySchema>;
