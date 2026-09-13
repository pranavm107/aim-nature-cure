# DEV_NOTES

**MOCK LOGIN CREDENTIALS**
(Active only when `VITE_USE_MOCK=true` is set in `.env`)

Admin:
- **Email**: `admin@aimnaturecure.dev`
- **Password**: `mock-admin-pass`

Doctor:
- **Email**: `doctor@aimnaturecure.dev`
- **Password**: `mock-doc-pass`

Forced Password Reset User (New Doctor):
- **Email**: `newdoc@aimnaturecure.dev`
- **Password**: `temp-password`
*(Logging in with this user will force navigation to the password reset screen)*

*Note:
These exist purely to drive the mock auth service during Stage 1-8 development and are intentionally fake.
They do not correlate to any real backend credentials and should be removed before Stage 9.*

- `mockSalaries`: Array of salary configurations tracking historical and current records.

### Phase 2 Incentive Module (Frontend Mock Layer)
- **`incentiveService.js`**: Handles isolated read/write of doctor incentives using `mockStore`.
- **`mockIncentiveConfigurations`**: Tracks percentage-based incentive rules. Includes `status` ('Active', 'Historical') and `effectiveFrom`.
- **`mockIncentiveEarnings`**: Tracks simulated earnings based on revenue (`revenue × percentage / 100`).
- **Testing Isolation**: Log in as `Doctor` to view `/doctor/incentive` which strictly shows data for `doc1`. Admin can configure via `DoctorDetail.jsx` and view earnings at `/admin/incentives`.

### Phase 3 Payroll Module (Frontend Mock Layer)
- **`payrollService.js`**: Handles isolated read/write of doctor payrolls using `mockStore`.
- **`mockPayrolls`**: Tracks combined Salary + Incentive records per period.
- **`Calculated` vs `Paid`**: Admins can mark records as `Paid`. `Paid` is a one-way mock status flag.
- **Testing Isolation**: Log in as `Doctor` to view `/doctor/payroll` which strictly shows data for `doc1`. Admin can view global records at `/admin/payroll` and execute status shifts. No real payment processing is implemented.

## State Management
- Authentication state is managed via Context API (`AdminContext.jsx`, `DoctorContext.jsx`).