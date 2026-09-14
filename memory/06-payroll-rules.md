# AIM NATURE CURE ERP - MANDATORY INCENTIVE & PAYROLL CALCULATION RULES

These rules are mandatory for all future development involving:
- Incentive calculation
- Monthly incentive calculation
- Earnings
- Payroll
- Monthly statements
- Doctor incentive
- Salary + incentive
- Revenue incentive
- Activity incentive

These rules MUST NOT be bypassed or simplified.

## RULE 1 — DO NOT SIMPLY ADD INCENTIVE TO PAYROLL
Do NOT start Phase 3 by taking an existing payroll record and simply adding a hard-coded incentive amount.
Incorrect: Existing Payroll + Hard-coded Incentive = Gross Earnings. This is NOT acceptable.
The system must calculate incentives from the underlying eligible business records.

## RULE 2 — PHASE 2 APPROVAL IS THE SOURCE OF ACTIVITY ELIGIBILITY
Activity-based incentives MUST come only from activities that were approved by Admin during Phase 2.
Doctor submission alone is NOT sufficient.
Therefore: Submitted ≠ Earned, Approved = Incentive Eligible.

## RULE 3 — FOLLOW-UP INCENTIVE
Follow-up incentive must use APPROVED Follow-up Activities.
Only records with `status = Approved` are eligible.
Do NOT count submitted or rejected follow-ups toward incentive.

## RULE 4 — SOCIAL MEDIA INCENTIVE
Social Media incentive must use APPROVED Social Media Activities.
Only records with `status = Approved` are eligible.
Do NOT count submitted or rejected social-media activities.

## RULE 5 — USE PHASE 2A INCENTIVE RULES
Do NOT hard-code incentive percentages or amounts.
The calculation must use the configurable rules created in Phase 2A — Incentive Rule Management.
Revenue categories: Consultation, Treatment, Package.
Activity categories: Patient Follow-up, Social Media Activity.
The applicable rule must be resolved from the centralized incentive-rule data.

## RULE 6 — EFFECTIVE DATE
Incentive rules are effective-date based.
The calculation must use the applicable rule based on `effectiveFrom`.
A future rule must NOT be applied before its effective date.
An inactive rule must NOT be applied.
Historical rules must remain available for historical calculations. Do not simply use the latest rule in the array.

## RULE 7 — INACTIVE RULES
If an incentive rule is Inactive it MUST NOT be used for new calculations.
Inactive overrides effective-date applicability.
Do not reactivate an inactive rule automatically.

## RULE 8 — REVENUE INCENTIVE USES PAID REVENUE ONLY
This is mandatory. Revenue incentive must be calculated using PAID AMOUNTS ONLY.
Do NOT calculate revenue incentive from: invoice total, billed amount, unpaid amount, outstanding balance, appointment value, expected payment, estimated revenue.
Example: Invoice ₹50,000, Paid ₹30,000. If rule is 10%, Incentive = ₹3,000 (NOT ₹5,000).

## RULE 9 — PAYMENT DATA MUST COME FROM PAYMENT RECORDS
Revenue incentive must be derived from actual recorded payments.
Follow the existing financial architecture: Invoice → Payment → Paid Amount → Eligible Revenue → Incentive.
Do NOT assume that an invoice means payment has occurred.

## RULE 10 — REVENUE CATEGORIES MUST REMAIN SEPARATE
Do NOT combine all revenue into one generic percentage.
Calculate separately: Consultation Revenue, Treatment Revenue, Package Revenue.
Then: Consultation Incentive + Treatment Incentive + Package Incentive = Revenue Incentive.
Each category uses its own configured rule.

## RULE 11 — ACTIVITY INCENTIVES MUST REMAIN SEPARATE
Calculate separately: Follow-up Incentive and Social Media Incentive.
Then: Follow-up Incentive + Social Media Incentive = Activity Incentive.

## RULE 12 — TOTAL INCENTIVE
The final calculation must be: Revenue Incentive + Activity Incentive = Total Incentive.

## RULE 13 — GROSS EARNINGS
Gross Earnings must be: Base Salary + Total Incentive = Gross Earnings.
Base salary must come from the Salary Foundation.
Do NOT hard-code salary. Use the applicable salary based on the salary effective date.

## RULE 14 — MONTHLY CALCULATION
Phase 3 must calculate incentives for a specific payroll month (e.g. September 2026).
Only eligible records belonging to that calculation period should be included according to their applicable business dates.
Do NOT accidentally include records from other months.

## RULE 15 — NO DOUBLE COUNTING
An eligible activity or payment must not be counted twice.
The system must prevent duplicate incentive calculation for the same source record within the same monthly statement.

## RULE 16 — APPROVAL STATUS
Activity approval and payroll approval are different concepts.
Activity: Submitted → Approved / Rejected.
Monthly Statement: Pending Review → Approved → Paid.
Do NOT treat an approved activity as a paid payroll statement.

## RULE 17 — APPROVED ACTIVITY DOES NOT MEAN PAID
Approved Activity = Eligible for incentive calculation.
Payment happens only during the Payroll phase.

## RULE 18 — MONTHLY STATEMENT MUST PRESERVE BREAKDOWN
A monthly Doctor statement should preserve the full breakdown:
Doctor, Month, Base Salary.
Revenue Incentive (Breakdown of Consultations, Treatments, Packages).
Activity Incentive (Breakdown of Follow-ups, Social Media).
Total Incentive, Gross Earnings, Status.

## RULE 19 — CALCULATION MUST BE TRACEABLE
Every incentive amount should be traceable back to its source.
The system should be able to explain where every calculation came from (e.g. 3 Approved Activities × ₹500 configured rule = ₹1,500).

## RULE 20 — DO NOT USE HARD-CODED EXAMPLES AS REAL RULES
Examples such as Consultation = 10% are examples only. They MUST NOT become permanent hard-coded business rules.
The actual values must come from `mockIncentiveRules` through `incentiveService.js`.

## RULE 21 — SINGLE SOURCE OF TRUTH
Use `mockStore` as the source of truth. Do not create separate calculation datasets inside React components.
Architecture: UI → Service → mockStore → Source Data.

## RULE 22 — SERVICE LAYER CALCULATION
Calculation logic must live in the service/domain layer, not directly inside `.jsx` components.

## RULE 23 — NO MANUAL INCENTIVE EDITING
Admin must NOT manually type "Incentive Amount = ₹10,000" into the monthly statement as a replacement for calculation.

## RULE 24 — NO AUTOMATIC APPROVAL
Creating a monthly statement must NOT automatically make it Approved.
The lifecycle must remain: Pending Review → Approved → Paid.

## RULE 25 — NO AUTOMATIC PAYMENT
Approval must NOT automatically make the statement Paid.
Admin must explicitly mark the statement as Paid during the Payroll phase.

## RULE 26 — HISTORICAL INTEGRITY
Once a monthly statement is approved or paid, its calculated values must remain historically meaningful.
Changing rules/salary later must NOT silently rewrite historical statements.

## RULE 27 — NO HARD DELETE
Do not hard-delete incentive rules, approved activities, rejected activities, monthly statements, or salary history.

## RULE 28 — DO NOT MODIFY PHASE 2 WORKFLOW
Phase 3 must consume Phase 2 results. Do NOT bypass Phase 2A, 2B, or 2C.
Phase 2A (Rules) + Phase 2B/2C (Approved Activities) → Phase 3 (Calculation).

## RULE 29 — NO CALCULATION BEFORE PHASE 3
Phase 2 must remain a submission and eligibility layer. Phase 3 does the calculation and generates the statement. Do not move Phase 3 calculation into Phase 2.

## RULE 30 — FUTURE BACKEND COMPATIBILITY
Structure the service layer so that future backend APIs can replace mockStore without changing the business rules. Do not design logic that depends on UI-only state.

## MANDATORY CALCULATION FLOW
Doctor → Base Salary
+ Paid Consultation Revenue × Applicable Consultation Rule
+ Paid Treatment Revenue × Applicable Treatment Rule
+ Paid Package Revenue × Applicable Package Rule
+ Approved Follow-up Activities × Applicable Follow-up Rule
+ Approved Social Media Activities × Applicable Social Media Rule
↓ Total Incentive
↓ Base Salary + Total Incentive
↓ Monthly Statement
↓ Pending Review

## FINAL NON-NEGOTIABLE PRINCIPLE
NEVER calculate incentive merely because an invoice, consultation, treatment, package, or activity exists.
Eligibility must be determined correctly:
Revenue = PAID ONLY
Activities = APPROVED ONLY
Rules = CONFIGURABLE + EFFECTIVE-DATE BASED
Payroll = PENDING REVIEW → APPROVED → PAID
SUBMITTED ≠ EARNED. APPROVED ACTIVITY = INCENTIVE ELIGIBLE.
