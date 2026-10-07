const { query, isDbConnected } = require('./pool');
const seedData = require('../data/seedData');

// In-Memory Fallback State (initialized from seedData deep copy)
let memUsers = JSON.parse(JSON.stringify(seedData.users));
let memLocations = JSON.parse(JSON.stringify(seedData.locations));
let memDoctors = JSON.parse(JSON.stringify(seedData.doctors));
let memAppointments = JSON.parse(JSON.stringify(seedData.appointments));
let memPatientProfile = JSON.parse(JSON.stringify(seedData.patientProfile));
let memFamilyMembers = JSON.parse(JSON.stringify(seedData.familyMembers));
let memConsultationReports = JSON.parse(JSON.stringify(seedData.consultationReports));
let memMedicalDocuments = JSON.parse(JSON.stringify(seedData.medicalDocuments));
let memNotifications = JSON.parse(JSON.stringify(seedData.notifications));

// Helper: Canonical specialty lookup
function getCanonicalSpecialty(spec) {
  if (!spec) return '';
  const s = spec.toLowerCase().trim();
  if (s.includes('cardio') || s.includes('heart')) return 'cardiology';
  if (s.includes('derma') || s.includes('skin')) return 'dermatology';
  if (s.includes('ortho') || s.includes('bone') || s.includes('joint')) return 'orthopedics';
  if (s.includes('pediat') || s.includes('child')) return 'pediatrics';
  if (s.includes('neuro') || s.includes('brain')) return 'neurology';
  if (s.includes('ent') || s.includes('sinus') || s.includes('ear') || s.includes('throat')) return 'ent';
  if (s.includes('general') || s.includes('physician') || s.includes('medicine')) return 'general_medicine';
  if (s.includes('gynec') || s.includes('women') || s.includes('obstet')) return 'gynecology';
  if (s.includes('dent')) return 'dentistry';
  return s;
}

// Convert DB row to Doctor model
function mapDoctorRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    qualification: row.qualification,
    experienceYears: row.experience_years,
    rating: parseFloat(row.rating),
    reviewCount: row.review_count,
    consultationFee: row.consultation_fee,
    languages: typeof row.languages === 'string' ? JSON.parse(row.languages) : row.languages,
    hospital: row.hospital,
    location: row.location,
    locationId: row.location_id,
    city: row.city,
    area: row.area,
    distance: row.distance,
    avatar: row.avatar,
    bio: row.bio,
    averageDurationMinutes: row.average_duration_minutes,
    workingHours: row.working_hours,
    availableToday: row.available_today,
    badges: typeof row.badges === 'string' ? JSON.parse(row.badges) : row.badges,
    nextAvailableSlot: row.next_available_slot,
    keywords: typeof row.keywords === 'string' ? JSON.parse(row.keywords) : row.keywords,
    slots: typeof row.slots === 'string' ? JSON.parse(row.slots) : row.slots
  };
}

// Convert DB row to Appointment model
function mapAppointmentRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    tokenNumber: row.token_number,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorSpecialty: row.doctor_specialty,
    doctorAvatar: row.doctor_avatar,
    hospital: row.hospital,
    location: row.location,
    patientId: row.patient_id,
    patientName: row.patient_name,
    patientAge: row.patient_age,
    patientGender: row.patient_gender,
    date: row.date,
    time: row.time,
    consultationType: row.consultation_type,
    reason: row.reason,
    status: row.status,
    queueState: row.queue_state,
    queuePosition: row.queue_position,
    aiPreConsultation: typeof row.ai_pre_consultation === 'string' ? JSON.parse(row.ai_pre_consultation) : (row.ai_pre_consultation || {}),
    doctorNotes: row.doctor_notes || '',
    consultationSummary: typeof row.consultation_summary === 'string' ? JSON.parse(row.consultation_summary) : row.consultation_summary,
    createdAt: row.created_at
  };
}

// Convert DB row to User model
function mapUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    passwordHash: row.password_hash,
    role: row.role,
    name: row.name,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    createdAt: row.created_at
  };
}

// Convert DB row to Report model
function mapReportRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    appointmentId: row.appointment_id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    patientAge: row.patient_age,
    patientGender: row.patient_gender,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorSpecialty: row.doctor_specialty,
    hospital: row.hospital,
    location: row.location,
    date: row.date,
    time: row.time,
    chiefComplaint: row.chief_complaint,
    symptomsReported: row.symptoms_reported,
    patientProvidedInfo: row.patient_provided_info,
    doctorObservations: row.doctor_observations,
    doctorNotes: row.doctor_notes,
    clinicalSummary: row.clinical_summary,
    advice: row.advice,
    followUp: typeof row.follow_up === 'string' ? JSON.parse(row.follow_up) : (row.follow_up || {}),
    status: row.status,
    createdAt: row.created_at
  };
}

const dbService = {
  // ==========================================
  // USERS
  // ==========================================
  async findUserByEmailOrPhone(identifier) {
    const clean = identifier.trim().toLowerCase();
    const rawClean = identifier.trim().replace(/\s+/g, '');

    if (isDbConnected()) {
      const res = await query(
        `SELECT * FROM users WHERE LOWER(email) = $1 OR REPLACE(phone, ' ', '') = $2 LIMIT 1;`,
        [clean, rawClean]
      );
      return mapUserRow(res.rows[0]);
    }

    return memUsers.find(u => 
      u.email.toLowerCase() === clean || 
      (u.phone && u.phone.replace(/\s+/g, '') === rawClean)
    ) || null;
  },

  async findUserById(id) {
    if (isDbConnected()) {
      const res = await query('SELECT * FROM users WHERE id = $1 LIMIT 1;', [id]);
      return mapUserRow(res.rows[0]);
    }
    return memUsers.find(u => u.id === id) || null;
  },

  async createUser(userData) {
    if (isDbConnected()) {
      const res = await query(
        `INSERT INTO users (id, email, phone, password_hash, role, name, patient_id, doctor_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         RETURNING *;`,
        [
          userData.id,
          userData.email.toLowerCase().trim(),
          userData.phone || null,
          userData.passwordHash,
          userData.role,
          userData.name,
          userData.patientId || null,
          userData.doctorId || null
        ]
      );
      return mapUserRow(res.rows[0]);
    }

    memUsers.push(userData);
    return userData;
  },

  // ==========================================
  // PATIENT PROFILES
  // ==========================================
  async getPatientProfile(patientIdOrUserId) {
    if (isDbConnected()) {
      let res = await query(
        `SELECT * FROM patient_profiles WHERE id = $1 OR user_id = $1 LIMIT 1;`,
        [patientIdOrUserId]
      );
      if (res.rows.length === 0) {
        res = await query('SELECT * FROM patient_profiles LIMIT 1;');
      }
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          name: row.name,
          age: row.age,
          gender: row.gender,
          phone: row.phone,
          email: row.email,
          bloodGroup: row.blood_group,
          address: row.address,
          emergencyContact: row.emergency_contact,
          medicalAlerts: typeof row.medical_alerts === 'string' ? JSON.parse(row.medical_alerts) : (row.medical_alerts || [])
        };
      }
    }
    return memPatientProfile;
  },

  async updatePatientProfile(profileData) {
    if (isDbConnected()) {
      const id = profileData.id || 'pat-1';
      const res = await query(
        `INSERT INTO patient_profiles (id, user_id, name, age, gender, phone, email, blood_group, address, emergency_contact, medical_alerts, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = COALESCE(EXCLUDED.name, patient_profiles.name),
           age = COALESCE(EXCLUDED.age, patient_profiles.age),
           gender = COALESCE(EXCLUDED.gender, patient_profiles.gender),
           phone = COALESCE(EXCLUDED.phone, patient_profiles.phone),
           email = COALESCE(EXCLUDED.email, patient_profiles.email),
           blood_group = COALESCE(EXCLUDED.blood_group, patient_profiles.blood_group),
           address = COALESCE(EXCLUDED.address, patient_profiles.address),
           emergency_contact = COALESCE(EXCLUDED.emergency_contact, patient_profiles.emergency_contact),
           medical_alerts = COALESCE(EXCLUDED.medical_alerts, patient_profiles.medical_alerts),
           updated_at = NOW()
         RETURNING *;`,
        [
          id,
          profileData.userId || null,
          profileData.name,
          profileData.age,
          profileData.gender,
          profileData.phone,
          profileData.email,
          profileData.bloodGroup,
          profileData.address,
          profileData.emergencyContact,
          JSON.stringify(profileData.medicalAlerts || [])
        ]
      );
      const row = res.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        age: row.age,
        gender: row.gender,
        phone: row.phone,
        email: row.email,
        bloodGroup: row.blood_group,
        address: row.address,
        emergencyContact: row.emergency_contact,
        medicalAlerts: typeof row.medical_alerts === 'string' ? JSON.parse(row.medical_alerts) : (row.medical_alerts || [])
      };
    }

    memPatientProfile = { ...memPatientProfile, ...profileData };
    return memPatientProfile;
  },

  // ==========================================
  // LOCATIONS
  // ==========================================
  async getLocations() {
    if (isDbConnected()) {
      const res = await query('SELECT * FROM locations ORDER BY name ASC;');
      return res.rows.map(r => ({
        id: r.id,
        name: r.name,
        state: r.state,
        popularAreas: typeof r.popular_areas === 'string' ? JSON.parse(r.popular_areas) : (r.popular_areas || [])
      }));
    }
    return memLocations;
  },

  // ==========================================
  // DOCTORS
  // ==========================================
  async getDoctors(filters = {}) {
    let list = [];
    if (isDbConnected()) {
      const res = await query('SELECT * FROM doctors ORDER BY rating DESC, review_count DESC;');
      list = res.rows.map(mapDoctorRow);
    } else {
      list = JSON.parse(JSON.stringify(memDoctors));
    }

    const { specialty, location, search, minRating, maxFee } = filters;

    if (location && location !== 'All' && location !== 'All Locations') {
      const locLower = location.toLowerCase().trim();
      list = list.filter(d => 
        (d.location && d.location.toLowerCase() === locLower) ||
        (d.location && d.location.toLowerCase().includes(locLower)) ||
        (d.city && d.city.toLowerCase() === locLower) ||
        (d.locationId && d.locationId.toLowerCase().includes(locLower))
      );
    }

    if (specialty && specialty !== 'All' && specialty !== 'All Specialties') {
      const targetCanon = getCanonicalSpecialty(specialty);
      list = list.filter(d => {
        const docCanon = getCanonicalSpecialty(d.specialty);
        return docCanon === targetCanon || d.specialty.toLowerCase() === specialty.toLowerCase().trim();
      });
    }

    if (minRating) {
      list = list.filter(d => d.rating >= parseFloat(minRating));
    }

    if (maxFee) {
      list = list.filter(d => d.consultationFee <= parseInt(maxFee));
    }

    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.specialty.toLowerCase().includes(q) ||
        d.hospital.toLowerCase().includes(q) ||
        (d.location && d.location.toLowerCase().includes(q)) ||
        (d.city && d.city.toLowerCase() === q) ||
        (d.area && d.area.toLowerCase().includes(q)) ||
        (d.keywords && d.keywords.some(k => k.toLowerCase().includes(q)))
      );
    }

    return list;
  },

  async getDoctorById(id) {
    if (isDbConnected()) {
      const res = await query('SELECT * FROM doctors WHERE id = $1 LIMIT 1;', [id]);
      return mapDoctorRow(res.rows[0]);
    }
    return memDoctors.find(d => d.id === id) || null;
  },

  // ==========================================
  // APPOINTMENTS
  // ==========================================
  async getAppointments(filters = {}) {
    let list = [];
    if (isDbConnected()) {
      const res = await query('SELECT * FROM appointments ORDER BY created_at DESC;');
      list = res.rows.map(mapAppointmentRow);
    } else {
      list = JSON.parse(JSON.stringify(memAppointments));
    }

    const { doctorId, patientId, status, date } = filters;

    if (patientId) {
      list = list.filter(a => a.patientId === patientId || a.patientId === 'pat-1' || a.patientId === 'pat-2');
    }
    if (doctorId) {
      list = list.filter(a => a.doctorId === doctorId);
    }
    if (status) {
      list = list.filter(a => a.status === status);
    }
    if (date) {
      list = list.filter(a => a.date === date);
    }

    list.sort((a, b) => {
      if (a.status === 'now_consulting') return -1;
      if (b.status === 'now_consulting') return 1;
      if (a.status === 'waiting' && b.status === 'waiting') return a.queuePosition - b.queuePosition;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return list;
  },

  async getAppointmentById(id) {
    if (isDbConnected()) {
      const res = await query('SELECT * FROM appointments WHERE id = $1 LIMIT 1;', [id]);
      return mapAppointmentRow(res.rows[0]);
    }
    return memAppointments.find(a => a.id === id) || null;
  },

  async createAppointment(aptData) {
    if (isDbConnected()) {
      const res = await query(
        `INSERT INTO appointments (
           id, token_number, doctor_id, doctor_name, doctor_specialty, doctor_avatar,
           hospital, location, patient_id, patient_name, patient_age, patient_gender,
           date, time, consultation_type, reason, status, queue_state, queue_position,
           ai_pre_consultation, doctor_notes, consultation_summary, created_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9, $10, $11, $12,
           $13, $14, $15, $16, $17, $18, $19,
           $20, $21, $22, NOW()
         ) RETURNING *;`,
        [
          aptData.id,
          aptData.tokenNumber,
          aptData.doctorId,
          aptData.doctorName,
          aptData.doctorSpecialty,
          aptData.doctorAvatar,
          aptData.hospital || null,
          aptData.location || null,
          aptData.patientId,
          aptData.patientName,
          aptData.patientAge || 30,
          aptData.patientGender || 'Male',
          aptData.date,
          aptData.time,
          aptData.consultationType || 'In-Clinic',
          aptData.reason || 'Consultation',
          aptData.status || 'waiting',
          aptData.queueState || 'WAITING',
          aptData.queuePosition || 1,
          JSON.stringify(aptData.aiPreConsultation || {}),
          aptData.doctorNotes || '',
          aptData.consultationSummary ? JSON.stringify(aptData.consultationSummary) : null
        ]
      );
      return mapAppointmentRow(res.rows[0]);
    }

    memAppointments.push(aptData);
    return aptData;
  },

  async updateAppointment(id, updateData) {
    if (isDbConnected()) {
      const current = await this.getAppointmentById(id);
      if (!current) return null;

      const merged = { ...current, ...updateData };

      const res = await query(
        `UPDATE appointments SET
           status = $2,
           queue_state = $3,
           queue_position = $4,
           ai_pre_consultation = $5,
           doctor_notes = $6,
           consultation_summary = $7,
           updated_at = NOW()
         WHERE id = $1
         RETURNING *;`,
        [
          id,
          merged.status,
          merged.queueState,
          merged.queuePosition,
          JSON.stringify(merged.aiPreConsultation || {}),
          merged.doctorNotes || '',
          merged.consultationSummary ? JSON.stringify(merged.consultationSummary) : null
        ]
      );
      return mapAppointmentRow(res.rows[0]);
    }

    const idx = memAppointments.findIndex(a => a.id === id);
    if (idx !== -1) {
      memAppointments[idx] = { ...memAppointments[idx], ...updateData };
      return memAppointments[idx];
    }
    return null;
  },

  async updateDoctorQueuePositions(appointmentsList) {
    for (const apt of appointmentsList) {
      await this.updateAppointment(apt.id, {
        status: apt.status,
        queueState: apt.queueState,
        queuePosition: apt.queuePosition,
        doctorNotes: apt.doctorNotes,
        consultationSummary: apt.consultationSummary
      });
    }
  },

  // ==========================================
  // CONSULTATION REPORTS
  // ==========================================
  async getConsultationReports(filters = {}) {
    let list = [];
    if (isDbConnected()) {
      const res = await query('SELECT * FROM consultation_reports ORDER BY created_at DESC;');
      list = res.rows.map(mapReportRow);
    } else {
      list = JSON.parse(JSON.stringify(memConsultationReports));
    }

    const { patientId, doctorId } = filters;
    if (patientId) {
      list = list.filter(r => r.patientId === patientId || r.patientId === 'pat-1');
    }
    if (doctorId) {
      list = list.filter(r => r.doctorId === doctorId);
    }
    return list;
  },

  async getConsultationReportById(id) {
    if (isDbConnected()) {
      const res = await query('SELECT * FROM consultation_reports WHERE id = $1 LIMIT 1;', [id]);
      return mapReportRow(res.rows[0]);
    }
    return memConsultationReports.find(r => r.id === id) || null;
  },

  async createConsultationReport(reportData) {
    if (isDbConnected()) {
      const res = await query(
        `INSERT INTO consultation_reports (
           id, appointment_id, patient_id, patient_name, patient_age, patient_gender,
           doctor_id, doctor_name, doctor_specialty, hospital, location,
           date, time, chief_complaint, symptoms_reported, patient_provided_info,
           doctor_observations, doctor_notes, clinical_summary, advice, follow_up, status, created_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9, $10, $11,
           $12, $13, $14, $15, $16,
           $17, $18, $19, $20, $21, $22, NOW()
         ) RETURNING *;`,
        [
          reportData.id,
          reportData.appointmentId || null,
          reportData.patientId,
          reportData.patientName,
          reportData.patientAge || 30,
          reportData.patientGender || 'Male',
          reportData.doctorId,
          reportData.doctorName,
          reportData.doctorSpecialty || '',
          reportData.hospital || '',
          reportData.location || '',
          reportData.date,
          reportData.time,
          reportData.chiefComplaint || '',
          reportData.symptomsReported || '',
          reportData.patientProvidedInfo || '',
          reportData.doctorObservations || '',
          reportData.doctorNotes || '',
          reportData.clinicalSummary || '',
          reportData.advice || '',
          JSON.stringify(reportData.followUp || {}),
          reportData.status || 'Completed'
        ]
      );
      return mapReportRow(res.rows[0]);
    }

    memConsultationReports.unshift(reportData);
    return reportData;
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  async getNotifications(userId, patientId) {
    if (isDbConnected()) {
      const res = await query(
        `SELECT * FROM notifications
         WHERE user_id = $1 OR patient_id = $2 OR user_id = 'usr-patient-1'
         ORDER BY created_at DESC;`,
        [userId || '', patientId || 'pat-1']
      );
      return res.rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        patientId: r.patient_id,
        title: r.title,
        message: r.message,
        time: r.time,
        read: r.read,
        type: r.type,
        relatedId: r.related_id,
        createdAt: r.created_at
      }));
    }

    return memNotifications.filter(n => 
      n.userId === userId || n.patientId === patientId || n.userId === 'usr-patient-1'
    );
  },

  async createNotification(notifData) {
    if (isDbConnected()) {
      const res = await query(
        `INSERT INTO notifications (id, user_id, patient_id, title, message, time, read, type, related_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         RETURNING *;`,
        [
          notifData.id,
          notifData.userId || 'usr-patient-1',
          notifData.patientId || 'pat-1',
          notifData.title,
          notifData.message,
          notifData.time || 'Just now',
          notifData.read || false,
          notifData.type || 'System',
          notifData.relatedId || null
        ]
      );
      const r = res.rows[0];
      return {
        id: r.id,
        userId: r.user_id,
        patientId: r.patient_id,
        title: r.title,
        message: r.message,
        time: r.time,
        read: r.read,
        type: r.type,
        relatedId: r.related_id
      };
    }

    memNotifications.unshift(notifData);
    return notifData;
  },

  async markNotificationRead(id) {
    if (isDbConnected()) {
      const res = await query(
        `UPDATE notifications SET read = true WHERE id = $1 RETURNING *;`,
        [id]
      );
      return res.rows[0];
    }
    const notif = memNotifications.find(n => n.id === id);
    if (notif) notif.read = true;
    return notif;
  },

  async markAllNotificationsRead(userId, patientId) {
    if (isDbConnected()) {
      await query(
        `UPDATE notifications SET read = true
         WHERE user_id = $1 OR patient_id = $2 OR user_id = 'usr-patient-1';`,
        [userId || '', patientId || 'pat-1']
      );
      return true;
    }
    memNotifications.forEach(n => {
      if (n.userId === userId || n.patientId === patientId || n.userId === 'usr-patient-1') {
        n.read = true;
      }
    });
    return true;
  },

  async deleteNotification(id) {
    if (isDbConnected()) {
      await query('DELETE FROM notifications WHERE id = $1;', [id]);
      return true;
    }
    memNotifications = memNotifications.filter(n => n.id !== id);
    return true;
  },

  // ==========================================
  // FAMILY MEMBERS
  // ==========================================
  async getFamilyMembers(patientId) {
    if (isDbConnected()) {
      const res = await query(
        `SELECT * FROM family_members WHERE patient_id = $1 OR patient_id = 'pat-1' ORDER BY created_at ASC;`,
        [patientId || 'pat-1']
      );
      return res.rows.map(r => ({
        id: r.id,
        patientId: r.patient_id,
        name: r.name,
        relation: r.relation,
        age: r.age,
        gender: r.gender,
        bloodGroup: r.blood_group,
        medicalConditions: typeof r.medical_conditions === 'string' ? JSON.parse(r.medical_conditions) : (r.medical_conditions || []),
        allergies: typeof r.allergies === 'string' ? JSON.parse(r.allergies) : (r.allergies || [])
      }));
    }
    return memFamilyMembers;
  },

  async createFamilyMember(memberData) {
    if (isDbConnected()) {
      const res = await query(
        `INSERT INTO family_members (id, patient_id, name, relation, age, gender, blood_group, medical_conditions, allergies, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         RETURNING *;`,
        [
          memberData.id,
          memberData.patientId || 'pat-1',
          memberData.name,
          memberData.relation,
          memberData.age || 30,
          memberData.gender || 'Male',
          memberData.bloodGroup || 'O+',
          JSON.stringify(memberData.medicalConditions || []),
          JSON.stringify(memberData.allergies || [])
        ]
      );
      const r = res.rows[0];
      return {
        id: r.id,
        patientId: r.patient_id,
        name: r.name,
        relation: r.relation,
        age: r.age,
        gender: r.gender,
        bloodGroup: r.blood_group
      };
    }

    memFamilyMembers.push(memberData);
    return memberData;
  },

  // ==========================================
  // MEDICAL DOCUMENTS (VAULT)
  // ==========================================
  async getMedicalDocuments(patientId) {
    if (isDbConnected()) {
      const res = await query(
        `SELECT * FROM medical_documents WHERE patient_id = $1 OR patient_id = 'pat-1' ORDER BY created_at DESC;`,
        [patientId || 'pat-1']
      );
      return res.rows.map(r => ({
        id: r.id,
        patientId: r.patient_id,
        title: r.title,
        category: r.category,
        date: r.date,
        doctor: r.doctor,
        hospital: r.hospital,
        fileSize: r.file_size,
        status: r.status,
        isSharedWithDoctor: r.is_shared_with_doctor,
        type: r.type,
        reportId: r.report_id
      }));
    }
    return memMedicalDocuments.filter(d => d.patientId === patientId || d.patientId === 'pat-1');
  },

  async createMedicalDocument(docData) {
    if (isDbConnected()) {
      const res = await query(
        `INSERT INTO medical_documents (id, patient_id, title, category, date, doctor, hospital, file_size, status, is_shared_with_doctor, type, report_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
         RETURNING *;`,
        [
          docData.id,
          docData.patientId || 'pat-1',
          docData.title,
          docData.category || 'Diagnostic Report',
          docData.date,
          docData.doctor,
          docData.hospital,
          docData.fileSize || '1.2 MB',
          docData.status || 'Verified',
          docData.isSharedWithDoctor !== undefined ? docData.isSharedWithDoctor : true,
          docData.type || 'pdf',
          docData.reportId || null
        ]
      );
      const r = res.rows[0];
      return {
        id: r.id,
        patientId: r.patient_id,
        title: r.title,
        category: r.category,
        date: r.date,
        doctor: r.doctor,
        hospital: r.hospital,
        fileSize: r.file_size,
        status: r.status,
        isSharedWithDoctor: r.is_shared_with_doctor,
        type: r.type,
        reportId: r.report_id
      };
    }

    memMedicalDocuments.unshift(docData);
    return docData;
  },

  async toggleDocumentShare(id) {
    if (isDbConnected()) {
      const res = await query(
        `UPDATE medical_documents
         SET is_shared_with_doctor = NOT is_shared_with_doctor
         WHERE id = $1
         RETURNING *;`,
        [id]
      );
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        isSharedWithDoctor: r.is_shared_with_doctor
      };
    }

    const doc = memMedicalDocuments.find(d => d.id === id);
    if (!doc) return null;
    doc.isSharedWithDoctor = !doc.isSharedWithDoctor;
    return doc;
  },

  // ==========================================
  // RESET DEMO DATA
  // ==========================================
  async resetDemoData() {
    if (isDbConnected()) {
      const { seedDatabase } = require('./init');
      await seedDatabase();
      return true;
    }

    memUsers = JSON.parse(JSON.stringify(seedData.users));
    memLocations = JSON.parse(JSON.stringify(seedData.locations));
    memDoctors = JSON.parse(JSON.stringify(seedData.doctors));
    memAppointments = JSON.parse(JSON.stringify(seedData.appointments));
    memPatientProfile = JSON.parse(JSON.stringify(seedData.patientProfile));
    memFamilyMembers = JSON.parse(JSON.stringify(seedData.familyMembers));
    memConsultationReports = JSON.parse(JSON.stringify(seedData.consultationReports));
    memMedicalDocuments = JSON.parse(JSON.stringify(seedData.medicalDocuments));
    memNotifications = JSON.parse(JSON.stringify(seedData.notifications));
    return true;
  }
};

module.exports = dbService;
