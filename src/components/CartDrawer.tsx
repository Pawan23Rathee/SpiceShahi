import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { INDIAN_STATES } from '../data/indianStates';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Page } from '../types';

interface CartDrawerProps {
  onNavigate: (page: Page, slug?: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    items,
    totalItems,
    subtotal,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    deliverySettings,
  } = useCart();

  const [previewState, setPreviewState] = useState<string>('Haryana');

  if (!isCartOpen) return null;

  const isHaryana = previewState.toLowerCase() === 'haryana';
  const deliveryCharge = items.length === 0
    ? 0
    : isHaryana
    ? deliverySettings.haryana
    : deliverySettings.outsideHaryana;
  const grandTotal = subtotal + deliveryCharge;

  const handleCheckout = () => {
    closeCart();
    onNavigate('checkout');
  };

  const handleViewCart = () => {
    closeCart();
    onNavigate('cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
      />

      <div className="fixed inset-y-0 right-0 w-full sm:max-w-md max-w-full flex sm:pl-10 pl-0">
        <div className="w-full bg-[#FCFAF2] border-l border-[#E8E4D5] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#E8E4D5] flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#96281B]/10 flex items-center justify-center text-[#96281B] shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-serif italic font-bold text-base sm:text-lg text-[#2C3E50] truncate">
                  Your Spice Basket
                </h2>
                <p className="text-xs text-[#5D6D7E]">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 rounded-lg text-[#5D6D7E] hover:text-[#2C3E50] hover:bg-[#E8E4D5]/50 transition-colors shrink-0"
              title="Close Cart"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List or Empty State */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 min-w-0">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-2 space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F39C12]/15 flex items-center justify-center text-[#D35400]">
                  <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 opacity-60" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif italic font-bold text-lg sm:text-xl text-[#2C3E50]">
                    Your cart is empty
                  </h3>
                  <p className="text-xs text-[#5D6D7E] max-w-xs mx-auto leading-relaxed">
                    Add our 100% pure, traditionally crafted spices to experience authentic aroma and sacred golden color.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    onNavigate('products');
                  }}
                  className="px-6 py-3 rounded-full bg-[#96281B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#7D2116] transition-all shadow-md cursor-pointer"
                >
                  Explore Pure Spices
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-[#5D6D7E] pb-2 border-b border-[#E8E4D5]">
                  <span>Items</span>
                  <button
                    onClick={clearCart}
                    className="text-[#96281B] hover:underline font-semibold text-[11px] cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 sm:p-3 bg-white rounded-xl border border-[#E8E4D5] shadow-xs flex gap-2.5 sm:gap-3 items-center group min-w-0"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg bg-[#FCFAF2] border border-[#E8E4D5]/60 p-1 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-bold text-xs text-[#2C3E50] line-clamp-2 leading-tight group-hover:text-[#96281B] transition-colors break-words">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-[#F7F3E8] px-2 py-0.5 rounded text-[#2C3E50] font-semibold border border-[#E8E4D5] shrink-0">
                            {item.packSize}
                          </span>
                          <span className="text-xs font-serif font-bold text-[#96281B]">
                            ₹{item.price}
                          </span>
                        </div>

                        {/* Quantity Stepper & Price */}
                        <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                          <div className="flex items-center border border-[#E8E4D5] rounded-lg bg-[#FCFAF2] shrink-0">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-[#E8E4D5]/60 text-[#2C3E50] rounded-l-lg transition-colors cursor-pointer"
                              title="Decrease quantity"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-[#2C3E50] min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-[#E8E4D5]/60 text-[#2C3E50] rounded-r-lg transition-colors cursor-pointer"
                              title="Increase quantity"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-serif font-bold text-[#2C3E50]">
                              ₹{item.price * item.quantity}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 text-stone-400 hover:text-[#96281B] transition-colors cursor-pointer"
                              title="Remove item"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Preview Info */}
                <div className="p-3 bg-[#F7F3E8] rounded-xl border border-[#E8E4D5] space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1.5 font-bold text-[#2C3E50] shrink-0">
                      <Truck className="w-3.5 h-3.5 text-[#D35400]" />
                      Calculate Delivery:
                    </span>
                    <select
                      value={previewState}
                      onChange={(e) => setPreviewState(e.target.value)}
                      className="w-full sm:w-auto max-w-full text-xs bg-white border border-[#E8E4D5] rounded-md px-2 py-1.5 text-[#2C3E50] font-medium focus:outline-hidden focus:ring-1 focus:ring-[#96281B]"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name} {s.isHaryana ? '(₹' + deliverySettings.haryana + ')' : '(₹' + deliverySettings.outsideHaryana + ')'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-[#5D6D7E] leading-relaxed break-words">
                    {isHaryana ? (
                      <span className="text-[#2D5A27] font-semibold">
                        ✓ Local Haryana Delivery applied: ₹{deliverySettings.haryana}
                      </span>
                    ) : (
                      <span>
                        Standard Inter-State Delivery: ₹{deliverySettings.outsideHaryana}
                      </span>
                    )}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-[#E8E4D5] bg-white space-y-3 sm:space-y-4 shrink-0">
              <div className="space-y-1.5 text-xs text-[#5D6D7E]">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-[#2C3E50]">₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery ({isHaryana ? 'Haryana' : 'Rest of India'})</span>
                  <span className="font-semibold text-[#2C3E50]">₹{deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#2C3E50] pt-2 border-t border-[#E8E4D5]">
                  <span>Total Payable</span>
                  <span className="font-serif text-lg text-[#96281B]">₹{grandTotal}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  id="cart-drawer-checkout-btn"
                  onClick={handleCheckout}
                  className="w-full py-3.5 px-4 sm:px-6 rounded-xl bg-[#96281B] hover:bg-[#7D2116] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#96281B]/20 transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleViewCart}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#E8E4D5] text-[#2C3E50] hover:bg-[#FCFAF2] font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  View Full Cart Page
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] text-[#5D6D7E] pt-1 sm:pt-2 flex-wrap text-center">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
                  100% Pure & Lab Tested
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#F1C40F] shrink-0" />
                  FSSAI Certified
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
