/**
 * End-to-end integration test for the Syntax SaaS backend.
 *
 * Spins up an ephemeral in-memory MongoDB, boots the real Express app and
 * exercises the full multi-tenant lifecycle over HTTP:
 *
 *   owner -> register school -> admin login -> create class -> enroll students
 *   -> invite teacher -> OTP verify -> teacher login -> save/submit broadsheet
 *   -> admin approve -> student login -> results
 *
 * plus security assertions: IDOR isolation across tenants, subscription gating,
 * password policy, strong-password hashing and rate limiting.
 *
 * Run: npm run test:integration
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'integration-test-secret';
process.env.BCRYPT_ROUNDS = '4';
process.env.RATE_LIMIT_MAX = '10';

import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Server } from 'http';

const base = 'http://127.0.0.1:4210';

interface Res {
  status: number;
  json: any;
}

class Client {
  private cookies = new Map<string, string>();

  private cookieHeader(): string | undefined {
    if (this.cookies.size === 0) return undefined;
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }

  private store(res: { headers: { getSetCookie?: () => string[] } }): void {
    const setCookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
    for (const raw of setCookies) {
      const pair = raw.split(';')[0];
      const idx = pair.indexOf('=');
      if (idx > 0) this.cookies.set(pair.slice(0, idx), pair.slice(idx + 1));
    }
  }

  async request(method: string, path: string, body?: unknown, useCsrf = false): Promise<Res> {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers['content-type'] = 'application/json';
    const cookie = this.cookieHeader();
    if (cookie) headers['cookie'] = cookie;
    if (useCsrf) {
      const csrf = this.cookies.get('csrfToken');
      if (csrf) headers['x-csrf-token'] = csrf;
    }
    const res = await fetch(base + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    this.store(res);
    const text = await res.text();
    let json: unknown = text;
    try {
      json = JSON.parse(text);
    } catch {
      /* keep raw text */
    }
    return { status: res.status, json };
  }

  get(path: string): Promise<Res> {
    return this.request('GET', path);
  }
  post(path: string, body?: unknown): Promise<Res> {
    return this.request('POST', path, body, true);
  }
  patch(path: string, body?: unknown): Promise<Res> {
    return this.request('PATCH', path, body, true);
  }
}

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean, extra?: unknown): void {
  if (condition) {
    passed += 1;
    console.log(`PASS ${name}`);
  } else {
    failed += 1;
    console.log(`FAIL ${name}${extra === undefined ? '' : ` :: ${JSON.stringify(extra)}`}`);
  }
}

async function main(): Promise<void> {
  const mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri('syntax_saas_test');

  // Import app modules AFTER MONGO_URI is set (env.ts reads it at import time).
  const { connectDatabase, disconnectDatabase } = await import('../src/config/db');
  const { createApp } = await import('../src/app');
  const { Owner } = await import('../src/models/Owner');
  const { hashPassword } = await import('../src/utils/password');

  await connectDatabase();

  // Seed the SaaS owner directly (mirrors `npm run seed:owner`).
  const ownerPassword = 'Owner@12345';
  await Owner.create({
    name: 'Platform Owner',
    email: 'owner@syntaxsaas.io',
    password: await hashPassword(ownerPassword),
  });

  const app = createApp();
  const server: Server = app.listen(4210);

  try {
    // ---------------------------------------------------------------- owner
    const owner = new Client();
    const ownerLogin = await owner.post('/api/auth/login', {
      role: 'owner',
      email: 'owner@syntaxsaas.io',
      password: ownerPassword,
    });
    check('owner login 200', ownerLogin.status === 200, ownerLogin.json);

    // Weak password should be rejected by the policy.
    const weak = await owner.post('/api/auth/register-school', {
      name: 'Weak School',
      email: 'weak@school.edu',
      password: 'weakpass',
      uniqueSchoolPrefix: 'WK',
    });
    check(
      'weak password rejected 400',
      weak.status === 400 &&
        ['WEAK_PASSWORD', 'VALIDATION_ERROR'].includes(weak.json?.error?.code),
      weak.json,
    );

    const schoolA = await owner.post('/api/auth/register-school', {
      name: 'Bright Future Academy',
      email: 'admin@brightfuture.edu',
      password: 'Admin@12345',
      uniqueSchoolPrefix: 'BFA',
      principalName: 'Mrs. Ada Okon',
    });
    check('register school A 201', schoolA.status === 201 && schoolA.json?.data?.uniqueSchoolPrefix === 'BFA', schoolA.json);

    const schoolB = await owner.post('/api/auth/register-school', {
      name: 'Green Valley High',
      email: 'admin@greenvalley.edu',
      password: 'Admin@12345',
      uniqueSchoolPrefix: 'GVH',
      principalName: 'Mr. Ben Eze',
    });
    check('register school B 201', schoolB.status === 201, schoolB.json);

    const dashboard = await owner.get('/api/owner/dashboard');
    check('owner dashboard 200 + MRR', dashboard.status === 200 && dashboard.json?.data?.activeSchools === 2 && dashboard.json?.data?.mrr === 98, dashboard.json);

    // ---------------------------------------------------------------- admin A
    const adminA = new Client();
    const adminALogin = await adminA.post('/api/auth/login', {
      role: 'admin',
      email: 'admin@brightfuture.edu',
      password: 'Admin@12345',
    });
    check('admin A login 200', adminALogin.status === 200);
    check('login returns csrf token', typeof adminALogin.json?.data?.csrfToken === 'string');

    const classA = await adminA.post('/api/admin/classes', {
      className: 'JSS 1A',
      subjects: ['Mathematics', 'English Language'],
    });
    check('create class 201', classA.status === 201 && classA.json?.data?.subjects?.length === 2, classA.json);
    const classAId = classA.json?.data?.id;

    const studentA1 = await adminA.post('/api/admin/students', {
      fullName: 'Tunde Bakare',
      gender: 'Male',
      dob: '2012-03-14',
      currentClass: 'JSS 1A',
      password: 'Pupil@12345',
    });
    check('enroll student auto-id BFA/YYYY/001', studentA1.status === 201 && /^BFA\/\d{4}\/001$/.test(studentA1.json?.data?.studentId), studentA1.json);

    const studentA2 = await adminA.post('/api/admin/students', {
      fullName: 'Ngozi Ade',
      gender: 'Female',
      dob: '2012-07-02',
      currentClass: 'JSS 1A',
      password: 'Pupil@12345',
    });
    check('second student sequence /002', /^BFA\/\d{4}\/002$/.test(studentA2.json?.data?.studentId), studentA2.json);

    const badClass = await adminA.post('/api/admin/students', {
      fullName: 'No Class',
      gender: 'Male',
      dob: '2012-01-01',
      currentClass: 'JSS 9Z',
      password: 'Pupil@12345',
    });
    check('enroll rejects unconfigured class 400', badClass.status === 400 && badClass.json?.error?.code === 'CLASS_NOT_CONFIGURED', badClass.json);

    // ---------------------------------------------------------------- teacher A
    const invite = await adminA.post('/api/auth/invite-teacher', {
      name: 'Mr. Segun Obi',
      email: 'teacher@brightfuture.edu',
      subject: 'Mathematics',
    });
    check('invite teacher 201 + otp', invite.status === 201 && typeof invite.json?.data?.otp === 'string', invite.json);
    const otp = invite.json?.data?.otp;

    const verify = new Client();
    const verified = await verify.post('/api/auth/verify-otp', {
      email: 'teacher@brightfuture.edu',
      otp,
      password: 'Teach@12345',
    });
    check('verify otp activates teacher 200', verified.status === 200 && verified.json?.data?.verified === true, verified.json);

    const teacherA = new Client();
    const teacherLogin = await teacherA.post('/api/auth/login', {
      role: 'teacher',
      email: 'teacher@brightfuture.edu',
      password: 'Teach@12345',
    });
    check('teacher login 200', teacherLogin.status === 200, teacherLogin.json);

    const cs = await teacherA.get('/api/teacher/classes-subjects');
    check('teacher curriculum strictly synced', cs.status === 200 && cs.json?.data?.length === 1 && cs.json?.data?.[0]?.subjects?.length === 2, cs.json);

    const saveBadSubject = await teacherA.post('/api/teacher/broadsheet/save', {
      classId: classAId,
      subject: 'Astronomy',
      term: 'First Term',
      session: '2025/2026',
      entries: [{ studentId: studentA1.json.data.studentId, ca1: 10, ca2: 10, exam: 10 }],
    });
    check('reject subject outside curriculum 400', saveBadSubject.status === 400 && saveBadSubject.json?.error?.code === 'SUBJECT_NOT_IN_CURRICULUM', saveBadSubject.json);

    const save = await teacherA.post('/api/teacher/broadsheet/save', {
      classId: classAId,
      subject: 'Mathematics',
      term: 'First Term',
      session: '2025/2026',
      entries: [
        { studentId: studentA1.json.data.studentId, ca1: 18, ca2: 17, exam: 55 },
        { studentId: studentA2.json.data.studentId, ca1: 12, ca2: 10, exam: 30 },
        { studentId: 'BFA/1999/999', ca1: 20, ca2: 20, exam: 60 },
      ],
    });
    check('save broadsheet skips foreign student (saved=2)', save.status === 200 && save.json?.data?.saved === 2, save.json);

    const submit = await teacherA.post('/api/teacher/broadsheet/submit', {
      classId: classAId,
      subject: 'Mathematics',
      term: 'First Term',
      session: '2025/2026',
    });
    check('submit broadsheet 200 (submitted=2)', submit.status === 200 && submit.json?.data?.submitted === 2, submit.json);
    check('submit stamp principal', submit.json?.data?.principalName === 'Mrs. Ada Okon', submit.json);

    // ---------------------------------------------------------------- approval
    const pending = await adminA.get('/api/admin/pending-assessments');
    check('admin sees 2 pending', pending.status === 200 && pending.json?.data?.items?.length === 2, pending.json);

    const toApprove = pending.json.data.items.find((a: any) => a.studentId === studentA1.json.data.studentId);
    const approve = await adminA.post('/api/admin/pending-assessments', {
      assessmentId: toApprove.id,
      action: 'approve',
    });
    check('approve assessment 200', approve.status === 200 && approve.json?.data?.status === 'Approved', approve.json);

    // ---------------------------------------------------------------- student A
    const studentClient = new Client();
    const studentLogin = await studentClient.post('/api/student/login', {
      studentId: studentA1.json.data.studentId,
      password: 'Pupil@12345',
    });
    check('student login 200', studentLogin.status === 200, studentLogin.json);

    const results = await studentClient.get('/api/student/results');
    check('student results 200', results.status === 200, results.json);
    check('results only include approved subject', results.json?.data?.subjects?.length === 1, results.json);
    check('results computed total/grade', results.json?.data?.subjects?.[0]?.total === 90 && results.json?.data?.subjects?.[0]?.grade === 'A', results.json);
    check('results show principal + dynamic teacher', results.json?.data?.principalName === 'Mrs. Ada Okon' && results.json?.data?.subjects?.[0]?.teacherName === 'Mr. Segun Obi', results.json);

    // ---------------------------------------------------------------- IDOR
    const adminB = new Client();
    await adminB.post('/api/auth/login', {
      role: 'admin',
      email: 'admin@greenvalley.edu',
      password: 'Admin@12345',
    });

    const crossReview = await adminB.post('/api/admin/pending-assessments', {
      assessmentId: toApprove.id,
      action: 'approve',
    });
    check('IDOR: admin B cannot review school A assessment (403)', crossReview.status === 403, crossReview.json);

    const injectedSchool = await adminB.post('/api/admin/classes', {
      className: 'Hacked',
      subjects: ['Maths'],
      schoolId: schoolA.json.data.id,
    });
    check('IDOR: explicit foreign schoolId rejected (403)', injectedSchool.status === 403 && injectedSchool.json?.error?.code === 'IDOR_BLOCKED', injectedSchool.json);

    const studentsB = await adminB.get('/api/admin/students');
    check('tenant isolation: admin B sees no school A students', studentsB.status === 200 && studentsB.json?.data?.items?.length === 0, studentsB.json);

    const crossTeacher = await adminB.patch(`/api/admin/teachers/${invite.json.data.teacher.id}`, {
      name: 'Hacker',
    });
    check('IDOR: admin B cannot modify school A teacher (403)', crossTeacher.status === 403, crossTeacher.json);

    // ------------------------------------------------- subscription gating
    const lock = await owner.patch(`/api/owner/schools/${schoolA.json.data.id}/status`, { status: 'Expired' });
    check('owner locks school A 200', lock.status === 200 && lock.json?.data?.subscriptionStatus === 'Expired', lock.json);

    const lockedResults = await studentClient.get('/api/student/results');
    check('locked subscription blocks results (403)', lockedResults.status === 403 && lockedResults.json?.error?.code === 'SUBSCRIPTION_INACTIVE', lockedResults.json);

    const transfer = await adminA.post('/api/admin/subscription/bank-transfer', {
      reference: 'OPAY-REF-778812',
      amount: 49,
    });
    check('admin submits bank transfer 200', transfer.status === 200 && transfer.json?.data?.hasPendingPayment === true, transfer.json);

    const verifyPay = await owner.post('/api/owner/verify-payment', {
      schoolId: schoolA.json.data.id,
      reference: 'OPAY-REF-778812',
      amount: 49,
    });
    check('owner verifies payment reactivates 200', verifyPay.status === 200 && verifyPay.json?.data?.subscriptionStatus === 'Active', verifyPay.json);

    const unlockedResults = await studentClient.get('/api/student/results');
    check('results available again after reactivation', unlockedResults.status === 200, unlockedResults.json);

    // --------------------------------------------- new endpoints / features
    const ownerSchools = await owner.get('/api/owner/schools?page=1&limit=10');
    check('owner lists schools (paginated)', ownerSchools.status === 200 && ownerSchools.json?.data?.total === 2 && ownerSchools.json?.data?.items?.length === 2, ownerSchools.json);

    const badQuery = await owner.get('/api/owner/schools?page=abc');
    check('invalid pagination rejected 400', badQuery.status === 400, badQuery.json);

    const teacherId = invite.json.data.teacher.id;
    const teachers = await adminA.get('/api/admin/teachers');
    check('admin lists teachers (paginated)', teachers.status === 200 && teachers.json?.data?.items?.length === 1, teachers.json);

    const patched = await adminA.patch(`/api/admin/teachers/${teacherId}`, { subject: 'Further Mathematics' });
    check('admin updates teacher 200', patched.status === 200 && patched.json?.data?.subject === 'Further Mathematics', patched.json);

    const schoolSelf = await adminA.get('/api/admin/school');
    check('admin reads own school settings', schoolSelf.status === 200 && schoolSelf.json?.data?.uniqueSchoolPrefix === 'BFA', schoolSelf.json);

    const academic = await adminA.patch('/api/admin/academic-setting', {
      currentTerm: 'Second Term',
      currentSession: '2026/2027',
    });
    check('admin updates academic calendar 200', academic.status === 200 && academic.json?.data?.academic?.currentTerm === 'Second Term', academic.json);

    // NoSQL operator injection should be stripped by the sanitizer.
    const injection = await adminA.post('/api/admin/classes', {
      className: 'Injected',
      subjects: ['Maths'],
      teacherEmail: { $ne: null },
    });
    check('NoSQL operator injection blocked 400', injection.status === 400, injection.json);

    const removed = await adminA.request('DELETE', `/api/admin/teachers/${teacherId}`, undefined, true);
    check('admin removes teacher 200', removed.status === 200, removed.json);
    const teachersAfter = await adminA.get('/api/admin/teachers');
    check('teacher list empty after removal', teachersAfter.json?.data?.items?.length === 0, teachersAfter.json);

    // ---------------------------------------------------------------- misc
    const noAuth = new Client();
    const unauth = await noAuth.get('/api/owner/dashboard');
    check('unauthenticated owner route 401', unauth.status === 401, unauth.json);

    const wrongRole = await adminA.get('/api/owner/dashboard');
    check('admin cannot access owner route (403)', wrongRole.status === 403, wrongRole.json);

    // -------------------------------------------------- rate limiting (last)
    const brute = new Client();
    let lastStatus = 0;
    let lastCode = '';
    for (let i = 0; i < 12; i += 1) {
      const r = await brute.post('/api/auth/login', {
        role: 'admin',
        email: 'admin@brightfuture.edu',
        password: 'wrong-password',
      });
      lastStatus = r.status;
      lastCode = r.json?.error?.code;
    }
    check('rate limiter blocks brute force (400 RATE_LIMITED)', lastStatus === 400 && lastCode === 'RATE_LIMITED', { lastStatus, lastCode });
  } finally {
    server.close();
    await disconnectDatabase();
    await mongo.stop();
  }

  console.log(`\n${failed === 0 ? 'ALL PASS' : 'FAILURES PRESENT'} — ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
