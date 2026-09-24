import React from 'react';
import { FileText, Trash2, Clock, Layers, ChevronRight, FolderOpen, AlertTriangle, ShieldCheck } from 'lucide-react';
import { deleteDocument } from '../services/api';

export default function DocumentHistory({
  documents = [],
  activeDocId,
  onSelectDoc,
  onDocDeleted
}) {
  const handleDelete = async (e, docId) => {
    e.stopPropagation();
    if (window.confirm('Remove this contract from your library?')) {
      try {
        await deleteDocument(docId);
        onDocDeleted(docId);
      } catch (err) {
        alert('Failed to delete document: ' + err.message);
      }
    }
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '12 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Recent Contracts
          </span>
          <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
            {documents.length}
          </span>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-xl bg-slate-50/50 border border-slate-100 flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
            <FolderOpen size={18} />
          </div>
          <span className="text-xs font-semibold text-slate-700">No documents yet</span>
          <span className="text-[11px] text-slate-500 mt-0.5">
            Upload a contract or run a quick demo above to get started.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-[360px] overflow-y-auto pr-0.5">
          {documents.map((doc) => {
            const isActive = doc.id === activeDocId;
            return (
              <div
                key={doc.id}
                id={`doc-card-${doc.id}`}
                onClick={() => onSelectDoc(doc.id)}
                className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isActive
                    ? 'bg-blue-50/40 border-blue-200 shadow-xs'
                    : 'bg-white hover:bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}>
                      <FileText size={14} />
                    </div>
                    <span className={`text-xs font-semibold truncate ${
                      isActive ? 'text-blue-900' : 'text-slate-800'
                    }`} title={doc.filename}>
                      {doc.filename}
                    </span>
                  </div>

                  <button
                    type="button"
                    title="Delete document"
                    onClick={(e) => handleDelete(e, doc.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pl-9.5">
                  <span>{formatSize(doc.file_size)}</span>
                  <span>{formatDate(doc.upload_date)}</span>
                  {doc.overall_risk_score && (
                    <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                      doc.overall_risk_score.toUpperCase() === 'HIGH' || doc.overall_risk_score.toUpperCase() === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {doc.overall_risk_score.toUpperCase()} RISK
                    </span>
                  )}
                  <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                    {doc.chunk_count || 1} chunks
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
