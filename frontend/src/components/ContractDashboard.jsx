import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Send,
  CheckCircle2,
  RotateCcw,
  Bot,
  User,
  BookOpen,
  Copy,
  Check,
  DollarSign,
  Building,
  Shield,
  Calendar,
  Clock,
  Zap,
  AlertCircle,
  Users,
  Home,
  Briefcase,
  Scale,
  ChevronDown,
  ChevronUp,
  Globe
} from 'lucide-react';
import { parseImportantClauses } from '../utils/contractIntelligence';
import { askRagQuestion, getChatHistory, clearChatHistory } from '../services/api';
import { useLegal } from '../context/LegalContext';
import RiskFlagsCard from './RiskFlagsCard';
import ChecklistCard from './ChecklistCard';
import UserJourneyRoadmap from './UserJourneyRoadmap';
import {
  SUPPORTED_LANGUAGES,
  translations,
  getLocalizedCategoryName,
  getLocalizedOverviewTitle,
  getLocalizedLabel,
  getLocalizedBadgeCategory,
  getLocalizedClause,
  getLocalizedSummary,
  getLanguageInstruction
} from '../utils/translations';

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
      return <strong key={i} className="font-extrabold text-[#0b1d0e]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-sm sm:text-[15px] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1.5" />;
        
        // Headings
        if (trimmed.startsWith('### ')) {
          return <h4 key={idx} className="font-extrabold text-[#15341a] text-sm sm:text-base mt-2.5 pb-1 border-b border-[#e5efe3]">{trimmed.slice(4)}</h4>;
        }
        if (trimmed.startsWith('## ')) {
          return <h3 key={idx} className="font-extrabold text-[#15341a] text-base sm:text-lg mt-3">{trimmed.slice(3)}</h3>;
        }
        if (trimmed.startsWith('# ')) {
          return <h2 key={idx} className="font-extrabold text-[#15341a] text-lg sm:text-xl mt-3">{trimmed.slice(2)}</h2>;
        }
        
        // Blockquote
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={idx} className="pl-3.5 py-1.5 my-1.5 border-l-3 border-[#4da832] bg-[#f0f7ee] rounded-r-lg text-xs sm:text-sm text-[#234225] italic font-mono">
              {trimmed.slice(2)}
            </blockquote>
          );
        }
        
        // Bullet item
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const content = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 text-[#1c301f]">
              <span className="text-[#3b872b] font-black mt-0.5 text-base leading-none">•</span>
              <span>{formatBold(content)}</span>
            </div>
          );
        }
        
        // Horizontal rule
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={idx} className="border-t border-[#dce8da] my-2.5" />;
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
  const { language = 'en', setLanguage } = useLegal();
  const t = translations[language] || translations.en;
  // Memoize heavy contract intelligence parsing to avoid re-running on input state updates
  const data = useMemo(() => parseImportantClauses(document, analysis), [document, analysis]);

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
  const cardsScrollRef = useRef(null);
  const isAskingRef = useRef(false);
  const queryCacheRef = useRef(new Map());

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

  useEffect(() => {
    if (!document?.id) return;
    loadChatMessages(document.id);
  }, [document?.id]);

  useEffect(() => {
    chatStreamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, aiLoading]);

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
    if (!q || !document?.id || isAskingRef.current || aiLoading) return;

    // Check client-side session cache to avoid duplicate AI requests
    const cacheKey = `${document.id}:${language}:${q.toLowerCase()}`;
    if (queryCacheRef.current.has(cacheKey)) {
      const cached = queryCacheRef.current.get(cacheKey);
      setChatHistory((prev) => [
        ...prev,
        { question: q, answer: cached.answer, citations: cached.citations || [] }
      ]);
      setAiQuestion('');
      return;
    }

    isAskingRef.current = true;
    const newEntry = { question: q, answer: null, citations: [] };
    setChatHistory((prev) => [...prev, newEntry]);
    setAiQuestion('');
    setAiLoading(true);

    try {
      const languagePrompt = getLanguageInstruction(language);
      const enhancedQuestion = languagePrompt ? `${q}${languagePrompt}` : q;
      const res = await askRagQuestion(document.id, enhancedQuestion);
      
      // Store in client session cache
      queryCacheRef.current.set(cacheKey, res);

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
                answer: `⚠️ **Unable to retrieve answer:** ${err.message || 'The AI service did not respond.'}\n\n*Tip: Try rephrasing your question or check your connection.*`,
                citations: []
              }
            : item
        )
      );
    } finally {
      setAiLoading(false);
      isAskingRef.current = false;
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
            {t.highRisk}
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#fef9ee] text-[#b45309] border border-[#fde68a]">
            {t.mediumRisk}
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]">
            {t.lowRisk}
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
            <span>&larr; {t.backToWorkspace}</span>
          </button>
        </div>
      )}

      {/* 6-Stage Problem Solver Journey Status */}
      <UserJourneyRoadmap
        currentStage={3}
        onStageClick={(stageId) => {
          if (stageId === 'upload' && onUploadClick) onUploadClick();
          else if (stageId === 'rag') aiInputRef.current?.focus();
        }}
      />

      {/* ========================================================
          1. CONTRACT HEADER (Compact & Prominent)
      ======================================================== */}
      <div className="bg-white rounded-2xl border border-[#dfe8dc] px-5 py-4 sm:px-6 sm:py-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Name, Type, Status */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#224425] bg-[#eef5eb] border border-[#d6e7d3] px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4da832]" />
                {t.analyzed}
              </span>
              <span className="text-xs font-semibold text-[#506c53] bg-[#f5f8f4] border border-[#e1ece0] px-2.5 py-1 rounded-full">
                {data.contractType}
              </span>
              <span className="text-xs font-medium text-[#718a74]">
                {data.uploadDate}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#18201a] tracking-tight font-serif-editorial truncate">
                {data.contractName}
              </h1>

              {/* Contract Switcher (if multiple contracts available) */}
              {allDocuments.length > 1 && onSwitchContract && (
                <select
                  value={document.id}
                  onChange={(e) => onSwitchContract(e.target.value)}
                  className="text-xs sm:text-sm bg-[#f4f8f2] border border-[#d8e5d5] text-[#244227] font-bold rounded-full px-3 py-1 cursor-pointer focus:outline-none focus:border-[#4b6b4e] shrink-0"
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

          {/* Right: Quick Action Buttons & Multiple Languages Selector */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Multiple Language Selector Dropdown */}
            <div className="relative inline-flex items-center">
              <div className="flex items-center gap-1.5 bg-[#f4f8f2] hover:bg-[#eaf4e7] border border-[#cfdfcd] rounded-full px-3 py-1.5 text-xs sm:text-sm font-bold text-[#224425] transition-all shadow-2xs hover:shadow-xs">
                <Globe size={15} className="text-[#3b872b] shrink-0" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent border-none text-[#1b381d] font-bold text-xs sm:text-[13px] cursor-pointer focus:outline-none pr-1"
                  aria-label="Select contract language"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="text-[#18201a] bg-white py-1">
                      {lang.flag} {lang.native} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFullContractModal(true)}
              className="px-4 py-2 rounded-full border border-[#dce8da] bg-white hover:bg-[#fafcf9] text-xs sm:text-sm font-bold text-[#264829] inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <FileText size={15} className="text-[#3b623f]" />
              <span>{t.viewContract}</span>
            </button>

            <button
              type="button"
              onClick={() => aiInputRef.current?.focus()}
              className="btn-lime-pill px-4 py-2 text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles size={15} />
              <span>{t.askAi}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. SEPARATE VITAL DEAL TERMS & HIGHLIGHTS DASHBOARD
          Dynamically modifies its layout, icons, and terms for ANY document type
      ======================================================== */}
      {data.dealHighlights && data.dealHighlights.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#dfe8dc] p-5 sm:p-7 shadow-xs flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#edf3ec]">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-[13px] font-extrabold text-[#1a421f] bg-[#eef7ec] border border-[#d2e8cd] px-3 py-1 rounded-full inline-flex items-center gap-1.5 uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-[#4da832]" />
                  {getLocalizedCategoryName(data.contractCategory, language)}
                </span>
                <span className="text-xs font-bold text-[#4e6a51] bg-[#f4f7f3] border border-[#e2ece0] px-2.5 py-1 rounded-full">
                  {data.dealHighlights.length} {t.coreTermsIdentified}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#18201a] tracking-tight font-serif-editorial">
                {getLocalizedOverviewTitle(data.contractCategory, language)}
              </h2>
            </div>

            {/* View Mode & Scroll Controls */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              {/* Scroll Bar Navigation Buttons */}
              <div className="flex items-center bg-[#f4f8f2] border border-[#d6e5d3] rounded-full p-1 gap-1">
                <button
                  type="button"
                  title="Scroll Left"
                  onClick={() => {
                    if (cardsScrollRef.current) {
                      cardsScrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
                    }
                  }}
                  className="w-7 h-7 rounded-full bg-white hover:bg-[#e4efe0] text-[#1e4421] border border-[#dce8da] flex items-center justify-center cursor-pointer shadow-2xs transition-colors"
                >
                  <ArrowLeft size={13} />
                </button>
                <span className="text-[11px] font-bold text-[#4e6c51] px-1.5 hidden sm:inline">
                  Scroll Bar
                </span>
                <button
                  type="button"
                  title="Scroll Right"
                  onClick={() => {
                    if (cardsScrollRef.current) {
                      cardsScrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                    }
                  }}
                  className="w-7 h-7 rounded-full bg-white hover:bg-[#e4efe0] text-[#1e4421] border border-[#dce8da] flex items-center justify-center cursor-pointer shadow-2xs transition-colors"
                >
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* View All / Compact Toggle */}
              {data.dealHighlights.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowAllHighlights(!showAllHighlights)}
                  className="px-3.5 py-1.5 rounded-full border border-[#d6e5d3] hover:border-[#9ec998] bg-[#f8faf7] hover:bg-[#edf5ea] text-xs sm:text-sm font-bold text-[#224725] inline-flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <span>{showAllHighlights ? t.showLess : `${t.viewAll} (${data.dealHighlights.length})`}</span>
                  {showAllHighlights ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>
          </div>

          {/* Quick Summary Pill Banner (if available) */}
          {data.quickSummaryBanner && (
            <div className="bg-[#f5f9f4] border border-[#d9e9d6] rounded-xl px-4 py-2.5 text-sm sm:text-[15px] font-medium text-[#1e3b21] flex items-center gap-2.5 leading-relaxed">
              <span className="font-extrabold text-[#224b26] shrink-0 uppercase tracking-wider text-xs bg-[#e4f2e0] px-2.5 py-1 rounded">
                {t.summary}
              </span>
              <span className="truncate">{renderMarkdown(getLocalizedSummary(data.quickSummaryBanner, language))}</span>
            </div>
          )}


          {/* Deal Cards Container: Smooth Scroll Bar by default & expandable grid on View All */}
          <div
            ref={cardsScrollRef}
            className={
              showAllHighlights
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                : "horizontal-scroll-container flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth"
            }
          >
            {(showAllHighlights ? data.dealHighlights : data.dealHighlights).map((item) => {
              const styles = getHighlightColorStyles(item.color);
              const localizedLabel = getLocalizedLabel(item.label, language);
              const localizedBadge = getLocalizedBadgeCategory(item.category, language);
              return (
                <div
                  key={item.id}
                  onClick={() => handleAskAboutHighlight(item)}
                  className={`group relative rounded-2xl border p-4 sm:p-4.5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 ${styles.bg} hover:shadow-sm active:scale-[0.99] ${
                    !showAllHighlights ? 'min-w-[270px] sm:min-w-[300px] flex-shrink-0' : ''
                  }`}
                  title={`${t.clickToAsk} ${localizedLabel}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${styles.iconBg}`}>
                        {renderHighlightIcon(item.icon, 16)}
                      </div>
                      <span className={`text-[10.5px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md border ${styles.badge}`}>
                        {localizedBadge}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#557657] group-hover:text-[#214724] transition-colors inline-flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <span>{t.askAi}</span>
                      <ArrowRight size={11} />
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs sm:text-[13px] font-extrabold text-[#3a583e] uppercase tracking-wider">
                      {localizedLabel}
                    </span>
                    <span className={`text-xl sm:text-2xl lg:text-[25px] font-black tracking-tight leading-tight line-clamp-2 ${styles.text}`}>
                      {item.value}
                    </span>
                  </div>

                  {item.note && (
                    <div className="pt-2 border-t border-black/5 text-xs text-[#526f55] italic leading-snug line-clamp-2">
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
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#18201a] tracking-tight font-serif-editorial">
                {t.importantClauses}
              </h2>
            </div>
            <span className="text-xs sm:text-[13px] font-semibold text-[#668269]">
              {data.clauses.length} {t.clausesAnalyzed}
            </span>
          </div>

          {/* Single-Column Stack of Compact Clause Cards */}
          <div className="flex flex-col gap-4">
            {data.clauses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#dfe8dc] p-8 text-center flex flex-col items-center justify-center shadow-xs">
                <CheckCircle2 size={26} className="text-[#3b6e37] mb-2" />
                <h4 className="text-base font-bold text-[#18201a]">{t.noHighRiskClauses}</h4>
                <p className="text-sm text-[#526e55] mt-1 max-w-sm">
                  {t.noHighRiskDesc}
                </p>
              </div>
            ) : (
              data.clauses.map((rawClause) => {
              const clause = getLocalizedClause(rawClause, language);
              const isExpanded = selectedClauseId === clause.id;
              return (
                <div
                  key={clause.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 p-4.5 sm:p-6 flex flex-col justify-between shadow-xs ${
                    isExpanded
                      ? 'border-[#3b6e37] ring-1 ring-[#3b6e37]/20 shadow-sm'
                      : 'border-[#dfe8dc] hover:border-[#a2c29e]'
                  }`}
                >
                  <div>
                    {/* Top: Risk Badge & Section Reference */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      {getRiskBadge(clause.severity)}
                      <span className="text-xs font-semibold text-[#6d8a71]">
                        {clause.sectionRef}
                      </span>
                    </div>


                    {/* Clause Title */}
                    <h3 className="text-base sm:text-lg font-extrabold text-[#18201a] mb-2.5 leading-snug">
                      {clause.title}
                    </h3>

                    {/* What it means (1 or 2 simple sentences) */}
                    <div className="text-sm sm:text-[15px] text-[#223a26] leading-relaxed mb-2.5">
                      <span className="font-extrabold text-[#0e2110]">{t.whatItMeans}: </span>
                      <span>{clause.whatItMeans}</span>
                    </div>

                    {/* Why it matters (one short sentence) */}
                    <div className="text-sm sm:text-[15px] text-[#345337] leading-relaxed pb-3 border-b border-[#edf3ec]">
                      <span className="font-extrabold text-[#0e2110]">{t.whyItMatters}: </span>
                      <span>{clause.whyItMatters}</span>
                    </div>
                  </div>

                  {/* Card Bottom: Who it affects & View Clause Toggle */}
                  <div className="pt-3.5 flex items-center justify-between">
                    <span className="text-xs sm:text-[13px] font-bold text-[#557158]">
                      {t.affects}: <span className="text-[#152918] font-extrabold">{clause.whoItAffects}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedClauseId(isExpanded ? null : clause.id)}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-extrabold text-[#224b25] hover:text-[#18201a] transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? t.hideDetails : t.viewClause}</span>
                      <ArrowRight size={13} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  {/* ========================================================
                      3. CLAUSE DETAILS (Expanded Inline)
                  ======================================================== */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[#e2ede0] flex flex-col gap-3.5 animate-fadeIn text-xs sm:text-sm">
                      {/* CLAUSE (Original contract text) */}
                      <div>
                        <div className="text-xs font-extrabold uppercase tracking-wider text-[#48634c] mb-1.5">
                          {t.clauseOriginalText}
                        </div>
                        <blockquote className="p-4 rounded-xl bg-[#fafcf9] border border-[#e0ece0] font-mono text-xs sm:text-[13.5px] text-[#1c2e1f] leading-relaxed italic whitespace-pre-wrap">
                          "{clause.originalClause}"
                        </blockquote>
                      </div>

                      {/* IN SIMPLE WORDS */}
                      <div className="p-3.5 sm:p-4 rounded-xl bg-[#f5f9f3] border border-[#dbe7da]">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-[#1e4722] mb-1">
                          {t.inSimpleWords}
                        </div>
                        <p className="text-sm sm:text-base text-[#1b341f] font-medium leading-relaxed">
                          {clause.whatItMeans}
                        </p>
                      </div>

                      {/* WHY IT MATTERS */}
                      <div className="p-3.5 sm:p-4 rounded-xl bg-[#f5f9f3] border border-[#dbe7da]">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-[#1e4722] mb-1">
                          {t.whyItMatters}
                        </div>
                        <p className="text-sm sm:text-base text-[#1b341f] font-medium leading-relaxed">
                          {clause.whyItMatters}
                        </p>
                      </div>

                      {/* WHO IT AFFECTS & SOURCE + Ask AI Shortcut */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-[13px] text-[#557158] pt-1.5">
                        <div className="flex items-center gap-3">
                          <span>
                            <strong className="text-[#132716] font-extrabold">{t.affects}:</strong> {clause.whoItAffects}
                          </span>
                          <span>&bull;</span>
                          <span>
                            <strong className="text-[#132716] font-extrabold">{t.source}:</strong> {clause.sectionRef}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAskAboutClause(clause.title)}
                          className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-[#224b25] hover:underline cursor-pointer"
                        >
                          <Sparkles size={12} className="text-[#4da832]" />
                          <span>{t.askAiAboutClause} &rarr;</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          </div>

          {/* ========================================================
              RISK DETECTION CARDS (High, Medium, Low breakdown)
          ======================================================== */}
          {analysis?.risk_flags && analysis.risk_flags.length > 0 && (
            <div className="mt-4">
              <RiskFlagsCard riskFlags={analysis.risk_flags} />
            </div>
          )}

          {/* ========================================================
              LEGAL CHECKLIST & AUDIT ROADMAP
          ======================================================== */}
          {analysis?.checklist && analysis.checklist.length > 0 && (
            <div className="mt-2">
              <ChecklistCard checklist={analysis.checklist} />
            </div>
          )}
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
                  <Bot size={22} className="text-[#b4f070]" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#22c55e] border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-extrabold text-[#18201a] leading-tight">
                      {t.legalAiChatbot}
                    </h3>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#eaf7e6] text-[#245c20] border border-[#cbe6c4]">
                      {t.online}
                    </span>
                  </div>
                </div>
              </div>

              {chatHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="px-3 py-1.5 rounded-xl text-[#537057] hover:text-[#b91c1c] hover:bg-[#fef2f2] text-xs sm:text-[13px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-transparent hover:border-[#fecaca]"
                  title="Clear chat conversation"
                >
                  <RotateCcw size={13} />
                  <span>{t.clear}</span>
                </button>
              )}
            </div>

            {/* Quick Action Prompt Chips */}
            <div>
              <span className="text-xs font-extrabold text-[#48664c] uppercase tracking-wider block mb-2">
                {t.quickPrompts}
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { chip: t.promptSayHi, query: t.promptQSayHi },
                  { chip: t.promptRentDeposit, query: t.promptQRent },
                  { chip: t.promptLiabilities, query: t.promptQLiabilities },
                  { chip: t.promptNotice, query: t.promptQNotice },
                  { chip: t.promptLaw, query: t.promptQLaw }
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAskAI(item.query)}
                    className="text-xs sm:text-[13px] font-bold px-3.5 py-1.5 rounded-full bg-[#f4f8f3] hover:bg-[#e8f3e6] text-[#1c3c20] border border-[#d6e5d3] hover:border-[#9ec998] transition-all cursor-pointer active:scale-95"
                  >
                    {item.chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Messages Stream */}
            <div className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-1 border-t border-[#edf3ec] pt-3">
              {chatHistory.length === 0 ? (
                /* Empty Chat Welcome State */
                <div className="p-5 rounded-2xl bg-[#f8faf7] border border-[#e2ece0] text-center flex flex-col items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#edf6eb] text-[#255e21] flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#18201a]">
                      {t.helloAiIntro}
                    </h4>
                    <p className="text-xs sm:text-[13px] text-[#4d6b50] mt-1 max-w-[280px] mx-auto leading-relaxed">
                      {t.helloAiDesc}
                    </p>
                  </div>
                </div>
              ) : (
                chatHistory.map((item, idx) => {
                  const hasCitations = item.citations && item.citations.length > 0;
                  const isSourcesOpen = !!expandedSources[idx];

                  return (
                    <div key={idx} className="flex flex-col gap-2.5">
                      {/* User Query Bubble */}
                      <div className="self-end max-w-[90%] bg-[#18201a] text-white px-4 py-3 rounded-2xl rounded-tr-xs shadow-2xs">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#b4f070] mb-1">
                          <User size={13} />
                          <span>{t.you}</span>
                        </div>
                        <p className="text-sm sm:text-[15px] font-medium leading-relaxed">{item.question}</p>
                      </div>

                      {/* AI Response Bubble */}
                      <div className="self-start max-w-[95%] w-full bg-[#fbfdfa] border border-[#dbe8d8] p-4 sm:p-5 rounded-2xl rounded-tl-xs shadow-2xs text-sm sm:text-[15px] text-[#1a2f1c]">
                        <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#edf3ec]">
                          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#1e5219]">
                            <Bot size={16} className="text-[#3b872b]" />
                            <span>{t.assistantName}</span>
                          </div>

                          {item.answer && (
                            <button
                              type="button"
                              onClick={() => handleCopyText(item.answer, idx)}
                              className="text-xs text-[#57755b] hover:text-[#18201a] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Copy answer"
                            >
                              {copiedIdx === idx ? (
                                <>
                                  <Check size={13} className="text-[#2c6e26]" />
                                  <span className="text-[#2c6e26] font-bold">{t.copied}</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={13} />
                                  <span>{t.copy}</span>
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
                              <div className="mt-3.5 pt-3 border-t border-[#e5efe3]">
                                <button
                                  type="button"
                                  onClick={() => toggleSources(idx)}
                                  className="flex items-center gap-1.5 text-xs sm:text-[13px] font-extrabold text-[#22551e] hover:underline cursor-pointer"
                                >
                                  <BookOpen size={14} />
                                  <span>
                                    {isSourcesOpen ? t.hideCitations : t.viewCitations} ({item.citations.length})
                                  </span>
                                </button>

                                {isSourcesOpen && (
                                  <div className="mt-2.5 flex flex-col gap-2">
                                    {item.citations.map((c, cIdx) => (
                                      <div
                                        key={cIdx}
                                        className="p-3 rounded-xl bg-white border border-[#dfe8dc] text-xs sm:text-[13px]"
                                      >
                                        <div className="flex justify-between text-[#57755b] font-extrabold text-[10px] uppercase tracking-wider mb-1">
                                          <span>Page {c.page || 1} &bull; {t.verifiedClause}</span>
                                          <span className="text-[#23581f]">
                                            {Math.round((c.relevance || 0.9) * 100)}% {t.match}
                                          </span>
                                        </div>
                                        <div className="font-mono text-[#203222] italic text-xs leading-relaxed">
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
                          <div className="flex items-center gap-2.5 py-1 text-sm text-[#466549] font-medium">
                            <span className="inline-block w-4 h-4 border-2 border-[#3b6e37] border-t-transparent rounded-full animate-spin" />
                            <span>{t.thinking}</span>
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
            <div className="pt-2.5 border-t border-[#edf3ec]">
              <div className="flex items-center gap-2">
                <input
                  ref={aiInputRef}
                  type="text"
                  placeholder={t.inputPlaceholder}
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                  className="flex-1 px-4 py-3 rounded-2xl bg-[#fafcf9] border border-[#cfdfcd] text-sm sm:text-base text-[#18201a] placeholder:text-[#8ba28d] focus:outline-none focus:border-[#3d6e3c] focus:bg-white focus:ring-2 focus:ring-[#85d045]/30 transition-all shadow-2xs font-medium"
                />
                <button
                  type="button"
                  onClick={() => handleAskAI()}
                  disabled={aiLoading || !aiQuestion.trim()}
                  className="btn-dark-pill px-5 sm:px-6 py-3 text-sm sm:text-base font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
                >
                  {aiLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={16} className="text-[#b4f070]" />
                  )}
                  <span>{t.ask}</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-2.5 px-2 py-1 rounded-lg bg-[#f6f9f5] border border-[#e4eee2] text-[11px] text-[#5a765e]">
                <Shield size={12} className="text-[#3b872b] shrink-0" />
                <span>
                  <strong>Notice:</strong> AI answers are assistive summaries based on document retrieval, not certified legal advice.
                </span>
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
          {t.disclaimer}
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
                  {t.extractedVerbatim} ({document.page_count || 1} {t.pages} &bull; {document.chunk_count || 1} {t.indexedClauses})
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
              {data.rawText || t.noExtractedText}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowFullContractModal(false)}
                className="btn-dark-pill px-4 py-1.5 text-xs font-semibold cursor-pointer"
              >
                {t.closeContractText}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
