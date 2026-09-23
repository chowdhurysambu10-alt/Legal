import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  Search,
  Sparkles,
  Plus,
  AlertTriangle,
  FolderOpen,
  X,
  ChevronRight,
  Scale,
  ArrowRight,
  Clock,
  Layers,
  Bot,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useLegal } from '../context/LegalContext';
import { useNavigate } from 'react-router-dom';
import { getDocumentDetails } from '../services/api';
import ContractDashboard from '../components/ContractDashboard';

function formatUploadDate(isoString) {
  if (!isoString) return 'Recently uploaded';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Recently uploaded';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return 'Recently uploaded';
  }
}

function getRiskBadge(score) {
  const s = (score || '').toUpperCase();
  if (s.includes('HIGH') || s.includes('CRITICAL')) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] inline-flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
        High Risk
      </span>
    );
  }
  if (s.includes('MEDIUM')) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#fef9ee] text-[#b45309] border border-[#fde68a] inline-flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
        Medium Risk
      </span>
    );
  }
  if (s.includes('LOW')) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] inline-flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
        Low Risk
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#f4f7f4] text-[#3d5a41] border border-[#d6e2d4] inline-flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-[#7a9e7d]" />
      Analyzed
    </span>
  );
}

export default function DashboardPage() {
  const {
    user,
    documents,
    setUploadModalOpen,
    deleteDoc,
    uploadFile,
    error,
    dbConnected,
    hasTechnicalProblem,
    refreshHealth
  } = useLegal();
  const navigate = useNavigate();

  // Active contract selection (null = show Selection & History Hub)
  const [activeDocId, setActiveDocId] = useState(null);
  const [activeDoc, setActiveDoc] = useState(null);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [docLoading, setDocLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sampleLoading, setSampleLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Return to hub when clicking workspace/contracts in navbar
  useEffect(() => {
    const handleReset = () => setActiveDocId(null);
    window.addEventListener('reset-dashboard-hub', handleReset);
    return () => window.removeEventListener('reset-dashboard-hub', handleReset);
  }, []);

  // Load contract details and AI analysis when activeDocId changes
  useEffect(() => {
    if (!activeDocId) {
      setActiveDoc(null);
      setActiveAnalysis(null);
      return;
    }
    let isCancelled = false;

    const fetchDetails = async () => {
      try {
        setDocLoading(true);
        const data = await getDocumentDetails(activeDocId);
        if (!isCancelled) {
          setActiveDoc(data.document);
          setActiveAnalysis(data.analysis);
        }
      } catch (err) {
        console.error('Failed to load contract details:', err);
      } finally {
        if (!isCancelled) setDocLoading(false);
      }
    };

    fetchDetails();
    return () => {
      isCancelled = true;
    };
  }, [activeDocId]);

  const handleLoadSample = async () => {
    try {
      setSampleLoading(true);
      const res = await uploadFile(null, true);
      if (res?.document?.id) {
        setActiveDocId(res.document.id);
      }
    } catch (err) {
      console.error('Error loading sample contract:', err);
    } finally {
      setSampleLoading(false);
    }
  };

  const handleDelete = async (docId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this contract from your history?')) return;
    try {
      setDeletingId(docId);
      await deleteDoc(docId);
      if (activeDocId === docId) {
        setActiveDocId(null);
      }
    } catch (err) {
      console.error('Error deleting document:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter documents by search and risk filter
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const score = (doc.overall_risk_score || '').toUpperCase();
    if (riskFilter === 'HIGH') return matchesSearch && (score.includes('HIGH') || score.includes('CRITICAL'));
    if (riskFilter === 'MEDIUM') return matchesSearch && score.includes('MEDIUM');
    if (riskFilter === 'LOW') return matchesSearch && score.includes('LOW');
    return matchesSearch;
  });

  const highRiskCount = documents.filter((d) => (d.overall_risk_score || '').toUpperCase().includes('HIGH')).length;

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
      {/* Database Disconnection / Technical Issue Banner */}
      {hasTechnicalProblem && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={15} className="text-[#dc2626] shrink-0" />
            <span>
              <strong>{dbConnected === false ? 'Database Disconnected' : 'Technical Problem'}:</strong>{' '}
              {error || 'Unable to establish database connection. Please check your service configuration.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => refreshHealth()}
            className="px-2.5 py-1 rounded-md bg-white border border-[#fca5a5] text-[#b91c1c] font-semibold hover:bg-[#fee2e2] transition-colors cursor-pointer shrink-0 text-xs"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* VIEW 1: Active Contract Dashboard (when a contract is chosen) */}
      {activeDocId ? (
        docLoading && !activeDoc ? (
          <div className="bg-white rounded-3xl border border-[#dfe8dc] p-16 flex flex-col items-center justify-center shadow-xs">
            <div className="w-9 h-9 rounded-full border-2 border-[#d9e5d6] border-t-[#3b6e37] animate-spin mb-3" />
            <span className="text-xs font-semibold text-[#48634b]">
              Loading contract analysis & legal chatbot...
            </span>
          </div>
        ) : activeDoc ? (
          <ContractDashboard
            document={activeDoc}
            analysis={activeAnalysis}
            allDocuments={documents}
            onSwitchContract={(newId) => setActiveDocId(newId)}
            onUploadClick={() => setUploadModalOpen(true)}
            onBackToHub={() => setActiveDocId(null)}
          />
        ) : null
      ) : (
        /* VIEW 2: Selection & History Hub (Default screen after login) */
        <div className="flex flex-col gap-8">
          {/* ========================================================
              1. HERO GREETING & STATS
          ======================================================== */}
          <div className="bg-gradient-to-r from-[#18201a] to-[#243327] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#b4f070]/15 via-transparent to-transparent pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#b4f070]/20 text-[#b4f070] border border-[#b4f070]/30 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b4f070] animate-pulse" />
                    Workspace Ready
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-serif-editorial">
                  Welcome, {user?.name || user?.email?.split('@')[0] || 'Legal Counsel'}
                </h1>
              </div>

              {/* Quick Workspace Stats */}
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-5 py-3.5 rounded-2xl flex flex-col items-center min-w-[100px]">
                  <span className="text-3xl font-extrabold text-[#b4f070]">
                    {documents.length}
                  </span>
                  <span className="text-xs uppercase font-extrabold text-[#b0cab4] tracking-wider mt-0.5">
                    Saved Contracts
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-5 py-3.5 rounded-2xl flex flex-col items-center min-w-[100px]">
                  <span className="text-3xl font-extrabold text-amber-400">
                    {highRiskCount}
                  </span>
                  <span className="text-xs uppercase font-extrabold text-[#b0cab4] tracking-wider mt-0.5">
                    High Risk
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              2. OPTIONS TO CHOOSE (User Action Cards)
          ======================================================== */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#355339]">
                Choose an Option
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Upload New Contract */}
              <div
                onClick={() => setUploadModalOpen(true)}
                className="bg-white rounded-3xl border border-[#d8e6d5] p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-[#9bc997] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#edf6ec] text-[#285e26] border border-[#d1e6ce] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <UploadCloud size={24} className="text-[#3b872b]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#18201a] group-hover:text-[#2d6e27] transition-colors">
                    Upload New Contract
                  </h3>
                  <p className="text-sm text-[#4d6651] mt-1.5 leading-relaxed">
                    Upload any PDF agreement to instantly extract key clauses, detect liabilities, and chat with AI.
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#edf4ec] flex items-center justify-between text-xs sm:text-sm font-bold text-[#2d6e27]">
                  <span>Upload PDF</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Option 2: Compare Contracts */}
              <div
                onClick={() => navigate('/compare')}
                className="bg-white rounded-3xl border border-[#d8e6d5] p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-[#9bc997] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#f2f7ef] text-[#285e26] border border-[#d5e7d2] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Scale size={24} className="text-[#3b872b]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#18201a] group-hover:text-[#2d6e27] transition-colors">
                    Compare Contracts
                  </h3>
                  <p className="text-sm text-[#4d6651] mt-1.5 leading-relaxed">
                    Compare two contract versions side-by-side to detect hidden discrepancies, changes, and risk deltas.
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#edf4ec] flex items-center justify-between text-xs sm:text-sm font-bold text-[#2d6e27]">
                  <span>Start Comparison</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              3. USER PAST CONTRACTS HISTORY
          ======================================================== */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#dfe8dc]">
              <div>
                <div className="flex items-center gap-2">
                  <FolderOpen size={18} className="text-[#3b872b]" />
                  <h2 className="text-lg font-bold text-[#18201a]">
                    Your Past Contract History
                  </h2>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#edf6ec] text-[#2d6e27] border border-[#d1e6ce]">
                    {documents.length} Contracts
                  </span>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-[#7e9982]" />
                  <input
                    type="text"
                    placeholder="Search past contracts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-full bg-white border border-[#d6e5d3] text-[#18201a] placeholder:text-[#8ba28e] focus:outline-none focus:border-[#3b872b] focus:ring-1 focus:ring-[#3b872b]"
                  />
                </div>

                {/* Risk Filter Tabs */}
                <div className="flex items-center p-0.5 rounded-full bg-[#edf4ea] border border-[#d6e5d3] text-[11px] font-semibold">
                  {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((rf) => (
                    <button
                      key={rf}
                      type="button"
                      onClick={() => setRiskFilter(rf)}
                      className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                        riskFilter === rf
                          ? 'bg-[#18201a] text-white shadow-2xs'
                          : 'text-[#48634c] hover:text-[#18201a]'
                      }`}
                    >
                      {rf}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Documents Grid / Cards */}
            {filteredDocs.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#dfe8dc] p-12 text-center flex flex-col items-center justify-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#f0f6ee] border border-[#d6e3d2] flex items-center justify-center text-[#375239] mb-3">
                  <FileText size={22} className="text-[#3b6d36]" />
                </div>
                <h3 className="text-sm font-bold text-[#18201a]">
                  {documents.length === 0 ? 'No Contracts Uploaded Yet' : 'No Matching Contracts Found'}
                </h3>
                <p className="text-xs text-[#5a6e5d] max-w-sm mt-1 mb-5 leading-relaxed">
                  {documents.length === 0
                    ? 'Upload your first legal agreement to see clause breakdowns, risk scores, and chat with AI.'
                    : `No contracts match your search "${searchTerm}".`}
                </p>
                {documents.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(true)}
                    className="btn-lime-pill px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UploadCloud size={14} />
                    <span>Upload First Contract</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setActiveDocId(doc.id)}
                    className="bg-white rounded-3xl border border-[#d8e6d5] p-5 shadow-xs hover:shadow-md hover:border-[#9ec99a] transition-all cursor-pointer group flex flex-col justify-between relative"
                  >
                    <div>
                      {/* Top Badges & Delete */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        {getRiskBadge(doc.overall_risk_score)}

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleDelete(doc.id, e)}
                            disabled={deletingId === doc.id}
                            className="p-1.5 rounded-lg text-[#7c9680] hover:text-[#dc2626] hover:bg-[#fee2e2] transition-colors cursor-pointer"
                            title="Delete contract from history"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Filename */}
                      <div className="flex items-start gap-3 mb-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#edf6ec] text-[#2c6e26] flex items-center justify-center shrink-0 mt-0.5 border border-[#d6e7d3]">
                          <FileText size={17} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-base font-extrabold text-[#18201a] group-hover:text-[#2d6e27] transition-colors truncate" title={doc.filename}>
                            {doc.filename}
                          </h4>
                          <span className="text-xs text-[#5f7b63] flex items-center gap-1 mt-0.5 font-medium">
                            <Clock size={12} />
                            {formatUploadDate(doc.upload_date)}
                          </span>
                        </div>
                      </div>

                      {/* Meta Information */}
                      <div className="flex items-center gap-3 text-xs text-[#446047] my-3 py-2 px-3 rounded-xl bg-[#f7faf6] border border-[#e5efe3] font-medium">
                        <span><strong className="font-extrabold text-[#1c3320]">{doc.page_count || 1}</strong> pages</span>
                        <span>&bull;</span>
                        <span><strong className="font-extrabold text-[#1c3320]">{doc.chunk_count || 0}</strong> indexed clauses</span>
                      </div>

                      {/* Summary Snippet if available */}
                      {doc.summary && (
                        <p className="text-xs sm:text-[13px] text-[#415a45] line-clamp-2 leading-relaxed italic mb-3">
                          "{doc.summary.replace(/###/g, '').replace(/\*\*/g, '').trim().slice(0, 140)}..."
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Button */}
                    <div className="pt-3.5 border-t border-[#edf4ec] flex items-center justify-between text-xs sm:text-sm font-bold text-[#2d6e27]">
                      <span className="group-hover:underline flex items-center gap-1.5">
                        <Bot size={15} className="text-[#3b872b]" />
                        <span>Open Analysis & Chat</span>
                      </span>
                      <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
