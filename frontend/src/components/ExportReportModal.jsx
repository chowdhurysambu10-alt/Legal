import React, { useEffect, useRef } from 'react';
import { Download, Printer, X, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ExportReportModal({ isOpen, onClose, document, analysis }) {
  const modalRef = useRef(null);

  // WCAG 2.1 Focus Trap & Keyboard Escape
  useEffect(() => {
    if (!isOpen || !document || !analysis) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    setTimeout(() => {
      modalRef.current?.querySelector('button')?.focus();
    }, 50);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, document, analysis]);

  if (!isOpen || !document || !analysis) return null;


  const handlePrint = () => {
    window.print();
  };

  const riskFlags = analysis.risk_flags || [];
  const checklist = analysis.checklist || [];
  const keyClauses = analysis.key_clauses || {};

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 print:p-0 print:bg-white"
    >
      <div className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 shadow-xl max-h-[90vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-h-none">
        {/* Modal Header (hidden during print) */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 print:hidden">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-600" aria-hidden="true" />
            <h3 id="export-modal-title" className="text-sm font-bold text-slate-900">Legal Executive Summary Report</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
            >
              <Printer size={13} />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 font-sans" id="printable-report">
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Legal Contract Intelligence Brief
              </span>
              <span className="text-xs text-slate-400">
                Generated {new Date().toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {document.filename}
            </h1>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
              <span>Overall Risk Rating: <strong className="text-slate-900">{analysis.overall_risk_score}</strong></span>
              <span>&bull;</span>
              <span>Analyzed Clauses: {document.chunk_count || 1}</span>
              <span>&bull;</span>
              <span>Governing Jurisdiction: {keyClauses.governing_law || 'Delaware'}</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
              Executive Brief
            </h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {analysis.summary}
            </div>
          </div>

          {/* Key Commercial Terms */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
              Key Commercial Terms
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] font-semibold text-slate-400 block">Governing Law</span>
                <span className="text-xs font-bold text-slate-800">{keyClauses.governing_law || 'Delaware'}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] font-semibold text-slate-400 block">Dispute Forum</span>
                <span className="text-xs font-bold text-slate-800">{keyClauses.dispute_resolution || 'Binding Arbitration'}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] font-semibold text-slate-400 block">Liability Cap</span>
                <span className="text-xs font-bold text-slate-800">{keyClauses.liability_cap || '12 Months Fees'}</span>
              </div>
            </div>
          </div>

          {/* Risk Flags Table */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-rose-600" />
              <span>Identified Risk Factors ({riskFlags.length})</span>
            </h2>
            <div className="space-y-2.5">
              {riskFlags.map((r, i) => (
                <div key={i} className="p-3 rounded-xl border border-slate-200 bg-white text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                    <span>{r.title}</span>
                    <span className="px-2 py-0.2 rounded-md bg-rose-50 text-rose-700 text-[10px]">
                      {r.severity} Risk
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mb-1">{r.analysis}</p>
                  <p className="text-blue-800 text-[11px] font-medium bg-blue-50/50 p-2 rounded-lg">
                    <strong>Counsel Recommendation:</strong> {r.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Checklist */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Counsel Action Items ({checklist.length})</span>
            </h2>
            <ul className="space-y-1.5">
              {checklist.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="w-4 h-4 rounded border border-slate-300 shrink-0 mt-0.5" />
                  <span>{c.task} <strong className="text-slate-400 font-normal">({c.priority})</strong></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
