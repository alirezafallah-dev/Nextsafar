import { z } from 'zod';

export const createVisaCaseSchema = z.object({
  countryId: z.string().uuid().optional(),
  visaTypeId: z.string().uuid().optional(), // NEW: link to VisaType (synced from WordPress)
  applicantName: z.string().min(2),
  applicantPassport: z.string().optional(),
  travelDate: z.string().optional(),
  visaType: z.enum(['TOURIST', 'BUSINESS', 'STUDENT', 'WORK', 'OTHER']).default('TOURIST').optional(),
  notes: z.string().optional(),
});

export type CreateVisaCaseDto = z.infer<typeof createVisaCaseSchema>;

export const updateVisaCaseStatusSchema = z.object({
  status: z.enum([
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
  notes: z.string().optional(),
});

export type UpdateVisaCaseStatusDto = z.infer<typeof updateVisaCaseStatusSchema>;

export const createAppointmentSchema = z.object({
  appointmentDate: z.string(),
  location: z.string().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>;
