import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, SavedAddress } from '../types';
import { authService, storageService } from '../services';
import {
  auth,
  signInWithGoogleFirebase,
  getFirebaseErrorMessage,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
} from '../lib/firebase';

interface AuthContextType {
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (data?: {
    googleId?: string;
    email?: string;
    fullName?: string;
    profilePhoto?: string;
    mobile?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (fullName: string, mobile: string) => Promise<{ success: boolean; error?: string }>;
  addAddress: (address: Omit<SavedAddress, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  updateAddress: (id: string, address: Partial<SavedAddress>) => Promise<{ success: boolean; error?: string }>;
  deleteAddress: (id: string) => Promise<{ success: boolean; error?: string }>;
  setDefaultAddress: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(() => storageService.getCustomerUser());
  const [token, setToken] = useState<string | null>(() => storageService.getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const saveSession = (newToken: string, newCustomer: Customer) => {
    setToken(newToken);
    setCustomer(newCustomer);
    storageService.setAuthToken(newToken);
    storageService.setCustomerUser(newCustomer);
  };

  // Restore and verify customer session from persistent storage on mount
  useEffect(() => {
    const savedToken = storageService.getAuthToken();
    const savedUser = storageService.getCustomerUser();

    if (savedToken && savedUser) {
      setToken(savedToken);
      setCustomer(savedUser);

      // Verify session with backend
      authService
        .getProfile(savedToken)
        .then((res) => {
          if (res.customer) {
            setCustomer(res.customer);
          } else {
            // Session expired or invalidated on server
            logout();
          }
        })
        .catch(() => {
          // If offline, keep local user state
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    // 2. Check for Firebase Redirect Result (for mobile / redirect auth flows)
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user && result.user.email) {
          const fbUser = result.user;
          const res = await authService.loginWithGoogle({
            googleId: fbUser.uid,
            email: fbUser.email,
            fullName: fbUser.displayName || 'SpiceShahi Customer',
            profilePhoto: fbUser.photoURL || undefined,
            mobile: fbUser.phoneNumber || undefined,
          });
          if (res.success && res.token && res.customer) {
            saveSession(res.token, res.customer);
          }
        }
      })
      .catch((err) => {
        console.warn('[Firebase Auth] Redirect result handling:', err);
      });

    // 3. Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser && fbUser.email) {
        const curToken = storageService.getAuthToken();
        const curCustomer = storageService.getCustomerUser();

        // If local session is missing or points to another user, sync with backend
        if (!curToken || !curCustomer || curCustomer.email.toLowerCase() !== fbUser.email.toLowerCase()) {
          try {
            const res = await authService.loginWithGoogle({
              googleId: fbUser.uid,
              email: fbUser.email,
              fullName: fbUser.displayName || 'SpiceShahi Customer',
              profilePhoto: fbUser.photoURL || undefined,
              mobile: fbUser.phoneNumber || undefined,
            });
            if (res.success && res.token && res.customer) {
              saveSession(res.token, res.customer);
            }
          } catch (syncErr) {
            console.error('[Firebase Auth] Sync error onAuthStateChanged:', syncErr);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('[Firebase Auth] Sign out notice:', e);
    }
    setToken(null);
    setCustomer(null);
    authService.logout();
  };

  const login = async (email: string, password: string) => {
    // 1. Try Firebase Authentication first
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (fbErr: any) {
      console.warn('[Firebase Auth] Notice signing in with Firebase:', fbErr?.code || fbErr?.message);
    }

    // 2. Authoritative backend login and session generation
    const res = await authService.login(email, password);
    if (!res.success || !res.token || !res.customer) {
      return { success: false, error: res.error || 'Login failed. Please check your credentials.' };
    }

    saveSession(res.token, res.customer);
    return { success: true };
  };

  const register = async (data: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
  }) => {
    // 1. Authoritative backend registration
    const res = await authService.register(data);
    if (!res.success || !res.token || !res.customer) {
      return { success: false, error: res.error || 'Registration failed.' };
    }

    // 2. Synchronize with Firebase Authentication
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      if (userCredential.user) {
        await updateFirebaseProfile(userCredential.user, {
          displayName: data.fullName,
        });
      }
    } catch (fbErr: any) {
      // If user exists in Firebase or other notice, non-blocking
      console.warn('[Firebase Auth] Notice during registration sync:', fbErr?.code || fbErr?.message);
    }

    saveSession(res.token, res.customer);
    return { success: true };
  };

  const loginWithGoogle = async (googleData?: {
    googleId?: string;
    email?: string;
    fullName?: string;
    profilePhoto?: string;
    mobile?: string;
  }) => {
    try {
      let payload = googleData;

      // If no data passed, trigger Firebase Google Sign-In popup/redirect
      if (!payload || !payload.email) {
        const fbUser = await signInWithGoogleFirebase();
        if (!fbUser.email) {
          return { success: false, error: 'Google account did not return a valid email address.' };
        }
        payload = {
          googleId: fbUser.uid,
          email: fbUser.email,
          fullName: fbUser.displayName || 'SpiceShahi Customer',
          profilePhoto: fbUser.photoURL || undefined,
          mobile: fbUser.phoneNumber || undefined,
        };
      }

      // Sync with backend customer storage
      const res = await authService.loginWithGoogle(payload);
      if (!res.success || !res.token || !res.customer) {
        return { success: false, error: res.error || 'Google login failed.' };
      }

      saveSession(res.token, res.customer);
      return { success: true };
    } catch (err: any) {
      console.error('[Firebase Auth] Google login error:', err);
      const friendlyMsg = getFirebaseErrorMessage(err);
      return { success: false, error: friendlyMsg };
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    const res = await authService.getProfile(token);
    if (res.customer) {
      setCustomer(res.customer);
    }
  };

  const updateProfile = async (fullName: string, mobile: string) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    const res = await authService.updateProfile(fullName, mobile, token);
    if (!res.success || !res.customer) {
      return { success: false, error: res.error || 'Failed to update profile' };
    }
    setCustomer(res.customer);
    return { success: true };
  };

  const addAddress = async (address: Omit<SavedAddress, 'id' | 'createdAt'>) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    const res = await authService.addAddress(address, token);
    if (!res.success || !res.customer) {
      return { success: false, error: res.error || 'Failed to save address' };
    }
    setCustomer(res.customer);
    return { success: true };
  };

  const updateAddress = async (id: string, addressUpdates: Partial<SavedAddress>) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    const res = await authService.updateAddress(id, addressUpdates, token);
    if (!res.success || !res.customer) {
      return { success: false, error: res.error || 'Failed to update address' };
    }
    setCustomer(res.customer);
    return { success: true };
  };

  const deleteAddress = async (id: string) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    const res = await authService.deleteAddress(id, token);
    if (!res.success || !res.customer) {
      return { success: false, error: res.error || 'Failed to delete address' };
    }
    setCustomer(res.customer);
    return { success: true };
  };

  const setDefaultAddress = async (id: string) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    const res = await authService.setDefaultAddress(id, token);
    if (!res.success || !res.customer) {
      return { success: false, error: res.error || 'Failed to set default address' };
    }
    setCustomer(res.customer);
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        token,
        isAuthenticated: Boolean(token && customer),
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshProfile,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
