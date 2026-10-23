"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderSchema = exports.passengerSchema = exports.orderItemSchema = void 0;
const zod_1 = require("zod");
exports.orderItemSchema = zod_1.z.object({
    itemType: zod_1.z.enum(['TOUR', 'HOTEL', 'VISA', 'SERVICE']),
    itemId: zod_1.z.string().uuid(),
    itemName: zod_1.z.string(),
    quantity: zod_1.z.number().int().positive(),
    unitPrice: zod_1.z.number().positive(),
});
exports.passengerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    nationalId: zod_1.z.string().optional(),
    passportNumber: zod_1.z.string().optional(),
    birthDate: zod_1.z.string().optional(),
    gender: zod_1.z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    relationship: zod_1.z.enum(['SELF', 'SPOUSE', 'CHILD', 'PARENT', 'OTHER']).default('SELF'),
});
exports.createOrderSchema = zod_1.z.object({
    items: zod_1.z.array(exports.orderItemSchema).min(1),
    passengers: zod_1.z.array(exports.passengerSchema).min(1),
    discountCode: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    idempotencyKey: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=create-order.dto.js.map