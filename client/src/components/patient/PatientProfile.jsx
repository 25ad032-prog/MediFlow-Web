import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Heart, 
  ShieldAlert, 
  Edit3, 
  Save, 
  CheckCircle2
} from 'lucide-react';

export default function PatientProfile() {
  const { patient, setPatient } = useAuth();
  const [profileData, setProfileData] = useState(patient || {
    name: "Hasini Duvvuru",
    age: 28,
    gender: "Female",
    phone: "+91 98765 43210",
    email: "hasini.duvvuru@mediflow.io",
    bloodGroup: "O+Positive",
    address: "Flat 402, Green Glen Layout, Bellandur, Bangalore",
    emergencyContact: "Family Contact - +91 98123 45678",
    medicalAlerts: ["Mild Penicillin Allergy", "Family History of Hypertension"]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (patient) setProfileData(patient);
  }, [patient]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updatePatientProfile(profileData);
      if (res.success) {
        setPatient(res.data);
        setIsEditing(false);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-sm">
            {profileData.name ? profileData.name.charAt(0) : 'H'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900">{profileData.name}</h2>
              {savedSuccess && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold border border-teal-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Saved
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {profileData.age} Years • {profileData.gender} • Blood Group: <strong className="text-teal-700">{profileData.bloodGroup}</strong>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{profileData.email}</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Edit3 className="w-4 h-4 text-teal-600" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Main Details Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-600 block mb-1 uppercase text-[10px] tracking-wider">Full Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs disabled:bg-slate-50 disabled:text-slate-700"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1 uppercase text-[10px] tracking-wider">Phone Number</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs disabled:bg-slate-50 disabled:text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-600 block mb-1 uppercase text-[10px] tracking-wider">Age</label>
              <input
                type="number"
                disabled={!isEditing}
                value={profileData.age}
                onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs disabled:bg-slate-50 disabled:text-slate-700"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1 uppercase text-[10px] tracking-wider">Gender</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profileData.gender}
                onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs disabled:bg-slate-50 disabled:text-slate-700"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1 uppercase text-[10px] tracking-wider">Blood Group</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profileData.bloodGroup}
                onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs disabled:bg-slate-50 disabled:text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1 uppercase text-[10px] tracking-wider">Residential Address</label>
            <input
              type="text"
              disabled={!isEditing}
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs disabled:bg-slate-50 disabled:text-slate-700"
            />
          </div>

          <div>
            <label className="font-bold text-slate-600 block mb-1 uppercase text-[10px] tracking-wider">Emergency Contact</label>
            <input
              type="text"
              disabled={!isEditing}
              value={profileData.emergencyContact}
              onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
              className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs disabled:bg-slate-50 disabled:text-slate-700"
            />
          </div>

          {/* Medical Alerts */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <span className="font-bold text-amber-800 uppercase tracking-wider text-[11px] block mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Medical History & Drug Allergies</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {profileData.medicalAlerts?.map((alert, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-white text-amber-800 border border-amber-200 text-xs font-semibold shadow-sm"
                >
                  {alert}
                </span>
              ))}
            </div>
          </div>

          {isEditing && (
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm"
            >
              Save Profile Changes
            </button>
          )}

        </form>
      </div>

    </div>
  );
}
