# AIM Nature Cure ERP - UI/UX Analysis

## 1. Project Understanding
**A. What the ERP does:** A purpose-built ERP for AIM Nature Cure hospital to manage clinical, operational, and financial activities. It tracks therapies, doctor incentives, follow-ups, leads, and social media submissions.
**B. Who uses it:** Admins and Doctors. (Patient portal is out of scope for V1).
**C. Admin responsibilities:** Oversee operations, manage users/doctors, patients, therapies, packages, invoices, payments, configure incentive rules, approve incentives, review social media posts/daily reports, and analyze data across the hospital.
**D. Doctor responsibilities:** Manage assigned patients, conduct consultations, assign therapies, mark therapy sessions complete, track own revenue/incentives, manage own follow-ups, submit daily reports, submit social media proofs, and write private personal notes.
**E. All modules:** Auth, Users, Patients, Consultations, Therapies & Packages, Billing & Payments, Revenue & Incentives, Follow-Ups, Leads & Social Media, Doctor Workspace (Notes/Tasks/Reports), Analytics.
**F. All screens:** (See Complete Screen Inventory in FRONTEND_DEVELOPMENT_PLAN.md).
**G. Navigation structure:** Sidebar with categories (Overview, People, Clinical, Financial, Operations, Reports, System) tailored to the role.
**H. Role permissions:** Enforced via `<ProtectedRoute>`. Doctors cannot see other doctors' patients, private notes (enforced at API/Mock layer), or Admin-only screens (incentive config, all patients, revenue comparison).
**I. Existing reusable components:** Needs `<DataTable>`, `<ProtectedRoute>`, form patterns, toast, charts, responsive layout shell.
**J. Existing styles:** Tailwind CSS based. Needs a professional, healthcare/wellness ERP aesthetic (clean, calm, trustworthy).
**K. Existing routes:** Admin and Doctor protected routes exist but need expansion to cover the full PRD.
**L. Existing mock/API architecture:** Uses `services/`, `mocks/`, `apiClient.js` with `USE_MOCK` flag.
**M. Business rules affecting UI:** See `/memory/01-business-rules.md` (e.g., BR-02: doctor sees own patients, BR-08: payment needs invoice, BR-13: immutable consultations).
**N/O/P/Q. Screen Status:** See FRONTEND_DEVELOPMENT_PLAN.md (Many exist partially, most are BUILD NEW, Legacy Patient Portal is REMOVED).

## 2. Important Constraints & Business Rules for UI
- **Immutable Consultations (BR-13):** No "Edit" button after submission; only "Addendum".
- **Private Notes (BR-03):** Doctor notes are strictly private. No Admin UI can access them.
- **Incentives & Targets (BR-04, BR-05):** Configurable by Admin per doctor.
- **Billing (BR-08, BR-15):** Invoice must exist before payment. Support partial payments. Status (Paid/Partial/Pending) computed dynamically.
- **Lead Source (BR-12):** Captured at registration, locked for edits (Admin override only).
- **Patient Detail Timeline:** The central workspace combining consultations, sessions, invoices, and follow-ups.

## 3. Screen-by-Screen Inventory & Mapping
(This mapping traces Screen -> Requirement -> Role -> Mock Service -> Route)

### Shared
- **Login:** PRD -> Both -> authService -> `/`
- **Forgot Password:** PRD -> Both -> authService -> `/forgot-password`
- **My Profile:** PRD -> Both -> authService -> `/profile`
- **Notifications/Reminders:** FR-081 -> Both -> reminderService -> Navbar Dropdown

### Admin
- **Dashboard:** FR-008-017 -> Admin -> analyticsService -> `/admin/dashboard`
- **User Management:** PRD -> Admin -> userManagementService -> `/admin/users`
- **Doctors List:** PRD -> Admin -> userManagementService -> `/admin/doctors`
- **Add/Edit Doctor:** PRD -> Admin -> userManagementService -> `/admin/doctors/add`
- **Patient List:** BR-02 -> Admin -> patientService -> `/admin/patients`
- **Patient Detail (Timeline):** PRD -> Admin -> patientService -> `/admin/patients/:id`
- **Therapy Master:** FR-041 -> Admin -> therapyService -> `/admin/therapies`
- **Package Master:** FR-046 -> Admin -> packageService -> `/admin/packages`
- **Invoice List / Detail:** FR-053 -> Admin -> invoiceService -> `/admin/invoices`
- **Record Payment:** FR-055 -> Admin -> paymentService -> (Modal on Invoice Detail)
- **Doctor Revenue Report:** FR-064 -> Admin -> revenueService -> `/admin/revenue`
- **Doctor-wise Comparison:** FR-066 -> Admin -> revenueService -> `/admin/revenue/comparison`
- **Incentive Configuration:** FR-068 -> Admin -> incentiveService -> `/admin/incentives/config`
- **Incentive Approval:** FR-070 -> Admin -> incentiveService -> `/admin/incentives/approve`
- **Follow-Up Overview:** FR-079 -> Admin -> followUpService -> `/admin/follow-ups`
- **Lead Source Report:** FR-091 -> Admin -> leadService -> `/admin/leads`
- **Social Media Review:** FR-094 -> Admin -> socialActivityService -> `/admin/social-review`
- **Daily Report Review:** FR-108 -> Admin -> dailyReportService -> `/admin/daily-reports`
- **Reports (Daily/Weekly/Monthly):** FR-109-111 -> Admin -> analyticsService -> `/admin/reports`

### Doctor
- **Dashboard:** FR-018-026 -> Doctor -> analyticsService -> `/doctor/dashboard`
- **My Patients:** BR-02 -> Doctor -> patientService -> `/doctor/patients`
- **New Consultation:** PRD -> Doctor -> consultationService -> `/doctor/patients/:id/consultation/new`
- **Consultation History:** BR-13 -> Doctor -> consultationService -> `/doctor/patients/:id/consultations`
- **Therapy Assignment:** FR-044 -> Doctor -> therapySessionService -> `/doctor/patients/:id/assign-therapy`
- **Therapy Sessions:** FR-051 -> Doctor -> therapySessionService -> `/doctor/patients/:id/sessions`
- **My Revenue:** FR-062 -> Doctor -> revenueService -> `/doctor/revenue`
- **My Incentive:** FR-069 -> Doctor -> incentiveService -> `/doctor/incentive`
- **Follow-Up List:** FR-075 -> Doctor -> followUpService -> `/doctor/follow-ups`
- **Follow-Up Detail:** FR-077 -> Doctor -> followUpService -> `/doctor/follow-ups/:id`
- **Social Media Submission:** FR-093 -> Doctor -> socialActivityService -> `/doctor/social-submit`
- **Personal Notes:** BR-03 -> Doctor -> noteService -> `/doctor/notes`
- **My Tasks:** FR-101 -> Doctor -> taskService -> `/doctor/tasks`
- **Daily Closing Report:** FR-105 -> Doctor -> dailyReportService -> `/doctor/daily-report`

## 4. Visual Design & Architecture
- **Design System:** Use Tailwind CSS to create a clean, calm, professional healthcare aesthetic. Avoid generic SaaS or flashy styles. Use clear typography, restrained cards, and solid status badges.
- **Component Architecture:** Extract reusable components (`Button`, `Card`, `DataTable`, `Modal`, `StatusBadge`, `FormInput`, `ProtectedRoute`) to ensure consistency.
- **Routing:** Implement protected routes enforcing roles (Admin vs Doctor).
- **Mock Architecture:** All data access must go through `services/*Service.js` returning mock data. Data must be realistic (not generic placeholders). State changes must be persisted in mock variables so the application feels functional (e.g. paying an invoice updates its status to 'Paid').
- **Responsiveness:** Ensure mobile/tablet layouts convert tables to cards or use horizontal scroll where appropriate, and collapse sidebars.

## 5. Next Steps
Move to Implementation Plan for iterative rollout of these screens.
