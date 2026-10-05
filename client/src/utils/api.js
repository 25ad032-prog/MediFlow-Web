// DOCBEE Centralized REST API client with credentials support

const API_BASE = '/api';

export const api = {
  // Authentication
  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  async logout() {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include'
    });
    return res.json();
  },

  // Locations
  async getLocations() {
    const res = await fetch(`${API_BASE}/locations`, {
      credentials: 'include'
    });
    return res.json();
  },

  // Doctors
  async getDoctors(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/doctors${query ? `?${query}` : ''}`, {
      credentials: 'include'
    });
    return res.json();
  },

  async getDoctorById(id) {
    const res = await fetch(`${API_BASE}/doctors/${id}`, {
      credentials: 'include'
    });
    return res.json();
  },

  // Appointments
  async getAppointments(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/appointments${query ? `?${query}` : ''}`, {
      credentials: 'include'
    });
    return res.json();
  },

  async getAppointmentById(id) {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      credentials: 'include'
    });
    return res.json();
  },

  async bookAppointment(payload) {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Queue
  async getDoctorQueue(doctorId) {
    const res = await fetch(`${API_BASE}/queue/${doctorId}`, {
      credentials: 'include'
    });
    return res.json();
  },

  async callNextPatient(doctorId) {
    const res = await fetch(`${API_BASE}/queue/${doctorId}/call-next`, {
      method: 'POST',
      credentials: 'include'
    });
    return res.json();
  },

  async startConsultation(doctorId, payload = {}) {
    const res = await fetch(`${API_BASE}/queue/${doctorId}/start-consultation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async completeConsultation(doctorId, payload = {}) {
    const res = await fetch(`${API_BASE}/queue/${doctorId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Consultation Reports & PDF
  async getConsultationReports() {
    const res = await fetch(`${API_BASE}/consultations/reports`, {
      credentials: 'include'
    });
    return res.json();
  },

  async getConsultationReportById(id) {
    const res = await fetch(`${API_BASE}/consultations/reports/${id}`, {
      credentials: 'include'
    });
    return res.json();
  },

  getConsultationReportPdfUrl(id) {
    return `${API_BASE}/consultations/reports/${id}/pdf`;
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      credentials: 'include'
    });
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      credentials: 'include'
    });
    return res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
      method: 'PATCH',
      credentials: 'include'
    });
    return res.json();
  },

  async dismissNotification(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return res.json();
  },

  // AI Services
  async submitPreConsultation(payload) {
    const res = await fetch(`${API_BASE}/ai/pre-consultation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async generateConsultationSummary(payload) {
    const res = await fetch(`${API_BASE}/ai/generate-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Patient, Family & Documents
  async getPatientProfile() {
    const res = await fetch(`${API_BASE}/patient/profile`, {
      credentials: 'include'
    });
    return res.json();
  },

  async updatePatientProfile(data) {
    const res = await fetch(`${API_BASE}/patient/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getFamilyMembers() {
    const res = await fetch(`${API_BASE}/family`, {
      credentials: 'include'
    });
    return res.json();
  },

  async addFamilyMember(member) {
    const res = await fetch(`${API_BASE}/family`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(member)
    });
    return res.json();
  },

  async getDocuments() {
    const res = await fetch(`${API_BASE}/documents`, {
      credentials: 'include'
    });
    return res.json();
  },

  async uploadDocument(doc) {
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(doc)
    });
    return res.json();
  },

  async toggleDocumentShare(docId) {
    const res = await fetch(`${API_BASE}/documents/${docId}/toggle-share`, {
      method: 'PATCH',
      credentials: 'include'
    });
    return res.json();
  },

  // Demo Reset
  async resetDemo() {
    const res = await fetch(`${API_BASE}/demo/reset`, {
      method: 'POST',
      credentials: 'include'
    });
    return res.json();
  }
};
