import { Types } from 'mongoose';
import { ClassModel } from '../models/Class';
import { School } from '../models/School';
import { Student } from '../models/Student';
import { Teacher } from '../models/Teacher';
import { Assessment, AssessmentStatus } from '../models/Assessment';
import { ApiError } from '../utils/ApiError';
import { assertSameSchool } from '../utils/security';
import { generateStudentId } from '../utils/studentId';
import { hashPassword } from '../utils/password';
import { paginate, Paginated, Pagination } from '../utils/pagination';
import {
  ClassPublic,
  serializeClass,
  serializeStudent,
  StudentPublic,
  AssessmentPublic,
  serializeAssessment,
  serializeSchool,
  SchoolPublic,
  serializeTeacher,
  TeacherPublic,
} from '../utils/serialize';

export interface CreateClassInput {
  schoolId: string;
  className: string;
  subjects: string[];
  teacherEmail?: string;
}

export interface EnrollStudentInput {
  schoolId: string;
  fullName: string;
  gender: 'Male' | 'Female';
  dob: Date;
  currentClass: string;
  password: string;
}

export interface ReviewAssessmentInput {
  schoolId: string;
  assessmentId: string;
  action: 'approve' | 'reject';
  note?: string;
}

export interface BankTransferInput {
  schoolId: string;
  reference: string;
  amount: number;
}

/**
 * Creates a class and maps its curriculum subjects. Class names are unique per
 * school.
 */
export async function createClass(input: CreateClassInput): Promise<ClassPublic> {
  const subjects = Array.from(
    new Set(input.subjects.map((s) => String(s).trim()).filter(Boolean)),
  );
  if (subjects.length === 0) {
    throw ApiError.badRequest('At least one subject is required to create a class.', 'NO_SUBJECTS');
  }

  const existing = await ClassModel.findOne({
    schoolId: input.schoolId,
    className: input.className.trim(),
  });
  if (existing) {
    throw ApiError.conflict('A class with this name already exists.', 'CLASS_EXISTS');
  }

  const cls = await ClassModel.create({
    schoolId: new Types.ObjectId(input.schoolId),
    className: input.className.trim(),
    subjects,
    teacherEmail: input.teacherEmail?.toLowerCase(),
  });
  return serializeClass(cls);
}

/**
 * Lists every class (with its curriculum) for the tenant.
 */
export async function listClasses(schoolId: string): Promise<ClassPublic[]> {
  const classes = await ClassModel.find({ schoolId }).sort({ className: 1 });
  return classes.map(serializeClass);
}

/**
 * Enrolls a student and auto-generates their school-prefixed id
 * ([PREFIX]/[YEAR]/[SEQ]). The target class must exist in the school's
 * curriculum.
 */
export async function enrollStudent(input: EnrollStudentInput): Promise<StudentPublic> {
  const school = await School.findById(input.schoolId);
  if (!school) {
    throw ApiError.notFound('School not found.', 'SCHOOL_NOT_FOUND');
  }

  const cls = await ClassModel.findOne({
    schoolId: input.schoolId,
    className: input.currentClass.trim(),
  });
  if (!cls) {
    throw ApiError.badRequest(
      'The selected class is not part of this school\'s curriculum.',
      'CLASS_NOT_CONFIGURED',
    );
  }

  const studentId = await generateStudentId(school.uniqueSchoolPrefix);
  const password = await hashPassword(input.password);

  const student = await Student.create({
    schoolId: new Types.ObjectId(input.schoolId),
    studentId,
    fullName: input.fullName.trim(),
    gender: input.gender,
    dob: input.dob,
    currentClass: cls.className,
    password,
    historicalResults: [],
  });

  return serializeStudent(student);
}

/**
 * Lists students for the tenant (paginated), optionally filtered by class.
 */
export async function listStudents(
  schoolId: string,
  currentClass: string | undefined,
  pagination: Pagination,
): Promise<Paginated<StudentPublic>> {
  const filter: Record<string, unknown> = { schoolId };
  if (currentClass) filter.currentClass = currentClass;

  const key = `students:${schoolId}:${currentClass ?? ''}:${pagination.page}:${pagination.limit}`;
  const cached = cache.get<Paginated<StudentPublic>>(key);
  if (cached) return cached;
  const [rows, total] = await Promise.all([
    Student.find(filter).sort({ fullName: 1 }).skip(pagination.skip).limit(pagination.limit),
    Student.countDocuments(filter),
  ]);
  const result = paginate(rows.map(serializeStudent), total, pagination.page, pagination.limit);
  cache.set(key, result);
  return result;
}

/**
 * Lists teachers for the tenant (paginated).
 */
export async function listTeachers(
  schoolId: string,
  pagination: Pagination,
): Promise<Paginated<TeacherPublic>> {
  const key = `teachers:${schoolId}:${pagination.page}:${pagination.limit}`;
  const cached = cache.get<Paginated<TeacherPublic>>(key);
  if (cached) return cached;
  const [rows, total] = await Promise.all([
    Teacher.find({ schoolId }).sort({ name: 1 }).skip(pagination.skip).limit(pagination.limit),
    Teacher.countDocuments({ schoolId }),
  ]);
  const result = paginate(rows.map(serializeTeacher), total, pagination.page, pagination.limit);
  cache.set(key, result);
  return result;
}

/**
 * Updates a teacher's name/subject. Tenant-scoped (IDOR safe).
 */
export async function updateTeacher(
  schoolId: string,
  teacherId: string,
  patch: { name?: string; subject?: string },
): Promise<TeacherPublic> {
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    throw ApiError.notFound('Teacher not found.', 'TEACHER_NOT_FOUND');
  }
  assertSameSchool(teacher.schoolId, schoolId);

  if (patch.name !== undefined) teacher.name = patch.name;
  if (patch.subject !== undefined) teacher.subject = patch.subject;
  await teacher.save();
  return serializeTeacher(teacher);
}

/**
 * Removes a teacher from the tenant. Tenant-scoped (IDOR safe).
 */
export async function removeTeacher(schoolId: string, teacherId: string): Promise<void> {
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    throw ApiError.notFound('Teacher not found.', 'TEACHER_NOT_FOUND');
  }
  assertSameSchool(teacher.schoolId, schoolId);
  await teacher.deleteOne();
}

/**
 * Returns assessments for admin review (paginated; defaults to pending).
 */
export async function listAssessments(
  schoolId: string,
  status: AssessmentStatus | 'all',
  pagination: Pagination,
): Promise<Paginated<AssessmentPublic>> {
  const filter: Record<string, unknown> = { schoolId };
  if (status !== 'all') filter.status = status;

  const key = `assessments:${schoolId}:${status}:${pagination.page}:${pagination.limit}`;
  const cached = cache.get<Paginated<AssessmentPublic>>(key);
  if (cached) return cached;
  const [rows, total] = await Promise.all([
    Assessment.find(filter)
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    Assessment.countDocuments(filter),
  ]);
  const result = paginate(rows.map(serializeAssessment), total, pagination.page, pagination.limit);
  cache.set(key, result);
  return result;
}

/**
 * Approves or rejects a teacher's submission. Rejection moves the line back to
 * the teacher as `Revised` with an optional note.
 */
export async function reviewAssessment(input: ReviewAssessmentInput): Promise<AssessmentPublic> {
  const assessment = await Assessment.findById(input.assessmentId);
  if (!assessment) {
    throw ApiError.notFound('Assessment not found.', 'ASSESSMENT_NOT_FOUND');
  }
  // IDOR guard: the assessment must belong to the admin's school.
  assertSameSchool(assessment.schoolId, input.schoolId);

  if (input.action === 'approve') {
    assessment.status = 'Approved';
    assessment.approvedAt = new Date();
    assessment.note = input.note ?? '';
  } else {
    assessment.status = 'Revised';
    assessment.approvedAt = undefined;
    assessment.note = input.note ?? 'Returned for revision.';
  }
  await assessment.save();
  return serializeAssessment(assessment);
}

/**
 * Records a school's claimed OPay bank-transfer details for the owner to verify.
 */
export async function submitBankTransfer(input: BankTransferInput): Promise<SchoolPublic> {
  const school = await School.findById(input.schoolId);
  if (!school) {
    throw ApiError.notFound('School not found.', 'SCHOOL_NOT_FOUND');
  }

  school.pendingPayment = {
    reference: input.reference.trim(),
    amount: input.amount,
    submittedAt: new Date(),
    status: 'pending',
  };
  await school.save();
  return serializeSchool(school);
}

export interface AcademicSettingInput {
  currentSession?: string;
  currentTerm?: string;
  termsPerSession?: number;
}

/**
 * Reads the tenant's school profile/settings.
 */
export async function getSchoolSettings(schoolId: string): Promise<SchoolPublic> {
  const school = await School.findById(schoolId);
  if (!school) {
    throw ApiError.notFound('School not found.', 'SCHOOL_NOT_FOUND');
  }
  return serializeSchool(school);
}

/**
 * Updates the academic calendar (session/term/terms-per-session) for the tenant.
 */
export async function updateAcademicSetting(
  schoolId: string,
  patch: AcademicSettingInput,
): Promise<SchoolPublic> {
  const school = await School.findById(schoolId);
  if (!school) {
    throw ApiError.notFound('School not found.', 'SCHOOL_NOT_FOUND');
  }

  if (patch.currentSession !== undefined) school.academic.currentSession = patch.currentSession;
  if (patch.currentTerm !== undefined) school.academic.currentTerm = patch.currentTerm;
  if (patch.termsPerSession !== undefined) school.academic.termsPerSession = patch.termsPerSession;

  await school.save();
  return serializeSchool(school);
}
