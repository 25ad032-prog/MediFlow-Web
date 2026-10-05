import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Clock, 
  MapPin, 
  Languages, 
  CheckCircle2, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Building
} from 'lucide-react';
import LiveQueueVisualizer from '../queue/LiveQueueVisualizer';

export default function DoctorProfileModal({ doctor, onClose, onBookNow, queueData }) {
  if (!doctor) return null;

  const queueCount = queueData 
    ? (queueData.waitingCount + (queueData.nowConsulting ? 1 : 0))
    : (doctor.currentQueueCount || 3);

  const estWait = queueData 
    ? queueData.totalEstimatedWaitMinutes 
    : (doctor.estimatedWaitTime || 24);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 relative shadow-xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Doctor Header Dossier */}
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          <div className="relative shrink-0">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-teal-100 shadow-sm"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-teal-500 border-2 border-white shadow-sm"></span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{doctor.name}</h2>
            </div>
            
            <p className="text-xs sm:text-sm font-bold text-teal-700 mt-0.5">{doctor.specialty}</p>
            <p className="text-xs text-slate-500 mt-0.5">{doctor.qualification}</p>

            <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 text-amber-800 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{doctor.rating}</span>
                <span className="text-[10px] text-slate-400 font-normal">({doctor.reviewCount || 120} reviews)</span>
              </div>
              <span>•</span>
              <span className="font-semibold text-slate-700">
                {doctor.experienceYears} yrs experience
              </span>
              <span>•</span>
              <span className="font-bold text-teal-700">
                ₹{doctor.consultationFee} Consultation Fee
              </span>
            </div>
          </div>
        </div>

        {/* LIVE AVAILABILITY & QUEUE SECTION */}
        <div className="p-4 sm:p-5 rounded-3xl bg-teal-50/70 border border-teal-200/80 space-y-3">
          <div className="flex items-center justify-between border-b border-teal-200/60 pb-2">
            <span className="text-xs font-black uppercase tracking-widest text-teal-800">
              LIVE AVAILABILITY & QUEUE
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
              <span>Doctor currently consulting</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
            <div className="p-3 rounded-2xl bg-white border border-teal-100 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Queue:</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">{queueCount} patients</p>
              <span className="text-[10px] text-slate-500">In virtual lounge</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-teal-100 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Wait:</span>
              <p className="text-lg font-black text-teal-700 mt-0.5">~{estWait} minutes</p>
              <span className="text-[10px] text-slate-500">({doctor.averageDurationMinutes || 18}m / patient)</span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-teal-100 shadow-sm col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Next Available Slot:</span>
              <p className="text-sm font-bold text-slate-900 mt-1">{doctor.nextAvailableSlot || "11:30 AM Today"}</p>
              <span className="text-[10px] text-teal-600 font-semibold">Immediate slot reserved</span>
            </div>
          </div>
        </div>

        {/* Location & Languages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block mb-1 flex items-center gap-1 font-semibold">
              <Building className="w-3.5 h-3.5 text-teal-600" /> Hospital / Clinic
            </span>
            <p className="font-bold text-slate-800">{doctor.hospital}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block mb-1 flex items-center gap-1 font-semibold">
              <Languages className="w-3.5 h-3.5 text-teal-600" /> Languages Spoken
            </span>
            <p className="font-bold text-slate-800">{doctor.languages ? doctor.languages.join(', ') : 'English, Hindi'}</p>
          </div>
        </div>

        {/* Bio Overview */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Specialist Overview</h4>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            {doctor.bio}
          </p>
        </div>

        {/* Live Clinic Stream */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Live Clinic Stream</h4>
          <LiveQueueVisualizer queue={queueData} />
        </div>

        {/* Footer with Booking Button */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4 sticky bottom-0 bg-white py-2">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Fee</span>
            <p className="text-xl font-black text-slate-900">₹{doctor.consultationFee}</p>
          </div>
          
          <button
            onClick={() => {
              onClose();
              onBookNow(doctor);
            }}
            className="flex-1 max-w-sm py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all"
          >
            <span>Book Appointment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
