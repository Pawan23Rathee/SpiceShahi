import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CartItem, Product, PackSize } from '../types';
import { useAuth } from './AuthContext';
import { cartService, platformService } from '../services';

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product,
    packSize: PackSize,
    quantity?: number,
    options?: { openDrawer?: boolean; customToast?: string }
  ) => void;
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
  variantModalProduct: Product | null;
  initialPackIndex: number;
  openVariantModal: (product: Product, initialPackIndex?: number) => void;
  closeVariantModal: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { customer, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);
  const [initialPackIndex, setInitialPackIndex] = useState<number>(0);
  const [deliverySettings, setDeliverySettings] = useState({
    haryana: 50,
    outsideHaryana: 100,
    freeThreshold: 0,
  });

  // Track current loaded customer ID to prevent cross-contamination
  const currentCustomerIdRef = useRef<string | null>(null);

  // Fetch store delivery settings from server via cartService
  useEffect(() => {
    cartService
      .fetchDeliverySettings()
      .then((settings) => {
        setDeliverySettings(settings);
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

    // Read local customer-scoped cache for instant responsive UI
    const initialUserCart = cartService.getLocalCart(customerId);
    setItems(initialUserCart);

    // Also fetch server-side persistent cart for this user across devices
    if (token) {
      cartService
        .fetchServerCart(token)
        .then((serverCart) => {
          if (serverCart && currentCustomerIdRef.current === customerId) {
            // If server has saved items from other devices or session
            if (serverCart.length > 0 || initialUserCart.length === 0) {
              setItems(serverCart);
              cartService.saveLocalCart(customerId, serverCart);
            }
          }
        })
        .catch(() => {
          // offline or server unreachable, user local cart is preserved
        });
    }
  }, [customer?.id, isAuthenticated, authLoading, token]);

  // Save changes to user-specific storage and server whenever items change
  const saveUserCart = (newItems: CartItem[]) => {
    if (!customer?.id || !isAuthenticated) {
      return;
    }
    const customerId = customer.id;
    cartService.saveLocalCart(customerId, newItems);

    // Sync to backend customer profile / cart database
    if (token) {
      cartService.syncCartToServer(token, newItems).catch((e) => {
        console.warn('Could not sync cart to backend:', e);
      });
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const openVariantModal = (product: Product, packIdx = 0) => {
    setVariantModalProduct(product);
    setInitialPackIndex(packIdx);
  };

  const closeVariantModal = () => {
    setVariantModalProduct(null);
  };

  const addToCart = (
    product: Product,
    packSize: PackSize,
    quantity = 1,
    options?: { openDrawer?: boolean; customToast?: string }
  ) => {
    // If user is not authenticated, prompt login immediately
    if (!isAuthenticated || !customer) {
      showToast('Please sign in or register to add spices to your cart.');
      platformService.navigateToHash('/login');
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

    const msg = options?.customToast || `Added ${quantity} × ${product.name} (${packSize.size}) to cart`;
    showToast(msg);

    if (options?.openDrawer) {
      setIsCartOpen(true);
    }
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
      cartService.clearLocalCart(customer.id);
      if (token) {
        cartService.syncCartToServer(token, []);
      }
    }
  };

  // If signed out, force items to be strictly 0
  const activeItems = isAuthenticated && customer ? items : [];
  const totalItems = activeItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const calculateDelivery = (state: string): number => {
    return cartService.calculateDelivery(state, subtotal, deliverySettings);
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
        variantModalProduct,
        initialPackIndex,
        openVariantModal,
        closeVariantModal,
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
