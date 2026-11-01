import { Document, Model, Schema, Types, model } from 'mongoose';

export type SubscriptionStatus = 'Active' | 'Expired';

/** Academic calendar defaults used across teacher entry, approval and reports. */
export interface IAcademicSetting {
  currentSession: string;
  currentTerm: string;
  termsPerSession: number;
}

export function defaultSession(now = new Date()): string {
  const startYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}/${startYear + 1}`;
}

/** A manually-submitted OPay bank transfer awaiting owner verification. */
export interface IPendingPayment {
  reference: string;
  amount: number;
  submittedAt: Date;
  status: 'pending' | 'verified' | 'rejected';
}

export interface ISchool {
  name: string;
  email: string;
  password: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt: Date;
  uniqueSchoolPrefix: string;
  principalName: string;
  /** Monthly plan price (used for MRR calculations). */
  planMonthly: number;
  academic: IAcademicSetting;
  pendingPayment?: IPendingPayment;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISchoolDocument extends ISchool, Document<Types.ObjectId> {
  isSubscriptionActive(): boolean;
}

export type SubscriptionRelevant = Pick<ISchool, 'subscriptionStatus' | 'subscriptionExpiresAt'>;

/**
 * Single source of truth for "is this school currently paid up". A school is
 * active when its status is Active AND its expiry is still in the future.
 */
export function isSubscriptionActive(school: SubscriptionRelevant): boolean {
  return (
    school.subscriptionStatus === 'Active' &&
    !!school.subscriptionExpiresAt &&
    school.subscriptionExpiresAt.getTime() > Date.now()
  );
}

export interface ISchoolModel extends Model<ISchoolDocument> {
  isSubscriptionActive(school: SubscriptionRelevant): boolean;
}

const pendingPaymentSchema = new Schema<IPendingPayment>(
  {
    reference: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
  },
  { _id: false },
);

const academicSchema = new Schema<IAcademicSetting>(
  {
    currentSession: { type: String, default: () => defaultSession() },
    currentTerm: { type: String, default: 'First Term' },
    termsPerSession: { type: Number, default: 3, min: 1, max: 4 },
  },
  { _id: false },
);

const schoolSchema = new Schema<ISchoolDocument, ISchoolModel>(
  {
    name: { type: String, required: [true, 'School name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'School admin email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Password is excluded from queries by default; login must opt-in with .select('+password').
    password: { type: String, required: true, select: false },
    subscriptionStatus: {
      type: String,
      enum: ['Active', 'Expired'],
      default: 'Active',
    },
    subscriptionExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    uniqueSchoolPrefix: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{2,6}$/, 'School prefix must be 2-6 uppercase letters'],
    },
    principalName: { type: String, trim: true, default: '' },
    planMonthly: { type: Number, default: 49, min: 0 },
    academic: { type: academicSchema, default: () => ({}) },
    pendingPayment: { type: pendingPaymentSchema, default: undefined },
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

schoolSchema.methods.isSubscriptionActive = function (this: ISchoolDocument): boolean {
  return isSubscriptionActive(this);
};

schoolSchema.statics.isSubscriptionActive = isSubscriptionActive;

export const School = model<ISchoolDocument, ISchoolModel>('School', schoolSchema);
