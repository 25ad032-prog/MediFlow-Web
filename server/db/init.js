const fs = require('fs');
const path = require('path');
const { query, getClient, checkConnection, hasDbConfig } = require('./pool');
const seedData = require('../data/seedData');

async function initDatabase(forceReseed = false) {
  const configured = hasDbConfig();

  if (!configured) {
    console.log('[PostgreSQL] ℹ️ No PostgreSQL configuration detected. Operating in local in-memory fallback mode.');
    return false;
  }

  console.log('[PostgreSQL] 🔍 PostgreSQL configuration detected in environment variables.');

  const conn = await checkConnection();
  if (!conn.connected) {
    console.error(`[PostgreSQL] ❌ PostgreSQL connection failed: ${conn.error || conn.reason}`);
    if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
      console.error('[PostgreSQL] ⚠️ Database initialization failed. Please verify DATABASE_URL and network access on Render.');
    } else {
      console.warn('[PostgreSQL] ⚠️ Database initialization failed. Falling back to in-memory mode for offline development.');
    }
    return false;
  }

  console.log(`[PostgreSQL] ✅ PostgreSQL connection successful (database: "${conn.database}", server time: ${conn.serverTime}).`);

  // 1. Run Schema DDL
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await query(schemaSql);
    console.log('[PostgreSQL] ✅ Database schema DDL verified and tables ready.');
  } catch (err) {
    console.error('[PostgreSQL] ❌ Error executing schema.sql:', err.message);
    console.error('[PostgreSQL] ⚠️ Database initialization failed.');
    throw err;
  }

  // 2. Check if seeding is needed
  try {
    const docCountRes = await query('SELECT COUNT(*) FROM doctors;');
    const docCount = parseInt(docCountRes.rows[0].count, 10);

    if (docCount === 0 || forceReseed) {
      console.log(`[PostgreSQL] 📥 Seeding database (initial doctors count: ${docCount})...`);
      await seedDatabase();
      console.log('[PostgreSQL] ✅ Database initialization successful (70 specialists seeded across 5 cities).');
    } else {
      console.log(`[PostgreSQL] ✅ Database initialization successful (${docCount} persistent specialists verified).`);
    }
    return true;
  } catch (err) {
    console.error('[PostgreSQL] ❌ Error during database initialization check:', err.message);
    console.error('[PostgreSQL] ⚠️ Database initialization failed.');
    return false;
  }
}

async function seedDatabase() {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Seed Locations
    for (const loc of seedData.locations) {
      await client.query(
        `INSERT INTO locations (id, name, state, popular_areas)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           state = EXCLUDED.state,
           popular_areas = EXCLUDED.popular_areas;`,
        [loc.id, loc.name, loc.state, JSON.stringify(loc.popularAreas || [])]
      );
    }

    // 2. Seed Users
    for (const u of seedData.users) {
      await client.query(
        `INSERT INTO users (id, email, phone, password_hash, role, name, patient_id, doctor_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email,
           phone = EXCLUDED.phone,
           password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           name = EXCLUDED.name,
           patient_id = EXCLUDED.patient_id,
           doctor_id = EXCLUDED.doctor_id;`,
        [u.id, u.email, u.phone || null, u.passwordHash, u.role, u.name, u.patientId || null, u.doctorId || null, u.createdAt || new Date().toISOString()]
      );
    }

    // 3. Seed Patient Profile
    const pat = seedData.patientProfile;
    if (pat) {
      await client.query(
        `INSERT INTO patient_profiles (id, user_id, name, age, gender, phone, email, blood_group, address, emergency_contact, medical_alerts)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           age = EXCLUDED.age,
           gender = EXCLUDED.gender,
           phone = EXCLUDED.phone,
           email = EXCLUDED.email,
           blood_group = EXCLUDED.blood_group,
           address = EXCLUDED.address,
           emergency_contact = EXCLUDED.emergency_contact,
           medical_alerts = EXCLUDED.medical_alerts;`,
        [
          pat.id,
          pat.userId,
          pat.name,
          pat.age,
          pat.gender,
          pat.phone,
          pat.email,
          pat.bloodGroup,
          pat.address,
          pat.emergencyContact,
          JSON.stringify(pat.medicalAlerts || [])
        ]
      );
    }

    // 4. Seed 70 Doctors across 5 cities
    for (const doc of seedData.doctors) {
      await client.query(
        `INSERT INTO doctors (
           id, name, specialty, qualification, experience_years, rating, review_count,
           consultation_fee, languages, hospital, location, location_id, city, area, distance,
           avatar, bio, average_duration_minutes, working_hours, available_today, badges,
           next_available_slot, keywords, slots
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7,
           $8, $9, $10, $11, $12, $13, $14, $15,
           $16, $17, $18, $19, $20, $21,
           $22, $23, $24
         ) ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           specialty = EXCLUDED.specialty,
           qualification = EXCLUDED.qualification,
           experience_years = EXCLUDED.experience_years,
           rating = EXCLUDED.rating,
           review_count = EXCLUDED.review_count,
           consultation_fee = EXCLUDED.consultation_fee,
           languages = EXCLUDED.languages,
           hospital = EXCLUDED.hospital,
           location = EXCLUDED.location,
           location_id = EXCLUDED.location_id,
           city = EXCLUDED.city,
           area = EXCLUDED.area,
           distance = EXCLUDED.distance,
           avatar = EXCLUDED.avatar,
           bio = EXCLUDED.bio,
           average_duration_minutes = EXCLUDED.average_duration_minutes,
           working_hours = EXCLUDED.working_hours,
           available_today = EXCLUDED.available_today,
           badges = EXCLUDED.badges,
           next_available_slot = EXCLUDED.next_available_slot,
           keywords = EXCLUDED.keywords,
           slots = EXCLUDED.slots;`,
        [
          doc.id,
          doc.name,
          doc.specialty,
          doc.qualification || '',
          doc.experienceYears || 5,
          doc.rating || 4.5,
          doc.reviewCount || 0,
          doc.consultationFee || 500,
          JSON.stringify(doc.languages || ["English"]),
          doc.hospital,
          doc.location || doc.city,
          doc.locationId || null,
          doc.city || doc.location,
          doc.area || null,
          doc.distance || null,
          doc.avatar || null,
          doc.bio || null,
          doc.averageDurationMinutes || 15,
          doc.workingHours || '09:00 AM - 05:00 PM',
          doc.availableToday !== undefined ? doc.availableToday : true,
          JSON.stringify(doc.badges || []),
          doc.nextAvailableSlot || null,
          JSON.stringify(doc.keywords || []),
          JSON.stringify(doc.slots || [])
        ]
      );
    }

    // 5. Seed Appointments
    for (const apt of seedData.appointments) {
      await client.query(
        `INSERT INTO appointments (
           id, token_number, doctor_id, doctor_name, doctor_specialty, doctor_avatar,
           hospital, location, patient_id, patient_name, patient_age, patient_gender,
           date, time, consultation_type, reason, status, queue_state, queue_position,
           ai_pre_consultation, doctor_notes, consultation_summary, created_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9, $10, $11, $12,
           $13, $14, $15, $16, $17, $18, $19,
           $20, $21, $22, $23
         ) ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           queue_state = EXCLUDED.queue_state,
           queue_position = EXCLUDED.queue_position,
           ai_pre_consultation = EXCLUDED.ai_pre_consultation,
           doctor_notes = EXCLUDED.doctor_notes,
           consultation_summary = EXCLUDED.consultation_summary;`,
        [
          apt.id,
          apt.tokenNumber,
          apt.doctorId,
          apt.doctorName,
          apt.doctorSpecialty,
          apt.doctorAvatar,
          apt.hospital || null,
          apt.location || null,
          apt.patientId,
          apt.patientName,
          apt.patientAge || 30,
          apt.patientGender || 'Male',
          apt.date,
          apt.time,
          apt.consultationType || 'In-Clinic',
          apt.reason || 'Consultation',
          apt.status,
          apt.queueState || 'WAITING',
          apt.queuePosition || 1,
          JSON.stringify(apt.aiPreConsultation || {}),
          apt.doctorNotes || '',
          apt.consultationSummary ? JSON.stringify(apt.consultationSummary) : null,
          apt.createdAt || new Date().toISOString()
        ]
      );
    }

    // 6. Seed Consultation Reports
    for (const rep of seedData.consultationReports) {
      await client.query(
        `INSERT INTO consultation_reports (
           id, appointment_id, patient_id, patient_name, patient_age, patient_gender,
           doctor_id, doctor_name, doctor_specialty, hospital, location,
           date, time, chief_complaint, symptoms_reported, patient_provided_info,
           doctor_observations, doctor_notes, clinical_summary, advice, follow_up, status, created_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9, $10, $11,
           $12, $13, $14, $15, $16,
           $17, $18, $19, $20, $21, $22, $23
         ) ON CONFLICT (id) DO UPDATE SET
           clinical_summary = EXCLUDED.clinical_summary,
           advice = EXCLUDED.advice,
           doctor_observations = EXCLUDED.doctor_observations;`,
        [
          rep.id,
          rep.appointmentId || null,
          rep.patientId,
          rep.patientName,
          rep.patientAge || 30,
          rep.patientGender || 'Male',
          rep.doctorId,
          rep.doctorName,
          rep.doctorSpecialty || '',
          rep.hospital || '',
          rep.location || '',
          rep.date,
          rep.time,
          rep.chiefComplaint || '',
          rep.symptomsReported || '',
          rep.patientProvidedInfo || '',
          rep.doctorObservations || '',
          rep.doctorNotes || '',
          rep.clinicalSummary || '',
          rep.advice || '',
          JSON.stringify(rep.followUp || {}),
          rep.status || 'Completed',
          rep.createdAt || new Date().toISOString()
        ]
      );
    }

    // 7. Seed Notifications
    for (const notif of seedData.notifications) {
      await client.query(
        `INSERT INTO notifications (id, user_id, patient_id, title, message, time, read, type, related_id, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING;`,
        [
          notif.id,
          notif.userId,
          notif.patientId,
          notif.title,
          notif.message,
          notif.time || 'Just now',
          notif.read || false,
          notif.type || 'System',
          notif.relatedId || null,
          new Date().toISOString()
        ]
      );
    }

    // 8. Seed Family Members
    for (const fam of seedData.familyMembers) {
      await client.query(
        `INSERT INTO family_members (id, patient_id, name, relation, age, gender, blood_group, medical_conditions, allergies)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING;`,
        [
          fam.id,
          fam.patientId || 'pat-1',
          fam.name,
          fam.relation,
          fam.age || 30,
          fam.gender || 'Male',
          fam.bloodGroup || 'O+',
          JSON.stringify(fam.medicalConditions || []),
          JSON.stringify(fam.allergies || [])
        ]
      );
    }

    // 9. Seed Medical Documents
    for (const doc of seedData.medicalDocuments) {
      await client.query(
        `INSERT INTO medical_documents (id, patient_id, title, category, date, doctor, hospital, file_size, status, is_shared_with_doctor, type, report_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING;`,
        [
          doc.id,
          doc.patientId || 'pat-1',
          doc.title,
          doc.category || 'Diagnostic Report',
          doc.date,
          doc.doctor,
          doc.hospital,
          doc.fileSize || '1.2 MB',
          doc.status || 'Verified',
          doc.isSharedWithDoctor !== undefined ? doc.isSharedWithDoctor : true,
          doc.type || 'pdf',
          doc.reportId || null
        ]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[PostgreSQL] ❌ Seed transaction error:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  initDatabase,
  seedDatabase
};
