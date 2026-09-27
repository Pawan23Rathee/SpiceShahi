import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, PackSize } from '../types';

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

const CART_STORAGE_KEY = 'spiceshahi_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deliverySettings, setDeliverySettings] = useState({
    haryana: 50,
    outsideHaryana: 100,
    freeThreshold: 0,
  });

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Could not save cart to localStorage', e);
    }
  }, [items]);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const addToCart = (product: Product, packSize: PackSize, quantity = 1) => {
    const itemId = `${product.id}-${packSize.size}`;
    setItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
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
        return [...prev, newItem];
      }
    });

    showToast(`Added ${quantity} × ${product.name} (${packSize.size}) to cart`);
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    showToast('Item removed from cart');
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const calculateDelivery = (state: string): number => {
    if (items.length === 0) return 0;
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
        items,
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
