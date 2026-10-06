# MediFlow Web

> **AI-assisted doctor appointment and virtual waiting-room platform.**  
> *Note: This repository and folder contains the independent **Web Application** of the MediFlow platform.*

---

## 1. Project Overview

**MediFlow Web** solves the widespread hospital waiting room congestion problem by providing an intelligent appointment booking, real-time live queue tracking, virtual waiting lounge, and safety-compliant AI pre-consultation intake platform.

Patients can book specialist consultations, track their real-time position in queue, observe dynamically calculated waiting times based on specialist consultation duration, complete a structured pre-consultation intake conversation with an AI assistant, and receive proactive alerts when their turn arrives. Doctors manage active queues with one-click advancements and review patient intake summaries directly inside their clinical dashboard.

---

## 2. Key Features

- **Doctor Discovery & Search**: Specialty filtering across 8 medical domains and natural language symptom keyword search (e.g., *"chest pain"*, *"skin rash"*).
- **Specialist Dossiers**: Verified profiles showing hospital affiliations, consultation fees, ratings, experience, and real-time waiting line status.
- **Smart Appointment Booking**: Automated token generation (`Q-01`, `Q-02`, etc.) and dynamic wait time computation:  
  $$\text{Estimated Wait Time} = \text{Patients Ahead} \times \text{Specialist Consultation Duration}$$
- **Live Virtual Waiting Room**: Real-time queue position tracking (`#1 Consulting`, `#2 Waiting`, `#3 Waiting`, `#4 You`), live clinic queue stream, and audio-visual turn alerts.
- **Conversational AI Pre-Consultation**: Structured 6-question clinical intake assistant (chief complaint, onset duration, location, 1–10 pain severity scale, associated symptoms, prior consultation history) with medical disclaimers and emergency keyword detection.
- **Pre-Consultation Summary & Physician Transmission**: Structured intake review allowing patient verification before sending directly to the doctor station.
- **Doctor Clinical Dashboard**: Real-time queue controller, consultation completion triggers, patient drawer with submitted intake review, and AI clinical discharge summary generator.
- **Medical Vault & Family Management**: Encrypted health document storage and multi-member family profile management.

---

## 3. Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Canvas Confetti.
- **Design System**: Frost UI (Glassmorphism with ambient background glows and responsive layout).
- **Backend API**: Node.js, Express 4, Server-Sent Events (SSE) for real-time live queue broadcasts.
- **Data Layer**: In-memory synchronized state initialized with structured seed data (`server/data/seedData.js`).

---

## 4. Folder Structure

```
MediFlow-Web/
├── package.json              # Root package orchestrator
├── README.md                 # Project documentation
├── .gitignore                # Git ignore rules
├── .env.example              # Environment variables template
│
├── server/
│   ├── index.js              # Express REST API & SSE event broadcast server
│   └── data/
│       └── seedData.js       # Seed dataset (8 specialists, queue data, documents)
│
└── client/
    ├── package.json          # Frontend dependencies & scripts
    ├── index.html            # Vite HTML entry point
    ├── vite.config.js        # Vite configuration & API proxy setup
    ├── tailwind.config.js    # Tailwind theme & Frost UI custom styles
    ├── postcss.config.js     # PostCSS configuration
    ├── public/               # Static assets & icons
    └── src/
        ├── App.jsx           # Root responsive web application layout
        ├── main.jsx          # React DOM root mounting
        ├── index.css         # Glassmorphism & global animations
        ├── components/
        │   ├── ai/           # AI Pre-Consultation chat & summary review
        │   ├── auth/         # Authentication modal & quick demo logins
        │   ├── common/       # Navbar, notifications toast
        │   ├── doctor/       # Doctor dashboard & patient consultation drawer
        │   ├── patient/      # Doctor search, booking modal, waiting room, vault
        │   └── queue/        # Live queue visualizer & animated progress
        ├── context/
        │   ├── AuthContext.jsx   # Role state (Patient / Doctor) & profiles
        │   └── QueueContext.jsx  # Real-time SSE listener & audio chime alerts
        └── utils/
            ├── api.js        # Centralized REST API client
            └── sound.js      # Web Audio API chime & success alerts
```

---

## 5. Installation

To set up the project locally:

### Step 1: Install Root & Server Dependencies
```bash
cd MediFlow-Web
npm install
```

### Step 2: Install Client Dependencies
```bash
cd client
npm install
cd ..
```

---

## 6. How to Start Backend

Start the Express API server (runs on port **5000**):

```bash
# From the root directory:
node server/index.js
```

---

## 7. How to Start Frontend

Start the Vite development web server (runs on port **5173**):

```bash
# From the root directory:
npm --prefix client run dev

# Or directly from the client directory:
cd client
npm run dev
```

Alternatively, run both simultaneously from the root:
```bash
npm run dev
```

---

## 8. Environment Variables

Create a `.env` file in the root if custom ports are needed (refer to `.env.example`):

```env
PORT=5000
NODE_ENV=production
```

> **Security Note**: Never expose API keys or credentials in client-side code.

---

## 9. API Configuration

The Vite client is configured to proxy `/api` requests to `http://localhost:5000` during development, and communicates directly via relative paths (`/api/...`) in production:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/doctors` | `GET` | List specialists with specialty/keyword search |
| `/api/doctors/:id` | `GET` | Retrieve specialist profile & live queue stats |
| `/api/appointments` | `GET`, `POST` | Fetch or book new patient appointment |
| `/api/queue/:doctorId` | `GET` | Get real-time queue state for doctor |
| `/api/queue/:doctorId/complete` | `POST` | Complete consultation & advance line |
| `/api/ai/pre-consultation` | `POST` | Submit structured 6-point patient intake |
| `/api/ai/generate-summary` | `POST` | Generate clinical discharge summary |
| `/api/events` | `GET` | Server-Sent Events (SSE) real-time stream |
| `/api/demo/reset` | `POST` | Restore initial demo state |

---

## 10. Demo Flow

1. **Patient Booking**:
   - Open `http://localhost:5173` as **Patient**.
   - Search for *"Cardiologist"* or search symptom *"chest pain"*.
   - Select **Dr. Priya Sharma** $\rightarrow$ Click **Book Appointment** $\rightarrow$ Select slot and confirm.
   - Token **`Q-04`** is assigned with live position `#4` (3 patients ahead, ~54 min wait).

2. **Virtual Waiting Room & AI Pre-Consultation**:
   - Navigate to **Virtual Waiting Room** $\rightarrow$ Click **`[ Start Pre-Consultation ]`**.
   - Complete conversational intake (symptoms, duration, location, 1–10 severity slider, associated symptoms, prior history).
   - Click **`[ Generate Pre-Consultation Summary ]`** $\rightarrow$ Review dossier $\rightarrow$ Click **`[ Send to Doctor ]`**.

3. **Doctor Station & Live Queue Advancement**:
   - Switch role to **Doctor** (`Dr. Priya Sharma`).
   - View live queue (`#1 Rahul — Consulting`, `#2 Ananya`, `#3 Karthik`, `#4 Meera`).
   - Open `#4 Meera`'s record $\rightarrow$ View submitted **PATIENT PRE-CONSULTATION** panel.
   - Click **`[ Complete Consultation ]`** $\rightarrow$ Line advances in real time via SSE across all connected screens.

---

## 11. Production Deployment on Render (Unified Web Service)

Deploying `MediFlow-Web` as a **Unified Web Service** on [Render](https://render.com) serves both the Express API, real-time SSE stream, and built React static frontend from a single URL without CORS or proxy buffering hurdles.

### Render Service Settings:

| Setting | Value |
| :--- | :--- |
| **Service Type** | Web Service |
| **Name** | `mediflow-web` |
| **Environment** | `Node` |
| **Region** | Any (e.g. `Oregon (US West)` or `Singapore`) |
| **Branch** | `main` |
| **Root Directory** | `MediFlow-Web` (or leave empty if repo root is the project) |
| **Build Command** | `npm install && npm run build` (or `npm install && npm --prefix client install --include=dev && npm --prefix client run build`) |
| **Start Command** | `node server/index.js` |

### Environment Variables on Render:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables Express static asset serving from `client/dist` and SPA fallback |
| `PORT` | `10000` | Render automatically sets `PORT`, which `server/index.js` binds dynamically |
| `FHIR_ENABLED` | `false` | Defaults to synthetic FHIR provider; set `true` when external FHIR endpoint is active |
| `FHIR_BASE_URL` | Optional | URL of external hospital/EHR FHIR R4 REST endpoint |

---

## 12. Healthcare API & FHIR Integration

### 12.1 Overview & Concept
MediFlow is designed as an **API-driven healthcare interoperability platform**. Rather than directly coupling application state to hardcoded mock records, MediFlow implements an **Integration Layer** following the **HL7® FHIR® (Fast Healthcare Interoperability Resources) Release 4 (R4)** standard.

```
Hospital / Healthcare System (EHR / EMR / PACS)
                   ↓
            FHIR / REST API
                   ↓
  MediFlow Healthcare Integration Layer
                   ↓
            MediFlow Backend
               ↙        ↘
        MediFlow Web   MediFlow Mobile
```

### 12.2 Supported FHIR Resource Models (10 Types)
The MediFlow Integration Layer maps standard FHIR R4 resource structures to MediFlow healthcare domain entities:

| FHIR Resource | MediFlow Domain Mapping | Description |
| :--- | :--- | :--- |
| **`Patient`** | Patient Profile | Demographics, contact information, age, gender, identifier. |
| **`Practitioner`** | Doctor Dossier | Specialist identity, qualifications, specialty, hospital affiliation, consultation fee. |
| **`Organization`** | Medical Hub / Clinic | Hospital systems across metropolitan locations (Chennai, Bangalore, Hyderabad, Coimbatore, Madurai). |
| **`Schedule`** | Specialist OPD Schedule | Weekly and daily operating windows for clinic chambers. |
| **`Slot`** | Time Slots | Discrete booking intervals (09:00 AM, 09:30 AM, etc.) with free/busy availability. |
| **`Appointment`** | Booked Consultation | Scheduled encounter linking Patient and Practitioner with queue token assignment. |
| **`Encounter`** | Clinical Consultation | Active chamber consultation tracking start/end time and reason for visit. |
| **`Observation`** | Vitals & Lab Measurements | Blood pressure, heart rate, oxygen saturation, blood glucose with LOINC codes. |
| **`DiagnosticReport`** | Consultation Report | Physician-authorized consultation summary, findings, advice, and discharge documentation. |
| **`DocumentReference`** | Health Records Vault | Stored medical records, lab reports, and prescriptions. |

### 12.3 Provider Abstraction & Modes

MediFlow implements a provider abstraction with two interchangeable engines:

```
                  HealthcareDataProvider
                            |
           +----------------+----------------+
           |                                 |
SyntheticProvider (Default)         FhirHealthcareProvider (API)
• Local FHIR R4 Structures          • External REST FHIR Endpoint
• 70 Specialists, 5 Cities          • Real-time Hospital Gateway
• Offline & Demo Ready              • Automated Fallback on Outage
```

1. **Synthetic Mode (`FHIR_ENABLED=false`)**:
   - Uses realistic synthetic healthcare records structured under FHIR R4 schema.
   - Fully supports multi-doctor filtering, booking, and waiting room flows offline without external network dependencies.
2. **External FHIR API Mode (`FHIR_ENABLED=true`)**:
   - Connects to an external hospital/EHR FHIR endpoint defined in `FHIR_BASE_URL` with optional `FHIR_API_KEY`.
   - **Automated Graceful Fallback**: If the external endpoint is unreachable or times out, the integration layer logs the fallback event and seamlessly serves synthetic data without interrupting patient care.

### 12.4 Environment Variables

```env
# Healthcare Interoperability & FHIR API (HL7 R4)
FHIR_ENABLED=false
FHIR_BASE_URL=http://localhost:8080/fhir
FHIR_API_KEY=your_optional_bearer_token
```

### 12.5 Dedicated Healthcare Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/healthcare/status` | `GET` | Interoperability status, active provider, and supported resource list |
| `/api/healthcare/switch-provider` | `POST` | Toggle provider mode dynamically (`synthetic` vs `fhir_api`) |
| `/api/healthcare/patients` | `GET` | List or query FHIR Patient bundle |
| `/api/healthcare/patients/:id` | `GET` | Retrieve single FHIR Patient resource |
| `/api/healthcare/doctors` | `GET` | Retrieve FHIR Practitioner search bundle with location/specialty filters |
| `/api/healthcare/doctors/:id` | `GET` | Retrieve single FHIR Practitioner resource |
| `/api/healthcare/organizations` | `GET` | List hospital organizations |
| `/api/healthcare/schedules/:doctorId` | `GET` | Retrieve specialist operating schedule |
| `/api/healthcare/slots/:doctorId` | `GET` | Retrieve available booking slots |
| `/api/healthcare/appointments` | `GET`, `POST` | Query or create FHIR Appointment resources |
| `/api/healthcare/encounters/:id` | `GET` | Retrieve FHIR Encounter record |
| `/api/healthcare/observations/:patientId` | `GET` | Retrieve patient vitals and LOINC observations |
| `/api/healthcare/reports/:patientId` | `GET` | Retrieve FHIR DiagnosticReports |
| `/api/healthcare/documents/:patientId` | `GET` | Retrieve FHIR DocumentReferences |

### 12.6 Live Queue Layer on Top of FHIR
While FHIR handles standard appointment bookings and scheduling, real-time waiting room experiences require live token sequencing and active consultation state management. MediFlow layers its real-time **Queue Engine** on top of FHIR Appointments to dynamically calculate remaining wait times:
$$\text{Estimated Wait Time} = \text{Patients Ahead} \times \text{Specialist Consultation Duration}$$
Updates broadcast instantly to Web and Mobile via Server-Sent Events (SSE).

### 12.7 Security, Privacy & Compliance Statement

> **Important Healthcare Privacy Notice**:  
> Current prototype uses **synthetic / de-identified healthcare data** and is designed to integrate with authorized healthcare systems through APIs.  
> Production deployment with a live hospital EHR/EMR requires:
> 1. Formal Business Associate Agreements (BAA) and institutional data sharing agreements.
> 2. OAuth 2.0 / SMART on FHIR backend authorization with scoped tokens.
> 3. TLS 1.3 encryption in transit and AES-256 encryption at rest.
> 4. Role-based access control (RBAC), patient consent verification, and tamper-evident audit logging.
> 5. Adherence to jurisdictional health data regulations (e.g., HIPAA, GDPR, India DPDP Act 2023 / ABDM guidelines).
