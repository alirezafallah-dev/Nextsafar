import { z } from 'zod';

export const tourLeadSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().regex(/^09[0-9]{9}$/, 'Invalid phone number'),
  email: z.string().email().optional(),
  passengerCount: z.coerce.number().int().positive().default(1),
  preferredDate: z.coerce.date().optional(),
  message: z.string().optional(),
});

export type TourLeadDto = z.infer<typeof tourLeadSchema>;
