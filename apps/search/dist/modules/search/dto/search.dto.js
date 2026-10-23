"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRequestSchema = void 0;
const zod_1 = require("zod");
// Search Request Schema
exports.searchRequestSchema = zod_1.z.object({
    type: zod_1.z.enum(['tour', 'hotel']),
    query: zod_1.z.object({
        destination: zod_1.z.string().optional(),
        search: zod_1.z.string().optional(),
        minPrice: zod_1.z.number().optional(),
        maxPrice: zod_1.z.number().optional(),
        startDateFrom: zod_1.z.string().optional(),
        startDateTo: zod_1.z.string().optional(),
        page: zod_1.z.number().int().positive().default(1),
        limit: zod_1.z.number().int().positive().max(100).default(20),
    }),
});
//# sourceMappingURL=search.dto.js.map