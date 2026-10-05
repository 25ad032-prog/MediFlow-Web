import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Activity, 
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
  LogIn,
  KeyRound,
  Hospital
} from 'lucide-react';

export default function AuthPage() {
  const { login, register, quickDemoLogin } = useAuth();
  
  // Tab: 'patient' | 'doctor'
  const [activeTab, setActiveTab] = useState('patient');
  // Sub-mode for patient: 'login' | 'register'
  const [authMode, setAuthMode] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessMessage('');
    setShowForgotPassword(false);
    setEmail('');
    setPassword('');
    setAuthMode('login');
  };

  const handleFillDemo = (type) => {
    setErrorMessage('');
    setSuccessMessage('');
    if (type === 'patient') {
      setActiveTab('patient');
      setAuthMode('login');
      setEmail('patient@mediflow.demo');
      setPassword('Patient@123');
    } else if (type === 'doctor') {
      setActiveTab('doctor');
      setAuthMode('login');
      setEmail('doctor@mediflow.demo');
      setPassword('Doctor@123');
    } else if (type === 'meera') {
      setActiveTab('patient');
      setAuthMode('login');
      setEmail('meera.sharma@mediflow.io');
      setPassword('Meera@123');
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
        if (res && res.success) {
          setSuccessMessage(res.message || 'Authentication successful! Loading workspace...');
        } else {
          setErrorMessage(res?.message || 'Invalid email or password');
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
        if (res && res.success) {
          setSuccessMessage('Account registered successfully! Welcome to MediFlow.');
        } else {
          setErrorMessage(res?.message || 'Registration failed. Please check your information.');
        }
      }
    } catch (err) {
      setErrorMessage('Server connection error. Please verify the backend is active.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (key) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await quickDemoLogin(key);
      if (res && !res.success) {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage('Failed to sign in with demo profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-sky-50/30 flex flex-col justify-between p-4 sm:p-6 lg:p-8 selection:bg-teal-500 selection:text-white">
      
      {/* Top Header Bar */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-900">DOCBEE</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-bold">
                MediFlow
              </span>
            </div>
            <p className="text-[10px] text-slate-500">AI Virtual Waiting Room & Clinical Intelligence</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>HIPAA-Ready & Encrypted Portal</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-10">
        <div className="w-full max-w-md">
          
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/60 p-6 sm:p-8 space-y-5 transition-all">
            
            {/* Header / Subtitle */}
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-widest bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 inline-block">
                Secure Access Gateway
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                {activeTab === 'doctor' 
                  ? 'Doctor Workspace' 
                  : (authMode === 'login' ? 'Patient Sign In' : 'Create Patient Account')}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'doctor'
                  ? 'Access clinical queue manager, patient dossiers & consultation workspace.'
                  : (authMode === 'login' 
                      ? 'Sign in to track live queue, consult AI assistant, and view health records.' 
                      : 'Join MediFlow for real-time OPD tracking and AI-assisted care.')}
              </p>
            </div>

            {/* Role Tab Selector (Patient vs Doctor) */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleTabSwitch('patient')}
                className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'patient' 
                    ? 'bg-white text-teal-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Patient Portal</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleTabSwitch('doctor')}
                className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'doctor' 
                    ? 'bg-white text-sky-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
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
                  className={`pb-2.5 px-4 border-b-2 transition-all ${
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
                  className={`pb-2.5 px-4 border-b-2 transition-all ${
                    authMode === 'register' 
                      ? 'border-teal-600 text-teal-800 font-bold' 
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  New Patient Registration
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}

            {/* Forgot Password Flow */}
            {showForgotPassword ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900">Demo Password Reminder</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Use demo password <strong className="text-teal-700 font-mono">Patient@123</strong> for patient accounts or <strong className="text-sky-700 font-mono">Doctor@123</strong> for doctor accounts.
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
              /* Main Form */
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                
                {authMode === 'register' && activeTab === 'patient' && (
                  <>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="e.g. Rahul Sharma"
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-xs outline-none transition-all"
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
                          placeholder="31"
                          className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-xs outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-slate-700 font-bold block mb-1">Gender</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-xs outline-none transition-all"
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
                        placeholder="+91 98765 00001"
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-xs outline-none transition-all"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    {activeTab === 'doctor' ? 'Clinical Email / Doctor ID' : 'Email / Mobile Number'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={activeTab === 'doctor' ? 'doctor@mediflow.demo' : 'patient@mediflow.demo'}
                      className="w-full p-3 pr-10 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-xs outline-none transition-all font-medium"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
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
                      className="w-full p-3 pr-10 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-xs outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authMode === 'login' && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberPage"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                    />
                    <label htmlFor="rememberPage" className="text-slate-600 text-xs cursor-pointer select-none">
                      Remember me on this browser
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 rounded-2xl text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer ${
                    activeTab === 'doctor'
                      ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/20'
                      : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                      Verifying with Server...
                    </span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>
                        {authMode === 'login' 
                          ? `Sign In to ${activeTab === 'doctor' ? 'Doctor Workspace' : 'Patient Portal'}` 
                          : 'Complete Registration & Sign In'}
                      </span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick 1-Click Demo Logins */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  1-Click Instant Demo Login
                </span>
                <span className="text-[10px] text-teal-700 font-semibold">Ready to test</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickLogin('rahul')}
                  className="p-2.5 rounded-xl bg-teal-50/60 hover:bg-teal-100/70 border border-teal-200/80 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-[11px] group-hover:text-teal-900">
                      👤 Rahul Sharma
                    </span>
                    <span className="text-[9px] font-extrabold text-teal-700 bg-teal-100/80 px-1.5 py-0.5 rounded">
                      Patient
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">patient@mediflow.demo</p>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickLogin('priya')}
                  className="p-2.5 rounded-xl bg-sky-50/60 hover:bg-sky-100/70 border border-sky-200/80 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-[11px] group-hover:text-sky-900">
                      🩺 Dr. Priya Sharma
                    </span>
                    <span className="text-[9px] font-extrabold text-sky-700 bg-sky-100/80 px-1.5 py-0.5 rounded">
                      Doctor
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">doctor@mediflow.demo</p>
                </button>
              </div>

              {/* Autofill Demo Fields Option */}
              <div className="flex justify-center gap-3 pt-1 text-[11px] text-slate-500">
                <span>Or autofill form:</span>
                <button 
                  type="button"
                  onClick={() => handleFillDemo('patient')} 
                  className="text-teal-700 font-bold hover:underline cursor-pointer"
                >
                  Patient credentials
                </button>
                <span>•</span>
                <button 
                  type="button"
                  onClick={() => handleFillDemo('doctor')} 
                  className="text-sky-700 font-bold hover:underline cursor-pointer"
                >
                  Doctor credentials
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer info */}
      <footer className="max-w-6xl mx-auto w-full py-4 text-center text-xs text-slate-400">
        <p>© 2026 MediFlow Health Technologies. Secure Cloud OPD Management System.</p>
      </footer>

    </div>
  );
}
