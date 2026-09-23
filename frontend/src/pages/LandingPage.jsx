import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  ArrowRight,
  Clock,
  Shield,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'Does Legal provide legally binding advice?',
      a: 'No. Legal is an AI-assisted contract synthesis copilot built for informational assistance. It highlights risks, redlines, and extracts clauses, but does not replace qualified corporate counsel.'
    },
    {
      q: 'How does Legal protect contract confidentiality?',
      a: 'Your contracts are processed in an isolated, secure environment with strict confidentiality controls. Your sensitive legal documents are never shared or used to train public AI models.'
    },
    {
      q: 'What document formats are supported?',
      a: 'We support standard PDF agreements, including Master Services Agreements (MSAs), Mutual NDAs, Statements of Work (SOWs), Vendor SLAs, and Employment contracts up to 25MB.'
    },
    {
      q: 'Can I compare two contract versions side by side?',
      a: 'Yes. Our comparative delta analysis engine benchmarks clause-by-clause variations, flagging deviations in liability ceilings, indemnification scopes, and governing jurisdictions.'
    },
    {
      q: 'How does this prototype analyze contracts?',
      a: 'Upload any standard contract PDF or test with pre-indexed agreements. The system automatically extracts clauses, analyzes liabilities, and generates plain-English risk assessments in seconds.'
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#fbf9f5] text-[#18201a]">
      {/* 
        ========================================================================
        HERO SECTION
        Warm sand-to-sage backdrop with subtle technical grid overlay & editorial typography
        ========================================================================
      */}
      <section className="relative overflow-hidden pt-12 sm:pt-16 pb-16 sm:pb-24 px-6 bg-sage-backdrop bg-grid-overlay border-b border-[#cfdecb]">
        {/* Landing Page Top Navigation */}
        <header className="max-w-6xl mx-auto flex items-center justify-between pb-12 sm:pb-16 relative z-30">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#18201a] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Scale size={16} className="text-[#b4f070]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#18201a] font-serif-editorial">
              Legal
            </span>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#405643]">
            <a href="#how-it-works" className="hover:text-[#18201a] transition-colors">
              How it Works
            </a>
            <a href="#security" className="hover:text-[#18201a] transition-colors">
              Security & Privacy
            </a>
            <a href="#faq" className="hover:text-[#18201a] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-bold text-[#344d37] hover:text-[#18201a] px-3 py-1.5 transition-colors"
            >
              Login
            </Link>

            <Link
              to="/login"
              className="btn-dark-pill px-5 py-2 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <span>Try Prototype</span>
            </Link>
          </div>
        </header>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center relative z-10">
          {/* Main Headline (Newsreader / Instrument Serif display) */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#162017] leading-[1.12] mb-5 font-serif-editorial">
            Understand Which Clauses Drive
            <span className="block italic text-[#4b6b4e] font-serif-editorial mt-1">
              Real Contractual Risk
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#405443] max-w-2xl leading-relaxed mb-7">
            Legal connects directly to your contract repository and PDFs, allowing you to
            attribute legal risks, liabilities, and obligations to your business in seconds.
          </p>

          {/* 3 Capability Badges (No tech stack jargon) */}
          <div className="flex items-center justify-center gap-6 sm:gap-9 text-xs font-semibold text-[#314633] mb-8 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#4b6b4e]" />
              <span>Fast contract review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield size={14} className="text-[#4b6b4e]" />
              <span>Strict confidentiality</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Scale size={14} className="text-[#4b6b4e]" />
              <span>Automated risk analysis</span>
            </div>
          </div>

          {/* Primary CTA Button */}
          <div className="flex items-center justify-center">
            <Link
              to="/login"
              className="btn-lime-pill px-8 py-3.5 text-sm font-bold inline-flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Try Prototype</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        HOW IT WORKS (3-Step Workflow)
        ========================================================================
      */}
      <section id="how-it-works" className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#edf5eb] text-[#2c6e26] border border-[#d2e7ce] mb-3">
            <span>Seamless Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#18201a] font-serif-editorial">
            Contract Intelligence in Three Simple Steps
          </h2>
          <p className="text-xs sm:text-sm text-[#5a715d] mt-2 leading-relaxed">
            Eliminate hours of manual contract review without compromising liability or oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-7 rounded-3xl bg-white border border-[#dfe8dc] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#edf5eb] border border-[#d5e7d2] flex items-center justify-center text-sm font-extrabold text-[#2f662a] mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-[#18201a] mb-2 font-serif-editorial">
                Upload & Ingest Contracts
              </h3>
              <p className="text-xs text-[#526a54] leading-relaxed">
                Drop in standard agreements (PDFs up to 25MB). Legal automatically organizes clause
                structure, key obligations, and page references.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#edf2ea] text-[11px] font-semibold text-[#375239] flex items-center gap-1">
              <CheckCircle2 size={13} className="text-[#418738]" />
              <span>Automated Clause Review</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-7 rounded-3xl bg-white border border-[#dfe8dc] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#edf5eb] border border-[#d5e7d2] flex items-center justify-center text-sm font-extrabold text-[#2f662a] mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-[#18201a] mb-2 font-serif-editorial">
                Deep Semantic Risk Audit
              </h3>
              <p className="text-xs text-[#526a54] leading-relaxed">
                The analysis engine cross-examines each clause against standard corporate risk factors:
                uncapped liability, indemnification obligations, and renewal traps.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#edf2ea] text-[11px] font-semibold text-[#375239] flex items-center gap-1">
              <CheckCircle2 size={13} className="text-[#418738]" />
              <span>Severity Scoring (High / Med / Low)</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-7 rounded-3xl bg-white border border-[#dfe8dc] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#edf5eb] border border-[#d5e7d2] flex items-center justify-center text-sm font-extrabold text-[#2f662a] mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-[#18201a] mb-2 font-serif-editorial">
                Actionable Lawyer Redlines & Chat
              </h3>
              <p className="text-xs text-[#526a54] leading-relaxed">
                Review executive summaries, actionable renegotiation checklists, and query any
                provision interactively with citation-backed page references.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#edf2ea] text-[11px] font-semibold text-[#375239] flex items-center gap-1">
              <CheckCircle2 size={13} className="text-[#418738]" />
              <span>Interactive Contract Q&A</span>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        SECURITY & DATA PRIVACY
        ========================================================================
      */}
      <section id="security" className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-3xl border border-[#dfe8dc] p-8 sm:p-12 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#edf5eb] text-[#2c6e26] border border-[#d2e7ce] mb-3">
              <Lock size={12} />
              <span>Enterprise Privacy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#18201a] font-serif-editorial mb-3">
              Your Legal Data Never Trains Public AI
            </h2>
            <p className="text-xs sm:text-sm text-[#526a54] leading-relaxed mb-5">
              Legal is designed from the ground up for strict confidentiality. Contracts are processed
              in an isolated, encrypted workspace where your sensitive documents remain strictly private.
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-[#314633]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#2d6e27]" />
                <span>Zero Model Training</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#2d6e27]" />
                <span>Strict Confidentiality</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#2d6e27]" />
                <span>Role-Based Access Control</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#2d6e27]" />
                <span>End-to-End Data Encryption</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-80 p-6 rounded-2xl bg-[#fafcf9] border border-[#e5eee2] flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#18201a] flex items-center justify-center text-[#b4f070] mb-3 shadow-sm">
              <Shield size={22} />
            </div>
            <div className="text-sm font-bold text-[#18201a]">Bank-Grade Security</div>
            <p className="text-xs text-[#69826c] mt-1 mb-4">
              Protected by TLS encryption and authenticated access tokens.
            </p>
            <Link
              to="/login"
              className="btn-lime-pill w-full py-2.5 text-xs font-bold text-center"
            >
              Try Prototype
            </Link>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        FREQUENTLY ASKED QUESTIONS (FAQ)
        ========================================================================
      */}
      <section id="faq" className="py-20 px-6 bg-[#f4f7f2] border-t border-[#dce8da]">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#18201a] font-serif-editorial">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#5a715d] mt-2">
              Everything you need to know about Legal contract intelligence.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#dfe8dc] overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-bold text-[#18201a] font-serif-editorial">
                    {faq.q}
                  </span>
                  <span className="text-[#69826c] shrink-0">
                    {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-[#526a54] leading-relaxed border-t border-[#edf2ea] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        BOTTOM CALL TO ACTION BANNER
        ========================================================================
      */}
      <section className="py-20 px-6 bg-sage-backdrop bg-grid-overlay border-t border-[#cfdecb]">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#18201a] font-serif-editorial mb-4">
            Start Reviewing Contracts with Complete Confidence
          </h2>
          <p className="text-xs sm:text-sm text-[#405643] max-w-xl leading-relaxed mb-7">
            Experience how Legal cuts contract review time by 80% with automated clause intelligence.
          </p>
          <Link
            to="/login"
            className="btn-lime-pill px-8 py-3.5 text-sm font-bold inline-flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <span>Try Prototype</span>
            <ArrowRight size={16} />
          </Link>
          <div className="flex items-center gap-4 text-[11px] text-[#405643] mt-4">
            <span>⏱️ Fast contract review</span>
            <span>&bull;</span>
            <span>🛡️ Strict confidentiality</span>
            <span>&bull;</span>
            <span>⚖️ Automated risk analysis</span>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        FOOTER
        ========================================================================
      */}
      <footer className="bg-[#18201a] text-[#b3c7b2] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-[#29362b]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#253227] flex items-center justify-center text-[#b4f070]">
                <Scale size={16} />
              </div>
              <span className="text-lg font-bold text-white font-serif-editorial">Legal</span>
            </div>

            <div className="flex items-center gap-6 text-xs font-semibold">
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How it Works
              </a>
              <a href="#security" className="hover:text-white transition-colors">
                Security
              </a>
              <a href="#faq" className="hover:text-white transition-colors">
                FAQ
              </a>
              <Link to="/login" className="text-[#b4f070] hover:underline">
                Sign In
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#819980]">
            <div>
              &copy; {new Date().getFullYear()} Legal AI Inc. All rights reserved.
            </div>
            <div className="text-center sm:text-right max-w-md text-[10px] text-[#718770] leading-relaxed">
              <strong>Notice:</strong> Legal is an AI assistant designed for contract analysis and clause review. It does not provide legal advice or create an attorney-client relationship.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
