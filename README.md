# AIM Nature Cure ERP

## Description
AIM Nature Cure ERP is a purpose-built internal management system for AIM Nature Cure hospital. It centralizes patient management, consultations, therapy & package tracking, billing, doctor revenue/incentives, follow-ups, leads, social media proof, and daily/weekly/monthly reporting into a single platform.

## Features
- **Patient Management**: Full CRUD operations with patient timeline and assigned doctors.
- **Consultations**: Immutable clinical consultation records and medical history.
- **Therapies & Packages**: Therapy master and session tracking, package creation and consumption tracking.
- **Billing & Payments**: Invoice generation and payment recording with partial payment tracking.
- **Doctor Revenue & Incentives**: Daily, weekly, and monthly revenue tracking with configurable automated incentive calculations based on paid amounts.
- **Follow-Up Management**: Schedule, track, and complete follow-ups with in-app reminders.
- **Lead Management**: Track patient acquisition sources at registration.
- **Social Media Proof**: Manual upload of doctor social media activity for Admin review.
- **Doctor Personal Workspace**: Private doctor notes and task management.
- **Reporting**: Comprehensive daily closing reports, and daily/weekly/monthly performance analytics.
- **Audit Logs**: Tracking of critical entity changes.

## Tech Stack
- **Frontend**: React.js
- **Backend**: Node.js and Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Getting Started
Follow these instructions to set up the project locally.

### Prerequisites
- Node.js installed
- MongoDB installed or access to a MongoDB cloud instance
- Git installed

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/pranavm107/aim-nature-cure.git
   cd aim-nature-cure
   ```

2. **Install admin dependencies**
   ```bash
   cd admin
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

4. **Set up environment variables**
   In the backend directory, create a `.env` file with the following:
   ```env
   MONGODB_URI="your_mongodb_connection_string"
   JWT_SECRET="your_jwt_secret"
   ```

5. **Start server:**
   ```bash
   cd backend
   npm run server
   ```

6. **Start Admin Panel:**
   ```bash
   cd admin
   npm run dev
   ```

7. **Start Frontend Panel:**
   ```bash
   cd frontend
   npm run dev
   ```

## Project Status
Version 1 under active development. Refer to the PRD in the documentation for further details.

## License
All Rights Reserved. Copyright (c) 2026 AIM Nature Cure.
See [LICENSE.md](LICENSE.md).
