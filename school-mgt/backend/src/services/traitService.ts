import { Types } from 'mongoose';
import { StudentTrait, ITraitRating } from '../models/StudentTrait';
import { Student } from '../models/Student';
import { ApiError } from '../utils/ApiError';
import { assertSameSchool } from '../utils/security';

export interface UpsertStudentTraitsInput {
  schoolId: string;
  studentRef: string;
  term: string;
  session: string;
  affective: ITraitRating[];
  psychomotor: ITraitRating[];
}

/**
 * Returns the affective / psychomotor trait ratings for a student in a given
 * term/session. Returns empty arrays when no record exists yet.
 */
export async function getStudentTraits(
  schoolId: string,
  studentRef: string,
  term: string,
  session: string,
): Promise<{ affective: ITraitRating[]; psychomotor: ITraitRating[] }> {
  const student = await Student.findById(studentRef);
  if (!student) {
    throw ApiError.notFound('Student not found.', 'STUDENT_NOT_FOUND');
  }
  assertSameSchool(student.schoolId, schoolId);

  const record = await StudentTrait.findOne({
    schoolId,
    studentRef,
    term,
    session,
  }).lean();

  return {
    affective: record?.affective ?? [],
    psychomotor: record?.psychomotor ?? [],
  };
}

/**
 * Upserts the affective / psychomotor trait ratings for a student in a given
 * term/session. Tenant-scoped (IDOR safe).
 */
export async function upsertStudentTraits(input: UpsertStudentTraitsInput): Promise<void> {
  const student = await Student.findById(input.studentRef);
  if (!student) {
    throw ApiError.notFound('Student not found.', 'STUDENT_NOT_FOUND');
  }
  assertSameSchool(student.schoolId, input.schoolId);

  const affective = Array.from(
    new Set((input.affective ?? []).map((r) => ({ trait: String(r.trait).trim(), rating: String(r.rating).trim() })).filter((r) => r.trait && r.rating)),
  );
  const psychomotor = Array.from(
    new Set((input.psychomotor ?? []).map((r) => ({ trait: String(r.trait).trim(), rating: String(r.rating).trim() })).filter((r) => r.trait && r.rating)),
  );

  await StudentTrait.findOneAndUpdate(
    {
      schoolId: input.schoolId,
      studentRef: input.studentRef,
      term: input.term,
      session: input.session,
    },
    {
      $set: {
        studentId: student.studentId,
        affective,
        psychomotor,
      },
      $setOnInsert: {
        schoolId: new Types.ObjectId(input.schoolId),
        studentRef: new Types.ObjectId(input.studentRef),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
