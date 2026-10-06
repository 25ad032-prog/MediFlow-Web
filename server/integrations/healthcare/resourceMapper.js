// DOCBEE MediFlow - FHIR Resource Mapper & Adapter
// Converts between FHIR R4 standard structures and MediFlow healthcare domain models.

const {
  FhirPatient,
  FhirPractitioner,
  FhirAppointment,
  FhirEncounter,
  FhirObservation,
  FhirDiagnosticReport,
  FhirDocumentReference
} = require('./fhirModels');

// ==========================================
// 1. PRACTITIONER / DOCTOR MAPPERS
// ==========================================

function fhirPractitionerToDoctor(practitioner) {
  if (!practitioner) return null;
  const nameObj = practitioner.name && practitioner.name[0] ? practitioner.name[0] : {};
  const given = Array.isArray(nameObj.given) ? nameObj.given.join(' ') : (nameObj.given || '');
  const family = nameObj.family || '';
  const prefix = Array.isArray(nameObj.prefix) ? nameObj.prefix.join(' ') : (nameObj.prefix || 'Dr.');
  const fullName = `${prefix} ${given} ${family}`.trim();

  const addressObj = practitioner.address && practitioner.address[0] ? practitioner.address[0] : {};
  const locationCity = addressObj.city || 'Chennai';
  const hospital = practitioner.hospitalAffiliation || (addressObj.line ? addressObj.line[0] : 'Apollo Hospitals');

  return {
    id: practitioner.id,
    name: fullName,
    specialty: practitioner.specialty || 'General Medicine',
    hospital: hospital,
    location: locationCity,
    experience: `${practitioner.experienceYears || 10}+ years`,
    rating: practitioner.rating || 4.8,
    reviewsCount: 120,
    fee: practitioner.consultationFee ? `₹${practitioner.consultationFee}` : '₹800',
    feeNumber: practitioner.consultationFee || 800,
    averageDurationMinutes: practitioner.averageDurationMinutes || 15,
    education: practitioner.education || 'MBBS, MD',
    avatar: practitioner.avatar || `https://images.unsplash.com/photo-1594824813515-998858348b6c?auto=format&fit=crop&q=80&w=400`,
    about: practitioner.about || `Experienced specialist in ${practitioner.specialty || 'Internal Medicine'} providing comprehensive diagnostic and clinical care.`,
    qualifications: practitioner.qualification ? practitioner.qualification.map(q => q.code?.coding?.[0]?.display || 'Medical Qualification') : ['MBBS', 'MD']
  };
}

function doctorToFhirPractitioner(doc) {
  if (!doc) return null;
  const nameParts = doc.name ? doc.name.replace(/^Dr\.\s*/, '').split(' ') : ['Priya', 'Sharma'];
  const given = nameParts[0] || 'Priya';
  const family = nameParts.slice(1).join(' ') || 'Sharma';

  return new FhirPractitioner({
    id: doc.id,
    identifier: [{ system: "urn:oid:mediflow:practitioner", value: doc.id }],
    name: [{ prefix: ["Dr."], given: [given], family }],
    telecom: [{ system: "email", value: `${given.toLowerCase()}.${family.toLowerCase()}@mediflow.demo` }],
    qualification: [{ code: { coding: [{ display: doc.education || 'MBBS, MD' }] } }],
    specialty: doc.specialty || 'General Medicine',
    hospitalAffiliation: doc.hospital || 'Apollo Hospitals',
    rating: doc.rating || 4.8,
    consultationFee: doc.feeNumber || (typeof doc.fee === 'string' ? parseInt(doc.fee.replace(/[^\d]/g, ''), 10) : 800) || 800,
    averageDurationMinutes: doc.averageDurationMinutes || 15,
    experienceYears: parseInt(doc.experience, 10) || 10,
    education: doc.education || 'MBBS, MD',
    address: [{ city: doc.location || 'Chennai', state: 'Tamil Nadu', country: 'India' }]
  });
}

// ==========================================
// 2. PATIENT MAPPERS
// ==========================================

function fhirPatientToPatient(patient) {
  if (!patient) return null;
  const nameObj = patient.name && patient.name[0] ? patient.name[0] : {};
  const given = Array.isArray(nameObj.given) ? nameObj.given.join(' ') : (nameObj.given || '');
  const family = nameObj.family || '';
  const fullName = `${given} ${family}`.trim() || 'Rahul Sharma';

  const emailTelecom = patient.telecom ? patient.telecom.find(t => t.system === 'email') : null;
  const phoneTelecom = patient.telecom ? patient.telecom.find(t => t.system === 'phone') : null;

  // Calculate age from birthDate if present
  let age = 31;
  if (patient.birthDate) {
    const birthYear = new Date(patient.birthDate).getFullYear();
    age = new Date().getFullYear() - birthYear;
  }

  const addressObj = patient.address && patient.address[0] ? patient.address[0] : {};

  return {
    id: patient.id,
    name: fullName,
    email: emailTelecom ? emailTelecom.value : 'patient@mediflow.demo',
    phone: phoneTelecom ? phoneTelecom.value : '+91 98765 00001',
    gender: patient.gender === 'male' ? 'Male' : (patient.gender === 'female' ? 'Female' : 'Other'),
    age: age,
    bloodGroup: patient.bloodGroup || 'O+ve',
    emergencyContact: patient.emergencyContact || 'Ananya Sharma (+91 98765 43210)',
    address: addressObj.line ? addressObj.line.join(', ') : '12 Anna Salai, Chennai',
    city: addressObj.city || 'Chennai',
    allergies: patient.allergies || ['Penicillin (Mild rash)'],
    chronicConditions: patient.chronicConditions || ['Mild Essential Hypertension']
  };
}

function patientToFhirPatient(pat) {
  if (!pat) return null;
  const names = pat.name ? pat.name.split(' ') : ['Rahul', 'Sharma'];
  const given = names[0] || 'Rahul';
  const family = names.slice(1).join(' ') || 'Sharma';

  const birthYear = new Date().getFullYear() - (parseInt(pat.age, 10) || 31);
  const birthDate = `${birthYear}-01-15`;

  return new FhirPatient({
    id: pat.id || 'pat-1',
    identifier: [{ system: "urn:oid:mediflow:patient", value: pat.id || 'pat-1' }],
    name: [{ use: "official", given: [given], family }],
    telecom: [
      { system: "phone", value: pat.phone || "+91 98765 00001" },
      { system: "email", value: pat.email || "patient@mediflow.demo" }
    ],
    gender: (pat.gender || 'Male').toLowerCase(),
    birthDate,
    address: [{ line: [pat.address || "12 Anna Salai"], city: pat.city || "Chennai", state: "Tamil Nadu", country: "India" }]
  });
}

// ==========================================
// 3. APPOINTMENT MAPPERS
// ==========================================

function fhirAppointmentToAppointment(fhirApt, doctorLookup = {}) {
  if (!fhirApt) return null;

  const patPart = fhirApt.participant ? fhirApt.participant.find(p => p.actor?.reference?.startsWith('Patient/')) : null;
  const docPart = fhirApt.participant ? fhirApt.participant.find(p => p.actor?.reference?.startsWith('Practitioner/')) : null;

  const doctorId = docPart ? docPart.actor.reference.replace('Practitioner/', '') : 'doc-1';
  const patientId = patPart ? patPart.actor.reference.replace('Patient/', '') : 'pat-1';
  const doctor = doctorLookup[doctorId] || null;

  let timeString = "10:00 AM";
  let dateString = "2026-10-05";
  if (fhirApt.start) {
    const d = new Date(fhirApt.start);
    dateString = d.toISOString().split('T')[0];
    timeString = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  return {
    id: fhirApt.id,
    patientId,
    patientName: patPart?.actor?.display || 'Rahul Sharma',
    doctorId,
    doctorName: docPart?.actor?.display || (doctor ? doctor.name : 'Dr. Priya Sharma'),
    specialty: doctor ? doctor.specialty : 'Cardiology',
    hospital: doctor ? doctor.hospital : 'Apollo Hospitals, Greams Road',
    location: doctor ? doctor.location : 'Chennai',
    date: dateString,
    time: timeString,
    tokenNumber: fhirApt.tokenNumber || 'Q-01',
    status: fhirApt.status === 'in-progress' ? 'now_consulting' : (fhirApt.status === 'fulfilled' ? 'completed' : 'booked'),
    queueState: fhirApt.queueState || 'WAITING',
    reason: fhirApt.reason || fhirApt.description || 'Clinical Consultation',
    consultationType: fhirApt.consultationType || 'In-Clinic',
    aiPreConsultation: fhirApt.aiPreConsultation || null,
    doctorNotes: fhirApt.doctorNotes || '',
    consultationSummary: fhirApt.consultationSummary || null
  };
}

function appointmentToFhirAppointment(apt) {
  if (!apt) return null;

  let startIso = new Date().toISOString();
  if (apt.date) {
    const timeMatch = apt.time ? apt.time.match(/(\d+):(\d+)\s*(AM|PM)?/i) : null;
    let hours = 10, minutes = 0;
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      if (timeMatch[3]?.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (timeMatch[3]?.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
    const d = new Date(`${apt.date}T00:00:00Z`);
    d.setUTCHours(hours, minutes, 0, 0);
    startIso = d.toISOString();
  }

  const fhirStatus = apt.status === 'completed' ? 'fulfilled' : (apt.status === 'now_consulting' ? 'in-progress' : 'booked');

  return new FhirAppointment({
    id: apt.id || `apt-${Date.now()}`,
    identifier: [{ system: "urn:oid:mediflow:appointment", value: apt.id }],
    status: fhirStatus,
    serviceType: apt.specialty || 'General Medicine',
    description: apt.reason || 'Medical Consultation',
    start: startIso,
    end: new Date(new Date(startIso).getTime() + 15 * 60000).toISOString(),
    participant: [
      { actor: { reference: `Patient/${apt.patientId || 'pat-1'}`, display: apt.patientName || 'Rahul Sharma' }, status: "accepted" },
      { actor: { reference: `Practitioner/${apt.doctorId || 'doc-1'}`, display: apt.doctorName || 'Dr. Priya Sharma' }, status: "accepted" }
    ],
    tokenNumber: apt.tokenNumber || 'Q-01',
    queueState: apt.queueState || 'WAITING',
    reason: apt.reason || 'Clinical Consultation',
    consultationType: apt.consultationType || 'In-Clinic',
    aiPreConsultation: apt.aiPreConsultation || null
  });
}

// ==========================================
// 4. OBSERVATIONS & VITALS MAPPERS
// ==========================================

function fhirObservationToVital(obs) {
  if (!obs) return null;
  const coding = obs.code?.coding?.[0] || {};
  return {
    id: obs.id,
    type: coding.display || 'Vital Sign',
    code: coding.code,
    value: obs.valueQuantity ? `${obs.valueQuantity.value} ${obs.valueQuantity.unit}` : (obs.valueString || 'Normal'),
    date: obs.effectiveDateTime ? obs.effectiveDateTime.split('T')[0] : '2026-10-05',
    interpretation: obs.interpretation?.[0]?.coding?.[0]?.display || 'Normal'
  };
}

// ==========================================
// 5. DIAGNOSTIC REPORT / CONSULTATION REPORT MAPPERS
// ==========================================

function fhirDiagnosticReportToReport(diagReport, doctorLookup = {}) {
  if (!diagReport) return null;
  const docRef = diagReport.performer?.[0]?.reference || 'Practitioner/doc-1';
  const doctorId = docRef.replace('Practitioner/', '');
  const doctor = doctorLookup[doctorId] || null;

  return {
    id: diagReport.id,
    reportNumber: diagReport.identifier?.[0]?.value || `REP-${diagReport.id}`,
    appointmentId: diagReport.encounter ? diagReport.encounter.reference.replace('Encounter/', '') : 'apt-1',
    patientId: diagReport.subject ? diagReport.subject.reference.replace('Patient/', '') : 'pat-1',
    patientName: 'Rahul Sharma',
    doctorId,
    doctorName: doctor ? doctor.name : 'Dr. Priya Sharma',
    doctorSpecialty: doctor ? doctor.specialty : 'Cardiology',
    hospitalName: doctor ? doctor.hospital : 'Apollo Hospitals',
    consultationDate: diagReport.effectiveDateTime ? diagReport.effectiveDateTime.split('T')[0] : '2026-10-05',
    consultationTime: '10:30 AM',
    chiefComplaint: diagReport.code?.coding?.[0]?.display || 'Clinical Consultation',
    observations: diagReport.conclusion || 'Vital signs within normal limits.',
    doctorNotes: diagReport.doctorNotes || diagReport.conclusion || 'Assessment completed.',
    clinicalSummary: diagReport.clinicalSummary || diagReport.conclusion || 'Satisfactory clinical evaluation.',
    advice: diagReport.advice || 'Routine follow-up and balanced lifestyle.',
    prescriptions: [
      { medicine: "Tab. Supportive 500mg", dosage: "1-0-1", duration: "5 days", instructions: "After meals" }
    ],
    followUpDate: diagReport.followUpDate || '2026-10-12',
    pdfUrl: diagReport.pdfUrl || `/api/reports/${diagReport.id}/pdf`
  };
}

// ==========================================
// 6. DOCUMENT REFERENCE MAPPERS
// ==========================================

function fhirDocumentReferenceToDocument(docRef) {
  if (!docRef) return null;
  const attachment = docRef.content?.[0]?.attachment || {};
  return {
    id: docRef.id,
    title: attachment.title || docRef.type?.coding?.[0]?.display || 'Medical Document',
    category: docRef.category?.[0]?.coding?.[0]?.display || 'Health Records',
    doctor: 'Dr. Priya Sharma (Cardiology)',
    date: docRef.date ? docRef.date.split('T')[0] : '2026-10-05',
    size: attachment.size || '1.2 MB',
    type: attachment.contentType === 'application/pdf' ? 'PDF' : 'DOC',
    fileUrl: attachment.url || '#'
  };
}

module.exports = {
  fhirPractitionerToDoctor,
  doctorToFhirPractitioner,
  fhirPatientToPatient,
  patientToFhirPatient,
  fhirAppointmentToAppointment,
  appointmentToFhirAppointment,
  fhirObservationToVital,
  fhirDiagnosticReportToReport,
  fhirDocumentReferenceToDocument
};
