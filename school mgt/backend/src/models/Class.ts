import { Document, Model, Schema, Types, model } from 'mongoose';

/**
 * A class (e.g. "JSS 1A") owned by a school, together with the subjects that
 * make up its curriculum. This collection is the single source of truth the
 * teacher portal syncs from — subjects are never hard-coded on the client.
 */
export interface IClass {
  schoolId: Types.ObjectId;
  className: string;
  subjects: string[];
  /** Optional default teacher (email) assigned to the class. */
  teacherEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClassDocument extends IClass, Document<Types.ObjectId> {}

const classSchema = new Schema<IClassDocument>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    className: { type: String, required: [true, 'Class name is required'], trim: true },
    subjects: {
      type: [String],
      default: [],
      set: (values: string[]) =>
        Array.from(new Set((values ?? []).map((s) => String(s).trim()).filter(Boolean))),
    },
    teacherEmail: { type: String, lowercase: true, trim: true },
  },
  { timestamps: true },
);

// A class name is unique within its school (tenant-scoped uniqueness).
classSchema.index({ schoolId: 1, className: 1 }, { unique: true });

export const ClassModel = model<IClassDocument, Model<IClassDocument>>('Class', classSchema);
