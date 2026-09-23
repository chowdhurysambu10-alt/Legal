import React, { useState } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Shield,
  CreditCard,
  Clock,
  AlertCircle,
  FileText,
  CheckCircle,
  Gavel
} from 'lucide-react';

export default function ClauseGroupCard({ keyClauses = {}, rawPreview = '' }) {
  const [expandedGroup, setExpandedGroup] = useState('liability');

  const clauseGroups = [
    {
      id: 'liability',
      title: 'Liability & Indemnification Terms',
      icon: <Shield size={17} className="text-rose-600" />,
      badge: 'High Impact',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      summary: keyClauses.liability_cap || 'Waiver of consequential damages with standard aggregate fee ceiling.',
      details: [
        { label: 'Liability Cap Ceiling', value: keyClauses.liability_cap || '12 Months Fees Paid' },
        { label: 'Indemnification Scope', value: 'Broad third-party defense obligation for IP infringement & willful acts' },
        { label: 'Carve-outs', value: 'Gross negligence and confidentiality breaches excluded from liability ceiling' }
      ]
    },
    {
      id: 'termination',
      title: 'Termination Terms & Cure Periods',
      icon: <Clock size={17} className="text-amber-600" />,
      badge: 'Material Term',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      summary: keyClauses.termination_notice || '30 Days written notice for cause; 60 days advance notice for non-renewal.',
      details: [
        { label: 'Termination Notice', value: keyClauses.termination_notice || '30 Days Written Notice' },
        { label: 'Cure Period for Breach', value: 'Mandatory 30-day written cure window before termination takes effect' },
        { label: 'Post-Termination Transition', value: 'Prompt return of proprietary assets and payment of all accrued undisputed fees' }
      ]
    },
    {
      id: 'payment',
      title: 'Payment Terms & Invoicing Deadlines',
      icon: <CreditCard size={17} className="text-blue-600" />,
      badge: 'Financial',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      summary: 'Net 30 calendar days upon receipt of undisputed invoice; late fee accrual at 1.5% per month.',
      details: [
        { label: 'Payment Terms', value: 'Net 30 days from undisputed invoice date' },
        { label: 'Late Balances', value: '1.5% monthly late interest penalty or statutory max' },
        { label: 'Audit Rights', value: 'Annual accounting verification upon advance written notice' }
      ]
    },
    {
      id: 'obligations',
      title: 'Core Obligations & Intellectual Property',
      icon: <FileText size={17} className="text-indigo-600" />,
      badge: 'Operational',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      summary: 'Standard commercial performance warranty; deliverables constitute work-made-for-hire assigned to Company.',
      details: [
        { label: 'Work Product Ownership', value: 'Complete assignment of all inventions, copyrights, and deliverables' },
        { label: 'Pre-existing Tools License', value: 'Perpetual, royalty-free, non-exclusive license for pre-existing IP' },
        { label: 'Service Benchmark', value: 'High diligence complying with professional commercial standards' }
      ]
    },
    {
      id: 'compliance',
      title: 'Governing Law & Dispute Resolution',
      icon: <Gavel size={17} className="text-slate-600" />,
      badge: 'Jurisdiction',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      summary: `${keyClauses.governing_law || 'Delaware'} statutory law with ${keyClauses.dispute_resolution || 'JAMS Arbitration'}.`,
      details: [
        { label: 'Governing Jurisdiction', value: keyClauses.governing_law || 'Delaware (Excluding Conflicts of Law)' },
        { label: 'Dispute Venue', value: keyClauses.dispute_resolution || 'JAMS Comprehensive Binding Arbitration' },
        { label: 'Confidentiality Survival', value: keyClauses.confidentiality_duration || '5 Years post-expiration; trade secrets perpetual' }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#dfe8dc] p-6 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#edf5eb] border border-[#d5e7d2] flex items-center justify-center text-[#2f662a]">
            <Layers size={17} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#18201a] font-serif-editorial">
              Key Clauses Breakdown
            </h3>
            <p className="text-xs text-[#526a54]">Categorized by legal and operational impact</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {clauseGroups.map((group) => {
          const isExpanded = expandedGroup === group.id;
          return (
            <div
              key={group.id}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'border-slate-300 bg-slate-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div
                onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                    {group.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{group.title}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-md border ${group.badgeColor}`}>
                        {group.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{group.summary}</p>
                  </div>
                </div>

                <button type="button" className="text-slate-400 hover:text-slate-600 p-1">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-200/70 grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-1">
                  {group.details.map((d, dIdx) => (
                    <div key={dIdx} className="p-3 rounded-lg bg-white border border-slate-200/80">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        {d.label}
                      </span>
                      <span className="text-xs font-medium text-slate-800 mt-1 block">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
