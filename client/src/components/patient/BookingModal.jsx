import React, { useState } from 'react';
import { api } from '../../utils/api';
import { useQueue } from '../../context/QueueContext';
import { soundFx } from '../../utils/sound';
import confetti from 'canvas-confetti';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  Building2, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Activity,
  Check
} from 'lucide-react';

const TIME_SLOTS = [
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM", "03:15 PM", "04:00 PM", "04:30 PM"
];

const QUICK_REASONS = [
  "Routine checkup & blood pressure review",
  "Chest heaviness & palpitations",
  "Severe headache & eye strain",
  "Follow-up after diagnostic tests"
];

export default function BookingModal({ doctor, familyMembers = [], onClose, onBookingSuccess, onOpenWaitingRoom, onOpenAiChat }) {
  const { setActiveAppointment } = useQueue();
  const [step, setStep] = useState(1); // 1: Patient & Mode | 2: Date & Slot | 3: Review & Submit
  const [selectedDate, setSelectedDate] = useState("Today, Oct 5");
  const [selectedTime, setSelectedTime] = useState("11:30 AM");
  const [consultationType, setConsultationType] = useState("In-Clinic");
  const [selectedFamilyId, setSelectedFamilyId] = useState(familyMembers[0]?.id || "fam-1");
  const [reason, setReason] = useState("Routine checkup & consultation");
  const [loading, setLoading] = useState(false);
  const [confirmedData, setConfirmedData] = useState(null);

  if (!doctor) return null;

  const handleBookingSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const selectedPerson = familyMembers.find(f => f.id === selectedFamilyId) || { name: "Hasini Duvvuru", id: "pat-1" };
      
      const payload = {
        doctorId: doctor.id,
        patientId: selectedPerson.id === "fam-1" ? "pat-1" : selectedPerson.id,
        patientName: selectedPerson.name,
        date: "2026-10-05",
        time: selectedTime,
        consultationType,
        reason,
        familyMemberId: selectedFamilyId
      };

      const res = await api.bookAppointment(payload);
      if (res.success) {
        soundFx.playSuccessAlert();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setActiveAppointment(res.data);
        setConfirmedData({
          appointment: res.data,
          patientsAhead: res.patientsAhead,
          estimatedWaitMinutes: res.estimatedWaitMinutes,
          tokenNumber: res.tokenNumber
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 relative shadow-xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmedData ? (
          <div className="space-y-6">
            
            {/* Guided Step Indicator */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
                  </span>
                  <span className={`text-xs font-bold ${step === 1 ? 'text-slate-900' : 'text-slate-500'}`}>
                    Patient & Mode
                  </span>
                </div>
                
                <span className="text-slate-300">──</span>

                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
                  </span>
                  <span className={`text-xs font-bold ${step === 2 ? 'text-slate-900' : 'text-slate-500'}`}>
                    Slot & Reason
                  </span>
                </div>

                <span className="text-slate-300">──</span>

                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === 3 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    3
                  </span>
                  <span className={`text-xs font-bold ${step === 3 ? 'text-slate-900' : 'text-slate-500'}`}>
                    Review
                  </span>
                </div>
              </div>
            </div>

            {/* Doctor Brief Header */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{doctor.name}</h3>
                <p className="text-xs text-teal-700 font-semibold">{doctor.specialty} • ₹{doctor.consultationFee}</p>
              </div>
            </div>

            {/* STEP 1: PATIENT & CONSULTATION MODE */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Consultation For (Patient / Family)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {familyMembers.map(member => (
                      <button
                        type="button"
                        key={member.id}
                        onClick={() => setSelectedFamilyId(member.id)}
                        className={`p-3 rounded-2xl text-left border transition-all text-xs ${
                          selectedFamilyId === member.id
                            ? 'border-teal-500 bg-teal-50/70 text-slate-900 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <p className="font-bold truncate">{member.name}</p>
                        <p className="text-[11px] text-slate-500">{member.relation} • {member.age} yrs</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Consultation Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setConsultationType("In-Clinic")}
                      className={`p-3 rounded-2xl border flex items-center gap-2 text-xs font-bold transition-all ${
                        consultationType === "In-Clinic"
                          ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-teal-600" />
                      <span>In-Clinic Visit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultationType("Video Consultation")}
                      className={`p-3 rounded-2xl border flex items-center gap-2 text-xs font-bold transition-all ${
                        consultationType === "Video Consultation"
                          ? 'border-sky-500 bg-sky-50 text-sky-800 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Video className="w-4 h-4 text-sky-600" />
                      <span>Video Consultation</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all mt-4"
                >
                  <span>Next: Choose Date & Slot</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: DATE, TIME & REASON */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>Select Date</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Today, Oct 5", "Tomorrow, Oct 6", "Wed, Oct 7"].map(d => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`py-2 px-3 rounded-xl text-center text-xs font-bold border transition-all ${
                          selectedDate === d
                            ? 'border-teal-500 bg-teal-600 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Select Time Slot</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map(t => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`py-2 px-2 rounded-xl text-center text-xs font-semibold border transition-all ${
                          selectedTime === t
                            ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Reason for Visit
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="E.g., Heart checkup, chest tightness..."
                    className="w-full p-3 rounded-2xl glass-input text-xs text-slate-900"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {QUICK_REASONS.map((qr, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReason(qr)}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-600"
                      >
                        + {qr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Next: Review & Confirm</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUMMARY & CONFIRM */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">
                    Appointment Summary
                  </h4>
                  
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Doctor:</span>
                    <span className="font-bold text-slate-900">{doctor.name} ({doctor.specialty})</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Date & Slot:</span>
                    <span className="font-bold text-slate-900">{selectedDate} · {selectedTime}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Mode:</span>
                    <span className="font-bold text-slate-900">{consultationType}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Current Queue:</span>
                    <span className="font-bold text-teal-700">3 waiting ahead</span>
                  </div>

                  <div className="flex justify-between py-1 border-t border-slate-200 pt-2">
                    <span className="text-slate-500">Estimated Waiting:</span>
                    <span className="font-bold text-teal-700">~32 min from start</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleBookingSubmit}
                    disabled={loading}
                    className="flex-1 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    {loading ? (
                      <span>Reserving Token & Slot...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Appointment</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* APPOINTMENT CONFIRMATION SCREEN MATCHING PROMPT EXACTLY */
          <div className="text-center py-2 space-y-6 animate-scale-in">
            
            <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Appointment confirmed ✓
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Your spot in the virtual line is locked in.</p>
            </div>

            {/* Confirmation Dossier Card */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 text-left space-y-3.5 shadow-sm">
              <div className="border-b border-slate-200 pb-2.5">
                <h3 className="text-base font-extrabold text-slate-900">{doctor.name}</h3>
                <p className="text-xs font-semibold text-teal-700">{doctor.specialty}</p>
                <p className="text-xs text-slate-500 mt-0.5">{selectedDate} · {selectedTime}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">QUEUE NUMBER</span>
                  <span className="text-2xl font-black text-teal-700 font-mono mt-0.5 block">
                    {confirmedData.tokenNumber || `#${confirmedData.appointment.queuePosition}`}
                  </span>
                  <span className="text-[10px] text-slate-500">{confirmedData.patientsAhead} patients ahead</span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Wait</span>
                  <span className="text-2xl font-black text-slate-900 mt-0.5 block">
                    {confirmedData.estimatedWaitMinutes || 32} min
                  </span>
                  <span className="text-[10px] text-teal-600 font-semibold">Live dynamic sync</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1">
                Appointment ID: <strong className="text-slate-800 font-mono">{confirmedData.appointment.id}</strong>
              </div>
            </div>

            {/* Action CTAs: Enter Waiting Room, Start Pre-Consultation, View Appointment */}
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  onClose();
                  onBookingSuccess && onBookingSuccess(confirmedData.appointment);
                }}
                className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all"
              >
                <span>Enter Waiting Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenAiChat && onOpenAiChat(confirmedData.appointment);
                }}
                className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Start Pre-Consultation</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Done
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
