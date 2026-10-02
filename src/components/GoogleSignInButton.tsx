import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface GoogleSignInButtonProps {
  mode?: 'login' | 'signup';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  mode = 'login',
  onSuccess,
  onError,
  className = '',
}) => {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        onSuccess?.();
      } else {
        onError?.(result.error || 'Google Sign-In was cancelled or failed.');
      }
    } catch (err: any) {
      onError?.(err.message || 'An unexpected error occurred during Google Sign-In.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-full ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        aria-label={mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
        className="w-full py-3 px-4 bg-white hover:bg-stone-50 active:bg-stone-100 text-[#2C3E50] border border-[#E8E4D5] hover:border-[#96281B]/40 rounded-xl font-semibold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed select-none box-border"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-[#96281B] border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
        )}
        <span className="truncate">
          {isLoading
            ? 'Connecting to Google...'
            : mode === 'signup'
            ? 'Sign up with Google'
            : 'Continue with Google'}
        </span>
      </button>
    </div>
  );
};
