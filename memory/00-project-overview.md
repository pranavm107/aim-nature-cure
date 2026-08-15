# AIM Nature Cure ERP - Project Overview

## What It Is
A purpose-built Enterprise Resource Planning (ERP) system for AIM Nature Cure, a nature cure and wellness hospital. It is adapted from an existing open-source hospital management system called Prescripto (MERN stack).

## Why It's Being Built
To formalize and centralize all day-to-day clinical, operational, and financial activities. Currently, patient records, follow-ups, and revenue tracking are informal, leading to missed follow-ups and limited management visibility. The ERP will automate incentive tracking, follow-up management, and provide robust reporting.

## V1 Users
1. **Admin**: Oversees hospital operations, doctors, revenue, reporting, and settings.
2. **Doctor**: Manages assigned patients, consultations, therapy sessions, follow-ups, tasks, and social media submissions.

## Business Context
- **Therapy-Based Revenue**: Doctors generate revenue through consultations and therapies (e.g., steam baths, hip baths).
- **Doctor Incentives**: Doctors have configurable monthly revenue targets. Meeting targets unlocks percentage-based incentives.
- **Follow-Ups**: Doctors must follow up with patients after their first visit (~3 sessions).
- **Leads**: Tracking patient acquisition channels (Google, Instagram, Walk-ins, etc.) is critical for management.
- **Social Media**: Doctors are expected to post on social media and submit proof via the ERP.

## CRITICAL STRUCTURAL FACT
**Prescripto's entire patient-facing frontend/ workspace is OUT of V1 scope.**
Patients do not log into the system in Version 1. The patient portal is parked on a separate branch for future development. Do not spend time rebranding or building features for the patient frontend.
