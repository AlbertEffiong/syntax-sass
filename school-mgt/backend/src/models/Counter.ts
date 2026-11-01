import { Document, Model, Schema, model } from 'mongoose';

/**
 * Atomic per-(school, year) sequence used to generate collision-free student
 * IDs of the form [PREFIX]/[YEAR]/[SEQ].
 */
export interface ICounter {
  key: string;
  seq: number;
}

export interface ICounterDocument extends ICounter, Document<string> {}

const counterSchema = new Schema<ICounterDocument>({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export const Counter = model<ICounterDocument, Model<ICounterDocument>>('Counter', counterSchema);

/**
 * Atomically increments and returns the next sequence number for a key.
 */
export async function nextSequence(key: string): Promise<number> {
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
  return doc?.seq ?? 1;
}
