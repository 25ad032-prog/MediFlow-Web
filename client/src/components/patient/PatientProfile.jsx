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
  CheckCircle2,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck
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

  // Change Password State
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [isUpdatingPw, setIsUpdatingPw] = useState(false);

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setIsUpdatingPw(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      if (res.success) {
        setPwSuccess('Password changed successfully! Your sessions have been updated.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setPwSuccess('');
          setShowPasswordSection(false);
        }, 3000);
      } else {
        setPwError(res.message || 'Failed to update password. Please check your current password.');
      }
    } catch (err) {
      setPwError('Network error updating password.');
    } finally {
      setIsUpdatingPw(false);
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

      {/* Security & Password Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Account Security & Password</h3>
              <p className="text-slate-500 text-xs">Update your account login password</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowPasswordSection(!showPasswordSection);
              setPwError('');
              setPwSuccess('');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer"
          >
            {showPasswordSection ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {pwSuccess && (
          <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{pwSuccess}</span>
          </div>
        )}

        {pwError && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{pwError}</span>
          </div>
        )}

        {showPasswordSection && (
          <form onSubmit={handleChangePassword} className="space-y-4 pt-2 border-t border-slate-100 text-xs">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter your current password"
                  className="w-full p-3 pr-10 rounded-xl glass-input text-slate-900 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-600 block mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters"
                    className="w-full p-3 pr-10 rounded-xl glass-input text-slate-900 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-type new password"
                    className="w-full p-3 pr-10 rounded-xl glass-input text-slate-900 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPw || newPassword.length < 6 || newPassword !== confirmPassword}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              {isUpdatingPw ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}

