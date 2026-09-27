import React, { useState } from 'react';
import { Page } from '../types';
import { useCart } from '../context/CartContext';
import { INDIAN_STATES } from '../data/indianStates';
import { ENABLE_WHATSAPP } from '../config/features';
import { WhatsAppCartHelp } from '../components/WhatsAppComponents';
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface CartPageProps {
  onNavigate: (page: Page, slug?: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    items,
    totalItems,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    deliverySettings,
  } = useCart();

  const [selectedState, setSelectedState] = useState<string>('Haryana');

  const isHaryana = selectedState.toLowerCase() === 'haryana';
  const deliveryCharge = items.length === 0
    ? 0
    : isHaryana
    ? deliverySettings.haryana
    : deliverySettings.outsideHaryana;
  const grandTotal = subtotal + deliveryCharge;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E4D5]">
        <div>
          <button
            onClick={() => onNavigate('products')}
            className="inline-flex items-center gap-1.5 text-xs text-[#5D6D7E] hover:text-[#96281B] font-semibold mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="font-serif italic font-bold text-3xl sm:text-4xl text-[#2C3E50]">
            Shopping Cart
          </h1>
          <p className="text-xs text-[#5D6D7E] mt-1">
            Review your pure, traditionally crafted spice selections before checkout
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-[#96281B] hover:underline self-start sm:self-auto cursor-pointer"
          >
            Clear Entire Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#E8E4D5] shadow-xs space-y-5">
          <div className="w-20 h-20 rounded-full bg-[#F39C12]/15 mx-auto flex items-center justify-center text-[#D35400]">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h2 className="font-serif italic font-bold text-2xl text-[#2C3E50]">
              Your Cart is Currently Empty
            </h2>
            <p className="text-xs text-[#5D6D7E]">
              Explore our authentic single-origin turmeric, coriander, and red chili powders.
            </p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="px-8 py-3.5 rounded-full bg-[#96281B] hover:bg-[#7D2116] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            Explore Pure Spices
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E8E4D5] shadow-xs divide-y divide-[#E8E4D5] overflow-hidden">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-contain rounded-xl bg-[#FCFAF2] border border-[#E8E4D5] p-2 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3
                        onClick={() => onNavigate('product-detail', item.productSlug)}
                        className="font-serif font-bold text-base text-[#2C3E50] hover:text-[#96281B] transition-colors cursor-pointer truncate"
                      >
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-[#F7F3E8] px-2.5 py-0.5 rounded-md font-semibold text-[#2C3E50] border border-[#E8E4D5]">
                          {item.packSize}
                        </span>
                        <span className="text-xs font-serif font-bold text-[#96281B]">
                          ₹{item.price} each
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-[#E8E4D5]">
                    {/* Stepper */}
                    <div className="flex items-center border border-[#E8E4D5] rounded-xl bg-[#FCFAF2]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-[#E8E4D5]/60 text-[#2C3E50] rounded-l-xl transition-colors"
                        title="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-[#2C3E50] min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-[#E8E4D5]/60 text-[#2C3E50] rounded-r-xl transition-colors"
                        title="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total & Remove */}
                    <div className="text-right min-w-[70px]">
                      <div className="font-serif font-bold text-base text-[#2C3E50]">
                        ₹{item.price * item.quantity}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[11px] text-stone-400 hover:text-[#96281B] transition-colors flex items-center gap-1 justify-end mt-0.5 ml-auto"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Farm direct guarantee card */}
            <div className="p-4 bg-[#F7F3E8] rounded-2xl border border-[#E8E4D5] flex items-center justify-between text-xs text-[#5D6D7E]">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                <strong className="text-[#2C3E50]">100% Purity Guarantee:</strong> Zero artificial colors, metanil yellow, or synthetic additives.
              </span>
              <span className="text-[#2D5A27] font-bold hidden sm:inline">SRS Global Enterprises</span>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E8E4D5] p-6 shadow-xs space-y-5">
              <h2 className="font-serif italic font-bold text-xl text-[#2C3E50] pb-3 border-b border-[#E8E4D5]">
                Order Summary
              </h2>

              {/* State Delivery Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider block">
                  Delivery Destination State:
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full text-xs bg-[#FCFAF2] border border-[#E8E4D5] rounded-xl px-3 py-2.5 text-[#2C3E50] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#96281B]"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} {s.isHaryana ? '(₹' + deliverySettings.haryana + ')' : '(₹' + deliverySettings.outsideHaryana + ')'}
                    </option>
                  ))}
                </select>

                <div className="p-2.5 rounded-lg bg-[#FCFAF2] border border-[#E8E4D5] text-[11px] text-[#5D6D7E]">
                  {isHaryana ? (
                    <span className="text-[#2D5A27] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      Haryana Delivery Rate: ₹{deliverySettings.haryana}
                    </span>
                  ) : (
                    <span>
                      Standard Delivery (Outside Haryana): ₹{deliverySettings.outsideHaryana}
                    </span>
                  )}
                </div>
              </div>

              {/* Price Calculations */}
              <div className="space-y-2.5 text-xs text-[#5D6D7E] pt-3 border-t border-[#E8E4D5]">
                <div className="flex justify-between">
                  <span>Items Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-[#2C3E50]">₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>
                    Delivery ({isHaryana ? 'Haryana' : 'Outside Haryana'})
                  </span>
                  <span className="font-semibold text-[#2C3E50]">₹{deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#2C3E50] pt-3 border-t border-[#E8E4D5]">
                  <span>Grand Total</span>
                  <span className="font-serif text-2xl text-[#96281B]">₹{grandTotal}</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                id="cart-proceed-checkout-btn"
                onClick={() => onNavigate('checkout')}
                className="w-full py-4 px-6 rounded-xl bg-[#96281B] hover:bg-[#7D2116] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#96281B]/20 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {ENABLE_WHATSAPP && (
                <WhatsAppCartHelp totalItems={totalItems} grandTotal={grandTotal} />
              )}

              <div className="text-center pt-2">
                <span className="text-[11px] text-[#5D6D7E] flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A27]" />
                  Secure Checkout with Razorpay UPI & Cards
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
