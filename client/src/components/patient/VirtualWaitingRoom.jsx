import React, { useState, useEffect } from 'react';
import { useQueue } from '../../context/QueueContext';
import { api } from '../../utils/api';
import LiveQueueVisualizer from '../queue/LiveQueueVisualizer';
import { 
  Activity, 
  Clock, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Video, 
  FileText, 
  ShieldAlert, 
  ChevronRight,
  ArrowLeft,
  Bell,
  Stethoscope,
  HeartPulse,
  PhoneCall
} from 'lucide-react';

export default function VirtualWaitingRoom({ appointment, onOpenAiChat, onBack, onOpenReport }) {
  const { queues, activeAppointment, setActiveAppointment } = useQueue();
  const [currentApt, setCurrentApt] = useState(appointment || activeAppointment);

  useEffect(() => {
    if (activeAppointment) {
      setCurrentApt(activeAppointment);
    } else if (appointment) {
      setCurrentApt(appointment);
    }
  }, [activeAppointment, appointment]);

  if (!currentApt) {
    return (
      <div className="glass-surface rounded-3xl p-12 text-center max-w-xl mx-auto border border-slate-200">
        <Clock className="w-12 h-12 text-teal-600 mx-auto mb-4 animate-spin opacity-50" />
        <h2 className="text-xl font-bold text-slate-900">No Active Waiting Room Session</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          Book an appointment with any specialist to enter their live virtual waiting room.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm"
        >
          Explore Available Doctors
        </button>
      </div>
    );
  }

  const doctorQueue = queues[currentApt.doctorId] || null;
  const isNowConsulting = currentApt.status === 'now_consulting' || currentApt.queueState === 'IN_CONSULTATION' || (doctorQueue?.nowConsulting?.id === currentApt.id);
  const isCalled = currentApt.queueState === 'CALLED' || (doctorQueue?.calledPatient?.id === currentApt.id);
  const isCompleted = currentApt.status === 'completed' || currentApt.queueState === 'COMPLETED';
  
  const queuePos = isNowConsulting ? 1 : (currentApt.queuePosition || 4);
  const patientsAhead = isNowConsulting ? 0 : Math.max(0, queuePos - 1);
  const avgDuration = doctorQueue?.avgDuration || 18;
  const estWait = (isNowConsulting || isCalled) ? 0 : (patientsAhead * avgDuration || 32);

  const aiDone = currentApt.aiPreConsultation && currentApt.aiPreConsultation.completed;

  // Queue State Banner Text
  let queueStateMessage = "You're in the queue. Relax from home while MediFlow monitors your place.";
  let queueStateBadge = "⏳ WAITING IN QUEUE";
  let queueStateBadgeColor = "bg-amber-50 text-amber-800 border-amber-200";

  if (isCompleted) {
    queueStateMessage = "Your consultation is completed. Your clinical report has been generated.";
    queueStateBadge = "✓ CONSULTATION COMPLETED";
    queueStateBadgeColor = "bg-teal-50 text-teal-800 border-teal-200";
  } else if (isNowConsulting) {
    queueStateMessage = "Consultation is currently in progress with physician.";
    queueStateBadge = "🟢 IN CONSULTATION";
    queueStateBadgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200 animate-pulse";
  } else if (isCalled) {
    queueStateMessage = "Doctor is ready for you! It's your turn — please enter the consultation chamber.";
    queueStateBadge = "🔔 IT'S YOUR TURN (CALLED)";
    queueStateBadgeColor = "bg-rose-50 text-rose-800 border-rose-200 animate-bounce";
  } else if (patientsAhead === 1 || queuePos <= 2) {
    queueStateMessage = "You're almost next. Please stay near your screen.";
    queueStateBadge = "⚡ NEAR TURN (1 AHEAD)";
    queueStateBadgeColor = "bg-sky-50 text-sky-800 border-sky-200";
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          <span className="text-teal-800 font-bold">Virtual Waiting Lounge Active</span>
        </div>
      </div>

      {/* Main Virtual Waiting Room Hero Card */}
      <div className="glass-surface rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-8 shadow-card relative overflow-hidden bg-white/95">
        
        {/* Doctor Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold shadow-sm">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-700 block">
                VIRTUAL WAITING ROOM
              </span>
              <h1 className="text-2xl font-black text-slate-900">{currentApt.doctorName}</h1>
              <p className="text-xs font-semibold text-teal-700">
                {currentApt.doctorSpecialty} • {currentApt.time || '04:00 PM'} • {currentApt.location || 'Greams Road'}
              </p>
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold self-start sm:self-auto ${queueStateBadgeColor}`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>{queueStateBadge}</span>
          </div>
        </div>

        {/* Central Circular / Highlight Queue Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Circular Queue Ring on Left */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 text-white shadow-md relative">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 mb-2">
              YOUR POSITION
            </span>
            
            <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-4 border-slate-800 my-2">
              <div className="absolute inset-0 rounded-full border-4 border-teal-400 border-t-transparent animate-spin-slow"></div>
              <div className="text-center">
                <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  {isNowConsulting ? "NOW" : (isCalled ? "TURN" : (currentApt.tokenNumber || `#0${queuePos}`))}
                </span>
                <span className="text-[10px] text-teal-300 block font-bold mt-0.5">
                  {isNowConsulting ? "In Chamber" : (isCalled ? "Step In" : "In Line")}
                </span>
              </div>
            </div>

            <p className="text-xs font-bold text-slate-300 mt-2 text-center">
              {isCompleted ? "Consultation Finished" : (isNowConsulting ? "Doctor is consulting with you" : (isCalled ? "Doctor has called your token!" : `${patientsAhead} patients ahead`))}
            </p>
          </div>

          {/* Key Metrics on Right */}
          <div className="md:col-span-7 space-y-4">
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Wait</span>
                <span className="text-2xl font-black text-slate-900 mt-0.5 block">
                  ~{estWait} minutes
                </span>
                <span className="text-[10px] text-teal-700 font-semibold">
                  * {patientsAhead} ahead × {avgDuration}m avg
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Doctor Status</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">
                  {doctorQueue?.doctorStatus || '🟢 Doctor is available'}
                </span>
                <span className="text-[10px] text-slate-500">
                  Live Clinic Sync
                </span>
              </div>
            </div>

            {/* Notification alert banner */}
            <div className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs ${
              isCalled 
                ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold animate-pulse' 
                : 'bg-teal-50 border-teal-200 text-teal-800'
            }`}>
              <Bell className={`w-4 h-4 shrink-0 ${isCalled ? 'text-rose-600' : 'text-teal-600 animate-pulse'}`} />
              <span>{queueStateMessage}</span>
            </div>

            {/* AI Pre-Consultation Intake CTA Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {aiDone ? "AI Pre-Consultation Ready" : "AI Pre-Consultation"}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {aiDone ? `✓ Transmitted to Dr. ${currentApt.doctorName}` : "Provide chief symptoms before your consultation"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenAiChat(currentApt)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm shrink-0 transition-all"
              >
                {aiDone ? "View Intake" : "[ Start Pre-Consultation ]"}
              </button>
            </div>

          </div>

        </div>

        {/* Dynamic Action Buttons */}
        <div className="pt-2">
          {isCompleted ? (
            <button
              onClick={() => onOpenReport && onOpenReport(currentApt.consultationSummary?.id || 'rep-101')}
              className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-base shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <FileText className="w-5 h-5" />
              <span>[ View Consultation Report & Download PDF ]</span>
            </button>
          ) : (isNowConsulting || isCalled) ? (
            <button
              onClick={() => alert(`Entering Dr. ${currentApt.doctorName}'s consultation room... (Simulation)`)}
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base shadow-sm flex items-center justify-center gap-2 animate-bounce transition-all"
            >
              <Video className="w-5 h-5" />
              <span>[ It's Your Turn — Enter Consultation Chamber ]</span>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <span>[ Enter Consultation Chamber ] (Will activate when your turn arrives)</span>
            </button>
          )}
        </div>

      </div>

      {/* Complete Clinic Live Queue Stream */}
      <div className="glass-surface p-6 rounded-3xl border border-slate-200 space-y-3 bg-white/90">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Live Clinic Queue Stream
          </h3>
          <span className="text-[11px] text-teal-700 font-semibold">● Real-time synchronized</span>
        </div>
        <LiveQueueVisualizer
          queue={doctorQueue}
          currentPatientId={currentApt.patientId}
        />
      </div>

    </div>
  );
}
