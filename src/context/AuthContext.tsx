import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, SavedAddress } from '../types';
import { authService, storageService } from '../services';

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
  loginWithGoogle: (data: {
    googleId: string;
    email: string;
    fullName: string;
    profilePhoto?: string;
    mobile?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
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

  // Restore and verify customer session from persistent storage on mount
  useEffect(() => {
    const savedToken = storageService.getAuthToken();
    const savedUser = storageService.getCustomerUser();

    if (savedToken && savedUser) {
      setToken(savedToken);
      setCustomer(savedUser);

      // Verify with backend
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
          // If offline, keep local user state so user isn't abruptly booted
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const saveSession = (newToken: string, newCustomer: Customer) => {
    setToken(newToken);
    setCustomer(newCustomer);
    storageService.setAuthToken(newToken);
    storageService.setCustomerUser(newCustomer);
  };

  const logout = () => {
    setToken(null);
    setCustomer(null);
    authService.logout();
  };

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    if (!res.success || !res.token || !res.customer) {
      return { success: false, error: res.error || 'Login failed.' };
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
    const res = await authService.register(data);
    if (!res.success || !res.token || !res.customer) {
      return { success: false, error: res.error || 'Registration failed.' };
    }
    saveSession(res.token, res.customer);
    return { success: true };
  };

  const loginWithGoogle = async (googleData: {
    googleId: string;
    email: string;
    fullName: string;
    profilePhoto?: string;
    mobile?: string;
  }) => {
    const res = await authService.loginWithGoogle(googleData);
    if (!res.success || !res.token || !res.customer) {
      return { success: false, error: res.error || 'Google login failed.' };
    }
    saveSession(res.token, res.customer);
    return { success: true };
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
