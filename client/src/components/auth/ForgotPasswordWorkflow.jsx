import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  ShieldCheck 
} from 'lucide-react';

export default function ForgotPasswordWorkflow({ onBackToLogin, onSuccessReset, initialEmail = '' }) {
  // Step: 'email' (1) | 'otp' (2) | 'newPassword' (3) | 'success' (4)
  const [step, setStep] = useState('email');

  const [email, setEmail] = useState(initialEmail || '');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // 5-minute countdown timer for OTP (300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(30);

  useEffect(() => {
    let timer = null;
    if (step === 'otp' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, timeLeft]);

  useEffect(() => {
    let cdTimer = null;
    if (step === 'otp' && resendCooldown > 0) {
      cdTimer = setInterval(() => {
        setResendCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (cdTimer) clearInterval(cdTimer);
    };
  }, [step, resendCooldown]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 1. Submit Email Request
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessBanner('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.forgotPassword(cleanEmail);
      if (res.success) {
        setStep('otp');
        setTimeLeft(300); // 5 minutes
        setResendCooldown(30); // 30s before resend allowed
        setSuccessBanner(res.message || 'Verification code sent to your email.');
      } else {
        setErrorMessage(res.message || 'Unable to request verification code.');
      }
    } catch (err) {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessBanner('');

    const cleanOtp = otp.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setErrorMessage('Please enter a valid 6-digit verification code.');
      return;
    }

    if (timeLeft <= 0) {
      setErrorMessage('Verification code has expired. Please click "Resend Code".');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.verifyOtp(email.trim(), cleanOtp);
      if (res.success && res.resetToken) {
        setResetToken(res.resetToken);
        setStep('newPassword');
        setSuccessBanner('Code verified! Please create your new password.');
      } else {
        setErrorMessage(res.message || 'Invalid verification code.');
      }
    } catch (err) {
      setErrorMessage('Error verifying code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setOtp('');
    setErrorMessage('');
    await handleRequestOtp();
  };

  // 4. Submit New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessBanner('');

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.resetPassword(email.trim(), resetToken, newPassword);
      if (res.success) {
        setStep('success');
      } else {
        setErrorMessage(res.message || 'Password reset failed. Please restart the process.');
      }
    } catch (err) {
      setErrorMessage('Network connection error during password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      
      {/* Top Banner Notifications */}
      {errorMessage && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {successBanner && step !== 'success' && (
        <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
          <span className="font-medium">{successBanner}</span>
        </div>
      )}

      {/* STEP 1: Enter Email */}
      {step === 'email' && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div className="text-center space-y-1.5 py-1">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Trouble logging in?</h3>
            <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
              Enter your registered email and we'll send you a 6-digit verification code to reset your password.
            </p>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Registered Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="name@example.com"
                className="w-full p-3 pr-10 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-xs outline-none transition-all font-medium"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                Sending Verification Code...
              </span>
            ) : (
              'Send 6-Digit Code'
            )}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </button>
        </form>
      )}

      {/* STEP 2: Enter 6-Digit Code */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="text-center space-y-1.5 py-1">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mx-auto shadow-sm">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Enter Verification Code</h3>
            <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
              We sent a 6-digit confirmation code to <strong className="text-slate-800">{email}</strong>.
            </p>
          </div>

          {/* OTP Input with Instagram-Style Large Monospace Format */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 font-bold">6-Digit Code</label>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-700">
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft > 0 ? `Expires in ${formatTimer(timeLeft)}` : 'Code expired'}</span>
              </div>
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              autoFocus
              placeholder="123456"
              className="w-full p-3.5 text-center tracking-[0.5em] text-lg font-bold font-mono rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6 || timeLeft === 0}
            className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                Verifying Code...
              </span>
            ) : (
              'Confirm Code'
            )}
          </button>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={resendCooldown > 0 || isLoading}
              onClick={handleResend}
              className="text-xs text-teal-700 hover:text-teal-900 disabled:text-slate-400 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email');
                setErrorMessage('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
            >
              Change email
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Create New Password */}
      {step === 'newPassword' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="text-center space-y-1.5 py-1">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Create a New Password</h3>
            <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
              Your new password must be at least 6 characters and different from your previous password.
            </p>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
                placeholder="At least 6 characters"
                className="w-full p-3 pr-10 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-xs outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-type new password"
                className="w-full p-3 pr-10 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 text-xs outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Validation Check Indicators */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
            <div className={`flex items-center gap-2 ${newPassword.length >= 6 ? 'text-teal-700 font-semibold' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> At least 6 characters
            </div>
            <div className={`flex items-center gap-2 ${newPassword && newPassword === confirmPassword ? 'text-teal-700 font-semibold' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}
            className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                Updating Password...
              </span>
            ) : (
              'Reset Password & Return to Login'
            )}
          </button>
        </form>
      )}

      {/* STEP 4: Success Screen */}
      {step === 'success' && (
        <div className="text-center space-y-4 py-2 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">Password Reset Successfully!</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Your password has been updated and old sessions have been secured. You can now sign in with your new password.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onSuccessReset) {
                onSuccessReset(email);
              } else {
                onBackToLogin();
              }
            }}
            className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer"
          >
            Log In Now
          </button>
        </div>
      )}

    </div>
  );
}
