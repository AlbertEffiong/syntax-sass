import { Document, Model, Schema, Types, model } from 'mongoose';

export type AssessmentStatus = 'Pending Approval' | 'Approved' | 'Revised';

/**
 * A single student's score line for a (class, subject, term) broadsheet. The
 * teacher saves/submits these; the school admin approves them before they are
 * published on the student/parent result portal.
 */
export interface IAssessment {
  schoolId: Types.ObjectId;
  classId: Types.ObjectId;
  className: string;
  subject: string;
  teacherId: Types.ObjectId;
  teacherEmail: string;
  /** References the Student document (tenant-owned). */
  studentRef: Types.ObjectId;
  /** Human-readable student id, e.g. BFA/2026/001. */
  studentId: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  status: AssessmentStatus;
  principalName: string;
  term: string;
  session: string;
  submittedAt?: Date;
  approvedAt?: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssessmentDocument extends IAssessment, Document<Types.ObjectId> {}

const assessmentSchema = new Schema<IAssessmentDocument>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    className: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    teacherEmail: { type: String, required: true, lowercase: true, trim: true },
    studentRef: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    studentId: { type: String, required: true, uppercase: true, trim: true },
    ca1: { type: Number, default: 0, min: 0, max: 20 },
    ca2: { type: Number, default: 0, min: 0, max: 20 },
    exam: { type: Number, default: 0, min: 0, max: 60 },
    total: { type: Number, default: 0, min: 0, max: 100 },
    grade: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending Approval', 'Approved', 'Revised'],
      default: 'Pending Approval',
    },
    principalName: { type: String, default: '' },
    term: { type: String, required: true, trim: true },
    session: { type: String, required: true, trim: true },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
    note: { type: String, default: '' },
  },
  { timestamps: true },
);

// One score line per student / subject / class / term within a school.
assessmentSchema.index(
  { schoolId: 1, classId: 1, subject: 1, studentRef: 1, term: 1, session: 1 },
  { unique: true },
);

export const Assessment = model<IAssessmentDocument, Model<IAssessmentDocument>>(
  'Assessment',
  assessmentSchema,
);
