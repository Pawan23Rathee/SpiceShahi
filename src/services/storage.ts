/**
 * Storage Service - Isomorphic & Capacitor-Ready
 * 
 * Isolates direct browser window/localStorage/sessionStorage access.
 * Provides safe in-memory fallbacks when browser storage is restricted,
 * and allows seamless drop-in integration with @capacitor/preferences for native iOS/Android apps.
 */

import { Customer, CartItem } from '../types';

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

// In-memory fallback if storage is disabled, blocked, or in private browsing
class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Safe browser localStorage adapter with try/catch protection
class SafeLocalStorageAdapter implements StorageAdapter {
  private isAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = '__spiceshahi_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private fallback = new MemoryStorageAdapter();
  private available = this.isAvailable();

  getItem(key: string): string | null {
    if (!this.available) return this.fallback.getItem(key);
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn(`[Storage] Failed to getItem '${key}':`, e);
      return this.fallback.getItem(key);
    }
  }

  setItem(key: string, value: string): void {
    if (!this.available) {
      this.fallback.setItem(key, value);
      return;
    }
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[Storage] Failed to setItem '${key}':`, e);
      this.fallback.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    if (!this.available) {
      this.fallback.removeItem(key);
      return;
    }
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[Storage] Failed to removeItem '${key}':`, e);
      this.fallback.removeItem(key);
    }
  }

  clear(): void {
    if (!this.available) {
      this.fallback.clear();
      return;
    }
    try {
      window.localStorage.clear();
    } catch (e) {
      console.warn('[Storage] Failed to clear:', e);
      this.fallback.clear();
    }
  }
}

// Storage keys
export const STORAGE_KEYS = {
  CUSTOMER_TOKEN: 'spiceshahi_customer_token',
  CUSTOMER_USER: 'spiceshahi_customer_user',
  ADMIN_TOKEN: 'spiceshahi_admin_token',
  USER_CART_PREFIX: 'spiceshahi_cart_',
} as const;

export class StorageService {
  private adapter: StorageAdapter;

  constructor(adapter?: StorageAdapter) {
    this.adapter = adapter || new SafeLocalStorageAdapter();
  }

  /**
   * Set custom adapter (e.g. for Capacitor Preferences in mobile)
   */
  setAdapter(adapter: StorageAdapter) {
    this.adapter = adapter;
  }

  getItem<T = string>(key: string, defaultValue: T | null = null): T | null {
    const raw = this.adapter.getItem(key);
    if (raw === null) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return (raw as unknown) as T;
    }
  }

  setItem<T = any>(key: string, value: T): void {
    if (value === null || value === undefined) {
      this.adapter.removeItem(key);
      return;
    }
    const valStr = typeof value === 'string' ? value : JSON.stringify(value);
    this.adapter.setItem(key, valStr);
  }

  removeItem(key: string): void {
    this.adapter.removeItem(key);
  }

  clear(): void {
    this.adapter.clear();
  }

  // --- Customer Auth Methods ---
  getAuthToken(): string | null {
    return this.adapter.getItem(STORAGE_KEYS.CUSTOMER_TOKEN);
  }

  setAuthToken(token: string): void {
    this.adapter.setItem(STORAGE_KEYS.CUSTOMER_TOKEN, token);
  }

  removeAuthToken(): void {
    this.adapter.removeItem(STORAGE_KEYS.CUSTOMER_TOKEN);
  }

  getCustomerUser(): Customer | null {
    return this.getItem<Customer>(STORAGE_KEYS.CUSTOMER_USER);
  }

  setCustomerUser(customer: Customer): void {
    this.setItem(STORAGE_KEYS.CUSTOMER_USER, customer);
  }

  removeCustomerUser(): void {
    this.removeItem(STORAGE_KEYS.CUSTOMER_USER);
  }

  // --- Customer Cart Methods ---
  getUserCart(customerId: string): CartItem[] {
    if (!customerId) return [];
    const key = `${STORAGE_KEYS.USER_CART_PREFIX}${customerId}`;
    return this.getItem<CartItem[]>(key) || [];
  }

  setUserCart(customerId: string, cart: CartItem[]): void {
    if (!customerId) return;
    const key = `${STORAGE_KEYS.USER_CART_PREFIX}${customerId}`;
    this.setItem(key, cart);
  }

  removeUserCart(customerId: string): void {
    if (!customerId) return;
    const key = `${STORAGE_KEYS.USER_CART_PREFIX}${customerId}`;
    this.removeItem(key);
  }

  // --- Admin Auth Methods ---
  getAdminToken(): string | null {
    return this.adapter.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  }

  setAdminToken(token: string): void {
    this.adapter.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
  }

  removeAdminToken(): void {
    this.adapter.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
  }
}

export const storageService = new StorageService();
