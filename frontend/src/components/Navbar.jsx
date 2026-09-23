import React from 'react';
import { Scale, UploadCloud, Files, User, Sparkles } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLegal } from '../context/LegalContext';

export default function Navbar({ isOnline: propIsOnline }) {
  const { user, setUploadModalOpen, health, error, dbConnected, isOnline: ctxIsOnline, refreshHealth } = useLegal();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine database and system health state
  const isDbDown = dbConnected === false || health?.database_connected === false || health?.components?.database?.connected === false;
  const isOnline = propIsOnline !== undefined ? propIsOnline : ctxIsOnline;
  const hasTechnicalProblem = !isOnline || isDbDown || health?.status === 'error' || Boolean(error);

  let statusLabel = 'System Ready';
  let statusTooltip = 'Database and AI services are healthy.';

  if (isDbDown) {
    statusLabel = 'Database Disconnected';
    statusTooltip = error || health?.error_message || 'Database connection is offline. Click to retry.';
  } else if (hasTechnicalProblem) {
    statusLabel = 'Technical Problem';
    statusTooltip = error || health?.detail || 'Technical issue detected. Click to retry.';
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#fbf9f5]/90 backdrop-blur-md border-b border-[#e5ebe2]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Identity & Nav Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            onClick={() => window.dispatchEvent(new CustomEvent('reset-dashboard-hub'))}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-full bg-[#18201a] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Scale size={17} className="text-[#b4f070]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#18201a] font-serif-editorial">
                Legal
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-[#e7efe4] text-[#344d37] border border-[#cfddcb]">
                Workspace
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5 pl-3 border-l border-[#e2eae0]">
            <Link
              to="/dashboard"
              onClick={() => window.dispatchEvent(new CustomEvent('reset-dashboard-hub'))}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-[#eaf4e8] text-[#2c6e26]'
                  : 'text-[#4e6651] hover:text-[#18201a]'
              }`}
            >
              My Contracts & History
            </Link>
            <Link
              to="/compare"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                location.pathname === '/compare'
                  ? 'bg-[#eaf4e8] text-[#2c6e26]'
                  : 'text-[#4e6651] hover:text-[#18201a]'
              }`}
            >
              Compare
            </Link>
          </nav>
        </div>

        {/* Right: Actions & Status */}
        <div className="flex items-center gap-3">
          {/* Subtle System Status Pill - Turns RED on database disconnect or technical error */}
          <div
            onClick={hasTechnicalProblem ? () => refreshHealth() : undefined}
            title={statusTooltip}
            className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all duration-300 ${
              hasTechnicalProblem
                ? 'bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] font-semibold cursor-pointer shadow-xs hover:bg-[#fee2e2]'
                : 'bg-[#eef4eb] border border-[#d6e3d2] text-[#38513b] font-medium'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {hasTechnicalProblem ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f87171] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef4444]"></span>
                </>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b4f070] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4da832]"></span>
                </>
              )}
            </span>
            <span>{statusLabel}</span>
          </div>



          {/* User Profile Avatar */}
          {user ? (
            <div className="flex items-center pl-2 border-l border-[#dbe4d7] gap-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-8 h-8 rounded-full bg-[#e2ede0] border border-[#c6dec2] text-[#2c472f] flex items-center justify-center text-xs font-bold hover:bg-[#d4e6d2] transition-colors"
                title={`Signed in as ${user.name}`}
              >
                {user.name.slice(0, 2).toUpperCase()}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-semibold text-[#344d37] hover:text-[#18201a] px-2 py-1"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
