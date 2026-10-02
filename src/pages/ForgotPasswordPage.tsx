import React, { useState } from 'react';
import { Page } from '../types';
import { Mail, KeyRound, ArrowRight, AlertCircle, CheckCircle2, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (page: Page, slugOrId?: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        setMessage(
          data.message ||
            'If an account exists with this email address, password reset instructions have been sent to your inbox.'
        );
        // Automatically advance to step 2 where token from email can be entered
        setStep('reset');
      } else {
        setErrorMessage(data.error || 'Failed to process request. Please try again.');
      }
    } catch (e: any) {
      setIsLoading(false);
      setErrorMessage(e.message || 'Network error occurred. Please check your connection.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setMessage('');

    const cleanToken = resetToken.trim();
    if (!cleanToken || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill in your reset token and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          resetToken: cleanToken,
          newPassword,
        }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        setMessage(data.message || 'Your password has been successfully reset! Redirecting to sign in...');
        setTimeout(() => {
          onNavigate('login');
        }, 1800);
      } else {
        setErrorMessage(data.error || 'Failed to reset password. Please ensure the token is correct.');
      }
    } catch (e: any) {
      setIsLoading(false);
      setErrorMessage(e.message || 'Network error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8 sm:py-12 px-3 sm:px-6 lg:px-8 w-full max-w-full">
      <div className="w-full max-w-md bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-[#E8E4D5] shadow-xl relative overflow-hidden box-border mx-auto space-y-6">
        <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-[#96281B] via-[#D35400] to-[#F1C40F]" />

        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FCFAF2] border border-[#E8E4D5] mb-1 shadow-xs">
            <KeyRound className="w-5 h-5 sm:w-6 sm:h-6 text-[#96281B]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3E50] tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm text-[#5D6D7E] max-w-xs mx-auto">
            {step === 'request'
              ? 'Enter your registered email address to receive secure reset instructions.'
              : 'Enter the reset token sent to your email and your new password.'}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span className="flex-1 break-words">{errorMessage}</span>
          </div>
        )}

        {message && (
          <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2.5 text-xs text-green-800 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600 mt-0.5" />
            <span className="flex-1 break-words">{message}</span>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1.5">
                Registered Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden box-border"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#96281B] hover:bg-[#7D2116] disabled:bg-stone-300 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Dispatching Instructions...</span>
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1">
                Reset Token (From Email) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value.trim())}
                  placeholder="Enter 32-character token"
                  className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] font-mono text-xs text-[#2C3E50] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden box-border"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1">
                New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden box-border"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-[#2C3E50] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden box-border"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#96281B] hover:bg-[#7D2116] disabled:bg-stone-300 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? <span>Updating Password...</span> : <span>Save New Password</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('request');
                setMessage('');
                setErrorMessage('');
              }}
              className="w-full py-2 text-xs text-[#5D6D7E] hover:text-[#2C3E50] text-center cursor-pointer"
            >
              Didn't receive email? Request a new token
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-[#E8E4D5]">
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="inline-flex items-center gap-1.5 text-xs text-[#5D6D7E] hover:text-[#96281B] font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
