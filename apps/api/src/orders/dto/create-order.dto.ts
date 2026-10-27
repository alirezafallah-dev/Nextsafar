import { z } from 'zod';

export const orderItemSchema = z.object({
  itemType: z.enum(['TOUR', 'HOTEL', 'VISA', 'SERVICE']),
  itemId: z.string().uuid(),
  itemName: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

export const passengerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  nationalId: z.string().optional(),
  passportNumber: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  relationship: z.enum(['SELF', 'SPOUSE', 'CHILD', 'PARENT', 'OTHER']).default('SELF'),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  passengers: z.array(passengerSchema).min(1),
  discountCode: z.string().optional(),
  notes: z.string().optional(),
  idempotencyKey: z.string().uuid().optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
