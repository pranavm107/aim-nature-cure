# AIM Nature Cure ERP — Frontend Development Plan

Companion to `API_SPECIFICATION.md` and `FRONTEND_WORKFLOW.md`. This is the frontend equivalent of the backend Gap Analysis: screen by screen, component by component, what to keep, what to rebrand, and what's built from nothing — sequenced to match the roadmap stages, for execution in Antigravity.

---

## 1. Screen Inventory — Full Status

Status legend: **KEEP** (works as-is, no change) · **MODIFY** (existing screen, rework fields/logic) · **REBRAND** (existing screen, mostly UI/copy change) · **BUILD NEW** (nothing exists)

### Shared (both roles)

| Screen | Status | Notes |
|---|---|---|
| Login | MODIFY | Exists (`admin/src/pages/Login.jsx`) — strip any patient-role branch, keep Admin/Doctor toggle |
| Forgot Password | BUILD NEW | No equivalent in Prescripto's admin app |
| My Profile | BUILD NEW | Prescripto's profile editing lives in `DoctorProfile.jsx` only (doctor-specific fields); needs a role-neutral version for both |
| Notifications (reminders panel) | BUILD NEW | No notification/reminder UI exists at all |

### Admin

| Screen | Status | Notes |
|---|---|---|
| Dashboard | MODIFY | Exists — reshape KPIs per PRD FR-008–017 (today's revenue, pending follow-ups, new leads, doctor-wise chart) instead of Prescripto's generic metrics |
| User Management | BUILD NEW | Create/deactivate Admin & Doctor accounts — closest existing pattern is `AddDoctor.jsx`, reuse the form pattern, not the screen |
| Doctors List | MODIFY | Exists (`DoctorsList.jsx`) — add target/incentive-rule link per doctor |
| Add/Edit Doctor | MODIFY | Exists (`AddDoctor.jsx`) — add monthly target field |
| Patient List | BUILD NEW | No patient management screen exists in `admin/` today (Prescripto's patient list only ever lived in the parked `frontend/` app, from the patient's own side) |
| Patient Detail | BUILD NEW | Timeline view: consultations, sessions, invoices, follow-ups combined |
| Therapy Master | BUILD NEW | — |
| Package Master | BUILD NEW | — |
| Invoice List / Detail | BUILD NEW | Closest existing pattern: `AllAppointments.jsx`'s table layout is reusable as a UI pattern, not the data |
| Record Payment | BUILD NEW | — |
| Doctor Revenue Report | BUILD NEW | — |
| Doctor-wise Comparison | BUILD NEW | — |
| Incentive Configuration | BUILD NEW | — |
| Incentive Approval | BUILD NEW | — |
| Follow-Up Overview (cross-doctor) | BUILD NEW | — |
| Lead Source Report | BUILD NEW | — |
| Social Media Review | BUILD NEW | — |
| Daily Report Review | BUILD NEW | — |
| Reports (Daily/Weekly/Monthly) | BUILD NEW | — |
| All Appointments *(if retained as a legacy view)* | REBRAND or REMOVE | Decide: fold into Patient Detail timeline instead of keeping as a standalone screen — recommend REMOVE in favor of the timeline, avoid maintaining two overlapping views |

### Doctor

| Screen | Status | Notes |
|---|---|---|
| Dashboard | MODIFY | Exists (`DoctorDashboard.jsx`) — reshape per FR-018–026 (today's patients, follow-ups due, revenue-to-target, projected incentive, tasks) |
| Profile | MODIFY | Exists (`DoctorProfile.jsx`) — add availability toggle if not present, consultation fee already likely present |
| My Patients | BUILD NEW | Doctor's filtered view of Patient List (own assigned only) |
| New Consultation | BUILD NEW | — |
| Consultation History | BUILD NEW | — |
| Therapy Assignment | BUILD NEW | — |
| Therapy Sessions (mark complete) | BUILD NEW | — |
| My Revenue | BUILD NEW | — |
| My Incentive | BUILD NEW | — |
| Follow-Up List | BUILD NEW | — |
| Follow-Up Detail | BUILD NEW | — |
| Social Media Submission | BUILD NEW | — |
| Personal Notes | BUILD NEW | Private — enforce no Admin route can ever reach this data, per `BR-03` |
| My Tasks | BUILD NEW | — |
| Daily Closing Report | BUILD NEW | — |
| Appointments *(legacy)* | REBRAND or REMOVE | Same call as Admin's All Appointments — recommend folding into Therapy Sessions + Consultation History rather than keeping a separate appointments concept |

**Tally:** ~4 screens KEEP/MODIFY on the Admin side, ~2 on the Doctor side, ~2 shared MODIFY. Everything else — roughly 27 of the ~34 total screens — is BUILD NEW. This matches the Gap Analysis's original estimate; the frontend workload is dominated by new screens, not refactors.

---

## 2. Component & Infrastructure Gap

| Item | Status | Notes |
|---|---|---|
| `Navbar.jsx`, `Sidebar.jsx` | MODIFY | Keep the shell, replace nav items with the real screen list above; sidebar needs to grow substantially — consider grouping into collapsible sections (Patients, Therapies, Billing, Revenue, Follow-Ups, Reports) rather than one long flat list |
| `AdminContext.jsx`, `DoctorContext.jsx`, `AppContext.jsx` | MODIFY | Currently hold Prescripto's doctor/appointment state shape — rebuild content per stage as each module lands, don't retrofit old shape |
| `assets/*.svg` (icons) | KEEP + ADD | Existing icons (doctor, appointment, patient, earning) are reusable; will need new icons for therapy, package, invoice, incentive, follow-up, lead, social, note, task — a consistent icon set matters more here than sourcing individually |
| Data tables (used in `DoctorsList`, `AllAppointments`) | KEEP pattern | Extract into a reusable `<DataTable>` component now — you'll need the same sortable/filterable table shape for Patient List, Invoice List, Follow-Up List, Reports, etc. Building it once early saves rebuilding it ~8 times |
| Forms (used in `AddDoctor`) | KEEP pattern | Same logic — extract a reusable form-field/validation pattern before Stage 2, since Patient Registration, Consultation, Therapy Assignment, and more all need the same form primitives |
| Auth guard / route protection | BUILD NEW | Prescripto's role separation is folder-based (`pages/Admin/` vs `pages/Doctor/`) with no real guard component — build a `<ProtectedRoute role="admin">` wrapper per Section 5 of `FRONTEND_WORKFLOW.md` |
| Toast/notification UI (success/error feedback) | CHECK | Confirm what Prescripto already has (likely `react-toastify` or similar) — keep if present, it's a small utility worth reusing |
| Charts (for Revenue/Reports screens) | BUILD NEW | No charting library wired in `admin/` currently — pick one (Recharts is a common React choice) before Stage 5 |

---

## 3. Stage-by-Stage Frontend Plan

Same nine stages as backend, frontend work runs in parallel against mocks (see `FRONTEND_WORKFLOW.md`). Each stage below lists concrete Antigravity tasks in order.

### Stage 0 (already done) — carries forward
Confirm `frontend/` is parked, `admin/` is the active workspace, Tailwind config is the rebrand target.

### Stage 1 — Foundation
1. Set up `services/`, `mocks/`, `apiClient.js`, `USE_MOCK` switch.
2. Build `<ProtectedRoute>` and wire it into the router for every existing and new route.
3. Extract `<DataTable>` and form-field primitives from existing `DoctorsList`/`AddDoctor` code.
4. Rebuild Login (strip patient branch), build Forgot Password, My Profile (role-neutral), Notifications shell.
5. Rebuild `Navbar`/`Sidebar` nav structure to reflect the full screen list in Section 1 (even if most routes are placeholder pages at this point) — gives visible, demoable navigation early.

### Stage 2 — Patients & Consultations
1. Build Patient List (Admin: all: Doctor: assigned only — gate with the same role logic as backend's `BR-02`, even against mocks).
2. Build Patient Registration form.
3. Build Patient Detail shell with tabs/sections for Timeline (empty state until later stages populate it).
4. Build New Consultation form + Consultation History read-only view.
5. Enforce no "edit" affordance on submitted consultations in the UI — only an "add addendum" action, matching `BR-13`.

### Stage 3 — Therapies & Packages
1. Build Therapy Master (Admin CRUD table + form).
2. Build Package Master (composition builder: pick therapies + session counts per package).
3. Build Therapy Assignment screen (Doctor-side, from Patient Detail).
4. Build Therapy Sessions view: consumed/remaining counter, mark-complete action.
5. Wire Therapy Sessions into the Patient Detail timeline.

### Stage 4 — Billing & Payments
1. Build Invoice generation flow (select line items from consultation/sessions/package).
2. Build Invoice Detail + status badge (Paid/Partial/Pending).
3. Build Record Payment modal/form (mode selector: Cash/UPI/Card/Bank).
4. Build Receipt view (printable layout).
5. Wire invoices into the Patient Detail timeline.

### Stage 5 — Revenue & Incentives
1. Pick and wire in a charting library.
2. Build Doctor Revenue Report (Admin) + Doctor-wise Comparison chart.
3. Build My Revenue (Doctor self-view).
4. Build Incentive Configuration form (target, percentage, effective date) — Admin.
5. Build My Incentive (Doctor) + Incentive Approval queue (Admin).
6. ⚠️ Mock the revenue-attribution logic explicitly as TBD in the mock layer (comment it clearly) until the attribution decision is logged in `/memory/05-decisions-log.md` — don't let the UI quietly assume one answer.

### Stage 6 — Follow-Ups & Reminders
1. Build Follow-Up List (today/upcoming/overdue tabs) — Doctor.
2. Build Follow-Up Detail + outcome-recording + "schedule next" flow.
3. Build Admin Follow-Up Overview (cross-doctor) + stats widget.
4. Build the Reminders panel (today/tomorrow due items) for both dashboards.
5. Add the WhatsApp deep-link button on Patient Detail.

### Stage 7 — Leads & Social Media
1. Build Lead Source capture as a field in Patient Registration (Stage 2 form gets this field added here, once the source list exists).
2. Build Admin Lead Source Report.
3. Build Social Media Submission form (Doctor, with file upload).
4. Build Admin Social Review queue (Reviewed/Flagged actions).

### Stage 8 — Doctor Workspace, Daily Reports, Reporting
1. Build Personal Notes (Doctor-only route, confirm no Admin path reaches it even in routing config).
2. Build My Tasks.
3. Build Daily Closing Report submission form (Doctor) + review view (Admin).
4. Build Daily/Weekly/Monthly report views + export buttons.
5. Finalize both Dashboards as aggregate KPI views once all underlying screens/data exist.

### Stage 9 — Polish & Handoff
1. Run the production-readiness checklist (Section 6, `FRONTEND_WORKFLOW.md`) against every screen.
2. Confirm every `USE_MOCK` flip point works cleanly module by module as backend delivers.
3. Full responsive pass, full role-gating pass (try every screen as the wrong role, confirm graceful denial).

---

## 4. Antigravity Kickoff Prompt

```
FRONTEND DEVELOPMENT — STAGE 1 START

Context: read /memory/00-project-overview.md, /memory/01-business-rules.md,
FRONTEND_WORKFLOW.md, and FRONTEND_DEVELOPMENT_PLAN.md before starting.
We are beginning frontend Stage 1, working in the admin/ workspace only
(frontend/ stays parked on archive/patient-portal — do not touch it).

Do NOT wait for backend. Build against mocks per FRONTEND_WORKFLOW.md's
service-layer pattern. Do not write inline fetch/axios calls in any
component — everything goes through a service function.

Stage 1 tasks, in order:
1. Set up services/, mocks/, apiClient.js, and a USE_MOCK env switch.
2. Build a <ProtectedRoute role="admin|doctor"> wrapper and apply it to
   every route in the router, existing and new.
3. Extract a reusable <DataTable> component from the existing
   DoctorsList.jsx / AllAppointments.jsx table markup.
4. Extract a reusable form-field/validation pattern from AddDoctor.jsx.
5. Rebuild Login.jsx to remove any patient-role branch.
6. Build Forgot Password, a role-neutral My Profile screen, and a
   Notifications panel shell (empty state is fine for now).
7. Rebuild Navbar.jsx/Sidebar.jsx navigation to include the FULL screen
   list from FRONTEND_DEVELOPMENT_PLAN.md Section 1 — placeholder pages
   are fine for screens not yet built, but the navigation structure
   should be complete and demoable now.

Follow the per-screen production-readiness checklist in
FRONTEND_WORKFLOW.md Section 6 for every screen you touch — loading,
empty, and error states are not optional, even against mock data.

Do not proceed to Stage 2 screens until Stage 1 is fully done and I've
reviewed it. Report back with what was built and any place you had to
guess at something FRONTEND_DEVELOPMENT_PLAN.md didn't fully specify.
```

Repeat the same pattern (swap the stage number and task list) for Stages 2–9, pulling the task list straight from Section 3 above each time you're ready to move forward.
