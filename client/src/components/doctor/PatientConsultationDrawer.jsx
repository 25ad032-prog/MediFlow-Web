import React, { useState } from 'react';
import { api } from '../../utils/api';
import { soundFx } from '../../utils/sound';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  User, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Edit3, 
  Save, 
  Send,
  Calendar,
  Activity,
  ChevronRight,
  ShieldAlert,
  Stethoscope
} from 'lucide-react';

export default function PatientConsultationDrawer({ 
  patientApt, 
  doctor, 
  onClose, 
  onCompleteConsultation 
}) {
  const [doctorNotes, setDoctorNotes] = useState(
    patientApt?.doctorNotes || "Patient evaluated. Blood pressure 128/84 mmHg. Normal S1/S2 heart sounds. Advised hydration, regular rest intervals, and follow-up in 10 days."
  );
  const [isGeneratingAiSummary, setIsGeneratingAiSummary] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState(patientApt?.consultationSummary || null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'intake' | 'summary'

  // Editable summary fields
  const [editableSummary, setEditableSummary] = useState({
    chiefComplaint: '',
    symptomsDiscussed: '',
    doctorNotes: '',
    followUpRecommendation: '',
    nextAppointment: ''
  });

  if (!patientApt) return null;

  const preIntake = patientApt.aiPreConsultation;

  const handleGenerateAiSummary = async () => {
    setIsGeneratingAiSummary(true);
    try {
      const res = await api.generateConsultationSummary({
        appointmentId: patientApt.id,
        doctorNotes,
        patientName: patientApt.patientName,
        doctorSpecialty: doctor?.specialty
      });
      if (res.success) {
        soundFx.playSuccessAlert();
        setGeneratedSummary(res.data);
        setEditableSummary({
          chiefComplaint: res.data.chiefComplaint || (preIntake?.chiefComplaint || "Cardiology consultation"),
          symptomsDiscussed: res.data.symptomsDiscussed || "Chest discomfort, mild fatigue",
          doctorNotes: doctorNotes,
          followUpRecommendation: res.data.followUpRecommendation || "Lifestyle modification, low sodium diet, routine exercise",
          nextAppointment: res.data.nextAppointment || "In 7-10 days if symptoms persist"
        });
        setActiveTab('summary');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAiSummary(false);
    }
  };

  const handleCompleteAndSave = async () => {
    setIsCompleting(true);
    try {
      const finalSummary = generatedSummary ? {
        ...generatedSummary,
        ...editableSummary,
        doctorNotes: editableSummary.doctorNotes || doctorNotes
      } : {
        chiefComplaint: preIntake?.chiefComplaint || patientApt.reason,
        symptomsDiscussed: preIntake?.associatedSymptoms || "Symptoms reviewed",
        doctorNotes: doctorNotes,
        followUpRecommendation: "Follow prescribed care instructions",
        nextAppointment: "As needed"
      };

      await onCompleteConsultation(patientApt.id, doctorNotes, finalSummary);
      soundFx.playSuccessAlert();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col relative shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
              {patientApt.tokenNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{patientApt.patientName}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                  {patientApt.patientAge || 28}y • {patientApt.patientGender || 'Female'}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  patientApt.status === 'now_consulting' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-teal-50 text-teal-800 border border-teal-200'
                }`}>
                  {patientApt.status === 'now_consulting' ? '🟢 In Consultation' : `Queue #${patientApt.queuePosition}`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Reason: <span className="text-slate-800 font-medium">{patientApt.reason}</span> • Slot: <span className="text-slate-900 font-bold">{patientApt.time}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-100 flex gap-4 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'notes' ? 'border-teal-600 text-teal-800 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Consultation Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('intake')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'intake' ? 'border-teal-600 text-teal-800 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Pre-Consultation Summary</span>
            {preIntake?.completed && <span className="w-2 h-2 rounded-full bg-teal-500"></span>}
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'summary' ? 'border-teal-600 text-teal-800 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Discharge Summary</span>
            {generatedSummary && <span className="w-2 h-2 rounded-full bg-teal-500"></span>}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
          
          {/* TAB 1: DOCTOR CONSULTATION NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {preIntake?.completed && (
                <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between text-xs text-teal-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>
                      <strong>AI Intake:</strong> {preIntake.chiefComplaint} ({preIntake.duration}, Severity: {preIntake.severity})
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('intake')}
                    className="text-teal-700 hover:underline font-bold shrink-0 ml-2"
                  >
                    View Details
                  </button>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Doctor Clinical Examination Notes
                </label>
                <textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  rows={6}
                  placeholder="Enter clinical examination notes, vital signs observations, treatment plan, and follow-up guidance..."
                  className="w-full p-4 rounded-2xl glass-input text-xs sm:text-sm text-slate-900 resize-none leading-relaxed"
                />
              </div>

              {/* Generate AI Discharge Summary CTA */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>AI Consultation Summary Generator</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Automatically organizes doctor notes into a verified discharge summary.
                  </p>
                </div>
                <button
                  onClick={handleGenerateAiSummary}
                  disabled={isGeneratingAiSummary || !doctorNotes.trim()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all shrink-0"
                >
                  <Sparkles className={`w-4 h-4 ${isGeneratingAiSummary ? 'animate-spin' : ''}`} />
                  <span>[ Generate Consultation Summary ]</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: AI PRE-CONSULTATION INTAKE PANEL */}
          {activeTab === 'intake' && (
            <div className="space-y-4">
              {preIntake?.completed ? (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 text-xs text-left shadow-sm">
                  
                  {/* Header & Status */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-teal-700 block">
                        PATIENT PRE-CONSULTATION
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        {patientApt.patientName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Age: <strong>{patientApt.patientAge || 28}</strong> • {patientApt.patientGender || 'Female'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Status:</span>
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 font-bold border border-teal-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>✓ Submitted</span>
                      </span>
                    </div>
                  </div>

                  {/* Structured Dossier Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-bold text-[11px] block">Chief complaint</span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{preIntake.chiefComplaint || patientApt.reason}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-bold text-[11px] block">Duration</span>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{preIntake.duration || '2 days'}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-bold text-[11px] block">Location</span>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{preIntake.location || 'Head and temple area'}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-bold text-[11px] block">Severity</span>
                      <p className="text-sm font-bold text-amber-800 mt-0.5">{preIntake.severity || '6/10'}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-bold text-[11px] block">Other symptoms</span>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{preIntake.associatedSymptoms || 'Fatigue'}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-bold text-[11px] block">Previous consultation</span>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">{preIntake.priorHistory || 'No prior consultation'}</p>
                    </div>
                  </div>

                  {/* Patient description */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 font-bold text-[11px] block mb-1">Patient description</span>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{preIntake.patientDescription || preIntake.chiefComplaint || 'Patient completed intake during pre-consultation'}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>This summary is based on information provided by the patient and is not a medical diagnosis.</span>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs space-y-2 shadow-sm">
                  <Sparkles className="w-8 h-8 text-teal-600 mx-auto opacity-50" />
                  <p className="font-semibold text-slate-800">No pre-consultation intake recorded yet</p>
                  <p className="text-[11px] text-slate-400">Patient has not submitted AI intake for this appointment.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GENERATED DISCHARGE SUMMARY REVIEW */}
          {activeTab === 'summary' && (
            <div className="space-y-4 text-left">
              {generatedSummary ? (
                <div className="bg-white p-6 rounded-3xl border border-teal-200 space-y-4 text-xs shadow-sm">
                  <div className="flex items-center justify-between border-b border-teal-100 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-teal-600" />
                      <span className="font-bold text-slate-900 text-sm">Review & Edit Consultation Summary</span>
                    </div>
                    <span className="text-[10px] text-teal-700 font-bold">Dr. {doctor?.name}</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Chief complaint:</label>
                      <input
                        type="text"
                        value={editableSummary.chiefComplaint}
                        onChange={(e) => setEditableSummary({ ...editableSummary, chiefComplaint: e.target.value })}
                        className="w-full p-2.5 rounded-xl glass-input text-slate-900 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Symptoms discussed:</label>
                      <input
                        type="text"
                        value={editableSummary.symptomsDiscussed}
                        onChange={(e) => setEditableSummary({ ...editableSummary, symptomsDiscussed: e.target.value })}
                        className="w-full p-2.5 rounded-xl glass-input text-slate-900 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Doctor notes:</label>
                      <textarea
                        rows={3}
                        value={editableSummary.doctorNotes}
                        onChange={(e) => setEditableSummary({ ...editableSummary, doctorNotes: e.target.value })}
                        className="w-full p-2.5 rounded-xl glass-input text-slate-900 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Follow-up recommendation:</label>
                      <input
                        type="text"
                        value={editableSummary.followUpRecommendation}
                        onChange={(e) => setEditableSummary({ ...editableSummary, followUpRecommendation: e.target.value })}
                        className="w-full p-2.5 rounded-xl glass-input text-teal-800 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Next appointment:</label>
                      <input
                        type="text"
                        value={editableSummary.nextAppointment}
                        onChange={(e) => setEditableSummary({ ...editableSummary, nextAppointment: e.target.value })}
                        className="w-full p-2.5 rounded-xl glass-input text-slate-900 font-semibold"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs shadow-sm">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-teal-600 opacity-50" />
                  <p className="mb-3">No AI discharge summary generated yet.</p>
                  <button
                    onClick={handleGenerateAiSummary}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm"
                  >
                    [ Generate Consultation Summary ]
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Action Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            Close
          </button>

          <button
            onClick={handleCompleteAndSave}
            disabled={isCompleting}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCompleting ? 'Completing...' : 'Complete Appointment & Update Queue'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
