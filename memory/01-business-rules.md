# Business Rules

These business rules (BR) are hard constraints. No code should ever violate them.

- **BR-01**: Only authenticated users can access any part of the system.
- **BR-02**: A Doctor can only view and manage patients assigned to them. Admin can view all patients.
- **BR-03**: Doctor personal notes are private. Admin cannot access them under any circumstance. (Enforce at API layer).
- **BR-04**: Incentive rules are configured per doctor by Admin. No doctor shares another doctor's incentive rule automatically.
- **BR-05**: Incentive target amounts and percentages are configurable and must never be hard-coded in the application.
- **BR-06**: The required number of follow-up sessions per patient is a configurable system setting, not a hard-coded value.
- **BR-07**: Therapy prices and package prices are configurable by Admin. No prices are hard-coded.
- **BR-08**: An invoice must exist before a payment can be recorded. Payments are always linked to an invoice.
- **BR-09**: Revenue calculations for incentive purposes shall use **paid amounts only**, not invoiced amounts.
- **BR-10**: All financial changes (payments, invoice edits) must be auditable. No untracked financial modifications are permitted.
- **BR-11**: Social media activity proof is manually submitted by the Doctor. The system does not claim to verify third-party platform activity.
- **BR-12**: Lead source must be captured at patient registration and cannot be changed retroactively without Admin authorization.
- **BR-13**: Consultation records are **immutable** after submission. Corrections are recorded as addendum notes.
- **BR-14**: A deactivated therapy cannot be assigned to new patients but existing assigned sessions remain valid.
- **BR-15**: Partial payments are permitted. Outstanding balances are tracked and visible on both the invoice and the Admin payment dashboard.
