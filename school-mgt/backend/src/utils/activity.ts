import { Types } from 'mongoose';
import { SchoolActivity, SchoolActivityType } from '../models/SchoolActivity';

export async function recordSchoolActivity(
  schoolId: string,
  type: SchoolActivityType,
  title: string,
  details = '',
): Promise<void> {
  try {
    await SchoolActivity.create({
      schoolId: new Types.ObjectId(schoolId),
      type,
      title,
      details,
    });
  } catch {
    // Activity logging must not fail the underlying school operation.
  }
}