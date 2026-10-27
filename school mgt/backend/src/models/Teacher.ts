import { Document, Model, Schema, Types, model } from 'mongoose';

/**
 * A teacher belongs to exactly one school. Teachers are onboarded via OTP
 * invitation, so `password` and OTP fields are optional / hidden by default.
 */
export interface ITeacher {
  schoolId: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  subject?: string;
  /** OTP activation state. */
  verified: boolean;
  otpHash?: string;
  otpExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeacherDocument extends ITeacher, Document<Types.ObjectId> {}

const teacherSchema = new Schema<ITeacherDocument>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    subject: { type: String, trim: true },
    verified: { type: Boolean, default: false },
    otpHash: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as Record<string, unknown>;
        delete r.password;
        delete r.otpHash;
        delete r.otpExpiresAt;
        return ret;
      },
    },
  },
);

export const Teacher = model<ITeacherDocument, Model<ITeacherDocument>>('Teacher', teacherSchema);
