import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Send,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  Bot,
  User,
  BookOpen,
  Copy,
  Check,
  DollarSign,
  Building,
  MapPin,
  Shield,
  Calendar,
  Clock,
  Zap,
  AlertCircle,
  Users,
  Home,
  Briefcase,
  Scale,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { parseImportantClauses } from '../utils/contractIntelligence';
import { askRagQuestion, getChatHistory, clearChatHistory } from '../services/api';

function renderHighlightIcon(iconName, size = 15) {
  switch (iconName) {
    case 'DollarSign': return <DollarSign size={size} />;
    case 'User': return <User size={size} />;
    case 'Building': return <Building size={size} />;
    case 'Home': return <Home size={size} />;
    case 'Shield': return <Shield size={size} />;
    case 'Calendar': return <Calendar size={size} />;
    case 'Clock': return <Clock size={size} />;
    case 'Zap': return <Zap size={size} />;
    case 'AlertCircle': return <AlertCircle size={size} />;
    case 'Users': return <Users size={size} />;
    case 'Briefcase': return <Briefcase size={size} />;
    case 'Scale': return <Scale size={size} />;
    default: return <FileText size={size} />;
  }
}

function getHighlightColorStyles(color) {
  switch (color) {
    case 'emerald':
      return {
        bg: 'bg-emerald-50/60 hover:bg-emerald-50/90 border-emerald-200/90',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        iconBg: 'bg-emerald-600 text-white',
        text: 'text-emerald-950',
      };
    case 'blue':
      return {
        bg: 'bg-blue-50/60 hover:bg-blue-50/90 border-blue-200/90',
        badge: 'bg-blue-100 text-blue-800 border-blue-300',
        iconBg: 'bg-blue-600 text-white',
        text: 'text-blue-950',
      };
    case 'indigo':
      return {
        bg: 'bg-indigo-50/60 hover:bg-indigo-50/90 border-indigo-200/90',
        badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        iconBg: 'bg-indigo-600 text-white',
        text: 'text-indigo-950',
      };
    case 'amber':
      return {
        bg: 'bg-amber-50/60 hover:bg-amber-50/90 border-amber-200/90',
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        iconBg: 'bg-amber-600 text-white',
        text: 'text-amber-950',
      };
    case 'rose':
      return {
        bg: 'bg-rose-50/60 hover:bg-rose-50/90 border-rose-200/90',
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        iconBg: 'bg-rose-600 text-white',
        text: 'text-rose-950',
      };
    case 'teal':
    case 'cyan':
      return {
        bg: 'bg-teal-50/60 hover:bg-teal-50/90 border-teal-200/90',
        badge: 'bg-teal-100 text-teal-800 border-teal-300',
        iconBg: 'bg-teal-600 text-white',
        text: 'text-teal-950',
      };
    default:
      return {
        bg: 'bg-[#f8faf7] hover:bg-[#f2f7f1] border-[#dbe6da]',
        badge: 'bg-[#e7f0e5] text-[#27462a] border-[#cddfc9]',
        iconBg: 'bg-[#3b872b] text-white',
        text: 'text-[#18201a]',
      };
  }
}

function formatBold(str) {
  if (!str) return '';
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-[#112413]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-xs sm:text-[13px]">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;
        
        // Headings
        if (trimmed.startsWith('### ')) {
          return <h4 key={idx} className="font-bold text-[#15341a] text-xs sm:text-[13px] mt-2 pb-0.5 border-b border-[#e5efe3]">{trimmed.slice(4)}</h4>;
        }
        if (trimmed.startsWith('## ')) {
          return <h3 key={idx} className="font-bold text-[#15341a] text-sm mt-2">{trimmed.slice(3)}</h3>;
        }
        if (trimmed.startsWith('# ')) {
          return <h2 key={idx} className="font-bold text-[#15341a] text-base mt-2">{trimmed.slice(2)}</h2>;
        }
        
        // Blockquote
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={idx} className="pl-3 py-1 my-1 border-l-2 border-[#4da832] bg-[#f0f7ee] rounded-r-lg text-[11px] text-[#234225] italic font-mono">
              {trimmed.slice(2)}
            </blockquote>
          );
        }
        
        // Bullet item
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const content = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1 text-[#1f3322]">
              <span className="text-[#3b872b] font-bold mt-0.5">•</span>
              <span>{formatBold(content)}</span>
            </div>
          );
        }
        
        // Horizontal rule
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={idx} className="border-t border-[#dce8da] my-2" />;
        }
        
        return <p key={idx} className="text-[#1c301f] leading-relaxed">{formatBold(line)}</p>;
      })}
    </div>
  );
}

export default function ContractDashboard({
  document,
  analysis,
  onSwitchContract,
  allDocuments = [],
  onUploadClick,
  onBackToHub
}) {
  const data = parseImportantClauses(document, analysis);

  // Selected clause for detailed inline view
  const [selectedClauseId, setSelectedClauseId] = useState(null);

  // View full contract modal
  const [showFullContractModal, setShowFullContractModal] = useState(false);

  // Deal highlights view toggle
  const [showAllHighlights, setShowAllHighlights] = useState(false);

  // AI Chatbot State (Side Panel)
  const [aiQuestion, setAiQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [expandedSources, setExpandedSources] = useState({});
  const aiInputRef = useRef(null);
  const chatStreamEndRef = useRef(null);

  useEffect(() => {
    if (!document?.id) return;
    loadChatMessages(document.id);
  }, [document?.id]);

  useEffect(() => {
    chatStreamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, aiLoading]);

  const loadChatMessages = async (docId) => {
    try {
      const history = await getChatHistory(docId);
      if (history && history.length > 0) {
        const formatted = [];
        for (let i = 0; i < history.length; i++) {
          const item = history[i];
          if (item.role === 'user') {
            const next = history[i + 1];
            if (next && next.role === 'assistant') {
              formatted.push({
                question: item.content,
                answer: next.content,
                citations: next.sources || []
              });
              i++;
            } else {
              formatted.push({
                question: item.content,
                answer: null,
                citations: []
              });
            }
          }
        }
        setChatHistory(formatted);
      } else {
        setChatHistory([]);
      }
    } catch (err) {
      console.warn('Could not load chat history:', err);
    }
  };

  const handleClearChat = async () => {
    if (!document?.id) return;
    try {
      await clearChatHistory(document.id);
    } catch (err) {
      console.warn('Failed to clear chat on server:', err);
    }
    setChatHistory([]);
  };

  const handleCopyText = (text, idx) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const toggleSources = (idx) => {
    setExpandedSources((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (!data) return null;

  const handleAskAI = async (queryText) => {
    const q = (queryText || aiQuestion).trim();
    if (!q || !document?.id || aiLoading) return;

    const newEntry = { question: q, answer: null, citations: [] };
    setChatHistory((prev) => [...prev, newEntry]);
    setAiQuestion('');
    setAiLoading(true);

    try {
      const res = await askRagQuestion(document.id, q);
      setChatHistory((prev) =>
        prev.map((item, idx) =>
          idx === prev.length - 1
            ? { ...item, answer: res.answer, citations: res.citations || [] }
            : item
        )
      );
    } catch (err) {
      setChatHistory((prev) =>
        prev.map((item, idx) =>
          idx === prev.length - 1
            ? {
                ...item,
                answer: '⚠️ Unable to retrieve an answer at this time. Please check your backend connection.',
                citations: []
              }
            : item
        )
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleAskAboutClause = (clauseTitle) => {
    const q = `What are the practical implications of the "${clauseTitle}" clause for me?`;
    setAiQuestion(q);
    aiInputRef.current?.focus();
    handleAskAI(q);
  };

  const handleAskAboutHighlight = (item) => {
    const q = item.promptQuestion || `Explain the terms and conditions regarding "${item.label}" (${item.value}) in this contract.`;
    setAiQuestion(q);
    aiInputRef.current?.focus();
    handleAskAI(q);
  };

  const getRiskBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]">
            HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#fef9ee] text-[#b45309] border border-[#fde68a]">
            MEDIUM RISK
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]">
            LOW RISK
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-12">
      {/* Back to Workspace / History Button */}
      {onBackToHub && (
        <div className="flex items-center justify-between -mb-2">
          <button
            type="button"
            onClick={onBackToHub}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#edf5ea] text-[#244227] border border-[#d6e5d3] hover:border-[#9ec998] text-xs font-bold shadow-2xs transition-all cursor-pointer hover:shadow-xs active:scale-98"
          >
            <ArrowLeft size={13} className="text-[#3b872b]" />
            <span>&larr; Back to Workspace & History</span>
          </button>
        </div>
      )}

      {/* ========================================================
          1. CONTRACT HEADER (Compact)
      ======================================================== */}
      <div className="bg-white rounded-2xl border border-[#dfe8dc] px-5 py-4 sm:px-6 sm:py-4.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Name, Type, Status */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-[#2c4c2f] bg-[#eef5eb] border border-[#d6e7d3] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4da832]" />
                Analyzed
              </span>
              <span className="text-[11px] font-medium text-[#627a65] bg-[#f5f8f4] border border-[#e1ece0] px-2 py-0.5 rounded-full">
                {data.contractType}
              </span>
              <span className="text-[11px] text-[#7d9480]">
                {data.uploadDate}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-[#18201a] tracking-tight font-serif-editorial truncate">
                {data.contractName}
              </h1>

              {/* Contract Switcher (if multiple contracts available) */}
              {allDocuments.length > 1 && onSwitchContract && (
                <select
                  value={document.id}
                  onChange={(e) => onSwitchContract(e.target.value)}
                  className="text-xs bg-[#f4f8f2] border border-[#d8e5d5] text-[#2c472f] font-semibold rounded-full px-2.5 py-0.5 cursor-pointer focus:outline-none focus:border-[#4b6b4e] shrink-0"
                >
                  {allDocuments.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.filename}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowFullContractModal(true)}
              className="px-3.5 py-1.5 rounded-full border border-[#dce8da] bg-white hover:bg-[#fafcf9] text-xs font-bold text-[#2d4e30] inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <FileText size={13} className="text-[#3b623f]" />
              <span>View Contract</span>
            </button>

            <button
              type="button"
              onClick={() => aiInputRef.current?.focus()}
              className="btn-lime-pill px-3.5 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles size={13} />
              <span>Ask AI</span>
            </button>


          </div>
        </div>
      </div>

      {/* ========================================================
          2. SEPARATE VITAL DEAL TERMS & HIGHLIGHTS DASHBOARD
          Dynamically modifies its layout, icons, and terms for ANY document type
      ======================================================== */}
      {data.dealHighlights && data.dealHighlights.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#dfe8dc] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#edf3ec]">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-[#204a25] bg-[#eef7ec] border border-[#d2e8cd] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4da832]" />
                  {data.contractCategory === 'rental'
                    ? 'Room Rental & Tenancy Deal Terms'
                    : data.contractCategory === 'employment'
                    ? 'Employment Package & Compensation'
                    : data.contractCategory === 'nda'
                    ? 'Confidentiality & Non-Disclosure Terms'
                    : data.contractCategory === 'services'
                    ? 'Services & Commercial Deal Terms'
                    : 'Key Deal Terms & Highlights'}
                </span>
                <span className="text-[11px] font-semibold text-[#5e7761] bg-[#f4f7f3] border border-[#e2ece0] px-2 py-0.5 rounded-full">
                  {data.dealHighlights.length} Core Terms Identified
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#18201a] tracking-tight font-serif-editorial">
                {data.contractCategory === 'rental'
                  ? 'Key Room Rental Terms & Financial Overview'
                  : data.contractCategory === 'employment'
                  ? 'Employment Terms & Compensation Dashboard'
                  : data.contractCategory === 'nda'
                  ? 'Confidentiality Scope & Governing Terms'
                  : data.contractCategory === 'services'
                  ? 'Commercial Services & Financial Terms'
                  : 'Vital Contract Highlights & Intelligence'}
              </h2>
            </div>

            {/* View All / Compact Toggle if > 4 items */}
            {data.dealHighlights.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllHighlights(!showAllHighlights)}
                className="self-start sm:self-center px-3 py-1.5 rounded-full border border-[#d6e5d3] hover:border-[#9ec998] bg-[#f8faf7] hover:bg-[#edf5ea] text-xs font-bold text-[#254928] inline-flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <span>{showAllHighlights ? 'Show Less' : `View All (${data.dealHighlights.length})`}</span>
                {showAllHighlights ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            )}
          </div>

          {/* Quick Summary Pill Banner (if available) */}
          {data.quickSummaryBanner && (
            <div className="bg-[#f5f9f4] border border-[#d9e9d6] rounded-xl px-3.5 py-2 text-xs text-[#1e3b21] flex items-center gap-2">
              <span className="font-bold text-[#2d5c31] shrink-0 uppercase tracking-wide text-[10px] bg-[#e4f2e0] px-2 py-0.5 rounded">
                Summary
              </span>
              <span className="truncate">{renderMarkdown(data.quickSummaryBanner)}</span>
            </div>
          )}

          {/* Deal Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {(showAllHighlights ? data.dealHighlights : data.dealHighlights.slice(0, 8)).map((item) => {
              const styles = getHighlightColorStyles(item.color);
              return (
                <div
                  key={item.id}
                  onClick={() => handleAskAboutHighlight(item)}
                  className={`group relative rounded-xl border p-3.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 ${styles.bg} hover:shadow-xs active:scale-[0.99]`}
                  title={`Click to ask AI about ${item.label}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${styles.iconBg}`}>
                        {renderHighlightIcon(item.icon, 14)}
                      </div>
                      <span className={`text-[9.5px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border ${styles.badge}`}>
                        {item.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#668268] group-hover:text-[#2c522f] transition-colors inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                      <span>Ask AI</span>
                      <ArrowRight size={10} />
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-medium text-[#5c735f]">
                      {item.label}
                    </span>
                    <span className={`text-sm sm:text-base font-bold tracking-tight line-clamp-2 ${styles.text}`}>
                      {item.value}
                    </span>
                  </div>

                  {item.note && (
                    <div className="pt-2 border-t border-black/5 text-[10.5px] text-[#637d66] italic leading-tight line-clamp-1">
                      {item.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          SIDE-BY-SIDE MAIN LAYOUT
          Left: Important Clauses (occupies primary space)
          Right: Ask AI Side Panel (sticky, accessible side assistant)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================
            LEFT: IMPORTANT CLAUSES (7 cols on lg, 7 on xl)
        ======================================================== */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-3.5">
          <div className="px-1 flex items-baseline justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#18201a] tracking-tight font-serif-editorial">
                Important Clauses
              </h2>
            </div>
            <span className="text-[11px] font-medium text-[#77907a]">
              {data.clauses.length} clauses analyzed
            </span>
          </div>

          {/* Single-Column Stack of Compact Clause Cards */}
          <div className="flex flex-col gap-3.5">
            {data.clauses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#dfe8dc] p-8 text-center flex flex-col items-center justify-center shadow-xs">
                <CheckCircle2 size={24} className="text-[#3b6e37] mb-2" />
                <h4 className="text-sm font-bold text-[#18201a]">No High-Risk Clauses Flagged</h4>
                <p className="text-xs text-[#5e7761] mt-1 max-w-sm">
                  This contract does not contain any detected high-risk liabilities, onerous indemnities, or unusual restrictions.
                </p>
              </div>
            ) : (
              data.clauses.map((clause) => {
              const isExpanded = selectedClauseId === clause.id;
              return (
                <div
                  key={clause.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between shadow-xs ${
                    isExpanded
                      ? 'border-[#3b6e37] ring-1 ring-[#3b6e37]/20 shadow-sm'
                      : 'border-[#dfe8dc] hover:border-[#a2c29e]'
                  }`}
                >
                  <div>
                    {/* Top: Risk Badge & Section Reference */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {getRiskBadge(clause.severity)}
                      <span className="text-[11px] font-medium text-[#77907b]">
                        {clause.sectionRef}
                      </span>
                    </div>

                    {/* Clause Title */}
                    <h3 className="text-sm font-bold text-[#18201a] mb-2 leading-snug">
                      {clause.title}
                    </h3>

                    {/* What it means (1 or 2 simple sentences) */}
                    <div className="text-xs text-[#2c422f] leading-relaxed mb-2">
                      <span className="font-bold text-[#1c301f]">What it means: </span>
                      <span>{clause.whatItMeans}</span>
                    </div>

                    {/* Why it matters (one short sentence) */}
                    <div className="text-xs text-[#4b664e] leading-relaxed pb-2.5 border-b border-[#edf3ec]">
                      <span className="font-bold text-[#1c301f]">Why it matters: </span>
                      <span>{clause.whyItMatters}</span>
                    </div>
                  </div>

                  {/* Card Bottom: Who it affects & View Clause Toggle */}
                  <div className="pt-3 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#668069]">
                      Affects: <span className="text-[#1c301f]">{clause.whoItAffects}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedClauseId(isExpanded ? null : clause.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#2d562f] hover:text-[#18201a] transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Clause'}</span>
                      <ArrowRight size={12} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  {/* ========================================================
                      3. CLAUSE DETAILS (Expanded Inline)
                  ======================================================== */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[#e2ede0] flex flex-col gap-3 animate-fadeIn text-xs">
                      {/* CLAUSE (Original contract text) */}
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#637d66] mb-1">
                          Clause (Original Contract Text)
                        </div>
                        <blockquote className="p-3.5 rounded-xl bg-[#fafcf9] border border-[#e0ece0] font-mono text-[11px] text-[#243726] leading-relaxed italic whitespace-pre-wrap">
                          "{clause.originalClause}"
                        </blockquote>
                      </div>

                      {/* IN SIMPLE WORDS */}
                      <div className="p-3 rounded-xl bg-[#f5f9f3] border border-[#dbe7da]">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#2d562f] mb-0.5">
                          In Simple Words
                        </div>
                        <p className="text-xs text-[#263e29] leading-relaxed">
                          {clause.whatItMeans}
                        </p>
                      </div>

                      {/* WHY IT MATTERS */}
                      <div className="p-3 rounded-xl bg-[#f5f9f3] border border-[#dbe7da]">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#2d562f] mb-0.5">
                          Why It Matters
                        </div>
                        <p className="text-xs text-[#263e29] leading-relaxed">
                          {clause.whyItMatters}
                        </p>
                      </div>

                      {/* WHO IT AFFECTS & SOURCE + Ask AI Shortcut */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#637d66] pt-1">
                        <div className="flex items-center gap-3">
                          <span>
                            <strong className="text-[#1c301f]">Who it affects:</strong> {clause.whoItAffects}
                          </span>
                          <span>&bull;</span>
                          <span>
                            <strong className="text-[#1c301f]">Source:</strong> {clause.sectionRef}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAskAboutClause(clause.title)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2d562f] hover:underline cursor-pointer"
                        >
                          <Sparkles size={11} className="text-[#4da832]" />
                          <span>Ask AI about this clause &rarr;</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          </div>
        </div>

        {/* ========================================================
            RIGHT: "ASK AI" SIDE PANEL (Interactive Legal Chatbot)
        ======================================================== */}
        <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-20 flex flex-col gap-4">
          <div className="bg-white rounded-3xl border border-[#d8e5d5] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            {/* Chatbot Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#edf3ec]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#18201a] text-white flex items-center justify-center shrink-0 shadow-xs relative">
                  <Bot size={20} className="text-[#b4f070]" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#22c55e] border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#18201a] leading-tight">
                      Legal AI Chatbot
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#eaf7e6] text-[#2c6e26] border border-[#cbe6c4]">
                      Online
                    </span>
                  </div>
                </div>
              </div>

              {chatHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="px-2.5 py-1.5 rounded-xl text-[#658269] hover:text-[#b91c1c] hover:bg-[#fef2f2] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-transparent hover:border-[#fecaca]"
                  title="Clear chat conversation"
                >
                  <RotateCcw size={13} />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Quick Action Prompt Chips */}
            <div>
              <span className="text-[11px] font-bold text-[#627f65] uppercase tracking-wider block mb-2">
                Quick Prompts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '👋 Say Hi',
                  '💰 Rent & Deposit',
                  '⚠️ Key Liabilities',
                  '⏰ Notice & Termination',
                  '📜 Governing Law'
                ].map((chip, i) => {
                  const query = chip === '👋 Say Hi' ? 'hi'
                    : chip === '💰 Rent & Deposit' ? 'What is the rent amount, due date, and security deposit?'
                    : chip === '⚠️ Key Liabilities' ? 'What are my primary liability risks and obligations?'
                    : chip === '⏰ Notice & Termination' ? 'What are the termination clauses and notice periods?'
                    : 'What is the governing law and dispute resolution jurisdiction?';
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAskAI(query)}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#f4f8f3] hover:bg-[#e8f3e6] text-[#213f24] border border-[#d6e5d3] hover:border-[#9ec998] transition-all cursor-pointer active:scale-95"
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conversation Messages Stream */}
            <div className="flex flex-col gap-3.5 max-h-[380px] overflow-y-auto pr-1 border-t border-[#edf3ec] pt-3">
              {chatHistory.length === 0 ? (
                /* Empty Chat Welcome State */
                <div className="p-4 rounded-2xl bg-[#f8faf7] border border-[#e2ece0] text-center flex flex-col items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#edf6eb] text-[#2e6829] flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#18201a]">
                      Hello! I'm your Legal AI Assistant.
                    </h4>
                    <p className="text-[11px] text-[#5e7761] mt-0.5 max-w-[260px] mx-auto leading-relaxed">
                      I have analyzed <strong>{document?.filename || 'your contract'}</strong>. Click a prompt above or ask any question below!
                    </p>
                  </div>
                </div>
              ) : (
                chatHistory.map((item, idx) => {
                  const hasCitations = item.citations && item.citations.length > 0;
                  const isSourcesOpen = !!expandedSources[idx];

                  return (
                    <div key={idx} className="flex flex-col gap-2">
                      {/* User Query Bubble */}
                      <div className="self-end max-w-[90%] bg-[#18201a] text-white px-3.5 py-2.5 rounded-2xl rounded-tr-xs shadow-2xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#b4f070] mb-0.5">
                          <User size={11} />
                          <span>You</span>
                        </div>
                        <p className="text-xs sm:text-[13px] leading-relaxed">{item.question}</p>
                      </div>

                      {/* AI Response Bubble */}
                      <div className="self-start max-w-[95%] w-full bg-[#fbfdfa] border border-[#dbe8d8] p-3.5 sm:p-4 rounded-2xl rounded-tl-xs shadow-2xs text-xs sm:text-[13px] text-[#1c301f]">
                        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#edf3ec]">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2d6e27]">
                            <Bot size={13} className="text-[#3b872b]" />
                            <span>Legal AI Assistant</span>
                          </div>

                          {item.answer && (
                            <button
                              type="button"
                              onClick={() => handleCopyText(item.answer, idx)}
                              className="text-[10px] text-[#69826c] hover:text-[#18201a] flex items-center gap-1 cursor-pointer transition-colors"
                              title="Copy answer"
                            >
                              {copiedIdx === idx ? (
                                <>
                                  <Check size={11} className="text-[#2c6e26]" />
                                  <span className="text-[#2c6e26] font-bold">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={11} />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {item.answer ? (
                          <>
                            {renderMarkdown(item.answer)}

                            {/* Citations Accordion */}
                            {hasCitations && (
                              <div className="mt-3 pt-2.5 border-t border-[#e5efe3]">
                                <button
                                  type="button"
                                  onClick={() => toggleSources(idx)}
                                  className="flex items-center gap-1.5 text-[11px] font-bold text-[#2c6e26] hover:underline cursor-pointer"
                                >
                                  <BookOpen size={12} />
                                  <span>
                                    {isSourcesOpen ? 'Hide' : 'View'} {item.citations.length} verified clause citations
                                  </span>
                                </button>

                                {isSourcesOpen && (
                                  <div className="mt-2 flex flex-col gap-1.5">
                                    {item.citations.map((c, cIdx) => (
                                      <div
                                        key={cIdx}
                                        className="p-2.5 rounded-xl bg-white border border-[#dfe8dc] text-[11px]"
                                      >
                                        <div className="flex justify-between text-[#69826c] font-bold text-[9px] uppercase tracking-wider mb-0.5">
                                          <span>Page {c.page || 1} &bull; Verified Clause</span>
                                          <span className="text-[#2c6e26]">
                                            {Math.round((c.relevance || 0.9) * 100)}% Match
                                          </span>
                                        </div>
                                        <div className="font-mono text-[#283b2a] italic text-[10px] leading-relaxed">
                                          "{c.excerpt}"
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-2.5 py-1 text-xs text-[#527055]">
                            <span className="inline-block w-4 h-4 border-2 border-[#3b6e37] border-t-transparent rounded-full animate-spin" />
                            <span>Reviewing contract & drafting answer...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              <div ref={chatStreamEndRef} />
            </div>

            {/* Question Input Field */}
            <div className="pt-2 border-t border-[#edf3ec]">
              <div className="flex items-center gap-2">
                <input
                  ref={aiInputRef}
                  type="text"
                  placeholder="Ask your Legal AI Assistant anything..."
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                  className="flex-1 px-4 py-3 rounded-2xl bg-[#fafcf9] border border-[#cfdfcd] text-xs sm:text-sm text-[#18201a] placeholder:text-[#8ba28d] focus:outline-none focus:border-[#3d6e3c] focus:bg-white focus:ring-2 focus:ring-[#85d045]/30 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => handleAskAI()}
                  disabled={aiLoading || !aiQuestion.trim()}
                  className="btn-dark-pill px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
                >
                  {aiLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={14} className="text-[#b4f070]" />
                  )}
                  <span>Ask</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          5. SIMPLE FOOTER
      ======================================================== */}
      <footer className="text-center pt-4">
        <p className="text-[11px] text-[#7b947e]">
          AI-assisted contract understanding. Not legal advice.
        </p>
      </footer>

      {/* ========================================================
          FULL CONTRACT VIEWER MODAL
      ======================================================== */}
      {showFullContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#dfe8dc] max-w-3xl w-full p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#edf3ec]">
              <div>
                <h3 className="text-base font-bold text-[#18201a] font-serif-editorial">
                  {data.contractName}
                </h3>
                <p className="text-[11px] text-[#69846b]">
                  Extracted verbatim text ({document.page_count || 1} pages &bull; {document.chunk_count || 1} indexed clauses)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFullContractModal(false)}
                className="p-1 rounded-full text-[#7a917c] hover:bg-[#f2f7f0] hover:text-[#18201a] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-[#fafcf9] border border-[#e2ece0] text-xs font-mono text-[#243525] overflow-y-auto whitespace-pre-wrap leading-relaxed flex-1">
              {data.rawText || 'No extracted text available.'}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowFullContractModal(false)}
                className="btn-dark-pill px-4 py-1.5 text-xs font-semibold cursor-pointer"
              >
                Close Contract Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
