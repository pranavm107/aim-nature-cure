# Decisions Log

*This file tracks decisions made during the project that clarify or extend the PRD.*

## 2026-08-15
- Initial memory files created. Project onboarding complete. No architectural or business rule decisions added yet.
- **Git History & Branch Split**: We chose to discard the inherited Prescripto git history entirely (using `git init` from scratch) instead of using `git filter-repo`. This was done to ensure a fully clean public repository free from exposed secrets, original authorship, and irrelevant commit messages. 
- **Patient Portal Parked**: The patient-facing `frontend/` workspace and Stripe/Razorpay code have been removed from `main` (which represents the V1 scope). They have been preserved exactly as they were in a frozen `archive/patient-portal` branch, which is parked one commit behind `main`, serving as the starting point for a future Patient Portal phase.

## 2026-08-17
- **Sidebar Grouping**: Decided to organize the Sidebar using categorized, collapsible sections (Overview, People, Operations, Financials, Reports) to handle the increased screen count for Admin, and similar clinical sections for Doctor.
- **Notifications UI**: Built the Notifications panel as a dropdown originating from a bell icon in the Navbar, rather than a full page or side drawer.
- **Forgot Password**: The Forgot Password flow will remain a mock-success-only screen for V1. We will not build a real email reset flow yet.
- **Stage 1 Complete**: Stage 1 frontend foundation complete and pushed, mock-adapter implemented via custom Axios adapter override (no new dependency), old `prescripto` MongoDB database still present in Atlas alongside `aimnaturecure` and flagged for cleanup at Stage 9.
