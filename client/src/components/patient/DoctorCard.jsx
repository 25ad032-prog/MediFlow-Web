import React from 'react';
import { Star, Clock, Users, MapPin, ArrowRight, Activity } from 'lucide-react';

export default function DoctorCard({ doctor, onSelect, onBookNow }) {
  const {
    id,
    name,
    specialty,
    qualification,
    experienceYears,
    rating,
    reviewCount = 120,
    consultationFee,
    languages = [],
    hospital,
    avatar,
    averageDurationMinutes = 18,
    currentQueueCount = 0,
    estimatedWaitTime = 0,
    nowConsultingPatient
  } = doctor;

  return (
    <div className="glass-surface rounded-3xl p-5 sm:p-6 border border-slate-200/90 flex flex-col justify-between group hover:border-teal-400/80 hover:shadow-card-hover transition-all duration-200 shadow-sm relative overflow-hidden bg-white/90">
      
      {/* Top Header: Avatar, Name, Specialty, Rating */}
      <div>
        <div className="flex items-start gap-4 mb-3.5">
          <div className="relative shrink-0">
            <img
              src={avatar}
              alt={name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-teal-500 border-2 border-white shadow-sm"></span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-teal-700 transition-colors">
              {name}
            </h3>
            
            <p className="text-xs font-semibold text-teal-700 mt-0.5">
              {specialty}
            </p>

            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/80 text-amber-700 text-xs font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{rating}</span>
              </div>
              <span className="text-xs text-slate-500">
                {experienceYears} yrs exp
              </span>
            </div>
          </div>
        </div>

        {/* Hospital & Fee info */}
        <div className="flex items-center justify-between text-xs text-slate-600 pb-3 border-b border-slate-100">
          <span className="truncate max-w-[200px] flex items-center gap-1 text-slate-500 text-[11px]">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            {hospital.split(',')[0]}
          </span>
          <span className="font-bold text-slate-900">₹{consultationFee}</span>
        </div>

        {/* Live Queue & Estimated Waiting Panel */}
        <div className="my-3.5 p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 grid grid-cols-2 gap-2 text-left">
          <div className="border-r border-slate-200 pr-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Current queue:
            </span>
            <p className="text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              <span>{currentQueueCount} in line</span>
            </p>
          </div>

          <div className="pl-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Estimated wait:
            </span>
            <p className="text-xs font-bold text-teal-700 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-teal-600" />
              <span>~{estimatedWaitTime || currentQueueCount * averageDurationMinutes} min</span>
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onSelect(doctor)}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
        >
          View Profile
        </button>
        
        <button
          onClick={() => onBookNow(doctor)}
          className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all"
        >
          <span>Book</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
