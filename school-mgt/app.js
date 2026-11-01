/* ============================================================
   Syntax SaaS — Application logic (vanilla JS)
   Multi-tenant SaaS School Management & Result-Checking Portal
   ============================================================ */

/* ----------------------------- Icons ----------------------------- */
const P = (d, extra = "") =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;

const ic = {
  grid: P(`<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>`),
  users: P(`<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`),
  userCheck: P(`<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>`),
  book: P(`<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>`),
  wallet: P(`<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>`),
  card: P(`<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>`),
  building: P(`<rect x="4" y="2" width="16" height="20" rx="1.5"/><line x1="9" y1="6" x2="9" y2="6"/><line x1="15" y1="6" x2="15" y2="6"/><line x1="9" y1="10" x2="9" y2="10"/><line x1="15" y1="10" x2="15" y2="10"/><path d="M9 22v-4h6v4"/>`),
  trend: P(`<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>`),
  alert: P(`<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`),
  lock: P(`<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`),
  unlock: P(`<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>`),
  plus: P(`<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`),
  calendar: P(`<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`),
  download: P(`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`),
  print: P(`<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>`),
  x: P(`<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`),
  check: P(`<polyline points="20 6 9 17 4 12"/>`),
  trash: P(`<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>`),
  clock: P(`<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`),
  search: P(`<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`),
  menu: P(`<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>`),
  shield: P(`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`),
  cap: P(`<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5"/>`),
  upload: P(`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>`),
  logout: P(`<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`),
  star: P(`<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`),
  refresh: P(`<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>`),
  dollar: P(`<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`),
  chevron: P(`<polyline points="9 18 15 12 9 6"/>`),
  bell: P(`<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>`),
  pin: P(`<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14l-1.5-3V5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v9z"/>`),
  edit: P(`<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>`),
  eye: P(`<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>`),
  copy: P(`<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>`),
  key: P(`<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3 21 2m-3 0h3v3"/>`),
};

/* ----------------------------- Auth constants ----------------------------- */
const OWNER_EMAIL = "owner@syntaxsaas.io";
const OWNER_PASSWORD = "master123";
const DEFAULT_ADMIN_PASSWORD = "school123";
const DEFAULT_TEACHER_PASSWORD = "teach123";
const DEFAULT_PIN = "1234";

/* ----------------------------- Billing constants ----------------------------- */
const BANK_DETAILS = { bank: "OPay", accountNumber: "8168998060", accountName: "Albert Effiong" };

/* -------------------- Student lifecycle constants -------------------- */
const CLASS_LEVELS = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];
const JUNIOR_SUBJECTS = ["Mathematics", "English Language", "Basic Science", "Social Studies", "Civic Education", "Computer Studies", "Agricultural Science", "Business Studies"];
const SENIOR_SUBJECTS = ["Mathematics", "English Language", "Physics", "Chemistry", "Biology", "Further Mathematics", "Economics", "Government"];
const CLASS_SUBJECTS = {
  JSS1: JUNIOR_SUBJECTS.slice(0, 6),
  JSS2: JUNIOR_SUBJECTS.slice(0, 6),
  JSS3: JUNIOR_SUBJECTS.slice(0, 7),
  SS1: SENIOR_SUBJECTS.slice(0, 6),
  SS2: SENIOR_SUBJECTS.slice(0, 6),
  SS3: SENIOR_SUBJECTS.slice(0, 7),
};
const SEED_SCHOOL_PREFIX = { 1: "BFA", 2: "GVH", 3: "RPC", 4: "SIS", 5: "UGS", 6: "CMS" };
const CLASS_FORM_TEACHERS = { JSS1: "Mrs. A. Bello", JSS2: "Mr. C. Okafor", JSS3: "Mrs. E. Adeyemi", SS1: "Mr. F. Danjuma", SS2: "Mrs. G. Nwosu", SS3: "Mr. H. Ijeoma" };

/* ----------------------------- State ----------------------------- */
const state = {
  auth: {
    tier: null, // null | owner | admin | teacher | student
    tab: "owner",
    admin: { loggedIn: false, schoolId: null, email: "" },
    teacher: { loggedIn: false, teacherId: null, email: "" },
    student: { loggedIn: false, id: "", term: "First Term" },
  },
  adminSection: "dashboard",
  teacherTab: "manual",
  schools: [
    { id: 1, code: "BFA", name: "Bright Future Academy", tag: "Excellence & Integrity", address: "12 Unity Road, Lagos, Nigeria", students: 348, status: "active", renewal: "2026-10-20", plan: 49, adminEmail: "admin@brightfuture.edu", password: "school123", principal: "A. Bello" },
    { id: 2, code: "GVH", name: "Green Valley High", tag: "Knowledge & Service", address: "7 Valley Road, Abuja, Nigeria", students: 512, status: "active", renewal: "2026-10-14", plan: 49, adminEmail: "admin@greenvalley.edu", password: "school123", principal: "M. Okonkwo", pendingPayment: { reference: "OPAY/GVH/88213", amount: 49, receipt: "opay-receipt.png", submittedAt: "2026-10-08", status: "pending" } },
    { id: 3, code: "RPC", name: "Royal Pride College", tag: "Pride in Excellence", address: "3 Crown Avenue, Ibadan, Nigeria", students: 221, status: "grace", renewal: "2026-10-02", plan: 49, adminEmail: "admin@royalpride.edu", password: "school123", principal: "S. Adewale" },
    { id: 4, code: "SIS", name: "Sunrise International", tag: "Rising to Greatness", address: "21 Horizon Close, Port Harcourt, Nigeria", students: 640, status: "expired", renewal: "2026-09-18", plan: 99, adminEmail: "admin@sunrise.edu", password: "school123", principal: "E. Bassey" },
    { id: 5, code: "UGS", name: "Unity Grammar School", tag: "Together We Grow", address: "9 Concord Way, Kano, Nigeria", students: 158, status: "active", renewal: "2026-11-01", plan: 49, adminEmail: "admin@unity.edu", password: "school123", principal: "H. Yakubu" },
    { id: 6, code: "CMS", name: "Crescent Model School", tag: "Faith & Learning", address: "5 Crescent Lane, Kaduna, Nigeria", students: 403, status: "locked", renewal: "2026-09-01", plan: 49, adminEmail: "admin@crescent.edu", password: "school123", principal: "I. Salami" },
  ],
  students: buildStudents(),
  teachers: buildTeachers(),
  classes: CLASS_LEVELS.map((name, i) => ({
    name,
    teacher: CLASS_FORM_TEACHERS[name],
    subjects: CLASS_SUBJECTS[name],
    students: [44, 41, 38, 36, 40, 33][i],
  })).concat([
    { id: "CLS1", schoolId: 1, name: "JSS 1A", teacher: "Mrs. A. Bello", subjects: ["Mathematics", "English Language", "Basic Science", "Civic Education", "Computer Studies"], students: 0 },
    { id: "CLS2", schoolId: 1, name: "SS 3 Science", teacher: "Mr. F. Danjuma", subjects: ["Physics", "Chemistry", "Biology", "Further Mathematics", "Mathematics"], students: 0 },
  ]),
  fees: { collected: 12450, pending: 3180, expected: 15630 },
  pendingResults: 6,
  assessments: [
    { id: "ASM-1001", schoolId: 1, teacherId: "TCH4", teacher: "Mr. F. Danjuma", cls: "SS1", subject: "Physics", term: "First Term", submittedAt: "2026-10-09", status: "pending", note: "" },
    { id: "ASM-1002", schoolId: 1, teacherId: "TCH2", teacher: "Mr. C. Okafor", cls: "JSS2", subject: "English Language", term: "First Term", submittedAt: "2026-10-09", status: "pending", note: "" },
  ],
};
state.school = state.schools[0];

function buildStudents() {
  const seeds = [
    { schoolId: 1, name: "Chinedu Okeke", gender: "Male", dob: "2013-04-12", guardian: "Mr. & Mrs. Okeke", contact: "+234 803 111 2233", address: "12 Unity Road, Ikeja, Lagos", cls: "JSS2", entryCls: "JSS1", year: 2025, due: 0 },
    { schoolId: 1, name: "Aisha Bello", gender: "Female", dob: "2012-08-03", guardian: "Alhaji I. Bello", contact: "+234 806 445 9981", address: "7 Awolowo Way, Ikoyi, Lagos", cls: "JSS3", entryCls: "JSS2", year: 2025, due: 120 },
    { schoolId: 1, name: "Tunde Adeyemi", gender: "Male", dob: "2011-01-27", guardian: "Mrs. F. Adeyemi", contact: "+234 802 776 5540", address: "22 Bode Thomas, Surulere, Lagos", cls: "SS1", entryCls: "JSS3", year: 2025, due: 0 },
    { schoolId: 1, name: "Ngozi Eze", gender: "Female", dob: "2010-11-19", guardian: "Mr. O. Eze", contact: "+234 809 223 1178", address: "5 Emeka Close, Gbagada, Lagos", cls: "SS2", entryCls: "SS1", year: 2025, due: 250 },
    { schoolId: 1, name: "Emeka Obi", gender: "Male", dob: "2009-06-30", guardian: "Mrs. C. Obi", contact: "+234 805 991 0043", address: "18 Allen Avenue, Maryland, Lagos", cls: "SS3", entryCls: "SS2", year: 2025, due: 0 },
    { schoolId: 1, name: "Fatima Yusuf", gender: "Female", dob: "2013-09-15", guardian: "Alhaja S. Yusuf", contact: "+234 807 334 8821", address: "3 Adeniran Ogunsanya, Surulere", cls: "JSS1", entryCls: "JSS1", year: 2026, due: 0 },
    { schoolId: 1, name: "Bola Ogunleye", gender: "Male", dob: "2012-02-08", guardian: "Mr. T. Ogunleye", contact: "+234 803 556 7712", address: "9 Ogunlana Drive, Surulere", cls: "JSS2", entryCls: "JSS1", year: 2025, due: 180 },
    { schoolId: 1, name: "Kelechi Nwankwo", gender: "Male", dob: "2011-12-05", guardian: "Mrs. P. Nwankwo", contact: "+234 808 220 6690", address: "14 Ikorodu Road, Onipanu", cls: "JSS3", entryCls: "JSS1", year: 2024, due: 0 },
    { schoolId: 1, name: "Zainab Musa", gender: "Female", dob: "2010-03-22", guardian: "Alhaji M. Musa", contact: "+234 806 778 1145", address: "1 Kaduna Street, Ikeja", cls: "SS1", entryCls: "SS1", year: 2026, due: 90 },
    { schoolId: 1, name: "Samuel Johnson", gender: "Male", dob: "2009-07-11", guardian: "Mrs. E. Johnson", contact: "+234 802 119 3376", address: "30 Bourdillon Road, Ikoyi", cls: "SS2", entryCls: "SS1", year: 2025, due: 0 },
    { schoolId: 1, name: "Grace Adeleke", gender: "Female", dob: "2008-10-02", guardian: "Mr. J. Adeleke", contact: "+234 807 665 2098", address: "6 Yaba Road, Yaba", cls: "SS3", entryCls: "SS1", year: 2024, due: 200 },
    { schoolId: 1, name: "Ibrahim Sani", gender: "Male", dob: "2013-05-18", guardian: "Alhaji A. Sani", contact: "+234 805 443 7761", address: "11 Agege Motor Road, Ikeja", cls: "JSS1", entryCls: "JSS1", year: 2026, due: 0 },
    { schoolId: 2, name: "Victor Nnamdi", gender: "Male", dob: "2012-01-14", guardian: "Mr. K. Nnamdi", contact: "+234 803 220 1198", address: "4 Wuse Zone 2, Abuja", cls: "JSS2", entryCls: "JSS1", year: 2025, due: 0 },
    { schoolId: 2, name: "Halima Abubakar", gender: "Female", dob: "2010-09-09", guardian: "Mrs. A. Abubakar", contact: "+234 809 776 2231", address: "8 Gwarinpa Estate, Abuja", cls: "SS2", entryCls: "SS1", year: 2025, due: 140 },
    { schoolId: 3, name: "David Okafor", gender: "Male", dob: "2011-03-30", guardian: "Mr. P. Okafor", contact: "+234 802 998 4410", address: "15 Ring Road, Ibadan", cls: "JSS3", entryCls: "JSS1", year: 2024, due: 0 },
  ];
  const seq = {};
  return seeds.map((sd) => {
    const prefix = SEED_SCHOOL_PREFIX[sd.schoolId] || "SCH";
    const key = prefix + "/" + sd.year;
    seq[key] = (seq[key] || 0) + 1;
    const id = `${prefix}/${sd.year}/${pad3(seq[key])}`;
    const st = {
      id,
      schoolId: sd.schoolId,
      prefix,
      seq: seq[key],
      name: sd.name,
      gender: sd.gender,
      dob: sd.dob,
      guardian: sd.guardian,
      contact: sd.contact,
      address: sd.address,
      cls: sd.cls,
      entryCls: sd.entryCls,
      enrolledYear: sd.year,
      password: `${prefix}@Student${pad3(seq[key])}`,
      pin: DEFAULT_PIN,
      due: sd.due,
      paid: sd.due === 0,
      status: "Active",
      createdAt: `${sd.year}-09-01`,
    };
    st.history = buildHistory(st);
    return st;
  });
}

function buildTeachers() {
  return [
    { id: "TCH1", schoolId: 1, name: "Mrs. A. Bello", subject: "Mathematics", classes: 5, status: "Active", email: "teacher@brightfuture.edu", password: DEFAULT_TEACHER_PASSWORD, verified: true },
    { id: "TCH2", schoolId: 1, name: "Mr. C. Okafor", subject: "English Language", classes: 4, status: "Active", email: "okafor@brightfuture.edu", password: DEFAULT_TEACHER_PASSWORD, verified: true },
    { id: "TCH3", schoolId: 1, name: "Mrs. E. Adeyemi", subject: "Basic Science", classes: 3, status: "On Leave", email: "adeyemi@brightfuture.edu", password: DEFAULT_TEACHER_PASSWORD, verified: true },
    { id: "TCH4", schoolId: 1, name: "Mr. F. Danjuma", subject: "Physics", classes: 4, status: "Active", email: "danjuma@brightfuture.edu", password: DEFAULT_TEACHER_PASSWORD, verified: true },
    { id: "TCH5", schoolId: 1, name: "Mrs. G. Nwosu", subject: "Biology", classes: 3, status: "Active", email: "nwosu@brightfuture.edu", password: DEFAULT_TEACHER_PASSWORD, verified: true },
    { id: "TCH6", schoolId: 1, name: "Mr. P. Eze", subject: "Mathematics", classes: 2, status: "Active", email: "eze@brightfuture.edu", password: DEFAULT_TEACHER_PASSWORD, verified: false, otp: "482913" },
  ];
}

/* ----------------------------- Helpers ----------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function money(n) {
  return "$" + Number(n).toLocaleString("en-US");
}
function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function addDays(iso, days) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + (days || 0));
  return d.toISOString().slice(0, 10);
}
function initials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function clearFieldErrors(form) {
  if (!form || !form.querySelectorAll) return;
  form.querySelectorAll(".field.has-error").forEach((f) => f.classList.remove("has-error"));
  form.querySelectorAll("[data-err]").forEach((el) => { el.textContent = ""; });
}
function formFieldError(form, name, msg) {
  if (!form || !form.querySelector) return;
  const box = form.querySelector(`[data-err="${name}"]`);
  if (box) { box.textContent = msg; const f = box.closest(".field"); if (f) f.classList.add("has-error"); }
}

/* --------------------- Auth / tenancy helpers --------------------- */
function schoolById(id) { return state.schools.find((s) => s.id === id) || null; }
function teacherById(id) { return state.teachers.find((t) => t.id === id) || null; }
function demoSchool() { return state.schools[0]; }
function randomOtp() { return String(Math.floor(100000 + Math.random() * 900000)); }

/* --------------------- Student lifecycle helpers --------------------- */
function pad3(n) { return String(n).padStart(3, "0"); }
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < String(s).length; i++) { h ^= String(s).charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
function schoolPrefix(school) {
  if (school && school.code) return school.code;
  const words = String((school && school.name) || "School").replace(/[^A-Za-z ]/g, " ").split(/\s+/).filter(Boolean);
  const skip = new Set(["of", "the", "and", "for"]);
  const letters = words.filter((w) => !skip.has(w.toLowerCase())).map((w) => w[0].toUpperCase());
  return (letters.join("").slice(0, 4) || "SCH");
}
function genPassword(prefix) {
  const s = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let x = "";
  for (let i = 0; i < 4; i++) x += s[Math.floor(Math.random() * s.length)];
  return `${prefix || "Syntax"}@${x}`;
}
function nextStudentId(schoolId) {
  const school = schoolById(schoolId) || state.school;
  const prefix = schoolPrefix(school);
  const year = new Date().getFullYear();
  const base = `${prefix}/${year}/`;
  let max = 0;
  state.students.forEach((s) => {
    if (s.schoolId === schoolId && String(s.id).startsWith(base)) {
      const n = parseInt(String(s.id).slice(base.length), 10);
      if (!isNaN(n)) max = Math.max(max, n);
    }
  });
  return { id: `${base}${pad3(max + 1)}`, prefix, year, seq: max + 1 };
}
function studentById(id) { return state.students.find((s) => s.id === id) || null; }
function findStudentByLogin(input) {
  const raw = String(input || "").trim();
  const up = raw.toUpperCase();
  if (!up) return null;
  return state.students.find((s) => s.id.toUpperCase() === up)
    || state.students.find((s) => s.id.toUpperCase().endsWith("/" + up.padStart(3, "0")))
    || state.students.find((s) => (s.name || "").toUpperCase() === up)
    || null;
}
function ageFromDob(dob) {
  if (!dob) return "—";
  const d = new Date(dob + "T00:00:00");
  if (isNaN(d)) return "—";
  const t = new Date();
  let age = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
  return age;
}
function ordinal(n) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function buildHistory(student) {
  const rnd = rng(hashStr(student.id));
  const startIdx = Math.max(0, CLASS_LEVELS.indexOf(student.entryCls));
  const endIdx = Math.max(startIdx, CLASS_LEVELS.indexOf(student.cls));
  const classSize = 30 + Math.floor(rnd() * 15);
  const terms = ["First Term", "Second Term", "Third Term"];
  const hist = [];
  for (let y = 0; y <= endIdx - startIdx; y++) {
    const level = CLASS_LEVELS[Math.min(startIdx + y, CLASS_LEVELS.length - 1)];
    const year = student.enrolledYear + y;
    const session = `${year}/${year + 1}`;
    const subs = CLASS_SUBJECTS[level] || CLASS_SUBJECTS.JSS1;
    terms.forEach((term) => {
      const subjects = subs.map((subject) => {
        const ca = 12 + Math.floor(rnd() * 26);
        const exam = 28 + Math.floor(rnd() * 30);
        const total = ca + exam;
        return { subject, ca, exam, total, grade: gradeFor(total) };
      });
      const total = subjects.reduce((a, s) => a + s.total, 0);
      const average = +(total / subjects.length).toFixed(1);
      const attendance = { total: 116, present: 96 + Math.floor(rnd() * 21) };
      const position = 1 + Math.floor(rnd() * Math.min(classSize, subjects.length * 3));
      hist.push({
        session, year, term, cls: level, subjects, total, average,
        position, classSize, attendance, remark: remarkForGrade(gradeFor(Math.round(average))),
      });
    });
  }
  return hist;
}
function pickHistory(st, term) {
  const hist = (st && st.history) || [];
  if (!hist.length) return null;
  const matches = hist.filter((h) => h.term === term);
  return matches.length ? matches[matches.length - 1] : hist[hist.length - 1];
}
function attendanceRate(st) {
  const hist = (st && st.history) || [];
  const present = hist.reduce((a, h) => a + h.attendance.present, 0);
  const total = hist.reduce((a, h) => a + h.attendance.total, 0) || 1;
  return { present, total, pct: +((present / total) * 100).toFixed(1) };
}
function latestAverage(st) {
  const hist = (st && st.history) || [];
  return hist.length ? hist[hist.length - 1].average : 0;
}

function isSubscriptionLocked(school) {
  if (!school) return false;
  if (school.status === "expired" || school.status === "locked") return true;
  const due = new Date(school.renewal + "T00:00:00");
  if (isNaN(due)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today && school.status !== "grace";
}

function currentUser() {
  const a = state.auth;
  if (a.tier === "owner") return { role: "SaaS Owner", email: OWNER_EMAIL, initials: "SA" };
  if (a.tier === "admin") {
    const s = schoolById(a.admin.schoolId);
    return { role: "School Administrator", email: s ? s.adminEmail : "", initials: s ? initials(s.name) : "AD", org: s ? s.name : "" };
  }
  if (a.tier === "teacher") {
    const t = teacherById(a.teacher && a.teacher.teacherId);
    return { role: "Teacher", email: t ? t.email : "", initials: t ? initials(t.name) : "TR", org: t ? t.name : "" };
  }
  if (a.tier === "student") return { role: "Student / Parent", email: a.student.id || "—", initials: "SP" };
  return null;
}

const SKEY = "syntaxsaas_session_v2";
function saveSession() {
  if (typeof sessionStorage === "undefined") return;
  try {
    const a = state.auth;
    sessionStorage.setItem(SKEY, JSON.stringify({ tier: a.tier, schoolId: a.admin ? a.admin.schoolId : null, teacherId: a.teacher ? a.teacher.teacherId : null, studentId: a.student ? a.student.id : null, term: a.student ? a.student.term : null }));
  } catch (e) {}
}
function clearSession() {
  if (typeof sessionStorage === "undefined") return;
  try { sessionStorage.removeItem(SKEY); } catch (e) {}
}
function restoreSession() {
  if (typeof sessionStorage === "undefined") return;
  let s;
  try { s = JSON.parse(sessionStorage.getItem(SKEY) || "null"); } catch (e) { return; }
  if (!s || !s.tier) return;
  const a = state.auth;
  if (s.tier === "owner") {
    a.tier = "owner";
  } else if (s.tier === "admin" && schoolById(s.schoolId)) {
    a.tier = "admin";
    a.admin = { loggedIn: true, schoolId: s.schoolId, email: schoolById(s.schoolId).adminEmail };
    state.school = schoolById(s.schoolId);
  } else if (s.tier === "teacher" && teacherById(s.teacherId)) {
    const t = teacherById(s.teacherId);
    a.tier = "teacher";
    a.teacher = { loggedIn: true, teacherId: t.id, email: t.email };
    state.school = schoolById(t.schoolId) || state.school;
  } else if (s.tier === "student") {
    a.tier = "student";
    a.student = { loggedIn: true, id: s.studentId || (state.students[0] ? state.students[0].id : ""), term: s.term || "First Term" };
  }
}

const STATUS_META = {
  active: { label: "Active", cls: "badge-active" },
  grace: { label: "3-Day Grace Period", cls: "badge-grace" },
  expired: { label: "Expired", cls: "badge-expired" },
  locked: { label: "Locked", cls: "badge-locked" },
};
function statusBadge(status) {
  const m = STATUS_META[status] || STATUS_META.active;
  return `<span class="badge ${m.cls}"><span class="dot"></span>${m.label}</span>`;
}

function gradeFor(total) {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 40) return "D";
  return "F";
}
function remarkForGrade(g) {
  return { A: "Excellent", B: "Very Good", C: "Good", D: "Fair", F: "Poor" }[g] || "—";
}
function gradeBadge(g) {
  if (!g) return `<span class="cell-muted">—</span>`;
  return `<span class="badge badge-grade g-${g}">${g}</span>`;
}

/* ----------------------------- Toast ----------------------------- */
function toast(title, msg = "", type = "success") {
  const root = $("#toast-root");
  const el = document.createElement("div");
  el.className = "toast " + type;
  const icons = { success: ic.check, error: ic.alert, info: ic.bell };
  el.innerHTML = `${icons[type] || ic.bell}<div><div class="t-title">${esc(title)}</div>${msg ? `<div class="t-msg">${esc(msg)}</div>` : ""}</div>`;
  root.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity .3s, transform .3s";
    el.style.opacity = "0";
    el.style.transform = "translateX(12px)";
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

/* ----------------------------- Modal ----------------------------- */
function openModal(html) {
  $("#modal-root").innerHTML = `<div class="modal-backdrop" data-action="modal:backdrop"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
  document.body.style.overflow = "hidden";
  enhanceInputs($("#modal-root"));
}
function closeModal() {
  $("#modal-root").innerHTML = "";
  document.body.style.overflow = "";
}

/* ----------------------------- Top bar ----------------------------- */
function renderTopbar(showMenu) {
  const user = currentUser();
  const brand = `
    <div class="brand">
      ${showMenu ? `<button class="hamburger" data-action="sidebar:toggle" aria-label="Open navigation menu" aria-controls="sidebar" aria-expanded="${navOpen ? "true" : "false"}">${ic.menu}</button>` : ""}
      <div class="brand-logo">${ic.cap}</div>
      <div>
        <div class="brand-name">Syntax<span>SaaS</span></div>
        <div class="brand-sub">School Management &amp; Results</div>
      </div>
    </div>`;

  if (!user) {
    $("#topbar").innerHTML = brand + `
      <div class="topbar-auth-note">${ic.lock}<span>Secure sign-in required</span></div>`;
    return;
  }

  $("#topbar").innerHTML = brand + `
    <div class="user-chip">
      <div class="user-avatar">${esc(user.initials)}</div>
      <div class="user-meta">
        <span>${esc(user.org || user.role)}</span>
        <small>${esc(user.email)}</small>
      </div>
    </div>
    <div class="top-actions">
      <button class="btn btn-ghost btn-sm" data-action="auth:logout">${ic.logout}<span>Sign Out</span></button>
    </div>`;
}

/* ----------------------------- Root render ----------------------------- */
function render() {
  const app = $("#app");
  const a = state.auth;
  let html;
  let showMenu = false;

  if (!a.tier) {
    html = authGateway();
  } else if (a.tier === "owner") {
    html = superAdmin();
  } else if (a.tier === "admin") {
    const school = schoolById(a.admin.schoolId);
    state.school = school || state.school;
    const locked = isSubscriptionLocked(school);
    showMenu = !locked;
    html = locked ? lockScreen(school, "admin") : adminApp();
  } else if (a.tier === "teacher") {
    const t = teacherById(a.teacher && a.teacher.teacherId);
    const school = t ? schoolById(t.schoolId) : null;
    if (school) state.school = school;
    html = isSubscriptionLocked(school) ? lockScreen(school, "teacher") : teacherApp();
  } else if (a.tier === "student") {
    if (isSubscriptionLocked(state.school)) html = subscriptionBlockedNotice();
    else if (!a.student.loggedIn) html = studentLogin();
    else html = studentResult();
  }

  if (!showMenu && navOpen) setNavOpen(false);
  renderTopbar(showMenu);
  app.innerHTML = html;
  enhanceInputs(document);
  tipHide();
  window.scrollTo(0, 0);
}

/* ============================================================
   0. AUTHENTICATION GATEWAY
   ============================================================ */
const AUTH_TABS = [
  { key: "owner", label: "SaaS Owner", icon: ic.shield, short: "Owner" },
  { key: "admin", label: "School Admin", icon: ic.building, short: "Admin" },
  { key: "teacher", label: "Teacher", icon: ic.userCheck, short: "Teacher" },
  { key: "student", label: "Student / Parent", icon: ic.cap, short: "Student" },
];

function authGateway() {
  const tab = state.auth.tab;
  return `
  <div class="login-wrap">
    <div class="login-card auth-card">
      <div class="auth-brand">
        <div class="login-logo">${ic.cap}</div>
        <div>
          <h1>Sign in to Syntax SaaS</h1>
          <div class="sub">Choose your portal and authenticate securely.</div>
        </div>
      </div>

      <div class="auth-tabs" role="tablist">
        ${AUTH_TABS.map((t) => `
          <button class="auth-tab ${tab === t.key ? "active" : ""}" role="tab" data-action="auth:tab" data-tab="${t.key}">
            ${t.icon}<span>${t.label}</span>
          </button>`).join("")}
      </div>

      <div class="auth-panel">${authPanel(tab)}</div>

      <p style="text-align:center;color:var(--muted);font-size:12px;margin-top:18px">
        Protected area · <a href="#" data-action="demo:reset" style="color:var(--indigo-700);font-weight:600">Reset demo</a>
      </p>
    </div>
  </div>`;
}

function authPanel(tab) {
  if (tab === "owner") return authOwnerForm();
  if (tab === "admin") return authAdminForm();
  if (tab === "teacher") return authTeacherForm();
  return authStudentForm();
}

function authOwnerForm() {
  return `
    <form data-action="form:ownerlogin">
      <div class="field">
        <label for="ow-email">Master Admin Email</label>
        <input class="input" id="ow-email" name="email" type="email" placeholder="owner@syntaxsaas.io" value="owner@syntaxsaas.io" required />
      </div>
      <div class="field">
        <label for="ow-pass">Password</label>
        <input class="input" id="ow-pass" name="password" type="password" placeholder="••••••••" value="master123" required />
      </div>
      <button type="submit" class="btn btn-primary btn-block" style="padding:12px;margin-top:6px">${ic.shield}<span>Sign In to Platform Console</span></button>
      <div class="demo-note"><strong>Demo:</strong> ${OWNER_EMAIL} / ${OWNER_PASSWORD}</div>
    </form>`;
}

function authAdminForm() {
  return `
    <form data-action="form:adminlogin">
      <div class="field">
        <label for="ad-email">School Admin Email</label>
        <input class="input" id="ad-email" name="email" type="email" placeholder="admin@your-school.edu" value="admin@brightfuture.edu" required />
      </div>
      <div class="field">
        <label for="ad-pass">Password</label>
        <input class="input" id="ad-pass" name="password" type="password" placeholder="••••••••" value="school123" required />
      </div>
      <button type="submit" class="btn btn-primary btn-block" style="padding:12px;margin-top:6px">${ic.building}<span>Sign In to School Dashboard</span></button>
      <div class="demo-note">
        <strong>Demo:</strong> admin@brightfuture.edu / school123 (active) · admin@sunrise.edu / school123 (expired → lock screen).<br />
        School accounts are provisioned by the platform owner.
      </div>
    </form>`;
}

function authTeacherForm() {
  return `
    <form data-action="form:teacherlogin">
      <div class="field">
        <label for="tc-email">Verified Teacher Email</label>
        <input class="input" id="tc-email" name="email" type="email" placeholder="teacher@your-school.edu" value="teacher@brightfuture.edu" required />
      </div>
      <div class="field">
        <label for="tc-pass">Password</label>
        <input class="input" id="tc-pass" name="password" type="password" placeholder="••••••••" value="teach123" required />
      </div>
      <button type="submit" class="btn btn-primary btn-block" style="padding:12px;margin-top:6px">${ic.userCheck}<span>Sign In to Teacher Portal</span></button>
      <div class="demo-note">Only accounts verified by the school admin can sign in. <strong>Demo:</strong> teacher@brightfuture.edu / teach123</div>
    </form>`;
}

function authStudentForm() {
  const s = demoSchool();
  if (isSubscriptionLocked(s)) return studentBlockedPanel(s);
  const sample = state.students.find((st) => st.schoolId === s.id) || state.students[0];
  return `
    <form data-action="form:studentlogin">
      <div class="pin-row">
        <div class="field">
          <label for="s-id">Student ID</label>
          <input class="input code" id="s-id" name="sid" placeholder="e.g. ${esc(schoolPrefix(s))}/2026/001" value="${sample ? esc(sample.id) : ""}" required />
        </div>
        <div class="field">
          <label for="s-pin">Password</label>
          <input class="input" id="s-pin" name="pin" type="password" placeholder="••••••" value="1234" required />
        </div>
        <div class="field">
          <label for="s-term">Select Term</label>
          <select class="select" id="s-term" name="term">
            <option>First Term</option>
            <option>Second Term</option>
            <option>Third Term</option>
          </select>
        </div>
      </div>
      <button type="submit" class="btn btn-primary btn-block" style="padding:12px;margin-top:6px">${ic.search}<span>Check Result</span></button>
      <div class="demo-note">Checking results for <strong>${esc(s.name)}</strong>. <strong>Demo:</strong> any enrolled Student ID with the school-issued password, or PIN ${DEFAULT_PIN}.</div>
    </form>`;
}

function studentBlockedPanel(s) {
  return `<div class="notice-block"><div class="notice-icon">${ic.lock}</div><div><div class="notice-title">Result checking disabled</div><div class="notice-text">${esc(s.name)}'s subscription is inactive. Please contact the school administration.</div></div></div>`;
}


/* ============================================================
   1. SUPER ADMIN / SAAS OWNER
   ============================================================ */
function superAdmin() {
  const active = state.schools.filter((s) => s.status === "active" || s.status === "grace").length;
  const expired = state.schools.filter((s) => s.status === "expired" || s.status === "locked").length;
  const mrr = state.schools.filter((s) => s.status === "active").reduce((sum, s) => sum + s.plan, 0);
  const totalStudents = state.schools.reduce((sum, s) => sum + s.students, 0);
  const pending = state.schools.filter((s) => s.pendingPayment);

  const pendingRows = pending.map((s) => `
    <div class="list-row">
      <div style="display:flex;align-items:center;gap:12px;flex:1;flex-wrap:wrap">
        <div class="avatar" style="background:var(--amber-bg);color:var(--amber)">${initials(s.name)}</div>
        <div>
          <div class="cell-strong">${esc(s.name)}</div>
          <div class="cell-muted">Ref ${esc(s.pendingPayment.reference)} · ${money(s.pendingPayment.amount || s.plan)} · submitted ${fmtDate(s.pendingPayment.submittedAt)}${s.pendingPayment.receipt ? " · receipt " + esc(s.pendingPayment.receipt) : ""}</div>
        </div>
      </div>
      <div class="row-actions">
        <button class="btn btn-green btn-sm" data-action="super:confirmPayment" data-id="${s.id}">${ic.check}<span>Confirm Receipt</span></button>
        <button class="btn btn-danger btn-sm" data-action="super:rejectPayment" data-id="${s.id}">${ic.x}<span>Reject</span></button>
      </div>
    </div>`).join("");

  const rows = state.schools.map((s) => `
    <tr>
      <td>
        <div class="avatar-cell">
          <div class="avatar">${initials(s.name)}</div>
          <div>
            <div class="cell-strong">${esc(s.name)}</div>
            <div class="cell-muted">ID #SCH-${String(s.id).padStart(4, "0")} · ${money(s.plan)}/mo</div>
          </div>
        </div>
      </td>
      <td class="cell-strong">${s.students.toLocaleString()}</td>
      <td>
        ${statusBadge(s.status)}
        ${s.pendingPayment ? `<div class="badge badge-amber" style="margin-left:6px"><span class="dot"></span>Payment pending</div>` : ""}
      </td>
      <td class="cell-muted">${fmtDate(s.renewal)}</td>
      <td>
        <div class="row-actions">
          <button class="btn btn-soft btn-sm" data-action="super:extend" data-id="${s.id}" title="Extend subscription">${ic.clock}<span>Extend</span></button>
          <button class="btn btn-amber btn-sm" data-action="super:lock" data-id="${s.id}" title="${s.status === "locked" ? "Unlock school" : "Lock school"}">${s.status === "locked" ? ic.unlock : ic.lock}<span>${s.status === "locked" ? "Unlock" : "Lock"}</span></button>
          <button class="icon-btn danger" data-action="super:delete" data-id="${s.id}" title="Delete school">${ic.trash}</button>
        </div>
      </td>
    </tr>`).join("");

  return `
  <div class="page">
    <div class="page-head">
      <div>
        <div class="eyebrow">SaaS Owner Console</div>
        <h1>Platform Overview</h1>
        <div class="sub">Monitor every tenant, revenue and subscription health in one place.</div>
      </div>
      <div class="page-head-actions">
        <button class="btn btn-primary" data-action="super:new">${ic.plus}<span>Register New School</span></button>
      </div>
    </div>

    <div class="grid stats-grid" style="margin-bottom:22px">
      <div class="card stat">
        <div class="stat-top"><div class="stat-icon green">${ic.building}</div></div>
        <div class="stat-value">${active}</div>
        <div class="stat-label">Total Active Schools</div>
        <div class="stat-delta up">${ic.trend} <span>+2 this month</span></div>
      </div>
      <div class="card stat">
        <div class="stat-top"><div class="stat-icon blue">${ic.dollar}</div></div>
        <div class="stat-value">${money(mrr)}</div>
        <div class="stat-label">Monthly Recurring Revenue</div>
        <div class="stat-delta up">${ic.trend} <span>8.4% growth</span></div>
      </div>
      <div class="card stat">
        <div class="stat-top"><div class="stat-icon red">${ic.alert}</div></div>
        <div class="stat-value">${expired}</div>
        <div class="stat-label">Expired / Locked</div>
        <div class="stat-delta down">${ic.alert} <span>Needs follow-up</span></div>
      </div>
      <div class="card stat">
        <div class="stat-top"><div class="stat-icon purple">${ic.users}</div></div>
        <div class="stat-value">${totalStudents.toLocaleString()}</div>
        <div class="stat-label">Students Across Tenants</div>
        <div class="stat-delta up">${ic.trend} <span>Across ${state.schools.length} schools</span></div>
      </div>
    </div>

    ${pendingRows ? `
    <div class="pending-banner" style="margin-bottom:18px">
      <div class="pending-banner-icon">${ic.dollar}</div>
      <div style="flex:1">
        <div class="pending-banner-title">Bank Transfers Awaiting Verification</div>
        <div class="pending-banner-text">${pending.length} school${pending.length === 1 ? "" : "s"} submitted ${BANK_DETAILS.bank} receipt${pending.length === 1 ? "" : "s"}. Confirm below to renew their subscription instantly.</div>
        ${pendingRows}
      </div>
    </div>` : ""}

    <div class="card card-pad-0">
      <div class="card-head">
        <div>
          <h3>Registered Schools</h3>
          <div class="hint">${state.schools.length} tenants · manage subscriptions and access</div>
        </div>
        <div class="segmented">
          <button class="active">All</button>
          <button data-action="noop">Active</button>
          <button data-action="noop">Expired</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data sticky-col">
          <thead>
            <tr>
              <th>School</th><th>Students</th><th>Subscription</th><th>Renewal Date</th><th style="text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>

    <div class="legend" style="margin-top:16px">
      <span class="item"><span class="swatch" style="background:var(--green-bg)"></span> Active — full access</span>
      <span class="item"><span class="swatch" style="background:var(--amber-bg)"></span> Grace period — renew within 3 days</span>
      <span class="item"><span class="swatch" style="background:var(--red-bg)"></span> Expired — locked out</span>
    </div>
  </div>`;
}

function newSchoolModal() {
  openModal(`
    <div class="modal-head">
      <div>
        <h3>Register New School</h3>
        <div class="sub">Create a tenant, provision its admin login and set renewal tracking.</div>
      </div>
      <button class="close-x" data-action="modal:close">${ic.x}</button>
    </div>
    <form data-action="form:newschool">
      <div class="modal-body">
        <div class="field">
          <label for="ns-name">School Name</label>
          <input class="input" id="ns-name" name="name" placeholder="e.g. Victory Standard College" required />
        </div>
        <div class="field">
          <label for="ns-email">Admin Email</label>
          <input class="input" id="ns-email" name="adminEmail" type="email" placeholder="admin@school.edu" required />
          <span class="hint">This email becomes the school's login ID on the School Admin portal.</span>
        </div>
        <div class="input-group">
          <div class="field">
            <label for="ns-students">Student Count</label>
            <input class="input" id="ns-students" name="students" type="number" min="0" value="120" required />
          </div>
          <div class="field">
            <label for="ns-plan">Initial Subscription Plan</label>
            <select class="select" id="ns-plan" name="plan">
              <option value="49">Starter — $49 / mo</option>
              <option value="99">Growth — $99 / mo</option>
              <option value="149">Enterprise — $149 / mo</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label for="ns-renewal">Next Monthly Renewal Date</label>
          <input class="input" id="ns-renewal" name="renewal" type="date" value="${addDays(new Date().toISOString().slice(0, 10), 30)}" required />
          <span class="hint">The system will auto-lock this school if payment is not received by this date.</span>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" data-action="modal:close">Cancel</button>
        <button type="submit" class="btn btn-primary">${ic.check}<span>Create School</span></button>
      </div>
    </form>
  `);
}

/* ============================================================
   2. LOCK SCREEN / GATEKEEPER
   ============================================================ */
function lockScreen(school, role) {
  const s = school || state.school;
  const isAdmin = role === "admin";
  const statusLabel = s.status === "locked" ? "Locked by Platform Admin" : (isSubscriptionLocked(s) ? "Expired" : "Active");
  return `
  <div class="lock-wrap">
    <div class="lock-card">
      <div class="lock-banner">
        <div class="lock-icon">${ic.lock}</div>
        <h1>Subscription Expired</h1>
        <p>Your school's monthly subscription has ended. Please renew to restore student result checking and admin access.</p>
      </div>
      <div class="lock-body">
        <div class="lock-meta">
          <div><div class="k">School</div><div class="v">${esc(s.name)}</div></div>
          <div><div class="k">Status</div><div class="v" style="color:var(--red)">${statusLabel}</div></div>
          <div><div class="k">Due Date</div><div class="v">${fmtDate(s.renewal)}</div></div>
        </div>

        ${s.pendingPayment ? `
          <div class="pending-banner" style="margin:0 0 16px">
            <div class="pending-banner-icon">${ic.clock}</div>
            <div style="flex:1">
              <div class="pending-banner-title">Payment Pending Verification</div>
              <div class="pending-banner-text">Your bank transfer${s.pendingPayment.reference ? " (" + esc(s.pendingPayment.reference) + ")" : ""} was submitted on ${fmtDate(s.pendingPayment.submittedAt)}. The Syntax SaaS owner will verify and reactivate your account shortly.</div>
            </div>
          </div>` : ""}

        ${isAdmin ? `
          <div class="pay-method-label">Bank Transfer — the only payment method</div>
          <div class="bank-card bank-card-lg">
            <div class="bank-head">
              <div class="bank-logo">${ic.wallet}</div>
              <div>Pay via <strong>${esc(BANK_DETAILS.bank)}</strong></div>
              <span class="bank-verified">${ic.shield} Verified account</span>
            </div>
            <div class="bank-inner">
              <div class="bank-row"><span class="cell-muted">Bank Name</span><strong style="font-size:16px">${esc(BANK_DETAILS.bank)}</strong></div>
              <div class="bank-row">
                <span class="cell-muted">Account Number</span>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  <strong class="code" style="font-size:19px;letter-spacing:.16em">${BANK_DETAILS.accountNumber}</strong>
                  <button type="button" class="btn btn-soft btn-sm" data-action="bank:copy" data-acct="${BANK_DETAILS.accountNumber}">${ic.copy}<span>Copy Account Number</span></button>
                </div>
              </div>
              <div class="bank-row"><span class="cell-muted">Account Name</span><strong style="font-size:16px">${esc(BANK_DETAILS.accountName)}</strong></div>
            </div>
          </div>
          <button class="btn renew-btn bank-btn" data-action="bank:lockRenew">${ic.check}<span>Confirm Transfer / Submit Receipt</span></button>
          <div class="cell-muted" style="margin-top:10px;font-size:12px;text-align:center">Transfer ${money(s.plan)} to the account above, then submit your reference or receipt — the Syntax SaaS owner verifies and reactivates your account.</div>
        ` : `
          <div class="notice-block" style="margin-bottom:18px">
            <div class="notice-icon">${ic.alert}</div>
            <div><div class="notice-title">Access temporarily suspended</div><div class="notice-text">Only the school administrator can renew the subscription and restore access for staff and students.</div></div>
          </div>
          ${s.pendingPayment ? "" : `
          <div class="pay-method-label">Subscription is payable by Bank Transfer only</div>
          <div class="bank-card">
            <div class="bank-head"><div class="bank-logo">${ic.wallet}</div><div>Pay via <strong>${esc(BANK_DETAILS.bank)}</strong></div></div>
            <div class="bank-inner">
              <div class="bank-row"><span class="cell-muted">Bank Name</span><strong>${esc(BANK_DETAILS.bank)}</strong></div>
              <div class="bank-row">
                <span class="cell-muted">Account Number</span>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  <strong class="code" style="font-size:17px;letter-spacing:.14em">${BANK_DETAILS.accountNumber}</strong>
                  <button type="button" class="btn btn-soft btn-sm" data-action="bank:copy" data-acct="${BANK_DETAILS.accountNumber}">${ic.copy}<span>Copy Account Number</span></button>
                </div>
              </div>
              <div class="bank-row"><span class="cell-muted">Account Name</span><strong>${esc(BANK_DETAILS.accountName)}</strong></div>
            </div>
          </div>`}
        `}

        <div style="display:flex;gap:10px;justify-content:center;margin-top:18px;flex-wrap:wrap">
          <button class="btn btn-ghost" data-action="auth:logout">${ic.logout}<span>Sign Out</span></button>
          <span class="pay-chip">${ic.shield} Need help? support@syntaxsaas.io</span>
        </div>
      </div>
    </div>
  </div>`;
}

function subscriptionBlockedNotice() {
  const s = state.school;
  return `
  <div class="lock-wrap">
    <div class="lock-card" style="max-width:560px">
      <div class="lock-banner" style="background:linear-gradient(135deg,#b45309,#d97706)">
        <div class="lock-icon">${ic.alert}</div>
        <h1>Result Checking Disabled</h1>
        <p>${esc(s.name)}'s subscription is currently inactive. Result checking is unavailable until the school administration renews the subscription.</p>
      </div>
      <div class="lock-body">
        <div class="notice-block">
          <div class="notice-icon">${ic.bell}</div>
          <div><div class="notice-title">Please contact your school administration</div><div class="notice-text">Once your school renews its Syntax SaaS subscription, you will be able to check and print results again.</div></div>
        </div>
        <div style="text-align:center;margin-top:18px">
          <button class="btn btn-ghost" data-action="auth:logout">${ic.logout}<span>Back to Portal</span></button>
        </div>
      </div>
    </div>
  </div>`;
}

/* ============================================================
   3. SCHOOL ADMIN / PRINCIPAL DASHBOARD
   ============================================================ */
const ADMIN_NAV = [
  { key: "dashboard", label: "Dashboard", icon: ic.grid },
  { key: "students", label: "Manage Students", icon: ic.users },
  { key: "teachers", label: "Teachers", icon: ic.userCheck },
  { key: "classes", label: "Classes & Subjects", icon: ic.book },
  { key: "fees", label: "Fee Management", icon: ic.wallet },
  { key: "subscription", label: "Subscription Status", icon: ic.card },
];

function adminApp() {
  const s = state.school;
  const body = {
    dashboard: adminDashboard,
    students: adminStudents,
    teachers: adminTeachers,
    classes: adminClasses,
    fees: adminFees,
    subscription: adminSubscription,
  }[state.adminSection]();

  return `
  <div class="sidebar-backdrop" data-action="sidebar:close"></div>
  <div class="layout">
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="name">${esc(s.name)}</div>
        <div class="meta">Administrator · ${statusBadge(s.status).replace(/<span class="dot"><\/span>/, "")}</div>
      </div>
      <div class="nav-label">Main Menu</div>
      <nav class="sidebar-nav">
        ${ADMIN_NAV.map((n) => `
          <button class="nav-item ${state.adminSection === n.key ? "active" : ""}" data-action="admin:nav" data-section="${n.key}">
            ${n.icon}<span>${n.label}</span>
            ${n.key === "dashboard" && pendingAssessments().length ? `<span class="nav-badge">${pendingAssessments().length}</span>` : ""}
          </button>`).join("")}
      </nav>
      <div class="nav-label">Account</div>
      <div class="sidebar-nav">
        <button class="nav-item" data-action="demo:expire">${ic.alert}<span>Simulate Expiry</span></button>
        <button class="nav-item" data-action="auth:logout">${ic.logout}<span>Sign Out</span></button>
      </div>
    </aside>
    <section class="content"><div class="content-inner">${body}</div></section>
  </div>`;
}

function graceBanner() {
  if (state.school.status !== "grace") return "";
  return `<div class="card" style="border-color:#fde68a;background:var(--amber-bg);display:flex;gap:12px;align-items:center;margin-bottom:20px">
    <span style="color:var(--amber)">${ic.alert}</span>
    <div style="font-size:13.5px;color:var(--amber)"><strong>Grace period active.</strong> Your subscription expires in 3 days. Renew to avoid losing access on ${fmtDate(state.school.renewal)}.</div>
    <button class="btn btn-amber btn-sm" data-action="admin:nav" data-section="subscription" style="margin-left:auto">Renew</button>
  </div>`;
}

function adminDashboard() {
  const s = state.school;
  const collected = state.fees.collected;
  const pct = Math.round((collected / state.fees.expected) * 100);
  const debtors = state.students.filter((st) => st.schoolId === state.school.id && st.due > 0).length;

  const activity = [
    { t: "Mr. C. Okafor submitted JSS2 Mathematics scores", w: "12 min ago", icon: ic.book, cls: "blue" },
    { t: `Fees payment received — ${money(180)} from Blessing Uche`, w: "48 min ago", icon: ic.wallet, cls: "green" },
    { t: "New student enrolled into SS1", w: "2 hours ago", icon: ic.users, cls: "purple" },
    { t: "Result approval pending for JSS3 Basic Science", w: "5 hours ago", icon: ic.clock, cls: "amber" },
  ];

  return `
    ${graceBanner()}
    <div class="page-head">
      <div>
        <div class="eyebrow">Administrator</div>
        <h1>Welcome back, Principal</h1>
        <div class="sub">Here is what is happening at ${esc(s.name)} today.</div>
      </div>
      <div class="page-head-actions">
        <button class="btn btn-ghost" data-action="admin:nav" data-section="fees">${ic.wallet}<span>Record Payment</span></button>
        <button class="btn btn-primary" data-action="admin:nav" data-section="students">${ic.plus}<span>Add Student</span></button>
      </div>
    </div>

    <div class="grid stats-grid" style="margin-bottom:20px">
      <div class="card stat"><div class="stat-top"><div class="stat-icon blue">${ic.users}</div></div><div class="stat-value">${s.students || 348}</div><div class="stat-label">Total Students</div><div class="stat-delta up">${ic.trend} <span>+12 this term</span></div></div>
      <div class="card stat"><div class="stat-top"><div class="stat-icon purple">${ic.userCheck}</div></div><div class="stat-value">24</div><div class="stat-label">Total Teachers</div><div class="stat-delta up"><span>2 on leave</span></div></div>
      <div class="card stat"><div class="stat-top"><div class="stat-icon green">${ic.wallet}</div></div><div class="stat-value">${money(collected)}</div><div class="stat-label">Fees Collected</div><div class="stat-delta up">${ic.trend} <span>${pct}% of expected</span></div></div>
      <div class="card stat"><div class="stat-top"><div class="stat-icon amber">${ic.clock}</div></div><div class="stat-value">${pendingAssessments().length}</div><div class="stat-label">Pending Results Approval</div><div class="stat-delta down"><span>Awaiting your review</span></div></div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="card-head" style="padding:0 0 14px;border-bottom:0">
          <div><h3>Fee Collection</h3><div class="hint">Term progress against expected revenue</div></div>
          <span class="badge badge-info">${pct}%</span>
        </div>
        <div class="progress"><i style="width:${pct}%"></i></div>
        <div class="grid grid-3" style="margin-top:18px;gap:12px">
          <div><div class="mini-title">Collected</div><div style="font-weight:800;font-size:19px;color:var(--green)">${money(state.fees.collected)}</div></div>
          <div><div class="mini-title">Pending</div><div style="font-weight:800;font-size:19px;color:var(--red)">${money(state.fees.pending)}</div></div>
          <div><div class="mini-title">Expected</div><div style="font-weight:800;font-size:19px">${money(state.fees.expected)}</div></div>
        </div>
      </div>

      <div class="card">
        <div class="card-head" style="padding:0 0 14px;border-bottom:0">
          <div><h3>Debtors Control</h3><div class="hint">Result access policy</div></div>
        </div>
        <label class="switch">
          <input type="checkbox" data-action="toggle:debtors" ${s.restrictDebtors ? "checked" : ""} />
          <span class="switch-track"></span>
          <span class="switch-text">
            <strong>Restrict result viewing for debtors</strong>
            <small>${s.restrictDebtors ? `Blocked — ${debtors} students with unpaid fees cannot view results` : "Off — all students can view results regardless of fees"}</small>
          </span>
        </label>
      </div>
    </div>

    <div class="card" style="margin-top:20px">
      <div class="card-head" style="padding:0 0 8px;border-bottom:0">
        <div><h3>Assessments Pending Approval</h3><div class="hint">Submitted by teachers — grade them before they reach student report cards</div></div>
        <span class="badge badge-amber">${pendingAssessments().length} pending</span>
      </div>
      ${pendingAssessments().length ? pendingAssessments().map((a) => `
        <div class="list-row">
          <div style="display:flex;align-items:center;gap:12px;flex:1;flex-wrap:wrap">
            <div class="stat-icon amber" style="width:38px;height:38px;border-radius:10px">${ic.book}</div>
            <div>
              <div class="cell-strong">${esc(a.cls)} · ${esc(a.subject)}</div>
              <div class="cell-muted">${esc(a.teacher)} · ${esc(a.term)} · submitted ${fmtDate(a.submittedAt)}</div>
            </div>
          </div>
          <div class="row-actions">
            <button class="btn btn-green btn-sm" data-action="assess:approve" data-id="${esc(a.id)}">${ic.check}<span>Approve</span></button>
            <button class="btn btn-amber btn-sm" data-action="assess:revise" data-id="${esc(a.id)}">${ic.refresh}<span>Request Revision</span></button>
          </div>
        </div>`).join("") : `
        <div class="cell-muted" style="padding:22px;text-align:center">All caught up — no assessments awaiting review. 🎉</div>`}
    </div>

    <div class="card" style="margin-top:20px">
      <div class="card-head" style="padding:0 0 8px;border-bottom:0"><div><h3>Recent Activity</h3><div class="hint">Latest actions across your school</div></div></div>
      ${activity.map((a) => `
        <div class="list-row">
          <div style="display:flex;align-items:center;gap:12px">
            <div class="stat-icon ${a.cls}" style="width:38px;height:38px;border-radius:10px">${a.icon}</div>
            <div style="font-size:13.5px" class="cell-strong">${esc(a.t)}</div>
          </div>
          <span class="cell-muted">${a.w}</span>
        </div>`).join("")}
    </div>
  `;
}

function adminStudents() {
  const list = state.students.filter((s) => s.schoolId === state.school.id);
  const owing = list.filter((s) => s.due > 0);
  const genderText = (g) => (g === "Female" ? "Female" : g === "Male" ? "Male" : "—");
  const rows = list.map((st) => `
    <tr data-name="${esc((st.name + " " + st.id + " " + st.guardian + " " + st.contact).toLowerCase())}" data-cls="${esc(st.cls)}" data-owed="${st.due > 0 ? 1 : 0}">
      <td><div class="avatar-cell"><div class="avatar" style="background:linear-gradient(135deg,#6366f1,#3b82f6)">${initials(st.name)}</div><div><div class="cell-strong">${esc(st.name)}</div><div class="cell-muted code">${esc(st.id)}</div></div></div></td>
      <td><span class="badge badge-info">${esc(st.cls)}</span></td>
      <td>${genderText(st.gender)}</td>
      <td><div class="cell-strong" style="font-weight:600;font-size:13px">${esc(st.guardian)}</div><div class="cell-muted">${esc(st.contact)}</div></td>
      <td>${st.due > 0 ? `<span class="badge badge-expired">Owing ${money(st.due)}</span>` : `<span class="badge badge-active"><span class="dot"></span>Cleared</span>`}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" data-action="student:view" data-id="${esc(st.id)}" title="View profile">${ic.eye}</button>
          <button class="icon-btn" data-action="student:edit" data-id="${esc(st.id)}" title="Edit details">${ic.edit}</button>
          <button class="icon-btn" data-action="student:resetPassword" data-id="${esc(st.id)}" title="Reset password">${ic.key}</button>
          <button class="icon-btn danger" data-action="student:delete" data-id="${esc(st.id)}" title="Delete student">${ic.trash}</button>
        </div>
      </td>
    </tr>`).join("");

  const kpi = (label, value, icon, tone) => `
    <div class="card stat-card" style="border-left:3px solid ${tone}">
      <div class="stat-icon" style="background:${tone}1a;color:${tone}">${icon}</div>
      <div><div class="stat-label">${label}</div><div class="stat-value" style="font-size:24px">${value}</div></div>
    </div>`;

  return `
    <div class="page-head">
      <div><h1>Manage Students</h1><div class="sub">Enrolment, biodata and multi-year academic records for ${esc(state.school.name)}.</div></div>
      <div class="page-head-actions"><button class="btn btn-primary" data-action="student:new">${ic.plus}<span>Add New Student</span></button></div>
    </div>

    <div class="stats-grid" style="margin-bottom:18px">
      ${kpi("Total Students", list.length, ic.users, "#6366f1")}
      ${kpi("Fees Cleared", list.length - owing.length, ic.check, "#16a34a")}
      ${kpi("Owing Fees", owing.length, ic.alert, "#dc2626")}
      ${kpi("Awaiting Results", state.pendingResults, ic.clock, "#d97706")}
    </div>

    <div class="card" style="margin-bottom:18px">
      <div class="toolbar">
        <div class="field" style="flex:2 1 260px">
          <label for="stu-search">Search</label>
          <input class="input" id="stu-search" data-filter="students" type="search" placeholder="Search name, student ID, guardian or contact…" />
        </div>
        <div class="field">
          <label for="stu-class">Class</label>
          <select class="select" id="stu-class" data-filter="students">
            <option value="">All Classes (JSS1–SS3)</option>
            ${CLASS_LEVELS.map((c) => `<option value="${c}">${c}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="stu-fee">Fee Status</label>
          <select class="select" id="stu-fee" data-filter="students">
            <option value="">All</option>
            <option value="unpaid">Owing</option>
            <option value="paid">Cleared</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card card-pad-0">
      <div class="card-head"><div><h3>Student Register</h3><div class="hint" id="stu-count">${list.length} students</div></div>
        <div class="hint" style="display:flex;align-items:center;gap:6px">${ic.shield}<span>IDs are prefixed with <strong>${esc(schoolPrefix(state.school))}</strong></span></div>
      </div>
      <div class="table-wrap">
        <table class="data sticky-col">
          <thead><tr><th>Student</th><th>Class</th><th>Gender</th><th>Parent / Guardian</th><th>Fee Status</th><th style="text-align:right">Actions</th></tr></thead>
          <tbody id="student-rows">${rows}</tbody>
        </table>
      </div>
      <div class="empty" id="stu-empty" style="display:none">${ic.search}<div>No students match your filters.</div></div>
    </div>`;
}

function applyStudentsFilter() {
  const q = ($("#stu-search")?.value || "").toLowerCase().trim();
  const cls = $("#stu-class")?.value || "";
  const fee = $("#stu-fee")?.value || "";
  let shown = 0, total = 0;
  $$("#student-rows tr").forEach((tr) => {
    total++;
    const name = tr.getAttribute("data-name") || "";
    const c = tr.getAttribute("data-cls") || "";
    const owed = tr.getAttribute("data-owed") === "1";
    const match = (!q || name.includes(q)) && (!cls || c === cls) && (!fee || (fee === "unpaid" ? owed : !owed));
    tr.style.display = match ? "" : "none";
    if (match) shown++;
  });
  const count = $("#stu-count");
  if (count) count.textContent = `${shown} of ${total} students shown`;
  const empty = $("#stu-empty");
  if (empty) empty.style.display = shown ? "none" : "block";
}

function studentModal(st) {
  const editing = !!st;
  const prefix = schoolPrefix(state.school);
  const gen = editing ? null : nextStudentId(state.school.id);
  const autoPass = editing ? (st.password || "") : genPassword(prefix);
  st = st || { name: "", gender: "", dob: "", guardian: "", contact: "", address: "", cls: CLASS_LEVELS[0], due: 0 };
  const err = (name) => `<span class="field-err" data-err="${name}"></span>`;
  openModal(`
    <div class="modal-head">
      <div><h3>${editing ? "Edit Student" : "Add New Student"}</h3><div class="sub">${editing ? "Update this student's biodata and record." : "Enrol a new student — ID and password are generated automatically."}</div></div>
      <button class="close-x" data-action="modal:close">${ic.x}</button>
    </div>
    <form data-action="form:student" data-id="${editing ? esc(st.id) : ""}">
      <div class="modal-body">
        ${editing ? "" : `<div class="genbanner">${ic.shield}<div><strong>New credentials:</strong> Student ID <code>${esc(gen.id)}</code> · Password <code>${esc(autoPass)}</code></div></div>`}
        <div class="field">
          <label for="st-name">Full Name</label>
          <input class="input" id="st-name" name="name" value="${esc(st.name)}" placeholder="e.g. Chinedu Okeke" />
          ${err("name")}
        </div>
        <div class="input-group">
          <div class="field">
            <label for="st-gender">Gender</label>
            <select class="select" id="st-gender" name="gender">
              <option value="" ${!st.gender ? "selected" : ""}>Select…</option>
              <option ${st.gender === "Male" ? "selected" : ""}>Male</option>
              <option ${st.gender === "Female" ? "selected" : ""}>Female</option>
            </select>
            ${err("gender")}
          </div>
          <div class="field">
            <label for="st-dob">Date of Birth</label>
            <input class="input" id="st-dob" name="dob" type="date" value="${esc(st.dob || "")}" max="${new Date().toISOString().slice(0, 10)}" />
            ${err("dob")}
          </div>
        </div>
        <div class="input-group">
          <div class="field">
            <label for="st-guardian">Parent / Guardian</label>
            <input class="input" id="st-guardian" name="guardian" value="${esc(st.guardian)}" placeholder="e.g. Mr. &amp; Mrs. Okeke" />
            ${err("guardian")}
          </div>
          <div class="field">
            <label for="st-contact">Guardian Contact</label>
            <input class="input" id="st-contact" name="contact" value="${esc(st.contact || "")}" placeholder="e.g. +234 803 111 2233" />
            ${err("contact")}
          </div>
        </div>
        <div class="input-group">
          <div class="field">
            <label for="st-cls">Current Class</label>
            <select class="select" id="st-cls" name="cls">${CLASS_LEVELS.map((c) => `<option ${c === st.cls ? "selected" : ""}>${c}</option>`).join("")}</select>
            <span class="hint">JSS1–JSS3 &amp; SS1–SS3</span>
          </div>
          <div class="field">
            <label for="st-id">Student ID</label>
            <input class="input code" id="st-id" name="id" value="${esc(editing ? st.id : gen.id)}" readonly />
            <span class="hint">Prefix <strong>${esc(prefix)}</strong> · school-specific</span>
          </div>
        </div>
        <div class="field">
          <label for="st-address">Residential Address</label>
          <input class="input" id="st-address" name="address" value="${esc(st.address || "")}" placeholder="House number, street, city" />
          ${err("address")}
        </div>
        <div class="input-group">
          <div class="field">
            <label for="st-fee">Fee Status</label>
            <select class="select" id="st-fee" name="fee" data-action="student:feeToggle">
              <option value="paid" ${st.due === 0 ? "selected" : ""}>Fees Cleared</option>
              <option value="owing" ${st.due > 0 ? "selected" : ""}>Owing</option>
            </select>
          </div>
          <div class="field">
            <label for="st-due">Amount Due</label>
            <input class="input" id="st-due" name="due" type="number" min="0" value="${st.due || 0}" ${st.due === 0 ? "disabled" : ""} />
          </div>
        </div>
        <div class="field">
          <label for="st-pass">Portal Password</label>
          <div class="input-inline">
            <input class="input code" id="st-pass" name="password" value="${esc(autoPass)}" />
            <button type="button" class="btn btn-soft btn-sm" data-action="student:genPass" data-target="st-pass" data-prefix="${esc(prefix)}">${ic.refresh}<span>Generate</span></button>
          </div>
          ${err("password")}
          <span class="hint">Used with the Student ID to sign in to the Student/Parent portal.</span>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" data-action="modal:close">Cancel</button>
        <button type="submit" class="btn btn-primary">${ic.check}<span>${editing ? "Save Changes" : "Enrol Student"}</span></button>
      </div>
    </form>
  `);
}

function studentProfileModal(st) {
  if (!st) return;
  const att = attendanceRate(st);
  const hist = (st.history || []).slice().reverse();
  const histRows = hist.length ? hist.map((h) => `
    <tr>
      <td>${esc(h.session)}</td>
      <td>${esc(h.term)}</td>
      <td><span class="badge badge-info">${esc(h.cls)}</span></td>
      <td>${h.subjects.length}</td>
      <td class="cell-strong">${h.average}%</td>
      <td>${ordinal(h.position)} / ${h.classSize}</td>
      <td>${h.attendance.present}/${h.attendance.total}</td>
      <td><span class="badge ${h.average >= 60 ? "badge-active" : h.average >= 45 ? "badge-grace" : "badge-expired"}">${esc(h.remark)}</span></td>
    </tr>`).join("") : `<tr><td colspan="8" class="cell-muted" style="text-align:center;padding:18px">No academic records yet.</td></tr>`;
  openModal(`
    <div class="modal-head">
      <div><h3>Student Profile</h3><div class="sub">${esc(st.id)} · Enrolled ${st.enrolledYear}</div></div>
      <button class="close-x" data-action="modal:close">${ic.x}</button>
    </div>
    <div class="modal-body">
      <div class="profile-hero">
        <div class="profile-avatar">${initials(st.name)}</div>
        <div style="flex:1">
          <div class="profile-name">${esc(st.name)}</div>
          <div class="profile-tags">
            <span class="badge badge-info">${esc(st.cls)}</span>
            <span class="badge badge-muted">${esc(st.gender || "—")}</span>
            <span class="badge badge-active"><span class="dot"></span>${esc(st.status || "Active")}</span>
          </div>
        </div>
        <div class="profile-id"><div class="k">Student ID</div><div class="v code">${esc(st.id)}</div></div>
      </div>

      <div class="cred-box">
        <div class="cred-head">${ic.key}<span>Portal credentials</span></div>
        <div class="cred-row"><span>Login ID</span><code>${esc(st.id)}</code></div>
        <div class="cred-row"><span>Password</span><code>${esc(st.password || "—")}</code></div>
        <div class="hint">Share these with the student/parent to access the Student/Parent portal.</div>
        <button class="btn btn-soft btn-sm" data-action="student:resetPassword" data-id="${esc(st.id)}">${ic.key}<span>Reset Password</span></button>
      </div>

      <h4 class="section">Biodata</h4>
      <div class="profile-grid">
        <div class="profile-item"><span class="k">Date of Birth</span><span class="v">${st.dob ? esc(fmtDate(st.dob)) : "—"}</span></div>
        <div class="profile-item"><span class="k">Age</span><span class="v">${ageFromDob(st.dob)} yrs</span></div>
        <div class="profile-item"><span class="k">Gender</span><span class="v">${esc(st.gender || "—")}</span></div>
        <div class="profile-item"><span class="k">Class Level</span><span class="v">${esc(st.cls)}</span></div>
        <div class="profile-item"><span class="k">Parent / Guardian</span><span class="v">${esc(st.guardian || "—")}</span></div>
        <div class="profile-item"><span class="k">Guardian Contact</span><span class="v">${esc(st.contact || "—")}</span></div>
        <div class="profile-item span-2"><span class="k">Residential Address</span><span class="v">${esc(st.address || "—")}</span></div>
        <div class="profile-item"><span class="k">Enrolled</span><span class="v">${st.enrolledYear} (${esc(st.entryCls || st.cls)})</span></div>
        <div class="profile-item"><span class="k">Fee Status</span><span class="v">${st.due > 0 ? "Owing " + money(st.due) : "Cleared"}</span></div>
      </div>

      <h4 class="section">Attendance &amp; Performance</h4>
      <div class="mini-stats">
        <div class="mini-stat"><div class="k">Latest Average</div><div class="v">${latestAverage(st)}%</div></div>
        <div class="mini-stat"><div class="k">Attendance</div><div class="v">${att.pct}%</div></div>
        <div class="mini-stat"><div class="k">Terms Recorded</div><div class="v">${(st.history || []).length}</div></div>
        ${hist[0] ? `<div class="mini-stat"><div class="k">Latest Position</div><div class="v">${ordinal(hist[0].position)} / ${hist[0].classSize}</div></div>` : ""}
      </div>

      <h4 class="section">Multi-Year Academic Record</h4>
      <div class="table-wrap">
        <table class="data history-table sticky-col">
          <thead><tr><th>Session</th><th>Term</th><th>Class</th><th>Subjects</th><th>Average</th><th>Position</th><th>Attendance</th><th>Remark</th></tr></thead>
          <tbody>${histRows}</tbody>
        </table>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-ghost" data-action="modal:close">Close</button>
      <button class="btn btn-primary" data-action="student:edit" data-id="${esc(st.id)}">${ic.edit}<span>Edit Details</span></button>
    </div>
  `);
}

function resetPasswordModal(st) {
  if (!st) return;
  openModal(`
    <div class="modal-head">
      <div><h3>Reset Student Password</h3><div class="sub">${esc(st.name)} · ${esc(st.id)}</div></div>
      <button class="close-x" data-action="modal:close">${ic.x}</button>
    </div>
    <form data-action="form:resetPassword" data-id="${esc(st.id)}">
      <div class="modal-body">
        <div class="cred-box" style="margin-bottom:14px">
          <div class="cred-row"><span>Login ID</span><code>${esc(st.id)}</code></div>
          <div class="cred-row"><span>Current Password</span><code>${esc(st.password || "—")}</code></div>
        </div>
        <div class="field">
          <label for="rp-pass">New Password</label>
          <div class="input-inline">
            <input class="input code" id="rp-pass" name="password" value="${esc(genPassword(schoolPrefix(state.school)))}" />
            <button type="button" class="btn btn-soft btn-sm" data-action="student:genPass" data-target="rp-pass" data-prefix="${esc(schoolPrefix(state.school))}">${ic.refresh}<span>Generate</span></button>
          </div>
          <span class="field-err" data-err="password"></span>
          <span class="hint">Minimum 6 characters. The student will use this with the Student ID to sign in.</span>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" data-action="modal:close">Cancel</button>
        <button type="submit" class="btn btn-primary">${ic.key}<span>Update Password</span></button>
      </div>
    </form>
  `);
}

function adminTeachers() {
  const schoolId = state.school.id;
  const list = state.teachers.filter((t) => t.schoolId === schoolId);
  const pending = list.filter((t) => !t.verified).length;
  const rows = list.map((t) => `
    <tr data-name="${esc((t.name + " " + t.subject + " " + t.email).toLowerCase())}" data-status="${esc(t.status)}">
      <td><div class="avatar-cell"><div class="avatar" style="background:linear-gradient(135deg,#7c3aed,#4f46e5)">${initials(t.name)}</div><div><div class="cell-strong">${esc(t.name)}</div><div class="cell-muted">${esc(t.email)}</div></div></div></td>
      <td>${esc(t.subject)}</td>
      <td>${t.classes} classes</td>
      <td>${t.verified ? `<span class="badge badge-active"><span class="dot"></span>Verified</span>` : `<span class="badge badge-grace"><span class="dot"></span>Pending OTP</span>`}</td>
      <td>${t.status === "Active" ? `<span class="badge badge-info">Active</span>` : `<span class="badge badge-locked">On Leave</span>`}</td>
      <td>
        <div class="row-actions">
          ${t.verified
            ? `<button class="icon-btn" data-action="teacher:edit" data-id="${t.id}" title="Edit teacher">${ic.edit}</button>`
            : `<button class="btn btn-soft btn-sm" data-action="teacher:verify" data-id="${t.id}" title="Enter OTP">${ic.shield}<span>Verify</span></button>`}
          <button class="icon-btn danger" data-action="teacher:delete" data-id="${t.id}" title="Delete teacher">${ic.trash}</button>
        </div>
      </td>
    </tr>`).join("");

  return `
    <div class="page-head">
      <div><h1>Manage Teachers</h1><div class="sub">Invite staff by email — new accounts require OTP verification before they can sign in.</div></div>
      <div class="page-head-actions"><button class="btn btn-primary" data-action="teacher:invite">${ic.plus}<span>Invite Teacher</span></button></div>
    </div>

    ${pending ? `<div class="card" style="border-color:#fde68a;background:var(--amber-bg);display:flex;gap:12px;align-items:center;margin-bottom:18px">
      <span style="color:var(--amber)">${ic.alert}</span>
      <div style="font-size:13.5px;color:var(--amber)"><strong>${pending} teacher account${pending > 1 ? "s" : ""} pending OTP verification.</strong> They cannot sign in until verified.</div>
    </div>` : ""}

    <div class="card" style="margin-bottom:18px">
      <div class="toolbar">
        <div class="field" style="flex:2 1 260px">
          <label for="tea-search">Search</label>
          <input class="input" id="tea-search" data-filter="teachers" type="search" placeholder="Search by name, subject or email…" />
        </div>
        <div class="field">
          <label for="tea-status">Status</label>
          <select class="select" id="tea-status" data-filter="teachers">
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card card-pad-0">
      <div class="card-head"><div><h3>Staff Register</h3><div class="hint" id="tea-count">${list.length} teachers</div></div></div>
      <div class="table-wrap">
        <table class="data sticky-col">
          <thead><tr><th>Teacher</th><th>Subject</th><th>Load</th><th>Verification</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead>
          <tbody id="teacher-rows">${rows || `<tr><td colspan="6" class="empty">No teachers yet. Invite your first teacher.</td></tr>`}</tbody>
        </table>
      </div>
      <div class="empty" id="tea-empty" style="display:none">${ic.search}<div>No teachers match your filters.</div></div>
    </div>`;
}

function applyTeachersFilter() {
  const q = ($("#tea-search")?.value || "").toLowerCase().trim();
  const status = $("#tea-status")?.value || "";
  let shown = 0, total = 0;
  $$("#teacher-rows tr").forEach((tr) => {
    total++;
    const name = tr.getAttribute("data-name") || "";
    const st = tr.getAttribute("data-status") || "";
    const match = (!q || name.includes(q)) && (!status || st === status);
    tr.style.display = match ? "" : "none";
    if (match) shown++;
  });
  const count = $("#tea-count");
  if (count) count.textContent = `${shown} of ${total} teachers shown`;
  const empty = $("#tea-empty");
  if (empty) empty.style.display = shown ? "none" : "block";
}

/* --------------------- Multiple-subject tag input helpers --------------------- */
function subjectsToList(str) {
  return String(str || "").split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
}
function uniqueSubjects(list) {
  const seen = {};
  const out = [];
  list.forEach((s) => {
    const k = s.toLowerCase();
    if (!seen[k]) { seen[k] = 1; out.push(s); }
  });
  return out;
}
function subjectChipsHTML(list) {
  return list.map((s) => `
    <span class="tag-chip">${esc(s)}<button type="button" class="tag-x" data-action="subject:remove" data-subject="${esc(s)}" aria-label="Remove ${esc(s)}">${ic.x}</button></span>`).join("");
}
function subjectFieldHTML(existing) {
  const list = uniqueSubjects(subjectsToList(existing));
  return `
    <div class="tag-input" data-tags="subject">
      <span class="tag-chips" data-tags-chips>${subjectChipsHTML(list)}</span>
      <input class="tag-entry" data-tags-entry type="text" placeholder="Type a subject, press Enter to add…" />
      <input type="hidden" name="subject" data-tags-value value="${esc(list.join(","))}" />
    </div>
    <span class="hint">Flexible entry — add as many custom subjects as needed (e.g. <em>Mathematics, Further Mathematics, Physics</em>). Press <strong>Enter</strong> or type a comma after each subject.</span>`;
}
function readTagList(container) {
  if (!container || !container.querySelector) return [];
  const hidden = container.querySelector("[data-tags-value]");
  return uniqueSubjects(subjectsToList(hidden ? hidden.value : ""));
}
function writeTagList(container, list) {
  if (!container || !container.querySelector) return list;
  const hidden = container.querySelector("[data-tags-value]");
  const chips = container.querySelector("[data-tags-chips]");
  const clean = uniqueSubjects(list.map((s) => String(s).trim()).filter(Boolean));
  if (hidden) hidden.value = clean.join(",");
  if (chips) chips.innerHTML = subjectChipsHTML(clean);
  return clean;
}
function collectSubjects(form) {
  if (!form || !form.querySelector) return [];
  const container = form.querySelector('[data-tags="subject"]');
  if (container) {
    const list = readTagList(container);
    const entry = container.querySelector("[data-tags-entry]");
    if (entry && entry.value.trim()) {
      entry.value.split(/[,]/).map((s) => s.trim()).filter(Boolean).forEach((v) => {
        if (!list.some((x) => x.toLowerCase() === v.toLowerCase())) list.push(v);
      });
    }
    return list;
  }
  const hidden = form.querySelector('[name="subject"]');
  return hidden ? subjectsToList(hidden.value) : [];
}
function copyTextToClipboard(text) {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(String(text));
      return;
    }
  } catch (e) {}
  try {
    if (typeof document !== "undefined" && document.createElement) {
      const ta = document.createElement("textarea");
      ta.value = String(text);
      document.body.appendChild(ta);
      ta.select();
      document.execCommand && document.execCommand("copy");
      ta.remove();
    }
  } catch (e) {}
}

function teacherModal(t) {
  const editing = !!t;
  t = t || { name: "", subject: "Mathematics", classes: 3, status: "Active" };
  openModal(`
    <div class="modal-head">
      <div><h3>${editing ? "Edit Teacher" : "Add Teacher"}</h3><div class="sub">${editing ? "Update this staff record." : "Create a new teaching staff record."}</div></div>
      <button class="close-x" data-action="modal:close">${ic.x}</button>
    </div>
    <form data-action="form:teacher" data-id="${editing ? esc(t.id) : ""}">
      <div class="modal-body">
        <div class="field">
          <label for="te-name">Full Name</label>
          <input class="input" id="te-name" name="name" value="${esc(t.name)}" placeholder="e.g. Mrs. A. Bello" required />
        </div>
        <div class="field">
          <label>Subjects Handled</label>
          ${subjectFieldHTML(t.subject)}
        </div>
        <div class="input-group">
          <div class="field">
            <label for="te-classes">Classes Taught</label>
            <input class="input" id="te-classes" name="classes" type="number" min="1" max="20" value="${t.classes}" required />
          </div>
          <div class="field">
            <label for="te-status">Status</label>
            <select class="select" id="te-status" name="status">
              <option ${t.status === "Active" ? "selected" : ""}>Active</option>
              <option ${t.status !== "Active" ? "selected" : ""}>On Leave</option>
            </select>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" data-action="modal:close">Cancel</button>
        <button type="submit" class="btn btn-primary">${ic.check}<span>${editing ? "Save Changes" : "Add Teacher"}</span></button>
      </div>
    </form>
  `);
}

function paymentModal(st) {
  openModal(`
    <div class="modal-head">
      <div><h3>Record Fee Payment</h3><div class="sub">${esc(st.name)} · ${esc(st.cls)} · ${st.id}</div></div>
      <button class="close-x" data-action="modal:close">${ic.x}</button>
    </div>
    <form data-action="form:payment" data-id="${st.id}">
      <div class="modal-body">
        <div class="list-row"><span class="cell-muted">Outstanding Balance</span><strong style="color:var(--red)">${money(st.due)}</strong></div>
        <div class="field" style="margin-top:14px">
          <label for="pay-amount">Amount Received</label>
          <input class="input" id="pay-amount" name="amount" type="number" min="1" max="${st.due}" value="${st.due}" required />
          <span class="hint">Paying the full balance marks this student as fully cleared.</span>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" data-action="modal:close">Cancel</button>
        <button type="submit" class="btn btn-green">${ic.check}<span>Confirm Payment</span></button>
      </div>
    </form>
  `);
}

function inviteTeacherModal() {
  openModal(`
    <div class="modal-head">
      <div><h3>Invite Teacher</h3><div class="sub">Send a verified invite to a new staff member.</div></div>
      <button class="close-x" data-action="modal:close">${ic.x}</button>
    </div>
    <form data-action="form:inviteTeacher">
      <div class="modal-body">
        <div class="field">
          <label for="iv-name">Full Name</label>
          <input class="input" id="iv-name" name="name" placeholder="e.g. Mr. K. Balogun" required />
        </div>
        <div class="field">
          <label for="iv-email">Work Email</label>
          <input class="input" id="iv-email" name="email" type="email" placeholder="teacher@yourschool.edu" required />
          <span class="hint">A one-time password (OTP) will be sent here for verification.</span>
        </div>
        <div class="field">
          <label>Subjects Handled</label>
          ${subjectFieldHTML("Mathematics")}
        </div>
        <div class="input-group">
          <div class="field">
            <label for="iv-classes">Classes Taught</label>
            <input class="input" id="iv-classes" name="classes" type="number" min="1" max="20" value="3" required />
          </div>
          <div class="field">
            <label for="iv-pass">Temporary Password</label>
            <input class="input" id="iv-pass" name="password" value="${DEFAULT_TEACHER_PASSWORD}" required />
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" data-action="modal:close">Cancel</button>
        <button type="submit" class="btn btn-primary">${ic.shield}<span>Send Invite &amp; OTP</span></button>
      </div>
    </form>
  `);
}

function otpModal(t) {
  openModal(`
    <div class="modal-head">
      <div><h3>Verify Teacher Account</h3><div class="sub">Enter the 6-digit code sent to ${esc(t.email)}</div></div>
      <button class="close-x" data-action="modal:close">${ic.x}</button>
    </div>
    <form data-action="form:otp" data-id="${t.id}">
      <div class="modal-body">
        <div class="demo-note" style="margin-bottom:14px"><strong>Simulated email OTP:</strong> ${esc(t.otp)}</div>
        <div class="field">
          <label for="otp-code">One-Time Password</label>
          <input class="input" id="otp-code" name="otp" inputmode="numeric" maxlength="6" placeholder="••••••" style="letter-spacing:.4em;text-align:center;font-size:20px;font-weight:700" required />
          <span class="hint">Verification links this account to ${esc(state.school.name)} and activates sign-in.</span>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" data-action="teacher:resendOtp" data-id="${t.id}" style="margin-right:auto">${ic.refresh}<span>Resend OTP</span></button>
        <button type="button" class="btn btn-ghost" data-action="modal:close">Cancel</button>
        <button type="submit" class="btn btn-primary">${ic.check}<span>Verify Account</span></button>
      </div>
    </form>
  `);
}

function adminClasses() {
  const list = schoolClassList();
  return `
    <div class="page-head">
      <div><h1>Classes &amp; Subjects</h1><div class="sub">Curriculum structure — create classes and assign the subjects taught in each.</div></div>
      <div class="page-head-actions"><button class="btn btn-primary" data-action="class:new">${ic.plus}<span>Add Class</span></button></div>
    </div>
    ${list.length ? `<div class="grid grid-3">
      ${list.map((c) => {
        const enrolled = state.students.filter((st) => st.schoolId === state.school.id && normClass(st.cls) === normClass(c.name)).length;
        return `
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div class="stat-icon" style="width:40px;height:40px">${ic.book}</div>
            <div style="display:flex;align-items:center;gap:6px">
              <span class="badge badge-info">${enrolled} enrolled</span>
              ${c.id ? `<button class="icon-btn" data-action="class:edit" data-id="${esc(c.id)}" title="Edit class">${ic.edit}</button>
              <button class="icon-btn danger" data-action="class:delete" data-id="${esc(c.id)}" title="Delete class">${ic.trash}</button>` : ""}
            </div>
          </div>
          <h3 style="font-size:17px">${esc(c.name)}</h3>
          <div class="cell-muted" style="margin:4px 0 12px">Form Teacher: ${esc(c.teacher || "—")}</div>
          <div class="field-label" style="margin-bottom:8px">Subjects taught in this class</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${(c.subjects || []).map((sub) => `<span class="badge badge-info">${esc(sub)}</span>`).join("") || `<span class="cell-muted">No subjects assigned yet.</span>`}
          </div>
        </div>`;}).join("")}
    </div>` : `<div class="card"><div class="cell-muted" style="padding:30px;text-align:center">No classes yet — tap <strong>Add Class</strong> to build your curriculum.</div></div>`}
    <div class="demo-note" style="margin-top:16px">Subjects created here are <strong>dynamically fetched by teachers</strong> in the Score Entry page for the matching class. Tap <strong>Add Class</strong> to create e.g. <em>JSS 1A</em> or <em>SS 3 Science</em> and tag its subjects.</div>`;
}

function classModal(cls) {
  const editing = !!cls;
  cls = cls || { name: "", teacher: "", subjects: [] };
  const teacherOptions = state.teachers.filter((x) => x.schoolId === state.school.id).map((x) => x.name);
  return openModal(`
    <div class="modal-head">
      <div><h3>${editing ? "Edit Class" : "Add Class"}</h3><div class="sub">${editing ? "Update the class and its subject mapping." : "Create a class and tag the subjects taught in it."}</div></div>
      <button class="close-x" data-action="modal:close">${ic.x}</button>
    </div>
    <form data-action="form:class" data-id="${editing ? cls.id : ""}">
      <div class="modal-body">
        <div class="field">
          <label for="cl-name">Class Name</label>
          <input class="input" id="cl-name" name="name" value="${esc(cls.name)}" placeholder="e.g. JSS 1A · SS 3 Science · JSS 2B" required />
          <span class="hint">Use any naming convention your school prefers.</span>
        </div>
        <div class="field">
          <label for="cl-teacher">Form Teacher</label>
          <input class="input" id="cl-teacher" name="teacher" value="${esc(cls.teacher || "")}" list="cl-teacher-list" placeholder="e.g. Mrs. A. Bello" />
          <datalist id="cl-teacher-list">${teacherOptions.map((n) => `<option value="${esc(n)}">`).join("")}</datalist>
        </div>
        <div class="field">
          <label>Subjects Taught in This Class</label>
          ${subjectFieldHTML((cls.subjects || []).join(", "))}
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" data-action="modal:close">Cancel</button>
        <button type="submit" class="btn btn-primary">${ic.check}<span>${editing ? "Save Changes" : "Create Class"}</span></button>
      </div>
    </form>
  `);
}

function adminFees() {
  const debtors = state.students.filter((s) => s.schoolId === state.school.id && s.due > 0);
  const rows = debtors.map((st) => `
    <tr>
      <td><div class="cell-strong">${esc(st.name)}</div><div class="cell-muted">${st.id} · ${esc(st.cls)}</div></td>
      <td>${esc(st.guardian)}</td>
      <td><span style="color:var(--red);font-weight:700">${money(st.due)}</span></td>
      <td><span class="badge badge-expired">Outstanding</span></td>
      <td style="text-align:right"><button class="btn btn-green btn-sm" data-action="fees:pay" data-id="${st.id}">${ic.check}<span>Record Payment</span></button></td>
    </tr>`).join("");
  return `
    <div class="page-head">
      <div><h1>Fee Management</h1><div class="sub">Track collections and outstanding balances.</div></div>
      <div class="page-head-actions"><button class="btn btn-primary" data-action="noop">${ic.wallet}<span>New Invoice</span></button></div>
    </div>
    <div class="grid grid-3" style="margin-bottom:20px">
      <div class="card stat"><div class="stat-icon green">${ic.wallet}</div><div class="stat-value" style="font-size:24px;margin-top:12px">${money(state.fees.collected)}</div><div class="stat-label">Collected</div></div>
      <div class="card stat"><div class="stat-icon red">${ic.alert}</div><div class="stat-value" style="font-size:24px;margin-top:12px">${money(state.fees.pending)}</div><div class="stat-label">Outstanding</div></div>
      <div class="card stat"><div class="stat-icon blue">${ic.dollar}</div><div class="stat-value" style="font-size:24px;margin-top:12px">${money(state.fees.expected)}</div><div class="stat-label">Expected</div></div>
    </div>
    <div class="card card-pad-0">
      <div class="card-head"><h3>Outstanding Balances</h3><span class="badge badge-expired">${debtors.length} debtors</span></div>
      <div class="table-wrap">
        <table class="data sticky-col">
          <thead><tr><th>Student</th><th>Guardian</th><th>Amount Due</th><th>Status</th><th style="text-align:right">Action</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="5" class="empty">No outstanding balances. 🎉</td></tr>`}</tbody>
        </table>
      </div>
    </div>`;
}

function adminSubscription() {
  const s = state.school;
  const pend = s.pendingPayment;
  return `
    <div class="page-head">
      <div><h1>Subscription Status</h1><div class="sub">Your plan, renewal and billing preferences.</div></div>
      <div class="page-head-actions">${statusBadge(s.status)}</div>
    </div>
    ${pend ? `
    <div class="pending-banner">
      <div class="pending-banner-icon">${ic.clock}</div>
      <div style="flex:1">
        <div class="pending-banner-title">Payment Pending Verification</div>
        <div class="pending-banner-text">We received your bank transfer submission${pend.reference ? " — Ref: " + esc(pend.reference) : ""} on ${fmtDate(pend.submittedAt)}. The platform owner will review your receipt and confirm your renewal shortly.</div>
      </div>
      ${pend.receipt ? `<button class="btn btn-ghost btn-sm" data-action="payment:receipt">${ic.eye}<span>View Receipt</span></button>` : ""}
    </div>` : ""}
    <div class="two-col">
      <div class="card">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">
          <div class="stat-icon" style="width:52px;height:52px;border-radius:14px">${ic.card}</div>
          <div>
            <h3 style="font-size:18px">Syntax SaaS ${s.plan >= 99 ? "Growth" : "Starter"} Plan</h3>
            <div class="cell-muted">${money(s.plan)} billed monthly</div>
          </div>
        </div>
        <div class="list-row"><span class="cell-muted">Status</span>${statusBadge(s.status)}</div>
        <div class="list-row"><span class="cell-muted">Next Renewal</span><strong>${fmtDate(s.renewal)}</strong></div>
        <div class="list-row"><span class="cell-muted">Students Licensed</span><strong>${s.students}</strong></div>
        <div class="list-row"><span class="cell-muted">Payment Method</span><strong>${pend ? "Bank Transfer (Pending)" : "Bank Transfer · OPay"}</strong></div>
      </div>
      <div class="card">
        <h3 style="margin-bottom:14px">Manage Plan · Renew Subscription</h3>
        ${pend ? `
        <div class="demo-note" style="margin-bottom:14px">A bank transfer for <strong>${money(s.plan)}</strong> is awaiting verification. No further action needed until the platform owner confirms payment.</div>
        <button class="btn btn-ghost btn-block" data-action="demo:expire">${ic.alert}<span>Simulate Expiry</span></button>` : `
        <button class="btn btn-primary btn-block" data-action="bank:renew" style="margin-bottom:10px">${ic.card}<span>Make Bank Transfer / Renew — ${money(s.plan)}/mo</span></button>
        <button class="btn btn-ghost btn-block" data-action="demo:expire">${ic.alert}<span>Simulate Expiry</span></button>`}
        ${pend ? "" : `<div class="demo-note" style="margin-top:16px">Renewal is by <strong>bank transfer only</strong>. Pay via <strong>${BANK_DETAILS.bank}</strong> (${BANK_DETAILS.accountNumber}) and confirm here — the owner verifies and unlocks your portal.</div>`}
      </div>
    </div>`;
}

function bankTransferModal() {
  const s = state.school;
  const b = BANK_DETAILS;
  openModal(`
    <div class="modal-head">
      <div><h3>Renew via Bank Transfer</h3><div class="sub">Manual renewal for ${esc(s.name)} — verified by the platform owner.</div></div>
      <button class="close-x" data-action="modal:close">${ic.x}</button>
    </div>
    <form data-action="form:bankTransfer">
      <div class="modal-body">
        <div class="list-row"><span class="cell-muted">Plan Renewal Amount</span><strong>${money(s.plan)} / mo</strong></div>
        <div class="bank-card">
          <div class="bank-head"><div class="bank-logo">${ic.card}</div><div>Transfer via <strong>${b.bank}</strong></div></div>
          <div class="bank-inner">
            <div class="bank-row"><span class="cell-muted">Bank Name</span><strong>${esc(b.bank)}</strong></div>
            <div class="bank-row">
              <span class="cell-muted">Account Number</span>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <strong class="code" style="font-size:17px;letter-spacing:.14em">${b.accountNumber}</strong>
                <button type="button" class="btn btn-soft btn-sm" data-action="bank:copy" data-acct="${b.accountNumber}">${ic.copy}<span>Copy</span></button>
              </div>
            </div>
            <div class="bank-row"><span class="cell-muted">Account Name</span><strong>${esc(b.accountName)}</strong></div>
          </div>
        </div>
        <div class="demo-note" style="margin:14px 0">Transfer exactly <strong>${money(s.plan)}</strong> via ${esc(b.bank)} to the account above, then confirm below with your transfer reference or receipt. The platform owner verifies and restores access.</div>
        <div class="field">
          <label for="bt-ref">Transfer Reference</label>
          <input class="input" id="bt-ref" name="reference" placeholder="e.g. OPAY/GVH/88213 or the 11-digit narration" required />
        </div>
        <div class="field">
          <label for="bt-file">Upload Payment Receipt <span class="hint">(optional — JPG, PNG or PDF)</span></label>
          <label class="upload-zone" for="bt-file">${ic.upload}<span><strong>Click to attach</strong> or drop your OPay receipt screenshot</span></label>
          <input class="input" id="bt-file" name="receipt" type="file" accept="image/*,.pdf" hidden />
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" data-action="modal:close">Cancel</button>
        <button type="submit" class="btn btn-primary">${ic.check}<span>Submit Payment Proof / Confirm Transfer</span></button>
      </div>
    </form>
  `);
}

/* ============================================================
   4. TEACHER PORTAL — SCORE ENTRY & BROADSHEET
   ============================================================ */
const scoreStore = {};

/* ----------------------- Class & subject registry ----------------------- */
function normClass(name) {
  return String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
function schoolClassList() {
  const sid = state.school ? state.school.id : null;
  return state.classes.filter((c) => !c.schoolId || c.schoolId === sid);
}
function schoolClassOptions() {
  const seen = {};
  const out = [];
  schoolClassList().forEach((c) => {
    const k = normClass(c.name);
    if (k && !seen[k]) { seen[k] = 1; out.push(c.name); }
  });
  return out;
}
function subjectsForClass(cls, schoolId) {
  const sid = schoolId || (state.school ? state.school.id : null);
  const target = normClass(cls);
  const found = [];
  state.classes.forEach((c) => {
    const owned = !c.schoolId || (sid !== null && c.schoolId === sid);
    if (!owned) return;
    if (normClass(c.name) !== target) return;
    (c.subjects || []).forEach((sub) => {
      if (!found.some((x) => x.toLowerCase() === String(sub).toLowerCase())) found.push(sub);
    });
  });
  return found;
}

/* ----------------------- Assessments / approval workflow ----------------------- */
function pendingAssessments() {
  const sid = state.school ? state.school.id : null;
  return state.assessments.filter((a) => a.schoolId === sid && a.status === "pending");
}
function currentAssessment(cls, subject) {
  const sid = state.school ? state.school.id : null;
  return state.assessments.find((a) =>
    a.schoolId === sid &&
    normClass(a.cls) === normClass(cls) &&
    String(a.subject).toLowerCase() === String(subject).toLowerCase() &&
    (a.status === "pending" || a.status === "revised")
  ) || null;
}
function todayISO() { return new Date().toISOString().slice(0, 10); }

function rosterFor(cls) {
  const sid = state.school ? state.school.id : (state.auth && state.auth.admin ? state.auth.admin.schoolId : null);
  const enrolled = (state.students || []).filter((st) => st.schoolId === sid && normClass(st.cls) === normClass(cls));
  if (enrolled.length) return enrolled.map((st) => ({ name: st.name, ca1: "", ca2: "", exam: "" }));
  const first = ["Chinedu", "Aisha", "Tunde", "Ngozi", "Emeka", "Fatima", "Bola", "Kelechi", "Zainab", "Samuel"];
  const last = ["Okeke", "Bello", "Adeyemi", "Eze", "Obi", "Yusuf", "Ogunleye", "Nwankwo", "Musa", "Johnson"];
  const seed = cls.charCodeAt(0) + cls.charCodeAt(cls.length - 1);
  const out = [];
  for (let i = 0; i < 10; i++) {
    out.push({ name: `${first[(i + seed) % 10]} ${last[(i * 3 + seed) % 10]}`, ca1: "", ca2: "", exam: "" });
  }
  return out;
}
function scoreKey(cls, subj) { return cls + "|" + subj; }
function ensureScores(cls, subj) {
  const key = scoreKey(cls, subj);
  if (!scoreStore[key]) scoreStore[key] = rosterFor(cls);
  return scoreStore[key];
}

function teacherApp() {
  const me = teacherById(state.auth.teacher && state.auth.teacher.teacherId);
  const tab = state.teacherTab === "upload" ? "upload" : "manual";
  const classOptions = schoolClassOptions();

  if (!classOptions.length) {
    return `
    <div class="page">
      <div class="page-head">
        <div>
          <div class="eyebrow">Teacher Portal · ${esc(state.school.name)}</div>
          <h1>${me ? esc(me.name) : "Score Entry"} — Broadsheet</h1>
          <div class="sub">Curriculum-driven score entry.</div>
        </div>
      </div>
      <div class="card"><div class="cell-muted" style="padding:34px;text-align:center">
        No classes are configured for ${esc(state.school.name)} yet.<br>
        A School Admin must create classes and tag their subjects under <strong>Classes &amp; Subjects</strong> first.
      </div></div>
    </div>`;
  }

  if (!state.teacherCls || !classOptions.some((c) => normClass(c) === normClass(state.teacherCls))) {
    state.teacherCls = classOptions[0];
  }
  const cls = state.teacherCls;
  const classQuery = String(state.teacherClassQuery || "").trim();
  const classMatches = classOptions.filter((c) => !classQuery || c.toLowerCase().includes(classQuery.toLowerCase()));
  const curriculum = subjectsForClass(cls);
  let subjOptions = curriculum.filter((s) => {
    const q = String(state.teacherSubjectFilter || "").toLowerCase();
    return !q || s.toLowerCase().includes(q);
  });
  if (!subjOptions.length) subjOptions = curriculum.slice();
  state.teacherSubj = curriculum.includes(state.teacherSubj) ? state.teacherSubj : (curriculum[0] || "");
  const subj = state.teacherSubj;
  const rows = subj ? ensureScores(cls, subj) : [];
  const assessment = currentAssessment(cls, subj);
  const submitted = assessment && assessment.status === "pending";
  const revised = assessment && assessment.status !== "pending";

  const tabBar = `
    <div class="seg-tabs" role="tablist" aria-label="Result entry mode">
      <button type="button" class="seg-tab ${tab === "manual" ? "active" : ""}" role="tab" aria-selected="${tab === "manual"}" data-action="teacher:tab" data-tab="manual">${ic.edit}<span>Manual Score Entry</span></button>
      <button type="button" class="seg-tab ${tab === "upload" ? "active" : ""}" role="tab" aria-selected="${tab === "upload"}" data-action="teacher:tab" data-tab="upload">${ic.upload}<span>Bulk Result Upload</span></button>
    </div>`;

  const principalField = `
        <div class="field">
          <label for="t-principal">Principal Name</label>
          <input class="input" id="t-principal" data-action="principal:set" value="${esc(principalName(state.school))}" placeholder="e.g. A. Bello" autocomplete="off" />
          <span class="hint">Attached to reports &amp; approval sheets</span>
        </div>`;

  const bodyRows = rows.map((r, i) => {
    const hasAny = ["ca1", "ca2", "exam"].some((k) => r[k] !== "" && r[k] !== null && r[k] !== undefined);
    const total = hasAny ? Number(r.ca1 || 0) + Number(r.ca2 || 0) + Number(r.exam || 0) : "";
    const g = hasAny ? gradeFor(total) : "";
    return `
      <tr>
        <td class="cell-muted col-idx">${i + 1}</td>
        <td class="cell-strong col-name">${esc(r.name)}</td>
        <td><input class="input score-input" style="padding:7px 9px;max-width:82px" type="number" min="0" max="20" data-i="${i}" data-k="ca1" value="${r.ca1}" placeholder="0" /></td>
        <td><input class="input score-input" style="padding:7px 9px;max-width:82px" type="number" min="0" max="20" data-i="${i}" data-k="ca2" value="${r.ca2}" placeholder="0" /></td>
        <td><input class="input score-input" style="padding:7px 9px;max-width:82px" type="number" min="0" max="60" data-i="${i}" data-k="exam" value="${r.exam}" placeholder="0" /></td>
        <td class="cell-strong" data-total="${i}">${total === "" ? "—" : total}</td>
        <td data-grade="${i}">${gradeBadge(g)}</td>
      </tr>`;
  }).join("");

  const manualCard = `
    <div class="card card-pad-0">
      <div class="card-head">
        <div><h3>${esc(cls)} — ${esc(subj || "—")}</h3><div class="hint">${rows.length} students on the broadsheet</div></div>
        <div class="legend">
          <span class="item"><span class="swatch" style="background:var(--green-bg)"></span>A ≥ 70</span>
          <span class="item"><span class="swatch" style="background:var(--blue-50)"></span>B ≥ 60</span>
          <span class="item"><span class="swatch" style="background:var(--indigo-50)"></span>C ≥ 50</span>
          <span class="item"><span class="swatch" style="background:var(--amber-bg)"></span>D ≥ 40</span>
          <span class="item"><span class="swatch" style="background:var(--red-bg)"></span>F &lt; 40</span>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data broadsheet">
          <thead>
            <tr><th class="col-idx">#</th><th class="col-name">Student</th><th>CA1</th><th>CA2</th><th>Exam</th><th>Total</th><th>Grade</th></tr>
          </thead>
          <tbody id="score-body">${bodyRows}</tbody>
        </table>
      </div>
    </div>`;

  const uploadCard = `
    <div class="card">
      <div class="card-head">
        <div><h3>Bulk Result Upload</h3><div class="hint">${subj ? esc(cls) + " — " + esc(subj) + " · " + rows.length + " students" : "Select a class and subject first"}</div></div>
        <button type="button" class="btn btn-ghost btn-sm" data-action="teacher:template">${ic.download}<span>CSV Template</span></button>
      </div>
      <div class="card-body">
        <label class="upload-drop" for="t-file">
          <div class="stat-icon" style="margin:0 auto 12px">${ic.upload}</div>
          <div class="cell-strong">Drop your compiled score sheet here</div>
          <div class="cell-muted" style="margin-top:4px">or click to browse — accepts CSV, XLSX, XLS with columns <code>Student, CA1, CA2, Exam</code></div>
          <input id="t-file" class="sr-only" type="file" accept=".csv,.txt,.xlsx,.xls,.doc,.docx" data-action="teacher:file" />
          <span class="btn btn-primary" style="margin-top:16px">${ic.upload}<span>Choose File</span></span>
        </label>
        <div class="upload-steps">
          <div class="upload-step"><span class="n">1</span><div>Download the pre-filled template for <strong>${esc(cls)} — ${esc(subj || "subject")}</strong>.</div></div>
          <div class="upload-step"><span class="n">2</span><div>Enter CA1 (≤20), CA2 (≤20) and Exam (≤60) in your spreadsheet or document.</div></div>
          <div class="upload-step"><span class="n">3</span><div>Upload it back — rows are matched to the broadsheet by student name.</div></div>
        </div>
        <div class="upload-actions">
          <button type="button" class="btn btn-soft" data-action="teacher:upload">${ic.upload}<span>Load Sample Scores</span></button>
          <button type="button" class="btn btn-primary" data-action="teacher:tab" data-tab="manual">${ic.edit}<span>Enter Scores Manually</span></button>
        </div>
      </div>
    </div>`;

  return `
  <div class="page">
    <div class="page-head">
      <div>
        <div class="eyebrow">Teacher Portal · ${esc(state.school.name)}</div>
        <h1>${me ? esc(me.name) : "Score Entry"} — Broadsheet</h1>
        <div class="sub">${me ? esc(me.subject) + " · " : ""}Enter CA and exam scores, or upload a compiled sheet — totals and grades are computed automatically. Classes &amp; subjects are synced strictly to the Admin <strong>Classes &amp; Subjects</strong> curriculum.</div>
      </div>
      <div class="page-head-actions" style="align-items:flex-start">
        ${revised ? `<span class="badge badge-expired" style="margin-top:8px"><span class="dot"></span>Revision Requested</span>` : ""}
        ${submitted ? `<button class="btn btn-ghost" data-action="teacher:submit" disabled style="opacity:.65;cursor:not-allowed">${ic.clock}<span>Pending Approval</span></button>` :
         revised ? `<button class="btn btn-amber" data-action="teacher:submit">${ic.refresh}<span>Re-submit for Approval</span></button>` :
         `<button class="btn btn-primary" data-action="teacher:submit">${ic.check}<span>Submit for Approval</span></button>`}
      </div>
    </div>

    ${tabBar}

    <div class="card" style="margin-bottom:20px">
      <div class="toolbar">
        <div class="field class-field ${classQuery ? "has-query" : ""}" style="position:relative">
          <label for="t-class">Class</label>
          <input class="input" id="t-class" type="text" autocomplete="off" data-action="teacher:classSearch"
            value="${esc(classQuery || cls)}" placeholder="Type to search a class…" />
          <span class="hint">${classMatches.length} of ${classOptions.length} classes${classQuery ? " match" : ""} · synced from Classes &amp; Subjects</span>
          <div class="class-combo" data-combo>
            ${classMatches.map((c) => `<button type="button" class="combo-item ${normClass(c) === normClass(cls) ? "active" : ""}" data-action="teacher:classPick" data-class="${esc(c)}"><span>${esc(c)}</span>${normClass(c) === normClass(cls) ? `<span class="combo-current">current</span>` : ""}</button>`).join("") || `<div class="combo-empty">No matching classes</div>`}
          </div>
        </div>
        <div class="field">
          <label for="t-subj">Subjects for ${esc(cls)}</label>
          <select class="select" id="t-subj" data-action="teacher:subject">
            ${subjOptions.map((s) => `<option ${s === subj ? "selected" : ""}>${esc(s)}</option>`).join("") || `<option value="">No subjects configured</option>`}
          </select>
          <span class="hint">${subjOptions.length} subject${subjOptions.length === 1 ? "" : "s"} fetched from the class curriculum</span>
        </div>
        <div class="field">
          <label>Search Subject</label>
          <input class="input" data-action="teacher:subjectSearch" value="${esc(state.teacherSubjectFilter || "")}" placeholder="Type to filter subjects…" />
        </div>
        ${principalField}
        <div class="field">
          <label>&nbsp;</label>
          <div class="badge badge-info" style="padding:10px 14px">CA1 ≤ 20 · CA2 ≤ 20 · Exam ≤ 60 · Total /100</div>
        </div>
      </div>
    </div>

    ${assessment ? `
    <div class="pending-banner" style="margin-top:0">
      <div class="pending-banner-icon">${revised ? ic.alert : ic.clock}</div>
      <div style="flex:1">
        <div class="pending-banner-title">${revised ? "Revision Requested by Principal" : "Submitted — Pending Approval"}</div>
        <div class="pending-banner-text">${revised ? esc(assessment.note || "The Principal requested changes. Review the feedback and re-submit for approval.") : esc(assessment.cls + " · " + assessment.subject + " was submitted on " + fmtDate(assessment.submittedAt) + " and is awaiting Principal review.")}</div>
      </div>
    </div>` : ""}

    ${tab === "upload" ? uploadCard : manualCard}
  `;
}

function recomputeRow(i) {
  const rows = ensureScores(state.teacherCls, state.teacherSubj);
  const r = rows[i];
  const hasAny = ["ca1", "ca2", "exam"].some((k) => r[k] !== "" && r[k] !== null && r[k] !== undefined);
  const total = hasAny ? Number(r.ca1 || 0) + Number(r.ca2 || 0) + Number(r.exam || 0) : "";
  const totalCell = $(`[data-total="${i}"]`);
  const gradeCell = $(`[data-grade="${i}"]`);
  if (totalCell) totalCell.textContent = total === "" ? "—" : total;
  if (gradeCell) gradeCell.innerHTML = hasAny ? gradeBadge(gradeFor(total)) : `<span class="cell-muted">—</span>`;
}

function bulkUploadSim() {
  const rows = ensureScores(state.teacherCls, state.teacherSubj);
  rows.forEach((r) => {
    r.ca1 = Math.floor(Math.random() * 12) + 8; // 8-19
    r.ca2 = Math.floor(Math.random() * 12) + 8;
    r.exam = Math.floor(Math.random() * 31) + 28; // 28-58
  });
  return rows.length;
}

/* Parse a CSV score sheet and map rows onto the current broadsheet by name */
function clampScore(v, max) {
  if (v === "" || v === null || v === undefined) return "";
  const n = Number(v);
  if (isNaN(n)) return "";
  return Math.max(0, Math.min(n, max));
}
function applyScoreCsv(text) {
  const rows = ensureScores(state.teacherCls, state.teacherSubj);
  const lines = String(text || "").split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return 0;
  let start = 0;
  if (/(student|name)/i.test(lines[0]) && /(ca|exam|score)/i.test(lines[0])) start = 1;
  let updated = 0;
  for (let li = start; li < lines.length; li++) {
    const cols = lines[li].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const name = cols[0];
    if (!name) continue;
    const target = rows.find((r) => String(r.name).toLowerCase() === name.toLowerCase());
    if (!target) continue;
    target.ca1 = clampScore(cols[1], 20);
    target.ca2 = clampScore(cols[2], 20);
    target.exam = clampScore(cols[3], 60);
    updated++;
  }
  return updated;
}

/* Build a pre-filled CSV template from the current roster */
function scoreCsvTemplate() {
  const rows = ensureScores(state.teacherCls, state.teacherSubj);
  const esc2 = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
  const lines = ["Student,CA1,CA2,Exam"];
  rows.forEach((r) => lines.push([esc2(r.name), "", "", ""].join(",")));
  return lines.join("\n");
}

/* Trigger a client-side file download (guarded for non-browser environments) */
function downloadTextFile(name, content, mime) {
  try {
    if (typeof Blob === "undefined" || typeof URL === "undefined" || !document.createElement || !document.body) return false;
    const blob = new Blob([content], { type: mime || "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    if (document.body.appendChild) document.body.appendChild(a);
    if (typeof a.click === "function") a.click();
    if (document.body.removeChild) document.body.removeChild(a);
    if (URL.revokeObjectURL) URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/* Read a chosen file and import its scores */
function importScoreFile(file, done) {
  if (!file) return;
  if (typeof FileReader === "undefined") {
    toast("Upload unavailable", "File import is not supported in this environment.", "error");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const count = applyScoreCsv(reader.result);
    if (done) done(count, file.name);
  };
  reader.onerror = () => toast("Upload failed", "Could not read the selected file.", "error");
  reader.readAsText(file);
}

/* ============================================================
   5. STUDENT & PARENT RESULT CHECKING PORTAL
   ============================================================ */
const RESULT_SUBJECTS = [
  { subject: "Mathematics", ca: 34, exam: 55 },
  { subject: "English Language", ca: 38, exam: 58 },
  { subject: "Basic Science", ca: 30, exam: 47 },
  { subject: "Social Studies", ca: 36, exam: 52 },
  { subject: "Civic Education", ca: 40, exam: 60 },
  { subject: "Computer Studies", ca: 33, exam: 50 },
  { subject: "Agricultural Science", ca: 28, exam: 44 },
  { subject: "Business Studies", ca: 37, exam: 56 },
  { subject: "French", ca: 31, exam: 45 },
  { subject: "Physical & Health Education", ca: 39, exam: 57 },
];
const AFFECTIVE = [
  ["Punctuality", "Excellent"], ["Neatness", "Very Good"], ["Politeness", "Excellent"],
  ["Honesty", "Very Good"], ["Attentiveness", "Good"], ["Leadership", "Very Good"],
];
const PSYCHOMOTOR = [
  ["Handwriting", "Very Good"], ["Verbal Fluency", "Good"], ["Sports", "Excellent"],
  ["Drawing & Painting", "Good"], ["Handling Tools", "Good"], ["Musical Skills", "Fair"],
];

function principalName(school) {
  const s = school || state.school;
  const val = s && s.principal ? String(s.principal).trim() : "";
  return val || "A. Bello";
}

/* Pull a single student's subject result straight from the Teacher Broadsheet dataset */
function broadsheetScore(cls, subject, name) {
  if (!cls || !subject || !name) return null;
  const rows = ensureScores(cls, subject);
  const target = String(name).trim().toLowerCase();
  const row = rows.find((r) => String(r.name || "").trim().toLowerCase() === target);
  if (!row) return null;
  const hasAny = ["ca1", "ca2", "exam"].some((k) => row[k] !== "" && row[k] !== null && row[k] !== undefined);
  if (!hasAny) return null;
  const ca = Number(row.ca1 || 0) + Number(row.ca2 || 0);
  const exam = Number(row.exam || 0);
  const total = ca + exam;
  return { subject, ca, exam, total, grade: gradeFor(total) };
}

/* The teacher credited with a class — the one who submitted the score entries */
function classTeacherName(cls, schoolId) {
  const sid = schoolId || (state.school ? state.school.id : null);
  const list = state.assessments.filter((x) => (sid === null || x.schoolId === sid) && x.teacher && normClass(x.cls) === normClass(cls));
  if (list.length) return list[list.length - 1].teacher;
  const rec = state.classes.find((c) => normClass(c.name) === normClass(cls) && (!c.schoolId || c.schoolId === sid) && c.teacher);
  if (rec) return rec.teacher;
  return CLASS_FORM_TEACHERS[cls] || "Class Teacher";
}

function computeResult(st, term) {
  const rec = pickHistory(st, term);
  let rows, total, average, position, classSize, attendance, session, cls, remark;
  if (rec) {
    rows = rec.subjects.map((r) => ({ ...r }));
    total = rec.total; average = rec.average; position = ordinal(rec.position); classSize = rec.classSize;
    attendance = rec.attendance; session = rec.session; cls = rec.cls; remark = rec.remark;
  } else {
    total = 0;
    rows = RESULT_SUBJECTS.map((s) => {
      const t = s.ca + s.exam;
      total += t;
      return { ...s, total: t, grade: gradeFor(t) };
    });
    average = +(total / rows.length).toFixed(1);
    position = "3rd"; classSize = 38; attendance = { present: 118, total: 122 };
    session = "2025/2026"; cls = st ? st.cls : "—"; remark = "Good";
  }

  if (st) {
    const bcls = st.cls;
    let linked = false;
    const seen = {};
    rows.forEach((r) => { seen[String(r.subject).toLowerCase()] = 1; });
    rows.forEach((r) => {
      const bs = broadsheetScore(bcls, r.subject, st.name);
      if (bs) { r.ca = bs.ca; r.exam = bs.exam; r.total = bs.total; r.grade = bs.grade; linked = true; }
    });
    subjectsForClass(bcls).forEach((sub) => {
      if (seen[String(sub).toLowerCase()]) return;
      const bs = broadsheetScore(bcls, sub, st.name);
      if (bs) { rows.push(bs); seen[String(sub).toLowerCase()] = 1; linked = true; }
    });
    if (linked) {
      total = rows.reduce((a, r) => a + Number(r.total || 0), 0);
      average = +(total / rows.length).toFixed(1);
    }
  }

  return { rows, total, average, position, classSize, attendance, session, cls, remark };
}

function studentApp() {
  if (!state.auth.student.loggedIn) return studentLogin();
  return studentResult();
}

function studentLogin() {
  const s = demoSchool();
  const sample = state.students.find((st) => st.schoolId === s.id) || state.students[0];
  return `
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-logo">${ic.cap}</div>
      <h1>Result Checking Portal</h1>
      <div class="sub">Enter your Student ID and password to view your ${esc(s.name)} term result.</div>
      <form data-action="form:studentlogin">
        <div class="pin-row">
          <div class="field">
            <label for="s-id">Student ID</label>
            <input class="input code" id="s-id" name="sid" placeholder="e.g. ${esc(schoolPrefix(s))}/2026/001" value="${sample ? esc(sample.id) : ""}" required />
          </div>
          <div class="field">
            <label for="s-pin">Password</label>
            <input class="input" id="s-pin" name="pin" type="password" placeholder="••••••" value="${DEFAULT_PIN}" required />
          </div>
          <div class="field">
            <label for="s-term">Select Term</label>
            <select class="select" id="s-term" name="term">
              <option>First Term</option>
              <option>Second Term</option>
              <option>Third Term</option>
            </select>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block" style="padding:13px;margin-top:6px">${ic.search}<span>Check Result</span></button>
      </form>
      <div class="demo-note"><strong>Demo:</strong> any enrolled Student ID works with <strong>${DEFAULT_PIN}</strong>, or use the parent password issued by the school${sample ? `<br />Sample: <strong>${esc(sample.id)}</strong> · ${esc(sample.name)} (${esc(sample.cls)})` : ""}.</div>
      <div style="text-align:center;margin-top:14px"><button class="btn btn-ghost btn-sm" data-action="auth:logout">${ic.logout}<span>Back to Login</span></button></div>
    </div>
  </div>`;
}

function studentResult() {
  const s = state.school;
  const st = state.students.find((x) => x.id === state.auth.student.id)
    || state.students.find((x) => x.schoolId === s.id)
    || state.students[0];
  const term = state.auth.student.term || "First Term";
  const r = computeResult(st, term);
  const restrict = s.restrictDebtors;

  if (restrict) {
    return `
    <div class="login-wrap">
      <div class="lock-card" style="max-width:520px">
        <div class="lock-banner" style="background:linear-gradient(135deg,#b45309,#d97706)">
          <div class="lock-icon">${ic.alert}</div>
          <h1>Result Access Restricted</h1>
          <p>Your school fees for this term are outstanding. Results will be released once payment is confirmed.</p>
        </div>
        <div class="lock-body">
          <div class="lock-meta" style="grid-template-columns:1fr 1fr">
            <div><div class="k">Student</div><div class="v">${esc(st ? st.name : "—")}</div></div>
            <div><div class="k">Student ID</div><div class="v code">${esc(st ? st.id : "—")}</div></div>
            <div><div class="k">Class</div><div class="v">${esc(st ? st.cls : "—")}</div></div>
            <div><div class="k">Amount Due</div><div class="v" style="color:var(--red)">${money(st ? st.due || 0 : 0)}</div></div>
          </div>
          <button class="btn btn-amber btn-block" data-action="student:logout" style="padding:12px">${ic.logout}<span>Sign Out</span></button>
        </div>
      </div>
    </div>`;
  }

  const sessionLabel = r.session ? r.session.replace("/", " / ") : "2025 / 2026";
  const attPct = r.attendance && r.attendance.total ? +((r.attendance.present / r.attendance.total) * 100).toFixed(1) : 0;
  const subjRows = r.rows.map((row) => `
    <tr>
      <td class="cell-strong">${esc(row.subject)}</td>
      <td>${row.ca}</td>
      <td>${row.exam}</td>
      <td class="cell-strong">${row.total}</td>
      <td>${gradeBadge(row.grade)}</td>
      <td class="cell-muted">${remarkForGrade(row.grade)}</td>
    </tr>`).join("");

  return `
  <div class="page result-shell">
    <div class="result-actions">
      <div class="field principal-field">
        <label for="pr-name">Principal Name <span class="hint">(renders on the report)</span></label>
        <input class="input" id="pr-name" data-action="principal:set" value="${esc(principalName(s))}" placeholder="e.g. A. Bello" autocomplete="off" />
      </div>
      <button class="btn btn-ghost" data-action="student:logout">${ic.logout}<span>Sign Out</span></button>
      <button class="btn btn-ghost" data-action="student:print">${ic.print}<span>Print</span></button>
      <button class="btn btn-primary" data-action="student:download">${ic.download}<span>Download PDF Report Card</span></button>
    </div>

    <div class="report" id="report-card">
      <div class="report-head">
        <div class="report-logo">${ic.cap}</div>
        <div class="report-school">
          <h2>${esc(s.name)}</h2>
          <div class="addr">${esc(s.address)}</div>
          <div class="tag">${esc(s.tag)}</div>
        </div>
      </div>

      <div class="report-body">
        <div class="report-title">
          <h3>Terminal Report Card</h3>
          <p>${esc(term)} — ${esc(sessionLabel)} Academic Session</p>
        </div>

        <div class="bio">
          <div class="bio-photo">${ic.users}</div>
          <div class="bio-grid">
            <div class="bio-row"><span class="k">Name</span><span class="v">${esc(st ? st.name : "—")}</span></div>
            <div class="bio-row"><span class="k">Student ID</span><span class="v code">${esc(st ? st.id : "—")}</span></div>
            <div class="bio-row"><span class="k">Class</span><span class="v">${esc(r.cls || (st ? st.cls : "—"))}</span></div>
            <div class="bio-row"><span class="k">Gender</span><span class="v">${esc(st && st.gender ? st.gender : "—")}</span></div>
            <div class="bio-row"><span class="k">Age</span><span class="v">${st ? ageFromDob(st.dob) : "—"} years</span></div>
            <div class="bio-row"><span class="k">No. in Class</span><span class="v">${r.classSize}</span></div>
            <div class="bio-row"><span class="k">Position</span><span class="v">${r.position} of ${r.classSize}</span></div>
            <div class="bio-row"><span class="k">Attendance</span><span class="v">${r.attendance.present} / ${r.attendance.total} (${attPct}%)</span></div>
          </div>
        </div>

        <h4 class="section">Academic Performance</h4>
        <div class="table-wrap">
          <table class="report-table">
            <thead>
              <tr><th>Subject</th><th>CA (40)</th><th>Exam (60)</th><th>Total (100)</th><th>Grade</th><th>Remark</th></tr>
            </thead>
            <tbody>${subjRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="3">Total Score</td>
                <td>${r.total} / ${r.rows.length * 100}</td>
                <td colspan="2">Average: <strong>${r.average}%</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <h4 class="section">Affective &amp; Psychomotor Traits</h4>
        <div class="traits-grid" style="margin-bottom:6px">
          ${AFFECTIVE.map(([k, v]) => `<div class="trait"><span class="cell-muted">${k}</span><span class="rating">${v}</span></div>`).join("")}
        </div>
        <div style="height:14px"></div>
        <div class="traits-grid">
          ${PSYCHOMOTOR.map(([k, v]) => `<div class="trait"><span class="cell-muted">${k}</span><span class="rating">${v}</span></div>`).join("")}
        </div>

        <h4 class="section">Class Teacher's Remark</h4>
        <div class="remarks">
          ${esc(st ? st.name.split(" ")[0] : "The student")} ${esc(r.remark || "has performed satisfactorily")} this term. A little more attention to
          <strong>${esc(r.rows.length ? r.rows[r.rows.length - 1].subject : "core subjects")}</strong> will help reach the top of the class. Keep it up!
        </div>

        <div class="sign-row">
          <div class="sign">
            <div class="line"><span class="sig-name" id="ct-sign-name">${esc(classTeacherName(r.cls || (st ? st.cls : ""), s.id))}</span></div>
            <div class="role">Class Teacher</div>
          </div>
          <div class="sign">
            <div class="line"><span class="sig-name" id="pr-sign-name">${esc(principalName(s))}</span></div>
            <div class="role">Principal</div>
          </div>
        </div>

        <p style="text-align:center;color:var(--muted);font-size:11.5px;margin-top:24px">
          This report card was generated electronically by Syntax SaaS on ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}.
        </p>
      </div>
    </div>
  </div>`;
}

/* ============================================================
   Responsive behaviour: navigation drawer, touch & tooltips
   ============================================================ */
let navOpen = false;

function setNavOpen(open) {
  navOpen = !!open;
  const sb = $("#sidebar");
  const bd = $(".sidebar-backdrop");
  const hb = $(".hamburger");
  if (sb && sb.classList) { if (open) sb.classList.add("open"); else sb.classList.remove("open"); }
  if (bd && bd.classList) { if (open) bd.classList.add("show"); else bd.classList.remove("show"); }
  if (document.body && document.body.classList) { if (open) document.body.classList.add("nav-open"); else document.body.classList.remove("nav-open"); }
  if (hb && hb.setAttribute) hb.setAttribute("aria-expanded", open ? "true" : "false");
}

/* Tailor inputs to mobile keyboards / desktop behaviour without editing every template */
function enhanceInputs(root) {
  if (!root || typeof root.querySelectorAll !== "function") return;
  const nodes = root.querySelectorAll("input, select, textarea");
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i];
    if (!el || typeof el.getAttribute !== "function" || typeof el.setAttribute !== "function") continue;
    const type = String(el.getAttribute("type") || "").toLowerCase();
    const key = ((el.getAttribute("name") || "") + " " + (el.getAttribute("id") || "")).toLowerCase();
    if (type === "search") {
      el.setAttribute("enterkeyhint", "search");
      el.setAttribute("autocapitalize", "off");
      el.setAttribute("spellcheck", "false");
    } else if (type === "email") {
      el.setAttribute("autocapitalize", "off");
      el.setAttribute("autocorrect", "off");
      el.setAttribute("spellcheck", "false");
      el.setAttribute("autocomplete", "email");
      el.setAttribute("enterkeyhint", "next");
    } else if (type === "number") {
      el.setAttribute("inputmode", "numeric");
    } else if (type === "password") {
      el.setAttribute("autocapitalize", "off");
      el.setAttribute("spellcheck", "false");
    } else if (type === "" || type === "text") {
      if (/contact|phone|tel|mobile/.test(key)) {
        el.setAttribute("inputmode", "tel");
        el.setAttribute("autocomplete", "tel");
      } else if (/name|guardian|teacher|school|address|class/.test(key)) {
        el.setAttribute("autocapitalize", "words");
      }
    }
  }
}

/* Lightweight tooltips for action buttons (reads title / data-tip) */
let tipEl = null, tipSrc = null, tipMovedTitle = false;
function tipHide() {
  if (tipEl && tipEl.parentNode && tipEl.parentNode.removeChild) tipEl.parentNode.removeChild(tipEl);
  tipEl = null;
  if (tipMovedTitle && tipSrc && tipSrc.getAttribute && tipSrc.setAttribute) {
    const t = tipSrc.getAttribute("data-tip");
    if (t) tipSrc.setAttribute("title", t);
    if (tipSrc.removeAttribute) tipSrc.removeAttribute("data-tip");
  }
  tipMovedTitle = false;
  tipSrc = null;
}
function tipShow(el) {
  if (!el || !el.getAttribute) return;
  const text = String((el.getAttribute("data-tip") || el.getAttribute("title")) || "").trim();
  if (!text) return;
  tipMovedTitle = false;
  if (el.getAttribute("title") && el.setAttribute && el.removeAttribute) {
    if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", text);
    el.setAttribute("data-tip", text);
    el.removeAttribute("title");
    tipMovedTitle = true;
  }
  tipSrc = el;
  tipEl = document.createElement("div");
  tipEl.className = "app-tip";
  tipEl.textContent = text;
  if (document.body && document.body.appendChild) document.body.appendChild(tipEl);
  const r = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
  if (r && tipEl.style) {
    const half = (tipEl.offsetWidth || text.length * 7) / 2 + 8;
    const vw = window.innerWidth || 1200;
    const left = Math.min(Math.max(r.left + r.width / 2, half), vw - half);
    tipEl.style.left = left + "px";
    tipEl.style.top = Math.max(8, r.top - 10) + "px";
  }
}
document.addEventListener("mouseover", (e) => {
  const el = e.target && e.target.closest ? e.target.closest("[title],[data-tip]") : null;
  if (el && el !== tipSrc) { tipHide(); tipShow(el); }
});
document.addEventListener("mouseout", (e) => {
  const el = e.target && e.target.closest ? e.target.closest("[title],[data-tip]") : null;
  if (el && el === tipSrc) tipHide();
});
document.addEventListener("focusin", (e) => {
  const el = e.target && e.target.closest ? e.target.closest("[title],[data-tip]") : null;
  if (el && el !== tipSrc) { tipHide(); tipShow(el); }
});
document.addEventListener("focusout", () => { if (tipSrc) tipHide(); });

/* ============================================================
   Event handling
   ============================================================ */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.getAttribute("data-action");
  const rawId = btn.getAttribute("data-id");
  const id = Number(rawId);

  switch (action) {
    case "noop":
      e.preventDefault();
      toast("Demo action", "This control is illustrative in the prototype.", "info");
      break;

    case "auth:tab":
      state.auth.tab = btn.getAttribute("data-tab");
      render();
      break;
    case "auth:logout":
      if (LIVE_API) { try { SyntaxApi.auth.logout(); } catch (e) {} }
      clearSession();
      state.auth.tier = null;
      state.auth.admin = { loggedIn: false, schoolId: null, email: "" };
      state.auth.teacher = { loggedIn: false, teacherId: null, email: "" };
      state.auth.student = { loggedIn: false, id: "", term: "First Term" };
      state.adminSection = "dashboard";
      closeModal();
      render();
      break;

    case "sidebar:toggle":
      setNavOpen(!navOpen);
      break;
    case "sidebar:close":
      setNavOpen(false);
      break;

    case "admin:nav":
      state.adminSection = btn.getAttribute("data-section");
      setNavOpen(false);
      render();
      break;

    case "super:new":
      newSchoolModal();
      break;

    case "teacher:invite":
      inviteTeacherModal();
      break;
    case "teacher:verify": {
      const t = teacherById(rawId);
      if (t) { if (!t.otp) t.otp = randomOtp(); otpModal(t); }
      break;
    }
    case "teacher:resendOtp": {
      const t = teacherById(rawId);
      if (t) {
        t.otp = randomOtp();
        otpModal(t);
        toast("OTP resent", `A new code was sent to ${t.email}.`, "info");
      }
      break;
    }

    case "student:new":
      studentModal();
      break;
    case "student:view": {
      const st = state.students.find((s) => s.id === rawId);
      if (st) studentProfileModal(st);
      break;
    }
    case "student:resetPassword": {
      const st = state.students.find((s) => s.id === rawId);
      if (st) resetPasswordModal(st);
      break;
    }
    case "student:genPass": {
      const target = btn.getAttribute("data-target");
      const pfx = btn.getAttribute("data-prefix") || schoolPrefix(state.school);
      const input = target ? $("#" + target) : null;
      if (input) input.value = genPassword(pfx);
      break;
    }
    case "student:edit": {
      const st = state.students.find((s) => s.id === rawId);
      if (st) studentModal(st);
      break;
    }
    case "student:delete": {
      const st = state.students.find((s) => s.id === rawId);
      if (!st) break;
      openModal(`
        <div class="modal-head">
          <div><h3>Delete Student</h3><div class="sub">This action cannot be undone.</div></div>
          <button class="close-x" data-action="modal:close">${ic.x}</button>
        </div>
        <div class="modal-body">
          <p style="font-size:14px;color:#334155">Remove <strong>${esc(st.name)}</strong> (${st.id}) and all associated records from this school?</p>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" data-action="modal:close">Cancel</button>
          <button class="btn btn-red" data-action="student:confirmDelete" data-id="${st.id}">${ic.trash}<span>Delete Student</span></button>
        </div>`);
      break;
    }
    case "student:confirmDelete": {
      const st = state.students.find((s) => s.id === rawId);
      state.students = state.students.filter((s) => s.id !== rawId);
      closeModal();
      toast("Student deleted", st ? st.name + " removed." : "", "error");
      render();
      break;
    }

    case "teacher:new":
      teacherModal();
      break;
    case "teacher:edit": {
      const t = state.teachers.find((x) => x.id === rawId);
      if (t) teacherModal(t);
      break;
    }
    case "teacher:delete": {
      const t = state.teachers.find((x) => x.id === rawId);
      if (!t) break;
      openModal(`
        <div class="modal-head">
          <div><h3>Delete Teacher</h3><div class="sub">This action cannot be undone.</div></div>
          <button class="close-x" data-action="modal:close">${ic.x}</button>
        </div>
        <div class="modal-body">
          <p style="font-size:14px;color:#334155">Remove <strong>${esc(t.name)}</strong> from the teaching staff?</p>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" data-action="modal:close">Cancel</button>
          <button class="btn btn-red" data-action="teacher:confirmDelete" data-id="${t.id}">${ic.trash}<span>Delete Teacher</span></button>
        </div>`);
      break;
    }
    case "teacher:confirmDelete": {
      const t = state.teachers.find((x) => x.id === rawId);
      state.teachers = state.teachers.filter((x) => x.id !== rawId);
      closeModal();
      toast("Teacher deleted", t ? t.name + " removed." : "", "error");
      render();
      break;
    }

    case "fees:pay": {
      const st = state.students.find((s) => s.id === rawId);
      if (st && st.due > 0) paymentModal(st);
      break;
    }
    case "super:extend": {
      const school = state.schools.find((s) => s.id === id);
      if (school) {
        school.renewal = addDays(school.renewal, 30);
        if (school.status === "expired" || school.status === "grace" || school.status === "locked") school.status = "active";
        if (id === state.school.id) {
          state.school.renewal = school.renewal;
          state.school.status = "active";
        }
        toast("Subscription extended", `${school.name} renewed to ${fmtDate(school.renewal)}.`);
        render();
      }
      break;
    }
    case "super:lock": {
      const school = state.schools.find((s) => s.id === id);
      if (school) {
        school.status = school.status === "locked" ? "active" : "locked";
        if (id === state.school.id) state.school.status = school.status;
        toast(school.status === "locked" ? "School locked" : "School unlocked", school.name, school.status === "locked" ? "error" : "success");
        render();
      }
      break;
    }
    case "super:delete": {
      const school = state.schools.find((s) => s.id === id);
      if (!school) break;
      openModal(`
        <div class="modal-head">
          <div><h3>Delete School</h3><div class="sub">This action cannot be undone.</div></div>
          <button class="close-x" data-action="modal:close">${ic.x}</button>
        </div>
        <div class="modal-body">
          <p style="font-size:14px;color:#334155">Are you sure you want to permanently remove <strong>${esc(school.name)}</strong> and all associated data from Syntax SaaS?</p>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" data-action="modal:close">Cancel</button>
          <button class="btn btn-red" data-action="super:confirmDelete" data-id="${id}">${ic.trash}<span>Delete Permanently</span></button>
        </div>`);
      break;
    }
    case "super:confirmDelete": {
      const school = state.schools.find((s) => s.id === id);
      state.schools = state.schools.filter((s) => s.id !== id);
      closeModal();
      toast("School deleted", school ? school.name + " removed." : "", "error");
      render();
      break;
    }

    case "bank:renew":
    case "bank:lockRenew": {
      bankTransferModal();
      break;
    }

    case "bank:copy": {
      const acct = btn.getAttribute("data-acct") || BANK_DETAILS.accountNumber;
      copyTextToClipboard(acct);
      toast("Account number copied", `${BANK_DETAILS.bank} account ${acct} copied to clipboard.`, "success");
      break;
    }

    case "payment:receipt": {
      const rec = state.school.pendingPayment;
      if (rec && rec.receipt) toast("Receipt attached", rec.receipt, "info");
      break;
    }

    case "subject:remove": {
      const container = btn.closest ? btn.closest("[data-tags]") : null;
      if (container) {
        const subj = btn.getAttribute("data-subject");
        writeTagList(container, readTagList(container).filter((s) => s.toLowerCase() !== String(subj).toLowerCase()));
      }
      break;
    }

    case "super:confirmPayment": {
      const school = state.schools.find((s) => s.id === id);
      if (school && school.pendingPayment) {
        delete school.pendingPayment;
        school.status = "active";
        school.renewal = addDays(new Date().toISOString().slice(0, 10), 30);
        closeModal();
        toast("Payment verified", `${school.name}'s bank transfer confirmed. Subscription renewed for 30 days.`, "success");
        render();
      }
      break;
    }

    case "super:rejectPayment": {
      const school = state.schools.find((s) => s.id === id);
      if (school && school.pendingPayment) {
        delete school.pendingPayment;
        if (state.school && state.school.id === school.id) delete state.school.pendingPayment;
        closeModal();
        toast("Payment rejected", `${school.name}'s transfer could not be matched. Contact the school admin.`, "error");
        render();
      }
      break;
    }

    case "teacher:tab": {
      const which = btn.getAttribute("data-tab");
      state.teacherTab = which === "upload" ? "upload" : "manual";
      render();
      break;
    }
    case "teacher:template": {
      const file = `${normClass(state.teacherCls) || "class"}_${normClass(state.teacherSubj) || "scores"}_template.csv`;
      const ok = downloadTextFile(file, scoreCsvTemplate());
      toast("CSV template ready", ok ? "Fill in the CA and exam columns, then upload the file back." : "Use columns Student, CA1, CA2, Exam when compiling your sheet.", "success");
      break;
    }
    case "teacher:upload": {
      openModal(`
        <div class="modal-head">
          <div><h3>Bulk Upload Scores</h3><div class="sub">Simulate importing a CSV / Excel score sheet.</div></div>
          <button class="close-x" data-action="modal:close">${ic.x}</button>
        </div>
        <div class="modal-body">
          <div style="border:2px dashed var(--border-strong);border-radius:14px;padding:30px;text-align:center;background:var(--bg)">
            <div class="stat-icon" style="margin:0 auto 12px">${ic.upload}</div>
            <div class="cell-strong">Drop <em>${esc(normClass(state.teacherCls) || "class")}_${esc(normClass(state.teacherSubj) || "scores")}.csv</em> here</div>
            <div class="cell-muted" style="margin-top:4px">or click to browse — columns: Student, CA1, CA2, Exam</div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" data-action="modal:close">Cancel</button>
          <button class="btn btn-primary" data-action="teacher:doUpload">${ic.upload}<span>Simulate Import</span></button>
        </div>`);
      break;
    }
    case "teacher:doUpload":
      closeModal();
      bulkUploadSim();
      state.teacherTab = "manual";
      render();
      toast("Import complete", "Scores populated from score sheet. Review and submit.", "success");
      break;

    case "teacher:classPick": {
      const name = btn.getAttribute("data-class");
      if (name) {
        state.teacherCls = name;
        state.teacherClassQuery = "";
        state.teacherSubjectFilter = "";
        const opts = subjectsForClass(name);
        state.teacherSubj = opts.includes(state.teacherSubj) ? state.teacherSubj : (opts[0] || "");
        render();
      }
      break;
    }

    case "teacher:submit": {
      const me = teacherById(state.auth.teacher && state.auth.teacher.teacherId);
      const cls = state.teacherCls, subj = state.teacherSubj || subjectsForClass(cls)[0] || "";
      if (!subj) { toast("No subject selected", "Choose a subject before submitting.", "error"); break; }
      const rows = ensureScores(cls, subj);
      const filled = rows.some((r) => ["ca1", "ca2", "exam"].some((k) => r[k] !== "" && r[k] !== null && r[k] !== undefined));
      if (!filled) { toast("No scores entered", "Fill in CA and exam scores for the broadsheet before submitting for approval.", "error"); break; }
      const cur = currentAssessment(cls, subj);
      if (cur && cur.status === "pending") { toast("Already pending approval", `${cls} · ${subj} is already awaiting the Principal's review.`, "info"); break; }
      if (cur) {
        cur.status = "pending"; cur.submittedAt = todayISO(); cur.note = "";
        cur.principal = principalName(state.school);
        toast("Re-submitted for approval", `${cls} · ${subj} was sent back to the Principal as Pending Approval.`);
      } else {
        state.assessments.unshift({
          id: "ASM-" + Date.now().toString().slice(-6),
          schoolId: state.school.id,
          teacherId: me ? me.id : null,
          teacher: me ? me.name : "Teacher",
          cls, subject: subj,
          term: state.auth.student ? state.auth.student.term : "First Term",
          principal: principalName(state.school),
          submittedAt: todayISO(), status: "pending", note: "",
        });
        toast("Submitted for approval", `${cls} · ${subj} scores sent to the Principal.`);
      }
      render();
      break;
    }

    case "class:new":
      classModal();
      break;
    case "class:edit": {
      const c = state.classes.find((x) => x.id === rawId);
      if (c) classModal(c);
      break;
    }
    case "class:delete": {
      const c = state.classes.find((x) => x.id === rawId);
      if (!c) break;
      openModal(`
        <div class="modal-head">
          <div><h3>Delete Class</h3><div class="sub">This action cannot be undone.</div></div>
          <button class="close-x" data-action="modal:close">${ic.x}</button>
        </div>
        <div class="modal-body">
          <p style="font-size:14px;color:#334155">Remove <strong>${esc(c.name)}</strong> and its subject mapping from ${esc(state.school.name)}?</p>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" data-action="modal:close">Cancel</button>
          <button class="btn btn-red" data-action="class:confirmDelete" data-id="${rawId}">${ic.trash}<span>Delete Class</span></button>
        </div>`);
      break;
    }
    case "class:confirmDelete": {
      state.classes = state.classes.filter((x) => x.id !== rawId);
      closeModal();
      toast("Class deleted", "The class and its subject mapping were removed.", "error");
      render();
      break;
    }

    case "assess:approve": {
      const a = state.assessments.find((x) => x.id === rawId);
      if (a) {
        a.status = "approved"; a.approvedAt = todayISO(); a.note = "";
        toast("Assessment approved", `${a.cls} · ${a.subject} grades are now published to report cards.`, "success");
        render();
      }
      break;
    }
    case "assess:revise": {
      const a = state.assessments.find((x) => x.id === rawId);
      if (!a) break;
      openModal(`
        <div class="modal-head">
          <div><h3>Request Revision</h3><div class="sub">Send feedback back to ${esc(a.teacher)}.</div></div>
          <button class="close-x" data-action="modal:close">${ic.x}</button>
        </div>
        <form data-action="form:revision" data-id="${rawId}">
          <div class="modal-body">
            <div class="list-row"><span class="cell-muted">Assessment</span><strong>${esc(a.cls)} · ${esc(a.subject)}</strong></div>
            <div class="field" style="margin-top:14px">
              <label for="rev-note">Feedback for the teacher</label>
              <textarea class="input" id="rev-note" name="note" rows="4" placeholder="e.g. Recheck the CA1 totals for students 4-8, then re-submit." required></textarea>
            </div>
          </div>
          <div class="modal-foot">
            <button type="button" class="btn btn-ghost" data-action="modal:close">Cancel</button>
            <button type="submit" class="btn btn-amber">${ic.refresh}<span>Send Revision Request</span></button>
          </div>
        </form>`);
      break;
    }

    case "form:studentlogin" :
      break;

    case "student:logout":
      state.auth.student = { loggedIn: false, id: "", term: "First Term" };
      saveSession();
      render();
      break;

    case "student:print":
      window.print();
      break;
    case "student:download":
      toast("Generating PDF…", "Your report card PDF is being prepared.", "info");
      setTimeout(() => window.print(), 500);
      break;

    case "modal:close":
      closeModal();
      break;
    case "modal:backdrop":
      if (e.target === btn) closeModal();
      break;
  }
});

/* Change events (selects, toggles) */
document.addEventListener("change", (e) => {
  const filter = e.target.closest("[data-filter]");
  if (filter) {
    const kind = filter.getAttribute("data-filter");
    if (kind === "students") applyStudentsFilter();
    if (kind === "teachers") applyTeachersFilter();
    return;
  }
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.getAttribute("data-action");
  if (action === "teacher:subject") { state.teacherSubj = el.value; state.teacherSubjectFilter = ""; render(); }
  if (action === "teacher:file") {
    const file = el.files && el.files[0];
    importScoreFile(file, (count, fname) => {
      if (count) {
        state.teacherTab = "manual";
        render();
        toast("Import complete", `${count} student${count === 1 ? "" : "s"} updated from ${fname}. Review and submit.`, "success");
      } else {
        toast("No matching scores", "Ensure the file uses columns Student, CA1, CA2, Exam.", "error");
      }
    });
    return;
  }
  if (action === "student:feeToggle") {
    const due = $("#st-due");
    if (due) {
      due.disabled = el.value === "paid";
      if (el.value === "paid") due.value = 0;
    }
  }
  if (action === "toggle:debtors") {
    state.school.restrictDebtors = el.checked;
    toast("Debtors control " + (el.checked ? "enabled" : "disabled"),
      el.checked ? "Students with unpaid fees will not see results." : "All students can now view results.", "info");
    render();
  }
});

/* Live score calculation + live filters */
document.addEventListener("input", (e) => {
  const filter = e.target.closest("[data-filter]");
  if (filter) {
    const kind = filter.getAttribute("data-filter");
    if (kind === "students") applyStudentsFilter();
    if (kind === "teachers") applyTeachersFilter();
    return;
  }
  const clsInput = e.target.closest('[data-action="teacher:classSearch"]');
  if (clsInput) {
    state.teacherClassQuery = clsInput.value;
    const field = clsInput.closest ? clsInput.closest(".class-field") : null;
    const combo = field && field.querySelector ? field.querySelector("[data-combo]") : null;
    const opts = schoolClassOptions();
    const q = String(clsInput.value || "").trim().toLowerCase();
    const matches = opts.filter((c) => !q || c.toLowerCase().includes(q));
    if (combo) {
      combo.innerHTML = matches.map((c) => `<button type="button" class="combo-item ${normClass(c) === normClass(state.teacherCls) ? "active" : ""}" data-action="teacher:classPick" data-class="${esc(c)}"><span>${esc(c)}</span>${normClass(c) === normClass(state.teacherCls) ? `<span class="combo-current">current</span>` : ""}</button>`).join("") || `<div class="combo-empty">No matching classes</div>`;
      if (field.classList && field.classList.add) field.classList.add("has-query");
    }
    return;
  }
  const dest = e.target.closest('[data-action="teacher:subjectSearch"]');
  if (dest) {
    state.teacherSubjectFilter = dest.value;
    const opts = subjectsForClass(state.teacherCls);
    const filtered = opts.filter((s) => {
      const q = String(state.teacherSubjectFilter || "").toLowerCase();
      return !q || s.toLowerCase().includes(q);
    });
    if (!filtered.includes(state.teacherSubj) && filtered.length) state.teacherSubj = filtered[0];
    render();
    return;
  }
  const pr = e.target.closest('[data-action="principal:set"]');
  if (pr) {
    const val = String(pr.value || "").trim();
    if (state.school) state.school.principal = val;
    const rec = state.schools.find((x) => x.id === (state.school && state.school.id));
    if (rec) rec.principal = val;
    const sig = document.querySelector("#pr-sign-name");
    if (sig) sig.textContent = val || "A. Bello";
    return;
  }
  const el = e.target.closest(".score-input");
  if (!el) return;
  const i = Number(el.getAttribute("data-i"));
  const k = el.getAttribute("data-k");
  const rows = ensureScores(state.teacherCls, state.teacherSubj);
  let val = el.value === "" ? "" : Math.max(0, Math.min(Number(el.value), Number(el.getAttribute("max"))));
  if (val !== "" && val !== Number(el.value)) el.value = val;
  rows[i][k] = val;
  recomputeRow(i);
});

/* Searchable class combo: keep the dropdown open through mousedown→click */
document.addEventListener("focusin", (e) => {
  const f = e.target.closest && e.target.closest(".class-field");
  if (f && f.classList) f.classList.add("open");
});
document.addEventListener("mousedown", (e) => {
  const f = e.target.closest && e.target.closest(".class-field");
  document.querySelectorAll(".class-field.open").forEach((el) => { if (el !== f) el.classList.remove("open"); });
});

/* Form submits */
document.addEventListener("submit", (e) => {
  const form = e.target.closest("[data-action]");
  if (!form) return;
  const action = form.getAttribute("data-action");
  e.preventDefault();

  if (action === "form:newschool") {
    const data = new FormData(form);
    const adminEmail = String(data.get("adminEmail") || "").trim().toLowerCase();
    if (state.schools.some((s) => (s.adminEmail || "").toLowerCase() === adminEmail)) {
      toast("Email already in use", "Another school is already registered with that admin email.", "error");
      return;
    }
    const school = {
      id: Date.now() % 100000,
      name: String(data.get("name") || "").trim() || "Untitled School",
      tag: "Newly Registered",
      address: "—",
      students: Number(data.get("students")) || 0,
      status: "active",
      renewal: data.get("renewal"),
      plan: Number(data.get("plan")) || 49,
      adminEmail,
      password: DEFAULT_ADMIN_PASSWORD,
    };
    state.schools.push(school);
    closeModal();
    toast("School registered", `${school.name} created. Admin login: ${adminEmail} / ${DEFAULT_ADMIN_PASSWORD}`);
    render();
  }

  if (action === "form:ownerlogin") {
    if (LIVE_API) { liveLogin("owner", form); return; }
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const pass = String(data.get("password") || "");
    if (email !== OWNER_EMAIL || pass !== OWNER_PASSWORD) {
      toast("Sign-in failed", "Invalid master admin credentials.", "error");
      return;
    }
    state.auth.tier = "owner";
    saveSession();
    toast("Welcome back", "Signed in to the Platform Console.");
    render();
  }

  if (action === "form:adminlogin") {
    if (LIVE_API) { liveLogin("admin", form); return; }
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const pass = String(data.get("password") || "");
    const school = state.schools.find((s) => (s.adminEmail || "").toLowerCase() === email);
    if (!school || school.password !== pass) {
      toast("Sign-in failed", "Email or password is incorrect.", "error");
      return;
    }
    state.auth.tier = "admin";
    state.auth.admin = { loggedIn: true, schoolId: school.id, email: school.adminEmail };
    state.school = school;
    saveSession();
    if (isSubscriptionLocked(school)) toast("Subscription inactive", "Renew to restore full access.", "error");
    else toast("Welcome", `Signed in to ${school.name}.`);
    render();
  }

  if (action === "form:teacherlogin") {
    if (LIVE_API) { liveLogin("teacher", form); return; }
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const pass = String(data.get("password") || "");
    const teacher = state.teachers.find((t) => (t.email || "").toLowerCase() === email);
    if (!teacher || teacher.password !== pass) {
      toast("Sign-in failed", "Email or password is incorrect.", "error");
      return;
    }
    if (!teacher.verified) {
      toast("Account not verified", "This account is pending OTP verification by the school admin.", "error");
      return;
    }
    state.auth.tier = "teacher";
    state.auth.teacher = { loggedIn: true, teacherId: teacher.id, email: teacher.email };
    state.school = schoolById(teacher.schoolId) || state.school;
    saveSession();
    toast("Welcome", `Signed in as ${teacher.name}.`);
    render();
  }

  if (action === "form:inviteTeacher") {
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim().toLowerCase();
    if (state.teachers.some((t) => (t.email || "").toLowerCase() === email)) {
      toast("Email already invited", "A teacher with that email already exists.", "error");
      return;
    }
    const teacher = {
      id: "TCH" + Date.now().toString().slice(-6),
      schoolId: state.school.id,
      name: String(data.get("name") || "").trim() || "New Teacher",
      email,
      password: String(data.get("password") || DEFAULT_TEACHER_PASSWORD),
      subjects: collectSubjects(form),
      classes: Math.max(1, Number(data.get("classes")) || 1),
      status: "Active",
      verified: false,
      otp: randomOtp(),
    };
    teacher.subject = teacher.subjects.join(", ");
    state.teachers.unshift(teacher);
    toast("Invite sent", `OTP sent to ${email}.`);
    otpModal(teacher);
    render();
  }

  if (action === "form:otp") {
    const data = new FormData(form);
    const teacher = teacherById(form.getAttribute("data-id"));
    if (!teacher) { closeModal(); return; }
    const entered = String(data.get("otp") || "").trim();
    if (entered !== teacher.otp) {
      toast("Invalid OTP", "The code you entered is incorrect. Try again.", "error");
      return;
    }
    teacher.verified = true;
    delete teacher.otp;
    closeModal();
    toast("Account verified", `${teacher.name} can now sign in to the Teacher Portal.`);
    render();
  }

  if (action === "form:studentlogin") {
    if (LIVE_API) { liveLogin("student", form); return; }
    const data = new FormData(form);
    const sid = String(data.get("sid") || "").trim();
    const pin = String(data.get("pin") || "").trim();
    if (!sid || !pin) { toast("Missing details", "Enter your Student ID and password.", "error"); return; }
    const record = findStudentByLogin(sid);
    if (!record) { toast("Student not found", "No enrolled student matches that ID.", "error"); return; }
    const ok = pin === (record.password || "") || pin === DEFAULT_PIN;
    if (!ok) { toast("Invalid password", `Hint: use ${DEFAULT_PIN} or the password issued by your school.`, "error"); return; }
    state.school = schoolById(record.schoolId) || state.school;
    state.auth.tier = "student";
    state.auth.student = { loggedIn: true, id: record.id, term: data.get("term") || "First Term" };
    saveSession();
    toast("Verified", "Loading your term result…");
    render();
  }

  if (action === "form:student") {
    const data = new FormData(form);
    const sid = form.getAttribute("data-id");
    const name = String(data.get("name") || "").trim();
    const gender = String(data.get("gender") || "").trim();
    const dob = String(data.get("dob") || "").trim();
    const guardian = String(data.get("guardian") || "").trim();
    const contact = String(data.get("contact") || "").trim();
    const cls = String(data.get("cls") || "").trim();
    const address = String(data.get("address") || "").trim();
    const password = String(data.get("password") || "").trim();
    const owing = data.get("fee") === "owing";
    const due = owing ? Math.max(0, Number(data.get("due")) || 0) : 0;

    clearFieldErrors(form);
    let valid = true;
    const fail = (f, m) => { valid = false; formFieldError(form, f, m); };
    if (name.length < 3 || !/^[A-Za-z .'-]+$/.test(name)) fail("name", "Enter the student's full name (letters only).");
    if (!gender) fail("gender", "Select a gender.");
    if (!dob) fail("dob", "Select a date of birth.");
    else {
      const age = Number(ageFromDob(dob));
      if (!(age >= 4 && age <= 30)) fail("dob", "Date of birth suggests an invalid age.");
    }
    if (guardian.length < 2) fail("guardian", "Enter the parent/guardian name.");
    if (!/^[+()\d][\d\s()+.-]{6,}$/.test(contact)) fail("contact", "Enter a valid contact number.");
    if (CLASS_LEVELS.indexOf(cls) === -1) fail("cls", "Choose a valid class.");
    if (address.length < 4) fail("address", "Enter the residential address.");
    if (password.length < 6) fail("password", "Password must be at least 6 characters.");
    if (!valid) { toast("Check the form", "Some fields need attention.", "error"); return; }

    const bio = { name, gender, dob, guardian, contact, address, cls, due, paid: due === 0, password };
    if (sid) {
      const st = state.students.find((s) => s.id === sid);
      if (st) Object.assign(st, bio);
      toast("Student updated", `${name}'s record has been saved.`);
    } else {
      const gen = nextStudentId(state.school.id);
      const prefix = schoolPrefix(state.school);
      const record = {
        id: gen.id, prefix, seq: gen.seq, schoolId: state.school.id,
        ...bio,
        entryCls: cls, enrolledYear: gen.year, pin: DEFAULT_PIN,
        status: "Active", createdAt: new Date().toISOString().slice(0, 10),
      };
      record.history = buildHistory(record);
      state.students.unshift(record);
      toast("Student enrolled", `${name} added to ${cls} · ID ${gen.id}. Credentials generated.`);
    }
    closeModal();
    render();
  }

  if (action === "form:resetPassword") {
    const data = new FormData(form);
    const st = state.students.find((s) => s.id === form.getAttribute("data-id"));
    if (!st) { closeModal(); return; }
    const password = String(data.get("password") || "").trim();
    clearFieldErrors(form);
    if (password.length < 6) { formFieldError(form, "password", "Password must be at least 6 characters."); toast("Password too short", "Use at least 6 characters.", "error"); return; }
    st.password = password;
    closeModal();
    toast("Password updated", `${st.name} can sign in with the new password.`);
    render();
  }


  if (action === "form:class") {
    const data = new FormData(form);
    const id = form.getAttribute("data-id");
    const name = String(data.get("name") || "").trim().replace(/\s+/g, " ");
    if (!name) { toast("Class name required", "Give this class a name, e.g. JSS 1A or SS 3 Science.", "error"); return; }
    const teacher = String(data.get("teacher") || "").trim() || "—";
    const subjects = uniqueSubjects(collectSubjects(form));
    if (!subjects.length) { toast("Add at least one subject", "Tag the subjects taught in this class before saving.", "error"); return; }
    if (id) {
      const c = state.classes.find((x) => x.id === id);
      if (c) { Object.assign(c, { name, teacher, subjects }); toast("Class updated", `${name} and its subjects were saved.`); }
    } else {
      state.classes.push({ id: "CLS" + Date.now().toString().slice(-6), schoolId: state.school.id, name, teacher, subjects, students: 0 });
      toast("Class created", `${name} added to the curriculum with ${subjects.length} subjects.`, "success");
    }
    closeModal();
    render();
  }

  if (action === "form:revision") {
    const a = state.assessments.find((x) => x.id === form.getAttribute("data-id"));
    if (a) {
      const note = String(new FormData(form).get("note") || "").trim();
      a.status = "revised"; a.note = note || "Revision requested by the Principal."; a.revisedAt = todayISO();
      toast("Revision requested", `Feedback sent to ${a.teacher} for ${a.cls} · ${a.subject}.`);
      render();
    }
    closeModal();
  }

  if (action === "form:bankTransfer") {
    const data = new FormData(form);
    const s = state.school;
    const reference = String(data.get("reference") || "").trim();
    if (!reference) { toast("Reference required", "Enter the transfer reference to confirm your payment.", "error"); return; }
    let receipt = "";
    const file = data.get("receipt");
    if (file) {
      if (typeof file === "object" && file.name) receipt = String(file.name);
      else if (typeof file === "string") receipt = file.trim();
    }
    const pend = { reference, receipt, amount: s.plan, submittedAt: new Date().toISOString().slice(0, 10), status: "pending" };
    if (state.school) state.school.pendingPayment = pend;
    const rec = state.schools.find((x) => x.id === s.id);
    if (rec) rec.pendingPayment = pend;
    closeModal();
    toast("Submission received", `Your ${BANK_DETAILS.bank} transfer is pending verification by the platform owner.`, "success");
    render();
  }

  if (action === "form:teacher") {
    const data = new FormData(form);
    const tid = form.getAttribute("data-id");
    const name = String(data.get("name") || "").trim();
    if (!name) { toast("Name required", "Enter the teacher's full name.", "error"); return; }
    const record = {
      name,
      subjects: collectSubjects(form),
      classes: Math.max(1, Number(data.get("classes")) || 1),
      status: data.get("status"),
    };
    record.subject = record.subjects.join(", ");
    if (tid) {
      const t = state.teachers.find((x) => x.id === tid);
      if (t) Object.assign(t, record);
      toast("Teacher updated", `${name}'s record has been saved.`);
    } else {
      state.teachers.unshift({ id: "TCH" + Date.now().toString().slice(-6), ...record });
      toast("Teacher added", `${name} added to the teaching staff.`);
    }
    closeModal();
    render();
  }

  if (action === "form:payment") {
    const data = new FormData(form);
    const sid = form.getAttribute("data-id");
    const st = state.students.find((s) => s.id === sid);
    if (!st) return;
    const amount = Math.max(1, Math.min(Number(data.get("amount")) || 0, st.due));
    st.due -= amount;
    if (st.due <= 0) { st.due = 0; st.paid = true; }
    state.fees.collected += amount;
    state.fees.pending = Math.max(0, state.fees.pending - amount);
    state.fees.expected = state.fees.collected + state.fees.pending;
    closeModal();
    toast("Payment recorded", `${money(amount)} received from ${st.name}.`);
    render();
  }
});

/* Demo controls */
document.addEventListener("click", (e) => {
  const el = e.target.closest('[data-action="demo:expire"]');
  if (el) {
    if (!state.auth.tier) return;
    const target = state.school || demoSchool();
    target.status = "expired";
    const rec = state.schools.find((x) => x.id === target.id);
    if (rec) rec.status = "expired";
    toast("Subscription expired", "The gatekeeper lock screen is now active.", "error");
    render();
  }
  if (e.target.closest('[data-action="demo:reset"]')) {
    clearSession();
    location.reload();
  }
});

/* ============================================================
   LIVE API AUTHENTICATION (optional)
   Enabled by setting window.API_CONFIG.useLiveApi = true before
   app.js loads. Authenticates against the backend via SyntaxApi
   (api.js) and hydrates the in-memory state so the rest of the
   UI keeps working unchanged.
   ============================================================ */
const LIVE_API =
  typeof window !== "undefined" &&
  window.API_CONFIG &&
  window.API_CONFIG.useLiveApi === true &&
  typeof window.SyntaxApi !== "undefined";

function liveMapStatus(s) {
  return { Active: "active", Expired: "expired", Grace: "grace", Locked: "locked" }[s] || "active";
}

function liveUpsertSchool(u) {
  const iso = u.subscriptionExpiresAt ? String(u.subscriptionExpiresAt).slice(0, 10) : "";
  const rec = {
    id: u.id,
    code: u.uniqueSchoolPrefix || "",
    name: u.name,
    tag: "",
    address: "—",
    students: 0,
    status: liveMapStatus(u.subscriptionStatus),
    renewal: iso,
    plan: u.planMonthly || 0,
    adminEmail: u.email,
    principal: u.principalName || "",
    principalName: u.principalName || "",
    uniqueSchoolPrefix: u.uniqueSchoolPrefix || "",
    academic: u.academic || null,
  };
  const existing = state.schools.find((s) => String(s.id) === String(u.id));
  if (existing) Object.assign(existing, rec);
  else state.schools.push(rec);
  return state.schools.find((s) => String(s.id) === String(u.id));
}

function liveUpsertTeacher(u) {
  const subjects = String(u.subject || "").split(",").map((s) => s.trim()).filter(Boolean);
  const rec = {
    id: u.id,
    schoolId: u.schoolId,
    name: u.name,
    subject: subjects.join(", "),
    subjects,
    classes: 0,
    status: "Active",
    email: u.email,
    verified: !!u.verified,
  };
  const existing = state.teachers.find((t) => String(t.id) === String(u.id));
  if (existing) Object.assign(existing, rec);
  else state.teachers.push(rec);
  return state.teachers.find((t) => String(t.id) === String(u.id));
}

function liveUpsertStudent(u) {
  const parts = String(u.studentId || "").split("/");
  const rec = {
    id: u.studentId,
    schoolId: u.schoolId || (state.school && state.school.id),
    prefix: parts[0] || "",
    seq: Number(parts[2]) || 0,
    name: u.fullName,
    gender: u.gender || "",
    dob: u.dob ? String(u.dob).slice(0, 10) : "",
    guardian: "",
    contact: "",
    address: "",
    cls: u.currentClass || "",
    entryCls: u.currentClass || "",
    enrolledYear: Number(parts[1]) || new Date().getFullYear(),
    password: "",
    pin: "",
    due: 0,
    paid: true,
    status: "Active",
    history: [],
  };
  const existing = state.students.find((s) => String(s.id) === String(u.studentId));
  if (existing) Object.assign(existing, rec);
  else state.students.push(rec);
  return state.students.find((s) => String(s.id) === String(u.studentId));
}

async function liveLogin(role, form) {
  const data = new FormData(form);
  try {
    if (role === "student") {
      const res = await SyntaxApi.student.login({
        studentId: String(data.get("sid") || "").trim(),
        password: String(data.get("pin") || "").trim(),
      });
      SyntaxApi.setToken(res.token);
      liveUpsertStudent(res.user);
      state.auth.tier = "student";
      state.auth.student = { loggedIn: true, id: res.user.studentId, term: data.get("term") || "First Term" };
      saveSession();
      toast("Verified", "Loading your term result…");
      render();
      return;
    }

    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    const res = await SyntaxApi.auth.login(role, { email, password });
    SyntaxApi.setToken(res.token);

    if (role === "owner") {
      state.auth.tier = "owner";
      toast("Welcome back", "Signed in to the Platform Console.");
    } else if (role === "admin") {
      const school = liveUpsertSchool(res.user);
      state.school = school;
      state.auth.tier = "admin";
      state.auth.admin = { loggedIn: true, schoolId: school.id, email: school.adminEmail };
      if (isSubscriptionLocked(school)) toast("Subscription inactive", "Renew to restore full access.", "error");
      else toast("Welcome", `Signed in to ${school.name}.`);
    } else if (role === "teacher") {
      const t = liveUpsertTeacher(res.user);
      state.school = schoolById(t.schoolId) || state.school;
      state.auth.tier = "teacher";
      state.auth.teacher = { loggedIn: true, teacherId: t.id, email: t.email };
      toast("Welcome", `Signed in as ${t.name}.`);
    }
    saveSession();
    render();
  } catch (err) {
    const code = err && err.code;
    const msg = (err && err.message) || "Sign-in failed.";
    if (code === "OTP_REQUIRED") {
      toast("Account not verified", "This account is pending OTP verification by the school admin.", "error");
    } else if (code === "RATE_LIMITED") {
      toast("Too many attempts", "Please wait a moment before trying again.", "error");
    } else {
      toast("Sign-in failed", msg, "error");
    }
  }
}

async function liveRestore() {
  if (!LIVE_API) return;
  try {
    const me = await SyntaxApi.auth.me();
    const u = me && me.user;
    if (!u || !u.role) return;
    if (u.role === "owner") {
      state.auth.tier = "owner";
    } else if (u.role === "admin") {
      const school = liveUpsertSchool(await SyntaxApi.admin.getSchool());
      state.school = school;
      state.auth.tier = "admin";
      state.auth.admin = { loggedIn: true, schoolId: school.id, email: school.adminEmail };
    } else if (u.role === "teacher") {
      const t = liveUpsertTeacher({ id: u.id, schoolId: u.schoolId, name: u.email, email: u.email, verified: true });
      state.auth.tier = "teacher";
      state.auth.teacher = { loggedIn: true, teacherId: t.id, email: u.email };
    } else if (u.role === "student") {
      liveUpsertStudent({ studentId: u.email, schoolId: u.schoolId });
      state.auth.tier = "student";
      state.auth.student = { loggedIn: true, id: u.email, term: "First Term" };
    }
  } catch (e) {
    /* Not authenticated — remain on the login screen. */
  }
}

/* Escape closes modal */
/* ----------------------------- Init ----------------------------- */
if (LIVE_API) {
  liveRestore().finally(() => render());
} else {
  restoreSession();
  render();
}

/* Escape closes modal */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (document.querySelector(".modal-backdrop")) closeModal();
  if (navOpen) setNavOpen(false);
});

/* Tag entry: Enter or comma adds the subject chip */
document.addEventListener("keydown", (e) => {
  const entry = e.target && e.target.closest ? e.target.closest("[data-tags-entry]") : null;
  if (!entry) return;
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    const container = entry.closest("[data-tags]");
    if (!container) return;
    const list = readTagList(container);
    const raw = entry.value.trim();
    if (raw) {
      raw.split(",").map((s) => s.trim()).filter(Boolean).forEach((v) => {
        if (!list.some((x) => x.toLowerCase() === v.toLowerCase())) list.push(v);
      });
      writeTagList(container, list);
    }
    entry.value = "";
  }
});
