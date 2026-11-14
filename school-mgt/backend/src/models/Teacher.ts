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
  classesTaught: number;
  status: 'Active' | 'On Leave';
  /** OTP activation state. */
  verified: boolean;
  otpHash?: string;
  otpExpiresAt?: Date;
  /** Teacher's signature. When S3 is configured this is a public URL; otherwise a base64 data URL. */
  signature?: {
    fileName: string;
    contentType: string;
    url?: string;
    contentBase64?: string;
  };
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
    classesTaught: { type: Number, min: 1, max: 20, default: 1 },
    status: { type: String, enum: ['Active', 'On Leave'], default: 'Active' },
    verified: { type: Boolean, default: false },
    otpHash: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    /** Teacher's signature. When S3 is configured this is a public URL; otherwise a base64 data URL. */
    signature: {
      fileName: { type: String, trim: true },
      contentType: { type: String, trim: true },
      /** Public URL when the file was uploaded to object storage. */
      url: { type: String, trim: true },
      /** Base64 payload when no object storage is configured. */
      contentBase64: { type: String },
    },
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

teacherSchema.index({ schoolId: 1, name: 1 });

export const Teacher = model<ITeacherDocument, Model<ITeacherDocument>>('Teacher', teacherSchema);
