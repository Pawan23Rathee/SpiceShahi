import React, { useState } from 'react';
import { Page } from '../types';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: Page, slugOrId?: string) => void;
  redirectTarget?: Page;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigate,
  redirectTarget = 'account',
}) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.replace(/\D/g, '');

    // 1. Required field validations
    if (!cleanName || !cleanEmail || !cleanMobile || !password || !confirmPassword) {
      setErrorMessage('All fields are required. Please fill in all fields.');
      return;
    }

    if (cleanName.length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // 3. Indian mobile number validation (10 digits starting with 6, 7, 8, 9)
    const indianMobileRegex = /^[6-9]\d{9}$/;
    if (!indianMobileRegex.test(cleanMobile)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    // 4. Password length and match validations
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        fullName: cleanName,
        email: cleanEmail,
        mobile: cleanMobile,
        password,
      });

      if (result.success) {
        onNavigate(redirectTarget);
      } else {
        setErrorMessage(result.error || 'Registration failed. An account with this email may already exist.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    onNavigate(redirectTarget);
  };

  const handleGoogleError = (err: string) => {
    setErrorMessage(err);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 sm:py-12 px-3 sm:px-6 lg:px-8 w-full max-w-full">
      <div className="w-full max-w-md bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-[#E8E4D5] shadow-xl relative overflow-hidden box-border mx-auto space-y-5">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-[#96281B] via-[#D35400] to-[#F1C40F]" />

        <div className="text-center space-y-1.5 pt-2">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FCFAF2] border border-[#E8E4D5] mb-1 shadow-xs">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#96281B]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3E50] tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-[#5D6D7E] max-w-xs mx-auto">
            Join SpiceShahi for address autofill, real order tracking, and member offers.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span className="flex-1 break-words">{errorMessage}</span>
          </div>
        )}

        {/* Continue with Google */}
        <div className="space-y-4">
          <GoogleSignInButton
            mode="signup"
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8E4D5]" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-white px-3 text-[#5D6D7E] font-medium">Or register with email</span>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1">
              Full Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Sharma"
                className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden box-border"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1">
              Email Address *
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
                className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden box-border"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1">
              Indian Mobile Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500 font-semibold text-xs">
                +91
              </div>
              <input
                type="tel"
                required
                autoComplete="tel"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                className="w-full pl-12 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden box-border"
              />
            </div>
            <p className="text-[10px] text-[#5D6D7E] mt-1">
              10-digit number for courier delivery SMS & live tracking
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden box-border"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-[#2C3E50] cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#96281B] hover:bg-[#7D2116] disabled:bg-stone-300 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-3"
          >
            {isLoading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Sign In */}
        <div className="text-center pt-3 border-t border-[#E8E4D5] text-xs text-[#5D6D7E]">
          Already have a SpiceShahi account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login', redirectTarget)}
            className="font-bold text-[#96281B] hover:underline ml-1 cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
