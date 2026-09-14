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

## Mock Data Modules

### Phase 5 Testing & Business Rule Validation
- **Status:** Completed.
- **Validation Report**:
  - **Tests Performed**: Checked invoice payment filtering (unpaid = 0, partial = actual paid, full = total), verified exact boundary dates in Node (`getMonthBounds` timezone bug identified and fixed), confirmed Activity status parsing (`Approved` only), prevented `Pending Review -> Paid` state hops.
  - **Business Rules Verified**: Payroll is exclusively system-calculated. Doctors cannot generate/approve/pay. Statement locking post-approval works as expected. Duplicate statements blocked. Recalculation restricted to `Pending Review`.
  - **Bugs Found**: `getMonthBounds` logic allowed timezone offset misalignment, causing e.g., "2026-09" to be parsed as August 31st UTC depending on local time.
  - **Bugs Fixed**: Split `YYYY-MM` string manually for Date parsing in `getMonthBounds`.
  - **Final Module Status**: The Salary, Incentive & Payroll module is complete and structurally sound.

### Phase 4 Payroll Approval & Payment
- **Status:** Completed.
- **`payrollService.js`**: Introduced structured `Pending Review` -> `Approved` -> `Paid` state transitions without recalculating Phase 3 baseline data. 
- **Workflow**: Statements are locked into immutable financial snapshots after being generated. Doctor views are strictly read-only, maintaining complete data isolation.
- **Generation & Recalculation**: Admin triggers monthly statement generation. The system performs the calculation. Doctor cannot create payroll. Duplicate statement generation is protected. Recalculation is allowed only while the statement is in `Pending Review` state.

### Phase 3 Automatic Monthly Incentive Calculation
- **Status:** Completed.
- **Calculation Logic**: Implemented automatic monthly incentive calculations based on configured revenue percentages and activity flat amounts.

### Phase 2B Follow-up Activity Submission
- **Status:** Completed.
- **`followUpService.js`**: Separated generic follow-up tasks from incentive submission activities (`mockFollowUpActivities`). Added complete submission, approval, and rejection methods.
- **Workflow**: `Submitted` != `Earned`. `Approved` = `Incentive Eligible`. No payroll or calculation actions take place here.

### Phase 2A Incentive Rule Management
- **Status:** Completed.
- **`incentiveService.js`**: Rebuilt to manage configurable revenue percentages and activity flat amounts.
- **`mockIncentiveRules`**: Single source of truth for global incentive rule definitions. Contains rules with explicit `effectiveFrom` dates. Prevents duplicates and strictly preserves historical data.

### Phase 1 Salary Foundation
- **Status:** Completed.
- **`salaryService.js`**: Calculates the `Current` salary dynamically based on the latest `effectiveFrom` date that is `<= Date.now()`.
- **`mockSalaries`**: Appends new records on update (does not overwrite), preserving a full historical timeline. `status` is evaluated on-the-fly (`Active`, `Scheduled`, `Historical`) rather than being hardcoded into the DB schema.

### Phase 0 Cleanup (Preparation for New Workflows)
- **Status:** Completed. Obsolete generic incentive logics and calculations were removed to pave the way for Activity & Revenue-based implementations.
- **Removed Modules:** `IncentivesOverview`, `MyIncentive`, old flat-percentage Incentive config in `DoctorDetail`.
- **Status Workflow:** Hardcoded "Calculated" -> "Paid" mock payroll status flow was cleaned up, replaced temporarily with a "Pending Review" baseline until the new feature set is developed.

## State Management
- Authentication state is managed via Context API (`AdminContext.jsx`, `DoctorContext.jsx`).