import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueue } from '../../context/QueueContext';
import { api } from '../../utils/api';
import AuthModal from '../auth/AuthModal';
import NotificationDrawer from './NotificationDrawer';
import { 
  Activity, 
  Stethoscope, 
  User, 
  RotateCcw, 
  LogIn,
  Bell,
  Search,
  Calendar,
  FolderLock,
  Home,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function Navbar({ activeTab = 'home', onSelectTab, onOpenReport }) {
  const { role, switchRole, user, patient, currentDoctor, isAuthenticated, unreadNotifCount } = useAuth();
  const { isConnected } = useQueue();
  const [resetting, setResetting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  const handleResetDemo = async () => {
    if (confirm('Reset demo data to initial state?')) {
      setResetting(true);
      try {
        await api.resetDemo();
        window.location.reload();
      } catch (e) {
        console.error(e);
      } finally {
        setResetting(false);
      }
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Find Doctors', icon: Search },
    { id: 'history', label: 'Appointments', icon: Calendar },
    { id: 'vault', label: 'Health Records', icon: FolderLock },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 lg:px-8 py-3 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={() => onSelectTab && onSelectTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-teal-600 text-white shadow-sm group-hover:bg-teal-700 transition-colors">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  DOCBEE
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-bold">
                  MediFlow
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">AI Virtual Waiting Room</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {role === 'patient' && onSelectTab && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 shadow-inner">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-white text-teal-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Controls: Live Sync, Notifications, Role Switcher, Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Real-time Status Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-teal-500 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{isConnected ? 'Live Synced' : 'Connecting...'}</span>
            </div>

            {/* Notification Bell Button with Badge */}
            <button
              onClick={() => setShowNotificationDrawer(true)}
              className="relative p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-all"
              title="Open Notifications Center"
            >
              <Bell className={`w-4 h-4 ${unreadNotifCount > 0 ? 'text-teal-600' : 'text-slate-500'}`} />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm animate-pulse">
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </span>
              )}
            </button>

            {/* Role Switcher (Patient / Doctor) */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
              <button
                onClick={() => switchRole('patient')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  role === 'patient' 
                    ? 'bg-teal-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Patient</span>
              </button>
              <button
                onClick={() => switchRole('doctor')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  role === 'doctor' 
                    ? 'bg-sky-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Doctor</span>
              </button>
            </div>

            {/* User Profile / Auth Button */}
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-sm transition-all"
              title="User Account & Security"
            >
              {isAuthenticated ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  <span className="hidden sm:inline">
                    {role === 'doctor' 
                      ? (currentDoctor?.name || 'Dr. Priya') 
                      : (user?.name?.split(' ')[0] || patient?.name?.split(' ')[0] || 'Rahul')}
                  </span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 text-teal-600" />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Reset Demo Button */}
            <button
              onClick={handleResetDemo}
              disabled={resetting}
              title="Reset demo data to initial state"
              className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 transition-all flex items-center justify-center text-xs shadow-sm"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-teal-600' : ''}`} />
            </button>

          </div>

        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Notification Drawer */}
      <NotificationDrawer 
        isOpen={showNotificationDrawer} 
        onClose={() => setShowNotificationDrawer(false)}
        onNavigateTab={onSelectTab}
        onOpenReport={onOpenReport}
        onOpenWaitingRoom={() => onSelectTab && onSelectTab('waiting_room')}
      />
    </>
  );
}
