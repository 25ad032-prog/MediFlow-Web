import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import ConsultationReportModal from './ConsultationReportModal';
import { 
  FolderLock, 
  FileText, 
  UploadCloud, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  Plus, 
  X,
  Eye,
  FileCheck,
  Download,
  Calendar,
  Building2,
  Stethoscope
} from 'lucide-react';

export default function DocumentVault({ onOpenReportModal }) {
  const [documents, setDocuments] = useState([]);
  const [consultationReports, setConsultationReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Diagnostic Report');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'reports' | 'labs'

  const fetchVaultData = async () => {
    setLoading(true);
    try {
      const [docsRes, reportsRes] = await Promise.all([
        api.getDocuments(),
        api.getConsultationReports()
      ]);
      if (docsRes.success) setDocuments(docsRes.data);
      if (reportsRes.success) setConsultationReports(reportsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultData();
  }, []);

  const handleToggleShare = async (docId) => {
    try {
      const res = await api.toggleDocumentShare(docId);
      if (res.success) {
        setDocuments(prev => prev.map(d => d.id === docId ? res.data : d));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await api.uploadDocument({
        title: newTitle,
        category: newCategory,
        doctor: "Dr. Priya Sharma",
        hospital: "Apollo Hospital Diagnostic Labs",
        status: "Verified by Clinical Pathology"
      });
      if (res.success) {
        setDocuments(prev => [res.data, ...prev]);
        setShowUploadModal(false);
        setNewTitle('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Medical Document Vault & Health Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chronological clinical records, physician consultation summaries & downloadable PDF reports.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Record</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 text-xs font-bold">
        {[
          { id: 'all', label: 'All Records' },
          { id: 'reports', label: `Consultation Reports (${consultationReports.length})` },
          { id: 'labs', label: `Lab Panels & Scans (${documents.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl border transition-all ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TIMELINE VIEW OF MEDICAL RECORDS */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 rounded-3xl bg-white/70 border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* 1. Official Consultation Reports Section */}
          {(activeTab === 'all' || activeTab === 'reports') && consultationReports.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4" />
                <span>Physician Consultation Reports</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consultationReports.map(report => (
                  <div
                    key={report.id}
                    className="p-5 rounded-3xl bg-white border border-teal-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-teal-400 transition-all relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0 border border-teal-100">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                            {report.doctorSpecialty} Consultation
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">{report.doctorName}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{report.hospital} • {report.date}</p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                        Completed
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-1">
                      <p className="text-slate-800 font-semibold truncate">
                        <strong>Diagnosis/Summary:</strong> {report.clinicalSummary}
                      </p>
                      <p className="text-slate-500 truncate">
                        <strong>Chief Complaint:</strong> {report.chiefComplaint}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="flex-1 py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-teal-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>[ View Report ]</span>
                      </button>

                      <a
                        href={api.getConsultationReportPdfUrl(report.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>[ Download PDF ]</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Uploaded Diagnostic Documents & Lab Tests Section */}
          {(activeTab === 'all' || activeTab === 'labs') && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FolderLock className="w-4 h-4" />
                <span>Laboratory Tests & Diagnostic Panels</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-teal-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                          <FileText className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm leading-tight">{doc.title}</h3>
                          <p className="text-xs text-teal-700 font-semibold mt-0.5">{doc.category} • {doc.date}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{doc.hospital} ({doc.fileSize})</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleShare(doc.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                          doc.isSharedWithDoctor
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{doc.isSharedWithDoctor ? 'Shared' : 'Private'}</span>
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                      <span className="truncate max-w-[240px]">Status: <strong className="text-teal-700">{doc.status}</strong></span>
                      <button
                        onClick={() => alert(`Opening diagnostic preview for ${doc.title}... (Demo File Viewer)`)}
                        className="text-teal-700 hover:underline font-semibold shrink-0 ml-2"
                      >
                        View File
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Upload Record Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 relative shadow-xl">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-teal-600" />
              <span>Add Medical Document</span>
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Lipid Profile & Cholesterol Report"
                  className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input text-slate-900 text-xs bg-white"
                >
                  <option value="Blood Test">Blood Test / Pathology</option>
                  <option value="Cardiology">Cardiology / ECG</option>
                  <option value="Radiology Scan">Radiology / X-Ray / MRI</option>
                  <option value="Prescription">Doctor Prescription</option>
                  <option value="Vaccination">Vaccination Record</option>
                </select>
              </div>

              <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
                <FileCheck className="w-8 h-8 mx-auto mb-1 text-teal-600 opacity-60" />
                <span>Simulated Demo File Attached (PDF / 1.5MB)</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm"
              >
                Save To Medical Vault
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Consultation Report Viewer Modal */}
      {selectedReport && (
        <ConsultationReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}

    </div>
  );
}
