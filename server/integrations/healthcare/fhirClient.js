// DOCBEE MediFlow - External FHIR REST Client & Provider
// Connects to external FHIR-compliant Hospital/EHR servers (e.g. HAPI FHIR, SMART on FHIR, Hospital REST APIs).
// Automatically falls back to SyntheticHealthcareProvider when external FHIR endpoint is unreachable or disabled.

const http = require('http');
const https = require('https');
const url = require('url');
const SyntheticHealthcareProvider = require('./syntheticProvider');

class FhirHealthcareProvider {
  constructor(options = {}) {
    this.providerType = 'fhir_api';
    this.name = 'External FHIR REST Client (HL7 FHIR R4)';
    this.baseUrl = options.baseUrl || process.env.FHIR_BASE_URL || 'http://localhost:8080/fhir';
    this.apiKey = options.apiKey || process.env.FHIR_API_KEY || null;
    this.timeout = options.timeout || 3000;
    this.fallbackProvider = new SyntheticHealthcareProvider();
    this.fallbackProvider.isFallback = true;
    this.isExternalReachable = false;
  }

  async _request(method, endpoint, body = null) {
    return new Promise((resolve, reject) => {
      try {
        const fullUrl = `${this.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
        const parsedUrl = new URL(fullUrl);
        const isHttps = parsedUrl.protocol === 'https:';
        const client = isHttps ? https : http;

        const postData = body ? JSON.stringify(body) : null;
        const options = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (isHttps ? 443 : 80),
          path: `${parsedUrl.pathname}${parsedUrl.search}`,
          method,
          timeout: this.timeout,
          headers: {
            'Accept': 'application/fhir+json, application/json',
            'Content-Type': 'application/fhir+json',
            ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
            ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
          }
        };

        const req = client.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                resolve(data);
              }
            } else {
              reject(new Error(`External FHIR endpoint returned HTTP ${res.statusCode}: ${data.slice(0, 150)}`));
            }
          });
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new Error(`External FHIR request to ${fullUrl} timed out after ${this.timeout}ms`));
        });

        req.on('error', (err) => {
          reject(err);
        });

        if (postData) req.write(postData);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  async _executeWithFallback(operationName, apiFn, fallbackFn) {
    try {
      if (!process.env.FHIR_BASE_URL && !this.baseUrl) {
        throw new Error('FHIR_BASE_URL not configured');
      }
      const result = await apiFn();
      this.isExternalReachable = true;
      return result;
    } catch (err) {
      this.isExternalReachable = false;
      console.warn(`[MediFlow FHIR Integration] External FHIR endpoint unavailable for '${operationName}' (${err.message}). Gracefully falling back to Synthetic FHIR Provider.`);
      return await fallbackFn();
    }
  }

  // ==========================================
  // PATIENT OPERATIONS
  // ==========================================
  async getPatients(filter = {}) {
    return this._executeWithFallback(
      'getPatients',
      async () => {
        const query = filter.id ? `?_id=${filter.id}` : '';
        const bundle = await this._request('GET', `Patient${query}`);
        if (bundle.entry) return bundle.entry.map(e => e.resource);
        return Array.isArray(bundle) ? bundle : [bundle];
      },
      () => this.fallbackProvider.getPatients(filter)
    );
  }

  async getPatientById(id) {
    return this._executeWithFallback(
      'getPatientById',
      async () => await this._request('GET', `Patient/${id}`),
      () => this.fallbackProvider.getPatientById(id)
    );
  }

  async createPatient(patientData) {
    return this._executeWithFallback(
      'createPatient',
      async () => await this._request('POST', 'Patient', patientData),
      () => this.fallbackProvider.createPatient(patientData)
    );
  }

  // ==========================================
  // PRACTITIONER OPERATIONS
  // ==========================================
  async getPractitioners(filter = {}) {
    return this._executeWithFallback(
      'getPractitioners',
      async () => {
        let q = [];
        if (filter.specialty && filter.specialty !== 'All') q.push(`qualification:text=${encodeURIComponent(filter.specialty)}`);
        if (filter.location && filter.location !== 'All') q.push(`address-city=${encodeURIComponent(filter.location)}`);
        const query = q.length > 0 ? `?${q.join('&')}` : '';
        const bundle = await this._request('GET', `Practitioner${query}`);
        if (bundle.entry) return bundle.entry.map(e => e.resource);
        return Array.isArray(bundle) ? bundle : [bundle];
      },
      () => this.fallbackProvider.getPractitioners(filter)
    );
  }

  async getPractitionerById(id) {
    return this._executeWithFallback(
      'getPractitionerById',
      async () => await this._request('GET', `Practitioner/${id}`),
      () => this.fallbackProvider.getPractitionerById(id)
    );
  }

  // ==========================================
  // ORGANIZATIONS & LOCATIONS
  // ==========================================
  async getOrganizations() {
    return this._executeWithFallback(
      'getOrganizations',
      async () => {
        const bundle = await this._request('GET', 'Organization');
        if (bundle.entry) return bundle.entry.map(e => e.resource);
        return Array.isArray(bundle) ? bundle : [bundle];
      },
      () => this.fallbackProvider.getOrganizations()
    );
  }

  async getLocations() {
    return this.fallbackProvider.getLocations();
  }

  // ==========================================
  // SCHEDULES & SLOTS
  // ==========================================
  async getSchedules(practitionerId) {
    return this._executeWithFallback(
      'getSchedules',
      async () => {
        const query = practitionerId ? `?actor=Practitioner/${practitionerId}` : '';
        const bundle = await this._request('GET', `Schedule${query}`);
        if (bundle.entry) return bundle.entry.map(e => e.resource);
        return Array.isArray(bundle) ? bundle : [bundle];
      },
      () => this.fallbackProvider.getSchedules(practitionerId)
    );
  }

  async getSlots(practitionerId, date = null) {
    return this._executeWithFallback(
      'getSlots',
      async () => {
        const query = practitionerId ? `?schedule.actor=Practitioner/${practitionerId}` : '';
        const bundle = await this._request('GET', `Slot${query}`);
        if (bundle.entry) return bundle.entry.map(e => e.resource);
        return Array.isArray(bundle) ? bundle : [bundle];
      },
      () => this.fallbackProvider.getSlots(practitionerId, date)
    );
  }

  // ==========================================
  // APPOINTMENT OPERATIONS
  // ==========================================
  async getAppointments(filter = {}) {
    return this._executeWithFallback(
      'getAppointments',
      async () => {
        let q = [];
        if (filter.patientId) q.push(`patient=Patient/${filter.patientId}`);
        if (filter.doctorId) q.push(`practitioner=Practitioner/${filter.doctorId}`);
        const query = q.length > 0 ? `?${q.join('&')}` : '';
        const bundle = await this._request('GET', `Appointment${query}`);
        if (bundle.entry) return bundle.entry.map(e => e.resource);
        return Array.isArray(bundle) ? bundle : [bundle];
      },
      () => this.fallbackProvider.getAppointments(filter)
    );
  }

  async getAppointmentById(id) {
    return this._executeWithFallback(
      'getAppointmentById',
      async () => await this._request('GET', `Appointment/${id}`),
      () => this.fallbackProvider.getAppointmentById(id)
    );
  }

  async createAppointment(aptData) {
    return this._executeWithFallback(
      'createAppointment',
      async () => await this._request('POST', 'Appointment', aptData),
      () => this.fallbackProvider.createAppointment(aptData)
    );
  }

  async updateAppointment(id, updates) {
    return this._executeWithFallback(
      'updateAppointment',
      async () => await this._request('PUT', `Appointment/${id}`, updates),
      () => this.fallbackProvider.updateAppointment(id, updates)
    );
  }

  // ==========================================
  // ENCOUNTER OPERATIONS
  // ==========================================
  async getEncounters(filter = {}) {
    return this._executeWithFallback(
      'getEncounters',
      async () => {
        const bundle = await this._request('GET', 'Encounter');
        if (bundle.entry) return bundle.entry.map(e => e.resource);
        return Array.isArray(bundle) ? bundle : [bundle];
      },
      () => this.fallbackProvider.getEncounters(filter)
    );
  }

  async getEncounterById(id) {
    return this._executeWithFallback(
      'getEncounterById',
      async () => await this._request('GET', `Encounter/${id}`),
      () => this.fallbackProvider.getEncounterById(id)
    );
  }

  async createEncounter(encounterData) {
    return this._executeWithFallback(
      'createEncounter',
      async () => await this._request('POST', 'Encounter', encounterData),
      () => this.fallbackProvider.createEncounter(encounterData)
    );
  }

  // ==========================================
  // OBSERVATION OPERATIONS
  // ==========================================
  async getObservations(patientId) {
    return this._executeWithFallback(
      'getObservations',
      async () => {
        const query = patientId ? `?subject=Patient/${patientId}` : '';
        const bundle = await this._request('GET', `Observation${query}`);
        if (bundle.entry) return bundle.entry.map(e => e.resource);
        return Array.isArray(bundle) ? bundle : [bundle];
      },
      () => this.fallbackProvider.getObservations(patientId)
    );
  }

  async createObservation(obsData) {
    return this._executeWithFallback(
      'createObservation',
      async () => await this._request('POST', 'Observation', obsData),
      () => this.fallbackProvider.createObservation(obsData)
    );
  }

  // ==========================================
  // DIAGNOSTIC REPORTS
  // ==========================================
  async getDiagnosticReports(patientId) {
    return this._executeWithFallback(
      'getDiagnosticReports',
      async () => {
        const query = patientId ? `?subject=Patient/${patientId}` : '';
        const bundle = await this._request('GET', `DiagnosticReport${query}`);
        if (bundle.entry) return bundle.entry.map(e => e.resource);
        return Array.isArray(bundle) ? bundle : [bundle];
      },
      () => this.fallbackProvider.getDiagnosticReports(patientId)
    );
  }

  async getDiagnosticReportById(id) {
    return this._executeWithFallback(
      'getDiagnosticReportById',
      async () => await this._request('GET', `DiagnosticReport/${id}`),
      () => this.fallbackProvider.getDiagnosticReportById(id)
    );
  }

  async createDiagnosticReport(reportData) {
    return this._executeWithFallback(
      'createDiagnosticReport',
      async () => await this._request('POST', 'DiagnosticReport', reportData),
      () => this.fallbackProvider.createDiagnosticReport(reportData)
    );
  }

  // ==========================================
  // DOCUMENT REFERENCES
  // ==========================================
  async getDocumentReferences(patientId) {
    return this._executeWithFallback(
      'getDocumentReferences',
      async () => {
        const query = patientId ? `?subject=Patient/${patientId}` : '';
        const bundle = await this._request('GET', `DocumentReference${query}`);
        if (bundle.entry) return bundle.entry.map(e => e.resource);
        return Array.isArray(bundle) ? bundle : [bundle];
      },
      () => this.fallbackProvider.getDocumentReferences(patientId)
    );
  }

  async createDocumentReference(docData) {
    return this._executeWithFallback(
      'createDocumentReference',
      async () => await this._request('POST', 'DocumentReference', docData),
      () => this.fallbackProvider.createDocumentReference(docData)
    );
  }

  reset() {
    this.fallbackProvider.reset();
  }
}

module.exports = FhirHealthcareProvider;
