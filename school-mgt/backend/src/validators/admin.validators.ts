import { z } from 'zod';
import { emailSchema, objectIdSchema, passwordSchema, signatureSchema } from './common';
import { paginationSchema } from '../utils/pagination';

export const createClassSchema = z.object({
  className: z.string().min(1, 'Class name is required.').trim(),
  subjects: z.array(z.string().trim().min(1)).min(1, 'At least one subject is required.'),
  teacherEmail: emailSchema.optional(),
  feeExpected: z.number().nonnegative().optional(),
});

export const enrollStudentSchema = z.object({
  fullName: z.string().min(2, 'Student full name is required.').trim(),
  gender: z.enum(['Male', 'Female']),
  dob: z.coerce.date(),
  currentClass: z.string().min(1, 'Current class is required.').trim(),
  classId: objectIdSchema.optional(),
  password: passwordSchema,
  guardian: z.string().trim().optional(),
  contact: z.string().trim().optional(),
  email: emailSchema.optional(),
  address: z.string().trim().optional(),
  feeExpected: z.number().nonnegative().optional(),
  feeDue: z.number().nonnegative().optional(),
}).refine((value) => (value.feeDue ?? 0) <= (value.feeExpected ?? value.feeDue ?? 0), {
  message: 'Amount due cannot exceed the expected fee.',
  path: ['feeDue'],
});

export const updateStudentSchema = z.object({
  fullName: z.string().min(2).trim().optional(),
  gender: z.enum(['Male', 'Female']).optional(),
  dob: z.coerce.date().optional(),
  currentClass: z.string().min(1).trim().optional(),
  guardian: z.string().trim().optional(),
  contact: z.string().trim().optional(),
  email: emailSchema.optional(),
  address: z.string().trim().optional(),
  feeExpected: z.number().nonnegative().optional(),
  feeDue: z.number().nonnegative().optional(),
  password: passwordSchema.optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'Provide at least one field to update.',
}).refine((value) => value.feeDue === undefined || value.feeExpected === undefined || value.feeDue <= value.feeExpected, {
  message: 'Amount due cannot exceed the expected fee.',
  path: ['feeDue'],
});

export const recordFeePaymentSchema = z.object({
  amount: z.number().positive(),
});

export const debtorControlSchema = z.object({
  restrictDebtors: z.boolean(),
});

export const reviewAssessmentSchema = z.object({
  assessmentId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
  subject: z.string().trim().min(1).optional(),
  term: z.string().trim().min(1).optional(),
  session: z.string().trim().min(1).optional(),
  action: z.enum(['approve', 'reject']),
  note: z.string().trim().max(500).optional(),
}).refine(
  (v) => v.assessmentId || (v.classId && v.subject && v.term && v.session),
  { message: 'Provide assessmentId or classId+subject+term+session.' },
);

export const adminBankTransferSchema = z.object({
  reference: z.string().trim().min(3, 'A payment reference is required.'),
  amount: z.number().nonnegative(),
  receipt: z.object({
    fileName: z.string().trim().min(1).max(255),
    contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
    contentBase64: z.string().min(1).max(900_000).regex(/^[A-Za-z0-9+/]+={0,2}$/),
  }).optional(),
});

export const listStudentsQuerySchema = paginationSchema.extend({
  currentClass: z.string().trim().optional(),
});

export const listAssessmentsQuerySchema = paginationSchema.extend({
  status: z.enum(['Pending Approval', 'Approved', 'Revised', 'all']).optional(),
});

export const idParamsSchema = z.object({
  id: objectIdSchema,
});

export const updateTeacherSchema = z
  .object({
    name: z.string().min(2).trim().optional(),
    subject: z.string().trim().optional(),
    classesTaught: z.number().int().min(1).max(20).optional(),
    status: z.enum(['Active', 'On Leave']).optional(),
  })
  .refine((v) => v.name !== undefined || v.subject !== undefined || v.classesTaught !== undefined || v.status !== undefined, {
    message: 'Provide at least one field to update.',
  });

/**
 * Changes a verified teacher's sign-in password. Requires the current password
 * so an admin cannot silently overwrite it without knowing it.
 */
export const changeTeacherPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: passwordSchema,
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: 'New password must be different from the current password.',
    path: ['newPassword'],
  });

/**
 * Updates an existing class's name, subjects and/or form teacher. At least one
 * field must be provided.
 */
export const updateClassSchema = z
  .object({
    className: z.string().min(1).trim().optional(),
    subjects: z.array(z.string().trim().min(1)).min(1).optional(),
    teacherEmail: emailSchema.optional(),
    feeExpected: z.number().nonnegative().optional(),
  })
  .refine(
    (v) => v.className !== undefined || v.subjects !== undefined || v.teacherEmail !== undefined || v.feeExpected !== undefined,
    { message: 'Provide at least one field to update.' },
  );

export const academicSettingSchema = z.object({
  currentSession: z.string().trim().min(1).optional(),
  currentTerm: z.string().trim().min(1).optional(),
  termsPerSession: z.number().int().min(1).max(4).optional(),
});

/**
 * PATCH /api/admin/school — updates the tenant's school profile. All fields are
 * optional; a password change requires the current password.
 */
export const updateSchoolSettingsSchema = z
  .object({
    principalName: z.string().trim().min(2).optional(),
    currentPassword: z.string().optional(),
    newPassword: passwordSchema.optional(),
    principalSignature: signatureSchema.optional(),
  })
  .refine(
    (v) =>
      v.principalName !== undefined ||
      v.currentPassword !== undefined ||
      v.newPassword !== undefined ||
      v.principalSignature !== undefined,
    { message: 'Provide at least one field to update.' },
  )
  .refine((v) => !v.newPassword || v.currentPassword, {
    message: 'Current password is required to change the password.',
    path: ['currentPassword'],
  });

export type UpdateSchoolSettingsBody = z.infer<typeof updateSchoolSettingsSchema>;

export type CreateClassBody = z.infer<typeof createClassSchema>;
export type EnrollStudentBody = z.infer<typeof enrollStudentSchema>;
export type UpdateStudentBody = z.infer<typeof updateStudentSchema>;
export type RecordFeePaymentBody = z.infer<typeof recordFeePaymentSchema>;
export type DebtorControlBody = z.infer<typeof debtorControlSchema>;
export type ReviewAssessmentBody = z.infer<typeof reviewAssessmentSchema>;
export type AdminBankTransferBody = z.infer<typeof adminBankTransferSchema>;
export type UpdateClassBody = z.infer<typeof updateClassSchema>;
export type UpdateTeacherBody = z.infer<typeof updateTeacherSchema>;
export type AcademicSettingBody = z.infer<typeof academicSettingSchema>;
export type ChangeTeacherPasswordBody = z.infer<typeof changeTeacherPasswordSchema>;
