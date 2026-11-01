# Frontend ↔ Backend integration

The portal in `index.html` / `app.js` is a **self-contained demo**: it seeds its
data in memory and never talks to a server. `api.js` adds the missing piece —
`window.SyntaxApi`, a complete client for the backend REST API.

Nothing in `app.js` was rewritten, so the demo still works exactly as before.
The page now also loads `api.js`, so any code (or console session) can call the
live API. Migrate screen-by-screen using the mapping below.

## 1. Run the backend

```bash
cd backend
cp .env.example .env          # set JWT_SECRET
npm run seed:owner
npm run dev                   # http://localhost:4000
```

## 2. Serve the frontend over http

Cookies + CSRF require an `http(s)` origin. From the repo root:

```bash
npx serve -l 3000            # or: python -m http.server 3000
```

Open `http://localhost:3000`. Make sure this origin is listed in the backend's
`CORS_ORIGINS` (default already allows `http://localhost:3000`).

> Opening the page via `file://` will **not** work — browsers block cookies and
> credentialed CORS for `file://`.

## 3. Configure the client

`index.html` already sets:

```html
<script>
  window.API_CONFIG = { baseUrl: "http://localhost:4000", authMode: "cookie" };
</script>
```

- `authMode: "cookie"` — the backend sets an httpOnly session cookie and the
  client automatically echoes the CSRF token (double-submit). Best for browsers.
- `authMode: "bearer"` — the client stores the `token` returned by login and
  sends `Authorization: Bearer <token>`. Use for non-cookie clients.

## 3b. Turn on live authentication

`app.js` is now wired for live auth behind a single flag. Set it in
`index.html` **before** `app.js` loads:

```html
<script>
  window.API_CONFIG = { baseUrl: "http://localhost:4000", authMode: "cookie", useLiveApi: true };
</script>
```

With `useLiveApi: true`:

- All four login forms (`owner`, `admin`, `teacher`, `student`) authenticate
  against the backend via `SyntaxApi` instead of the hard-coded demo accounts.
- On success the returned profile is mapped into the in-memory state
  (`liveUpsertSchool` / `liveUpsertTeacher` / `liveUpsertStudent`), so every
  existing screen keeps rendering without changes.
- The session is restored on reload through `GET /api/auth/me` (and
  `GET /api/admin/school` for admins).
- Logout calls `POST /api/auth/logout` and clears the token.
- Errors surface as toasts, including `OTP_REQUIRED`, `RATE_LIMITED` and
  `INVALID_CREDENTIALS`.

Leaving the flag out (the default) keeps the original offline demo behaviour, so
you can flip between modes by editing one line.

> Data beyond auth (student lists, broadsheets, billing…) is still the seeded
> demo data for now — that is the next migration step (see the mapping table).

## 4. Call it

```js
// Log in (role: 'owner' | 'admin' | 'teacher' | 'student')
await SyntaxApi.auth.login('admin', { email: 'admin@brightfuture.edu', password: 'school123' });

// Read data
const { items } = await SyntaxApi.admin.listStudents({ page: 1, limit: 20, q: 'ada' });

// Write data (CSRF header handled automatically in cookie mode)
await SyntaxApi.admin.enrollStudent({ name: 'Ada Obi', classLevel: 'JSS1', ... });

// Errors are typed
try {
  await SyntaxApi.owner.setSchoolStatus(id, 'active');
} catch (e) {
  if (e instanceof SyntaxApi.ApiError) console.error(e.status, e.code, e.message, e.details);
}
```

## 5. Demo → live mapping

| Demo concept (in `app.js`) | Live call |
| --- | --- |
| Owner login (`OWNER_EMAIL`) | `SyntaxApi.auth.login('owner', { email, password })` |
| Admin login (`admin@<school>`) | `SyntaxApi.auth.login('admin', { email, password })` |
| Teacher login | `SyntaxApi.auth.login('teacher', { email, password })` + `verifyOtp` |
| Student login | `SyntaxApi.student.login({ studentId, pin })` |
| Owner dashboard cards | `SyntaxApi.owner.dashboard()` |
| School list / activate / lock | `SyntaxApi.owner.listSchools()` / `setSchoolStatus()` |
| Verify a bank payment | `SyntaxApi.owner.verifyPayment()` |
| School profile / academic year | `SyntaxApi.admin.getSchool()` / `updateAcademicSetting()` |
| Classes CRUD | `SyntaxApi.admin.listClasses()` / `createClass()` |
| Students list / enrol | `SyntaxApi.admin.listStudents()` / `enrollStudent()` |
| Teachers list / edit / remove | `SyntaxApi.admin.listTeachers()` / `updateTeacher()` / `removeTeacher()` |
| Pending results / approve | `SyntaxApi.admin.listAssessments()` / `reviewAssessment()` |
| Subscription bank transfer | `SyntaxApi.admin.submitBankTransfer()` |
| Teacher classes + subjects | `SyntaxApi.teacher.classesSubjects()` |
| Broadsheet load / save / submit | `SyntaxApi.teacher.getBroadsheet()` / `saveBroadsheet()` / `submitBroadsheet()` |
| Student portal results | `SyntaxApi.student.results({ term, session })` |

## 6. Suggested migration order

1. **Auth** — replace the hard-coded credential checks with
   `SyntaxApi.auth.login(...)` and route on the returned `role`/profile.
2. **Read-only screens** — dashboard, lists, results. Swap the seeded arrays
   for API responses (same fields, so the render functions barely change).
3. **Writes** — enrol/approve/save/submit. Wrap each in `try/catch` and surface
   `ApiError.message` through the existing toast helper.
4. **Remove seeds** — once every screen is live, delete the in-memory seed data.

`SyntaxApi.request(method, path, body)` is a raw escape hatch for any endpoint
not yet wrapped, and `SyntaxApi.getConfig()` reports the active configuration.

## Notes

- The backend returns `{ success, data }` on success and `{ success:false, error }`
  on failure; the client unwraps `data` and throws `ApiError` for you.
- `POST /api/auth/*` login/register/verify and `POST /api/student/login` do not
  require a CSRF token; everything else does (cookie mode).
- Rate limiting is applied to auth routes; a `400 RATE_LIMITED` means slow down.
- The OpenAPI spec (`backend/docs/openapi.yaml`) and Postman collection
  (`backend/docs/postman_collection.json`) document every request/response.

## Verifying the client

The client is covered by a contract test that boots the real backend and drives
`api.js` over HTTP:

```bash
cd backend
npm run test:client       # 9 checks: login, data unwrap, errors
```
