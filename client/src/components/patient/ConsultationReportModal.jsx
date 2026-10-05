import React from 'react';
import { api } from '../../utils/api';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Stethoscope, 
  Calendar, 
  Clock, 
  MapPin, 
  Building2,
  ShieldCheck
} from 'lucide-react';

export default function ConsultationReportModal({ report, onClose }) {
  if (!report) return null;

  const pdfUrl = api.getConsultationReportPdfUrl(report.id);

  const handleDownload = () => {
    window.open(pdfUrl, '_blank');
  };

  const handlePrint = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-700 border border-teal-600 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">Official Consultation Report</h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-600 text-[10px] font-bold uppercase tracking-wider">
                  Verified
                </span>
              </div>
              <p className="text-xs text-teal-200">DOCBEE MediFlow Clinical Network • Report #{report.id?.toUpperCase()}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-teal-700/60 hover:bg-teal-700 text-teal-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 text-xs">
          
          {/* Patient & Doctor Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Patient Meta Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Patient Information
              </span>
              <p className="font-bold text-sm text-slate-900">{report.patientName}</p>
              <p className="text-slate-600">Age: {report.patientAge} yrs • Gender: {report.patientGender}</p>
              <p className="text-slate-600">Patient ID: <span className="font-mono">{report.patientId}</span></p>
              <p className="text-teal-700 font-semibold flex items-center gap-1 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Visit: {report.date} at {report.time}</span>
              </p>
            </div>

            {/* Doctor Meta Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Consulting Physician
              </span>
              <p className="font-bold text-sm text-slate-900">{report.doctorName}</p>
              <p className="text-teal-700 font-semibold">{report.doctorSpecialty}</p>
              <p className="text-slate-600 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{report.hospital}</span>
              </p>
              <p className="text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{report.location}, India</span>
              </p>
            </div>

          </div>

          {/* Section 1: Chief Complaint & Symptoms */}
          <div className="space-y-1.5 border-t border-slate-100 pt-4">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-teal-800">
              1. Chief Complaint & Reported Symptoms
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">{report.chiefComplaint}</p>
              <p className="text-slate-600 leading-relaxed">{report.symptomsReported}</p>
              {report.patientProvidedInfo && (
                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 mt-1 italic">
                  Patient Intake: {report.patientProvidedInfo}
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Doctor Clinical Observations */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-teal-800">
              2. Clinical Examination & Observations
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-slate-700 leading-relaxed">{report.doctorObservations}</p>
              {report.doctorNotes && (
                <p className="text-slate-600 pt-1 border-t border-slate-200/60 mt-1">
                  <strong>Physician Notes:</strong> {report.doctorNotes}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Clinical Summary & Assessment */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-teal-800">
              3. Clinical Summary & Assessment
            </h4>
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-1">
              <p className="font-bold text-teal-950 leading-relaxed">{report.clinicalSummary}</p>
            </div>
          </div>

          {/* Section 4: Physician Advice & Follow-Up */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-teal-800">
              4. Treatment Advice & Follow-Up Plan
            </h4>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{report.advice}</p>
              
              {report.followUp?.recommended && (
                <div className="p-2.5 rounded-xl bg-white border border-teal-200 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-teal-800">
                    Recommended Follow-up: {report.followUp.recommendedDate}
                  </span>
                  <span className="text-slate-500">Reason: {report.followUp.reason}</span>
                </div>
              )}
            </div>
          </div>

          {/* Authenticity & Authorization Footer */}
          <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 text-teal-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Electronically signed & verified by Dr. {report.doctorName}</span>
            </div>
            <span className="font-mono text-[10px]">Status: COMPLETED</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
