import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Sparkles, CheckCircle2, AlertCircle, FileCheck2, Files } from 'lucide-react';
import { uploadDocument } from '../services/api';

export default function FileUpload({ onUploadSuccess }) {
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'batch'
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const steps = [
    'Reading document clauses...',
    'Analyzing terms and provisions...',
    'Synthesizing legal risk assessment...',
    'Finalizing analysis...',
  ];

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF document.');
      return;
    }
    await executeUpload(file, false);
  };

  const executeUpload = async (file, useSample = false) => {
    try {
      setLoading(true);
      setError(null);
      setStepIndex(0);

      const t1 = setTimeout(() => setStepIndex(1), 600);
      const t2 = setTimeout(() => setStepIndex(2), 1500);
      const t3 = setTimeout(() => setStepIndex(3), 2600);

      const res = await uploadDocument(file, useSample);

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      if (res && res.document) {
        onUploadSuccess(res.document.id);
      }
    } catch (err) {
      setError(err.message || 'Error processing document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      {/* Segmented Control Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl mb-4 border border-slate-200/60">
        <button
          type="button"
          onClick={() => setActiveTab('single')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'single'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText size={14} />
          <span>Upload Contract</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('batch')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'batch'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Files size={14} />
          <span>Batch Ingest</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/70 text-slate-600 font-medium">Pro</span>
        </button>
      </div>

      {activeTab === 'batch' ? (
        <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200/80">
          <Files size={28} className="mx-auto text-slate-400 mb-2" />
          <h4 className="text-xs font-semibold text-slate-800">Batch Contract Processing</h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Upload multiple contracts at once to analyze portfolio-wide risk patterns. Available on Legal Enterprise.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className="mt-3 inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Switch to single upload
          </button>
        </div>
      ) : loading ? (
        /* Processing / Loading State */
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3 animate-pulse">
            <Sparkles size={18} />
          </div>
          <h4 className="text-sm font-semibold text-slate-900">
            {steps[stepIndex]}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            AI extracting clauses and running risk assessment
          </p>

          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        /* Normal Upload Dropzone */
        <>
          <div
            id="dropzone-upload"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center ${
              isDragging
                ? 'border-blue-500 bg-blue-50/40'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              className="hidden"
              onChange={handleFileSelect}
            />

            <div className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 mb-3 group-hover:scale-105 transition-transform">
              <UploadCloud size={20} className="text-slate-600" />
            </div>

            <span className="text-sm font-semibold text-slate-900">
              Drag your contract PDF here
            </span>
            <span className="text-xs text-slate-500 mt-1 mb-3">
              Supports PDF up to 25MB
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            >
              Browse Files
            </button>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle size={15} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
