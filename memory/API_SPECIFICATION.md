# AIM Nature Cure ERP — Backend API Specification

Companion to the PRD, Gap Analysis, and Implementation Roadmap. Organized by module in roadmap order (Stage 1 → Stage 8). Each module maps to specific PRD screens and FR-numbers so nothing gets built without a traceable requirement.

**Conventions used throughout:**
- Base path: `/api/v1`
- Auth: every endpoint except `/auth/login` requires `Authorization: Bearer <JWT>`
- Role column: `Admin`, `Doctor`, or `Both` — enforced server-side in middleware, never trust the frontend
- `[BR-xx]` tags flag where a business rule constrains that endpoint's logic — check `/memory/01-business-rules.md` before implementing
- Replaces Prescripto's `userRoute.js` (patient self-service, parked), keeps the `adminRoute.js` / `doctorRoute.js` split pattern, adds new route files per module

---

## Stage 1 — Auth, Roles, Users

**Route file:** `authRoute.js`, `userManagementRoute.js`
**Screens:** Login, Forgot Password, User Management (Admin), My Profile

| Method | Endpoint | Purpose | Role |
|---|---|---|---|
| POST | `/auth/login` | Authenticate Admin or Doctor, return JWT + role | Public |
| POST | `/auth/logout` | Invalidate session/token (if using a blacklist or refresh-token store) | Both |
| POST | `/auth/forgot-password` | Send password reset token to registered email | Public |
| POST | `/auth/reset-password` | Consume reset token, set new password | Public |
| GET | `/auth/me` | Return current logged-in user's profile + role | Both |
| PUT | `/auth/me` | Update own profile (name, phone, photo) | Both |
| PUT | `/auth/change-password` | Change own password (requires current password) | Both |
| GET | `/users` | List all system users (Admins + Doctors) | Admin |
| POST | `/users` | Create a new Admin or Doctor account | Admin |
| GET | `/users/:id` | Get one user's account details | Admin |
| PUT | `/users/:id` | Update a user's account (role, contact info) | Admin |
| PATCH | `/users/:id/status` | Activate/deactivate an account `[FR-004]` | Admin |
| DELETE | `/users/:id` | Hard-delete a user account (rare — prefer deactivate) | Admin |

**Notes:** Session expiry on inactivity (`FR-005`) is a JWT-expiry/middleware concern, not a separate endpoint. Every write here should also write an `AuditLog` entry (Stage 9, but wire the hook now while the pattern is simple).

---

## Stage 2 — Patients & Consultations

**Route file:** `patientRoute.js`, `consultationRoute.js`
**Screens:** Patient Registration, Patient List, Patient Detail, New Consultation, Consultation History

### Patients

| Method | Endpoint | Purpose | Role |
|---|---|---|---|
| GET | `/patients` | List patients — Admin sees all, Doctor sees only assigned `[BR-02]` | Both |
| GET | `/patients/search?q=` | Search by name / phone / Patient ID `[FR-029]` | Both |
| POST | `/patients` | Register a new patient (Admin/Doctor entered, no self-service) `[FR-027]` | Both |
| GET | `/patients/:id` | Full patient detail incl. timeline summary | Both — `[BR-02]` applies |
| PUT | `/patients/:id` | Update patient info | Both — `[BR-02]` applies |
| PATCH | `/patients/:id/status` | Set Active / Inactive / Completed Treatment `[FR-031]` | Both |
| PATCH | `/patients/:id/assign-doctor` | (Re)assign patient to a doctor | Admin |
| GET | `/patients/:id/timeline` | Combined feed: consultations, sessions, invoices, follow-ups | Both — `[BR-02]` applies |

### Consultations

| Method | Endpoint | Purpose | Role |
|---|---|---|---|
| GET | `/patients/:patientId/consultations` | List a patient's consultation history | Both — `[BR-02]` applies |
| POST | `/patients/:patientId/consultations` | Create a new consultation record | Doctor |
| GET | `/consultations/:id` | Get one consultation (read-only view) | Both — `[BR-02]` applies |
| POST | `/consultations/:id/addendum` | Add a correction note — consultations are immutable after submit `[BR-13]` | Doctor |

**Notes:** There is deliberately **no `PUT /consultations/:id`** — do not build one. `BR-13` requires immutability; corrections are addenda only.

---

## Stage 3 — Therapies & Packages

**Route file:** `therapyRoute.js`, `packageRoute.js`, `therapySessionRoute.js`
**Screens:** Therapy Master, Package Master, Therapy Assignment, Therapy Sessions

### Therapy & Package Catalog (Admin-configured master data)

| Method | Endpoint | Purpose | Role |
|---|---|---|---|
| GET | `/therapies` | List all therapies (filter `?active=true`) | Both |
| POST | `/therapies` | Create a therapy (name, duration, price) `[FR-041]` | Admin |
| PUT | `/therapies/:id` | Update a therapy | Admin |
| PATCH | `/therapies/:id/status` | Activate/deactivate `[BR-14 — existing sessions stay valid]` | Admin |
| GET | `/packages` | List all packages | Both |
| POST | `/packages` | Create a package (bundle of therapies + session counts) `[FR-046]` | Admin |
| GET | `/packages/:id` | Package detail with included therapies | Both |
| PUT | `/packages/:id` | Update a package | Admin |
| PATCH | `/packages/:id/status` | Activate/deactivate | Admin |

### Assignment & Session Tracking (patient-specific)

| Method | Endpoint | Purpose | Role |
|---|---|---|---|
| POST | `/patients/:patientId/therapy-assignments` | Assign a standalone therapy or a package to a patient `[FR-044, FR-049]` | Doctor |
| GET | `/patients/:patientId/therapy-assignments` | List a patient's assigned therapies/packages | Both — `[BR-02]` |
| GET | `/patients/:patientId/therapy-sessions` | List generated sessions with consumed/remaining count `[FR-051]` | Both — `[BR-02]` |
| PATCH | `/therapy-sessions/:id/complete` | Mark one session complete, with date + notes `[FR-045]` | Doctor |
| PATCH | `/therapy-sessions/:id/reschedule` | Change a session's scheduled date | Doctor |

**Notes:** `POST .../therapy-assignments` is the endpoint that auto-generates individual `TherapySession` records (`FR-050`) — this is the piece with no Prescripto precedent; build and test it in isolation before wiring billing to it. Prices always pulled from the Therapy/Package record, never accepted from the request body `[BR-07]`.

---

## Stage 4 — Billing & Payments

**Route file:** `invoiceRoute.js`, `paymentRoute.js`
**Screens:** Generate Invoice, Invoice Detail, Record Payment, Receipt

| Method | Endpoint | Purpose | Role |
|---|---|---|---|
| POST | `/patients/:patientId/invoices` | Generate an invoice from consultation/session/package line items `[FR-053]` | Both |
| GET | `/invoices` | List invoices (filter by status/date/doctor) | Admin |
| GET | `/patients/:patientId/invoices` | List a patient's invoices | Both — `[BR-02]` |
| GET | `/invoices/:id` | Invoice detail with line items and payment history | Both |
| GET | `/invoices/:id/receipt` | Generate printable/downloadable receipt `[FR-060]` | Both |
| POST | `/invoices/:id/payments` | Record a payment against an invoice — Cash/UPI/Card/Bank `[FR-055, FR-056]` `[BR-08]` | Both |
| GET | `/invoices/:id/payments` | Payment history for one invoice | Both |
| GET | `/payments` | All payments (filter by date range, mode, doctor) — feeds revenue | Admin |

**Notes:** `BR-08` — a `Payment` can only be created against an existing `Invoice`; there is no standalone payment-recording endpoint. Invoice `status` (Paid/Partial/Pending) is a computed field updated on every payment write, not something the client sets directly `[FR-057, FR-058, BR-15]`.

---

## Stage 5 — Doctor Revenue & Incentives

**Route file:** `revenueRoute.js`, `incentiveRoute.js`
**Screens:** Doctor Revenue Report, Doctor-wise Comparison (Admin), My Revenue (Doctor), Incentive Configuration, My Incentive

| Method | Endpoint | Purpose | Role |
|---|---|---|---|
| GET | `/revenue/doctors/:doctorId?period=today\|week\|month` | Revenue for one doctor from **paid** amounts only `[FR-062, FR-063, BR-09]` | Both — Doctor can only query self |
| GET | `/revenue/doctors?period=` | Comparative doctor-wise revenue report `[FR-064, FR-066]` | Admin |
| GET | `/revenue/doctors/:doctorId/breakdown` | One doctor's revenue by patient and service type `[FR-065]` | Both — Doctor self only |
| GET | `/incentive-rules` | List all incentive rules/targets | Admin |
| POST | `/incentive-rules` | Create a target + percentage rule for a doctor, with effective date `[FR-068]` `[BR-04, BR-05]` | Admin |
| PUT | `/incentive-rules/:id` | Update a rule | Admin |
| GET | `/doctors/:doctorId/incentives?period=` | Calculated incentive for a period `[FR-069]` | Both — Doctor self only |
| GET | `/incentives/pending-review` | Incentives awaiting Admin approval before payout `[FR-070]` | Admin |
| PATCH | `/incentives/:id/approve` | Approve an incentive for payout | Admin |
| GET | `/doctors/:doctorId/incentives/projected` | Doctor's own projected incentive (dashboard widget) `[FR-071, FR-024]` | Doctor (self) |

**Notes:** ⚠️ **Do not build `GET /revenue/*` endpoints until the revenue-attribution decision is logged in `/memory/05-decisions-log.md`.** The query logic differs materially depending on whether revenue goes to the assigning doctor, the delivering doctor per session, or a configurable split — this affects the join between `TherapySession` and `DoctorRevenue`, not just a filter.

---

## Stage 6 — Follow-Ups & Reminders

**Route file:** `followUpRoute.js`, `reminderRoute.js`
**Screens:** Follow-Up List, Follow-Up Detail, Admin Follow-Up Overview, Reminders widget

| Method | Endpoint | Purpose | Role |
|---|---|---|---|
| POST | `/patients/:patientId/follow-ups` | Schedule a follow-up (date, mode) `[FR-073]` | Doctor |
| GET | `/follow-ups?status=today\|upcoming\|overdue` | Doctor's own follow-up list `[FR-075, FR-076]` | Doctor (self) |
| GET | `/follow-ups/all?status=` | Cross-doctor follow-up view `[FR-079]` | Admin |
| GET | `/follow-ups/stats` | Completed/pending/overdue counts `[FR-080]` | Admin |
| PATCH | `/follow-ups/:id/complete` | Record outcome notes, mark complete `[FR-077]` | Doctor |
| POST | `/follow-ups/:id/schedule-next` | Chain a new follow-up from a completed one `[FR-078]` | Doctor |
| GET | `/settings/follow-up-count` | Get the configured required-follow-up count `[BR-06]` | Both |
| PUT | `/settings/follow-up-count` | Update the configured count — **never hard-code this** `[FR-074, BR-06]` | Admin |
| GET | `/reminders/today` | Follow-ups + tasks due today/tomorrow for dashboard `[FR-081–084]` | Both |

**Notes:** `/settings/follow-up-count` existing as its own endpoint is a direct enforcement of `BR-06` — if a future task asks you to hard-code "3 follow-ups" anywhere in code, that's a business-rule violation; route it through this setting instead.

### WhatsApp (thin feature, same module)

| Method | Endpoint | Purpose | Role |
|---|---|---|---|
| POST | `/patients/:patientId/whatsapp-log` | Log outcome of a WhatsApp deep-link contact `[FR-086]` | Doctor |

No server-side WhatsApp API integration needed for V1 — the `wa.me` link opens client-side; this endpoint just logs that contact happened, feeding into `FollowUpNote`.

---

## Stage 7 — Leads & Social Media

**Route file:** `leadRoute.js`, `socialActivityRoute.js`
**Screens:** Lead Source Report, Social Media Submission, Admin Social Review

| Method | Endpoint | Purpose | Role |
|---|---|---|---|
| GET | `/lead-sources` | List configurable lead source options `[FR-089]` | Both |
| POST | `/lead-sources` | Add a custom lead source | Admin |
| GET | `/leads/report?period=` | Patient counts + revenue per source `[FR-091]` | Admin |
| PATCH | `/patients/:id/lead-source` | Override a patient's captured source `[BR-12]` | Admin only |
| POST | `/social-activities` | Submit a post (platform, type, date, screenshot upload) `[FR-093]` | Doctor |
| GET | `/social-activities?status=` | List submissions for review | Admin |
| GET | `/social-activities/my` | Doctor's own submission history | Doctor (self) |
| PATCH | `/social-activities/:id/review` | Mark Reviewed / Flagged `[FR-094]` | Admin |
| GET | `/social-activities/weekly-summary` | Submission counts for Admin dashboard `[FR-095]` | Admin |

**Notes:** Lead source is captured once at patient registration (`Stage 2`'s `POST /patients`) and is locked thereafter except via the Admin override endpoint above `[BR-12]`.

---

## Stage 8 — Doctor Workspace, Daily Reports & Analytics

**Route file:** `noteRoute.js`, `taskRoute.js`, `dailyReportRoute.js`, `analyticsRoute.js`
**Screens:** Personal Notes, My Tasks, Daily Closing Report, Daily/Weekly/Monthly Reports

### Doctor Notes (private)

| Method | Endpoint | Purpose | Role |
|---|---|---|---|
| GET | `/notes` | List own private notes `[FR-097]` | Doctor (self only — **no Admin route exists, by design** `[BR-03]`) |
| POST | `/notes` | Create a note | Doctor |
| PUT | `/notes/:id` | Edit a note | Doctor (own only) |
| PATCH | `/notes/:id/pin` | Pin/unpin | Doctor (own only) |
| PATCH | `/notes/:id/archive` | Archive | Doctor (own only) |
| DELETE | `/notes/:id` | Delete | Doctor (own only) |

**⚠️ `BR-03` enforcement point:** There must be no endpoint, admin flag, or query parameter anywhere that allows an Admin token to read another user's `/notes`. Enforce ownership at the query layer (`WHERE doctorId = req.user.id`), not just at the route/middleware layer — a middleware-only check is easy to accidentally bypass in a future admin "view all" endpoint.

### Doctor Tasks

| Method | Endpoint | Purpose | Role |
|---|---|---|---|
| GET | `/tasks?status=` | List own tasks, sorted by due date `[FR-101]` | Doctor (self) |
| POST | `/tasks` | Create a task | Doctor |
| PUT | `/tasks/:id` | Update task | Doctor (own only) |
| PATCH | `/tasks/:id/status` | Mark complete/in-progress `[FR-103]` | Doctor (own only) |
| DELETE | `/tasks/:id` | Delete task | Doctor (own only) |

### Daily Closing Report

| Method | Endpoint | Purpose | Role |
|---|---|---|---|
| POST | `/daily-reports` | Submit end-of-day summary `[FR-105]` | Doctor |
| GET | `/daily-reports?doctorId=&date=` | View a submitted report | Both |
| PATCH | `/daily-reports/:id/review` | Admin comment/flag `[FR-108]` | Admin |
| GET | `/daily-reports/pending-review` | Reports awaiting Admin review | Admin |

### Reporting & Analytics (read-only aggregation layer)

| Method | Endpoint | Purpose | Role |
|---|---|---|---|
| GET | `/reports/daily?date=` | Full daily aggregation across patients/revenue/follow-ups `[FR-109]` | Admin |
| GET | `/reports/weekly?weekStart=` | Weekly trends `[FR-110]` | Admin |
| GET | `/reports/monthly?month=` | Monthly targets/incentives/growth `[FR-111]` | Admin |
| GET | `/reports/:type/export?format=pdf\|csv` | Export any of the above `[FR-112]` | Admin |
| GET | `/dashboard/admin` | Admin Dashboard KPI bundle (one call, avoid N+1 widget fetches) `[FR-008–017]` | Admin |
| GET | `/dashboard/doctor` | Doctor Dashboard KPI bundle `[FR-018–026]` | Doctor (self) |

**Notes:** The two `/dashboard/*` endpoints are worth building as single aggregate calls rather than letting the frontend fire 8–10 separate widget requests on page load — bundle the KPI queries server-side.

---

## Stage 9 — Cross-Cutting (no dedicated screen)

**Route file:** `auditLogRoute.js`

| Method | Endpoint | Purpose | Role |
|---|---|---|---|
| GET | `/audit-logs?entity=&userId=&dateRange=` | Query audit trail `[Section 11, BR-10]` | Admin |

This isn't a "page" — it's a write-side hook. Every `POST`/`PUT`/`PATCH`/`DELETE` across every module above that touches Patients, Invoices, Payments, Consultations, or Incentive Rules should write an `AuditLog` entry (user, timestamp, entity, change summary) as a side effect, not as a separate client-initiated call.

---

## Build-Order Cross-Reference

| Roadmap Stage | Route files to build |
|---|---|
| 1 | `authRoute.js`, `userManagementRoute.js` |
| 2 | `patientRoute.js`, `consultationRoute.js` |
| 3 | `therapyRoute.js`, `packageRoute.js`, `therapySessionRoute.js` |
| 4 | `invoiceRoute.js`, `paymentRoute.js` |
| 5 | `revenueRoute.js`, `incentiveRoute.js` — **blocked on attribution decision** |
| 6 | `followUpRoute.js`, `reminderRoute.js` |
| 7 | `leadRoute.js`, `socialActivityRoute.js` |
| 8 | `noteRoute.js`, `taskRoute.js`, `dailyReportRoute.js`, `analyticsRoute.js` |
| 9 | `auditLogRoute.js` (+ retrofit hooks into all prior routes) |

Retire from `main` (already parked on `archive/patient-portal`): `userRoute.js`'s patient self-login/register endpoints, and any Stripe/Razorpay-backed routes.
