import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, SavedAddress } from '../types';

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

const TOKEN_KEY = 'spiceshahi_customer_token';
const USER_KEY = 'spiceshahi_customer_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedToken && savedUser) {
        setToken(savedToken);
        setCustomer(JSON.parse(savedUser));
        // Verify with server in background
        fetch('/api/customer/me', {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error('Session expired');
          })
          .then((freshUser) => {
            setCustomer(freshUser);
            localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
          })
          .catch(() => {
            // Expired or invalid
            logout();
          })
          .finally(() => {
            setIsLoading(false);
          });
        return;
      }
    } catch (e) {
      console.error('Error restoring customer session:', e);
    }
    setIsLoading(false);
  }, []);

  const saveSession = (newToken: string, newCustomer: Customer) => {
    setToken(newToken);
    setCustomer(newCustomer);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newCustomer));
  };

  const logout = () => {
    setToken(null);
    setCustomer(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed.' };
      }
      saveSession(data.token, data.customer);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login.' };
    }
  };

  const register = async (data: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Registration failed.' };
      }
      saveSession(resData.token, resData.customer);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration.' };
    }
  };

  const loginWithGoogle = async (googleData: {
    googleId: string;
    email: string;
    fullName: string;
    profilePhoto?: string;
    mobile?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Google login failed.' };
      }
      saveSession(data.token, data.customer);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during Google login.' };
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/customer/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const freshUser = await res.json();
        setCustomer(freshUser);
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      }
    } catch (err) {
      console.error('Error refreshing customer profile:', err);
    }
  };

  const updateProfile = async (fullName: string, mobile: string) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, mobile }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to update profile' };
      setCustomer(data);
      localStorage.setItem(USER_KEY, JSON.stringify(data));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const addAddress = async (address: Omit<SavedAddress, 'id' | 'createdAt'>) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(address),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to save address' };
      if (data.customer) {
        setCustomer(data.customer);
        localStorage.setItem(USER_KEY, JSON.stringify(data.customer));
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateAddress = async (id: string, addressUpdates: Partial<SavedAddress>) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`/api/customer/addresses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressUpdates),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to update address' };
      if (data.customer) {
        setCustomer(data.customer);
        localStorage.setItem(USER_KEY, JSON.stringify(data.customer));
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteAddress = async (id: string) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`/api/customer/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to delete address' };
      if (data.customer) {
        setCustomer(data.customer);
        localStorage.setItem(USER_KEY, JSON.stringify(data.customer));
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const setDefaultAddress = async (id: string) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`/api/customer/addresses/${id}/default`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to set default address' };
      if (data.customer) {
        setCustomer(data.customer);
        localStorage.setItem(USER_KEY, JSON.stringify(data.customer));
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
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
