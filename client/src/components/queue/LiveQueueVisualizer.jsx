import React from 'react';
import { Clock, Activity, ChevronRight } from 'lucide-react';

export default function LiveQueueVisualizer({ queue, currentPatientId, onOpenWaitingRoom }) {
  if (!queue) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 animate-spin text-teal-600" />
        <p className="text-xs">Synchronizing live queue stream...</p>
      </div>
    );
  }

  const { nowConsulting, waitingList = [], avgDuration = 18 } = queue;

  const isMeConsulting = nowConsulting && nowConsulting.patientId === currentPatientId;
  const myWaitingIdx = waitingList.findIndex(w => w.patientId === currentPatientId);
  const myPosition = isMeConsulting ? 1 : (myWaitingIdx !== -1 ? myWaitingIdx + (nowConsulting ? 2 : 1) : null);
  const patientsAhead = isMeConsulting ? 0 : (myWaitingIdx !== -1 ? myWaitingIdx + (nowConsulting ? 1 : 0) : null);
  const estWaitTime = patientsAhead !== null ? patientsAhead * avgDuration : null;

  return (
    <div className="space-y-4 animate-fade-in text-left">
      
      {/* Visual Queue Step Progress Track */}
      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 space-y-3.5">
        
        {/* 1. NOW CONSULTING */}
        <div className="space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
            <span>NOW CONSULTING</span>
          </span>

          {nowConsulting ? (
            <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
              isMeConsulting 
                ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-400/40 shadow-sm' 
                : 'border-slate-200 bg-white shadow-sm'
            }`}>
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center font-black text-white text-sm shadow-sm">
                  #1
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {nowConsulting.patientName} — In Room
                    </h4>
                    {isMeConsulting && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-600 text-white font-extrabold uppercase shadow-sm">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Token: <strong className="text-slate-800 font-mono">{nowConsulting.tokenNumber}</strong> • Slot: {nowConsulting.time}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
                  <Activity className="w-3.5 h-3.5 text-teal-600 animate-pulse" /> Consulting
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs text-center">
              Calling next patient into consultation room...
            </div>
          )}
        </div>

        {/* 2. WAITING LIST */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>Waiting Patients ({waitingList.length})</span>
            </span>
            <span className="text-[11px] text-slate-500">Live position & wait</span>
          </div>

          {waitingList.length === 0 ? (
            <div className="p-3.5 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
              No patients waiting in queue.
            </div>
          ) : (
            <div className="space-y-2">
              {waitingList.map((item, index) => {
                const posNum = index + (nowConsulting ? 2 : 1);
                const patientsBefore = index + (nowConsulting ? 1 : 0);
                const estWait = patientsBefore * avgDuration;
                const isThisMe = item.patientId === currentPatientId;

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isThisMe 
                        ? 'border-teal-500 bg-teal-50 shadow-sm ring-1 ring-teal-400/50' 
                        : 'border-slate-200 bg-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isThisMe ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        #{posNum}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            #{posNum} {item.patientName} {isThisMe ? '(You)' : ''}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {item.tokenNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.reason}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-teal-700 block">
                        ~{estWait} min
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {patientsBefore} ahead
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
