import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    mobile: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginDto = z.infer<typeof loginSchema>;
