"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tourQuerySchema = void 0;
const zod_1 = require("zod");
exports.tourQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
    destination: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().positive().optional(),
    maxPrice: zod_1.z.coerce.number().positive().optional(),
    startDateFrom: zod_1.z.coerce.date().optional(),
    startDateTo: zod_1.z.coerce.date().optional(),
});
//# sourceMappingURL=tour-query.dto.js.map