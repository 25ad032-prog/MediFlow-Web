// DOCBEE Centralized REST API client

const API_BASE = '/api';

export const api = {
  // Doctors
  async getDoctors(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/doctors${query ? `?${query}` : ''}`);
    return res.json();
  },

  async getDoctorById(id) {
    const res = await fetch(`${API_BASE}/doctors/${id}`);
    return res.json();
  },

  // Appointments
  async getAppointments(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/appointments${query ? `?${query}` : ''}`);
    return res.json();
  },

  async getAppointmentById(id) {
    const res = await fetch(`${API_BASE}/appointments/${id}`);
    return res.json();
  },

  async bookAppointment(payload) {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Queue
  async getDoctorQueue(doctorId) {
    const res = await fetch(`${API_BASE}/queue/${doctorId}`);
    return res.json();
  },

  async callNextPatient(doctorId) {
    const res = await fetch(`${API_BASE}/queue/${doctorId}/call-next`, {
      method: 'POST'
    });
    return res.json();
  },

  async completeConsultation(doctorId, payload = {}) {
    const res = await fetch(`${API_BASE}/queue/${doctorId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // AI Services
  async submitPreConsultation(payload) {
    const res = await fetch(`${API_BASE}/ai/pre-consultation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async generateConsultationSummary(payload) {
    const res = await fetch(`${API_BASE}/ai/generate-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Patient, Family & Documents
  async getPatientProfile() {
    const res = await fetch(`${API_BASE}/patient/profile`);
    return res.json();
  },

  async updatePatientProfile(data) {
    const res = await fetch(`${API_BASE}/patient/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getFamilyMembers() {
    const res = await fetch(`${API_BASE}/family`);
    return res.json();
  },

  async addFamilyMember(member) {
    const res = await fetch(`${API_BASE}/family`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    });
    return res.json();
  },

  async getDocuments() {
    const res = await fetch(`${API_BASE}/documents`);
    return res.json();
  },

  async uploadDocument(doc) {
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc)
    });
    return res.json();
  },

  async toggleDocumentShare(docId) {
    const res = await fetch(`${API_BASE}/documents/${docId}/toggle-share`, {
      method: 'PATCH'
    });
    return res.json();
  },

  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`);
    return res.json();
  },

  async resetDemo() {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
    return res.json();
  }
};
