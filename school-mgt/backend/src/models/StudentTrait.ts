import { Document, Model, Schema, Types, model } from 'mongoose';

export interface ITraitRating {
  trait: string;
  rating: string;
}

export interface IStudentTrait {
  schoolId: Types.ObjectId;
  studentRef: Types.ObjectId;
  /** Human-readable student id, e.g. BFA/2026/001. */
  studentId: string;
  term: string;
  session: string;
  affective: ITraitRating[];
  psychomotor: ITraitRating[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentTraitDocument extends IStudentTrait, Document<Types.ObjectId> {}

const traitRatingSchema = new Schema<ITraitRating>(
  {
    trait: { type: String, required: true, trim: true },
    rating: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const studentTraitSchema = new Schema<IStudentTraitDocument>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    studentRef: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    studentId: { type: String, required: true, uppercase: true, trim: true },
    term: { type: String, required: true, trim: true },
    session: { type: String, required: true, trim: true },
    affective: { type: [traitRatingSchema], default: [] },
    psychomotor: { type: [traitRatingSchema], default: [] },
  },
  {
    timestamps: true,
  },
);

// One trait record per student per term/session within a school.
studentTraitSchema.index(
  { schoolId: 1, studentRef: 1, term: 1, session: 1 },
  { unique: true },
);

export const StudentTrait = model<IStudentTraitDocument, Model<IStudentTraitDocument>>(
  'StudentTrait',
  studentTraitSchema,
);
