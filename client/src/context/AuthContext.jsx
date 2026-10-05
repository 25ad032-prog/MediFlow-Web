import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // role: 'patient' | 'doctor'
  const [role, setRole] = useState('patient');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [patient, setPatient] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState('doc-1');
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [viewMode, setViewMode] = useState('web'); // 'web' | 'mobile' | 'split'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [patRes, docRes] = await Promise.all([
          api.getPatientProfile(),
          api.getDoctorById(selectedDoctorId)
        ]);
        if (patRes.success) setPatient(patRes.data);
        if (docRes.success) setCurrentDoctor(docRes.data);
      } catch (err) {
        console.error('Failed to load initial profile data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedDoctorId]);

  const switchRole = (newRole) => {
    setRole(newRole);
  };

  const switchDoctor = async (docId) => {
    setSelectedDoctorId(docId);
    try {
      const res = await api.getDoctorById(docId);
      if (res.success) setCurrentDoctor(res.data);
    } catch (e) {}
  };

  const login = (email, password) => {
    setIsAuthenticated(true);
    if (email.includes('doctor') || email.includes('priya')) {
      setRole('doctor');
    } else {
      setRole('patient');
    }
    return { success: true };
  };

  const register = (userData) => {
    setIsAuthenticated(true);
    setRole('patient');
    setPatient({
      id: `pat-${Date.now()}`,
      name: userData.name || "Demo Patient",
      age: userData.age || 28,
      gender: userData.gender || "Female",
      phone: userData.phone || "+91 98765 00000",
      email: userData.email || "patient@mediflow.io",
      bloodGroup: userData.bloodGroup || "O+",
      address: "Bangalore, India",
      emergencyContact: "Family Contact",
      medicalAlerts: ["None reported"]
    });
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const quickDemoLogin = (profileKey) => {
    setIsAuthenticated(true);
    if (profileKey === 'rahul') {
      setRole('patient');
      setPatient({
        id: "pat-1",
        name: "Rahul Sharma",
        age: 31,
        gender: "Male",
        phone: "+91 98765 43210",
        email: "rahul.sharma@mediflow.io",
        bloodGroup: "O+Positive",
        address: "Flat 402, Green Glen Layout, Bellandur, Bangalore",
        emergencyContact: "Sunita Sharma (Mother)",
        medicalAlerts: ["Mild Penicillin Allergy", "Family History of Hypertension"]
      });
    } else if (profileKey === 'meera') {
      setRole('patient');
      setPatient({
        id: "pat-2",
        name: "Meera Patel",
        age: 28,
        gender: "Female",
        phone: "+91 98123 45678",
        email: "meera.patel@mediflow.io",
        bloodGroup: "A+Positive",
        address: "Koramangala, Bangalore",
        emergencyContact: "Suresh Patel",
        medicalAlerts: ["None reported"]
      });
    } else if (profileKey === 'priya') {
      setRole('doctor');
      setSelectedDoctorId('doc-1');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        switchRole,
        isAuthenticated,
        login,
        register,
        logout,
        quickDemoLogin,
        patient,
        setPatient,
        selectedDoctorId,
        switchDoctor,
        currentDoctor,
        viewMode,
        setViewMode,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
