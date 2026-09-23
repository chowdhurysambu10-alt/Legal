import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  ShieldCheck,
  Scale,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Gavel,
  ShieldAlert,
  Building2,
  Clock
} from 'lucide-react';
import RiskFlagsCard from './RiskFlagsCard';
import ChecklistCard from './ChecklistCard';

export default function AnalysisView({ document, analysis }) {
  const [showRawText, setShowRawText] = useState(false);

  if (!document) return null;

  const overallScore = analysis?.overall_risk_score || 'MEDIUM';
  const riskFlags = analysis?.risk_flags || [];
  const checklist = analysis?.checklist || [];
  const keyClauses = analysis?.key_clauses || {};

  const getScoreBadge = (score) => {
    switch (score?.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            High Risk Exposure
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Moderate Risk Exposure
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Low Risk Profile
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Standard Review
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Contract Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {getScoreBadge(overallScore)}
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Fully Analyzed
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {document.filename}
            </h2>

            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Layers size={13} className="text-slate-400" />
                {document.chunk_count || 1} Analyzed Clauses
              </span>
              <span className="flex items-center gap-1.5">
                <FileText size={13} className="text-slate-400" />
                {document.page_count || 1} Pages
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                Uploaded {new Date(document.upload_date).toLocaleDateString()}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowRawText(!showRawText)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
          >
            <FileText size={13} />
            <span>{showRawText ? 'Hide Text' : 'View Contract Text'}</span>
            {showRawText ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Raw Text Drawer */}
        {showRawText && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-500 mb-2">
              Raw Extracted Document Text:
            </div>
            <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {document.raw_preview || 'No preview text available.'}
            </pre>
          </div>
        )}
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Risk Factors
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {riskFlags.length} Flagged
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Action Items
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {checklist.length} Tasks
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Indexed Clauses
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">
            {document.chunk_count || 1} Clauses
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Jurisdiction
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1 truncate">
            {keyClauses.governing_law || 'Delaware'}
          </div>
        </div>
      </div>

      {/* Key Commercial Terms Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Key Commercial Provisions
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Governing Law
            </span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
              {keyClauses.governing_law || 'Delaware'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Dispute Resolution
            </span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
              {keyClauses.dispute_resolution || 'JAMS Arbitration'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Termination Notice
            </span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
              {keyClauses.termination_notice || '30 Days Notice'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Liability Cap
            </span>
            <span className="text-xs font-semibold text-amber-700 mt-0.5 block">
              {keyClauses.liability_cap || '12 Months Fees'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Confidentiality
            </span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
              {keyClauses.confidentiality_duration || '5 Years'}
            </span>
          </div>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <FileText size={15} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Executive Contract Summary</h3>
        </div>
        <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
          {analysis?.summary || 'Extracting executive synthesis...'}
        </div>
      </div>

      {/* Two Column Grid: Risk Flags + Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RiskFlagsCard riskFlags={riskFlags} />
        <ChecklistCard checklist={checklist} />
      </div>
    </div>
  );
}
