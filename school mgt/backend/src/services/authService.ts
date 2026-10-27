import { ISchoolDocument } from '../models/School';
import { Role, AuthUser } from '../types';
import { Owner, IOwnerDocument } from '../models/Owner';
import { School } from '../models/School';
import { Teacher, ITeacherDocument } from '../models/Teacher';
import { Student, IStudentDocument } from '../models/Student';
import { ApiError } from '../utils/ApiError';
import { hashPassword, verifyPassword, isStrongPassword, PASSWORD_POLICY_MESSAGE } from '../utils/password';
import { generateOtp, verifyOtp } from '../utils/otp';
import { sendTeacherOtpEmail } from '../utils/mailer';
import { env } from '../config/env';
import {
  OwnerPublic,
  serializeOwner,
  serializeSchool,
  serializeTeacher,
  SchoolPublic,
  TeacherPublic,
} from '../utils/serialize';

/** Login input; exactly one identifier is required depending on the role. */
export interface LoginInput {
  role: Role;
  email?: string;
  studentId?: string;
  password: string;
}

export interface AuthenticatedResult<T> {
  user: T;
  authUser: AuthUser;
  tokenSubject: AuthUser;
}

export interface RegisterSchoolInput {
  name: string;
  email: string;
  password: string;
  uniqueSchoolPrefix: string;
  principalName?: string;
  planMonthly?: number;
  subscriptionStatus?: 'Active' | 'Expired';
  subscriptionExpiresAt?: Date;
}

export interface InviteTeacherInput {
  schoolId: string;
  name: string;
  email: string;
  subject?: string;
}

export interface InviteTeacherResult {
  teacher: TeacherPublic;
  /** Plaintext OTP — returned only outside production; in prod it is emailed. */
  otp?: string;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
  password: string;
}

/**
 * Registers (onboards) a new school. Called exclusively by the SaaS owner.
 * The supplied credentials become the school admin's login.
 */
export async function registerSchool(input: RegisterSchoolInput): Promise<SchoolPublic> {
  assertStrongPassword(input.password);

  const email = input.email.toLowerCase().trim();
  const prefix = input.uniqueSchoolPrefix.toUpperCase().trim();

  const [emailTaken, prefixTaken] = await Promise.all([
    School.exists({ email }),
    School.exists({ uniqueSchoolPrefix: prefix }),
  ]);
  if (emailTaken) {
    throw ApiError.conflict('A school with this admin email already exists.', 'EMAIL_IN_USE');
  }
  if (prefixTaken) {
    throw ApiError.conflict('This school prefix is already in use.', 'PREFIX_IN_USE');
  }

  const password = await hashPassword(input.password);
  const school = await School.create({
    name: input.name,
    email,
    password,
    uniqueSchoolPrefix: prefix,
    principalName: input.principalName ?? '',
    planMonthly: input.planMonthly ?? 49,
    subscriptionStatus: input.subscriptionStatus ?? 'Active',
    subscriptionExpiresAt:
      input.subscriptionExpiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return serializeSchool(school);
}

/**
 * Role-aware login for owner, admin, teacher and student.
 */
export async function login(input: LoginInput): Promise<AuthenticatedResult<OwnServerPublic>> {
  switch (input.role) {
    case 'owner':
      return loginOwner(input);
    case 'admin':
      return loginAdmin(input);
    case 'teacher':
      return loginTeacher(input);
    case 'student':
      return loginStudent(input);
    default:
      throw ApiError.badRequest('Unsupported role for login.', 'UNSUPPORTED_ROLE');
  }
}

type OwnServerPublic = OwnerPublic | SchoolPublic | TeacherPublic | { id: string; studentId: string; fullName: string; currentClass: string };

async function loginOwner(input: LoginInput): Promise<AuthenticatedResult<OwnerPublic>> {
  requireEmail(input);
  const owner = await Owner.findOne({ email: input.email!.toLowerCase() }).select('+password');
  const ok = owner ? await verifyPassword(input.password, owner.password) : false;
  if (!owner || !ok) {
    throw invalidCredentials();
  }
  const authUser: AuthUser = { id: String(owner._id), role: 'owner', email: owner.email };
  return { user: serializeOwner(owner), authUser, tokenSubject: authUser };
}

async function loginAdmin(input: LoginInput): Promise<AuthenticatedResult<SchoolPublic>> {
  requireEmail(input);
  const school = await School.findOne({ email: input.email!.toLowerCase() }).select('+password');
  const ok = school ? await verifyPassword(input.password, school.password) : false;
  if (!school || !ok) {
    throw invalidCredentials();
  }
  const authUser: AuthUser = {
    id: String(school._id),
    role: 'admin',
    schoolId: String(school._id),
    email: school.email,
  };
  return { user: serializeSchool(school), authUser, tokenSubject: authUser };
}

async function loginTeacher(input: LoginInput): Promise<AuthenticatedResult<TeacherPublic>> {
  requireEmail(input);
  const teacher = await Teacher.findOne({ email: input.email!.toLowerCase() }).select('+password');
  const ok = teacher && teacher.password ? await verifyPassword(input.password, teacher.password) : false;
  if (!teacher || !ok) {
    throw invalidCredentials();
  }
  if (!teacher.verified) {
    throw ApiError.forbidden('Account not activated. Please verify the OTP sent to your email.', 'OTP_REQUIRED');
  }
  const authUser: AuthUser = {
    id: String(teacher._id),
    role: 'teacher',
    schoolId: String(teacher.schoolId),
    email: teacher.email,
  };
  return { user: serializeTeacher(teacher), authUser, tokenSubject: authUser };
}

async function loginStudent(
  input: LoginInput,
): Promise<AuthenticatedResult<{ id: string; studentId: string; fullName: string; currentClass: string }>> {
  if (!input.studentId) {
    throw ApiError.badRequest('Student ID is required for student login.', 'STUDENT_ID_REQUIRED');
  }
  const student = await Student.findOne({ studentId: input.studentId.toUpperCase().trim() }).select('+password');
  const ok = student ? await verifyPassword(input.password, student.password) : false;
  if (!student || !ok) {
    throw invalidCredentials();
  }
  const authUser: AuthUser = {
    id: String(student._id),
    role: 'student',
    schoolId: String(student.schoolId),
    email: student.studentId,
  };
  return {
    user: {
      id: String(student._id),
      studentId: student.studentId,
      fullName: student.fullName,
      currentClass: student.currentClass,
    },
    authUser,
    tokenSubject: authUser,
  };
}

/**
 * School admin invites a teacher. Creates an unverified teacher record and an
 * OTP (hashed at rest) that must be confirmed via `verifyOtp`.
 */
export async function inviteTeacher(input: InviteTeacherInput): Promise<InviteTeacherResult> {
  const email = input.email.toLowerCase().trim();

  const [teacherTaken, ownerTaken, schoolTaken] = await Promise.all([
    Teacher.exists({ email }),
    Owner.exists({ email }),
    School.exists({ email }),
  ]);
  if (teacherTaken || ownerTaken || schoolTaken) {
    throw ApiError.conflict('This email is already registered.', 'EMAIL_IN_USE');
  }

  const { code, hash, expiresAt } = await generateOtp();
  const teacher = await Teacher.create({
    schoolId: input.schoolId,
    name: input.name,
    email,
    subject: input.subject,
    verified: false,
    otpHash: hash,
    otpExpiresAt: expiresAt,
  });

  const school = await School.findById(input.schoolId);
  await sendTeacherOtpEmail(email, code, school?.name ?? 'your school');

  // Outside production the OTP is also returned so it can be tested manually.
  const result: InviteTeacherResult = { teacher: serializeTeacher(teacher) };
  if (!env.isProduction) result.otp = code;
  return result;
}

/**
 * Validates a teacher OTP, sets their password and activates the account.
 */
export async function activateTeacherWithOtp(input: VerifyOtpInput): Promise<TeacherPublic> {
  assertStrongPassword(input.password);
  const email = input.email.toLowerCase().trim();

  const teacher = await Teacher.findOne({ email }).select('+otpHash +otpExpiresAt');
  if (!teacher) {
    throw ApiError.notFound('No pending invitation found for this email.', 'INVITE_NOT_FOUND');
  }
  if (teacher.verified) {
    throw ApiError.conflict('This teacher account is already activated.', 'ALREADY_VERIFIED');
  }

  const valid = await verifyOtp(input.otp, teacher.otpHash ?? '', teacher.otpExpiresAt);
  if (!valid) {
    throw ApiError.badRequest('Invalid or expired OTP.', 'INVALID_OTP');
  }

  teacher.password = await hashPassword(input.password);
  teacher.verified = true;
  teacher.otpHash = undefined;
  teacher.otpExpiresAt = undefined;
  await teacher.save();

  return serializeTeacher(teacher);
}

function assertStrongPassword(password: string): void {
  if (!isStrongPassword(password)) {
    throw ApiError.badRequest(PASSWORD_POLICY_MESSAGE, 'WEAK_PASSWORD');
  }
}

function requireEmail(input: LoginInput): void {
  if (!input.email) {
    throw ApiError.badRequest('Email is required for this role.', 'EMAIL_REQUIRED');
  }
}

function invalidCredentials(): ApiError {
  return ApiError.unauthorized('Invalid credentials.', 'INVALID_CREDENTIALS');
}

// Re-exported for controllers that need the school document type.
export type { ISchoolDocument, IOwnerDocument, ITeacherDocument, IStudentDocument };
