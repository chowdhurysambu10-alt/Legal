import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, ChevronDown, ChevronUp, Quote } from 'lucide-react';

export default function RiskFlagsCard({ riskFlags = [] }) {
  const [filter, setFilter] = useState('ALL');
  const [expandedIndex, setExpandedIndex] = useState(0);

  const filteredRisks = riskFlags.filter((r) => {
    if (filter === 'ALL') return true;
    return r.severity === filter;
  });

  const getSeverityBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            {severity} Risk
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            {severity} Risk
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {severity} Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Standard
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#dfe8dc] p-6 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#faebeb] border border-[#f5cfcf] flex items-center justify-center text-[#ab3131]">
            <ShieldAlert size={17} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#18201a] font-serif-editorial">Legal Risk Exposure</h3>
            <p className="text-xs text-[#526a54]">{riskFlags.length} flagged risk factors</p>
          </div>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex p-1 bg-[#edf4ea] rounded-full border border-[#dce8da]">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`px-3 py-0.5 text-[11px] font-semibold rounded-full transition-all ${
                filter === s
                  ? 'bg-[#18201a] text-white shadow-2xs'
                  : 'text-[#4c6450] hover:text-[#18201a]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filteredRisks.length === 0 ? (
        <div className="py-10 text-center rounded-xl bg-slate-50/60 border border-slate-100 flex flex-col items-center">
          <ShieldCheck size={28} className="text-emerald-500 mb-2" />
          <span className="text-xs font-semibold text-slate-700">No risks at this filter level</span>
          <span className="text-[11px] text-slate-500 mt-0.5">
            This section is compliant with standard legal guidelines.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredRisks.map((risk, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all p-4 shadow-2xs"
              >
                <div
                  className="flex items-start justify-between cursor-pointer gap-3"
                  onClick={() => setExpandedIndex(isExpanded ? -1 : idx)}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(risk.severity)}
                      {risk.category && (
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {risk.category}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 mt-0.5">
                      {risk.title}
                    </h4>
                  </div>

                  <button
                    type="button"
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Excerpt */}
                {risk.clause_excerpt && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-700">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <Quote size={11} />
                      Contract Clause Excerpt
                    </div>
                    "{risk.clause_excerpt}"
                  </div>
                )}

                {/* Analysis */}
                <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                  {risk.analysis}
                </p>

                {/* Recommendation */}
                {risk.recommendation && (
                  <div className="mt-3 p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-900">
                    <span className="font-semibold text-blue-800 uppercase tracking-wider text-[10px] block mb-1">
                      Negotiation / Redline Strategy:
                    </span>
                    {risk.recommendation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
