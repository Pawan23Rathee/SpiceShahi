import React, { useState } from 'react';
import { Page } from '../types';
import { Mail, KeyRound, ArrowRight, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (page: Page) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setMessage('');
    if (!email) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        setMessage(data.message || 'Password reset code generated.');
        if (data.resetToken) {
          setResetToken(data.resetToken);
        }
        setStep('reset');
      } else {
        setErrorMessage(data.error || 'Failed to process request.');
      }
    } catch (e: any) {
      setIsLoading(false);
      setErrorMessage(e.message || 'Network error.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setMessage('');

    if (!resetToken || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetToken, newPassword }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        setMessage(data.message || 'Password reset successful!');
        setTimeout(() => {
          onNavigate('login');
        }, 1500);
      } else {
        setErrorMessage(data.error || 'Failed to reset password.');
      }
    } catch (e: any) {
      setIsLoading(false);
      setErrorMessage(e.message || 'Network error.');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#E8E4D5] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-[#96281B] to-[#F1C40F]" />

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FCFAF2] border border-[#E8E4D5] mb-2">
            <KeyRound className="w-6 h-6 text-[#96281B]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#2C3E50]">Reset Password</h2>
          <p className="text-xs text-[#5D6D7E]">
            {step === 'request'
              ? 'Enter your email address to receive password reset instructions.'
              : 'Enter your reset token and new secure password.'}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {message && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-xs text-green-700">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
            <span>{message}</span>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1.5">
                Registered Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#96281B] hover:bg-[#7D2116] disabled:bg-stone-300 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? <span>Checking...</span> : <span>Send Reset Token</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1">
                Reset Token / Code *
              </label>
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="Paste token received"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs font-mono text-[#2C3E50]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1">
                New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 chars"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#96281B] hover:bg-[#7D2116] disabled:bg-stone-300 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? <span>Updating Password...</span> : <span>Confirm & Update Password</span>}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-[#E8E4D5] text-xs text-[#5D6D7E]">
          Remember your password?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-[#96281B] hover:underline ml-1 cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
