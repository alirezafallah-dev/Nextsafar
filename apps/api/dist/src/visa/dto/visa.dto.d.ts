import { z } from 'zod';
export declare const createVisaCaseSchema: z.ZodObject<{
    countryId: z.ZodOptional<z.ZodString>;
    visaTypeId: z.ZodOptional<z.ZodString>;
    applicantName: z.ZodString;
    applicantPassport: z.ZodOptional<z.ZodString>;
    travelDate: z.ZodOptional<z.ZodString>;
    visaType: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        OTHER: "OTHER";
        TOURIST: "TOURIST";
        BUSINESS: "BUSINESS";
        STUDENT: "STUDENT";
        WORK: "WORK";
    }>>>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateVisaCaseDto = z.infer<typeof createVisaCaseSchema>;
export declare const updateVisaCaseStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        CANCELLED: "CANCELLED";
        INITIAL: "INITIAL";
        DOCUMENTS_INCOMPLETE: "DOCUMENTS_INCOMPLETE";
        DOCUMENTS_COMPLETE: "DOCUMENTS_COMPLETE";
        UNDER_REVIEW: "UNDER_REVIEW";
        APPOINTMENT_NEEDED: "APPOINTMENT_NEEDED";
        APPOINTMENT_DONE: "APPOINTMENT_DONE";
        SUBMITTED: "SUBMITTED";
        IN_PROCESS: "IN_PROCESS";
        BIOMETRICS_DONE: "BIOMETRICS_DONE";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
        NEEDS_CORRECTION: "NEEDS_CORRECTION";
        COMPLETED: "COMPLETED";
    }>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateVisaCaseStatusDto = z.infer<typeof updateVisaCaseStatusSchema>;
export declare const createAppointmentSchema: z.ZodObject<{
    appointmentDate: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    referenceNumber: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>;
