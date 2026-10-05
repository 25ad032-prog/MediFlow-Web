import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { api } from '../../utils/api';
import PatientConsultationDrawer from './PatientConsultationDrawer';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Sparkles, 
  UserCheck, 
  ArrowRight,
  Stethoscope,
  ChevronRight,
  FileText,
  RotateCcw,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function DoctorDashboard() {
  const { currentDoctor, selectedDoctorId, switchDoctor } = useAuth();
  const { queues, fetchQueue } = useQueue();
  const [allDoctors, setAllDoctors] = useState([]);
  const [selectedPatientApt, setSelectedPatientApt] = useState(null);
  const [isCompletingQueue, setIsCompletingQueue] = useState(false);
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getDoctors();
        if (res.success) setAllDoctors(res.data);
      } catch (e) {}
    }
    load();
  }, []);

  const loadDoctorData = async () => {
    setLoading(true);
    try {
      await fetchQueue(selectedDoctorId);
      const res = await api.getAppointments({ doctorId: selectedDoctorId });
      if (res.success) setAllAppointments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorData();
  }, [selectedDoctorId]);

  const queueData = queues[selectedDoctorId] || {
    nowConsulting: null,
    waitingList: [],
    waitingCount: 0,
    completedToday: 7,
    totalToday: 24,
    totalEstimatedWaitMinutes: 54,
    avgDuration: currentDoctor?.averageDurationMinutes || 18
  };

  const handleCompleteCurrentConsultation = async () => {
    setIsCompletingQueue(true);
    try {
      const res = await api.completeConsultation(selectedDoctorId, {});
      if (res.success) {
        await loadDoctorData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompletingQueue(false);
    }
  };

  const handleCompleteWithNotes = async (aptId, notes, summary) => {
    try {
      await api.completeConsultation(selectedDoctorId, {
        appointmentId: aptId,
        doctorNotes: notes,
        consultationSummary: summary
      });
      await loadDoctorData();
    } catch (err) {
      console.error(err);
    }
  };

  const nowConsulting = queueData.nowConsulting;
  const waitingList = queueData.waitingList || [];
  const nextPatient = waitingList.length > 0 ? waitingList[0] : (nowConsulting || null);

  const completedCount = 7 + (queueData.completedToday > 0 ? queueData.completedToday : 0);
  const waitingCount = waitingList.length;
  const totalToday = completedCount + waitingCount + (nowConsulting ? 1 : 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* Doctor Header & Station Switcher */}
      <div className="glass-surface rounded-3xl p-6 sm:p-7 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm bg-white/95">
        <div className="flex items-center gap-4">
          <img
            src={currentDoctor?.avatar || "https://images.unsplash.com/photo-1594824813515-998858348b6c?auto=format&fit=crop&q=80&w=400"}
            alt={currentDoctor?.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Good morning, {currentDoctor?.name || 'Dr. Priya'} 👋
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Here's your schedule and patient queue for today • {currentDoctor?.specialty}
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto flex items-center gap-2">
          <select
            value={selectedDoctorId}
            onChange={(e) => switchDoctor(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs text-slate-700 bg-slate-50 border border-slate-200 font-semibold"
          >
            {allDoctors.map(doc => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.specialty})
              </option>
            ))}
          </select>
          
          <button
            onClick={loadDoctorData}
            title="Refresh Queue"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Compact Metrics Overview: Patients, Waiting, Completed, Average Wait */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Today's Patients</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{totalToday}</p>
          <span className="text-[11px] text-slate-500">Scheduled consultations</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Waiting</span>
          <p className="text-3xl font-black text-amber-800 mt-1">{waitingCount}</p>
          <span className="text-[11px] text-slate-500">In virtual queue</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">Completed</span>
          <p className="text-3xl font-black text-teal-800 mt-1">{completedCount}</p>
          <span className="text-[11px] text-teal-700 font-semibold">Consultations finished</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">Average Wait</span>
          <p className="text-3xl font-black text-sky-800 mt-1">{currentDoctor?.averageDurationMinutes || 18} <span className="text-sm font-normal text-slate-400">min</span></p>
          <span className="text-[11px] text-slate-500">Per patient consultation</span>
        </div>
      </div>

      {/* Main LIVE QUEUE Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Live Queue Timeline */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="glass-surface rounded-3xl p-6 sm:p-7 border border-slate-200 space-y-5 bg-white/95 shadow-sm">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Live Patient Queue</h2>
                <p className="text-xs text-slate-500">Real-time consultation queue controller</p>
              </div>

              {/* Complete Consultation Trigger */}
              <button
                onClick={handleCompleteCurrentConsultation}
                disabled={isCompletingQueue || (!nowConsulting && waitingList.length === 0)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
              >
                <CheckCircle2 className={`w-4 h-4 ${isCompletingQueue ? 'animate-spin' : ''}`} />
                <span>{isCompletingQueue ? 'Updating Line...' : '[ Complete Consultation ]'}</span>
              </button>
            </div>

            {/* Prominent Active / Consulting Card */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-teal-700 flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping"></span>
                <span>NOW CONSULTING</span>
              </span>

              {nowConsulting ? (
                <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
                      #1
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {nowConsulting.patientName} <span className="text-xs font-normal text-slate-500">({nowConsulting.tokenNumber})</span>
                      </h4>
                      <p className="text-xs text-teal-800 font-semibold mt-0.5">
                        Slot: {nowConsulting.time} • Age: {nowConsulting.patientAge || 54}y
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Reason: {nowConsulting.reason}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPatientApt(nowConsulting)}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 shadow-sm flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      <span>Open Workspace</span>
                    </button>
                    
                    <button
                      onClick={handleCompleteCurrentConsultation}
                      disabled={isCompletingQueue}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm"
                    >
                      Complete & Call Next
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs text-center">
                  No active consultation in chamber. Click Complete to call next waiting patient.
                </div>
              )}
            </div>

            {/* Vertical Timeline of Queue */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Upcoming Queue Timeline ({waitingList.length})
              </h3>

              {waitingList.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                  No patients currently waiting in queue.
                </div>
              ) : (
                <div className="space-y-2">
                  {waitingList.map((item, index) => {
                    const posNum = index + (nowConsulting ? 2 : 1);
                    const hasAi = item.aiPreConsultation && item.aiPreConsultation.completed;

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 flex items-center justify-between gap-4 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                            #{posNum}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-slate-900 text-sm">
                                {item.patientName}
                              </h5>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {item.tokenNumber}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{item.reason}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {hasAi && (
                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                              ✓ AI Intake Done
                            </span>
                          )}

                          <button
                            onClick={() => setSelectedPatientApt(item)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                          >
                            Open File
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: NEXT PATIENT Highlight Box & Today's Completed List */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* NEXT PATIENT Prominent Card */}
          <div className="glass-surface rounded-3xl p-6 border border-teal-200 bg-teal-50/40 space-y-4 shadow-sm">
            <span className="text-xs font-black uppercase tracking-widest text-teal-800 block">
              NEXT PATIENT
            </span>

            {nextPatient ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{nextPatient.patientName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Age: <strong>{nextPatient.patientAge || 28}</strong> • Token: <strong className="font-mono text-teal-700">{nextPatient.tokenNumber}</strong>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-teal-100 space-y-1.5 text-xs shadow-sm">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pre-consultation summary</span>
                  <div className="flex items-center gap-1.5 text-teal-700 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ Available for review</span>
                  </div>
                  {nextPatient.aiPreConsultation?.completed && (
                    <p className="text-[11px] text-slate-600 mt-1 italic">
                      "{nextPatient.aiPreConsultation.chiefComplaint}" ({nextPatient.aiPreConsultation.duration}, {nextPatient.aiPreConsultation.severity})
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setSelectedPatientApt(nextPatient)}
                  className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <span>[ Open Clinical Workspace ]</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                No upcoming patients in queue.
              </div>
            )}
          </div>

          {/* Completed Appointments Today */}
          <div className="glass-surface rounded-3xl p-6 border border-slate-200 space-y-3 bg-white/95">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Completed Today ({allAppointments.filter(a => a.status === 'completed').length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allAppointments.filter(a => a.status === 'completed').map(a => (
                <div
                  key={a.id}
                  onClick={() => setSelectedPatientApt(a)}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 cursor-pointer text-xs flex justify-between items-center transition-all"
                >
                  <div>
                    <p className="font-bold text-slate-900">{a.patientName}</p>
                    <p className="text-[10px] text-slate-500">{a.reason}</p>
                  </div>
                  <span className="text-[10px] text-teal-700 font-bold">✓ Done</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Patient Consultation Drawer */}
      {selectedPatientApt && (
        <PatientConsultationDrawer
          patientApt={selectedPatientApt}
          doctor={currentDoctor}
          onClose={() => setSelectedPatientApt(null)}
          onCompleteConsultation={handleCompleteWithNotes}
        />
      )}

    </div>
  );
}
