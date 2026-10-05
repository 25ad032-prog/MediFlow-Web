import React, { useState } from 'react';
import { useQueue } from '../../context/QueueContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Calendar, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Stethoscope,
  ChevronRight,
  HeartPulse
} from 'lucide-react';

export default function PatientHome({ onNavigate, onOpenAiChat, onSelectDoctor }) {
  const { patient } = useAuth();
  const { queues, activeAppointment } = useQueue();
  const [quickSearch, setQuickSearch] = useState('');

  // Default demo appointment if none booked yet
  const apt = activeAppointment || {
    id: "apt-demo-default",
    doctorId: "doc-1",
    doctorName: "Dr. Priya Sharma",
    doctorSpecialty: "Cardiologist",
    tokenNumber: "Q-04",
    queuePosition: 4,
    time: "11:30 AM",
    date: "Today",
    status: "waiting",
    aiPreConsultation: { completed: false }
  };

  const doctorQueue = queues[apt.doctorId] || null;
  const isNowConsulting = apt.status === 'now_consulting' || (doctorQueue?.nowConsulting?.id === apt.id);
  const queuePos = isNowConsulting ? 1 : (apt.queuePosition || 4);
  const patientsAhead = isNowConsulting ? 0 : Math.max(0, queuePos - 1);
  const avgDuration = doctorQueue?.avgDuration || 18;
  const estWait = isNowConsulting ? 0 : (patientsAhead * avgDuration || 32);

  const patientName = patient?.name?.split(' ')[0] || "Hasini";
  const aiDone = apt?.aiPreConsultation?.completed;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onNavigate('search', quickSearch);
  };

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      
      {/* Editorial Split Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center pt-2 sm:pt-4">
        
        {/* Left Column: Greeting, Headline, Search, Primary Actions */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              <span>Good morning, {patientName}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Your appointment.<br />
              <span className="bg-gradient-to-r from-teal-600 via-teal-700 to-sky-700 bg-clip-text text-transparent">
                Your time.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed pt-1">
              Find the right doctor, join the queue remotely, and know precisely when it's your turn without hospital waiting room stress.
            </p>
          </div>

          {/* Quick Doctor & Symptom Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Search by doctor, specialty, or symptom..."
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl glass-input text-sm text-slate-900 placeholder-slate-400 shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => onNavigate('search')}
              className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <span>Find a Doctor</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('history')}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold text-sm shadow-sm transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>View Appointments</span>
            </button>
          </div>

          {/* Value Props Row */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200/80 max-w-xl">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-900">Zero Wait</p>
              <p className="text-[11px] text-slate-500">Wait from home lounge</p>
            </div>
            <div className="space-y-0.5 border-l border-slate-200 pl-3">
              <p className="text-sm font-bold text-slate-900">Dynamic Wait</p>
              <p className="text-[11px] text-slate-500">Real-time sync calculation</p>
            </div>
            <div className="space-y-0.5 border-l border-slate-200 pl-3">
              <p className="text-sm font-bold text-slate-900">AI Intake</p>
              <p className="text-[11px] text-slate-500">Safety-compliant intake</p>
            </div>
          </div>

        </div>

        {/* Right Column: Floating Glass "Next Appointment" Experience */}
        <div className="lg:col-span-5">
          <div className="glass-surface rounded-3xl p-6 sm:p-7 border border-slate-200/90 space-y-6 shadow-card hover:shadow-card-hover transition-all relative overflow-hidden">
            
            {/* Ambient Background Accent */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-100/60 rounded-full blur-2xl pointer-events-none"></div>

            {/* Top Appointment Header */}
            <div className="flex items-start justify-between relative">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-teal-700 block">
                  NEXT APPOINTMENT
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {apt.doctorName}
                </h3>
                <p className="text-xs font-semibold text-teal-700">
                  {apt.doctorSpecialty}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 block">{apt.date || "Today"}</span>
                <span className="text-xs font-semibold text-slate-500">{apt.time || "11:30 AM"}</span>
              </div>
            </div>

            {/* Core Live Queue Highlight Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 text-white space-y-4 shadow-md relative">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400">
                  YOUR QUEUE
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-semibold border border-teal-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
                  <span>Doctor: In consultation</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <span className="text-4xl sm:text-5xl font-black text-teal-300 font-mono tracking-tight">
                    {isNowConsulting ? "NOW" : (apt.tokenNumber || "#04")}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    {isNowConsulting ? "Your turn has arrived!" : `${patientsAhead} patients ahead`}
                  </p>
                </div>

                <div className="border-l border-slate-800 pl-4 space-y-0.5">
                  <span className="text-[11px] text-slate-400 block font-medium">Estimated wait:</span>
                  <span className="text-2xl font-black text-white block">
                    ~{estWait} min
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Live dynamic calculation
                  </span>
                </div>
              </div>

              {/* Visual Queue Stepper: Completed ● ─ ● ─ ● ── Current ◎ ── Upcoming ○ ─ ○ */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-medium">
                  <span>Completed</span>
                  <span className="text-teal-400 font-bold">You are here (#{queuePos})</span>
                  <span>Upcoming</span>
                </div>

                <div className="flex items-center justify-between gap-1.5">
                  {/* #1 Completed */}
                  <div className="flex-1 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-slate-600 flex items-center justify-center text-[7px] text-white">✓</span>
                    <span className="flex-1 h-0.5 bg-slate-700"></span>
                  </div>
                  {/* #2 Completed */}
                  <div className="flex-1 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-slate-600 flex items-center justify-center text-[7px] text-white">✓</span>
                    <span className="flex-1 h-0.5 bg-slate-700"></span>
                  </div>
                  {/* #3 Completed */}
                  <div className="flex-1 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-slate-600 flex items-center justify-center text-[7px] text-white">✓</span>
                    <span className="flex-1 h-0.5 bg-teal-500"></span>
                  </div>
                  {/* #4 Current Active Patient */}
                  <div className="flex-1 flex items-center">
                    <span className="w-5 h-5 rounded-full bg-teal-400 text-slate-950 font-black flex items-center justify-center text-[10px] shadow-glow-teal animate-pulse">
                      {queuePos}
                    </span>
                    <span className="flex-1 h-0.5 bg-slate-700"></span>
                  </div>
                  {/* #5 Upcoming */}
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full border border-slate-600 bg-slate-900"></span>
                  </div>
                </div>
              </div>

            </div>

            {/* AI Pre-Consultation Intake Status Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {aiDone ? "AI Pre-Consultation Completed" : "AI Pre-Consultation"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {aiDone ? "Intake transmitted to Dr. Priya" : "Save doctor time by recording symptoms"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenAiChat(apt)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shrink-0"
              >
                {aiDone ? "View Intake" : "Start Intake"}
              </button>
            </div>

            {/* Primary Action Button: Enter Waiting Room */}
            <button
              onClick={() => onNavigate('waiting_room')}
              className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
            >
              <span>Enter Virtual Waiting Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        </div>

      </div>

      {/* Featured Medical Specialties Overview */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Explore by Medical Specialty</h2>
            <p className="text-xs text-slate-500 mt-0.5">Consult with verified top hospital specialists</p>
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
          >
            <span>View all 8 specialties</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { name: 'Cardiology', icon: '❤️', doctors: '2 specialists', wait: '~18 min' },
            { name: 'Dermatology', icon: '✨', doctors: '1 specialist', wait: '~12 min' },
            { name: 'Neurology', icon: '🧠', doctors: '1 specialist', wait: '~20 min' },
            { name: 'Orthopedics', icon: '🦴', doctors: '1 specialist', wait: '~15 min' }
          ].map((spec) => (
            <div
              key={spec.name}
              onClick={() => onNavigate('search', spec.name)}
              className="p-4 rounded-2xl glass-surface hover:bg-white border border-slate-200/80 hover:border-teal-300 cursor-pointer transition-all space-y-2 group shadow-sm hover:shadow"
            >
              <div className="text-2xl">{spec.icon}</div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
                  {spec.name}
                </h4>
                <p className="text-[11px] text-slate-500">{spec.doctors} • Avg {spec.wait}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
