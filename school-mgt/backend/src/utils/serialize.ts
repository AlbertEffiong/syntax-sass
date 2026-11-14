import { IClassDocument } from '../models/Class';
import { ISchoolDocument } from '../models/School';
import { IStudentDocument } from '../models/Student';
import { ITeacherDocument } from '../models/Teacher';
import { IOwnerDocument } from '../models/Owner';
import { IAssessmentDocument } from '../models/Assessment';

/**
 * Whitelisted public shapes. We never spread raw Mongoose documents to clients,
 * which guarantees sensitive fields (password, otpHash, internal refs) cannot
 * leak even if `select` rules change.
 */

export interface SchoolPublic {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: string;
  subscriptionExpiresAt: Date;
  uniqueSchoolPrefix: string;
  principalName: string;
  planMonthly: number;
  restrictDebtors: boolean;
  academic: {
    currentSession: string;
    currentTerm: string;
    termsPerSession: number;
  };
  hasPendingPayment: boolean;
  pendingPayment?: {
    reference: string;
    amount: number;
    submittedAt: Date;
    status: string;
    receipt?: { fileName: string; contentType: string };
  };
  /** Principal's signature. When S3 is configured this is a public URL; otherwise a base64 data URL. */
  principalSignature?: {
    fileName: string;
    contentType: string;
    url?: string;
    contentBase64?: string;
  };
  createdAt: Date;
}

export function serializeSchool(school: ISchoolDocument): SchoolPublic {
  return {
    id: String(school._id),
    name: school.name,
    email: school.email,
    subscriptionStatus: school.subscriptionStatus,
    subscriptionExpiresAt: school.subscriptionExpiresAt,
    uniqueSchoolPrefix: school.uniqueSchoolPrefix,
    principalName: school.principalName,
    planMonthly: school.planMonthly,
    restrictDebtors: school.restrictDebtors,
    academic: {
      currentSession: school.academic?.currentSession ?? '',
      currentTerm: school.academic?.currentTerm ?? '',
      termsPerSession: school.academic?.termsPerSession ?? 3,
    },
    hasPendingPayment: !!school.pendingPayment,
    pendingPayment: school.pendingPayment ? {
      reference: school.pendingPayment.reference,
      amount: school.pendingPayment.amount,
      submittedAt: school.pendingPayment.submittedAt,
      status: school.pendingPayment.status,
      ...(school.pendingPayment.receipt ? {
        receipt: {
          fileName: school.pendingPayment.receipt.fileName,
          contentType: school.pendingPayment.receipt.contentType,
        },
      } : {}),
    } : undefined,
    ...(school.principalSignature ? {
      principalSignature: {
        fileName: school.principalSignature.fileName,
        contentType: school.principalSignature.contentType,
        ...(school.principalSignature.url ? { url: school.principalSignature.url } : {}),
        ...(school.principalSignature.contentBase64 ? { contentBase64: school.principalSignature.contentBase64 } : {}),
      },
    } : {}),
    createdAt: school.createdAt,
  };
}

export interface TeacherPublic {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  subject?: string;
  classesTaught: number;
  status: 'Active' | 'On Leave';
  verified: boolean;
  /** Teacher's signature. When S3 is configured this is a public URL; otherwise a base64 data URL. */
  signature?: {
    fileName: string;
    contentType: string;
    url?: string;
    contentBase64?: string;
  };
}

export function serializeTeacher(teacher: ITeacherDocument): TeacherPublic {
  return {
    id: String(teacher._id),
    schoolId: String(teacher.schoolId),
    name: teacher.name,
    email: teacher.email,
    subject: teacher.subject,
    classesTaught: teacher.classesTaught,
    status: teacher.status,
    verified: teacher.verified,
    ...(teacher.signature ? {
      signature: {
        fileName: teacher.signature.fileName,
        contentType: teacher.signature.contentType,
        contentBase64: teacher.signature.contentBase64,
      },
    } : {}),
  };
}

export interface ClassPublic {
  id: string;
  className: string;
  subjects: string[];
  teacherEmail?: string;
  feeExpected?: number;
}

export function serializeClass(cls: IClassDocument): ClassPublic {
  return {
    id: String(cls._id),
    className: cls.className,
    subjects: cls.subjects,
    teacherEmail: cls.teacherEmail,
    feeExpected: Number(cls.feeExpected ?? 0),
  };
}

export interface HistoricalResultPublic {
  session: string;
  term: string;
  class: string;
  subjects: Array<{ subject: string; score: number; grade: string; remark?: string }>;
  total: number;
  average: number;
  position?: number;
  classSize?: number;
  attendance?: string;
  principalName?: string;
}

export interface StudentPublic {
  id: string;
  schoolId: string;
  studentId: string;
  fullName: string;
  gender: string;
  dob?: Date;
  currentClass: string;
  guardian: string;
  contact: string;
  email: string;
  address: string;
  feeExpected: number;
  feeCollected: number;
  feeDue: number;
  historicalResults?: HistoricalResultPublic[];
}

export function serializeStudent(student: IStudentDocument, includeHistory = false): StudentPublic {
  const base: StudentPublic = {
    id: String(student._id),
    schoolId: String(student.schoolId),
    studentId: student.studentId,
    fullName: student.fullName,
    gender: student.gender,
    dob: student.dob,
    currentClass: student.currentClass,
    guardian: student.guardian,
    contact: student.contact,
    email: student.email,
    address: student.address,
    feeExpected: student.feeExpected,
    feeCollected: student.feeCollected,
    feeDue: student.feeDue,
  };
  if (includeHistory) {
    base.historicalResults = (student.historicalResults || []).map((h: any) => ({
      session: h.session, term: h.term, class: h.class,
      subjects: (h.subjects || []).map((s: any) => ({ subject: s.subject, score: Number(s.score) || 0, grade: s.grade || '', remark: s.remark || '' })),
      total: Number(h.total) || 0, average: Number(h.average) || 0,
      position: h.position, classSize: h.classSize, attendance: h.attendance || '', principalName: h.principalName || '',
    }));
  }
  return base;
}

export interface OwnerPublic {
  id: string;
  name: string;
  email: string;
}

export function serializeOwner(owner: IOwnerDocument): OwnerPublic {
  return { id: String(owner._id), name: owner.name, email: owner.email };
}

export interface AssessmentPublic {
  id: string;
  classId: string;
  className: string;
  subject: string;
  teacherEmail: string;
  studentId: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  /** Teacher-entered attendance for this student this term, e.g. "18/20". */
  attendance?: string;
  /** Teacher-entered general remark for this student this term. */
  remark?: string;
  status: string;
  principalName: string;
  term: string;
  session: string;
  submittedAt?: Date;
  approvedAt?: Date;
  note?: string;
}

export function serializeAssessment(a: IAssessmentDocument): AssessmentPublic {
  return {
    id: String(a._id),
    classId: String(a.classId),
    className: a.className,
    subject: a.subject,
    teacherEmail: a.teacherEmail,
    studentId: a.studentId,
    ca1: a.ca1,
    ca2: a.ca2,
    exam: a.exam,
    total: a.total,
    grade: a.grade,
    attendance: a.attendance || '',
    remark: a.remark || '',
    status: a.status,
    principalName: a.principalName,
    term: a.term,
    session: a.session,
    submittedAt: a.submittedAt,
    approvedAt: a.approvedAt,
    note: a.note,
  };
}

export interface StudentTraitPublic {
  studentId: string;
  term: string;
  session: string;
  affective: { trait: string; rating: string }[];
  psychomotor: { trait: string; rating: string }[];
}

export function serializeStudentTrait(trait: {
  studentId: string;
  term: string;
  session: string;
  affective: { trait: string; rating: string }[];
  psychomotor: { trait: string; rating: string }[];
}): StudentTraitPublic {
  return {
    studentId: trait.studentId,
    term: trait.term,
    session: trait.session,
    affective: trait.affective,
    psychomotor: trait.psychomotor,
  };
}
