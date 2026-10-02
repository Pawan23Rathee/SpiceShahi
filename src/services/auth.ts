/**
 * Authentication Service - Multi-platform (Web & Ionic/Capacitor)
 * 
 * Encapsulates all authentication and customer account logic:
 * - Email/Password Registration and Login
 * - Google OAuth Sign-In
 * - Session restoration and persistent token storage
 * - Customer Profile updating
 * - Customer Saved Addresses (Add, Edit, Delete, Set Default)
 * - Password Reset flows
 * - Admin Authentication
 */

import { Customer, SavedAddress } from '../types';
import { apiClient } from './api';
import { storageService } from './storage';

export interface AuthResult {
  success: boolean;
  customer?: Customer;
  token?: string;
  error?: string;
}

export class AuthService {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResult> {
    const res = await apiClient.post('/api/auth/login', { email, password });
    if (!res.ok || !res.data?.token || !res.data?.customer) {
      return {
        success: false,
        error: res.error || 'Login failed. Please check your credentials.',
      };
    }

    const { token, customer } = res.data;
    storageService.setAuthToken(token);
    storageService.setCustomerUser(customer);

    return { success: true, token, customer };
  }

  /**
   * Register a new customer
   */
  async register(data: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
  }): Promise<AuthResult> {
    const res = await apiClient.post('/api/auth/register', data);
    if (!res.ok || !res.data?.token || !res.data?.customer) {
      return {
        success: false,
        error: res.error || 'Registration failed. Please try again.',
      };
    }

    const { token, customer } = res.data;
    storageService.setAuthToken(token);
    storageService.setCustomerUser(customer);

    return { success: true, token, customer };
  }

  /**
   * Google OAuth login / registration
   */
  async loginWithGoogle(data: {
    googleId?: string;
    email?: string;
    fullName?: string;
    profilePhoto?: string;
    mobile?: string;
    credential?: string;
  }): Promise<AuthResult> {
    const res = await apiClient.post('/api/auth/google', data);
    if (!res.ok || !res.data?.token || !res.data?.customer) {
      return {
        success: false,
        error: res.error || 'Google login failed.',
      };
    }

    const { token, customer } = res.data;
    storageService.setAuthToken(token);
    storageService.setCustomerUser(customer);

    return { success: true, token, customer };
  }

  /**
   * Fetch current authenticated customer profile from server
   */
  async getProfile(token?: string | null): Promise<{ customer?: Customer; error?: string }> {
    const activeToken = token || storageService.getAuthToken();
    if (!activeToken) {
      return { error: 'No active session token' };
    }

    const res = await apiClient.get<Customer>('/api/customer/me', { token: activeToken });
    if (res.ok && res.data) {
      storageService.setCustomerUser(res.data);
      return { customer: res.data };
    }

    return { error: res.error || 'Failed to fetch customer profile' };
  }

  /**
   * Update customer profile info
   */
  async updateProfile(
    fullName: string,
    mobile: string,
    token?: string | null
  ): Promise<{ success: boolean; customer?: Customer; error?: string }> {
    const activeToken = token || storageService.getAuthToken();
    const res = await apiClient.patch('/api/customer/profile', { fullName, mobile }, { token: activeToken });

    if (!res.ok || !res.data) {
      return { success: false, error: res.error || 'Failed to update profile' };
    }

    storageService.setCustomerUser(res.data);
    return { success: true, customer: res.data };
  }

  /**
   * Add a new saved address
   */
  async addAddress(
    address: Omit<SavedAddress, 'id' | 'createdAt'>,
    token?: string | null
  ): Promise<{ success: boolean; customer?: Customer; error?: string }> {
    const activeToken = token || storageService.getAuthToken();
    const res = await apiClient.post('/api/customer/addresses', address, { token: activeToken });

    if (!res.ok || !res.data?.customer) {
      return { success: false, error: res.error || 'Failed to add address' };
    }

    storageService.setCustomerUser(res.data.customer);
    return { success: true, customer: res.data.customer };
  }

  /**
   * Update an existing address
   */
  async updateAddress(
    id: string,
    address: Partial<SavedAddress>,
    token?: string | null
  ): Promise<{ success: boolean; customer?: Customer; error?: string }> {
    const activeToken = token || storageService.getAuthToken();
    const res = await apiClient.put(`/api/customer/addresses/${id}`, address, { token: activeToken });

    if (!res.ok || !res.data?.customer) {
      return { success: false, error: res.error || 'Failed to update address' };
    }

    storageService.setCustomerUser(res.data.customer);
    return { success: true, customer: res.data.customer };
  }

  /**
   * Delete an existing address
   */
  async deleteAddress(
    id: string,
    token?: string | null
  ): Promise<{ success: boolean; customer?: Customer; error?: string }> {
    const activeToken = token || storageService.getAuthToken();
    const res = await apiClient.delete(`/api/customer/addresses/${id}`, { token: activeToken });

    if (!res.ok || !res.data?.customer) {
      return { success: false, error: res.error || 'Failed to delete address' };
    }

    storageService.setCustomerUser(res.data.customer);
    return { success: true, customer: res.data.customer };
  }

  /**
   * Set default address
   */
  async setDefaultAddress(
    id: string,
    token?: string | null
  ): Promise<{ success: boolean; customer?: Customer; error?: string }> {
    const activeToken = token || storageService.getAuthToken();
    const res = await apiClient.patch(`/api/customer/addresses/${id}/default`, {}, { token: activeToken });

    if (!res.ok || !res.data?.customer) {
      return { success: false, error: res.error || 'Failed to set default address' };
    }

    storageService.setCustomerUser(res.data.customer);
    return { success: true, customer: res.data.customer };
  }

  /**
   * Forgot password request
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await apiClient.post('/api/auth/forgot-password', { email });
    if (!res.ok) {
      return { success: false, error: res.error || 'Failed to request password reset' };
    }
    return { success: true, message: res.data?.message };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const res = await apiClient.post('/api/auth/reset-password', { token, newPassword });
    if (!res.ok) {
      return { success: false, error: res.error || 'Failed to reset password' };
    }
    return { success: true };
  }

  /**
   * Log out customer session
   */
  logout(): void {
    storageService.removeAuthToken();
    storageService.removeCustomerUser();
  }

  /**
   * Admin Login
   */
  async adminLogin(username: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const res = await apiClient.post('/api/admin/login', { username, password });
    if (!res.ok || !res.data?.token) {
      return { success: false, error: res.error || 'Admin login failed' };
    }
    storageService.setAdminToken(res.data.token);
    return { success: true, token: res.data.token };
  }

  /**
   * Admin Logout
   */
  adminLogout(): void {
    storageService.removeAdminToken();
  }
}

export const authService = new AuthService();
