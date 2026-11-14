import { Types } from 'mongoose';
import { ClassModel } from '../models/Class';
import { School } from '../models/School';
import { Student } from '../models/Student';
import { Teacher } from '../models/Teacher';
import { Assessment, AssessmentStatus } from '../models/Assessment';
import { SchoolActivity } from '../models/SchoolActivity';
import { StudentTrait } from '../models/StudentTrait';
import { ApiError } from '../utils/ApiError';
import { sendStudentCredentials } from '../utils/mailer';
import { assertSameSchool } from '../utils/security';
import { generateStudentId } from '../utils/studentId';
import { hashPassword, verifyPassword } from '../utils/password';
import { paginate, Paginated, Pagination } from '../utils/pagination';
import { cache } from '../utils/cache';
import { recordSchoolActivity } from '../utils/activity';
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
  feeExpected?: number;
}

export interface UpdateClassInput {
  className?: string;
  subjects?: string[];
  teacherEmail?: string;
  feeExpected?: number;
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
  email?: string;
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
  email?: string;
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

export interface ReviewAssessmentGroupInput {
  schoolId: string;
  classId: string;
  subject: string;
  term: string;
  session: string;
  action: 'approve' | 'reject';
  note?: string;
}

export interface BankTransferInput {
  schoolId: string;
  reference: string;
  amount: number;
  receipt?: {
    fileName: string;
    contentType: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';
    contentBase64: string;
  };
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
    feeExpected: Number(input.feeExpected ?? 0),
  });
  await recordSchoolActivity(input.schoolId, 'class.created', 'Class added', `${cls.className} added to the school curriculum.`);
  return serializeClass(cls);
}

/**
 * Updates an existing class's name, subjects and form teacher. Class names are
 * unique per school, so a rename cannot collide with another class.
 */
export async function updateClass(
  schoolId: string,
  classId: string,
  patch: UpdateClassInput,
): Promise<ClassPublic> {
  const cls = await ClassModel.findById(classId);
  if (!cls) {
    throw ApiError.notFound('Class not found.', 'CLASS_NOT_FOUND');
  }
  assertSameSchool(cls.schoolId, schoolId);

  if (patch.className !== undefined) {
    const nextName = patch.className.trim();
    if (!nextName) {
      throw ApiError.badRequest('Class name is required.', 'CLASS_NAME_REQUIRED');
    }
    const collision = await ClassModel.findOne({
      schoolId: cls.schoolId,
      className: nextName,
      _id: { $ne: cls._id },
    });
    if (collision) {
      throw ApiError.conflict('A class with this name already exists.', 'CLASS_EXISTS');
    }
    cls.className = nextName;
  }
  if (patch.subjects !== undefined) {
    const subjects = Array.from(
      new Set(patch.subjects.map((s) => String(s).trim()).filter(Boolean)),
    );
    if (subjects.length === 0) {
      throw ApiError.badRequest('At least one subject is required.', 'NO_SUBJECTS');
    }
    cls.subjects = subjects;
  }
  if (patch.teacherEmail !== undefined) {
    cls.teacherEmail = patch.teacherEmail?.toLowerCase().trim() || undefined;
  }
  if (patch.feeExpected !== undefined) {
    cls.feeExpected = Number(patch.feeExpected) || 0;
  }

  await cls.save();
  await recordSchoolActivity(schoolId, 'class.updated', 'Class updated', `${cls.className} curriculum was updated.`);
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
  // Fees are driven by the class curriculum, not free-text on the student.
  const classFee = Number(cls.feeExpected ?? 0);
  const feeExpected = classFee;
  const feeDue = Math.min(input.feeDue ?? classFee, classFee);
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
    email: (input.email || '').trim().toLowerCase(),
    address: input.address ?? '',
    feeExpected,
    feeCollected: feeExpected - feeDue,
    feeDue,
    password,
    historicalResults: [],
  });

  await cache.invalidatePrefix(`students:${input.schoolId}:`);
  const recipient = input.email || (input.contact && input.contact.includes('@') ? input.contact : '');
  if (recipient) await sendStudentCredentials(recipient, studentId, input.password, school.name);
  await recordSchoolActivity(input.schoolId, 'student.enrolled', 'Student enrolled', `${student.fullName} enrolled in ${student.currentClass}.`);
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
  if (patch.email !== undefined) student.email = (patch.email || '').trim().toLowerCase();
  if (patch.address !== undefined) student.address = patch.address;
  if (patch.feeExpected !== undefined) student.feeExpected = patch.feeExpected;
  if (patch.feeDue !== undefined) student.feeDue = patch.feeDue;
  student.feeCollected = student.feeExpected - student.feeDue;
  if (patch.password) student.password = await hashPassword(patch.password);

  await student.save();
  await cache.invalidatePrefix(`students:${schoolId}:`);
  // Deliver login credentials whenever the password is (re)generated so the
  // student/parent can sign in. The plaintext password is only used for the
  // email and is never written to logs.
  if (patch.password && student.email) {
    const school = await School.findById(schoolId);
    await sendStudentCredentials(student.email, student.studentId, patch.password, school?.name ?? 'your school');
  }
  await recordSchoolActivity(schoolId, 'student.updated', 'Student record updated', `${student.fullName}'s record was updated.`);
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
  await recordSchoolActivity(schoolId, 'fee.payment', 'Fee payment recorded', `${student.fullName}: ${amount} received.`);
  return serializeStudent(student);
}

export async function getDashboard(schoolId: string) {
  const tenantId = new Types.ObjectId(schoolId);
  const [[summary], teacherCount, pendingAssessmentCount, recentActivity] = await Promise.all([
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
    SchoolActivity.find({ schoolId: tenantId }).sort({ createdAt: -1 }).limit(8).lean(),
  ]);

  return {
    studentCount: summary?.studentCount ?? 0,
    teacherCount,
    pendingAssessmentCount,
    debtorCount: summary?.debtorCount ?? 0,
    recentActivity: recentActivity.map((item) => ({
      id: String(item._id),
      type: item.type,
      title: item.title,
      details: item.details,
      createdAt: item.createdAt,
    })),
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
export async function getStudent(schoolId: string, studentId: string): Promise<StudentPublic> {
  const student = await Student.findById(studentId);
  if (!student) throw ApiError.notFound('Student not found.', 'STUDENT_NOT_FOUND');
  assertSameSchool(student.schoolId, schoolId);
  return serializeStudent(student, true);
}

export async function listStudents(
  schoolId: string,
  currentClass: string | undefined,
  pagination: Pagination,
): Promise<Paginated<StudentPublic>> {
  const filter: Record<string, unknown> = { schoolId };
  if (currentClass) filter.currentClass = currentClass;

  const key = `students:${schoolId}:${currentClass ?? 'all'}:${pagination.page}:${pagination.limit}`;
  const cached = await cache.get<Paginated<StudentPublic>>(key);
  if (cached) return cached;
  const [rows, total] = await Promise.all([
    Student.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit),
    Student.countDocuments(filter),
  ]);
  const result = paginate(rows.map((s) => serializeStudent(s, false)), total, pagination.page, pagination.limit);
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
  await recordSchoolActivity(schoolId, 'teacher.updated', 'Teacher profile updated', `${teacher.name}'s profile was updated.`);
  return serializeTeacher(teacher);
}

/**
 * Changes a verified teacher's sign-in password. Requires the current password
 * so an admin cannot silently overwrite it without knowing it.
 */
export async function changeTeacherPassword(
  schoolId: string,
  teacherId: string,
  patch: { currentPassword: string; newPassword: string },
): Promise<void> {
  const teacher = await Teacher.findById(teacherId).select('+password');
  if (!teacher) {
    throw ApiError.notFound('Teacher not found.', 'TEACHER_NOT_FOUND');
  }
  assertSameSchool(teacher.schoolId, schoolId);

  if (!teacher.password) {
    throw ApiError.badRequest('This teacher has not activated their account yet.', 'TEACHER_NOT_ACTIVATED');
  }
  const ok = await verifyPassword(patch.currentPassword, teacher.password);
  if (!ok) {
    throw ApiError.unauthorized('Current password is incorrect.', 'INVALID_PASSWORD');
  }
  teacher.password = await hashPassword(patch.newPassword);
  await teacher.save();
  await cache.invalidatePrefix(`teachers:${schoolId}:`);
  await recordSchoolActivity(schoolId, 'teacher.updated', 'Teacher password changed', `${teacher.name}'s sign-in password was updated.`);
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
  await recordSchoolActivity(schoolId, 'teacher.removed', 'Teacher removed', `${teacher.name} was removed from staff.`);
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

export async function deleteActivity(schoolId: string, activityId: string): Promise<void> {
  const item = await SchoolActivity.findById(activityId);
  if (!item) throw ApiError.notFound('Activity not found.', 'ACTIVITY_NOT_FOUND');
  assertSameSchool(item.schoolId, schoolId);
  await item.deleteOne();
}

export async function clearActivities(schoolId: string): Promise<{ deleted: number }> {
  const result = await SchoolActivity.deleteMany({ schoolId });
  return { deleted: result.deletedCount || 0 };
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
  await recordSchoolActivity(
    input.schoolId,
    'assessment.reviewed',
    input.action === 'approve' ? 'Results approved' : 'Results returned for revision',
    `${assessment.className} · ${assessment.subject} was ${input.action === 'approve' ? 'approved' : 'returned for revision'}.`,
  );
  return serializeAssessment(assessment);
}

/**
 * Approves or rejects all assessment rows in a submitted broadsheet group
 * (class + subject + term + session) for the tenant. Tenant-scoped.
 */
export async function reviewAssessmentGroup(input: ReviewAssessmentGroupInput): Promise<{ updated: number }> {
  const cls = await ClassModel.findOne({ _id: input.classId, schoolId: input.schoolId });
  if (!cls) throw ApiError.notFound('Class not found.', 'CLASS_NOT_FOUND');

  const canonicalSubject = cls.subjects.find((s) => s.toLowerCase() === input.subject.toLowerCase()) || input.subject;
  const filter = {
    schoolId: input.schoolId,
    classId: cls._id,
    subject: canonicalSubject,
    term: input.term,
    session: input.session,
  };
  const update = input.action === 'approve'
    ? { $set: { status: 'Approved' as AssessmentStatus, approvedAt: new Date(), note: input.note ?? '' } }
    : { $set: { status: 'Revised' as AssessmentStatus, note: input.note ?? 'Returned for revision.' }, $unset: { approvedAt: 1 } };

  const result = await Assessment.updateMany(filter, update);
  const updated = result.modifiedCount ?? 0;
  if (updated === 0) {
    throw ApiError.badRequest('No assessment rows found for this submission.', 'ASSESSMENT_NOT_FOUND');
  }
  await cache.invalidatePrefix(`assessments:${input.schoolId}:`);
  await recordSchoolActivity(
    input.schoolId,
    'assessment.reviewed',
    input.action === 'approve' ? 'Results approved' : 'Results returned for revision',
    `${cls.className} · ${canonicalSubject} (${updated} rows) was ${input.action === 'approve' ? 'approved' : 'returned for revision'}.`,
  );
  return { updated };
}

/**
 * Returns full detail for an assessment submission group (all student rows +
 * saved traits for the term/session) so admin can review before deciding.
 */
export async function getAssessmentDetails(schoolId: string, assessmentId: string) {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw ApiError.notFound('Assessment not found.', 'ASSESSMENT_NOT_FOUND');
  assertSameSchool(assessment.schoolId, schoolId);

  const filter = {
    schoolId,
    classId: assessment.classId,
    subject: assessment.subject,
    term: assessment.term,
    session: assessment.session,
  };
  const rows = await Assessment.find(filter).sort({ studentId: 1 });
  const studentIds = Array.from(new Set(rows.map((r) => String(r.studentId).toUpperCase())));
  const students = studentIds.length
    ? await Student.find({ schoolId, studentId: { $in: studentIds } }).select('_id studentId fullName dob')
    : [];
  const studentById = new Map(students.map((s) => [String(s.studentId).toUpperCase(), s]));
  const refIds = students.map((s) => s._id);
  const traits = refIds.length
    ? await StudentTrait.find({ schoolId, studentRef: { $in: refIds }, term: assessment.term, session: assessment.session }).lean()
    : [];
  const traitByRef = new Map(traits.map((t: any) => [String(t.studentRef), t]));

  return {
    group: {
      id: String(assessment._id),
      classId: String(assessment.classId),
      className: assessment.className,
      subject: assessment.subject,
      teacherEmail: assessment.teacherEmail,
      term: assessment.term,
      session: assessment.session,
      status: assessment.status,
      submittedAt: assessment.submittedAt,
      principalName: assessment.principalName,
      note: assessment.note,
    },
    rows: rows.map((r) => {
      const st = studentById.get(String(r.studentId).toUpperCase());
      const tr = st ? traitByRef.get(String(st._id)) : null;
      return {
        assessmentId: String(r._id),
        studentId: r.studentId,
        studentName: st ? st.fullName : r.studentId,
        dob: st?.dob ? st.dob.toISOString().slice(0, 10) : '',
        ca1: r.ca1,
        ca2: r.ca2,
        exam: r.exam,
        total: r.total,
        grade: r.grade,
        attendance: r.attendance || '',
        remark: r.remark || '',
        status: r.status,
        affective: tr?.affective || [],
        psychomotor: tr?.psychomotor || [],
      };
    }),
  };
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
    receipt: input.receipt,
  };
  await school.save();
  await recordSchoolActivity(input.schoolId, 'subscription.payment_submitted', 'Subscription payment submitted', `Transfer reference ${input.reference.trim()} submitted for verification.`);
  return serializeSchool(school);
}

export async function getSubscription(schoolId: string) {
  const school = await School.findById(schoolId);
  if (!school) throw ApiError.notFound('School not found.', 'SCHOOL_NOT_FOUND');
  const publicSchool = serializeSchool(school);
  return {
    ...publicSchool,
    pendingPayment: school.pendingPayment ? {
      reference: school.pendingPayment.reference,
      amount: school.pendingPayment.amount,
      submittedAt: school.pendingPayment.submittedAt,
      status: school.pendingPayment.status,
      ...(school.pendingPayment.receipt ? { receipt: school.pendingPayment.receipt } : {}),
    } : undefined,
  };
}

export interface AcademicSettingInput {
  currentSession?: string;
  currentTerm?: string;
  termsPerSession?: number;
}

/**
 * Reads the tenant's school profile/settings.
 */
export async function getPendingPaymentReceipt(schoolId: string) {
  const school = await School.findById(schoolId);
  if (!school) throw ApiError.notFound('School not found.', 'SCHOOL_NOT_FOUND');
  const receipt = school.pendingPayment?.receipt;
  if (!receipt || !receipt.contentBase64) {
    throw ApiError.notFound('No receipt file found for this payment.', 'RECEIPT_NOT_FOUND');
  }
  return {
    fileName: receipt.fileName,
    contentType: receipt.contentType,
    contentBase64: receipt.contentBase64,
  };
}

export async function updateSchoolSettings(
  schoolId: string,
  patch: {
    principalName?: string;
    currentPassword?: string;
    newPassword?: string;
    principalSignature?: { fileName: string; contentType: string; url?: string; contentBase64?: string };
  },
): Promise<SchoolPublic> {
  const school = await School.findById(schoolId).select('+password');
  if (!school) throw ApiError.notFound('School not found.', 'SCHOOL_NOT_FOUND');
  if (patch.principalName !== undefined) school.principalName = patch.principalName;
  if (patch.principalSignature) {
    school.principalSignature = {
      fileName: patch.principalSignature.fileName.trim(),
      contentType: patch.principalSignature.contentType.trim(),
      ...(patch.principalSignature.url ? { url: patch.principalSignature.url } : {}),
      ...(patch.principalSignature.contentBase64 ? { contentBase64: patch.principalSignature.contentBase64 } : {}),
    };
  }
  if (patch.newPassword) {
    if (!patch.currentPassword) throw ApiError.badRequest('Current password required.', 'CURRENT_PASSWORD_REQUIRED');
    const ok = await verifyPassword(patch.currentPassword, school.password);
    if (!ok) throw ApiError.unauthorized('Current password is incorrect.', 'INVALID_PASSWORD');
    school.password = await hashPassword(patch.newPassword);
  }
  await school.save();
  return serializeSchool(school);
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
