import { School } from '../models/School';
import { Student, IStudentDocument } from '../models/Student';
import { Teacher } from '../models/Teacher';
import { Assessment } from '../models/Assessment';
import { ApiError } from '../utils/ApiError';
import { gradeFor, remarkFor } from '../utils/grading';
import { assertSameSchool } from '../utils/security';
import { defaultSession } from '../models/School';

export interface ReportSubject {
  subject: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
  teacherName: string;
}

export interface ReportCard {
  student: {
    id: string;
    studentId: string;
    fullName: string;
    gender: string;
    currentClass: string;
  };
  term: string;
  session: string;
  subjects: ReportSubject[];
  total: number;
  average: number;
  position: number;
  classSize: number;
  principalName: string;
  classTeacherName: string;
  published: boolean;
}

export interface GetResultsInput {
  schoolId: string;
  studentRef: string;
  term?: string;
  session?: string;
}

/**
 * Builds a termly report card for a student from admin-approved assessments.
 * Falls back to the student's archived `historicalResults` when no published
 * term matches.
 */
export async function getResults(input: GetResultsInput): Promise<ReportCard> {
  const student = await Student.findById(input.studentRef);
  if (!student) {
    throw ApiError.notFound('Student not found.', 'STUDENT_NOT_FOUND');
  }
  // IDOR guard: a student may only ever read their own school's data. Also
  // ensures a forged studentRef pointing at another tenant cannot leak results.
  assertSameSchool(student.schoolId, input.schoolId);

  const school = await School.findById(input.schoolId);
  const { term, session } = await resolveTermSession(input, school?.academic);

  const assessments = await Assessment.find({
    schoolId: input.schoolId,
    studentRef: student._id,
    term,
    session,
    status: 'Approved',
  });

  if (assessments.length === 0) {
    return buildFromHistory(student, term, session, school?.principalName ?? '');
  }

  // Resolve dynamic teacher names for each subject.
  const teacherEmails = Array.from(new Set(assessments.map((a) => a.teacherEmail)));
  const teachers = await Teacher.find({ schoolId: input.schoolId, email: { $in: teacherEmails } });
  const teacherByEmail = new Map(teachers.map((t) => [t.email, t.name]));

  const subjects: ReportSubject[] = assessments
    .map((a) => ({
      subject: a.subject,
      ca1: a.ca1,
      ca2: a.ca2,
      exam: a.exam,
      total: a.total,
      grade: a.grade || gradeFor(a.total),
      remark: remarkFor(a.total),
      teacherName: teacherByEmail.get(a.teacherEmail) ?? a.teacherEmail,
    }))
    .sort((x, y) => x.subject.localeCompare(y.subject));

  const total = subjects.reduce((sum, s) => sum + s.total, 0);
  const average = subjects.length ? Math.round((total / subjects.length) * 10) / 10 : 0;

  const { position, classSize } = await rankStudent(
    input.schoolId,
    student.currentClass,
    student.studentId,
    term,
    session,
  );

  const principalName = school?.principalName || assessments[0]?.principalName || '';
  const classTeacherNames = subjects.map((s) => s.teacherName).filter(Boolean);

  return {
    student: {
      id: String(student._id),
      studentId: student.studentId,
      fullName: student.fullName,
      gender: student.gender,
      currentClass: student.currentClass,
    },
    term,
    session,
    subjects,
    total,
    average,
    position,
    classSize,
    principalName,
    classTeacherName: classTeacherNames[0] ?? '',
    published: true,
  };
}

async function resolveTermSession(
  input: GetResultsInput,
  academic?: { currentSession?: string; currentTerm?: string },
): Promise<{ term: string; session: string }> {
  if (input.term && input.session) {
    return { term: input.term, session: input.session };
  }

  const latest = await Assessment.findOne({
    schoolId: input.schoolId,
    studentRef: input.studentRef,
    status: 'Approved',
  }).sort({ approvedAt: -1, createdAt: -1 });

  return {
    term: input.term ?? latest?.term ?? academic?.currentTerm ?? 'First Term',
    session: input.session ?? latest?.session ?? academic?.currentSession ?? defaultSession(),
  };
}

/**
 * Ranks a student within their class for a term by summing approved scores.
 */
async function rankStudent(
  schoolId: string,
  className: string,
  studentId: string,
  term: string,
  session: string,
): Promise<{ position: number; classSize: number }> {
  const rows = await Assessment.find({
    schoolId,
    className,
    term,
    session,
    status: 'Approved',
  });

  const totals = new Map<string, number>();
  for (const row of rows) {
    totals.set(row.studentId, (totals.get(row.studentId) ?? 0) + row.total);
  }
  const ranked = Array.from(totals.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const index = ranked.findIndex(([id]) => id === studentId);

  return { position: index >= 0 ? index + 1 : 0, classSize: ranked.length };
}

/**
 * Uses the student's archived results when nothing has been published for the
 * requested term yet.
 */
function buildFromHistory(
  student: IStudentDocument,
  term: string,
  session: string,
  principalNameFromSchool: string,
): ReportCard {
  const doc = student;
  const history =
    doc.historicalResults.find((h) => h.term === term && h.session === session) ??
    doc.historicalResults[doc.historicalResults.length - 1];

  if (!history) {
    throw ApiError.notFound(
      'No published results are available for this student yet.',
      'NO_RESULTS',
    );
  }

  return {
    student: {
      id: String(doc._id),
      studentId: doc.studentId,
      fullName: doc.fullName,
      gender: doc.gender,
      currentClass: doc.currentClass,
    },
    term: history.term,
    session: history.session,
    subjects: history.subjects.map((s) => ({
      subject: s.subject,
      ca1: s.ca1,
      ca2: s.ca2,
      exam: s.exam,
      total: s.total,
      grade: s.grade || gradeFor(s.total),
      remark: remarkFor(s.total),
      teacherName: '',
    })),
    total: history.total,
    average: history.average,
    position: history.position,
    classSize: history.classSize,
    principalName: history.principalName || principalNameFromSchool,
    classTeacherName: history.classTeacherName,
    published: true,
  };
}
