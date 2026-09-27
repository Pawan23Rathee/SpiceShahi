import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CartItem, Product, PackSize } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, packSize: PackSize, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  calculateDelivery: (state: string) => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  toastMessage: string | null;
  deliverySettings: {
    haryana: number;
    outsideHaryana: number;
    freeThreshold: number;
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Cleanup legacy shared storage key if still present in browser
try {
  localStorage.removeItem('spiceshahi_cart_v1');
  localStorage.removeItem('cart');
} catch {
  // ignore
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { customer, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deliverySettings, setDeliverySettings] = useState({
    haryana: 50,
    outsideHaryana: 100,
    freeThreshold: 0,
  });

  // Track current loaded customer ID to prevent cross-contamination
  const currentCustomerIdRef = useRef<string | null>(null);

  // Fetch store delivery settings from server
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setDeliverySettings({
            haryana: data.haryanaDeliveryCharge ?? 50,
            outsideHaryana: data.outsideHaryanaDeliveryCharge ?? 100,
            freeThreshold: data.freeDeliveryThreshold ?? 0,
          });
        }
      })
      .catch((err) => {
        console.warn('Could not fetch store delivery settings, using defaults:', err);
      });
  }, []);

  // Synchronize cart strictly based on authenticated user lifecycle
  useEffect(() => {
    // 1. While authentication is still determining session, do NOT show any cart
    if (authLoading) {
      setItems([]);
      currentCustomerIdRef.current = null;
      return;
    }

    // 2. SIGNED-OUT USER: Cart MUST be completely empty, badge 0
    if (!isAuthenticated || !customer || !customer.id) {
      setItems([]);
      currentCustomerIdRef.current = null;
      return;
    }

    // 3. SIGNED-IN USER: Load user-specific cart for this exact customer ID
    const customerId = customer.id;
    currentCustomerIdRef.current = customerId;
    const userCartKey = `spiceshahi_cart_${customerId}`;

    // Read local user-scoped storage
    let initialUserCart: CartItem[] = [];
    try {
      const saved = localStorage.getItem(userCartKey);
      if (saved) {
        initialUserCart = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading user cart from localStorage:', e);
    }
    setItems(initialUserCart);

    // Also fetch server-side persistent cart for this user
    if (token) {
      fetch('/api/customer/cart', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.cart) && currentCustomerIdRef.current === customerId) {
            // If server has cart and local was empty, or server has newer items
            if (data.cart.length > 0 && initialUserCart.length === 0) {
              setItems(data.cart);
              try {
                localStorage.setItem(userCartKey, JSON.stringify(data.cart));
              } catch {
                // ignore
              }
            }
          }
        })
        .catch(() => {
          // offline or server unreachable, user local cart is preserved
        });
    }
  }, [customer?.id, isAuthenticated, authLoading, token]);

  // Save changes to user-specific storage whenever items change
  const saveUserCart = (newItems: CartItem[]) => {
    if (!customer?.id || !isAuthenticated) {
      return;
    }
    const userCartKey = `spiceshahi_cart_${customer.id}`;
    try {
      localStorage.setItem(userCartKey, JSON.stringify(newItems));
    } catch (e) {
      console.error('Could not save user cart to localStorage', e);
    }

    // Sync to backend user profile
    if (token) {
      fetch('/api/customer/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cart: newItems }),
      }).catch((e) => console.warn('Could not sync cart to backend:', e));
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const addToCart = (product: Product, packSize: PackSize, quantity = 1) => {
    // If user is not authenticated, prompt login immediately
    if (!isAuthenticated || !customer) {
      showToast('Please sign in or register to add spices to your cart.');
      window.location.hash = '#/login';
      return;
    }

    const itemId = `${product.id}-${packSize.size}`;
    setItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: itemId,
          productId: product.id,
          productSlug: product.slug,
          name: product.name,
          hindiName: product.hindiName,
          imageUrl: packSize.imageUrl || product.imageUrl,
          packSize: packSize.size,
          weightInGrams: packSize.weightInGrams,
          price: packSize.price,
          originalPrice: packSize.originalPrice,
          quantity,
        };
        updated = [...prev, newItem];
      }
      saveUserCart(updated);
      return updated;
    });

    showToast(`Added ${quantity} × ${product.name} (${packSize.size}) to cart`);
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) => {
      const updated = prev.map((item) => (item.id === itemId ? { ...item, quantity } : item));
      saveUserCart(updated);
      return updated;
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== itemId);
      saveUserCart(updated);
      return updated;
    });
    showToast('Item removed from cart');
  };

  const clearCart = () => {
    setItems([]);
    if (customer?.id) {
      saveUserCart([]);
    }
  };

  // If signed out, force items to be strictly 0
  const activeItems = isAuthenticated && customer ? items : [];
  const totalItems = activeItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const calculateDelivery = (state: string): number => {
    if (activeItems.length === 0) return 0;
    if (deliverySettings.freeThreshold > 0 && subtotal >= deliverySettings.freeThreshold) {
      return 0;
    }
    const cleanState = (state || '').trim().toLowerCase();
    if (cleanState === 'haryana') {
      return deliverySettings.haryana;
    }
    return deliverySettings.outsideHaryana;
  };

  return (
    <CartContext.Provider
      value={{
        items: activeItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        calculateDelivery,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toastMessage,
        deliverySettings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
