import { School } from '../models/School';
import { Owner } from '../models/Owner';
import { Teacher } from '../models/Teacher';
import { ClassModel } from '../models/Class';
import { Student } from '../models/Student';
import { Assessment } from '../models/Assessment';
import { Counter } from '../models/Counter';

/**
 * Ensures all collection indexes (including unique constraints) exist. Called
 * once at startup so unique guarantees hold even when Mongoose autoIndex is
 * disabled (production).
 */
export async function ensureIndexes(): Promise<void> {
  await Promise.all([
    School.init(),
    Owner.init(),
    Teacher.init(),
    ClassModel.init(),
    Student.init(),
    Assessment.init(),
    Counter.init(),
  ]);
}
