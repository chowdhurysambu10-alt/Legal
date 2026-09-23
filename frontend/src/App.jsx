import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LegalProvider, useLegal } from './context/LegalContext';
import DisclaimerBanner from './components/DisclaimerBanner';
import Navbar from './components/Navbar';
import UploadModal from './components/UploadModal';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import DocumentDetailPage from './pages/DocumentDetailPage';
import ComparisonPage from './pages/ComparisonPage';
import LoginPage from './pages/LoginPage';

function AppContent() {
  const { uploadModalOpen, setUploadModalOpen, health, error } = useLegal();
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isAuth = location.pathname === '/login';
  const hideWorkspaceChrome = isLanding || isAuth;
  const isOnline = Boolean(health && health.status !== 'error' && health.database_connected !== false && !error);

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#18201a] flex flex-col font-sans selection:bg-[#b4f070] selection:text-[#13240c]">
      {/* 
        Show workspace Disclaimer Banner only on internal workspace screens, 
        keeping landing and auth screens clean
      */}
      {!hideWorkspaceChrome && <DisclaimerBanner />}

      {/* 
        Show workspace Navbar only on internal application views
      */}
      {!hideWorkspaceChrome && <Navbar isOnline={isOnline} />}

      {/* Application Routes */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/documents/:id" element={<DocumentDetailPage />} />
        <Route path="/compare" element={<ComparisonPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>

      {/* Global Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LegalProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </LegalProvider>
  );
}
