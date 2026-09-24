import React from 'react';
import {
  UploadCloud,
  Cpu,
  ShieldAlert,
  FileText,
  CheckSquare,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function UserJourneyRoadmap({ currentStage = 1, onStageClick }) {
  const stages = [
    {
      step: 1,
      id: 'upload',
      title: 'Upload Contract',
      subtitle: 'PDF Sanitization & OCR',
      icon: UploadCloud,
      color: 'emerald'
    },
    {
      step: 2,
      id: 'analysis',
      title: 'AI Analysis',
      subtitle: 'Structure & Provisions',
      icon: Cpu,
      color: 'blue'
    },
    {
      step: 3,
      id: 'risks',
      title: 'Risk Detection',
      subtitle: 'Liability & Severity',
      icon: ShieldAlert,
      color: 'rose'
    },
    {
      step: 4,
      id: 'clauses',
      title: 'Important Clauses',
      subtitle: 'Plain-English Explanations',
      icon: FileText,
      color: 'indigo'
    },
    {
      step: 5,
      id: 'checklist',
      title: 'Legal Checklist',
      subtitle: 'Audit & Action Roadmap',
      icon: CheckSquare,
      color: 'amber'
    },
    {
      step: 6,
      id: 'rag',
      title: 'RAG Assistant',
      subtitle: 'Cited Q&A & Issue Clarity',
      icon: MessageSquare,
      color: 'teal'
    }
  ];

  return (
    <section
      aria-label="Legal Contract Analysis Workflow"
      className="bg-white rounded-3xl border border-[#dce8da] p-5 sm:p-6 shadow-xs relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#edf4ec]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#edf6eb] text-[#2c6e26] border border-[#cfe6cc] flex items-center justify-center">
            <Sparkles size={16} className="text-[#3b872b]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[#18201a] tracking-tight font-serif-editorial">
              The Legal Problem Solver Workflow
            </h2>
            <p className="text-[11px] sm:text-xs text-[#526f55]">
              Systematic journey from unread contract to verified understanding & negotiation clarity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#5a765e] bg-[#f5f9f4] px-3 py-1 rounded-full border border-[#dfeadc]">
          <ShieldCheck size={13} className="text-[#3b872b]" />
          <span>Non-guaranteed legal synthesis for educational review</span>
        </div>
      </div>

      {/* Workflow Steps Horizontal Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isPassed = currentStage >= stage.step;
          const isCurrent = currentStage === stage.step;

          return (
            <div
              key={stage.id}
              onClick={() => onStageClick && onStageClick(stage.id)}
              className={`relative rounded-2xl p-3.5 border transition-all duration-200 flex flex-col justify-between gap-2.5 ${
                onStageClick ? 'cursor-pointer' : ''
              } ${
                isCurrent
                  ? 'bg-[#18201a] text-white border-[#18201a] shadow-sm ring-2 ring-[#b4f070]/40'
                  : isPassed
                  ? 'bg-[#fafcf9] border-[#d4e4d2] hover:border-[#a4cca0] text-[#1c301f]'
                  : 'bg-[#fcfdfc] border-[#e7eee5] opacity-60 text-[#718774]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                    isCurrent
                      ? 'bg-[#b4f070] text-[#18201a]'
                      : isPassed
                      ? 'bg-[#e4f2e0] text-[#2c6e26] border border-[#cfdfcc]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {stage.step}
                </span>

                {idx < stages.length - 1 && (
                  <ArrowRight
                    size={11}
                    className={`hidden lg:block opacity-40 ${isCurrent ? 'text-white' : 'text-[#5a765e]'}`}
                  />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon
                    size={14}
                    className={
                      isCurrent
                        ? 'text-[#b4f070]'
                        : isPassed
                        ? 'text-[#327a2c]'
                        : 'text-slate-400'
                    }
                  />
                  <h3
                    className={`text-xs font-bold leading-tight ${
                      isCurrent ? 'text-white' : 'text-[#18201a]'
                    }`}
                  >
                    {stage.title}
                  </h3>
                </div>
                <p
                  className={`text-[10.5px] leading-tight ${
                    isCurrent ? 'text-[#c6dec9]' : 'text-[#5f7a63]'
                  }`}
                >
                  {stage.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
