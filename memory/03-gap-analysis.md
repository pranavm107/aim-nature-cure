# Gap Analysis

## What to KEEP As-Is
- **Tech Stack**: React + Express + MongoDB + JWT Auth.
- **Structure**: Three-workspace structure (admin, backend, frontend - though frontend is parked).
- **Auth Pattern**: JWT authentication and `.env` secrets.
- **RBAC Foundation**: Role-gated routing in admin workspace.
- **Doctor Model**: `doctorModel.js` seed.

## What to REBRAND / MODIFY
- **`userModel.js` -> Patient**: Add lead source, assigned doctor, status. Registration becomes internal (Admin/Doctor entered).
- **Admin Dashboard**: Reshape to show V1 KPIs (revenue, consultations, sessions, leads, follow-ups).
- **Doctor Dashboard**: Reshape to show V1 KPIs (patients, follow-ups, revenue, tasks, social media prompt).
- **Doctor Onboarding**: Add target/incentive fields.
- **`appointmentModel.js`**: Repurpose as `TherapySession` scheduling seed, stripping out the Stripe checkout.

## What to REMOVE or PARK
- **`frontend/` (Patient App)**: PARK for future Patient Portal. Do not spend time on it in V1.
- **Stripe / Razorpay**: REMOVE entirely from V1. All billing is manual invoice + recorded payments (cash/UPI/card).
- **Public Doctor Directory**: PARK for future.

## What Must Be BUILT FROM SCRATCH
- **Consultation & Medical Records** (Immutable notes, history).
- **Therapies & Packages** (Master lists, assignment, session tracking).
- **Billing & Payments** (Invoices, line items, partial payments tracking).
- **Doctor Revenue & Incentives** (Target tracking, auto-calculation based on PAID amounts).
- **Follow-Ups & Reminders** (Scheduling, overdue flagging, outcome recording).
- **WhatsApp Integration** (Simple `wa.me` deep-link button).
- **Lead Management** (Capture at registration, reporting).
- **Social Media Activity** (Proof upload, Admin review).
- **Doctor Personal Workspace** (Private notes, tasks).
- **Daily Closing & Reporting** (Doctor submission, daily/weekly/monthly analytics).
- **Cross-cutting**: Audit Logging (for critical entity changes) & Data-driven RBAC layer.
