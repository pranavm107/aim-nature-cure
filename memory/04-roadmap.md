# Implementation Roadmap (10 Stages)

## Stage 0 — Repo Prep
- Fork/clone Prescripto.
- Park `frontend/` workspace in an `archive/patient-portal` branch. Remove from `main`.
- Remove Stripe/Razorpay and online checkout flows.
- Set up environments (local/staging/prod) with fresh DBs and JWT secrets.
- **Checkpoint**: Ready to build without conflicting with soon-to-be-removed code.

## Stage 1 — Foundation & Access Control
- Build data-driven RBAC (Roles & Users).
- Admin -> User management (create, activate, deactivate).
- Wire password reset & session expiry.
- **Checkpoint**: Admin and Doctor can log in, and are blocked from each other's screens.

## Stage 2 — Patients & Consultations
- Extend Patient schema.
- Patient Registration (internal) & Patient List (respecting BR-02).
- Build Consultation model and screens (immutable after submission).
- **Checkpoint**: Doctor can register patient, write consultation, view in history. Admin sees all, Doctor sees own.

## Stage 3 — Therapies & Packages
- Therapy & Package Master screens (configurable prices).
- Assign packages/therapies to patients (auto-generating Therapy Sessions).
- Mark sessions complete, track remaining sessions.
- **Checkpoint**: Assigning a package creates sessions; completing them decrements remaining count.

## Stage 4 — Billing & Payments
- Invoices & Invoice Items generation from visits/sessions.
- Record payments (Cash, UPI, Card, Bank) against invoices (BR-08).
- Support partial payments & track status.
- **Checkpoint**: Invoice generated, partial payment updates balance, receipt renders.

## Stage 5 — Doctor Revenue & Incentives
- Revenue attribution query (PAID amounts only).
- Revenue views for Admin and Doctor.
- Configure targets/incentive percentages.
- Auto-calculate incentives.
- **Checkpoint**: Crossing a target with paid revenue correctly auto-calculates incentive.

## Stage 6 — Follow-Ups & Reminders
- FollowUp model, schedule, communication mode.
- Dashboard lists (today, upcoming, overdue) and auto-flagging overdue.
- Record outcomes and schedule next.
- WhatsApp deep-link button.
- **Checkpoint**: Scheduled follow-ups appear on dashboard, overdue ones flagged, completing allows scheduling next.

## Stage 7 — Leads & Social Media
- Capture Lead Source at registration (lockable).
- Admin lead source report.
- Doctor social media submission (screenshot, URL).
- Admin review screen.
- **Checkpoint**: Lead source tracks correctly, social post submission hits Admin review queue.

## Stage 8 — Doctor Workspace, Daily Reports & Analytics
- Doctor private notes (Admin blocked via API) & tasks.
- Doctor Daily Report submission & Admin review.
- Daily/Weekly/Monthly aggregation reports & export.
- **Checkpoint**: Dashboards show live KPIs, reports map accurately to underlying data.

## Stage 9 — Security, Audit, Testing & Deployment
- Audit Logging on critical entities (BR-10).
- RBAC cross-check testing.
- Form validation.
- File upload security.
- **Checkpoint**: All PRD acceptance criteria pass, audit logs work, role boundaries solid.
