# MediFlow Web

> **AI-assisted doctor appointment, virtual waiting-room, and HL7 FHIR interoperability platform.**  
> *Note: This repository and folder contains the independent **Web Application** and **Unified Backend** of the MediFlow platform.*

---

## 1. System Architecture

```
MediFlow Web (React 19 + Vite) ────┐
                                   │
MediFlow Mobile (React Native) ────┼──> Unified Express Backend ──> ONE Persistent PostgreSQL Database
                                   │
HL7 FHIR R4 Integration Layer ────┘
```

The unified backend acts as the single source of truth for both Web and Mobile clients. Clients never connect directly to PostgreSQL.

---

## 2. Key Features

- **Single Persistent PostgreSQL Database**:
  - Full relational schema (`users`, `patient_profiles`, `doctors`, `locations`, `appointments`, `consultation_reports`, `notifications`, `family_members`, `medical_documents`).
  - Connection pooling with `pg` (`node-postgres`) and automatic SSL support for cloud deployment (Render, Neon, Supabase, Railway).
  - Idempotent schema migration and auto-seeding of 70 specialists across 5 cities.
  - Transparent in-memory fallback if PostgreSQL is not configured during local testing.
- **Secure Authentication & RBAC**:
  - `bcryptjs` password hashing (salt rounds = 10, never plain text).
  - JWT tokens with 7-day expiration and HTTP-only cookie + Bearer token support.
  - Role-based authorization (`patient` and `doctor`) enforced on all protected routes.
- **Multi-City Doctor Directory**:
  - 70 specialists across **Chennai**, **Bangalore**, **Hyderabad**, **Coimbatore**, and **Madurai**.
  - Multi-specialty coverage (Cardiology, Dermatology, Orthopedics, Pediatrics, Neurology, ENT, General Medicine, Gynecology).
- **Smart Appointment Booking & Live Queue**:
  - Token generation (`Q-01`, `Q-02`, etc.) with dynamic wait times:
    $$\text{Estimated Wait Time} = \text{Patients Ahead} \times \text{Specialist Consultation Duration}$$
  - Real-time Server-Sent Events (SSE) broadcasting live queue updates to connected patient & doctor screens.
- **Conversational AI Pre-Consultation**:
  - Structured 6-question clinical intake assistant (chief complaint, onset duration, location, 1–10 pain severity scale, associated symptoms, prior history).
- **Consultation Reports & PDF Streaming**:
  - Structured medical reports with clinical summary, physician advice, and follow-up plans.
  - Downloadable PDF reports generated dynamically via `pdfkit`.
- **HL7 FHIR R4 Interoperability Layer**:
  - FHIR Client, Models, and synthetic / live provider adapters mapping between MediFlow and standard FHIR resources (`Patient`, `Practitioner`, `Appointment`, `Encounter`, `Observation`, `DiagnosticReport`, `DocumentReference`).

---

## 3. Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Canvas Confetti.
- **Design System**: Frost UI (Glassmorphism with ambient background glows and responsive layout).
- **Backend API**: Node.js, Express 4, Server-Sent Events (SSE).
- **Database Layer**: PostgreSQL via `pg` connection pool with relational schema DDL (`server/db/schema.sql`) and unified database service (`server/db/dbService.js`).
- **Authentication**: `jsonwebtoken`, `bcryptjs`, `cookie-parser`.
- **Interoperability**: HL7 FHIR R4 integration layer (`server/integrations/healthcare/`).

---

## 4. Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Port
PORT=5000

# Node Environment
NODE_ENV=production

# JWT & Session Secrets
AUTH_SECRET=your_jwt_secret_key_change_in_production
SESSION_SECRET=your_session_secret_change_in_production

# PostgreSQL Database (Single Source of Truth)
# Example for Render / Supabase / Neon:
DATABASE_URL=postgres://user:password@host:5432/mediflow

# Alternative discrete connection parameters:
# PGHOST=localhost
# PGPORT=5432
# PGUSER=postgres
# PGPASSWORD=your_postgres_password
# PGDATABASE=mediflow
# PGSSL=false

# HL7 FHIR Interoperability (Optional external server)
FHIR_ENABLED=false
FHIR_BASE_URL=
FHIR_API_KEY=
```

---

## 5. Setup & Running Locally

### Step 1: Install Dependencies
```bash
# Root & backend dependencies
npm install

# Client dependencies
cd client
npm install
cd ..
```

### Step 2: Initialize Database (Optional if using PostgreSQL)
If `DATABASE_URL` is set, the server automatically applies `schema.sql` and seeds initial records on startup. You can also run:
```bash
node -e "require('./server/db').initDatabase(true)"
```

### Step 3: Run the Application
```bash
# Run both backend & frontend concurrently:
npm run dev

# Or run backend only:
npm run server
```

---

## 6. Automated Verification Test Suites

Run the comprehensive test suites to verify all systems:

```bash
# 1. PostgreSQL Database & Repository Suite
node test_postgres_db_integration.js

# 2. Authentication & Role Enforcement Suite
node test_auth_enforcement.js

# 3. Multi-City Doctor Directory & Queue Suite
node test_doctors_multi_location.js

# 4. HL7 FHIR R4 Interoperability Suite
node test_healthcare_api_integration.js

# 5. Full Platform Upgrade & PDF Generation Suite
node test_mediflow_upgrade.js

# 6. End-to-End Workflow Verification Suite
node test_mediflow_web.js
```

---

## 7. Render Deployment Instructions

1. **Create a PostgreSQL Database** on Render:
   - Go to Render Dashboard -> **New** -> **PostgreSQL**.
   - Copy the **Internal Database URL** (or External Connection String).
2. **Create a Web Service** for MediFlow Web:
   - Select repository: `MediFlow-Web`.
   - Environment: `Node`.
   - Build Command: `npm run build`
   - Start Command: `npm start`
3. **Set Environment Variables**:
   - `DATABASE_URL` = `<your-render-postgres-url>`
   - `AUTH_SECRET` = `<random-strong-secret>`
   - `NODE_ENV` = `production`
4. Deploy! The server will automatically connect to PostgreSQL, run table migrations, and seed data.
