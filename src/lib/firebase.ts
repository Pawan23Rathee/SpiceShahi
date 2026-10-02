import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || 'AIzaSyBQZql0yw6Jz-1c44HVMXQdtpxitdcFGcs',
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || 'spiceshahi-977b3.firebaseapp.com',
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || 'spiceshahi-977b3',
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || 'spiceshahi-977b3.firebasestorage.app',
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '126611348175',
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '1:126611348175:web:f808cbd9c422b76a2075ba',
  measurementId: (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID || 'G-J10L2ZXDPE',
};

// Initialize Firebase only once
export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);

// Configure Google Auth Provider with account selection
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Maps Firebase Auth error codes to user-friendly messages
 */
export function getFirebaseErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred.';
  const code = error.code || '';

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Previous sign-in attempt was cancelled.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for spiceshahi.in.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email address under a different sign-in method.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify and retry.';
    case 'auth/user-not-found':
      return 'No registered account found with this email.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please log in.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection and retry.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please wait a few moments and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact SpiceShahi support.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

/**
 * Initiates Google Sign-In via Firebase
 * Uses popup on desktop, with automatic fallback for mobile/blocked popups
 */
export async function signInWithGoogleFirebase(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    // If popup was blocked or on restrictive mobile browser, fallback to redirect
    if (error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, googleProvider);
      throw new Error('Redirecting to Google Sign-In...');
    }
    throw error;
  }
}

export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
};
export type { User };
