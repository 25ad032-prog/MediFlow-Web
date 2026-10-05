import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { soundFx } from '../utils/sound';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('patient'); // 'patient' | 'doctor'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [patient, setPatient] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState('doc-1');
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Persistent Notification Center State
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadNotifCount(res.data.filter(n => !n.read).length);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  }, []);

  const loadCurrentUser = useCallback(async () => {
    try {
      const meRes = await api.getMe();
      if (meRes.success && meRes.user) {
        setUser(meRes.user);
        setRole(meRes.user.role);
        setIsAuthenticated(true);
        if (meRes.patient) setPatient(meRes.patient);
        if (meRes.doctor) {
          setCurrentDoctor(meRes.doctor);
          setSelectedDoctorId(meRes.doctor.id);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setPatient(null);
        setCurrentDoctor(null);
      }
    } catch (err) {
      console.warn('Initial session check resolved to unauthenticated', err);
      setUser(null);
      setIsAuthenticated(false);
      setPatient(null);
      setCurrentDoctor(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  // Load Doctor Details when selectedDoctorId changes
  useEffect(() => {
    async function loadDoctor() {
      if (selectedDoctorId) {
        try {
          const res = await api.getDoctorById(selectedDoctorId);
          if (res.success) setCurrentDoctor(res.data);
        } catch (e) {}
      }
    }
    loadDoctor();
  }, [selectedDoctorId]);

  const switchRole = async (newRole) => {
    setRole(newRole);
    if (isAuthenticated) {
      fetchNotifications();
    }
  };

  const switchDoctor = async (docId) => {
    setSelectedDoctorId(docId);
    try {
      const res = await api.getDoctorById(docId);
      if (res.success) setCurrentDoctor(res.data);
    } catch (e) {}
  };

  const login = async (email, password, requestedRole) => {
    try {
      const res = await api.login({ email, password, requestedRole });
      if (res.success) {
        setUser(res.user);
        setRole(res.user.role);
        setIsAuthenticated(true);
        if (res.patient) setPatient(res.patient);
        if (res.doctor) {
          setCurrentDoctor(res.doctor);
          setSelectedDoctorId(res.doctor.id);
        }
        await fetchNotifications();
        soundFx.playSuccessAlert();
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: 'Server communication error. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.register(userData);
      if (res.success) {
        setUser(res.user);
        setRole(res.user.role);
        setIsAuthenticated(true);
        if (res.patient) setPatient(res.patient);
        await fetchNotifications();
        soundFx.playSuccessAlert();
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: 'Registration network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {}
    setUser(null);
    setIsAuthenticated(false);
    setNotifications([]);
    setUnreadNotifCount(0);
  };

  const quickDemoLogin = async (profileKey) => {
    if (profileKey === 'rahul' || profileKey === 'patient') {
      return await login('patient@mediflow.demo', 'Patient@123', 'patient');
    } else if (profileKey === 'priya' || profileKey === 'doctor') {
      return await login('doctor@mediflow.demo', 'Doctor@123', 'doctor');
    } else if (profileKey === 'meera') {
      return await login('meera.sharma@mediflow.io', 'Meera@123', 'patient');
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadNotifCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotifCount(0);
    } catch (e) {}
  };

  const dismissNotification = async (id) => {
    try {
      await api.dismissNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadNotifCount(prev => Math.max(0, notifications.filter(n => n.id !== id && !n.read).length));
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
        loading,
        notifications,
        unreadNotifCount,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification
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
