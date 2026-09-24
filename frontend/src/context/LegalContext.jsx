import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  checkHealth,
  getDocuments,
  getDocumentDetails,
  uploadDocument as apiUploadDocument,
  deleteDocument as apiDeleteDocument,
  registerUserApi,
  loginUserApi,
  checkUserSession,
} from '../services/api';

const LegalContext = createContext(null);

export function LegalProvider({ children }) {
  const [health, setHealth] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgressStep, setUploadProgressStep] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [dbConnected, setDbConnected] = useState(true);

  // Auth state persisted in localStorage
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('legal_ai_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read user from localStorage', e);
    }
    return null;
  });

  // Language state persisted in localStorage
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('legal_ai_language') || 'en';
    } catch (e) {
      return 'en';
    }
  });

  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('legal_ai_language', newLang);
      document.documentElement.setAttribute('lang', newLang);
      if (newLang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
      }
    } catch (e) {}
  };

  useEffect(() => {
    try {
      document.documentElement.setAttribute('lang', language);
      if (language === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
      }
    } catch (e) {}
  }, [language]);


  const refreshDocuments = async (overrideUserId = null) => {
    try {
      const activeUserId = overrideUserId !== null ? overrideUserId : user?.id;
      const docs = await getDocuments(activeUserId);
      setDocuments(docs || []);
      return docs;
    } catch (err) {
      console.error('Error loading documents:', err);
      return [];
    }
  };

  const refreshHealth = async () => {
    try {
      const h = await checkHealth();
      setHealth(h);
      if (!h || h.status === 'error' || h.database_connected === false || h.components?.database?.connected === false) {
        const isDbDown = h?.database_connected === false || h?.components?.database?.connected === false;
        setDbConnected(!isDbDown);
        const errDetail = h?.error_message || h?.detail || h?.components?.database?.error || (isDbDown ? 'Database disconnected' : 'Technical problem detected');
        setError(errDetail);
      } else {
        setDbConnected(true);
        setError(null);
      }
      return h;
    } catch (err) {
      setDbConnected(false);
      setError('Backend service offline. Technical problem detected.');
      setHealth({ status: 'error', database_connected: false, detail: 'Connection refused' });
      return null;
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      // Verify if authenticated user still exists in the database
      if (user && !user.isGuest) {
        const liveUser = await checkUserSession(user.id);
        if (!liveUser) {
          // User was removed from database -> clear session & logout immediately
          setUser(null);
          try {
            localStorage.removeItem('legal_ai_user');
          } catch (e) {}
          setLoading(false);
          return;
        }
      }
      await Promise.all([refreshHealth(), refreshDocuments(user?.id)]);
      setLoading(false);
    };
    init();

    // Periodic heartbeat check every 5s for real-time status & session validation
    const interval = setInterval(async () => {
      refreshHealth();
      if (user && !user.isGuest) {
        const liveUser = await checkUserSession(user.id);
        if (!liveUser) {
          setUser(null);
          try {
            localStorage.removeItem('legal_ai_user');
          } catch (e) {}
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.id]);

  const uploadFile = async (file, useSample = false) => {
    try {
      setUploading(true);
      setUploadProgressStep(0);

      const t1 = setTimeout(() => setUploadProgressStep(1), 600);
      const t2 = setTimeout(() => setUploadProgressStep(2), 1500);
      const t3 = setTimeout(() => setUploadProgressStep(3), 2600);

      // Pass user?.id so the document is permanently linked to the user's history
      const res = await apiUploadDocument(file, useSample, user?.id);

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      await refreshDocuments(user?.id);
      await refreshHealth();
      setUploadModalOpen(false);
      return res;
    } catch (err) {
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const deleteDoc = async (docId) => {
    await apiDeleteDocument(docId);
    await refreshDocuments(user?.id);
  };

  const loginUser = async (email, password, isSignUp = false, fullName = null) => {
    let authRes;
    if (isSignUp) {
      authRes = await registerUserApi(email, password, fullName);
    } else {
      authRes = await loginUserApi(email, password);
    }
    const loggedInUser = authRes.user;
    setUser(loggedInUser);
    try {
      localStorage.setItem('legal_ai_user', JSON.stringify(loggedInUser));
    } catch (e) {
      console.warn('Could not save user to localStorage', e);
    }
    return loggedInUser;
  };

  const loginAsGuest = () => {
    const guestUser = {
      id: 'usr_guest',
      email: 'guest@legal.ai',
      name: 'Guest Reviewer',
      role: 'Guest Counsel',
      isGuest: true,
    };
    setUser(guestUser);
    try {
      localStorage.setItem('legal_ai_user', JSON.stringify(guestUser));
    } catch (e) {}
  };

  const logoutUser = () => {
    setUser(null);
    try {
      localStorage.removeItem('legal_ai_user');
    } catch (e) {}
  };

  const isOnline = Boolean(health && health.status !== 'error' && dbConnected && !error);
  const hasTechnicalProblem = Boolean(!isOnline || error || health?.status === 'error' || !dbConnected);

  return (
    <LegalContext.Provider
      value={{
        health,
        documents,
        loading,
        uploading,
        uploadProgressStep,
        uploadModalOpen,
        setUploadModalOpen,
        error,
        dbConnected,
        isOnline,
        hasTechnicalProblem,
        user,
        language,
        setLanguage,
        refreshDocuments,
        refreshHealth,
        uploadFile,
        deleteDoc,
        loginUser,
        loginAsGuest,
        logoutUser,
      }}
    >
      {children}
    </LegalContext.Provider>
  );
}

export function useLegal() {
  const context = useContext(LegalContext);
  if (!context) {
    throw new Error('useLegal must be used within a LegalProvider');
  }
  return context;
}
