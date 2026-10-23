"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointmentSchema = exports.updateVisaCaseStatusSchema = exports.createVisaCaseSchema = void 0;
const zod_1 = require("zod");
exports.createVisaCaseSchema = zod_1.z.object({
    countryId: zod_1.z.string().uuid().optional(),
    visaTypeId: zod_1.z.string().uuid().optional(),
    applicantName: zod_1.z.string().min(2),
    applicantPassport: zod_1.z.string().optional(),
    travelDate: zod_1.z.string().optional(),
    visaType: zod_1.z.enum(['TOURIST', 'BUSINESS', 'STUDENT', 'WORK', 'OTHER']).default('TOURIST').optional(),
    notes: zod_1.z.string().optional(),
});
exports.updateVisaCaseStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'INITIAL',
        'DOCUMENTS_INCOMPLETE',
        'DOCUMENTS_COMPLETE',
        'UNDER_REVIEW',
        'APPOINTMENT_NEEDED',
        'APPOINTMENT_DONE',
        'SUBMITTED',
        'IN_PROCESS',
        'BIOMETRICS_DONE',
        'APPROVED',
        'REJECTED',
        'NEEDS_CORRECTION',
        'COMPLETED',
        'CANCELLED',
    ]),
    notes: zod_1.z.string().optional(),
});
exports.createAppointmentSchema = zod_1.z.object({
    appointmentDate: zod_1.z.string(),
    location: zod_1.z.string().optional(),
    referenceNumber: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
//# sourceMappingURL=visa.dto.js.map