import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { soundFx } from '../../utils/sound';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Stethoscope, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Phone
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, quickDemoLogin, isAuthenticated, logout, patient, role } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('hasini.duvvuru@mediflow.io');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Hasini Duvvuru');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [age, setAge] = useState('28');
  const [gender, setGender] = useState('Female');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      login(email, password);
    } else {
      register({ name, email, phone, age, gender });
    }
    soundFx.playSuccessAlert();
    onClose();
  };

  const handleQuick = (key) => {
    quickDemoLogin(key);
    soundFx.playSuccessAlert();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 relative shadow-xl">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {isAuthenticated ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Logged In</span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {role === 'doctor' ? 'Dr. Priya Sharma' : (patient?.name || 'Hasini Duvvuru')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Active Session: <strong className="text-teal-700 capitalize">{role} Portal</strong>
              </p>
            </div>

            {/* Quick Profile Switchers */}
            <div className="pt-3 border-t border-slate-100 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Demo Switcher:
              </span>
              <div className="space-y-2">
                <button
                  onClick={() => handleQuick('rahul')}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs flex justify-between items-center transition-all"
                >
                  <div>
                    <p className="font-bold text-slate-900">Rahul Sharma (Patient)</p>
                    <p className="text-[10px] text-slate-500">Cardiology Patient • Token Q-04</p>
                  </div>
                  <span className="text-xs font-bold text-teal-700">Switch</span>
                </button>

                <button
                  onClick={() => handleQuick('meera')}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs flex justify-between items-center transition-all"
                >
                  <div>
                    <p className="font-bold text-slate-900">Meera Patel (Patient)</p>
                    <p className="text-[10px] text-slate-500">General Consultation</p>
                  </div>
                  <span className="text-xs font-bold text-teal-700">Switch</span>
                </button>

                <button
                  onClick={() => handleQuick('priya')}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs flex justify-between items-center transition-all"
                >
                  <div>
                    <p className="font-bold text-slate-900">Dr. Priya Sharma (Doctor)</p>
                    <p className="text-[10px] text-slate-500">Senior Cardiologist • Clinic Station</p>
                  </div>
                  <span className="text-xs font-bold text-sky-700">Switch</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  logout();
                  soundFx.playChime();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200"
              >
                Log Out
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">DOCBEE MediFlow</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                {authMode === 'login' ? 'Patient Sign In' : 'Create Patient Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Access your virtual queue, appointments, and medical vault.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`py-1.5 rounded-lg transition-all ${
                  authMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`py-1.5 rounded-lg transition-all ${
                  authMode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="text-slate-600 font-bold block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Hasini Duvvuru"
                      className="w-full p-2.5 rounded-xl glass-input text-slate-900 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Age</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                        className="w-full p-2.5 rounded-xl glass-input text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full p-2.5 rounded-xl glass-input text-slate-900 text-xs bg-white"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-slate-600 font-bold block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="patient@mediflow.io"
                  className="w-full p-2.5 rounded-xl glass-input text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl glass-input text-slate-900 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm mt-2"
              >
                {authMode === 'login' ? 'Sign In & Access Platform' : 'Register & Enter Platform'}
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 block mb-2">Or select instant 1-click demo account:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuick('rahul')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 font-semibold"
                >
                  👤 Rahul (Patient)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuick('priya')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] text-teal-800 font-semibold"
                >
                  🩺 Dr. Priya (Doctor)
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
