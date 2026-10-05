import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import DoctorCard from './DoctorCard';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Stethoscope, 
  Navigation, 
  SlidersHorizontal, 
  X,
  Building2,
  CheckCircle2
} from 'lucide-react';

const SPECIALTIES = [
  { name: 'All', icon: '🩺' },
  { name: 'Cardiologist', icon: '❤️' },
  { name: 'Dermatologist', icon: '✨' },
  { name: 'General Physician', icon: '👨‍⚕️' },
  { name: 'Orthopedic', icon: '🦴' },
  { name: 'Neurologist', icon: '🧠' },
  { name: 'Pediatrician', icon: '👶' },
  { name: 'Dentist', icon: '🦷' },
  { name: 'ENT Specialist', icon: '👂' },
  { name: 'Gynecology', icon: '🌸' }
];

const LOCATIONS = [
  { id: 'All', name: 'All Locations' },
  { id: 'Chennai', name: 'Chennai, TN' },
  { id: 'Bangalore', name: 'Bangalore, KA' },
  { id: 'Hyderabad', name: 'Hyderabad, TS' },
  { id: 'Coimbatore', name: 'Coimbatore, TN' },
  { id: 'Madurai', name: 'Madurai, TN' }
];

export default function DoctorSearch({ onSelectDoctor, onBookDoctor, initialQuery = '', initialLocation = 'All' }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDoctorsList = async () => {
    setLoading(true);
    try {
      const res = await api.getDoctors({
        specialty: selectedSpecialty === 'All' ? '' : selectedSpecialty,
        location: selectedLocation === 'All' ? '' : selectedLocation,
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
  }, [selectedSpecialty, selectedLocation]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctorsList();
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    setLocationNotice('Detecting nearest medical center...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDetectingLocation(false);
        // Default to Chennai or Bangalore based on demo coordinates
        setSelectedLocation('Chennai');
        setLocationNotice('📍 Located: Chennai (Greams Road Medical Cluster)');
      },
      (error) => {
        setDetectingLocation(false);
        setSelectedLocation('Chennai');
        setLocationNotice('📍 Defaulted to Chennai (Demo Location)');
      },
      { timeout: 5000 }
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header & Search Bar */}
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Find the right doctor & clinic
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Compare specialists across Chennai, Bangalore, Hyderabad, Coimbatore, and Madurai with real-time queue tracking.
          </p>
        </div>

        {/* Search Bar + Location Dropdown Grid */}
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 max-w-4xl">
            
            {/* Search Input (7 cols) */}
            <div className="md:col-span-7 relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctor, hospital, or symptom (e.g. Priya, chest pain, rash)..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl glass-input text-sm text-slate-900 placeholder-slate-400 shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Location Dropdown (5 cols) */}
            <div className="md:col-span-5 flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-teal-600 absolute left-3.5 top-4 pointer-events-none" />
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setLocationNotice('');
                  }}
                  className="w-full pl-10 pr-8 py-3.5 rounded-2xl glass-input text-xs font-bold text-slate-800 bg-white shadow-sm cursor-pointer"
                >
                  {LOCATIONS.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Detect Location Button */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                title="Detect Nearest Location"
                className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-teal-700 shadow-sm transition-all"
              >
                <Navigation className={`w-4 h-4 ${detectingLocation ? 'animate-spin text-amber-500' : ''}`} />
              </button>

              <button
                type="submit"
                className="px-5 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm shrink-0"
              >
                Search
              </button>
            </div>

          </div>

          {locationNotice && (
            <p className="text-xs text-teal-800 font-medium flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>{locationNotice}</span>
            </p>
          )}
        </form>

        {/* Specialties Filter Pills */}
        <div className="pt-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SPECIALTIES.map(spec => (
              <button
                key={spec.name}
                onClick={() => {
                  setSelectedSpecialty(spec.name);
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
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Specialist Doctors ({doctors.length})
            </h2>
            {selectedLocation !== 'All' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                {selectedLocation}
              </span>
            )}
          </div>
          <span className="text-xs text-teal-700 font-semibold hidden sm:inline">
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
            <p className="text-xs mt-1">Try selecting another city or reset filters.</p>
            <button
              onClick={() => {
                setSelectedSpecialty('All');
                setSelectedLocation('All');
                setSearchQuery('');
                setLocationNotice('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
            >
              Reset All Filters
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
