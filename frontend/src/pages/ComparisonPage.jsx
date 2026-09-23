import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Files,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Scale,
  ShieldAlert,
  ArrowRightLeft,
  Sparkles
} from 'lucide-react';
import { useLegal } from '../context/LegalContext';
import { compareDocuments } from '../services/api';

export default function ComparisonPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { documents } = useLegal();

  const [doc1Id, setDoc1Id] = useState(searchParams.get('doc1') || '');
  const [doc2Id, setDoc2Id] = useState(searchParams.get('doc2') || '');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [layoutTab, setLayoutTab] = useState('side-by-side'); // 'side-by-side' | 'table'

  // If IDs are present in URL or changed, execute comparison
  useEffect(() => {
    if (documents.length >= 2 && (!doc1Id || !doc2Id)) {
      setDoc1Id(documents[0].id);
      setDoc2Id(documents[1].id);
    }
  }, [documents]);

  useEffect(() => {
    if (doc1Id && doc2Id && doc1Id !== doc2Id) {
      runComparison(doc1Id, doc2Id);
    }
  }, [doc1Id, doc2Id]);

  const runComparison = async (id1, id2) => {
    try {
      setLoading(true);
      setError(null);
      const res = await compareDocuments(id1, id2);
      setComparison(res);
      setSearchParams({ doc1: id1, doc2: id2 });
    } catch (err) {
      setError(err.message || 'Failed to compare documents');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'High Divergence':
      case 'Inconsistent':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle size={11} />
            <span>{status}</span>
          </span>
        );
      case 'Minor Variation':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={11} />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5a715d] hover:text-[#18201a] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </button>

        {/* Layout Toggle */}
        <div className="flex p-1 bg-[#edf4ea] rounded-full border border-[#dce8da]">
          <button
            type="button"
            onClick={() => setLayoutTab('side-by-side')}
            className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all ${
              layoutTab === 'side-by-side'
                ? 'bg-[#18201a] text-white shadow-2xs'
                : 'text-[#4c6450] hover:text-[#18201a]'
            }`}
          >
            Side-by-Side Cards
          </button>
          <button
            type="button"
            onClick={() => setLayoutTab('table')}
            className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all ${
              layoutTab === 'table'
                ? 'bg-[#18201a] text-white shadow-2xs'
                : 'text-[#4c6450] hover:text-[#18201a]'
            }`}
          >
            Matrix Table
          </button>
        </div>
      </div>

      {/* Contract Selector Bar */}
      <div className="bg-white rounded-3xl border border-[#dfe8dc] p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#edf5eb] border border-[#d5e7d2] flex items-center justify-center text-[#2f662a]">
            <ArrowRightLeft size={16} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#18201a] font-serif-editorial">
              Multi-Contract Clause Comparison
            </h2>
            <p className="text-xs text-[#526a54]">
              Benchmark terms, identify inconsistencies, and detect risk exposure divergence
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Document 1 Selector */}
          <div>
            <label className="text-[11px] font-bold text-[#4c6450] uppercase tracking-wider block mb-1.5">
              Reference Document (Document A)
            </label>
            <select
              value={doc1Id}
              onChange={(e) => setDoc1Id(e.target.value)}
              className="w-full px-3.5 py-2 rounded-full border border-[#dce8da] bg-[#fafcf9] text-xs font-semibold text-[#18201a] focus:outline-none focus:border-[#4b6b4e]"
            >
              <option value="">Select Document A...</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename}
                </option>
              ))}
            </select>
          </div>

          {/* Document 2 Selector */}
          <div>
            <label className="text-[11px] font-bold text-[#4c6450] uppercase tracking-wider block mb-1.5">
              Comparison Document (Document B)
            </label>
            <select
              value={doc2Id}
              onChange={(e) => setDoc2Id(e.target.value)}
              className="w-full px-3.5 py-2 rounded-full border border-[#dce8da] bg-[#fafcf9] text-xs font-semibold text-[#18201a] focus:outline-none focus:border-[#4b6b4e]"
            >
              <option value="">Select Document B...</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-[#dfe8dc] p-16 text-center shadow-xs flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#d9e5d6] border-t-[#3b6e37] animate-spin" />
          <span className="text-xs font-semibold text-[#48634b]">
            Comparing clause provisions & compiling legal deltas...
          </span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-[#fdf2f2] border border-[#f5cfcf] text-xs text-[#962626]">
          {error}
        </div>
      ) : !comparison ? (
        <div className="bg-white rounded-3xl border border-[#dfe8dc] p-12 text-center text-[#69826c] text-xs">
          Select two documents above to generate side-by-side clause differences.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Executive Delta Summary */}
          <div className="bg-white rounded-3xl border border-[#dfe8dc] p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#eaf7e6] text-[#2c6e26] border border-[#cbe6c4]">
                Comparative Synthesis
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {comparison.overall_summary}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Comparing <strong className="text-slate-800">{comparison.doc1.filename}</strong> (Risk: {comparison.doc1_risk}) vs <strong className="text-slate-800">{comparison.doc2.filename}</strong> (Risk: {comparison.doc2_risk})
            </p>
          </div>

          {/* Side-by-Side Clause Cards or Table */}
          {layoutTab === 'side-by-side' ? (
            <div className="flex flex-col gap-4">
              {comparison.comparison_domains.map((domain, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-sm font-bold text-slate-900">{domain.domain}</span>
                    {getStatusBadge(domain.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Doc 1 Value */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        {comparison.doc1.filename}
                      </span>
                      <p className="text-xs font-semibold text-slate-800">{domain.doc1_value}</p>
                    </div>

                    {/* Doc 2 Value */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        {comparison.doc2.filename}
                      </span>
                      <p className="text-xs font-semibold text-slate-800">{domain.doc2_value}</p>
                    </div>
                  </div>

                  {/* Notable Legal Delta */}
                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900 leading-relaxed">
                    <strong className="font-semibold text-blue-800">Counsel Delta Note: </strong>
                    {domain.delta_notes}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Matrix Table Layout */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Legal Domain</th>
                    <th className="p-4">{comparison.doc1.filename}</th>
                    <th className="p-4">{comparison.doc2.filename}</th>
                    <th className="p-4">Consistency Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {comparison.comparison_domains.map((domain, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">{domain.domain}</td>
                      <td className="p-4 max-w-xs">{domain.doc1_value}</td>
                      <td className="p-4 max-w-xs">{domain.doc2_value}</td>
                      <td className="p-4">{getStatusBadge(domain.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
