# API Handoff Document

**Confirmed Clean**
Zero Case Sheet or RemovalRequests references found in this document or in the screens audited. The repository has been verified clean of the unauthorized feature.

---

### Login — Both — `/login`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| POST | `/auth/login` | Authenticate Admin or Doctor | `{ email: string, password: string }` | `{ success: boolean, token: string, message?: string }` | Public | None |

- **Request Body / Response Shape**: `email`, `password` mapped to `{ success, token, message }`
- **Business Rules**: None
- **Spec Status**: **MATCHES**

---

### My Profile — Both — `/profile`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/auth/me` | Return current logged-in user's profile | None | `{ success: boolean, data: { _id: string, name: string, email: string, role: string, speciality?: string, image: string } }` | Both | None |
| PUT | `/auth/me` | Update own profile | `{ name: string, speciality?: string, image?: string }` | `{ success: boolean, message: string }` | Both | None |

- **Request Body / Response Shape**: Standard user profile fields.
- **Business Rules**: None
- **Spec Status**: **MATCHES**

---

### Dashboard — Admin — `/admin-dashboard`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/dashboard/admin` | Admin Dashboard KPI bundle | None | `{ success: boolean, data: { totalPatients: number, newPatients: number, totalDoctors: number, totalRevenue: number, pendingPayments: number, newLeadsCount: number, pendingSocial: number, pendingFollowUps: number, revenueTrend: Array<{month: string, revenue: number}>, leadSources: Array<{name: string, value: number}>, topDoctors: Array<{name: string, consultationCount: number, patients: number}>, todaysConsultations: number, todaysTherapies: number, pendingDailyReports: number } }` | Admin | None |

- **Request Body / Response Shape**: Large aggregated dashboard shape containing nested arrays and counts.
- **Business Rules**: None
- **Spec Status**: **MATCHES**

---

### Dashboard — Doctor — `/doctor-dashboard`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/dashboard/doctor` | Doctor Dashboard KPI bundle | None | `{ success: boolean, dashData: { doctors: number, appointments: number, patients: number, todayConsultations: number, pendingFollowUps: number, pendingTasks: number, activeTherapySessions: number, earnings: number, monthlyRevenue: number, latestAppointments: Array<object> } }` | Doctor | None |

- **Request Body / Response Shape**: Doctor-specific aggregated dashboard shape.
- **Business Rules**: None
- **Spec Status**: **MATCHES**

---

### User Management — Admin — `/admin/users`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/users` | List all system users | None | `{ success: boolean, users: Array<{ _id: string, name: string, email: string, role: string, status: string, lastActive: number }> }` | Admin | None |
| PATCH | `/users/:id/status` | Activate/deactivate an account | `{ status: string }` | `{ success: boolean, message: string }` | Admin | None |

- **Request Body / Response Shape**: Basic user listing and status updates.
- **Business Rules**: None
- **Spec Status**: **MATCHES**

---

### Doctors List — Admin — `/doctor-list`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/users` | List all doctors | None | `{ success: boolean, doctors: Array<{ _id: string, name: string, speciality: string, degree: string, experience: string, fees: number, address: object, available: boolean, image: string }> }` | Admin | None |
| PATCH | `/users/:id/status` | Change doctor availability | None | `{ success: boolean, message: string }` | Admin | None |

- **Request Body / Response Shape**: Doctor-specific fields.
- **Business Rules**: None
- **Spec Status**: **DIVERGES** (API Spec lists `/users` for all users, but the frontend splits `adminService.getAllDoctors()` and `userService.getUsers()`. Needs consolidation.)

---

### Add/Edit Doctor — Admin — `/add-doctor`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| POST | `/users` | Create a new Doctor | `FormData { name: string, email: string, speciality: string, degree: string, experience: string, about: string, fees: number, address: string }` | `{ success: boolean, message: string, doctor: object }` | Admin | None |

- **Request Body / Response Shape**: Uses `FormData` instead of raw JSON for potential image uploads.
- **Business Rules**: None
- **Spec Status**: **MATCHES**

---

### Patient List / Patient Registration — Both — `/patients` & `/add-patient`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/patients` | List patients | None | `{ success: boolean, patients: Array<{ _id: string, name: string, age: number, gender: string, phone: string, address: string, condition: string, assignedDoctor: string, status: string, leadSource: string, date: number }> }` | Both | BR-02 |
| GET | `/patients/search?q=` | Search patients | None | `{ success: boolean, patients: Array }` | Both | BR-02 |
| POST | `/patients` | Register a new patient | `{ name, age, gender, phone, address, condition, assignedDoctor, leadSource }` | `{ success: boolean, patient: object }` | Both | BR-12 |

- **Request Body / Response Shape**: Patient schema fields exactly as modeled in `mockData.js`.
- **Business Rules**: 
  - **BR-02**: Doctor sees only assigned patients.
  - **BR-12**: Lead source captured once.
- **Spec Status**: **MATCHES**

---

### Patient Detail — Both — `/patient/:id`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/patients/:id` | Full patient detail | None | `{ success: boolean, patient: object }` | Both | BR-02 |
| GET | `/patients/:id/timeline` | Activity timeline | None | `{ success: boolean, activities: Array<{ _id: string, type: string, title: string, description: string, date: number, performedBy: string, details: object, rawDate: number }> }` | Both | BR-02 |
| PATCH | `/patients/:id/assign-doctor` | Assign to a doctor | `{ doctorId: string }` | `{ success: boolean, patient: object }` | Admin | None |
| PATCH | `/patients/:id/status` | Set Active / Inactive | `{ status: string }` | `{ success: boolean, patient: object }` | Both | None |
| GET | `/documents` | List patient documents | None | `{ success: boolean, documents: Array<{ _id: string, patientId: string, name: string, type: string, description: string, uploadedBy: string, fileSize: string, fileType: string, status: string, url: string, date: number }> }` | Both | None |
| POST | `/documents` | Upload document | `{ name: string, type: string, description: string, uploader: string, file: object }` | `{ success: boolean, document: object }` | Both | None |
| PUT | `/documents/:id` | Update document | `{ name: string, description: string }` | `{ success: boolean, document: object }` | Both | None |
| DELETE | `/documents/:id` | Delete document | None | `{ success: boolean }` | Both | None |

- **Request Body / Response Shape**: Timeline is an aggregated array of `{ type, title, details, rawDate }`. Documents include `url`, `fileSize`, `type`.
- **Business Rules**: BR-02 (Doctor-scoped).
- **Spec Status**: 
  - Patient endpoints: **MATCHES**
  - Document endpoints (`/documents`): **UNDOCUMENTED** (Document management is actively used in the UI but missing from `API_SPECIFICATION.md`).

---

### New Consultation / Consultation History — Doctor — `/doctor/consultation` & `/doctor/history`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/patients/:patientId/consultations` | List consultation history | None | `{ success: boolean, consultations: Array<{ _id: string, patientId: string, doctorId: string, date: number, chiefComplaint: string, history: string, observations: string, diagnosis: string, treatmentPlan: string, dietAdvice?: string, lifestyleAdvice?: string, followUpDate: string, addendums: Array<{date: number, text: string}> }> }` | Both | BR-02 |
| POST | `/patients/:patientId/consultations` | Create a new consultation record | `{ patientId: string, chiefComplaint: string, history: string, observations: string, diagnosis: string, treatmentPlan: string, dietAdvice?: string, lifestyleAdvice?: string, followUpDate: string }` | `{ success: boolean, consultation: object }` | Doctor | BR-13 |
| POST | `/consultations/:id/addendum` | Add a correction note | `{ text: string }` | `{ success: boolean, consultation: object }` | Doctor | BR-13 |

- **Request Body / Response Shape**: `addendums` is an array of objects to maintain immutability.
- **Business Rules**: **BR-13** (Consultations are immutable; edits must be addendums only).
- **Spec Status**: **MATCHES**

---

### Therapy Master & Package Master — Admin — `/admin/therapies` & `/admin/packages`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/therapies` | List all therapies | None | `Array<{ _id: string, name: string, duration: number, price: number, status: boolean }>` | Both | None |
| POST | `/therapies` | Create a therapy | `{ name: string, duration: number, price: number }` | `{ _id: string, name: string, duration: number, price: number, status: boolean, date: number }` | Admin | None |
| GET | `/packages` | List all packages | None | `Array<{ _id: string, name: string, therapies: Array<{therapyId: string, count: number}>, price: number, status: boolean }>` | Both | None |
| POST | `/packages` | Create a package | `{ name: string, therapies: Array<{therapyId: string, count: number}>, price: number }` | `{ _id: string, ... }` | Admin | None |
| PATCH | `/therapies/:id/status` | Activate/deactivate therapy | `{ status: boolean }` | `{ _id: string, ... }` | Admin | BR-14 |
| PATCH | `/packages/:id/status` | Activate/deactivate package | `{ status: boolean }` | `{ _id: string, ... }` | Admin | None |

- **Request Body / Response Shape**: The response shape is a direct Array, not wrapped in `{ success, data }` like the others.
- **Business Rules**: BR-14 (Existing sessions stay valid on deactivation).
- **Spec Status**: **MATCHES** (except return wrapper discrepancy).

---

### Therapy Assignment & Sessions — Doctor — `/doctor/therapy-assignment` & `/doctor/therapy-sessions`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| POST | `/patients/:patientId/therapy-assignments` | Assign a standalone therapy or a package | `{ type: 'package' \| 'therapy', itemId: string, assignedDocId: string }` | `{ sessions: Array<{ _id: string, therapyId: string, patientId: string, docId: string, scheduledDate: string, status: string, notes: string, date: number }>, message: string }` | Doctor | None |
| GET | `/patients/:patientId/therapy-sessions` | List sessions | None | `Array<{ _id: string, assignmentId: string, patientId: string, doctorId: string, therapyId: string, therapyName: string, sessionNumber: number, scheduledDate: string, status: string, notes: string }>` | Both | BR-02 |
| PATCH | `/therapy-sessions/:id/complete` | Mark complete | `{ notes: string }` | `{ _id: string, ... }` | Doctor | None |
| PATCH | `/therapy-sessions/:id/reschedule` | Change scheduled date | `{ date: string }` | `{ _id: string, ... }` | Doctor | None |

- **Request Body / Response Shape**: `therapySessionService.assignToPatient` returns a list of generated sessions directly instead of a `TherapyAssignment` parent object.
- **Business Rules**: None. Prices are naturally excluded from the assignment payload, honoring BR-07.
- **Spec Status**: **DIVERGES** (The assignment endpoint expects to create an Assignment record per spec, but the frontend directly provisions and returns an array of individual `TherapySession` objects).

---

### Invoice List & Detail / Payments — Admin — `/admin/invoices` & `/admin/invoices/:id`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/invoices` | List invoices | None | `{ success: boolean, invoices: Array<{ _id: string, patientId: string, docId: string, doctorId: string, date: number, items: Array<{type: string, description: string, amount: number}>, totalAmount: number, paidAmount: number, status: string, dueDate: string }> }` | Admin | None |
| POST | `/patients/:patientId/invoices` | Generate invoice | `{ items: Array<{type: string, description: string, amount: number}>, totalAmount: number, dueDate: string }` | `{ success: boolean, invoice: object }` | Both | None |
| GET | `/invoices/:id` | Invoice detail + payments | None | `{ success: boolean, invoice: object, payments: Array<{ _id: string, invoiceId: string, patientId: string, amount: number, mode: string, date: number, transactionId: string }> }` | Both | None |
| POST | `/invoices/:id/payments` | Record payment | `{ patientId: string, invoiceId: string, amount: number, mode: string, date?: number, transactionId?: string, notes?: string }` | `{ success: boolean, payment: object }` | Both | BR-08, BR-15 |

- **Request Body / Response Shape**: `items` array details the billing line items. Payments contain `mode` (UPI/Card/Cash).
- **Business Rules**: 
  - **BR-08**: Payments must tie to an invoice. 
  - **BR-15**: Invoice status is computed based on paidAmount.
- **Spec Status**: **MATCHES**

---

### Doctor Revenue & Comparison — Admin/Doctor — `/admin/revenue` & `/admin/comparison`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/revenue/doctors/:doctorId?period=` | Revenue for one doctor | None | `{ success: boolean, revenue: number, attributionNote: string }` | Both | BR-09 |
| GET | `/revenue/doctors?period=` | Comparative report | None | `{ success: boolean, comparison: Array<{ doctorId: string, doctorName: string, revenue: number }> }` | Admin | None |

- **Request Body / Response Shape**: Simplistic revenue aggregation.
- **Business Rules**: **BR-09** (Revenue calculations use PAID amounts only).
- **Spec Status**: **MATCHES** (But currently stubbed and blocked on attribution decision).

---

### Incentive Configuration & Approval — Admin — `/admin/incentive-config` & `/admin/incentive-approval`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/incentive-rules` | List all rules | None | `{ success: boolean, rules: Array<{ _id: string, docId: string, targetAmount: number, percentage: number, effectiveDate: string, date: number }> }` | Admin | None |
| POST | `/incentive-rules` | Create rule | `{ docId: string, targetAmount: number, percentage: number, effectiveDate: string }` | `{ success: boolean, rule: object }` | Admin | BR-04, BR-05 |
| GET | `/incentives/pending-review` | Incentives awaiting approval | None | `{ success: boolean, pending: Array<{ _id: string, docId: string, period: string, totalRevenue: number, target: number, percentage: number, calculatedAmount: number, status: string, date: number }> }` | Admin | None |
| PATCH | `/incentives/:id/approve` | Approve incentive | None | `{ success: boolean, incentive: object }` | Admin | None |

- **Request Body / Response Shape**: Precise mapping of rule configurations and generated incentives.
- **Business Rules**: BR-04 & BR-05 (Effective dates and target rules).
- **Spec Status**: **MATCHES**

---

### Follow-Ups — Admin / Doctor — `/admin/follow-ups` & `/doctor/follow-ups`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/follow-ups/all` | Cross-doctor view | None | `{ success: boolean, followUps: Array<{ _id: string, patientId: string, doctorId: string, consultationId: string, dueDate: string, type: string, reason: string, status: string, priority: string, notes: string, patientName: string }> }` | Admin | None |
| GET | `/follow-ups` | Doctor's own follow-ups | None | `{ success: boolean, followUps: Array }` | Doctor | None |
| POST | `/patients/:patientId/follow-ups` | Schedule follow-up | `{ dueDate: string, type: string, reason: string, priority: string, notes: string }` | `{ success: boolean, followUp: object }` | Doctor | None |
| PATCH | `/follow-ups/:id/complete` | Complete follow-up | `{ completionNotes: string }` | `{ success: boolean, followUp: object }` | Doctor | None |
| PATCH | `/follow-ups/:id/reschedule` | Reschedule follow-up | `{ newDate: string, reason: string }` | `{ success: boolean, followUp: object }` | Doctor | None |
| PATCH | `/follow-ups/:id/cancel` | Cancel follow-up | `{ reason: string }` | `{ success: boolean, followUp: object }` | Doctor | None |

- **Request Body / Response Shape**: Status updates include string reasons/notes.
- **Business Rules**: None
- **Spec Status**: **DIVERGES** (The API spec mentions `/schedule-next`, but the frontend explicitly calls `rescheduleFollowUp` and `cancelFollowUp`. These endpoints are functionally distinct).

---

### Lead Source Report — Admin — `/admin/leads`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/leads` | List leads | None | `{ success: boolean, leads: Array<{ _id: string, name: string, phone: string, source: string, status: string, notes: string, date: number }> }` | Admin | None |
| PATCH | `/leads/:id/status` | Update lead status | `{ status: string }` | `{ success: boolean, lead: object }` | Admin | None |

- **Request Body / Response Shape**: Direct CRUD array of Lead objects.
- **Business Rules**: None
- **Spec Status**: **DIVERGES** (API Spec only lists `/lead-sources` configuration and `/leads/report?period=` aggregation. The frontend `getLeads` operates on raw lead rows directly).

---

### Social Media Review — Admin / Doctor — `/admin/social-review` & `/doctor/social-submission`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/social-activities` | List submissions | None | `{ success: boolean, submissions: Array<{ _id: string, docId: string, platform: string, title: string, description: string, link: string, type: string, status: string, date: number, reviewNote: string, history: Array }> }` | Admin | None |
| POST | `/social-activities` | Submit a post | `{ platform: string, title: string, description: string, link: string, type: string }` | `{ success: boolean, submission: object }` | Doctor | None |
| PATCH | `/social-activities/:id/review` | Approve/Reject | `{ reason?: string }` | `{ success: boolean, submission: object }` | Admin | None |
| POST | `/social-activities/:id/resubmit` | Resubmit a post | `{ platform, title, description, link, type }` | `{ success: boolean, submission: object }` | Doctor | None |

- **Request Body / Response Shape**: Contains `reviewNote` and a `history` array for re-submissions.
- **Business Rules**: None
- **Spec Status**: **DIVERGES** (Frontend added a `/resubmit` endpoint to push the old version into a `history` array, which isn't modeled in the original API Spec).

---

### Daily Reports — Admin / Doctor — `/admin/daily-reports` & `/doctor/daily-report`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/daily-reports` | List daily reports | None | `{ success: boolean, reports: Array<{ _id: string, docId: string, date: number, patientsSeen: number, consultationsCompleted: number, therapySessions: number, followUpsCompleted: number, revenue: number, closingStatus: string, notes: string }> }` | Admin | None |
| POST | `/daily-reports` | Submit end-of-day summary | `{ patientsSeen, consultationsCompleted, therapySessions, followUpsCompleted, revenue, closingStatus, notes }` | `{ success: boolean, report: object }` | Doctor | None |
| PATCH | `/daily-reports/:id/status` | Update status | `{ status: string }` | `{ success: boolean }` | Admin | None |

- **Request Body / Response Shape**: Summary aggregation fields.
- **Business Rules**: None
- **Spec Status**: **DIVERGES** (API Spec lists `/daily-reports/:id/review`. Frontend calls `updateReportStatus`).

---

### Personal Notes — Doctor — `/doctor/notes`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/notes` | List own private notes | None | `{ success: boolean, notes: Array<{ _id: string, docId: string, title: string, content: string, type?: string, date: number }> }` | Doctor | BR-03 |
| POST | `/notes` | Create note | `{ title: string, content: string, type?: string }` | `{ success: boolean, note: object }` | Doctor | None |
| DELETE | `/notes/:id` | Delete note | None | `{ success: boolean }` | Doctor | None |

- **Request Body / Response Shape**: `title` and `content` are required.
- **Business Rules**: **BR-03** (Strict isolation: No Admin path can read these notes).
- **Spec Status**: **MATCHES**

---

### My Tasks — Doctor — `/doctor/tasks`

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/tasks` | List own tasks | None | `{ success: boolean, tasks: Array<{ _id: string, docId: string, title: string, description: string, priority: string, status: string, date: number }> }` | Doctor | None |
| POST | `/tasks` | Create a task | `{ title: string, description: string, priority: string }` | `{ success: boolean, task: object }` | Doctor | None |
| PATCH | `/tasks/:id/status` | Mark complete/in-progress | `{ status: string }` | `{ success: boolean }` | Doctor | None |

- **Request Body / Response Shape**: Standard CRUD object shape.
- **Business Rules**: None
- **Spec Status**: **MATCHES**

---

### Legacy Appointments (from `/all-appointments` and `DoctorAppointments`)

**Endpoints used by this screen:**

| Method | Endpoint | Purpose | Request Body | Response Shape | Role | Business Rules |
|---|---|---|---|---|---|---|
| GET | `/appointments` | List appointments | None | `{ success: boolean, appointments: Array<{ _id: string, userId: string, docId: string, slotDate: string, slotTime: string, userData: object, docData: object, amount: number, date: number, cancelled: boolean, isCompleted: boolean }> }` | Both | None |
| POST | `/appointments` | Create appointment | `{ userId: string, docId: string, slotDate: string, slotTime: string, amount: number }` | `{ success: boolean, appointment: object }` | Both | None |
| PATCH | `/appointments/:id/status` | Update status | `{ status: string }` | `{ success: boolean, appointment: object }` | Both | None |

- **Request Body / Response Shape**: Heavy legacy objects including embedded `userData` and `docData`.
- **Business Rules**: None
- **Spec Status**: **UNDOCUMENTED** (The entire `appointmentService` and its screens persist in the codebase despite the `API_SPECIFICATION.md` noting to retire Stripe/Razorpay-backed routes).

---

### Discrepancies Requiring Resolution

1. **Document Management (`/documents`)**: The UI relies heavily on `documentService` for Patient Document uploads/management, but there is zero mention of `/documents` in the `API_SPECIFICATION.md`. **(UNDOCUMENTED)**
2. **Legacy Appointments (`/appointments`)**: `appointmentService` endpoints and screens (`/all-appointments`) are fully active in the mock frontend, but omitted/flagged for removal in the API spec. **(UNDOCUMENTED)**
3. **Lead Management (`/leads`)**: The frontend interacts with raw Lead lists and updates their statuses, whereas the API Spec only documents aggregated Lead Source reporting. **(DIVERGES)**
4. **Therapy Assignments (`/therapy-assignments`)**: The frontend assignment payload returns an array of individual `TherapySession` objects directly instead of returning a parent `TherapyAssignment` record. **(DIVERGES)**
5. **Follow-ups Rescheduling (`/follow-ups/:id/reschedule`)**: The frontend has explicit endpoints for `/reschedule` and `/cancel` which are not in the spec (the spec focuses on `/schedule-next`). **(DIVERGES)**
6. **Social Media Resubmission (`/social-activities/:id/resubmit`)**: The frontend adds a resubmit endpoint to push rejected drafts into a history array. Not modeled in the spec. **(DIVERGES)**
7. **Daily Reports Review (`/daily-reports/:id/status`)**: Frontend uses `/status`, spec documents `/review`. Needs path alignment. **(DIVERGES)**
8. **Wrapper Consistency**: Most services return `{ success: true, data }`, but `therapyService` and `packageService` return raw arrays directly. Needs global standard alignment. **(DIVERGES)**
