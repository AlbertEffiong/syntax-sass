import { Document, Model, Schema, Types, model } from 'mongoose';

/**
 * The SaaS Owner (platform operator). Separate from School admins so platform
 * authority never mixes with tenant authority.
 */
export interface IOwner {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOwnerDocument extends IOwner, Document<Types.ObjectId> {}

const ownerSchema = new Schema<IOwnerDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
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

export const Owner = model<IOwnerDocument, Model<IOwnerDocument>>('Owner', ownerSchema);
