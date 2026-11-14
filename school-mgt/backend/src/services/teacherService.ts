import { Types } from 'mongoose';
import { ClassModel } from '../models/Class';
import { School } from '../models/School';
import { Student } from '../models/Student';
import { Teacher, ITeacherDocument } from '../models/Teacher';
import { Assessment } from '../models/Assessment';
import type { UploadedFile } from './uploadService';
import { ApiError } from '../utils/ApiError';
import { computeTotal, gradeFor } from '../utils/grading';
import { serializeClass, ClassPublic, serializeAssessment, AssessmentPublic, serializeSchool } from '../utils/serialize';
import { recordSchoolActivity } from '../utils/activity';
import { sendAdminSetupReminder } from '../utils/mailer';

export interface ScoreEntry {
  studentId: string;
  ca1: number;
  ca2: number;
  exam: number;
  /** Teacher-entered attendance for this student this term, e.g. "18/20". */
  attendance?: string;
  /** Teacher-entered general remark for this student this term. */
  remark?: string;
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

export async function getTeacherContext(schoolId: string, teacherId?: string) {
  const [school, teacher] = await Promise.all([
    School.findById(schoolId),
    teacherId ? Teacher.findById(teacherId) : Promise.resolve(null),
  ]);
  if (!school) throw ApiError.notFound('School not found.', 'SCHOOL_NOT_FOUND');
  const data = serializeSchool(school) as any;
  if (teacher) {
    data.teacherName = teacher.name;
    data.teacherEmail = teacher.email;
    data.teacherSignature = teacher.signature || null;
  }
  return data;
}

export async function getClassRoster(schoolId: string, classId: string) {
  const cls = await ClassModel.findById(classId);
  if (!cls) throw ApiError.notFound('Class not found.', 'CLASS_NOT_FOUND');
  if (String(cls.schoolId) !== String(schoolId)) {
    throw ApiError.forbidden('This class does not belong to your school.', 'IDOR_BLOCKED');
  }
  const students = await Student.find({ schoolId, currentClass: cls.className }).sort({ fullName: 1 });
  return students.map((student) => ({
    id: String(student._id),
    studentId: student.studentId,
    fullName: student.fullName,
    currentClass: student.currentClass,
  }));
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
    const attendance = clampAttendance(entry.attendance);
    const remark = (entry.remark || '').trim().slice(0, 400);

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
          attendance,
          remark,
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

  await recordSchoolActivity(
    input.schoolId,
    'assessment.submitted',
    'Results submitted for approval',
    `${cls.className} · ${canonicalSubject}: ${submitted} score rows submitted.`,
  );

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

/**
 * Normalises a teacher-entered attendance value. Accepts a percentage (e.g.
 * "85", "85%") which is clamped to 0-100, or a fraction (e.g. "18/20") which is
 * kept as-is. Returns a trimmed string.
 */
function clampAttendance(value?: string): string {
  const raw = (value || '').trim();
  if (!raw) return '';
  if (/^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/.test(raw)) return raw;
  const num = Number(raw.replace(/%/g, ''));
  if (!Number.isFinite(num)) return raw;
  return String(Math.max(0, Math.min(100, Math.round(num))));
}

/**
 * Teacher-triggered reminder: emails the school admin to configure
 * Classes & Subjects (curriculum) when none exist yet.
 */
export async function notifyAdminSetup(schoolId: string, teacherId: string): Promise<{ sent: boolean; adminEmail: string }> {
  const [school, teacher] = await Promise.all([
    School.findById(schoolId),
    Teacher.findById(teacherId),
  ]);
  if (!school) throw ApiError.notFound('School not found.', 'SCHOOL_NOT_FOUND');
  if (!teacher) throw ApiError.notFound('Teacher not found.', 'TEACHER_NOT_FOUND');
  if (String(teacher.schoolId) !== String(schoolId)) {
    throw ApiError.forbidden('Teacher does not belong to this school.', 'IDOR_BLOCKED');
  }
  const adminEmail = (school.email || '').trim();
  if (!adminEmail) {
    throw ApiError.badRequest('This school has no admin email configured.', 'NO_ADMIN_EMAIL');
  }
  await sendAdminSetupReminder(
    adminEmail,
    school.name || 'your school',
    teacher.name || 'A teacher',
    teacher.email || '',
  );
  await recordSchoolActivity(
    schoolId,
    'class.updated',
    'Curriculum setup reminder sent',
    `${teacher.name || 'A teacher'} (${teacher.email || '—'}) asked the admin to configure Classes & Subjects.`,
  );
  return { sent: true, adminEmail };
}

/**
 * Stores the authenticated teacher's own signature. When object storage is
 * configured the file is uploaded and a public URL is stored; otherwise the
 * base64 payload is stored in the document.
 */
export async function updateTeacherSignature(
  schoolId: string,
  teacherId: string,
  signature: UploadedFile,
): Promise<ITeacherDocument> {
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) throw ApiError.notFound('Teacher not found.', 'TEACHER_NOT_FOUND');
  if (String(teacher.schoolId) !== String(schoolId)) {
    throw ApiError.forbidden('This teacher does not belong to your school.', 'IDOR_BLOCKED');
  }
  teacher.signature = {
    fileName: signature.fileName.trim(),
    contentType: signature.contentType.trim(),
    ...(signature.url ? { url: signature.url } : {}),
    ...(signature.contentBase64 ? { contentBase64: signature.contentBase64 } : {}),
  };
  await teacher.save();
  return teacher;
}
