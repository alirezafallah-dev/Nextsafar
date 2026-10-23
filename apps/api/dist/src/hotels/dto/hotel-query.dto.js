"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotelQuerySchema = void 0;
const zod_1 = require("zod");
exports.hotelQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    city: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
});
//# sourceMappingURL=hotel-query.dto.js.map