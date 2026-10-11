====================================================================
               MEDIFLOW DATABASE DEMONSTRATION PACKAGE
       Comprehensive PostgreSQL Architecture & Demonstration Guide
====================================================================

1. PROJECT ARCHITECTURE
-----------------------

MediFlow operates on a decoupled, secure 3-tier healthcare architecture:

    +-----------------------+       +-------------------------+
    |   MediFlow Web App    |       |   MediFlow Mobile App   |
    |   (React 19 + Vite)   |       |     (React Native)      |
    +-----------+-----------+       +------------+------------+
                |                                |
                |       HTTP REST / SSE          |
                +--------------+-----------------+
                               |
                               v
                +------------------------------+
                |    Express.js Unified API    |
                |    (Backend Server Layer)    |
                +--------------+---------------+
                               |
                               |  PostgreSQL Connection Pool
                               v
                +------------------------------+
                |   PostgreSQL Database (pg)   |
                |  (Single Source of Truth)    |
                +------------------------------+

IMPORTANT ARCHITECTURAL RULE:
Neither the Web frontend nor the Mobile application connects directly to the
PostgreSQL database. All database reads, writes, transactions, and business logic
are exclusively mediated by the Express backend API.


2. DATABASE TECHNOLOGY STACK
----------------------------

- Database Engine: PostgreSQL (Relational SQL Database)
- Backend Runtime: Node.js with Express.js
- Driver & Access: pg (node-postgres) with Connection Pooling
- Security Layer: bcryptjs for password hashing, jsonwebtoken for JWT auth
- Cloud Compatible: Tested and deployable on Render, Neon, Supabase, Railway


3. DATABASE TABLES (9 RELATIONAL TABLES)
----------------------------------------

1. locations
   - Stores regional hub cities (Chennai, Bangalore, Hyderabad, Coimbatore, Madurai)
     and their prominent medical cluster areas.

2. users
   - Stores authentication accounts, bcrypt password hashes, and system roles
     ('patient' and 'doctor').

3. patient_profiles
   - Stores verified patient clinical demographics, contact details, blood group,
     address, emergency contact, and critical medical alerts.

4. doctors
   - Stores specialist dossiers including qualifications, experience, ratings,
     consultation fees, spoken languages, clinic locations, and daily booking slots.

5. appointments
   - Stores patient booking records, queue token numbers (e.g. Q-01, Q-02), live queue
     states (WAITING, NEAR_TURN, CALLED, IN_CONSULTATION, COMPLETED), AI pre-consultation
     intake answers, and physician notes.

6. consultation_reports
   - Stores structured official medical discharge summaries, doctor examination
     observations, clinical assessments, treatment advice, and follow-up schedules.

7. notifications
   - Stores real-time patient notifications, queue status updates, and lab alerts.

8. family_members
   - Stores dependent family profiles linked to primary patients for managing family
     appointments and tracking chronic medical conditions.

9. medical_documents
   - Stores digital health record metadata (blood tests, ECG reports, radiology scans,
     allergy panels) and doctor sharing consent flags.


4. ENTITY RELATIONSHIPS
-----------------------

- users -> patient_profiles:
  One user account maps to one comprehensive patient clinical profile (1:1 / 1:N).
  Foreign Key: patient_profiles.user_id -> users.id

- doctors -> appointments:
  Each doctor manages multiple patient appointments throughout clinic hours (1:N).
  Foreign Key: appointments.doctor_id -> doctors.id

- appointments -> consultation_reports:
  Completed consultations generate official structured medical reports (1:1).
  Foreign Key: consultation_reports.appointment_id -> appointments.id

- patient_profiles -> notifications, family_members, medical_documents:
  Patient records logically group notifications, family dependents, and health vault
  documents by patient_id.


5. DEMO DATASET OVERVIEW
------------------------

This demonstration package includes a comprehensive, safe synthetic dataset:

- 5 Regional Cities: Chennai, Bangalore, Hyderabad, Coimbatore, Madurai
- 70 Specialist Doctors: Fully distributed across Cardiology, Dermatology,
  Orthopedics, Pediatrics, Neurology, ENT, and General Medicine
- 5 Demo User Accounts: Including demo patient and demo doctor
- 16 Appointments: Live active queue appointments and completed past records
- 2 Consultation Reports: Detailed medical summaries for hypertension and dermatology
- 3 Patient Notifications: Queue alerts, report download alerts, and lab notices
- 4 Family Members: Multi-generational dependent records
- 4 Medical Documents: Diagnostic reports, resting ECGs, and radiology records


6. SECURITY & DATA PRIVACY
--------------------------

- Password Security: All user passwords are encrypted using bcrypt salt rounds = 10.
  Plaintext passwords are never stored in the database.
- Zero Credential Exposure: Connection URLs, passwords, API keys, and JWT secrets
  are completely omitted from this presentation package.
- 100% Synthetic Data: All patient names, phone numbers, and records are synthetic
  demonstration fixtures. No real patient data exists in this package.
- Access Mediation: The database is isolated in a private backend tier.


7. HOW TO DEMONSTRATE TO FACULTY / AUDITORS
-------------------------------------------

Step 1: Start the MediFlow-Web server:
        npm run dev   (starts both Backend and Frontend)
        OR
        npm run server (starts Backend on http://localhost:5000)

Step 2: Open the Web Application in your browser:
        http://localhost:5173 (Development) or http://localhost:5000 (Production)

Step 3: Demonstrate Authentication & Role Access:
        - Patient Demo: patient@mediflow.demo / Patient@123
        - Doctor Demo:  doctor@mediflow.demo  / Doctor@123

Step 4: Verify Database Connectivity & Health:
        Open: http://localhost:5000/api/health/database
        This endpoint verifies PostgreSQL connection status and server time.

Step 5: Inspect the Relational Schema:
        Open 'schema.sql' to show the 9 table DDL definitions, primary keys,
        foreign keys, JSONB fields, and performance indexes.

Step 6: Inspect the Demonstration Seed Data:
        Open 'seed_data.sql' to show the safe, structured SQL insert records.

====================================================================
EOF
