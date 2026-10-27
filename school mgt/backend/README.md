# Syntax SaaS — Backend API

Secure, modular, multi-tenant **School Management & Result Checking** API built
with **Node.js, TypeScript, Express.js and MongoDB (Mongoose)**.

Architecture follows a strict **Routes → Controllers → Services → Models**
separation of concerns, with cross-cutting logic isolated in `middleware/`,
`utils/` and `validators/`.

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env      # then edit JWT_SECRET, MONGO_URI, CORS_ORIGINS

# 3. Bootstrap the SaaS Owner (one-off)
npm run seed:owner

# 4. Run
npm run dev               # tsx watch, or:
npm run build && npm start
```

API is served at `http://localhost:4000` (override with `PORT`).
Interactive docs: `docs/openapi.yaml` (import into Swagger UI / Postman).

### Tests

```bash
npm run typecheck         # tsc --noEmit
npm run test:integration  # boots an in-memory MongoDB and runs 47 e2e checks
npm run test:client       # drives the browser client (../api.js) against a live app
```

### Docker

```bash
docker compose up --build
```

This starts MongoDB 7 and the API (see `docker-compose.yml`). Set `JWT_SECRET`
and Mongo credentials via a `.env` file in this directory.

---

## Project structure

```
src/
  app.ts                 Express app factory (helmet, CORS, CSRF, logging...)
  index.ts               Bootstrap: connect DB, ensure indexes, listen
  config/                env, db connection, index initialisation
  models/                Mongoose schemas (School, Owner, Teacher, Class,
                         Student, Assessment, Counter)
  middleware/            auth, tenant (IDOR), csrf, rateLimit, validate,
                         sanitize, requestContext, error
  services/              Business logic (auth, owner, admin, teacher, student)
  controllers/           Thin HTTP adapters
  routes/                Route tables + middleware wiring
  validators/            Zod request schemas
  utils/                 ApiError, responses, password, jwt, otp, grading,
                         pagination, studentId, serialize, session, mailer
  scripts/seedOwner.ts   Owner bootstrap
test/integration.ts      End-to-end test (in-memory MongoDB)
docs/                    OpenAPI spec + Postman collection
```

---

## Security

| Control | Implementation |
| --- | --- |
| Security headers | `helmet` (CSP, no framing), `x-powered-by` disabled |
| CORS | Strict origin allowlist (`CORS_ORIGINS`), credentials only |
| Brute-force protection | `express-rate-limit` on auth/login routes |
| IDOR / tenant isolation | `enforceTenant` middleware + `assertSameSchool` in services |
| Password policy | ≥8 chars, upper + lower + digit + special; enforced by Zod **and** services |
| Password hashing | bcrypt (`bcryptjs`), configurable cost; `select:false` + `toJSON` strip |
| CSRF | httpOnly `SameSite=strict` session cookie + double-submit `x-csrf-token` |
| NoSQL injection | Recursive sanitizer strips `$`/dotted keys; simple query parser |
| Sessions | Short-lived JWT (cookie or `Authorization: Bearer`) |
| Secrets | `JWT_SECRET` required and validated in production |
| Request tracing | `x-request-id` correlation id on every request |

### Auth model

- **Bearer** (`Authorization: Bearer <jwt>`) — stateless clients; CSRF-exempt.
- **Cookie** (`token`, httpOnly, SameSite=strict) — browsers; state-changing
  requests must echo the `csrfToken` cookie in the `x-csrf-token` header.

---

## API surface

| Area | Endpoints |
| --- | --- |
| `/api/auth` | `register-school`, `login`, `invite-teacher`, `verify-otp`, `me`, `logout` |
| `/api/owner` | `dashboard`, `schools` (list), `schools/:id/status`, `verify-payment` |
| `/api/admin` | `school`, `academic-setting`, `classes`, `students`, `teachers` (+`/:id`), `pending-assessments` (GET/POST), `subscription/bank-transfer` |
| `/api/teacher` | `classes-subjects`, `broadsheet` (GET), `broadsheet/save`, `broadsheet/submit` |
| `/api/student` | `login`, `results` (subscription-gated) |

All responses use a consistent envelope:

```jsonc
// success
{ "success": true, "message": "...", "data": { } }
// error
{ "success": false, "error": { "message": "...", "code": "...", "details": [] } }
```

Status codes: `200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`.

---

## Data model highlights

- **School** — admin credentials, `subscriptionStatus`, `subscriptionExpiresAt`,
  unique `uniqueSchoolPrefix`, `principalName`, `planMonthly`, academic calendar,
  `pendingPayment`.
- **Student** — auto-generated `[PREFIX]/[YEAR]/[SEQ]` id (atomic `Counter`),
  `historicalResults`.
- **Assessment** — `ca1`(≤20) + `ca2`(≤20) + `exam`(≤60) = `total`, `grade`,
  `status` (`Pending Approval` / `Approved` / `Revised`), `principalName`.

---

## Optional email delivery

OTP emails go through `src/utils/mailer.ts`. In development the message is
logged; in production wire a provider inside `deliver()` (SendGrid, SES,
Postmark, Resend, SMTP...). No other code changes are required.
