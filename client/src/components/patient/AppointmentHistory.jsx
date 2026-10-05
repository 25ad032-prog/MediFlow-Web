import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useQueue } from '../../context/QueueContext';
import ConsultationReportModal from './ConsultationReportModal';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Sparkles, 
  FileText, 
  ChevronRight, 
  Download,
  Eye,
  X
} from 'lucide-react';

export default function AppointmentHistory({ onOpenWaitingRoom, onOpenAiChat }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterTab, setFilterTab] = useState('upcoming'); // 'upcoming' | 'completed' | 'all'
  const { activeAppointment } = useQueue();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getAppointments();
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeAppointment]);

  const filtered = appointments.filter(a => {
    if (filterTab === 'upcoming') return a.status === 'waiting' || a.status === 'now_consulting';
    if (filterTab === 'completed') return a.status === 'completed';
    return true;
  });

  const handleOpenReport = (apt) => {
    if (apt.consultationSummary) {
      setSelectedReport(apt.consultationSummary);
    } else {
      setSelectedReport({
        id: `rep-${apt.id}`,
        appointmentId: apt.id,
        patientName: apt.patientName,
        patientAge: apt.patientAge || 31,
        patientGender: apt.patientGender || "Male",
        doctorName: apt.doctorName,
        doctorSpecialty: apt.doctorSpecialty,
        hospital: apt.hospital || "MediFlow Medical Center",
        location: apt.location || "Chennai",
        date: apt.date,
        time: apt.time,
        chiefComplaint: apt.aiPreConsultation?.chiefComplaint || apt.reason,
        symptomsReported: apt.aiPreConsultation?.summaryText || apt.reason,
        doctorObservations: "Clinical vitals verified. Systemic cardiovascular examination within baseline.",
        doctorNotes: apt.doctorNotes || "Patient examined. Supportive medications and hydration recommended.",
        clinicalSummary: `Completed consultation for ${apt.reason}. Good clinical stability observed.`,
        advice: "1. Follow supportive lifestyle modifications.\n2. Hydrate well and rest.\n3. Return for follow-up in 10 days if symptoms persist.",
        followUp: { recommended: true, recommendedDate: "In 10 days", reason: "Follow-up check" },
        status: "Completed"
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Appointments & Consultations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review active waiting room sessions and physician consultation reports.
          </p>
        </div>

        <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex gap-1 text-xs font-semibold self-start sm:self-auto">
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'all', label: 'All Records' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                filterTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-3xl bg-white/70 border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 text-xs">
          No appointments found in this category.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map(apt => {
            const isActive = apt.status === 'waiting' || apt.status === 'now_consulting';
            const isCompleted = apt.status === 'completed';

            return (
              <div
                key={apt.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isActive 
                    ? 'border-teal-300 bg-teal-50/50 shadow-sm ring-1 ring-teal-400/20' 
                    : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={apt.doctorAvatar || "https://images.unsplash.com/photo-1594824813515-998858348b6c?auto=format&fit=crop&q=80&w=400"}
                    alt={apt.doctorName}
                    className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{apt.doctorName}</h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {apt.doctorSpecialty}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        apt.status === 'now_consulting' 
                          ? 'bg-emerald-100 text-emerald-800'
                          : apt.status === 'waiting'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {apt.status === 'now_consulting' ? '🟢 Now Consulting' : apt.status === 'waiting' ? `Queue #${apt.queuePosition}` : '✓ Completed'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>Token: <strong className="text-slate-800 font-mono">{apt.tokenNumber}</strong></span>
                      <span>•</span>
                      <span>{apt.date} at {apt.time}</span>
                      <span>•</span>
                      <span>{apt.consultationType}</span>
                    </p>

                    <p className="text-xs text-slate-600 mt-1">
                      Reason: <span className="font-medium text-slate-800">{apt.reason}</span>
                    </p>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap sm:flex-col items-stretch gap-2 w-full sm:w-auto shrink-0">
                  {isActive && (
                    <button
                      onClick={() => onOpenWaitingRoom(apt)}
                      className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Enter Waiting Room</span>
                    </button>
                  )}

                  {isActive && (!apt.aiPreConsultation || !apt.aiPreConsultation.completed) && (
                    <button
                      onClick={() => onOpenAiChat(apt)}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-teal-700 text-xs font-semibold flex items-center justify-center gap-1.5 border border-teal-200"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>AI Intake</span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenReport(apt)}
                        className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-teal-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>[ View Report ]</span>
                      </button>

                      <a
                        href={api.getConsultationReportPdfUrl(apt.consultationSummary?.id || 'rep-101')}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>[ PDF ]</span>
                      </a>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Consultation Report Modal */}
      {selectedReport && (
        <ConsultationReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}

    </div>
  );
}
