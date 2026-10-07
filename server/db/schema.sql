-- =========================================================
-- MEDIFLOW HEALTHCARE PLATFORM - POSTGRESQL DATABASE SCHEMA
-- Single persistent source of truth for MediFlow Web & Mobile
-- =========================================================

-- 1. LOCATIONS / CITIES
CREATE TABLE IF NOT EXISTS locations (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  state VARCHAR(255),
  popular_areas JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS (Authentication & Role Credentials)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(64),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL CHECK (role IN ('patient', 'doctor')),
  name VARCHAR(255) NOT NULL,
  patient_id VARCHAR(64),
  doctor_id VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PATIENT PROFILES
CREATE TABLE IF NOT EXISTS patient_profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  age INT DEFAULT 28,
  gender VARCHAR(32) DEFAULT 'Female',
  phone VARCHAR(64),
  email VARCHAR(255),
  blood_group VARCHAR(32) DEFAULT 'O+',
  address TEXT DEFAULT 'Bangalore, India',
  emergency_contact VARCHAR(255),
  medical_alerts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DOCTORS (70 multi-location specialist dataset)
CREATE TABLE IF NOT EXISTS doctors (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  qualification VARCHAR(255),
  experience_years INT DEFAULT 5,
  rating NUMERIC(3, 2) DEFAULT 4.5,
  review_count INT DEFAULT 0,
  consultation_fee INT DEFAULT 500,
  languages JSONB DEFAULT '["English"]'::jsonb,
  hospital VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  location_id VARCHAR(64),
  city VARCHAR(255) NOT NULL,
  area VARCHAR(255),
  distance VARCHAR(64),
  avatar TEXT,
  bio TEXT,
  average_duration_minutes INT DEFAULT 15,
  working_hours VARCHAR(255) DEFAULT '09:00 AM - 05:00 PM',
  available_today BOOLEAN DEFAULT TRUE,
  badges JSONB DEFAULT '[]'::jsonb,
  next_available_slot VARCHAR(255),
  keywords JSONB DEFAULT '[]'::jsonb,
  slots JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. APPOINTMENTS & LIVE QUEUE STATE
CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(64) PRIMARY KEY,
  token_number VARCHAR(32) NOT NULL,
  doctor_id VARCHAR(64) REFERENCES doctors(id) ON DELETE CASCADE,
  doctor_name VARCHAR(255),
  doctor_specialty VARCHAR(255),
  doctor_avatar TEXT,
  hospital VARCHAR(255),
  location VARCHAR(255),
  patient_id VARCHAR(64) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_age INT DEFAULT 30,
  patient_gender VARCHAR(32) DEFAULT 'Male',
  date VARCHAR(32) NOT NULL,
  time VARCHAR(64) NOT NULL,
  consultation_type VARCHAR(64) DEFAULT 'In-Clinic',
  reason TEXT DEFAULT 'Consultation & clinical evaluation',
  status VARCHAR(64) NOT NULL DEFAULT 'waiting',
  queue_state VARCHAR(64) DEFAULT 'WAITING',
  queue_position INT DEFAULT 1,
  ai_pre_consultation JSONB DEFAULT '{}'::jsonb,
  doctor_notes TEXT DEFAULT '',
  consultation_summary JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONSULTATION REPORTS
CREATE TABLE IF NOT EXISTS consultation_reports (
  id VARCHAR(64) PRIMARY KEY,
  appointment_id VARCHAR(64) REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id VARCHAR(64) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_age INT DEFAULT 30,
  patient_gender VARCHAR(32) DEFAULT 'Male',
  doctor_id VARCHAR(64) NOT NULL,
  doctor_name VARCHAR(255) NOT NULL,
  doctor_specialty VARCHAR(255),
  hospital VARCHAR(255),
  location VARCHAR(255),
  date VARCHAR(32) NOT NULL,
  time VARCHAR(64) NOT NULL,
  chief_complaint TEXT,
  symptoms_reported TEXT,
  patient_provided_info TEXT,
  doctor_observations TEXT,
  doctor_notes TEXT,
  clinical_summary TEXT,
  advice TEXT,
  follow_up JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(64) DEFAULT 'Completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64),
  patient_id VARCHAR(64),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  time VARCHAR(64) DEFAULT 'Just now',
  read BOOLEAN DEFAULT FALSE,
  type VARCHAR(64) DEFAULT 'System',
  related_id VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FAMILY MEMBERS
CREATE TABLE IF NOT EXISTS family_members (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  relation VARCHAR(64) NOT NULL,
  age INT,
  gender VARCHAR(32),
  blood_group VARCHAR(32),
  phone VARCHAR(64),
  email VARCHAR(255),
  medical_conditions JSONB DEFAULT '[]'::jsonb,
  allergies JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. MEDICAL DOCUMENTS (Vault)
CREATE TABLE IF NOT EXISTS medical_documents (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(255) DEFAULT 'Diagnostic Report',
  date VARCHAR(32),
  doctor VARCHAR(255),
  hospital VARCHAR(255),
  file_size VARCHAR(64) DEFAULT '1.2 MB',
  status VARCHAR(64) DEFAULT 'Verified',
  is_shared_with_doctor BOOLEAN DEFAULT TRUE,
  type VARCHAR(32) DEFAULT 'pdf',
  report_id VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_doctors_city ON doctors(city);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_location ON doctors(location);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_reports_patient ON consultation_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_reports_doctor ON consultation_reports(doctor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_patient ON notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_patient ON medical_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_family_patient ON family_members(patient_id);
