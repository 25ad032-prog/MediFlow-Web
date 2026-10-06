// DOCBEE MediFlow - Synthetic FHIR Healthcare Data Provider
// Implements the HealthcareDataProvider interface using local synthetic FHIR R4-compliant data.
// Provides realistic multi-doctor, multi-location healthcare records for testing and offline demonstration.

const seedData = require('../../data/seedData');
const {
  FhirPatient,
  FhirPractitioner,
  FhirOrganization,
  FhirSchedule,
  FhirSlot,
  FhirAppointment,
  FhirEncounter,
  FhirObservation,
  FhirDiagnosticReport,
  FhirDocumentReference
} = require('./fhirModels');

const {
  doctorToFhirPractitioner,
  patientToFhirPatient,
  appointmentToFhirAppointment
} = require('./resourceMapper');

class SyntheticHealthcareProvider {
  constructor() {
    this.providerType = 'synthetic';
    this.isFallback = false;
    this.name = 'MediFlow Synthetic FHIR Provider (R4)';
    this.initialize();
  }

  initialize() {
    // 1. Convert seed doctors to FHIR Practitioners
    this.practitioners = (seedData.doctors || []).map(doc => doctorToFhirPractitioner(doc));

    // 2. Organizations
    this.organizations = (seedData.locations || []).map(loc => {
      return new FhirOrganization({
        id: `org-${loc.name.toLowerCase()}`,
        name: `Apollo & MediFlow Healthcare Hub (${loc.name})`,
        type: "prov",
        address: [{ city: loc.name, state: loc.state, country: "India" }]
      });
    });

    // 3. Patients
    this.patients = [
      patientToFhirPatient(seedData.patientProfile || {
        id: 'pat-1',
        name: 'Rahul Sharma',
        email: 'patient@mediflow.demo',
        phone: '+91 98765 00001',
        gender: 'Male',
        age: 31
      })
    ];

    // 4. Appointments
    this.appointments = (seedData.appointments || []).map(apt => appointmentToFhirAppointment(apt));

    // 5. Schedules & Slots for all practitioners
    this.schedules = [];
    this.slots = [];
    this.generateSchedulesAndSlots();

    // 6. Encounters
    this.encounters = [
      new FhirEncounter({
        id: "enc-101",
        status: "finished",
        patientRef: "pat-1",
        practitionerRef: "doc-1",
        appointmentRef: "apt-101",
        period: { start: "2026-09-28T10:00:00Z", end: "2026-09-28T10:18:00Z" },
        reasonCode: [{ coding: [{ display: "Routine Cardiac Evaluation" }] }],
        diagnosis: ["Sinus rhythm regular, benign exertion response"],
        doctorNotes: "Vitals stable. ECG normal. Advised adequate hydration and lifestyle moderation.",
        clinicalSummary: "Satisfactory cardiovascular baseline. Routine follow-up scheduled."
      })
    ];

    // 7. Observations (Vitals & Labs)
    this.observations = [
      new FhirObservation({
        id: "obs-bp-1",
        status: "final",
        category: "vital-signs",
        code: "85354-9",
        display: "Blood Pressure",
        patientRef: "pat-1",
        encounterRef: "enc-101",
        valueString: "120/80 mmHg",
        interpretation: "Normal"
      }),
      new FhirObservation({
        id: "obs-hr-1",
        status: "final",
        category: "vital-signs",
        code: "8867-4",
        display: "Heart Rate",
        patientRef: "pat-1",
        encounterRef: "enc-101",
        valueQuantity: { value: 72, unit: "bpm" },
        interpretation: "Normal"
      }),
      new FhirObservation({
        id: "obs-spo2-1",
        status: "final",
        category: "vital-signs",
        code: "59408-5",
        display: "Oxygen Saturation",
        patientRef: "pat-1",
        encounterRef: "enc-101",
        valueQuantity: { value: 99, unit: "%" },
        interpretation: "Optimal"
      }),
      new FhirObservation({
        id: "obs-glu-1",
        status: "final",
        category: "laboratory",
        code: "2339-0",
        display: "Fasting Blood Glucose",
        patientRef: "pat-1",
        valueQuantity: { value: 94, unit: "mg/dL" },
        interpretation: "Normal"
      })
    ];

    // 8. Diagnostic Reports
    this.diagnosticReports = (seedData.consultationReports || []).map(rep => {
      return new FhirDiagnosticReport({
        id: rep.id,
        identifier: [{ system: "urn:oid:mediflow:report", value: rep.reportNumber || rep.id }],
        status: "final",
        code: "11488-4",
        display: rep.chiefComplaint || "Cardiology Consultation Summary",
        patientRef: rep.patientId || "pat-1",
        practitionerRef: rep.doctorId || "doc-1",
        encounterRef: "enc-101",
        effectiveDateTime: rep.consultationDate ? `${rep.consultationDate}T10:00:00Z` : "2026-09-28T10:00:00Z",
        conclusion: rep.observations || "Cardiac evaluation normal.",
        doctorNotes: rep.doctorNotes || "Assessment complete.",
        clinicalSummary: rep.clinicalSummary || "Satisfactory consultation.",
        advice: rep.advice || "Continue prescribed regimen.",
        followUpDate: rep.followUpDate || "2026-10-12",
        pdfUrl: rep.pdfUrl || `/api/reports/${rep.id}/pdf`
      });
    });

    // 9. Document References (Vault)
    this.documentReferences = (seedData.medicalDocuments || []).map(doc => {
      return new FhirDocumentReference({
        id: doc.id,
        status: "current",
        typeDisplay: doc.category || "Health Record",
        patientRef: "pat-1",
        practitionerRef: "doc-1",
        date: doc.date ? `${doc.date}T09:00:00Z` : "2026-09-28T09:00:00Z",
        title: doc.title,
        category: doc.category,
        fileUrl: doc.fileUrl || "#",
        fileSize: doc.size || "1.2 MB",
        contentType: doc.type === 'PDF' ? 'application/pdf' : 'application/msword'
      });
    });
  }

  generateSchedulesAndSlots() {
    this.schedules = [];
    this.slots = [];
    const baseDate = "2026-10-05";

    this.practitioners.forEach(doc => {
      const scheduleId = `sched-${doc.id}`;
      const schedule = new FhirSchedule({
        id: scheduleId,
        actor: [{ reference: `Practitioner/${doc.id}`, display: doc.name?.[0]?.family ? `Dr. ${doc.name[0].given?.join(' ')} ${doc.name[0].family}` : 'Specialist' }],
        planningHorizon: {
          start: `${baseDate}T09:00:00Z`,
          end: `${baseDate}T17:00:00Z`
        },
        comment: `Daily OPD Schedule - ${doc.specialty || 'General'}`
      });
      this.schedules.push(schedule);

      // Generate 15-minute slots for OPD
      const slotTimes = [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
      ];

      slotTimes.forEach((timeStr, idx) => {
        const slotId = `slot-${doc.id}-${idx + 1}`;
        this.slots.push(new FhirSlot({
          id: slotId,
          scheduleRef: scheduleId,
          status: idx % 4 === 0 ? "busy" : "free",
          start: `${baseDate} ${timeStr}`,
          end: `${baseDate} ${timeStr}`,
          comment: `${doc.specialty} OPD Slot ${idx + 1}`
        }));
      });
    });
  }

  // ==========================================
  // PATIENT OPERATIONS
  // ==========================================
  async getPatients(filter = {}) {
    let result = [...this.patients];
    if (filter.id) result = result.filter(p => p.id === filter.id);
    if (filter.email) {
      result = result.filter(p => p.telecom?.some(t => t.system === 'email' && t.value.toLowerCase() === filter.email.toLowerCase()));
    }
    return result;
  }

  async getPatientById(id) {
    return this.patients.find(p => p.id === id) || this.patients[0] || null;
  }

  async createPatient(patientData) {
    const newPat = patientToFhirPatient(patientData);
    newPat.id = patientData.id || `pat-${Date.now()}`;
    this.patients.push(newPat);
    return newPat;
  }

  // ==========================================
  // PRACTITIONER (DOCTOR) OPERATIONS
  // ==========================================
  async getPractitioners(filter = {}) {
    let result = [...this.practitioners];
    if (filter.specialty && filter.specialty !== 'All') {
      const spec = filter.specialty.toLowerCase();
      result = result.filter(d => (d.specialty || '').toLowerCase() === spec);
    }
    if (filter.location && filter.location !== 'All') {
      const loc = filter.location.toLowerCase();
      result = result.filter(d => {
        const docCity = d.address?.[0]?.city || '';
        return docCity.toLowerCase() === loc;
      });
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(d => {
        const nameGiven = d.name?.[0]?.given?.join(' ') || '';
        const nameFam = d.name?.[0]?.family || '';
        const full = `Dr. ${nameGiven} ${nameFam}`.toLowerCase();
        const spec = (d.specialty || '').toLowerCase();
        const city = (d.address?.[0]?.city || '').toLowerCase();
        const hosp = (d.hospitalAffiliation || '').toLowerCase();
        return full.includes(q) || spec.includes(q) || city.includes(q) || hosp.includes(q);
      });
    }
    return result;
  }

  async getPractitionerById(id) {
    return this.practitioners.find(p => p.id === id) || null;
  }

  // ==========================================
  // ORGANIZATIONS & LOCATIONS
  // ==========================================
  async getOrganizations() {
    return [...this.organizations];
  }

  async getLocations() {
    return JSON.parse(JSON.stringify(seedData.locations || []));
  }

  // ==========================================
  // SCHEDULES & SLOTS
  // ==========================================
  async getSchedules(practitionerId) {
    if (!practitionerId) return [...this.schedules];
    return this.schedules.filter(s => s.actor?.some(a => a.reference === `Practitioner/${practitionerId}`));
  }

  async getSlots(practitionerId, date = null) {
    if (!practitionerId) return [...this.slots];
    return this.slots.filter(s => s.schedule?.reference === `Schedule/sched-${practitionerId}`);
  }

  // ==========================================
  // APPOINTMENT OPERATIONS
  // ==========================================
  async getAppointments(filter = {}) {
    let result = [...this.appointments];
    if (filter.patientId) {
      result = result.filter(a => a.participant?.some(p => p.actor?.reference === `Patient/${filter.patientId}`));
    }
    if (filter.doctorId) {
      result = result.filter(a => a.participant?.some(p => p.actor?.reference === `Practitioner/${filter.doctorId}`));
    }
    if (filter.status) {
      result = result.filter(a => a.status === filter.status);
    }
    return result;
  }

  async getAppointmentById(id) {
    return this.appointments.find(a => a.id === id) || null;
  }

  async createAppointment(aptData) {
    const fhirApt = appointmentToFhirAppointment(aptData);
    fhirApt.id = aptData.id || `apt-${Date.now()}`;
    this.appointments.unshift(fhirApt);
    return fhirApt;
  }

  async updateAppointment(id, updates) {
    const idx = this.appointments.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.appointments[idx] = {
      ...this.appointments[idx],
      ...updates,
      meta: {
        ...this.appointments[idx].meta,
        lastUpdated: new Date().toISOString()
      }
    };
    return this.appointments[idx];
  }

  // ==========================================
  // ENCOUNTER OPERATIONS
  // ==========================================
  async getEncounters(filter = {}) {
    let result = [...this.encounters];
    if (filter.patientId) {
      result = result.filter(e => e.subject?.reference === `Patient/${filter.patientId}`);
    }
    if (filter.practitionerId) {
      result = result.filter(e => e.participant?.some(p => p.individual?.reference === `Practitioner/${filter.practitionerId}`));
    }
    return result;
  }

  async getEncounterById(id) {
    return this.encounters.find(e => e.id === id) || null;
  }

  async createEncounter(encounterData) {
    const newEnc = new FhirEncounter({
      ...encounterData,
      id: encounterData.id || `enc-${Date.now()}`
    });
    this.encounters.unshift(newEnc);
    return newEnc;
  }

  // ==========================================
  // OBSERVATION OPERATIONS
  // ==========================================
  async getObservations(patientId) {
    if (!patientId) return [...this.observations];
    return this.observations.filter(o => o.subject?.reference === `Patient/${patientId}`);
  }

  async createObservation(obsData) {
    const newObs = new FhirObservation({
      ...obsData,
      id: obsData.id || `obs-${Date.now()}`
    });
    this.observations.unshift(newObs);
    return newObs;
  }

  // ==========================================
  // DIAGNOSTIC REPORTS
  // ==========================================
  async getDiagnosticReports(patientId) {
    if (!patientId) return [...this.diagnosticReports];
    return this.diagnosticReports.filter(r => r.subject?.reference === `Patient/${patientId}`);
  }

  async getDiagnosticReportById(id) {
    return this.diagnosticReports.find(r => r.id === id) || null;
  }

  async createDiagnosticReport(reportData) {
    const newRep = new FhirDiagnosticReport({
      ...reportData,
      id: reportData.id || `rep-${Date.now()}`
    });
    this.diagnosticReports.unshift(newRep);
    return newRep;
  }

  // ==========================================
  // DOCUMENT REFERENCES (HEALTH VAULT)
  // ==========================================
  async getDocumentReferences(patientId) {
    if (!patientId) return [...this.documentReferences];
    return this.documentReferences.filter(d => d.subject?.reference === `Patient/${patientId}`);
  }

  async createDocumentReference(docData) {
    const newDoc = new FhirDocumentReference({
      ...docData,
      id: docData.id || `doc-ref-${Date.now()}`
    });
    this.documentReferences.unshift(newDoc);
    return newDoc;
  }

  // ==========================================
  // RESET STATE
  // ==========================================
  reset() {
    this.initialize();
  }
}

module.exports = SyntheticHealthcareProvider;
