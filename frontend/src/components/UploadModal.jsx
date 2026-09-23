import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  Sparkles,
  AlertCircle,
  FileCheck2,
  Files,
  ArrowRight
} from 'lucide-react';
import { useLegal } from '../context/LegalContext';
import { useNavigate } from 'react-router-dom';

export default function UploadModal({ isOpen, onClose }) {
  const { uploadFile, uploading, uploadProgressStep } = useLegal();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('single'); // 'single' | 'compare'
  const [compareFiles, setCompareFiles] = useState([]);
  const fileInputRef = useRef(null);
  const compareInputRef = useRef(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const steps = [
    'Reading contract text & clause hierarchy...',
    'Extracting key terms, obligations & provisions...',
    'Generating plain-English summary & risk assessment...',
    'Finalizing document intelligence report...',
  ];

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (mode === 'single') {
        await processSingleFile(e.dataTransfer.files[0]);
      } else {
        processMultiFiles(Array.from(e.dataTransfer.files));
      }
    }
  };

  const handleSelect = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      if (mode === 'single') {
        await processSingleFile(e.target.files[0]);
      } else {
        processMultiFiles(Array.from(e.target.files));
      }
    }
  };

  const processSingleFile = async (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF contract file.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25MB limit.');
      return;
    }
    setError(null);
    try {
      const res = await uploadFile(file, false);
      if (res?.document?.id) {
        navigate(`/documents/${res.document.id}`);
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
  };

  const processMultiFiles = (files) => {
    const valid = files.filter((f) => f.name.toLowerCase().endsWith('.pdf'));
    if (valid.length === 0) {
      setError('Please select at least 2 PDF files to compare.');
      return;
    }
    setCompareFiles(valid.slice(0, 2));
  };

  const executeCompareUpload = async () => {
    if (compareFiles.length < 2) {
      setError('Please upload at least 2 documents to compare.');
      return;
    }
    try {
      setError(null);
      // Upload first
      const res1 = await uploadFile(compareFiles[0], false);
      // Upload second
      const res2 = await uploadFile(compareFiles[1], false);
      onClose();
      navigate(`/compare?doc1=${res1.document.id}&doc2=${res2.document.id}`);
    } catch (err) {
      setError(err.message || 'Comparison upload failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18201a]/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-[#dce8da] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e9f0e6] bg-[#fafcf9]">
          <div>
            <h3 className="text-base font-bold text-[#18201a] font-serif-editorial">
              Upload Legal Contract
            </h3>
            <p className="text-xs text-[#526a54] mt-0.5">
              Upload PDF agreements for automated summary, risk scoring & clause review
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="text-[#6d8870] hover:text-[#18201a] p-1.5 rounded-full hover:bg-[#eef5ec] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Mode Switcher */}
          <div className="flex p-1 bg-[#f0f5ee] rounded-full mb-5 border border-[#dce8da]">
            <button
              type="button"
              onClick={() => { setMode('single'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                mode === 'single'
                  ? 'bg-[#18201a] text-white shadow-2xs'
                  : 'text-[#4d6550] hover:text-[#18201a]'
              }`}
            >
              <FileText size={14} />
              <span>Single Document Analysis</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('compare'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                mode === 'compare'
                  ? 'bg-[#18201a] text-white shadow-2xs'
                  : 'text-[#4d6550] hover:text-[#18201a]'
              }`}
            >
              <Files size={14} />
              <span>Multi-File Comparison</span>
            </button>
          </div>

          {uploading ? (
            /* Upload Progress State */
            <div className="p-8 rounded-2xl bg-[#fafcf9] border border-[#dce8da] text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#eef8eb] border border-[#cfebd0] flex items-center justify-center text-[#2d6e27] mb-3.5 animate-pulse">
                <Sparkles size={22} className="text-[#327a2c]" />
              </div>
              <h4 className="text-sm font-bold text-[#18201a] font-serif-editorial">
                {steps[uploadProgressStep]}
              </h4>
              <p className="text-xs text-[#526a54] mt-1">
                Analyzing contract structure and evaluating potential legal risks
              </p>

              {/* Progress Bar */}
              <div className="w-full max-w-sm bg-[#e2ede0] h-2 rounded-full mt-5 overflow-hidden">
                <div
                  className="bg-[#2f7d29] h-full rounded-full transition-all duration-500"
                  style={{ width: `${((uploadProgressStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          ) : mode === 'single' ? (
            /* Single File Dropzone */
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center ${
                  isDragging
                    ? 'border-[#4b6b4e] bg-[#eef7ec]'
                    : 'border-[#cfe0cc] hover:border-[#8cb787] bg-[#fafcf9] hover:bg-[#f3f8f1]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf"
                  className="hidden"
                  onChange={handleSelect}
                />

                <div className="w-12 h-12 rounded-full bg-white border border-[#dce8da] shadow-xs flex items-center justify-center text-[#375239] mb-3">
                  <UploadCloud size={24} className="text-[#345137]" />
                </div>

                <span className="text-sm font-bold text-[#18201a]">
                  Drag & drop your legal contract PDF
                </span>
                <span className="text-xs text-[#5a715c] mt-1 mb-4">
                  Accepts standard PDF agreements up to 25MB
                </span>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="btn-lime-pill px-5 py-2 text-xs font-bold shadow-xs cursor-pointer"
                >
                  Select File from Computer
                </button>
              </div>
            </>
          ) : (
            /* Multi-file Comparison Mode */
            <div className="flex flex-col gap-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => compareInputRef.current?.click()}
                className="border-2 border-dashed border-[#cfe0cc] hover:border-[#8cb787] rounded-2xl p-6 text-center cursor-pointer bg-[#fafcf9] hover:bg-[#f3f8f1]"
              >
                <input
                  type="file"
                  ref={compareInputRef}
                  accept=".pdf"
                  multiple
                  className="hidden"
                  onChange={handleSelect}
                />
                <Files size={24} className="mx-auto text-[#4b6b4e] mb-2" />
                <div className="text-xs font-bold text-[#18201a]">Select 2 PDF contracts to compare</div>
                <div className="text-[11px] text-[#69826c] mt-0.5">Drop both documents here or browse</div>
              </div>

              {compareFiles.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-bold text-[#324935]">Selected for Comparison:</div>
                  {compareFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#f2f7f0] border border-[#dce8da] text-xs">
                      <div className="flex items-center gap-2">
                        <FileText size={15} className="text-[#325235]" />
                        <span className="font-semibold text-[#18201a]">{f.name}</span>
                      </div>
                      <span className="text-[11px] text-[#69826c] font-medium">
                        {(f.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={executeCompareUpload}
                    disabled={compareFiles.length < 2 || uploading}
                    className="btn-lime-pill w-full mt-2 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>Run Comparative Delta Analysis</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-[#fdf2f2] border border-[#f7d4d4] flex items-center gap-2 text-xs text-[#a82d2d]">
              <AlertCircle size={15} className="shrink-0 text-[#b32b2b]" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
