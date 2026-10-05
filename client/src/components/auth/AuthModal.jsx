import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Phone,
  Sparkles,
  LogIn
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, quickDemoLogin, isAuthenticated, logout, user, patient, role } = useAuth();
  
  // Tab: 'patient' | 'doctor'
  const [activeTab, setActiveTab] = useState('patient');
  // Sub-mode for patient: 'login' | 'register'
  const [authMode, setAuthMode] = useState('login');

  const [email, setEmail] = useState('patient@mediflow.demo');
  const [password, setPassword] = useState('Patient@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Fields
  const [name, setName] = useState('Rahul Sharma');
  const [phone, setPhone] = useState('+91 98765 00001');
  const [age, setAge] = useState('31');
  const [gender, setGender] = useState('Male');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (!isOpen) return null;

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessMessage('');
    setShowForgotPassword(false);
    if (tab === 'doctor') {
      setEmail('doctor@mediflow.demo');
      setPassword('Doctor@123');
      setAuthMode('login');
    } else {
      setEmail('patient@mediflow.demo');
      setPassword('Patient@123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (authMode === 'login' || activeTab === 'doctor') {
        const res = await login(email, password, activeTab);
        if (res.success) {
          setSuccessMessage(res.message || 'Signed in successfully!');
          setTimeout(() => {
            onClose();
          }, 600);
        } else {
          setErrorMessage(res.message || 'Invalid credentials. Please try again.');
        }
      } else {
        const res = await register({
          name,
          email,
          phone,
          password,
          age,
          gender
        });
        if (res.success) {
          setSuccessMessage('Account registered successfully!');
          setTimeout(() => {
            onClose();
          }, 600);
        } else {
          setErrorMessage(res.message || 'Registration failed.');
        }
      }
    } catch (err) {
      setErrorMessage('Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (key) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await quickDemoLogin(key);
      if (res && res.success) {
        onClose();
      } else if (res && !res.success) {
        setErrorMessage(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 relative shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {isAuthenticated ? (
          /* Active User Profile State */
          <div className="text-center space-y-5 py-2">
            <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider">
                Active Session
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                {user?.name || (role === 'doctor' ? 'Dr. Priya Sharma' : 'Rahul Sharma')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Signed in as <strong className="text-teal-700 uppercase">{role}</strong> • {user?.email}
              </p>
            </div>

            {/* Quick Demo Switchers */}
            <div className="pt-3 border-t border-slate-100 text-left space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Instant Demo Account Switcher:
              </span>

              <div className="space-y-2">
                <button
                  onClick={() => handleQuickDemo('rahul')}
                  disabled={isLoading}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs flex justify-between items-center transition-all"
                >
                  <div>
                    <p className="font-bold text-slate-900">Rahul Sharma (Patient)</p>
                    <p className="text-[10px] text-slate-500">patient@mediflow.demo</p>
                  </div>
                  <span className="text-xs font-bold text-teal-700">Switch</span>
                </button>

                <button
                  onClick={() => handleQuickDemo('priya')}
                  disabled={isLoading}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs flex justify-between items-center transition-all"
                >
                  <div>
                    <p className="font-bold text-slate-900">Dr. Priya Sharma (Doctor)</p>
                    <p className="text-[10px] text-slate-500">doctor@mediflow.demo</p>
                  </div>
                  <span className="text-xs font-bold text-sky-700">Switch</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={logout}
                className="flex-1 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors"
              >
                Sign Out
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Sign In & Registration Form */
          <div className="space-y-5">
            
            {/* Modal Title */}
            <div>
              <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider">
                DOCBEE MEDIFLOW
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                {activeTab === 'doctor' 
                  ? 'Doctor Sign In' 
                  : (authMode === 'login' ? 'Patient Sign In' : 'Create Patient Account')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'doctor'
                  ? 'Access clinical queue manager, patient dossiers & consultation workspace.'
                  : 'Track live queue positions, AI pre-consultation, and medical records.'}
              </p>
            </div>

            {/* Role Tab Selector (Patient vs Doctor) */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleTabSwitch('patient')}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'patient' 
                    ? 'bg-white text-teal-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Patient Portal</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleTabSwitch('doctor')}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'doctor' 
                    ? 'bg-white text-sky-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor Sign In</span>
              </button>
            </div>

            {/* Submode Switcher for Patient (Login vs Register) */}
            {activeTab === 'patient' && (
              <div className="flex border-b border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage('');
                  }}
                  className={`pb-2 px-3 border-b-2 transition-all ${
                    authMode === 'login' 
                      ? 'border-teal-600 text-teal-800 font-bold' 
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage('');
                  }}
                  className={`pb-2 px-3 border-b-2 transition-all ${
                    authMode === 'register' 
                      ? 'border-teal-600 text-teal-800 font-bold' 
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {showForgotPassword ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900">Reset Password</h4>
                  <p className="text-slate-500 leading-relaxed">
                    For demonstration purposes, you can log in with demo password <strong>Patient@123</strong> or <strong>Doctor@123</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                
                {authMode === 'register' && activeTab === 'patient' && (
                  <>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="e.g. Rahul Sharma"
                        className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-700 font-bold block mb-1">Age</label>
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          required
                          className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-700 font-bold block mb-1">Gender</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs bg-white"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 00000"
                        className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Email / Mobile Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={activeTab === 'doctor' ? 'doctor@mediflow.demo' : 'patient@mediflow.demo'}
                      className="w-full p-3 pr-10 rounded-xl glass-input text-slate-900 text-xs"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-bold">Password</label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-[11px] text-teal-700 hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full p-3 pr-10 rounded-xl glass-input text-slate-900 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authMode === 'login' && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                    />
                    <label htmlFor="remember" className="text-slate-600 text-xs cursor-pointer select-none">
                      Remember me on this browser
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 rounded-2xl text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all mt-3 ${
                    activeTab === 'doctor'
                      ? 'bg-sky-600 hover:bg-sky-700'
                      : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                >
                  {isLoading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{authMode === 'login' ? `Sign In as ${activeTab === 'doctor' ? 'Doctor' : 'Patient'}` : 'Register & Enter'}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick 1-Click Demo Buttons */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 block mb-2 font-semibold">
                Instant 1-Click Demo Login:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickDemo('rahul')}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-800 font-bold border border-slate-200 transition-all flex items-center justify-center gap-1"
                >
                  <span>👤 Patient Demo</span>
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickDemo('priya')}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] text-sky-800 font-bold border border-slate-200 transition-all flex items-center justify-center gap-1"
                >
                  <span>🩺 Doctor Demo</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
