# API Specification Addendum: Case Sheet Module

## Overview
This addendum outlines the data models and API routes for the Case Sheet module, verifying real-world intake and treatment protocol tracking per client requirements.

## 1. Data Models

### CaseSheet Entity
- `patientId`: Ref(Patient) - Required
- `date`: Date - Required
- `headerSnapshot`: Object (Point-in-time snapshot of Patient demographics at intake)
  - `idNumber`, `name`, `phone`, `age`, `gender`, `occupation`, `address`
- `presentComplaints`: String
- `vitals`: Object
  - `height`: Number
  - `weight`: Number
  - `bp`: String
  - `heartRate`: Number
  - `respiratoryRate`: Number
  - `temperature`: Number
- `obgHistory`: String
- `personalHistory`: Object
  - `appetite`, `sleep`, `bowel`, `micturition`, `thirst`, `addiction`: String
- `gpe` (General Physical Examination): String
- `systemicExamination`: String
- `pulseDiagnosis`: Object
  - `lu`, `li`, `st`, `sp`, `tw`, `pc`, `ht`, `si`, `liv`, `gb`, `ub`, `kid`: String
- `finalDiagnosis`: String
- `doctorSignature`: Object
  - `doctorId`: Ref(User)
  - `timestamp`: Date
- `isFinalized`: Boolean (Immutability lock)
- `treatmentProtocols`: Array of TreatmentProtocolEntry

### TreatmentProtocolEntry Sub-record
- `date`: Date - Required
- `notes`: String - Required
- `doctorId`: Ref(User) - Required

## 2. API Routes

### GET /api/v1/patients/:patientId/case-sheet
- **Roles**: Admin, Doctor
- **Description**: Fetch the Case Sheet for a specific patient.
- **Response**: CaseSheet object or null (if none exists).

### POST /api/v1/patients/:patientId/case-sheet
- **Roles**: Doctor
- **Description**: Create a new Case Sheet for a patient.
- **Body**: CaseSheet data fields (excluding treatmentProtocols).
- **Constraints**: 
  - Patient must belong to Doctor (BR-02).
  - Patient can only have one Case Sheet.

### POST /api/v1/patients/:patientId/case-sheet/protocol
- **Roles**: Doctor
- **Description**: Append a new Treatment Protocol Entry to the Case Sheet. Reuses "Addendum" UI logic.
- **Body**: `{ notes: "string" }`
- **Constraints**: 
  - Cannot modify existing protocols. Append-only (BR-13 equivalent).

## 3. Scope Change - Sequenced Batches (Add/Edit/View)

### Batch 1: Users & Appointments
- **PUT /api/v1/admin/users/:id**: Edit user (Name, Role only).
- **PUT /api/v1/appointments/:id**: Edit appointment. Locked if status is 'Completed'.

### Batch 2: Therapies & Packages
- **POST /api/v1/admin/therapies**: Create therapy.
- **PUT /api/v1/admin/therapies/:id**: Edit therapy.
- **GET /api/v1/admin/therapies/:id**: View therapy.
- **POST /api/v1/admin/packages**: Create package.
- **PUT /api/v1/admin/packages/:id**: Edit package.
- **GET /api/v1/admin/packages/:id**: View package.

### Batch 3: Follow-Ups
- **POST /api/v1/followups**: Create follow-up.
- **PUT /api/v1/followups/:id**: Edit follow-up.
- **GET /api/v1/followups**: List follow-ups.
- **GET /api/v1/followups/:id**: View follow-up detail.

### Batch 4: Daily Report
- **GET /api/v1/reports/daily**: Get list of dates with aggregate counts.
- **GET /api/v1/reports/daily/:date**: Get specific date details.
- **PUT /api/v1/reports/daily/:date/review**: Update doctor review status.

### Batch 5: Roles & Permissions
- **GET /api/v1/admin/roles**: List roles and permissions.
- **POST /api/v1/admin/roles**: Create new role.
- **PUT /api/v1/admin/roles/:id**: Update role permissions.
