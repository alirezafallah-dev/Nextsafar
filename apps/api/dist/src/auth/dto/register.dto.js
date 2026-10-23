"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, 'First name is too short'),
    lastName: zod_1.z.string().min(2, 'Last name is too short'),
    mobile: zod_1.z.string().regex(/^09[0-9]{9}$/, 'Invalid mobile number'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
//# sourceMappingURL=register.dto.js.map