import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import {
  CartItem,
  Product,
  PackSize,
} from '../types';

import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];

  addToCart: (
    product: Product,
    packSize: PackSize,
    quantity?: number
  ) => void;

  updateQuantity: (
    itemId: string,
    quantity: number
  ) => void;

  removeFromCart: (itemId: string) => void;

  clearCart: () => void;

  totalItems: number;
  subtotal: number;

  calculateDelivery: (
    state: string
  ) => number;

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

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

const getCartKey = (userId: string) =>
  `spiceshahi_cart_${userId}`;

export const CartProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const {
    customer,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [items, setItems] =
    useState<CartItem[]>([]);

  const [
    loadedUserId,
    setLoadedUserId,
  ] = useState<string | null>(null);

  const [isCartOpen, setIsCartOpen] =
    useState(false);

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  const [
    deliverySettings,
    setDeliverySettings,
  ] = useState({
    haryana: 50,
    outsideHaryana: 100,
    freeThreshold: 0,
  });

  /*
   * Load cart ONLY after authentication
   * state has been resolved.
   */
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !customer) {
      setItems([]);
      setLoadedUserId(null);
      setIsCartOpen(false);
      return;
    }

    const userId = customer.id;
    const key = getCartKey(userId);

    try {
      const saved =
        localStorage.getItem(key);

      const parsed = saved
        ? JSON.parse(saved)
        : [];

      setItems(
        Array.isArray(parsed)
          ? parsed
          : []
      );

      setLoadedUserId(userId);
    } catch {
      setItems([]);
      setLoadedUserId(userId);
    }
  }, [
    authLoading,
    isAuthenticated,
    customer?.id,
  ]);

  /*
   * Save cart ONLY for authenticated
   * users.
   */
  useEffect(() => {
    if (
      authLoading ||
      !isAuthenticated ||
      !customer ||
      loadedUserId !== customer.id
    ) {
      return;
    }

    try {
      localStorage.setItem(
        getCartKey(customer.id),
        JSON.stringify(items)
      );
    } catch (error) {
      console.error(
        'Could not save cart:',
        error
      );
    }
  }, [
    items,
    customer?.id,
    isAuthenticated,
    authLoading,
    loadedUserId,
  ]);

  /*
   * Extra protection when AuthContext
   * changes because of logout/login.
   */
  useEffect(() => {
    const handleAuthChange = () => {
      if (!isAuthenticated) {
        setItems([]);
        setLoadedUserId(null);
        setIsCartOpen(false);
      }
    };

    window.addEventListener(
      'spiceshahi-auth-changed',
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        'spiceshahi-auth-changed',
        handleAuthChange
      );
    };
  }, [isAuthenticated]);

  /*
   * Delivery settings
   */
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setDeliverySettings({
            haryana:
              data.haryanaDeliveryCharge ??
              50,

            outsideHaryana:
              data.outsideHaryanaDeliveryCharge ??
              100,

            freeThreshold:
              data.freeDeliveryThreshold ??
              0,
          });
        }
      })
      .catch((err) => {
        console.warn(
          'Could not fetch delivery settings:',
          err
        );
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage((prev) =>
        prev === msg ? null : prev
      );
    }, 2800);
  };

  const addToCart = (
    product: Product,
    packSize: PackSize,
    quantity = 1
  ) => {
    /*
     * Do not create a persistent cart
     * for signed-out users.
     */
    if (!isAuthenticated || !customer) {
      showToast(
        'Please sign in before adding products to your cart.'
      );

      setIsCartOpen(false);

      return;
    }

    const itemId =
      `${product.id}-${packSize.size}`;

    setItems((prev) => {
      const existing =
        prev.find(
          (item) => item.id === itemId
        );

      if (existing) {
        return prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity:
                  item.quantity + quantity,
              }
            : item
        );
      }

      const newItem: CartItem = {
        id: itemId,
        productId: product.id,
        productSlug: product.slug,
        name: product.name,
        hindiName: product.hindiName,
        imageUrl:
          packSize.imageUrl ||
          product.imageUrl,
        packSize: packSize.size,
        weightInGrams:
          packSize.weightInGrams,
        price: packSize.price,
        originalPrice:
          packSize.originalPrice,
        quantity,
      };

      return [...prev, newItem];
    });

    showToast(
      `Added ${quantity} × ${product.name} (${packSize.size}) to cart`
    );

    setIsCartOpen(true);
  };

  const updateQuantity = (
    itemId: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };

  const removeFromCart = (
    itemId: string
  ) => {
    setItems((prev) =>
      prev.filter(
        (item) => item.id !== itemId
      )
    );

    showToast('Item removed from cart');
  };

  const clearCart = () => {
    setItems([]);

    if (customer) {
      localStorage.removeItem(
        getCartKey(customer.id)
      );
    }
  };

  const totalItems =
    items.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );

  const subtotal =
    items.reduce(
      (sum, item) =>
        sum +
        item.price *
          item.quantity,
      0
    );

  const calculateDelivery = (
    state: string
  ) => {
    if (items.length === 0) {
      return 0;
    }

    if (
      deliverySettings.freeThreshold >
        0 &&
      subtotal >=
        deliverySettings.freeThreshold
    ) {
      return 0;
    }

    const cleanState =
      (state || '')
        .trim()
        .toLowerCase();

    return cleanState === 'haryana'
      ? deliverySettings.haryana
      : deliverySettings.outsideHaryana;
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
        openCart: () =>
          setIsCartOpen(true),
        closeCart: () =>
          setIsCartOpen(false),
        toastMessage,
        deliverySettings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used within CartProvider'
    );
  }

  return context;
}