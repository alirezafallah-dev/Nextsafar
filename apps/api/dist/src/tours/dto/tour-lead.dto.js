"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tourLeadSchema = void 0;
const zod_1 = require("zod");
exports.tourLeadSchema = zod_1.z.object({
    customerName: zod_1.z.string().min(2),
    phone: zod_1.z.string().regex(/^09[0-9]{9}$/, 'Invalid phone number'),
    email: zod_1.z.string().email().optional(),
    passengerCount: zod_1.z.coerce.number().int().positive().default(1),
    preferredDate: zod_1.z.coerce.date().optional(),
    message: zod_1.z.string().optional(),
});
//# sourceMappingURL=tour-lead.dto.js.map