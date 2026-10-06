import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { 
  X, 
  Server, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  ExternalLink,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function DataSourceModal({ isOpen, onClose }) {
  const [status, setStatus] = useState({
    activeMode: 'synthetic',
    providerName: 'MediFlow Synthetic FHIR Provider (R4)',
    isExternalEnabled: false,
    isFallbackActive: false,
    standard: 'HL7 FHIR Release 4 (R4)',
    supportedResources: [
      'Patient',
      'Practitioner',
      'Organization',
      'Appointment',
      'Schedule',
      'Slot',
      'Encounter',
      'Observation',
      'DiagnosticReport',
      'DocumentReference'
    ],
    disclaimer: 'Prototype uses synthetic/de-identified healthcare data and is designed to integrate with authorized healthcare systems through standard FHIR APIs.'
  });
  const [switching, setSwitching] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    try {
      const res = await api.getHealthcareStatus();
      if (res.success && res.data) {
        setStatus(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleProvider = async (mode) => {
    setSwitching(true);
    setMessage('');
    try {
      const res = await api.switchHealthcareProvider(mode);
      if (res.success) {
        setStatus(res.data);
        setMessage(`Data provider switched to ${mode === 'fhir_api' ? 'External FHIR REST API' : 'Synthetic FHIR Provider'}`);
      }
    } catch (err) {
      setMessage('Failed to switch data provider');
    } finally {
      setSwitching(false);
    }
  };

  if (!isOpen) return null;

  const isSynthetic = status.activeMode === 'synthetic';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 relative shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pr-8">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-widest bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Interoperability Architecture
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Healthcare Data Ecosystem
          </h2>
          <p className="text-xs text-slate-500">
            Standardized HL7® FHIR® R4 API Integration Layer
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div className="mt-4 p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
            <span>{message}</span>
          </div>
        )}

        {/* Current Active Mode Card */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Active Data Source
            </span>
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
              isSynthetic 
                ? 'bg-teal-50 text-teal-700 border-teal-200' 
                : 'bg-sky-50 text-sky-700 border-sky-200'
            }`}>
              {isSynthetic ? '● Synthetic FHIR Provider' : '● FHIR REST API'}
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">{status.providerName}</h4>
            <p className="text-xs text-slate-500">
              {isSynthetic
                ? 'Consuming standardized synthetic FHIR R4 resources across 5 metropolitan medical hubs.'
                : 'Configured for external hospital/EHR FHIR endpoint integration with automated fallback.'}
            </p>
          </div>

          {/* Provider Switcher Selector */}
          <div className="pt-2 flex gap-2">
            <button
              onClick={() => handleToggleProvider('synthetic')}
              disabled={switching || isSynthetic}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isSynthetic 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Synthetic Mode</span>
            </button>

            <button
              onClick={() => handleToggleProvider('fhir_api')}
              disabled={switching || !isSynthetic}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                !isSynthetic 
                  ? 'bg-sky-600 text-white shadow-sm' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>FHIR API Mode</span>
            </button>
          </div>
        </div>

        {/* Integration Architecture Diagram */}
        <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            End-to-End Interoperability Pipeline
          </span>

          <div className="grid grid-cols-5 items-center gap-1 text-center text-[10px]">
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
              <span className="font-bold text-slate-800 block">Hospital/EHR</span>
              <span className="text-[9px] text-slate-500">EMR / Labs</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 mx-auto" />
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-200">
              <span className="font-bold text-teal-800 block">FHIR R4 APIs</span>
              <span className="text-[9px] text-teal-600">REST Endpoints</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 mx-auto" />
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
              <span className="font-bold text-slate-800 block">Web + Mobile</span>
              <span className="text-[9px] text-slate-500">Live Client</span>
            </div>
          </div>
        </div>

        {/* Supported FHIR Resources */}
        <div className="mt-4 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Supported FHIR Resource Models (10 Types)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {status.supportedResources.map(res => (
              <span
                key={res}
                className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700"
              >
                {res}
              </span>
            ))}
          </div>
        </div>

        {/* Security & Privacy Notice */}
        <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Healthcare Privacy & De-Identification Notice</span>
          </div>
          <p className="leading-relaxed text-slate-500">
            {status.disclaimer}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
}
