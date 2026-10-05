const express = require('express');
const cors = require('cors');
const path = require('path');
const seedData = require('./data/seedData');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory State initialized with deep clone of seedData
let doctors = JSON.parse(JSON.stringify(seedData.doctors));
let appointments = JSON.parse(JSON.stringify(seedData.appointments));
let patientProfile = JSON.parse(JSON.stringify(seedData.patientProfile));
let familyMembers = JSON.parse(JSON.stringify(seedData.familyMembers));
let medicalDocuments = JSON.parse(JSON.stringify(seedData.medicalDocuments));
let notifications = JSON.parse(JSON.stringify(seedData.notifications));

// Real-time SSE Clients
let sseClients = [];

function broadcastEvent(type, data) {
  const payload = `data: ${JSON.stringify({ type, data, timestamp: new Date().toISOString() })}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(payload);
    } catch (err) {
      console.error('Error writing to SSE client:', err);
    }
  });
}

// SSE Subscription Endpoint
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no'
  });

  const clientId = Date.now() + Math.random().toString(36).substr(2, 9);
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// Helper: Calculate Queue for a Doctor
function getDoctorQueueStats(doctorId) {
  const doctor = doctors.find(d => d.id === doctorId);
  const avgDuration = doctor ? doctor.averageDurationMinutes : 15;
  const docApts = appointments.filter(a => a.doctorId === doctorId && a.date === "2026-10-05");

  const nowConsulting = docApts.find(a => a.status === 'now_consulting') || null;
  const waitingList = docApts
    .filter(a => a.status === 'waiting')
    .sort((a, b) => a.queuePosition - b.queuePosition);
  
  const completedToday = docApts.filter(a => a.status === 'completed').length;
  const totalToday = docApts.length;

  return {
    doctorId,
    doctorName: doctor ? doctor.name : '',
    specialty: doctor ? doctor.specialty : '',
    avgDuration,
    doctorStatus: nowConsulting ? '🟢 Currently consulting' : '🟢 Doctor is available',
    nowConsulting,
    waitingList,
    waitingCount: waitingList.length,
    completedToday,
    totalToday,
    totalEstimatedWaitMinutes: (waitingList.length + (nowConsulting ? 1 : 0)) * avgDuration
  };
}

// 1. DOCTORS API
app.get('/api/doctors', (req, res) => {
  const { specialty, search } = req.query;
  let list = doctors.map(doc => {
    const queue = getDoctorQueueStats(doc.id);
    const totalInQueue = queue.waitingCount + (queue.nowConsulting ? 1 : 0);
    return {
      ...doc,
      currentQueueCount: totalInQueue,
      waitingCount: queue.waitingCount,
      estimatedWaitTime: totalInQueue * doc.averageDurationMinutes,
      nowConsultingPatient: queue.nowConsulting ? queue.nowConsulting.patientName : null
    };
  });

  if (specialty && specialty !== 'All') {
    list = list.filter(d => d.specialty.toLowerCase() === specialty.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.specialty.toLowerCase().includes(q) ||
      d.hospital.toLowerCase().includes(q) ||
      (d.keywords && d.keywords.some(k => k.toLowerCase().includes(q)))
    );
  }

  res.json({ success: true, count: list.length, data: list });
});

app.get('/api/doctors/:id', (req, res) => {
  const doc = doctors.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Doctor not found' });
  const queue = getDoctorQueueStats(doc.id);
  res.json({
    success: true,
    data: {
      ...doc,
      queue
    }
  });
});

// 2. APPOINTMENTS API
app.get('/api/appointments', (req, res) => {
  const { patientId, doctorId, status } = req.query;
  let list = [...appointments];

  if (patientId) {
    list = list.filter(a => a.patientId === patientId);
  }
  if (doctorId) {
    list = list.filter(a => a.doctorId === doctorId);
  }
  if (status) {
    list = list.filter(a => a.status === status);
  }

  list.sort((a, b) => {
    if (a.status === 'now_consulting') return -1;
    if (b.status === 'now_consulting') return 1;
    if (a.status === 'waiting' && b.status === 'waiting') return a.queuePosition - b.queuePosition;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  res.json({ success: true, count: list.length, data: list });
});

app.get('/api/appointments/:id', (req, res) => {
  const apt = appointments.find(a => a.id === req.params.id);
  if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found' });
  
  const queueStats = getDoctorQueueStats(apt.doctorId);
  let patientsAhead = 0;
  let estimatedWaitMinutes = 0;

  if (apt.status === 'waiting') {
    patientsAhead = queueStats.waitingList.filter(w => w.queuePosition < apt.queuePosition).length + (queueStats.nowConsulting ? 1 : 0);
    estimatedWaitMinutes = patientsAhead * queueStats.avgDuration;
  }

  res.json({
    success: true,
    data: {
      ...apt,
      liveQueue: {
        nowConsulting: queueStats.nowConsulting,
        patientsAhead,
        estimatedWaitMinutes,
        queuePosition: apt.queuePosition,
        doctorStatus: queueStats.nowConsulting ? '🟢 Currently consulting' : '🟢 Doctor is available'
      }
    }
  });
});

app.post('/api/appointments', (req, res) => {
  const { doctorId, patientId, patientName, date, time, consultationType, reason, familyMemberId } = req.body;
  const doctor = doctors.find(d => d.id === doctorId);
  if (!doctor) return res.status(400).json({ success: false, message: 'Invalid doctor' });

  const todaysDocApts = appointments.filter(a => a.doctorId === doctorId && a.date === (date || "2026-10-05"));
  const maxTokenNum = todaysDocApts.length + 1;
  const tokenNumber = `Q-${maxTokenNum < 10 ? '0' + maxTokenNum : maxTokenNum}`;

  const waitingList = todaysDocApts.filter(a => a.status === 'waiting');
  const hasNowConsulting = todaysDocApts.some(a => a.status === 'now_consulting');
  const queuePosition = waitingList.length + (hasNowConsulting ? 2 : 1);
  const patientsAhead = waitingList.length + (hasNowConsulting ? 1 : 0);
  const estimatedWaitMinutes = patientsAhead * doctor.averageDurationMinutes;

  const newAppointment = {
    id: `apt-${Date.now()}`,
    tokenNumber,
    doctorId,
    doctorName: doctor.name,
    doctorSpecialty: doctor.specialty,
    doctorAvatar: doctor.avatar,
    patientId: patientId || "pat-1",
    patientName: patientName || "Meera",
    patientAge: 28,
    patientGender: "Female",
    date: date || "2026-10-05",
    time: time || "04:00 PM",
    consultationType: consultationType || "In-Clinic",
    reason: reason || "Cardiology consultation & routine checkup",
    status: "waiting",
    queuePosition,
    aiPreConsultation: {
      completed: false,
      chiefComplaint: "",
      duration: "",
      severity: "",
      associatedSymptoms: "",
      priorHistory: "",
      summaryText: ""
    },
    doctorNotes: "",
    consultationSummary: null,
    createdAt: new Date().toISOString()
  };

  appointments.push(newAppointment);

  // Add Notification
  const newNotif = {
    id: `notif-${Date.now()}`,
    title: "✓ Appointment Confirmed",
    message: `Your appointment with ${doctor.name} is confirmed for ${time || '04:00 PM'}. Queue Token: ${tokenNumber}.`,
    time: "Just now",
    read: false,
    type: "success"
  };
  notifications.unshift(newNotif);

  // Broadcast update
  broadcastEvent('queue_updated', {
    doctorId,
    queue: getDoctorQueueStats(doctorId),
    appointmentId: newAppointment.id,
    action: 'book'
  });

  res.status(201).json({
    success: true,
    data: newAppointment,
    patientsAhead,
    estimatedWaitMinutes,
    tokenNumber
  });
});

// 3. QUEUE MANAGEMENT API
app.get('/api/queue/:doctorId', (req, res) => {
  const stats = getDoctorQueueStats(req.params.doctorId);
  res.json({ success: true, data: stats });
});

// Doctor completes current consultation & moves the next patient into consultation
app.post('/api/queue/:doctorId/complete', (req, res) => {
  const doctorId = req.params.doctorId;
  const { appointmentId, doctorNotes, consultationSummary } = req.body;

  const docApts = appointments.filter(a => a.doctorId === doctorId && a.date === "2026-10-05");

  // 1. Find and complete current consultation
  let targetApt = null;
  if (appointmentId) {
    targetApt = appointments.find(a => a.id === appointmentId);
  } else {
    targetApt = docApts.find(a => a.status === 'now_consulting');
  }

  if (targetApt) {
    targetApt.status = 'completed';
    targetApt.queuePosition = 0;
    if (doctorNotes) targetApt.doctorNotes = doctorNotes;
    if (consultationSummary) targetApt.consultationSummary = consultationSummary;
  }

  // 2. Find waiting queue and promote first waiting patient to now_consulting
  const waitingList = docApts
    .filter(a => a.status === 'waiting' && (!targetApt || a.id !== targetApt.id))
    .sort((a, b) => a.queuePosition - b.queuePosition);

  let newConsultingPatient = null;
  if (waitingList.length > 0) {
    newConsultingPatient = waitingList[0];
    newConsultingPatient.status = 'now_consulting';
    newConsultingPatient.queuePosition = 1;

    // Shift remaining waiting patients forward
    waitingList.slice(1).forEach((apt, idx) => {
      apt.queuePosition = idx + 2; // Next is #2, then #3, #4...
    });

    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: "🟢 Now Consulting",
      message: `${newConsultingPatient.patientName} (${newConsultingPatient.tokenNumber}) is now consulting with Dr. ${newConsultingPatient.doctorName}.`,
      time: "Just now",
      read: false,
      type: "info"
    });
  }

  const updatedQueue = getDoctorQueueStats(doctorId);

  // Broadcast real-time SSE event to all connected patient & doctor screens
  broadcastEvent('queue_updated', {
    doctorId,
    queue: updatedQueue,
    action: 'complete',
    completedAppointment: targetApt,
    currentPatient: newConsultingPatient
  });

  res.json({
    success: true,
    message: newConsultingPatient 
      ? `Consultation completed. ${newConsultingPatient.patientName} is now consulting.`
      : 'Consultation completed. Queue is now clear.',
    data: updatedQueue,
    appointment: targetApt,
    currentPatient: newConsultingPatient
  });
});

// Doctor calls next patient in queue
app.post('/api/queue/:doctorId/call-next', (req, res) => {
  // Delegate directly to complete & advance
  const doctorId = req.params.doctorId;
  const docApts = appointments.filter(a => a.doctorId === doctorId && a.date === "2026-10-05");
  const currentlyConsulting = docApts.find(a => a.status === 'now_consulting');

  return app._router.handle({
    url: `/api/queue/${doctorId}/complete`,
    method: 'POST',
    body: { appointmentId: currentlyConsulting ? currentlyConsulting.id : null }
  }, res);
});

// 4. AI SERVICES API
app.post('/api/ai/pre-consultation', (req, res) => {
  const { 
    appointmentId, 
    chiefComplaint, 
    duration, 
    location, 
    severity, 
    associatedSymptoms, 
    priorHistory,
    patientDescription 
  } = req.body;

  const apt = appointments.find(a => a.id === appointmentId);
  
  const formattedSeverity = severity 
    ? (typeof severity === 'string' && severity.includes('/10') ? severity : `${severity}/10`) 
    : "6/10";

  const intakeData = {
    completed: true,
    chiefComplaint: chiefComplaint || "Headache",
    duration: duration || "2 days",
    location: location || "Frontal & temple areas",
    severity: formattedSeverity,
    associatedSymptoms: associatedSymptoms || "Fatigue",
    priorHistory: priorHistory || "No prior consultation",
    patientDescription: patientDescription || chiefComplaint || "Patient reported symptoms during pre-consultation intake",
    status: "Submitted",
    summaryText: `Chief complaint: ${chiefComplaint || 'Headache'} | Duration: ${duration || '2 days'} | Location: ${location || 'Head'} | Severity: ${formattedSeverity} | Other symptoms: ${associatedSymptoms || 'None'} | Previous consultation: ${priorHistory || 'None'}`,
    disclaimer: "This summary is based on information provided by the patient and is not a medical diagnosis.",
    completedAt: new Date().toISOString()
  };

  if (apt) {
    apt.aiPreConsultation = intakeData;
    broadcastEvent('appointment_updated', { appointment: apt });
    broadcastEvent('queue_updated', {
      doctorId: apt.doctorId,
      queue: getDoctorQueueStats(apt.doctorId),
      action: 'pre_consultation_updated'
    });
  }

  res.json({
    success: true,
    data: intakeData
  });
});

app.post('/api/ai/generate-summary', (req, res) => {
  const { appointmentId, doctorNotes, patientName, doctorSpecialty } = req.body;
  const apt = appointments.find(a => a.id === appointmentId);

  const notesText = doctorNotes || (apt ? apt.doctorNotes : "Patient examined. Vital signs stable. Prescribed resting and hydration.");
  const intake = apt ? apt.aiPreConsultation : null;

  const summary = {
    chiefComplaint: intake && intake.chiefComplaint ? intake.chiefComplaint : "Primary consultation evaluation",
    symptomsDiscussed: intake && intake.associatedSymptoms ? `${intake.chiefComplaint}, ${intake.associatedSymptoms} (Duration: ${intake.duration || 'recent'})` : "Clinical symptoms reviewed with specialist",
    doctorNotes: notesText,
    clinicalObservations: "Vitals within normal baseline. Cardiovascular and systemic evaluation satisfactory.",
    followUpRecommendation: "Adequate hydration, proper rest, and lifestyle modification as discussed.",
    nextAppointment: "Recommended follow-up in 7-10 days if symptoms persist.",
    disclaimer: "AI-Assisted Clinical Summary: Formatted automatically from doctor consultation records. Verified and authorized by consulting physician.",
    generatedAt: new Date().toISOString()
  };

  if (apt) {
    apt.consultationSummary = summary;
    broadcastEvent('appointment_updated', { appointment: apt });
  }

  res.json({
    success: true,
    data: summary
  });
});

// 5. PATIENT, FAMILY, DOCUMENTS & NOTIFICATIONS API
app.get('/api/patient/profile', (req, res) => {
  res.json({ success: true, data: patientProfile });
});

app.put('/api/patient/profile', (req, res) => {
  patientProfile = { ...patientProfile, ...req.body };
  res.json({ success: true, data: patientProfile });
});

app.get('/api/family', (req, res) => {
  res.json({ success: true, data: familyMembers });
});

app.post('/api/family', (req, res) => {
  const newMember = {
    id: `fam-${Date.now()}`,
    ...req.body
  };
  familyMembers.push(newMember);
  res.status(201).json({ success: true, data: newMember });
});

app.get('/api/documents', (req, res) => {
  res.json({ success: true, data: medicalDocuments });
});

app.post('/api/documents', (req, res) => {
  const newDoc = {
    id: `doc-vault-${Date.now()}`,
    title: req.body.title || "Diagnostic Report",
    category: req.body.category || "Diagnostic Report",
    date: new Date().toISOString().split('T')[0],
    doctor: req.body.doctor || "Consulting Specialist",
    hospital: req.body.hospital || "Hospital Labs",
    fileSize: "1.2 MB",
    status: req.body.status || "Verified",
    isSharedWithDoctor: true,
    type: "pdf"
  };
  medicalDocuments.unshift(newDoc);
  res.status(201).json({ success: true, data: newDoc });
});

app.patch('/api/documents/:id/toggle-share', (req, res) => {
  const doc = medicalDocuments.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
  doc.isSharedWithDoctor = !doc.isSharedWithDoctor;
  res.json({ success: true, data: doc });
});

app.get('/api/notifications', (req, res) => {
  res.json({ success: true, data: notifications });
});

app.patch('/api/notifications/mark-read', (req, res) => {
  notifications.forEach(n => n.read = true);
  res.json({ success: true, data: notifications });
});

// Demo Reset Endpoint
app.post('/api/demo/reset', (req, res) => {
  doctors = JSON.parse(JSON.stringify(seedData.doctors));
  appointments = JSON.parse(JSON.stringify(seedData.appointments));
  patientProfile = JSON.parse(JSON.stringify(seedData.patientProfile));
  familyMembers = JSON.parse(JSON.stringify(seedData.familyMembers));
  medicalDocuments = JSON.parse(JSON.stringify(seedData.medicalDocuments));
  notifications = JSON.parse(JSON.stringify(seedData.notifications));

  broadcastEvent('demo_reset', { message: 'Demo data restored' });

  res.json({ success: true, message: 'Demo data reset successfully!' });
});

// Production Static Frontend & SPA Fallback
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    // Preserve /api routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[DOCBEE MediFlow Server] Running on http://localhost:${PORT} (NODE_ENV: ${process.env.NODE_ENV || 'development'})`);
});
