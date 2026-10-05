import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Calendar, 
  Clock, 
  Stethoscope, 
  FileText, 
  AlertCircle, 
  Trash2,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose, onNavigateTab, onOpenReport, onOpenWaitingRoom }) {
  const { notifications, unreadNotifCount, markNotificationRead, markAllNotificationsRead, dismissNotification } = useAuth();

  if (!isOpen) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Appointment':
        return <Calendar className="w-4 h-4 text-teal-600" />;
      case 'Queue':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'Consultation':
        return <Stethoscope className="w-4 h-4 text-sky-600" />;
      case 'Report':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'Reminder':
        return <Bell className="w-4 h-4 text-rose-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-500" />;
    }
  };

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'Appointment':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Queue':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Consultation':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Report':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Reminder':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id);
    if (notif.type === 'Report' && onOpenReport) {
      onOpenReport(notif.relatedId);
      onClose();
    } else if (notif.type === 'Queue' && onOpenWaitingRoom) {
      onOpenWaitingRoom(notif.relatedId);
      onClose();
    } else if (notif.type === 'Appointment' && onNavigateTab) {
      onNavigateTab('history');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-left">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Notifications</h3>
                {unreadNotifCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold">
                    {unreadNotifCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Live clinical & queue alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadNotifCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                title="Mark all as read"
                className="p-2 text-xs text-teal-700 hover:bg-teal-50 rounded-xl font-semibold flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">Mark read</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <Bell className="w-12 h-12 mx-auto opacity-30 text-teal-600" />
              <p className="text-sm font-bold text-slate-700">No notifications yet</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Updates regarding your appointments, live queue positions, and doctor reports will appear here.
              </p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex gap-3 items-start ${
                  notif.read 
                    ? 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50' 
                    : 'bg-teal-50/40 border-teal-200 hover:bg-teal-50/70 shadow-sm'
                }`}
              >
                {/* Type Icon */}
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {getTypeIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTypeBadgeStyle(notif.type)}`}>
                      {notif.type}
                    </span>
                    <span className="text-[10px] text-slate-400">{notif.time}</span>
                  </div>

                  <h4 className={`text-xs font-bold leading-snug ${notif.read ? 'text-slate-800' : 'text-slate-900 font-extrabold'}`}>
                    {notif.title}
                  </h4>

                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {/* Actions */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(notif.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                  title="Dismiss notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
          Real-time synchronized with MediFlow Clinical Cloud
        </div>

      </div>
    </div>
  );
}
