# Data Model (29 Entities)

| Entity | Purpose | Status in Prescripto |
|---|---|---|
| **User** / Patient | System users, Patient demographics | Exists (needs new fields: source, assigned doctor) |
| **Role** | RBAC roles and permissions | Missing |
| **Doctor** | Extended profile for Doctor users | Exists (needs target/incentive links) |
| **LeadSource** | Reference list of acquisition sources | Missing |
| **Appointment** | Scheduled visit: patient, doctor, date/time, status | Was mismodeled as legacy — un-deprecate |
| **Consultation** | Clinical consultation record | Missing |
| **TreatmentPlan**| Overall treatment strategy | Missing |
| **Therapy** | Therapy master record | Missing |
| **TherapyPackage**| Package master record | Missing |
| **PackageTherapy**| Junction: therapies and quantities in a package | Missing |
| **PatientPackage**| A package assigned to a patient | Missing |
| **TherapySession**| Individual therapy session for a patient | Missing |
| **Invoice** | Invoice record for a patient visit | Missing |
| **InvoiceItem** | Line item on an invoice | Missing |
| **Payment** | Payment transaction against an invoice | Missing |
| **DoctorRevenue** | Aggregated revenue snapshot per doctor | Missing |
| **IncentiveRule** | Configurable incentive rule per doctor | Missing |
| **DoctorTarget** | Monthly target for a doctor | Missing |
| **DoctorIncentive**| Calculated incentive record | Missing |
| **FollowUp** | Follow-up schedule for a patient | Missing |
| **FollowUpNote** | Outcome notes for a follow-up session | Missing |
| **Reminder** | System-generated or manual reminders | Missing |
| **SocialActivity** | Doctor social media submission | Missing |
| **DoctorNote** | Doctor personal notes | Missing |
| **DoctorTask** | Doctor personal tasks | Missing |
| **DailyReport** | Doctor's daily closing report | Missing |
| **AuditLog** | Record of all data changes | Missing |
| **Notification** | In-app notifications | Missing |
| **PatientDocument** | Uploaded document attached to a patient (labs, scans, etc.) | Net new |
| **ReviewRequest** | Tracks a Google review request sent to a patient and its outcome | Net new |