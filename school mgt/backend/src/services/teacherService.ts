import { Types } from 'mongoose';
import { ClassModel } from '../models/Class';
import { School } from '../models/School';
import { Student } from '../models/Student';
import { Assessment } from '../models/Assessment';
import { ApiError } from '../utils/ApiError';
import { computeTotal, gradeFor } from '../utils/grading';
import { serializeClass, ClassPublic, serializeAssessment, AssessmentPublic } from '../utils/serialize';

export interface ScoreEntry {
  studentId: string;
  ca1: number;
  ca2: number;
  exam: number;
}

export interface SaveBroadsheetInput {
  schoolId: string;
  teacherId: string;
  teacherEmail: string;
  classId: string;
  subject: string;
  term: string;
  session: string;
  entries: ScoreEntry[];
}

export interface SubmitBroadsheetInput {
  schoolId: string;
  teacherId: string;
  teacherEmail: string;
  classId: string;
  subject: string;
  term: string;
  session: string;
  principalName?: string;
}

/**
 * Returns the classes + subjects for the teacher's school, sourced strictly
 * from the admin-maintained curriculum. Nothing is hard-coded.
 */
export async function getClassesSubjects(schoolId: string): Promise<ClassPublic[]> {
  const classes = await ClassModel.find({ schoolId }).sort({ className: 1 });
  return classes.map(serializeClass);
}

/**
 * Resolves and validates the (class, subject) pair against the school's
 * curriculum, returning the class document.
 */
async function resolveClassSubject(schoolId: string, classId: string, subject: string) {
  const cls = await ClassModel.findById(classId);
  if (!cls) {
    throw ApiError.notFound('Class not found.', 'CLASS_NOT_FOUND');
  }
  // IDOR guard: the class must belong to the teacher's school.
  if (String(cls.schoolId) !== String(schoolId)) {
    throw ApiError.forbidden('This class does not belong to your school.', 'IDOR_BLOCKED');
  }
  const subjectExists = cls.subjects.some((s) => s.toLowerCase() === subject.toLowerCase());
  if (!subjectExists) {
    throw ApiError.badRequest(
      'The selected subject is not part of this class\'s curriculum.',
      'SUBJECT_NOT_IN_CURRICULUM',
    );
  }
  return cls;
}

/**
 * Saves (upserts) CA1, CA2 and Exam scores for a set of students. Any prior
 * approval is revoked so edited scores must be re-approved.
 */
export async function saveBroadsheet(input: SaveBroadsheetInput): Promise<{ saved: number }> {
  const cls = await resolveClassSubject(input.schoolId, input.classId, input.subject);

  if (input.entries.length === 0) {
    throw ApiError.badRequest('No score entries were provided.', 'NO_ENTRIES');
  }

  // Load the students that legitimately belong to this class in one query.
  const students = await Student.find({
    schoolId: input.schoolId,
    currentClass: cls.className,
  });
  const byStudentId = new Map(students.map((s) => [s.studentId.toUpperCase(), s]));

  let saved = 0;
  for (const entry of input.entries) {
    const student = byStudentId.get(entry.studentId.toUpperCase());
    if (!student) {
      // Skip unknown / cross-tenant ids rather than trusting the client.
      continue;
    }

    const ca1 = clamp(entry.ca1, 20);
    const ca2 = clamp(entry.ca2, 20);
    const exam = clamp(entry.exam, 60);
    const total = computeTotal(ca1, ca2, exam);

    await Assessment.findOneAndUpdate(
      {
        schoolId: input.schoolId,
        classId: cls._id,
        subject: cls.subjects.find((s) => s.toLowerCase() === input.subject.toLowerCase()),
        studentRef: student._id,
        term: input.term,
        session: input.session,
      },
      {
        $set: {
          className: cls.className,
          teacherId: new Types.ObjectId(input.teacherId),
          teacherEmail: input.teacherEmail,
          studentId: student.studentId,
          ca1,
          ca2,
          exam,
          total,
          grade: gradeFor(total),
          status: 'Pending Approval',
        },
        $unset: { approvedAt: 1 },
        $setOnInsert: { submittedAt: null },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    saved += 1;
  }

  return { saved };
}

/**
 * Submits all saved scores for a (class, subject, term) to the admin for
 * approval, stamping the principal name.
 */
export async function submitBroadsheet(
  input: SubmitBroadsheetInput,
): Promise<{ submitted: number; principalName: string }> {
  const cls = await resolveClassSubject(input.schoolId, input.classId, input.subject);
  const canonicalSubject = cls.subjects.find(
    (s) => s.toLowerCase() === input.subject.toLowerCase(),
  )!;

  let principalName = input.principalName?.trim() ?? '';
  if (!principalName) {
    const school = await School.findById(input.schoolId);
    principalName = school?.principalName ?? '';
  }

  const result = await Assessment.updateMany(
    {
      schoolId: input.schoolId,
      classId: cls._id,
      subject: canonicalSubject,
      teacherId: new Types.ObjectId(input.teacherId),
      term: input.term,
      session: input.session,
    },
    {
      $set: {
        status: 'Pending Approval',
        submittedAt: new Date(),
        principalName,
      },
      $unset: { approvedAt: 1 },
    },
  );

  const submitted = result.modifiedCount ?? 0;
  if (submitted === 0) {
    throw ApiError.badRequest(
      'There are no saved scores to submit for this class and subject.',
      'NOTHING_TO_SUBMIT',
    );
  }

  return { submitted, principalName };
}

/**
 * Reads the (already saved) broadsheet for a class + subject.
 */
export async function getBroadsheet(
  schoolId: string,
  classId: string,
  subject: string,
  term: string,
  session: string,
): Promise<AssessmentPublic[]> {
  await resolveClassSubject(schoolId, classId, subject);
  const rows = await Assessment.find({ schoolId, classId, subject, term, session }).sort({
    studentId: 1,
  });
  return rows.map(serializeAssessment);
}

function clamp(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(max, Math.round(value)));
}
