import { z } from 'zod';
export declare const tourLeadSchema: z.ZodObject<{
    customerName: z.ZodString;
    phone: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    passengerCount: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    preferredDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type TourLeadDto = z.infer<typeof tourLeadSchema>;
