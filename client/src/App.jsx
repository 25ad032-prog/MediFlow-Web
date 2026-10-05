import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useQueue } from './context/QueueContext';
import { api } from './utils/api';
import Navbar from './components/common/Navbar';
import NotificationToast from './components/common/NotificationToast';
import AuthPage from './components/auth/AuthPage';
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
import ConsultationReportModal from './components/patient/ConsultationReportModal';
import { Activity } from 'lucide-react';

export default function App() {
  const { role, isAuthenticated, loading } = useAuth();
  const { queues, activeAppointment, setActiveAppointment } = useQueue();

  // Navigation tab for patient web portal: 'home' | 'search' | 'waiting_room' | 'history' | 'vault' | 'family' | 'profile'
  const [patientTab, setPatientTab] = useState('home');
  const [initialSearchQuery, setInitialSearchQuery] = useState('');
  const [initialSearchLocation, setInitialSearchLocation] = useState('All');
  
  // Modals & Active Selections
  const [selectedDoctorForProfile, setSelectedDoctorForProfile] = useState(null);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [activeChatApt, setActiveChatApt] = useState(null);
  const [activeReportModal, setActiveReportModal] = useState(null);

  // Load family members for booking only when authenticated
  useEffect(() => {
    async function loadFamily() {
      if (!isAuthenticated) return;
      try {
        const res = await api.getFamilyMembers();
        if (res.success) setFamilyMembers(res.data);
      } catch (e) {}
    }
    loadFamily();
  }, [isAuthenticated]);

  const handleBookNow = (doctor) => {
    setSelectedDoctorForProfile(null);
    setSelectedDoctorForBooking(doctor);
  };

  const handleBookingSuccess = (newApt) => {
    setActiveAppointment(newApt);
    setPatientTab('waiting_room');
  };

  const handleNavigateFromHome = (tab, query = '', location = 'All') => {
    if (query) setInitialSearchQuery(query);
    if (location) setInitialSearchLocation(location);
    setPatientTab(tab);
  };

  const handleOpenReportById = async (reportId) => {
    try {
      const res = await api.getConsultationReportById(reportId || 'rep-101');
      if (res.success) {
        setActiveReportModal(res.data);
      }
    } catch (e) {}
  };

  // State 1: Checking Authentication Session Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-teal-500 selection:text-white">
        <div className="w-16 h-16 rounded-3xl bg-teal-600 text-white flex items-center justify-center shadow-xl shadow-teal-600/20 animate-bounce mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">DOCBEE MEDIFLOW</h2>
          <p className="text-xs text-slate-500 flex items-center justify-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  // State 2: Unauthenticated Visitor -> Dedicated Sign In & Registration Page
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // State 3: Authenticated User -> Main Web Application Experience
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-teal-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar 
        activeTab={patientTab} 
        onSelectTab={(tab) => {
          setInitialSearchQuery('');
          setPatientTab(tab);
        }}
        onOpenReport={handleOpenReportById}
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
                onOpenReport={handleOpenReportById}
              />
            )}

            {patientTab === 'search' && (
              <DoctorSearch
                initialQuery={initialSearchQuery}
                initialLocation={initialSearchLocation}
                onSelectDoctor={(doc) => setSelectedDoctorForProfile(doc)}
                onBookDoctor={(doc) => handleBookNow(doc)}
              />
            )}

            {patientTab === 'waiting_room' && (
              <VirtualWaitingRoom
                appointment={activeAppointment}
                onOpenAiChat={(apt) => setActiveChatApt(apt)}
                onBack={() => setPatientTab('home')}
                onOpenReport={handleOpenReportById}
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

            {patientTab === 'vault' && (
              <DocumentVault onOpenReportModal={setActiveReportModal} />
            )}

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

      {activeReportModal && (
        <ConsultationReportModal
          report={activeReportModal}
          onClose={() => setActiveReportModal(null)}
        />
      )}

    </div>
  );
}
