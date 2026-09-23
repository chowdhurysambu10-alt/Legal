import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  Key,
  FileText,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Edit2,
  Save
} from 'lucide-react';
import { useLegal } from '../context/LegalContext';

export default function ProfilePage() {
  const { user, documents, logoutUser, health, isOnline } = useLegal();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || 'Legal Counsel');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // If no user is logged in, redirect to login
  if (!user) {
    return (
      <div className="flex-1 max-w-xl w-full mx-auto px-6 py-20 text-center">
        <div className="bg-white rounded-3xl border border-[#dfe8dc] p-10 shadow-xs flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#edf6eb] text-[#2c6e26] border border-[#d2e7cf] flex items-center justify-center mb-4">
            <User size={28} />
          </div>
          <h2 className="text-xl font-extrabold text-[#18201a] font-serif-editorial">
            No Active Profile Found
          </h2>
          <p className="text-sm text-[#57725b] mt-1.5 mb-6 max-w-sm">
            Please sign in to access your personal profile, contracts, and workspace settings.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn-lime-pill px-6 py-2.5 text-sm font-bold cursor-pointer"
          >
            Sign In to Account
          </button>
        </div>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'US';

  const highRiskCount = documents.filter((d) => {
    const s = (d.overall_risk_score || '').toUpperCase();
    return s.includes('HIGH') || s.includes('CRITICAL');
  }).length;

  const handleCopyId = () => {
    if (!user.id) return;
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveName = () => {
    if (!displayName.trim()) return;
    try {
      const updatedUser = { ...user, name: displayName.trim() };
      localStorage.setItem('legal_ai_user', JSON.stringify(updatedUser));
      setSavedSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.warn('Could not save updated name', e);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#edf5ea] text-[#244227] border border-[#d6e5d3] hover:border-[#9ec998] text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft size={15} className="text-[#3b872b]" />
          <span>&larr; Back to Workspace</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#fef2f2] hover:bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca] text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-[#dfe8dc] p-6 sm:p-8 shadow-xs flex flex-col gap-6">
        {/* Profile Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-[#edf3ec]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-[#e2ede0] text-[#1c3e20] border-2 border-[#b5dbad] flex items-center justify-center text-2xl sm:text-3xl font-black shadow-xs">
                {initials}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#22c55e] border-2 border-white flex items-center justify-center shadow-xs" title="Online & Active">
                <Check size={11} className="text-white font-bold" />
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18201a] tracking-tight font-serif-editorial">
                  {displayName}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1 rounded-lg text-[#6a846c] hover:text-[#18201a] hover:bg-[#f1f6ef] transition-colors cursor-pointer"
                  title="Edit display name"
                >
                  <Edit2 size={15} />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs sm:text-[13px] font-bold text-[#2e5e31] bg-[#edf6eb] border border-[#d1e7cf] px-3 py-0.5 rounded-full inline-flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#3b872b]" />
                  {user.role || 'Legal Counsel'}
                </span>
                {user.isGuest && (
                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    Guest Session
                  </span>
                )}
                <span className="text-xs text-[#6e8871] font-medium">
                  Workspace Member
                </span>
              </div>
            </div>
          </div>

          <div className="self-start sm:self-center">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-lime-pill px-5 py-2.5 text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <FileText size={15} />
              <span>Open My Contracts</span>
            </button>
          </div>
        </div>

        {/* Edit Name Input (if toggled) */}
        {isEditing && (
          <div className="p-4 rounded-2xl bg-[#f7faf6] border border-[#d6e5d3] flex items-center gap-3 animate-fadeIn">
            <div className="flex-1">
              <label className="block text-xs font-extrabold text-[#3a563d] uppercase tracking-wider mb-1">
                Update Display Name:
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#cfdfcd] text-sm font-semibold text-[#18201a] focus:outline-none focus:border-[#3b872b] focus:ring-1 focus:ring-[#3b872b]"
                placeholder="Enter your name..."
              />
            </div>
            <button
              type="button"
              onClick={handleSaveName}
              className="self-end px-4 py-2 rounded-xl bg-[#18201a] text-white text-xs sm:text-sm font-bold hover:bg-[#2b3a2f] transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Save size={14} className="text-[#b4f070]" />
              <span>Save</span>
            </button>
          </div>
        )}

        {savedSuccess && (
          <div className="px-4 py-2 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-xs font-bold text-[#15803d] flex items-center gap-2">
            <CheckCircle2 size={14} />
            <span>Profile name updated successfully!</span>
          </div>
        )}

        {/* Basic Details Grid */}
        <div>
          <h2 className="text-xs sm:text-sm font-extrabold text-[#3b593e] uppercase tracking-wider mb-3.5">
            Basic Details & Account Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Detail Item: Full Name */}
            <div className="p-4 rounded-2xl bg-[#fafcf9] border border-[#e2ece0] flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#edf6ec] text-[#2c6e26] border border-[#d6e7d3] flex items-center justify-center shrink-0 mt-0.5">
                <User size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#637f66] block">
                  Full Name
                </span>
                <span className="text-base sm:text-lg font-extrabold text-[#18201a] tracking-tight truncate block mt-0.5">
                  {displayName}
                </span>
              </div>
            </div>

            {/* Detail Item: Email Address */}
            <div className="p-4 rounded-2xl bg-[#fafcf9] border border-[#e2ece0] flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#edf6ec] text-[#2c6e26] border border-[#d6e7d3] flex items-center justify-center shrink-0 mt-0.5">
                <Mail size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#637f66] block">
                  Email Address
                </span>
                <span className="text-base sm:text-lg font-extrabold text-[#18201a] tracking-tight truncate block mt-0.5">
                  {user.email || 'counsel@legal.ai'}
                </span>
              </div>
            </div>

            {/* Detail Item: Account Role */}
            <div className="p-4 rounded-2xl bg-[#fafcf9] border border-[#e2ece0] flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#edf6ec] text-[#2c6e26] border border-[#d6e7d3] flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#637f66] block">
                  Role & Access
                </span>
                <span className="text-base sm:text-lg font-extrabold text-[#18201a] tracking-tight truncate block mt-0.5">
                  {user.role || 'Legal Counsel'}
                </span>
              </div>
            </div>

            {/* Detail Item: User ID */}
            <div className="p-4 rounded-2xl bg-[#fafcf9] border border-[#e2ece0] flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#edf6ec] text-[#2c6e26] border border-[#d6e7d3] flex items-center justify-center shrink-0 mt-0.5">
                <Key size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#637f66] block">
                    Account ID
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="text-[11px] font-bold text-[#2e6e27] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-[#2c6e26]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <span className="text-sm sm:text-base font-mono font-bold text-[#1f3722] tracking-tight truncate block mt-0.5">
                  {user.id || 'usr_default'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Activity & Metrics */}
        <div>
          <h2 className="text-xs sm:text-sm font-extrabold text-[#3b593e] uppercase tracking-wider mb-3.5">
            Workspace Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4.5 rounded-2xl bg-[#f5f9f3] border border-[#d9e8d6] flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#527056]">
                Saved Contracts
              </span>
              <span className="text-3xl font-black text-[#1b3d1f] mt-1">
                {documents.length}
              </span>
              <span className="text-[11px] text-[#638067] font-medium mt-1">
                Permanently preserved in database
              </span>
            </div>

            <div className="p-4.5 rounded-2xl bg-[#fffbeb] border border-[#fde68a] flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                High Risk Flags
              </span>
              <span className="text-3xl font-black text-amber-600 mt-1">
                {highRiskCount}
              </span>
              <span className="text-[11px] text-amber-700 font-medium mt-1">
                Requires counsel review
              </span>
            </div>

            <div className="p-4.5 rounded-2xl bg-[#f8faf7] border border-[#dfe8dc] flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#527056]">
                System Status
              </span>
              <span className="text-base font-extrabold text-[#1f4023] mt-2 inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                {isOnline ? 'Online & Healthy' : 'Offline'}
              </span>
              <span className="text-[11px] text-[#638067] font-medium mt-1">
                Database & AI active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
