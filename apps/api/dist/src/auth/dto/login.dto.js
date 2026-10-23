"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    mobile: zod_1.z.string().regex(/^09[0-9]{9}$/, 'Invalid mobile number'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
//# sourceMappingURL=login.dto.js.map