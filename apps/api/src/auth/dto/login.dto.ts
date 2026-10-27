import { z } from 'zod';

export const loginSchema = z.object({
  mobile: z.string().regex(/^09[0-9]{9}$/, 'Invalid mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginDto = z.infer<typeof loginSchema>;
