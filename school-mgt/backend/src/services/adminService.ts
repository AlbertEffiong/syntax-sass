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
import { cache } from '../utils/cache';
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
  classId?: string;
  fullName: string;
  gender: 'Male' | 'Female';
  dob: Date;
  currentClass: string;
  password: string;
  guardian?: string;
  contact?: string;
  address?: string;
  feeExpected?: number;
  feeDue?: number;
}

export interface UpdateStudentInput {
  fullName?: string;
  gender?: 'Male' | 'Female';
  dob?: Date;
  currentClass?: string;
  guardian?: string;
  contact?: string;
  address?: string;
  feeExpected?: number;
  feeDue?: number;
  password?: string;
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

  const cls = input.classId
    ? await ClassModel.findOne({ _id: input.classId, schoolId: input.schoolId })
    : await ClassModel.findOne({
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
  const feeExpected = input.feeExpected ?? input.feeDue ?? 0;
  const feeDue = input.feeDue ?? feeExpected;
  if (feeDue > feeExpected) {
    throw ApiError.badRequest('Amount due cannot exceed the expected fee.', 'INVALID_FEE_BALANCE');
  }

  const student = await Student.create({
    schoolId: new Types.ObjectId(input.schoolId),
    studentId,
    fullName: input.fullName.trim(),
    gender: input.gender,
    dob: input.dob,
    currentClass: cls.className,
    guardian: input.guardian ?? '',
    contact: input.contact ?? '',
    address: input.address ?? '',
    feeExpected,
    feeCollected: feeExpected - feeDue,
    feeDue,
    password,
    historicalResults: [],
  });

  await cache.invalidatePrefix(`students:${input.schoolId}:`);
  return serializeStudent(student);
}

export async function updateStudent(
  schoolId: string,
  studentId: string,
  patch: UpdateStudentInput,
): Promise<StudentPublic> {
  const student = await Student.findById(studentId);
  if (!student) throw ApiError.notFound('Student not found.', 'STUDENT_NOT_FOUND');
  assertSameSchool(student.schoolId, schoolId);

  const nextExpected = patch.feeExpected ?? student.feeExpected;
  const nextDue = patch.feeDue ?? student.feeDue;
  if (nextDue > nextExpected) {
    throw ApiError.badRequest('Amount due cannot exceed the expected fee.', 'INVALID_FEE_BALANCE');
  }

  if (patch.fullName !== undefined) student.fullName = patch.fullName;
  if (patch.gender !== undefined) student.gender = patch.gender;
  if (patch.dob !== undefined) student.dob = patch.dob;
  if (patch.currentClass !== undefined) student.currentClass = patch.currentClass;
  if (patch.guardian !== undefined) student.guardian = patch.guardian;
  if (patch.contact !== undefined) student.contact = patch.contact;
  if (patch.address !== undefined) student.address = patch.address;
  if (patch.feeExpected !== undefined) student.feeExpected = patch.feeExpected;
  if (patch.feeDue !== undefined) student.feeDue = patch.feeDue;
  student.feeCollected = student.feeExpected - student.feeDue;
  if (patch.password) student.password = await hashPassword(patch.password);

  await student.save();
  await cache.invalidatePrefix(`students:${schoolId}:`);
  return serializeStudent(student);
}

export async function recordFeePayment(
  schoolId: string,
  studentId: string,
  amount: number,
): Promise<StudentPublic> {
  const student = await Student.findById(studentId);
  if (!student) throw ApiError.notFound('Student not found.', 'STUDENT_NOT_FOUND');
  assertSameSchool(student.schoolId, schoolId);
  if (amount > student.feeDue) {
    throw ApiError.badRequest('Payment cannot exceed the outstanding balance.', 'PAYMENT_EXCEEDS_BALANCE');
  }

  student.feeDue -= amount;
  student.feeCollected += amount;
  await student.save();
  await cache.invalidatePrefix(`students:${schoolId}:`);
  return serializeStudent(student);
}

export async function getDashboard(schoolId: string) {
  const tenantId = new Types.ObjectId(schoolId);
  const [[summary], teacherCount, pendingAssessmentCount] = await Promise.all([
    Student.aggregate([
      { $match: { schoolId: tenantId } },
      {
        $group: {
          _id: null,
          studentCount: { $sum: 1 },
          feeExpected: { $sum: '$feeExpected' },
          feeCollected: { $sum: '$feeCollected' },
          feePending: { $sum: '$feeDue' },
          debtorCount: { $sum: { $cond: [{ $gt: ['$feeDue', 0] }, 1, 0] } },
        },
      },
    ]),
    Teacher.countDocuments({ schoolId: tenantId }),
    Assessment.countDocuments({ schoolId: tenantId, status: 'Pending Approval' }),
  ]);

  return {
    studentCount: summary?.studentCount ?? 0,
    teacherCount,
    pendingAssessmentCount,
    debtorCount: summary?.debtorCount ?? 0,
    fees: {
      expected: summary?.feeExpected ?? 0,
      collected: summary?.feeCollected ?? 0,
      pending: summary?.feePending ?? 0,
    },
  };
}

export async function updateDebtorControl(schoolId: string, restrictDebtors: boolean): Promise<SchoolPublic> {
  const school = await School.findById(schoolId);
  if (!school) throw ApiError.notFound('School not found.', 'SCHOOL_NOT_FOUND');
  school.restrictDebtors = restrictDebtors;
  await school.save();
  return serializeSchool(school);
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
  const cached = await cache.get<Paginated<StudentPublic>>(key);
  if (cached) return cached;
  const [rows, total] = await Promise.all([
    Student.find(filter).sort({ fullName: 1 }).skip(pagination.skip).limit(pagination.limit),
    Student.countDocuments(filter),
  ]);
  const result = paginate(rows.map(serializeStudent), total, pagination.page, pagination.limit);
  await cache.set(key, result);
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
  const cached = await cache.get<Paginated<TeacherPublic>>(key);
  if (cached) return cached;
  const [rows, total] = await Promise.all([
    Teacher.find({ schoolId }).sort({ name: 1 }).skip(pagination.skip).limit(pagination.limit),
    Teacher.countDocuments({ schoolId }),
  ]);
  const result = paginate(rows.map(serializeTeacher), total, pagination.page, pagination.limit);
  await cache.set(key, result);
  return result;
}

/**
 * Updates a teacher's name/subject. Tenant-scoped (IDOR safe).
 */
export async function updateTeacher(
  schoolId: string,
  teacherId: string,
  patch: { name?: string; subject?: string; classesTaught?: number; status?: 'Active' | 'On Leave' },
): Promise<TeacherPublic> {
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    throw ApiError.notFound('Teacher not found.', 'TEACHER_NOT_FOUND');
  }
  assertSameSchool(teacher.schoolId, schoolId);

  if (patch.name !== undefined) teacher.name = patch.name;
  if (patch.subject !== undefined) teacher.subject = patch.subject;
  if (patch.classesTaught !== undefined) teacher.classesTaught = patch.classesTaught;
  if (patch.status !== undefined) teacher.status = patch.status;
  await teacher.save();
  await cache.invalidatePrefix(`teachers:${schoolId}:`);
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
  await cache.invalidatePrefix(`teachers:${schoolId}:`);
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
  const cached = await cache.get<Paginated<AssessmentPublic>>(key);
  if (cached) return cached;
  const [rows, total] = await Promise.all([
    Assessment.find(filter)
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    Assessment.countDocuments(filter),
  ]);
  const result = paginate(rows.map(serializeAssessment), total, pagination.page, pagination.limit);
  await cache.set(key, result);
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
