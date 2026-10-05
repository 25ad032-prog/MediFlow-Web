import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useQueue } from './context/QueueContext';
import { api } from './utils/api';
import Navbar from './components/common/Navbar';
import NotificationToast from './components/common/NotificationToast';
import PatientHome from './components/patient/PatientHome';
import DoctorSearch from './components/patient/DoctorSearch';
import DoctorProfileModal from './components/patient/DoctorProfileModal';
import BookingModal from './components/patient/BookingModal';
import VirtualWaitingRoom from './components/patient/VirtualWaitingRoom';
import AppointmentHistory from './components/patient/AppointmentHistory';
import DocumentVault from './components/patient/DocumentVault';
import FamilyProfiles from './components/patient/FamilyProfiles';
import PatientProfile from './components/patient/PatientProfile';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import PreConsultationChatModal from './components/ai/PreConsultationChatModal';

export default function App() {
  const { role } = useAuth();
  const { queues, activeAppointment, setActiveAppointment } = useQueue();

  // Navigation tab for patient web portal: 'home' | 'search' | 'waiting_room' | 'history' | 'vault' | 'family' | 'profile'
  const [patientTab, setPatientTab] = useState('home');
  const [initialSearchQuery, setInitialSearchQuery] = useState('');
  
  // Modals & Active Selections
  const [selectedDoctorForProfile, setSelectedDoctorForProfile] = useState(null);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [activeChatApt, setActiveChatApt] = useState(null);

  // Load family members for booking
  useEffect(() => {
    async function loadFamily() {
      try {
        const res = await api.getFamilyMembers();
        if (res.success) setFamilyMembers(res.data);
      } catch (e) {}
    }
    loadFamily();
  }, []);

  const handleBookNow = (doctor) => {
    setSelectedDoctorForProfile(null);
    setSelectedDoctorForBooking(doctor);
  };

  const handleBookingSuccess = (newApt) => {
    setActiveAppointment(newApt);
    setPatientTab('waiting_room');
  };

  const handleNavigateFromHome = (tab, query = '') => {
    if (query) setInitialSearchQuery(query);
    setPatientTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-teal-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar 
        activeTab={patientTab} 
        onSelectTab={(tab) => {
          setInitialSearchQuery('');
          setPatientTab(tab);
        }} 
      />

      {/* Global Notifications Toast */}
      <NotificationToast />

      {/* Main Responsive Web Application Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
        {role === 'doctor' ? (
          /* DOCTOR CLINICAL WORKSPACE */
          <DoctorDashboard />
        ) : (
          /* PATIENT HEALTHCARE PORTAL */
          <div className="space-y-6">
            
            {patientTab === 'home' && (
              <PatientHome 
                onNavigate={handleNavigateFromHome}
                onOpenAiChat={(apt) => setActiveChatApt(apt)}
                onSelectDoctor={(doc) => setSelectedDoctorForProfile(doc)}
              />
            )}

            {patientTab === 'search' && (
              <DoctorSearch
                initialQuery={initialSearchQuery}
                onSelectDoctor={(doc) => setSelectedDoctorForProfile(doc)}
                onBookDoctor={(doc) => handleBookNow(doc)}
              />
            )}

            {patientTab === 'waiting_room' && (
              <VirtualWaitingRoom
                appointment={activeAppointment}
                onOpenAiChat={(apt) => setActiveChatApt(apt)}
                onBack={() => setPatientTab('home')}
              />
            )}

            {patientTab === 'history' && (
              <AppointmentHistory
                onOpenWaitingRoom={(apt) => {
                  setActiveAppointment(apt);
                  setPatientTab('waiting_room');
                }}
                onOpenAiChat={(apt) => setActiveChatApt(apt)}
              />
            )}

            {patientTab === 'vault' && <DocumentVault />}

            {patientTab === 'family' && <FamilyProfiles />}

            {patientTab === 'profile' && <PatientProfile />}

          </div>
        )}
      </main>

      {/* Global Modals */}
      {selectedDoctorForProfile && (
        <DoctorProfileModal
          doctor={selectedDoctorForProfile}
          queueData={queues[selectedDoctorForProfile.id]}
          onClose={() => setSelectedDoctorForProfile(null)}
          onBookNow={handleBookNow}
        />
      )}

      {selectedDoctorForBooking && (
        <BookingModal
          doctor={selectedDoctorForBooking}
          familyMembers={familyMembers}
          onClose={() => setSelectedDoctorForBooking(null)}
          onBookingSuccess={handleBookingSuccess}
          onOpenWaitingRoom={(apt) => {
            setActiveAppointment(apt);
            setPatientTab('waiting_room');
          }}
          onOpenAiChat={(apt) => setActiveChatApt(apt)}
        />
      )}

      {activeChatApt && (
        <PreConsultationChatModal
          appointment={activeChatApt}
          onClose={() => setActiveChatApt(null)}
          onSuccess={(summary) => {
            if (activeAppointment?.id === activeChatApt.id) {
              setActiveAppointment(prev => ({ ...prev, aiPreConsultation: summary }));
            }
          }}
        />
      )}

    </div>
  );
}
