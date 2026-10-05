import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
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
  FileCheck
} from 'lucide-react';

export default function DocumentVault() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Diagnostic Report');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.getDocuments();
      if (res.success) setDocuments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
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
        hospital: "Apollo Hospital Labs",
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
            Medical Document Vault
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Securely store diagnostic reports, ECGs, blood work & share instantly with consulting doctors.
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

      {/* Documents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-3xl bg-white/70 border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map(doc => (
            <div
              key={doc.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-teal-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                    <FileText className="w-6 h-6" />
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
                <span>Status: <strong className="text-teal-700">{doc.status}</strong></span>
                <button
                  onClick={() => alert(`Opening preview for ${doc.title}... (Demo PDF Viewer)`)}
                  className="text-teal-700 hover:underline font-semibold"
                >
                  View File
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
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

    </div>
  );
}
