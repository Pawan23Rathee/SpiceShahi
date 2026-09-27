/**
 * Cart Service - Server-Synchronized & Multi-Device
 * 
 * Implements customer-associated cart architecture:
 * Customer -> Customer ID -> Server-side Cart -> Cart Items
 * 
 * Works identically across:
 * - Desktop Browser
 * - Mobile Browser
 * - Android Ionic Capacitor App
 * - iOS Ionic Capacitor App
 */

import { CartItem } from '../types';
import { apiClient } from './api';
import { storageService } from './storage';

export interface DeliverySettings {
  haryana: number;
  outsideHaryana: number;
  freeThreshold: number;
}

export class CartService {
  /**
   * Fetch persistent server-side cart for the authenticated customer
   */
  async fetchServerCart(token: string): Promise<CartItem[] | null> {
    if (!token) return null;
    const res = await apiClient.get<{ cart: CartItem[] }>('/api/customer/cart', { token });
    if (res.ok && res.data && Array.isArray(res.data.cart)) {
      return res.data.cart;
    }
    return null;
  }

  /**
   * Sync cart items to server for the authenticated customer
   */
  async syncCartToServer(token: string, items: CartItem[]): Promise<boolean> {
    if (!token) return false;
    const res = await apiClient.put('/api/customer/cart', { cart: items }, { token });
    return res.ok;
  }

  /**
   * Get user-scoped locally cached cart (for fast offline startup or optimistic UI)
   */
  getLocalCart(customerId: string): CartItem[] {
    return storageService.getUserCart(customerId);
  }

  /**
   * Save user-scoped local cart
   */
  saveLocalCart(customerId: string, items: CartItem[]): void {
    storageService.setUserCart(customerId, items);
  }

  /**
   * Clear user-scoped local cart
   */
  clearLocalCart(customerId: string): void {
    storageService.removeUserCart(customerId);
  }

  /**
   * Fetch current delivery settings from server
   */
  async fetchDeliverySettings(): Promise<DeliverySettings> {
    const res = await apiClient.get<any>('/api/settings');
    if (res.ok && res.data) {
      return {
        haryana: res.data.haryanaDeliveryCharge ?? 50,
        outsideHaryana: res.data.outsideHaryanaDeliveryCharge ?? 100,
        freeThreshold: res.data.freeDeliveryThreshold ?? 0,
      };
    }
    // Safe standard defaults
    return {
      haryana: 50,
      outsideHaryana: 100,
      freeThreshold: 0,
    };
  }

  /**
   * Calculate delivery fee based on delivery address state
   * Rule:
   * Haryana: ₹50
   * Outside Haryana: ₹100
   * (Free if freeThreshold is set > 0 and subtotal >= freeThreshold)
   */
  calculateDelivery(state: string, subtotal: number, settings: DeliverySettings): number {
    if (subtotal === 0) return 0;
    if (settings.freeThreshold > 0 && subtotal >= settings.freeThreshold) {
      return 0;
    }
    const cleanState = (state || '').trim().toLowerCase();
    return cleanState === 'haryana' ? settings.haryana : settings.outsideHaryana;
  }

  /**
   * Verify delivery charge and totals with backend
   */
  async verifyServerDelivery(
    state: string,
    items: { productId: string; packSize: string; quantity: number }[]
  ): Promise<{ deliveryCharge: number; subtotal: number; grandTotal: number; isHaryana: boolean } | null> {
    const res = await apiClient.post('/api/cart/calculate-delivery', { state, items });
    if (res.ok && res.data) {
      return res.data;
    }
    return null;
  }
}

export const cartService = new CartService();
