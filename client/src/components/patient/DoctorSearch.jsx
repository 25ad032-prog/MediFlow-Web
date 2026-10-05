import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import DoctorCard from './DoctorCard';
import { Search, Sparkles, Stethoscope, Heart, ShieldCheck, Activity, Users, X } from 'lucide-react';

const SPECIALTIES = [
  { name: 'All', icon: '🩺' },
  { name: 'Cardiologist', icon: '❤️' },
  { name: 'Dermatologist', icon: '✨' },
  { name: 'General Physician', icon: '👨‍⚕️' },
  { name: 'Orthopedic', icon: '🦴' },
  { name: 'Neurologist', icon: '🧠' },
  { name: 'Pediatrician', icon: '👶' },
  { name: 'Dentist', icon: '🦷' },
  { name: 'ENT Specialist', icon: '👂' }
];

export default function DoctorSearch({ onSelectDoctor, onBookDoctor, initialQuery = '' }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(true);

  const fetchDoctorsList = async () => {
    setLoading(true);
    try {
      const res = await api.getDoctors({
        specialty: selectedSpecialty,
        search: searchQuery
      });
      if (res.success) {
        setDoctors(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorsList();
  }, [selectedSpecialty]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctorsList();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Find the right doctor
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Book appointments, check real-time queue lengths, and estimate your consultation time before leaving home.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-3xl">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor, specialty or symptom (e.g. Dr. Priya, chest pain, rash)..."
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl glass-input text-sm text-slate-900 placeholder-slate-400 shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSpecialty('All');
                }}
                className="absolute right-24 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              Search
            </button>
          </div>
        </form>

        {/* Popular Specialties Selector Pills */}
        <div className="pt-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SPECIALTIES.map(spec => (
              <button
                key={spec.name}
                onClick={() => {
                  setSelectedSpecialty(spec.name);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedSpecialty === spec.name
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90'
                }`}
              >
                <span>{spec.icon}</span>
                <span>{spec.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <h2 className="text-base font-bold text-slate-900">
            Available Specialists ({doctors.length})
          </h2>
          <span className="text-xs text-teal-700 font-semibold">
            🟢 Live queue synchronization active
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-3xl bg-white/70 border border-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="glass-surface p-12 text-center rounded-3xl text-slate-500 max-w-lg mx-auto">
            <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-40 text-teal-600" />
            <h3 className="text-base font-bold text-slate-800">No specialists found</h3>
            <p className="text-xs mt-1">Try adjusting your search query or choosing another medical specialty.</p>
            <button
              onClick={() => {
                setSelectedSpecialty('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map(doctor => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onSelect={onSelectDoctor}
                onBookNow={onBookDoctor}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
