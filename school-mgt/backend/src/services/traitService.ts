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

async function resolveStudent(schoolId: string, studentRef: string) {
  const ref = String(studentRef || '').trim();
  let student = null;
  if (Types.ObjectId.isValid(ref)) {
    student = await Student.findOne({ _id: ref, schoolId });
  }
  if (!student) {
    student = await Student.findOne({ studentId: ref, schoolId });
  }
  if (!student) {
    throw ApiError.notFound('Student not found.', 'STUDENT_NOT_FOUND');
  }
  assertSameSchool(student.schoolId, schoolId);
  return student;
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
  const student = await resolveStudent(schoolId, studentRef);
  const refId = String(student._id);

  const record = await StudentTrait.findOne({
    schoolId,
    studentRef: refId,
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
  const student = await resolveStudent(input.schoolId, input.studentRef);
  const refId = String(student._id);

  const affective = Array.from(
    new Set((input.affective ?? []).map((r) => ({ trait: String(r.trait).trim(), rating: String(r.rating).trim() })).filter((r) => r.trait && r.rating)),
  );
  const psychomotor = Array.from(
    new Set((input.psychomotor ?? []).map((r) => ({ trait: String(r.trait).trim(), rating: String(r.rating).trim() })).filter((r) => r.trait && r.rating)),
  );

  await StudentTrait.findOneAndUpdate(
    {
      schoolId: input.schoolId,
      studentRef: refId,
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
        studentRef: new Types.ObjectId(refId),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
