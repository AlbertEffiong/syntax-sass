import { Document, Model, Schema, Types, model } from 'mongoose';

export type SchoolActivityType =
  | 'student.enrolled'
  | 'student.updated'
  | 'student.removed'
  | 'fee.payment'
  | 'teacher.invited'
  | 'teacher.verified'
  | 'teacher.updated'
  | 'teacher.removed'
  | 'class.created'
  | 'class.updated'
  | 'class.removed'
  | 'assessment.submitted'
  | 'assessment.reviewed'
  | 'subscription.payment_submitted';

export interface ISchoolActivity {
  schoolId: Types.ObjectId;
  type: SchoolActivityType;
  title: string;
  details: string;
  createdAt: Date;
}

export interface ISchoolActivityDocument extends ISchoolActivity, Document<Types.ObjectId> {}

const schoolActivitySchema = new Schema<ISchoolActivityDocument>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    details: { type: String, trim: true, maxlength: 300, default: '' },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false },
);

schoolActivitySchema.index({ schoolId: 1, createdAt: -1 });

export const SchoolActivity = model<ISchoolActivityDocument, Model<ISchoolActivityDocument>>(
  'SchoolActivity',
  schoolActivitySchema,
);