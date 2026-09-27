import React, { useState } from 'react';
import { Page } from '../types';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: Page, slugOrId?: string) => void;
  redirectTarget?: Page;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigate,
  redirectTarget = 'account',
}) => {
  const { register, loginWithGoogle } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName || !email || !mobile || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (mobile.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    const result = await register({
      fullName,
      email,
      mobile,
      password,
    });
    setIsLoading(false);

    if (result.success) {
      onNavigate(redirectTarget);
    } else {
      setErrorMessage(result.error || 'Registration failed.');
    }
  };

  const handleSimulateGoogleLogin = async (overrideEmail?: string, overrideName?: string) => {
    setIsLoading(true);
    const gEmail = overrideEmail || googleEmail || 'customer@gmail.com';
    const gName = overrideName || googleName || 'Google User';

    const result = await loginWithGoogle({
      googleId: `goog_${Date.now()}`,
      email: gEmail,
      fullName: gName,
    });
    setIsLoading(false);
    setShowGoogleModal(false);

    if (result.success) {
      onNavigate(redirectTarget);
    } else {
      setErrorMessage(result.error || 'Google login failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#E8E4D5] shadow-xl relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-[#96281B] via-[#D35400] to-[#F1C40F]" />

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FCFAF2] border border-[#E8E4D5] mb-2 shadow-xs">
            <User className="w-6 h-6 text-[#96281B]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3E50] tracking-tight">
            Create an Account
          </h2>
          <p className="text-xs sm:text-sm text-[#5D6D7E]">
            Join SpiceShahi for address autofill, real order tracking, and member offers.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Continue with Google */}
        <div>
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className="w-full py-3 px-4 bg-white hover:bg-stone-50 text-[#2C3E50] border border-[#E8E4D5] rounded-xl font-semibold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-3 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8E4D5]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-[#5D6D7E] font-medium">Or register with email</span>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
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
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Pawan Rathee"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden"
              />
            </div>
          </div>

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1">
              Mobile Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="98XXXXXXXX"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 chars"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-1">
                Confirm *
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
                  placeholder="Confirm password"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50] focus:ring-2 focus:ring-[#96281B] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#96281B] hover:bg-[#7D2116] disabled:bg-stone-300 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Register & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#E8E4D5] text-xs text-[#5D6D7E]">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-[#96281B] hover:underline ml-1 cursor-pointer"
          >
            Sign In here
          </button>
        </div>
      </div>

      {/* Google Login Prompt Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-[#E8E4D5] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#2C3E50]">Google Sign-In</h3>
                <p className="text-[11px] text-[#5D6D7E]">Select or enter your Google account</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSimulateGoogleLogin('ratheepawan23@gmail.com', 'Pawan Rathee')}
                className="w-full p-3 rounded-xl border border-[#E8E4D5] hover:bg-[#FCFAF2] text-left flex items-center gap-3 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#96281B] text-white flex items-center justify-center font-bold text-xs">
                  P
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#2C3E50] truncate">Pawan Rathee</p>
                  <p className="text-[10px] text-[#5D6D7E] truncate">ratheepawan23@gmail.com</p>
                </div>
              </button>

              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-[#5D6D7E] mb-1">
                  Or enter another Google Email:
                </label>
                <input
                  type="email"
                  placeholder="your.google@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E8E4D5] rounded-lg mb-2"
                />
                <input
                  type="text"
                  placeholder="Your Name"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E8E4D5] rounded-lg mb-2"
                />
                <button
                  type="button"
                  onClick={() => handleSimulateGoogleLogin()}
                  disabled={!googleEmail}
                  className="w-full py-2 bg-[#96281B] text-white rounded-lg text-xs font-bold disabled:bg-stone-300 cursor-pointer"
                >
                  Continue with this Account
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              className="w-full py-2 text-xs text-[#5D6D7E] hover:text-[#2C3E50] text-center cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
