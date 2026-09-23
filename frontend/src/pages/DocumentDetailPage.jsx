import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share2,
  FileText
} from 'lucide-react';
import { getDocumentDetails } from '../services/api';
import { useLegal } from '../context/LegalContext';
import ContractDashboard from '../components/ContractDashboard';
import ExportReportModal from '../components/ExportReportModal';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { documents, setUploadModalOpen } = useLegal();

  const [document, setDocument] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadDetails(id);
  }, [id]);

  const loadDetails = async (docId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDocumentDetails(docId);
      setDocument(data.document);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message || 'Failed to load document analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 flex flex-col items-center justify-center">
        <div className="w-9 h-9 rounded-full border-2 border-[#d9e5d6] border-t-[#3b6e37] animate-spin mb-3" />
        <span className="text-xs font-semibold text-[#48634b]">
          Analyzing contract provisions...
        </span>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-16 text-center">
        <div className="bg-[#fdf2f2] border border-[#f5cfcf] p-8 rounded-3xl text-[#962626] text-xs">
          <p className="font-bold text-sm">Contract not found</p>
          <p className="mt-1.5 text-[#b53434]">{error || 'This document is unavailable or has been deleted.'}</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-5 px-5 py-2 bg-white border border-[#f5cfcf] rounded-full text-xs font-semibold text-[#962626] hover:bg-[#faf0f0] cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-6 flex flex-col gap-5">
      {/* Top Navigation & Export Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#536c56] hover:text-[#18201a] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Contracts</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full border border-[#dce8da] bg-white hover:bg-[#fafcf9] text-xs font-semibold text-[#2f4d32] inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download size={13} className="text-[#3c6b38]" />
            <span>Export Summary</span>
          </button>
        </div>
      </div>

      {/* 9-Section Contract Intelligence Dashboard */}
      <ContractDashboard
        document={document}
        analysis={analysis}
        allDocuments={documents}
        onSwitchContract={(newId) => navigate(`/documents/${newId}`)}
        onUploadClick={() => setUploadModalOpen(true)}
      />

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        document={document}
        analysis={analysis}
      />
    </div>
  );
}
