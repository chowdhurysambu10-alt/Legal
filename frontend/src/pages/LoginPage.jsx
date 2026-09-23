import React, { useState } from 'react';
import { Scale, Lock, Mail, ArrowRight, User, AlertCircle, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useLegal } from '../context/LegalContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const { loginUser, loginAsGuest } = useLegal();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    // Validation: Confirm password on sign up
    if (isSignUp) {
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match. Please verify and try again.');
        return;
      }
      if (password.length < 6) {
        setAuthError('Password must be at least 6 characters long.');
        return;
      }
    }

    setAuthLoading(true);

    try {
      await loginUser(email, password, isSignUp, fullName);
      navigate('/dashboard');
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/dashboard');
  };

  const resetForm = (signUpMode) => {
    setIsSignUp(signUpMode);
    setAuthError('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-sage-backdrop bg-grid-overlay flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-6 left-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-xs font-semibold text-[#4c6450] hover:text-[#18201a] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-[#dce8da] backdrop-blur-xs cursor-pointer transition-colors"
        >
          <span>&larr; Back to Home</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="w-12 h-12 rounded-full bg-[#18201a] mx-auto flex items-center justify-center text-white shadow-md mb-3">
            <Scale size={20} className="text-[#b4f070]" />
          </div>
          <h1 className="text-3xl font-bold text-[#18201a] tracking-tight font-serif-editorial">
            Legal AI
          </h1>
          <p className="text-xs text-[#4c6450] mt-1 font-medium">
            Autonomous Legal Intelligence & Workspace
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#dfe8dc] p-7 sm:p-8 shadow-xl">
          <div className="flex p-1 bg-[#edf4ea] rounded-full mb-6 border border-[#dce8da]">
            <button
              type="button"
              onClick={() => resetForm(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                !isSignUp
                  ? 'bg-[#18201a] text-white shadow-2xs'
                  : 'text-[#4c6450] hover:text-[#18201a]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => resetForm(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                isSignUp
                  ? 'bg-[#18201a] text-white shadow-2xs'
                  : 'text-[#4c6450] hover:text-[#18201a]'
              }`}
            >
              Create Account
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <div>
                <label className="text-[11px] font-bold text-[#4c6450] uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full pl-9 pr-3 py-2 rounded-full border border-[#dce8da] text-xs text-[#18201a] placeholder:text-[#889d8b] focus:outline-none focus:border-[#4b6b4e] bg-[#fafcf9]"
                  />
                  <User size={14} className="absolute left-3 top-2.5 text-[#7f9982]" />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-[#4c6450] uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="counsel@firm.com"
                  className="w-full pl-9 pr-3 py-2 rounded-full border border-[#dce8da] text-xs text-[#18201a] placeholder:text-[#889d8b] focus:outline-none focus:border-[#4b6b4e] bg-[#fafcf9]"
                />
                <Mail size={14} className="absolute left-3 top-2.5 text-[#7f9982]" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#4c6450] uppercase tracking-wider block mb-1">
                Password {isSignUp && <span className="text-[10px] text-[#7f9982] lowercase font-normal">(min 6 chars)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 rounded-full border border-[#dce8da] text-xs text-[#18201a] placeholder:text-[#889d8b] focus:outline-none focus:border-[#4b6b4e] bg-[#fafcf9]"
                />
                <Lock size={14} className="absolute left-3 top-2.5 text-[#7f9982]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-2 text-[#7f9982] hover:text-[#18201a] p-0.5 cursor-pointer transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-[#4c6450] uppercase tracking-wider block">
                    Confirm Password
                  </label>
                  {confirmPassword && password && (
                    <span className="text-[10px] font-semibold flex items-center gap-1">
                      {password === confirmPassword ? (
                        <span className="text-emerald-600 inline-flex items-center gap-0.5">
                          <CheckCircle2 size={11} /> Passwords match
                        </span>
                      ) : (
                        <span className="text-rose-500">Does not match</span>
                      )}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full pl-9 pr-10 py-2 rounded-full border text-xs text-[#18201a] placeholder:text-[#889d8b] focus:outline-none bg-[#fafcf9] ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-rose-300 focus:border-rose-500'
                        : 'border-[#dce8da] focus:border-[#4b6b4e]'
                    }`}
                  />
                  <Lock size={14} className="absolute left-3 top-2.5 text-[#7f9982]" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-2 text-[#7f9982] hover:text-[#18201a] p-0.5 cursor-pointer transition-colors"
                    title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="btn-dark-pill w-full py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              {authLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Authenticating with Supabase...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Legal Account' : 'Sign In'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#edf4ea] text-center">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="text-xs text-[#4c6450] hover:text-[#18201a] font-medium cursor-pointer underline underline-offset-2"
            >
              Continue as Guest Reviewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
