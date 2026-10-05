const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');
const seedData = require('./data/seedData');

const app = express();
const PORT = process.env.PORT || 5000;
const AUTH_SECRET = process.env.AUTH_SECRET || 'mediflow_jwt_secure_key_2026_change_in_production';

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// In-Memory State initialized with deep clone of seedData
let users = JSON.parse(JSON.stringify(seedData.users));
let locations = JSON.parse(JSON.stringify(seedData.locations));
let doctors = JSON.parse(JSON.stringify(seedData.doctors));
let appointments = JSON.parse(JSON.stringify(seedData.appointments));
let patientProfile = JSON.parse(JSON.stringify(seedData.patientProfile));
let familyMembers = JSON.parse(JSON.stringify(seedData.familyMembers));
let consultationReports = JSON.parse(JSON.stringify(seedData.consultationReports));
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

// ==========================================
// AUTHENTICATION HELPERS & MIDDLEWARE
// ==========================================

function generateToken(payload) {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: '7d' });
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

function clearAuthCookie(res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  let token = req.cookies ? req.cookies.token : null;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, AUTH_SECRET, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = decoded;
    }
    next();
  });
}

app.use(authenticateToken);

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ success: false, message: `Access denied. ${role.toUpperCase()} role required.` });
    }
    next();
  };
}

// Queue Calculation Helper
function getDoctorQueueStats(doctorId) {
  const doctor = doctors.find(d => d.id === doctorId);
  const avgDuration = doctor ? doctor.averageDurationMinutes : 15;
  const docApts = appointments.filter(a => a.doctorId === doctorId && a.date === "2026-10-05");

  const nowConsulting = docApts.find(a => a.status === 'now_consulting' || a.queueState === 'IN_CONSULTATION') || null;
  const calledPatient = docApts.find(a => a.queueState === 'CALLED') || null;
  const waitingList = docApts
    .filter(a => a.status === 'waiting' && a.queueState !== 'IN_CONSULTATION' && a.queueState !== 'COMPLETED')
    .sort((a, b) => a.queuePosition - b.queuePosition);

  // Update dynamic queueState for waiting patients
  waitingList.forEach((apt, idx) => {
    if (apt.queueState !== 'CALLED') {
      apt.queueState = (idx === 0) ? 'NEAR_TURN' : 'WAITING';
    }
  });

  const completedToday = docApts.filter(a => a.status === 'completed' || a.queueState === 'COMPLETED').length;
  const totalToday = docApts.length;

  let doctorStatus = '🟢 Doctor is available';
  if (nowConsulting) {
    doctorStatus = '🟢 Currently consulting';
  } else if (calledPatient) {
    doctorStatus = '🟡 Patient called into chamber';
  }

  return {
    doctorId,
    doctorName: doctor ? doctor.name : '',
    specialty: doctor ? doctor.specialty : '',
    hospital: doctor ? doctor.hospital : '',
    location: doctor ? doctor.location : '',
    avgDuration,
    doctorStatus,
    nowConsulting,
    calledPatient,
    waitingList,
    waitingCount: waitingList.length,
    completedToday,
    totalToday,
    totalEstimatedWaitMinutes: (waitingList.length + (nowConsulting ? 1 : 0)) * avgDuration
  };
}

// Trigger Notifications
function createNotification({ userId, patientId, title, message, type = 'System', relatedId = null }) {
  const notif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId: userId || 'usr-patient-1',
    patientId: patientId || 'pat-1',
    title,
    message,
    time: 'Just now',
    read: false,
    type,
    relatedId
  };
  notifications.unshift(notif);
  broadcastEvent('notification_received', { notification: notif });
  return notif;
}

// ==========================================
// 1. AUTHENTICATION API
// ==========================================

app.post('/api/auth/register', (req, res) => {
  const { email, phone, password, name, role = 'patient', age, gender, bloodGroup } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const patientId = `pat-${Date.now()}`;
  const userId = `usr-${Date.now()}`;

  const newUser = {
    id: userId,
    email: cleanEmail,
    phone: phone ? phone.trim() : "+91 98765 00000",
    passwordHash,
    role: role === 'doctor' ? 'doctor' : 'patient',
    name: name.trim(),
    patientId: role === 'patient' ? patientId : null,
    doctorId: role === 'doctor' ? 'doc-1' : null,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  // If patient, create profile
  if (newUser.role === 'patient') {
    patientProfile = {
      id: patientId,
      userId: newUser.id,
      name: newUser.name,
      age: parseInt(age) || 28,
      gender: gender || "Female",
      phone: newUser.phone,
      email: newUser.email,
      bloodGroup: bloodGroup || "O+",
      address: "Bangalore, India",
      emergencyContact: "Family Contact - +91 98123 45678",
      medicalAlerts: ["None reported"]
    };
  }

  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    name: newUser.name,
    patientId: newUser.patientId,
    doctorId: newUser.doctorId
  });

  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: 'Account created successfully!',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      patientId: newUser.patientId,
      doctorId: newUser.doctorId
    },
    patient: newUser.role === 'patient' ? patientProfile : null
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, requestedRole } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const rawClean = email.trim().replace(/\s+/g, '');

  const user = users.find(u => 
    u.email.toLowerCase() === cleanEmail || 
    (u.phone && u.phone.replace(/\s+/g, '') === rawClean)
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  // Check role compatibility if specified
  if (requestedRole && user.role !== requestedRole) {
    return res.status(403).json({ 
      success: false, 
      message: `Account is registered as ${user.role.toUpperCase()}. Please use the ${user.role} sign-in tab.` 
    });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    patientId: user.patientId,
    doctorId: user.doctorId
  });

  setAuthCookie(res, token);

  const currentDoctorData = user.role === 'doctor' ? doctors.find(d => d.id === (user.doctorId || 'doc-1')) : null;

  res.status(200).json({
    success: true,
    message: 'Signed in successfully!',
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      patientId: user.patientId,
      doctorId: user.doctorId
    },
    patient: user.role === 'patient' ? patientProfile : null,
    doctor: currentDoctorData
  });
});

app.post('/api/auth/logout', (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const currentDoctorData = user.role === 'doctor' ? doctors.find(d => d.id === (user.doctorId || 'doc-1')) : null;

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      patientId: user.patientId,
      doctorId: user.doctorId
    },
    patient: user.role === 'patient' ? patientProfile : null,
    doctor: currentDoctorData
  });
});

// ==========================================
// 2. LOCATIONS & DOCTORS API
// ==========================================

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

app.get('/api/locations', (req, res) => {
  res.json({ success: true, count: locations.length, data: locations });
});

app.get('/api/doctors', (req, res) => {
  const { specialty, location, search, minRating, maxFee } = req.query;

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

// ==========================================
// 3. APPOINTMENTS API
// ==========================================

app.get('/api/appointments', requireAuth, (req, res) => {
  const { doctorId, status } = req.query;
  let list = [...appointments];

  // Role-based scoping: Patient only sees own appointments; Doctor only sees appointments for their doctor ID
  if (req.user.role === 'patient') {
    const patId = req.user.patientId || 'pat-1';
    list = list.filter(a => a.patientId === patId || a.patientId === 'pat-1' || a.patientId === 'pat-2');
  } else if (req.user.role === 'doctor') {
    const docId = req.user.doctorId || doctorId || 'doc-1';
    list = list.filter(a => a.doctorId === docId);
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

app.get('/api/appointments/:id', requireAuth, (req, res) => {
  const apt = appointments.find(a => a.id === req.params.id);
  if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found' });

  // Ownership verification
  if (req.user.role === 'patient' && apt.patientId !== req.user.patientId && apt.patientId !== 'pat-1') {
    return res.status(403).json({ success: false, message: 'Unauthorized to view this appointment.' });
  }
  if (req.user.role === 'doctor' && req.user.doctorId && apt.doctorId !== req.user.doctorId) {
    return res.status(403).json({ success: false, message: 'Unauthorized. Doctor mismatch.' });
  }

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
        calledPatient: queueStats.calledPatient,
        patientsAhead,
        estimatedWaitMinutes,
        queuePosition: apt.queuePosition,
        queueState: apt.queueState || 'WAITING',
        doctorStatus: queueStats.doctorStatus
      }
    }
  });
});

app.post('/api/appointments', requireAuth, (req, res) => {
  const { doctorId, patientName, date, time, consultationType, reason } = req.body;
  const doctor = doctors.find(d => d.id === doctorId);
  if (!doctor) return res.status(400).json({ success: false, message: 'Invalid doctor' });

  const effectivePatientId = req.user.patientId || "pat-1";
  const effectivePatientName = patientName || req.user.name || "Rahul Sharma";

  const todaysDocApts = appointments.filter(a => a.doctorId === doctorId && a.date === (date || "2026-10-05"));
  const maxTokenNum = todaysDocApts.length + 1;
  const tokenNumber = `Q-${maxTokenNum < 10 ? '0' + maxTokenNum : maxTokenNum}`;

  const waitingList = todaysDocApts.filter(a => a.status === 'waiting' && a.queueState !== 'COMPLETED');
  const hasNowConsulting = todaysDocApts.some(a => a.status === 'now_consulting' || a.queueState === 'IN_CONSULTATION');
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
    hospital: doctor.hospital,
    location: doctor.location,
    patientId: effectivePatientId,
    patientName: effectivePatientName,
    patientAge: 31,
    patientGender: "Male",
    date: date || "2026-10-05",
    time: time || "04:00 PM",
    consultationType: consultationType || "In-Clinic",
    reason: reason || "Consultation & clinical evaluation",
    status: "waiting",
    queueState: queuePosition === 1 ? "NEAR_TURN" : "WAITING",
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

  // Trigger Notification for Patient
  createNotification({
    userId: req.user.id,
    patientId: effectivePatientId,
    title: "✓ Appointment Confirmed",
    message: `Your appointment with ${doctor.name} (${doctor.specialty}) is confirmed for ${time || '04:00 PM'}. Queue Token: ${tokenNumber}.`,
    type: "Appointment",
    relatedId: newAppointment.id
  });

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

// ==========================================
// 4. QUEUE MANAGEMENT & DOCTOR WORKFLOW API
// ==========================================

app.get('/api/queue/:doctorId', (req, res) => {
  const stats = getDoctorQueueStats(req.params.doctorId);
  res.json({ success: true, data: stats });
});

// Doctor calls patient into chamber (CALLED state)
app.post('/api/queue/:doctorId/call-next', requireAuth, requireRole('doctor'), (req, res) => {
  const doctorId = req.params.doctorId;
  const docApts = appointments.filter(a => a.doctorId === doctorId && a.date === "2026-10-05");

  const waitingList = docApts
    .filter(a => a.status === 'waiting' && a.queueState !== 'COMPLETED')
    .sort((a, b) => a.queuePosition - b.queuePosition);

  if (waitingList.length === 0) {
    return res.status(400).json({ success: false, message: 'No waiting patients in queue.' });
  }

  const nextPatient = waitingList[0];
  nextPatient.queueState = 'CALLED';

  // Trigger high-priority notification for patient
  createNotification({
    patientId: nextPatient.patientId,
    title: "🔔 It's Your Turn!",
    message: `Dr. ${nextPatient.doctorName} is ready for you. Please step into the consultation room.`,
    type: "Queue",
    relatedId: nextPatient.id
  });

  const updatedQueue = getDoctorQueueStats(doctorId);

  broadcastEvent('queue_updated', {
    doctorId,
    queue: updatedQueue,
    action: 'patient_called',
    calledPatient: nextPatient
  });

  res.json({
    success: true,
    message: `Called ${nextPatient.patientName} (${nextPatient.tokenNumber}) into chamber.`,
    data: updatedQueue,
    calledPatient: nextPatient
  });
});

// Doctor starts consultation (IN_CONSULTATION state)
app.post('/api/queue/:doctorId/start-consultation', requireAuth, requireRole('doctor'), (req, res) => {
  const doctorId = req.params.doctorId;
  const { appointmentId } = req.body;

  const docApts = appointments.filter(a => a.doctorId === doctorId && a.date === "2026-10-05");
  let targetApt = appointmentId ? docApts.find(a => a.id === appointmentId) : docApts.find(a => a.queueState === 'CALLED' || a.status === 'waiting');

  if (!targetApt) {
    return res.status(400).json({ success: false, message: 'No target appointment to start.' });
  }

  // Set previous now_consulting to completed if needed
  docApts.forEach(a => {
    if (a.id !== targetApt.id && a.status === 'now_consulting') {
      a.status = 'completed';
      a.queueState = 'COMPLETED';
    }
  });

  targetApt.status = 'now_consulting';
  targetApt.queueState = 'IN_CONSULTATION';
  targetApt.queuePosition = 1;

  createNotification({
    patientId: targetApt.patientId,
    title: "🟢 Consultation Started",
    message: `Consultation with Dr. ${targetApt.doctorName} is now in progress.`,
    type: "Consultation",
    relatedId: targetApt.id
  });

  const updatedQueue = getDoctorQueueStats(doctorId);

  broadcastEvent('queue_updated', {
    doctorId,
    queue: updatedQueue,
    action: 'consultation_started',
    currentPatient: targetApt
  });

  res.json({
    success: true,
    message: `Started consultation for ${targetApt.patientName}.`,
    data: updatedQueue,
    currentPatient: targetApt
  });
});

// Doctor completes consultation & automatically generates structured report
app.post('/api/queue/:doctorId/complete', requireAuth, requireRole('doctor'), (req, res) => {
  const doctorId = req.params.doctorId;
  const { appointmentId, doctorNotes, observations, clinicalSummary, advice, followUpDate, followUpReason } = req.body;

  const docApts = appointments.filter(a => a.doctorId === doctorId && a.date === "2026-10-05");

  let targetApt = appointmentId 
    ? appointments.find(a => a.id === appointmentId)
    : docApts.find(a => a.status === 'now_consulting' || a.queueState === 'IN_CONSULTATION' || a.queueState === 'CALLED');

  if (targetApt) {
    targetApt.status = 'completed';
    targetApt.queueState = 'COMPLETED';
    targetApt.queuePosition = 0;
    if (doctorNotes) targetApt.doctorNotes = doctorNotes;

    const intake = targetApt.aiPreConsultation || {};
    const doctor = doctors.find(d => d.id === doctorId) || { name: targetApt.doctorName, specialty: targetApt.doctorSpecialty, hospital: targetApt.hospital, location: targetApt.location };

    // Auto-generate structured consultation report
    const newReport = {
      id: `rep-${Date.now()}`,
      appointmentId: targetApt.id,
      patientId: targetApt.patientId,
      patientName: targetApt.patientName,
      patientAge: targetApt.patientAge || 31,
      patientGender: targetApt.patientGender || "Male",
      doctorId: doctor.id || doctorId,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      hospital: doctor.hospital,
      location: doctor.location,
      date: targetApt.date || "2026-10-05",
      time: targetApt.time || "04:00 PM",
      chiefComplaint: intake.chiefComplaint || targetApt.reason || "Clinical Consultation",
      symptomsReported: intake.summaryText || `${intake.chiefComplaint || targetApt.reason} (Duration: ${intake.duration || 'recent'}, Severity: ${intake.severity || 'Moderate'})`,
      patientProvidedInfo: intake.priorHistory ? `Prior History: ${intake.priorHistory}` : "Pre-consultation intake recorded via MediFlow AI Assistant.",
      doctorObservations: observations || "Vital parameters recorded and evaluated. Systemic examination satisfactory.",
      doctorNotes: doctorNotes || "Patient examined thoroughly. Clinical findings documented and management plan initiated.",
      clinicalSummary: clinicalSummary || `Clinical evaluation for ${intake.chiefComplaint || targetApt.reason}. Patient responding adequately.`,
      advice: advice || "1. Adhere to prescribed supportive care.\n2. Maintain proper rest and hydration.\n3. Monitor symptoms and report any exacerbation.",
      followUp: {
        recommended: Boolean(followUpDate),
        recommendedDate: followUpDate || null,
        reason: followUpReason || "Review recovery progress"
      },
      status: "Completed",
      createdAt: new Date().toISOString()
    };

    consultationReports.unshift(newReport);
    targetApt.consultationSummary = newReport;

    // Trigger Notification for Patient
    createNotification({
      patientId: targetApt.patientId,
      title: "📋 Consultation Report Ready",
      message: `Your consultation with Dr. ${doctor.name} is complete. Your official medical summary and PDF report are ready.`,
      type: "Report",
      relatedId: newReport.id
    });
  }

  // Shift queue and promote next patient
  const waitingList = docApts
    .filter(a => a.status === 'waiting' && (!targetApt || a.id !== targetApt.id))
    .sort((a, b) => a.queuePosition - b.queuePosition);

  let nextInLine = null;
  if (waitingList.length > 0) {
    nextInLine = waitingList[0];
    nextInLine.status = 'now_consulting';
    nextInLine.queueState = 'IN_CONSULTATION';
    nextInLine.queuePosition = 1;

    // Shift remaining waiting list
    waitingList.slice(1).forEach((apt, idx) => {
      apt.queuePosition = idx + 2;
      apt.queueState = (idx === 0) ? 'NEAR_TURN' : 'WAITING';
      if (idx === 0) {
        createNotification({
          patientId: apt.patientId,
          title: "⏳ You are Next in Line",
          message: `Only 1 patient ahead of you for Dr. ${apt.doctorName}. Please stay near the virtual waiting room.`,
          type: "Queue",
          relatedId: apt.id
        });
      }
    });

    createNotification({
      patientId: nextInLine.patientId,
      title: "🟢 Now Consulting",
      message: `You are now consulting with Dr. ${nextInLine.doctorName}. Please enter consultation.`,
      type: "Queue",
      relatedId: nextInLine.id
    });
  }

  const updatedQueue = getDoctorQueueStats(doctorId);

  broadcastEvent('queue_updated', {
    doctorId,
    queue: updatedQueue,
    action: 'consultation_completed',
    completedAppointment: targetApt,
    currentPatient: nextInLine
  });

  res.json({
    success: true,
    message: nextInLine 
      ? `Consultation completed. ${nextInLine.patientName} is now consulting.`
      : 'Consultation completed. Queue is now clear.',
    data: updatedQueue,
    appointment: targetApt,
    currentPatient: nextInLine
  });
});

// ==========================================
// 5. CONSULTATION REPORTS & PDF GENERATOR
// ==========================================

app.get('/api/consultations/reports', requireAuth, (req, res) => {
  let list = [...consultationReports];

  if (req.user.role === 'patient') {
    const patId = req.user.patientId || 'pat-1';
    list = list.filter(r => r.patientId === patId || r.patientId === 'pat-1');
  } else if (req.user.role === 'doctor') {
    const docId = req.user.doctorId || 'doc-1';
    list = list.filter(r => r.doctorId === docId);
  }

  res.json({ success: true, count: list.length, data: list });
});

app.get('/api/consultations/reports/:id', requireAuth, (req, res) => {
  const report = consultationReports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ success: false, message: 'Consultation report not found' });

  // Ownership check
  if (req.user.role === 'patient' && report.patientId !== req.user.patientId && report.patientId !== 'pat-1') {
    return res.status(403).json({ success: false, message: 'Unauthorized to access this medical report.' });
  }

  res.json({ success: true, data: report });
});

// Stream Professional Downloadable PDF Report
app.get('/api/consultations/reports/:id/pdf', requireAuth, (req, res) => {
  const report = consultationReports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ success: false, message: 'Consultation report not found' });

  if (req.user.role === 'patient' && report.patientId !== req.user.patientId && report.patientId !== 'pat-1') {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const doc = new PDFDocument({ margin: 45, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="MediFlow-Consultation-Report-${report.id}.pdf"`);

  doc.pipe(res);

  // Header Banner
  doc.rect(45, 45, 505, 55).fill('#0f766e'); // Teal-700
  doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('MEDIFLOW HEALTHCARE', 60, 58);
  doc.fontSize(10).font('Helvetica').text('AI-Assisted Virtual Waiting Room & Clinical Network', 60, 80);
  doc.fontSize(10).font('Helvetica-Bold').text(`REPORT #${report.id.toUpperCase()}`, 400, 68, { align: 'right' });

  doc.moveDown(3);

  // Meta Grid: Patient & Doctor Info
  doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('PATIENT INFORMATION', 45, 120);
  doc.rect(45, 135, 245, 90).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fillColor('#334155').fontSize(9).font('Helvetica')
    .text(`Name: ${report.patientName}`, 55, 145)
    .text(`Age / Gender: ${report.patientAge} yrs / ${report.patientGender}`, 55, 160)
    .text(`Patient ID: ${report.patientId}`, 55, 175)
    .text(`Date of Visit: ${report.date} at ${report.time}`, 55, 190)
    .text(`Status: Verified & Completed`, 55, 205);

  doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('CONSULTING PHYSICIAN', 305, 120);
  doc.rect(305, 135, 245, 90).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fillColor('#334155').fontSize(9).font('Helvetica')
    .text(`Doctor: ${report.doctorName}`, 315, 145)
    .text(`Specialty: ${report.doctorSpecialty}`, 315, 160)
    .text(`Hospital: ${report.hospital}`, 315, 175, { width: 225 })
    .text(`Location: ${report.location}, India`, 315, 205);

  let y = 245;

  // Section: Chief Complaint & Symptoms
  doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('1. CHIEF COMPLAINT & PRESENTING SYMPTOMS', 45, y);
  y += 18;
  doc.rect(45, y, 505, 45).fillAndStroke('#ffffff', '#cbd5e1');
  doc.fillColor('#1e293b').fontSize(9).font('Helvetica')
    .text(report.chiefComplaint, 55, y + 8, { width: 485 })
    .text(`Reported Details: ${report.symptomsReported}`, 55, y + 24, { width: 485 });
  y += 60;

  // Section: Doctor Observations & Clinical Notes
  doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('2. CLINICAL EXAMINATION & OBSERVATIONS', 45, y);
  y += 18;
  doc.rect(45, y, 505, 55).fillAndStroke('#ffffff', '#cbd5e1');
  doc.fillColor('#1e293b').fontSize(9).font('Helvetica')
    .text(`Doctor Observations: ${report.doctorObservations}`, 55, y + 8, { width: 485 })
    .text(`Physician Notes: ${report.doctorNotes}`, 55, y + 30, { width: 485 });
  y += 70;

  // Section: Clinical Summary & Diagnosis
  doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('3. CLINICAL SUMMARY & ASSESSMENT', 45, y);
  y += 18;
  doc.rect(45, y, 505, 45).fillAndStroke('#f0fdfa', '#99f6e4'); // Teal tint
  doc.fillColor('#115e59').fontSize(9.5).font('Helvetica-Bold')
    .text(report.clinicalSummary, 55, y + 10, { width: 485 });
  y += 60;

  // Section: Medical Advice & Follow-Up Plan
  doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('4. PHYSICIAN ADVICE & FOLLOW-UP PLAN', 45, y);
  y += 18;
  doc.rect(45, y, 505, 65).fillAndStroke('#ffffff', '#cbd5e1');
  doc.fillColor('#1e293b').fontSize(9).font('Helvetica')
    .text(report.advice, 55, y + 8, { width: 485 })
    .text(`Recommended Follow-up: ${report.followUp?.recommended ? `${report.followUp.recommendedDate} (${report.followUp.reason})` : 'SOS as needed'}`, 55, y + 48, { width: 485 });
  y += 85;

  // Signature Block & Footer
  doc.rect(45, y, 505, 55).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fillColor('#64748b').fontSize(8).font('Helvetica')
    .text('Authenticity: Electronically authorized by consulting doctor via DOCBEE MediFlow Clinical Station.', 55, y + 10)
    .text('Disclaimer: AI pre-consultation intake is supplementary. Clinical determinations remain the sole authority of the licensed physician.', 55, y + 22, { width: 330 });

  doc.fillColor('#0f766e').fontSize(9).font('Helvetica-Bold')
    .text(`Dr. ${report.doctorName}`, 410, y + 15, { align: 'right' })
    .text('Authorized Signatory', 410, y + 28, { align: 'right' });

  doc.end();
});

// ==========================================
// 6. NOTIFICATIONS API
// ==========================================

app.get('/api/notifications', requireAuth, (req, res) => {
  const patId = req.user.patientId || 'pat-1';
  const userNotifs = notifications.filter(n => n.userId === req.user.id || n.patientId === patId || n.userId === 'usr-patient-1');
  res.json({ success: true, count: userNotifs.length, data: userNotifs });
});

app.patch('/api/notifications/:id/read', requireAuth, (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true, data: notif });
});

app.patch('/api/notifications/mark-all-read', requireAuth, (req, res) => {
  const patId = req.user.patientId || 'pat-1';
  notifications.forEach(n => {
    if (n.userId === req.user.id || n.patientId === patId || n.userId === 'usr-patient-1') {
      n.read = true;
    }
  });
  res.json({ success: true, message: 'All notifications marked as read.' });
});

app.delete('/api/notifications/:id', requireAuth, (req, res) => {
  notifications = notifications.filter(n => n.id !== req.params.id);
  res.json({ success: true, message: 'Notification dismissed.' });
});

// ==========================================
// 7. PATIENT PROFILE, FAMILY & DOCUMENTS API
// ==========================================

app.get('/api/patient/profile', requireAuth, (req, res) => {
  res.json({ success: true, data: patientProfile });
});

app.put('/api/patient/profile', requireAuth, (req, res) => {
  patientProfile = { ...patientProfile, ...req.body };
  res.json({ success: true, data: patientProfile });
});

app.get('/api/family', requireAuth, (req, res) => {
  res.json({ success: true, data: familyMembers });
});

app.post('/api/family', requireAuth, (req, res) => {
  const newMember = {
    id: `fam-${Date.now()}`,
    patientId: req.user.patientId || "pat-1",
    ...req.body
  };
  familyMembers.push(newMember);
  res.status(201).json({ success: true, data: newMember });
});

app.get('/api/documents', requireAuth, (req, res) => {
  const patId = req.user.patientId || 'pat-1';
  const docs = medicalDocuments.filter(d => d.patientId === patId || d.patientId === 'pat-1');
  res.json({ success: true, count: docs.length, data: docs });
});

app.post('/api/documents', requireAuth, (req, res) => {
  const newDoc = {
    id: `doc-vault-${Date.now()}`,
    patientId: req.user.patientId || "pat-1",
    title: req.body.title || "Diagnostic Report",
    category: req.body.category || "Diagnostic Report",
    date: new Date().toISOString().split('T')[0],
    doctor: req.body.doctor || "Consulting Specialist",
    hospital: req.body.hospital || "Hospital Diagnostic Labs",
    fileSize: "1.5 MB",
    status: req.body.status || "Verified by Pathology",
    isSharedWithDoctor: true,
    type: "pdf"
  };
  medicalDocuments.unshift(newDoc);
  res.status(201).json({ success: true, data: newDoc });
});

app.patch('/api/documents/:id/toggle-share', requireAuth, (req, res) => {
  const doc = medicalDocuments.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
  doc.isSharedWithDoctor = !doc.isSharedWithDoctor;
  res.json({ success: true, data: doc });
});

// ==========================================
// 8. AI ASSISTANT INTAKE & PRE-CONSULTATION
// ==========================================

app.post('/api/ai/pre-consultation', requireAuth, (req, res) => {
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
    chiefComplaint: chiefComplaint || "General symptoms evaluation",
    duration: duration || "2 days",
    location: location || "General",
    severity: formattedSeverity,
    associatedSymptoms: associatedSymptoms || "Fatigue",
    priorHistory: priorHistory || "No previous consultation",
    patientDescription: patientDescription || chiefComplaint || "Patient reported symptoms during pre-consultation intake",
    status: "Submitted",
    summaryText: `Chief complaint: ${chiefComplaint || 'Consultation review'} | Duration: ${duration || '2 days'} | Location: ${location || 'General'} | Severity: ${formattedSeverity} | Associated symptoms: ${associatedSymptoms || 'None'} | Prior treatment: ${priorHistory || 'None'}`,
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

app.post('/api/ai/generate-summary', requireAuth, requireRole('doctor'), (req, res) => {
  const { appointmentId, doctorNotes } = req.body;
  const apt = appointments.find(a => a.id === appointmentId);

  const notesText = doctorNotes || (apt ? apt.doctorNotes : "Patient examined. Vital signs stable. Prescribed supportive treatment.");
  const intake = apt ? apt.aiPreConsultation : null;

  const summary = {
    chiefComplaint: intake && intake.chiefComplaint ? intake.chiefComplaint : "Primary consultation evaluation",
    symptomsDiscussed: intake && intake.associatedSymptoms ? `${intake.chiefComplaint}, ${intake.associatedSymptoms} (Duration: ${intake.duration || 'recent'})` : "Clinical symptoms reviewed with specialist",
    doctorNotes: notesText,
    clinicalObservations: "Vitals within normal baseline. Systemic evaluation satisfactory.",
    followUpRecommendation: "Adequate hydration, proper rest, and medication as discussed.",
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

// ==========================================
// 9. DEMO RESET ENDPOINT
// ==========================================

app.post('/api/demo/reset', (req, res) => {
  users = JSON.parse(JSON.stringify(seedData.users));
  locations = JSON.parse(JSON.stringify(seedData.locations));
  doctors = JSON.parse(JSON.stringify(seedData.doctors));
  appointments = JSON.parse(JSON.stringify(seedData.appointments));
  patientProfile = JSON.parse(JSON.stringify(seedData.patientProfile));
  familyMembers = JSON.parse(JSON.stringify(seedData.familyMembers));
  consultationReports = JSON.parse(JSON.stringify(seedData.consultationReports));
  medicalDocuments = JSON.parse(JSON.stringify(seedData.medicalDocuments));
  notifications = JSON.parse(JSON.stringify(seedData.notifications));

  broadcastEvent('demo_reset', { message: 'Demo data restored' });

  res.json({ success: true, message: 'Demo data reset successfully!' });
});

// ==========================================
// 10. PRODUCTION STATIC & SPA FALLBACK
// ==========================================

const fs = require('fs');
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath) || process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[DOCBEE MediFlow Server] Running on http://localhost:${PORT} (NODE_ENV: ${process.env.NODE_ENV || 'development'})`);
});
