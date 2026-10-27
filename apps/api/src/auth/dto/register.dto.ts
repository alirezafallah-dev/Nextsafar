import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is too short'),
  lastName: z.string().min(2, 'Last name is too short'),
  mobile: z.string().regex(/^09[0-9]{9}$/, 'Invalid mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
