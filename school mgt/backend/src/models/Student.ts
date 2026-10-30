import { Document, Model, Schema, Types, model } from 'mongoose';

export type Gender = 'Male' | 'Female';

/** A single subject line inside a historical (archived) result. */
export interface ISubjectScore {
  subject: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
}

/** A termly result archived on the student once a session is published. */
export interface IHistoricalResult {
  session: string;
  term: string;
  cls: string;
  subjects: ISubjectScore[];
  total: number;
  average: number;
  position: number;
  classSize: number;
  attendance: string;
  remark: string;
  classTeacherName: string;
  principalName: string;
  publishedAt: Date;
}

export interface IStudent {
  schoolId: Types.ObjectId;
  /** Auto-generated identifier, e.g. BFA/2026/001. */
  studentId: string;
  fullName: string;
  gender: Gender;
  dob: Date;
  currentClass: string;
  password: string;
  historicalResults: IHistoricalResult[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentDocument extends IStudent, Document<Types.ObjectId> {}

const subjectScoreSchema = new Schema<ISubjectScore>(
  {
    subject: { type: String, required: true, trim: true },
    ca1: { type: Number, default: 0, min: 0, max: 20 },
    ca2: { type: Number, default: 0, min: 0, max: 20 },
    exam: { type: Number, default: 0, min: 0, max: 60 },
    total: { type: Number, default: 0, min: 0, max: 100 },
    grade: { type: String, default: '' },
  },
  { _id: false },
);

const historicalResultSchema = new Schema<IHistoricalResult>(
  {
    session: { type: String, required: true, trim: true },
    term: { type: String, required: true, trim: true },
    cls: { type: String, required: true, trim: true },
    subjects: { type: [subjectScoreSchema], default: [] },
    total: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
    position: { type: Number, default: 0 },
    classSize: { type: Number, default: 0 },
    attendance: { type: String, default: '' },
    remark: { type: String, default: '' },
    classTeacherName: { type: String, default: '' },
    principalName: { type: String, default: '' },
    publishedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const studentSchema = new Schema<IStudentDocument>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    studentId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    fullName: { type: String, required: [true, 'Student name is required'], trim: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    dob: { type: Date, required: true },
    currentClass: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    historicalResults: { type: [historicalResultSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as Record<string, unknown>).password;
        return ret;
      },
    },
  },
);

studentSchema.index({ schoolId: 1, currentClass: 1 });

studentSchema.index({ schoolId: 1, fullName: 1 });

export const Student = model<IStudentDocument, Model<IStudentDocument>>('Student', studentSchema);
