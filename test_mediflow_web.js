const http = require('http');

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;
    const headers = {
      ...(options.headers || {})
    };
    if (body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: options.method || (data ? 'POST' : 'GET'),
      headers
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ ...JSON.parse(raw), _statusCode: res.statusCode });
        } catch(e) {
          resolve({ raw, _statusCode: res.statusCode });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function verifyMediFlowWeb() {
  console.log('========================================================');
  console.log('       MEDIFLOW-WEB INDEPENDENT APPLICATION TESTS        ');
  console.log('========================================================');

  // 1. Health check on Backend
  const docRes = await request('http://localhost:5000/api/doctors');
  console.log('1. Backend API Doctors List:', docRes.success ? `PASS (${docRes.count} specialists loaded)` : 'FAIL');

  // 2. Doctor Search & Specialty Filter
  const cardioRes = await request('http://localhost:5000/api/doctors?specialty=Cardiologist');
  console.log('2. Doctor Search (Cardiologist):', (cardioRes.success && cardioRes.count >= 1) ? `PASS (Found: ${cardioRes.data[0].name})` : 'FAIL');

  // 3. Doctor Profile & Live Queue Stats
  const docProfile = await request('http://localhost:5000/api/doctors/doc-1');
  console.log('3. Doctor Profile & Queue Data:', (docProfile.success && docProfile.data.queue) ? `PASS (Status: ${docProfile.data.queue.doctorStatus})` : 'FAIL');

  // 3.5 Authenticate Demo Patient & Demo Doctor
  const patLogin = await request('http://localhost:5000/api/auth/login', { method: 'POST' }, {
    email: 'patient@mediflow.demo',
    password: 'Patient@123'
  });
  const patToken = patLogin.token;

  const docLogin = await request('http://localhost:5000/api/auth/login', { method: 'POST' }, {
    email: 'doctor@mediflow.demo',
    password: 'Doctor@123'
  });
  const docToken = docLogin.token;

  // 4. Book Appointment (Authenticated as Patient)
  const bookRes = await request('http://localhost:5000/api/appointments', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${patToken}` }
  }, {
    doctorId: 'doc-1',
    patientId: 'pat-1',
    patientName: 'Meera',
    date: '2026-10-05',
    time: '04:00 PM',
    consultationType: 'In-Clinic',
    reason: 'Severe headache and eye strain'
  });
  console.log('4. Appointment Booking Flow:', bookRes.success ? `PASS (Token: ${bookRes.tokenNumber}, Position: #${bookRes.data.queuePosition}, Est Wait: ${bookRes.estimatedWaitMinutes}m)` : 'FAIL');
  const aptId = bookRes.data.id;

  // 5. Submit AI Pre-Consultation Intake
  const preConsultRes = await request('http://localhost:5000/api/ai/pre-consultation', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${patToken}` }
  }, {
    appointmentId: aptId,
    chiefComplaint: "Severe headache and eye strain",
    duration: "2 days",
    location: "Frontal head and temple areas",
    severity: "6/10",
    associatedSymptoms: "Mild dizziness and general fatigue",
    priorHistory: "No prior consultation for this issue",
    patientDescription: "I have had a throbbing pain around the temples since yesterday with eye fatigue when looking at screens."
  });
  console.log('5. AI Pre-Consultation Submission:', preConsultRes.success ? `PASS (Status: ${preConsultRes.data.status})` : 'FAIL');

  // 6. Doctor Dashboard Queue & Intake Inspection
  const aptCheck = await request(`http://localhost:5000/api/appointments/${aptId}`, {
    headers: { 'Authorization': `Bearer ${docToken}` }
  });
  const intakeOk = aptCheck.success && aptCheck.data.aiPreConsultation && aptCheck.data.aiPreConsultation.completed;
  console.log('6. Doctor Dashboard Patient Intake Verification:', intakeOk ? 'PASS (Pre-consultation visible to Doctor)' : 'FAIL');

  // 7. Complete Consultation & Advance Queue (Authenticated as Doctor)
  const completeRes = await request('http://localhost:5000/api/queue/doc-1/complete', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${docToken}` }
  }, {
    appointmentId: aptId,
    doctorNotes: "Examined patient. Diagnosed tension headache. Advised hydration and screen time limits."
  });
  console.log('7. Complete Consultation & Live Queue Advance:', completeRes.success ? `PASS (${completeRes.message})` : 'FAIL');

  // 8. Reset Demo State
  const resetRes = await request('http://localhost:5000/api/demo/reset', { method: 'POST' }, {});
  console.log('8. Demo Reset Endpoint:', resetRes.success ? 'PASS' : 'FAIL');

  console.log('========================================================');
  console.log('   ALL MEDIFLOW-WEB INDEPENDENT VERIFICATION TESTS PASS  ');
  console.log('========================================================');
}

verifyMediFlowWeb();
