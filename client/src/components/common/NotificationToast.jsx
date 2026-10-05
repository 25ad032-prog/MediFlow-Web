import React, { useEffect } from 'react';
import { useQueue } from '../../context/QueueContext';
import { Bell, CheckCircle2, X } from 'lucide-react';

export default function NotificationToast() {
  const { latestNotification, clearNotification } = useQueue();

  useEffect(() => {
    if (latestNotification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [latestNotification, clearNotification]);

  if (!latestNotification) return null;

  const isSuccess = latestNotification.type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up max-w-sm w-full">
      <div className={`p-4 rounded-2xl border shadow-lg backdrop-blur-xl ${
        isSuccess 
          ? 'border-teal-200 bg-white/95 text-slate-900 shadow-teal-900/5' 
          : 'border-slate-200 bg-white/95 text-slate-900 shadow-slate-900/10'
      } flex items-start gap-3`}>
        <div className={`p-2 rounded-xl shrink-0 ${
          isSuccess ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-700'
        }`}>
          {isSuccess ? <CheckCircle2 className="w-5 h-5 animate-bounce" /> : <Bell className="w-5 h-5 animate-pulse" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">
              {latestNotification.title}
            </h4>
            <button
              onClick={clearNotification}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {latestNotification.message}
          </p>
        </div>
      </div>
    </div>
  );
}
