import React, { useState, useEffect } from 'react';
import {
  ENABLE_WHATSAPP,
  WHATSAPP_NUMBER,
  WHATSAPP_CONFIG,
  buildWhatsAppOrderMessage,
  WhatsAppOrderItem,
} from '../config/features';
import { INDIAN_STATES } from '../data/indianStates';
import { useAuth } from '../context/AuthContext';
import {
  MessageCircle,
  X,
  Send,
  MapPin,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

/**
 * Standard crisp WhatsApp SVG icon matching brand standards
 */
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

/**
 * Top announcement bar WhatsApp quick link
 */
export const WhatsAppHeaderLink: React.FC = () => {
  if (!ENABLE_WHATSAPP) return null;

  return (
    <a
      href={WHATSAPP_CONFIG.getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-white flex items-center gap-1.5 transition-colors text-xs text-[#F1C40F]/90"
      title="WhatsApp SpiceShahi Support & Orders"
    >
      <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
      <span>WhatsApp: {WHATSAPP_CONFIG.displayPhone}</span>
    </a>
  );
};

/**
 * Mobile drawer WhatsApp link
 */
export const WhatsAppMobileMenuItem: React.FC = () => {
  if (!ENABLE_WHATSAPP) return null;

  return (
    <a
      href={WHATSAPP_CONFIG.getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full flex items-center justify-between py-2.5 px-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors"
    >
      <span className="flex items-center gap-2">
        <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
        Order / Inquire on WhatsApp
      </span>
      <span className="text-emerald-700 font-serif text-[11px]">Chat</span>
    </a>
  );
};

/**
 * Interactive WhatsApp Order Modal
 * Automatically pre-fills or prompts for customer details, calculates Haryana vs Interstate delivery,
 * and opens WhatsApp with the dynamically formatted order message.
 */
export interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WhatsAppOrderItem[];
  initialState?: string;
  sourceContext?: 'product' | 'cart' | 'checkout';
}

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({
  isOpen,
  onClose,
  items,
  initialState = 'Haryana',
  sourceContext = 'product',
}) => {
  const { customer, isAuthenticated } = useAuth();

  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState(initialState);
  const [pincode, setPincode] = useState('');
  const [paymentPreference, setPaymentPreference] = useState('Online Payment (UPI / Card)');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-populate when authenticated customer exists
  useEffect(() => {
    if (isAuthenticated && customer) {
      setCustomerName(customer.fullName || '');
      setCustomerMobile(customer.mobile || '');

      const defaultAddr =
        customer.savedAddresses?.find((a) => a.isDefault) || customer.savedAddresses?.[0];
      if (defaultAddr) {
        setAddressLine([defaultAddr.addressLine1, defaultAddr.addressLine2, defaultAddr.landmark].filter(Boolean).join(', '));
        setCity(defaultAddr.city || '');
        setState(defaultAddr.state || 'Haryana');
        setPincode(defaultAddr.pincode || '');
      }
    }
  }, [isAuthenticated, customer]);

  if (!isOpen) return null;

  // Authoritative calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isHaryana = state.trim().toLowerCase() === 'haryana';
  const deliveryCharge = isHaryana ? 50 : 100;
  const grandTotal = subtotal + deliveryCharge;

  const handleSendOrder = () => {
    if (!customerName.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (!customerMobile.trim() || customerMobile.replace(/\D/g, '').length < 10) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const message = buildWhatsAppOrderMessage({
      customerName,
      customerMobile,
      items,
      subtotal,
      deliveryState: state,
      deliveryCharge,
      grandTotal,
      addressLine: addressLine.trim() || undefined,
      city: city.trim() || undefined,
      state,
      pincode: pincode.trim() || undefined,
      paymentPreference,
    });

    const targetUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleQuickChat = () => {
    const quickMessage = buildWhatsAppOrderMessage({
      customerName: customerName.trim() || undefined,
      customerMobile: customerMobile.trim() || undefined,
      items,
      subtotal,
      deliveryState: state,
      deliveryCharge,
      grandTotal,
      paymentPreference: 'To be discussed on WhatsApp',
    });

    const targetUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(quickMessage)}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#E8E4D5] shadow-2xl space-y-5 p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E4D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <WhatsAppIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-lg text-[#2C3E50]">
                Order via WhatsApp
              </h3>
              <p className="text-[11px] text-[#5D6D7E]">
                Direct manual confirmation with SpiceShahi depot (+{WHATSAPP_NUMBER})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-[#96281B] rounded-full hover:bg-stone-100 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Products Preview */}
        <div className="bg-[#FCFAF2] p-3.5 rounded-2xl border border-[#E8E4D5] space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-[#2C3E50]">
            <span>Selected Product(s):</span>
            <span className="text-emerald-700 font-serif">₹{subtotal} Subtotal</span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1 border-b border-[#E8E4D5]/60 last:border-0"
              >
                <div>
                  <span className="font-semibold text-[#2C3E50]">{item.name}</span>
                  <span className="text-[11px] text-[#5D6D7E] ml-1.5">({item.packSize}) × {item.quantity}</span>
                </div>
                <span className="font-serif font-bold text-[#96281B]">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E8E4D5] flex items-center justify-between text-xs text-[#5D6D7E]">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-[#D35400]" />
              Delivery ({isHaryana ? 'Haryana' : 'Rest of India'}):
            </span>
            <span className="font-semibold text-[#2C3E50]">₹{deliveryCharge}</span>
          </div>

          <div className="flex items-center justify-between text-sm font-bold text-[#2C3E50] pt-1">
            <span>Estimated Total:</span>
            <span className="font-serif text-base text-[#96281B]">₹{grandTotal}</span>
          </div>
        </div>

        {validationError && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Customer Details Form */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider">
            Delivery & Contact Details:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#5D6D7E] mb-1">
                Your Full Name *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-[#2C3E50] focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5D6D7E] mb-1">
                WhatsApp / Mobile *
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  maxLength={10}
                  value={customerMobile}
                  onChange={(e) => {
                    setCustomerMobile(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="98XXXXXXXX"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-[#2C3E50] focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#5D6D7E] mb-1">
              House / Street Address
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="House No, Ward/Street, Landmark"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-[#2C3E50] focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#5D6D7E] mb-1">
                City / Town
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bahadurgarh"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-[#2C3E50] focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5D6D7E] mb-1">
                State (Delivery)
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-[#2C3E50] focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} ({s.name === 'Haryana' ? '₹50' : '₹100'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5D6D7E] mb-1">
                PIN Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="124507"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-[#2C3E50] focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#5D6D7E] mb-1">
              Payment Preference
            </label>
            <select
              value={paymentPreference}
              onChange={(e) => setPaymentPreference(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-[#2C3E50] focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
            >
              <option value="Online Payment (UPI / QR Code / Card)">Online Payment (UPI / QR Code / Card)</option>
              <option value="Cash on Delivery (if available for location)">Cash on Delivery (if available for location)</option>
              <option value="Direct Bank Transfer / NEFT">Direct Bank Transfer / NEFT</option>
            </select>
          </div>
        </div>

        {/* Note on Manual Confirmation */}
        <p className="text-[11px] text-[#5D6D7E] bg-amber-50 p-2.5 rounded-xl border border-amber-200">
          ℹ️ <strong>Manual Order Confirmation:</strong> Once you click below, WhatsApp will open with your pre-filled order. Our depot team will review, provide payment UPI details, and confirm dispatch!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleQuickChat}
            className="flex-1 py-3 px-4 rounded-xl border border-[#E8E4D5] text-xs font-semibold text-[#5D6D7E] hover:text-[#2C3E50] hover:bg-stone-50 transition-colors"
          >
            Chat Directly Without Address
          </button>

          <button
            type="button"
            onClick={handleSendOrder}
            className="flex-1 py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>Open WhatsApp with Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Product Card & Detail Page: "Order on WhatsApp" secondary button
 */
interface WhatsAppOrderButtonProps {
  productName: string;
  packSize: string;
  price: number;
  quantity?: number;
  className?: string;
  variant?: 'card' | 'detail';
}

export const WhatsAppOrderButton: React.FC<WhatsAppOrderButtonProps> = ({
  productName,
  packSize,
  price,
  quantity = 1,
  className = '',
  variant = 'card',
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  if (!ENABLE_WHATSAPP) return null;

  const item: WhatsAppOrderItem = {
    name: productName,
    packSize,
    quantity,
    price,
  };

  if (variant === 'detail') {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={`py-3 px-5 rounded-xl border border-emerald-600 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${className}`}
          title="Order this product directly via WhatsApp"
        >
          <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
          <span>Order on WhatsApp</span>
        </button>

        <WhatsAppOrderModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          items={[item]}
          sourceContext="product"
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`w-full py-2 px-3 rounded-lg border border-emerald-300 text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 font-semibold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${className}`}
        title="Order via WhatsApp"
      >
        <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
        <span>Order on WhatsApp</span>
      </button>

      <WhatsAppOrderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        items={[item]}
        sourceContext="product"
      />
    </>
  );
};

/**
 * Cart Drawer & Cart Page: "Order Cart on WhatsApp" Button
 */
interface WhatsAppCartOrderButtonProps {
  items: WhatsAppOrderItem[];
  subtotal: number;
  className?: string;
}

export const WhatsAppCartOrderButton: React.FC<WhatsAppCartOrderButtonProps> = ({
  items,
  subtotal,
  className = '',
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  if (!ENABLE_WHATSAPP || items.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`w-full py-3 px-4 rounded-xl border border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${className}`}
      >
        <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
        <span>Order Cart on WhatsApp</span>
      </button>

      <WhatsAppOrderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        items={items}
        sourceContext="cart"
      />
    </>
  );
};

/**
 * Cart Drawer / Cart Page WhatsApp Help banner
 */
interface WhatsAppCartHelpProps {
  totalItems: number;
  grandTotal: number;
  items?: WhatsAppOrderItem[];
  className?: string;
}

export const WhatsAppCartHelp: React.FC<WhatsAppCartHelpProps> = ({
  totalItems,
  grandTotal,
  items = [],
  className = '',
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  if (!ENABLE_WHATSAPP) return null;

  return (
    <>
      <div className={`p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2 ${className}`}>
        <span className="flex items-center gap-2 font-medium">
          <WhatsAppIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Prefer ordering via WhatsApp?</span>
        </span>
        <button
          type="button"
          onClick={() => {
            if (items.length > 0) {
              setModalOpen(true);
            } else {
              window.open(WHATSAPP_CONFIG.getWhatsAppUrl(WHATSAPP_CONFIG.cartMessage(totalItems, grandTotal)), '_blank');
            }
          }}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] uppercase tracking-wider rounded-lg shrink-0 transition-colors cursor-pointer"
        >
          Order on WhatsApp
        </button>
      </div>

      {items.length > 0 && (
        <WhatsAppOrderModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          items={items}
          sourceContext="cart"
        />
      )}
    </>
  );
};

/**
 * Checkout Page: Direct WhatsApp Order fallback
 * When active customer address is already known on checkout page,
 * clicking this generates the complete message and opens WhatsApp.
 */
interface WhatsAppCheckoutDirectProps {
  customerDetails: {
    fullName: string;
    mobile: string;
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: WhatsAppOrderItem[];
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  className?: string;
}

export const WhatsAppCheckoutDirectButton: React.FC<WhatsAppCheckoutDirectProps> = ({
  customerDetails,
  items,
  subtotal,
  deliveryCharge,
  grandTotal,
  className = '',
}) => {
  if (!ENABLE_WHATSAPP) return null;

  const handleOrder = () => {
    const message = buildWhatsAppOrderMessage({
      customerName: customerDetails.fullName,
      customerMobile: customerDetails.mobile,
      items,
      subtotal,
      deliveryState: customerDetails.state,
      deliveryCharge,
      grandTotal,
      addressLine: customerDetails.addressLine1,
      city: customerDetails.city,
      state: customerDetails.state,
      pincode: customerDetails.pincode,
      paymentPreference: 'Online Payment (UPI) or COD',
    });

    const targetUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-950 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="font-bold flex items-center gap-1.5 text-emerald-900">
          <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
          WhatsApp Checkout Fallback
        </span>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold uppercase">
          Manual Confirmation
        </span>
      </div>
      <p className="text-[11px] text-emerald-800 leading-relaxed">
        Prefer to place your order directly with our sales desk on WhatsApp instead of online payment?
      </p>
      <button
        type="button"
        onClick={handleOrder}
        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
      >
        <WhatsAppIcon className="w-4 h-4" />
        <span>Order on WhatsApp (₹{grandTotal})</span>
      </button>
    </div>
  );
};

/**
 * Checkout Page WhatsApp Payment/Order Assistance
 */
export const WhatsAppCheckoutHelp: React.FC<{ className?: string }> = ({ className = '' }) => {
  if (!ENABLE_WHATSAPP) return null;

  const url = WHATSAPP_CONFIG.getWhatsAppUrl(WHATSAPP_CONFIG.supportMessage);

  return (
    <div className={`p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2 ${className}`}>
      <span className="flex items-center gap-2 font-medium">
        <WhatsAppIcon className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Need help or want to order via WhatsApp?</span>
      </span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-emerald-700 hover:text-emerald-900 underline font-bold text-xs"
      >
        WhatsApp Support
      </a>
    </div>
  );
};

/**
 * Floating WhatsApp Button (touch-friendly, placed at bottom-left)
 */
export const WhatsAppFloatingButton: React.FC = () => {
  if (!ENABLE_WHATSAPP) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <a
        href={WHATSAPP_CONFIG.getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
        title="Chat on WhatsApp with SpiceShahi"
      >
        <WhatsAppIcon className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
          Order on WhatsApp
        </span>
      </a>
    </div>
  );
};

/**
 * Footer WhatsApp Icon & Contact Item
 */
export const WhatsAppFooterItem: React.FC<{ variant?: 'icon' | 'link' }> = ({ variant = 'icon' }) => {
  if (!ENABLE_WHATSAPP) return null;

  if (variant === 'link') {
    return (
      <li className="flex items-center gap-2.5">
        <WhatsAppIcon className="w-4 h-4 text-emerald-400 shrink-0" />
        <a
          href={WHATSAPP_CONFIG.getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#F1C40F] transition-colors"
        >
          WhatsApp: {WHATSAPP_CONFIG.displayPhone}
        </a>
      </li>
    );
  }

  return (
    <a
      href={WHATSAPP_CONFIG.getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"
      title="WhatsApp Us"
    >
      <WhatsAppIcon className="w-5 h-5" />
    </a>
  );
};

/**
 * Homepage WhatsApp Order CTA Strip
 */
export const WhatsAppHomeCTA: React.FC<{ className?: string }> = ({ className = '' }) => {
  if (!ENABLE_WHATSAPP) return null;

  return (
    <div className={`p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3 text-center sm:text-left">
        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <WhatsAppIcon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-emerald-950">
            Direct WhatsApp Ordering Available
          </h4>
          <p className="text-xs text-emerald-800">
            Prefer chatting with our Bahadurgarh team? Message us on WhatsApp to order pure spices directly.
          </p>
        </div>
      </div>
      <a
        href={WHATSAPP_CONFIG.getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shrink-0 transition-colors shadow-sm"
      >
        Chat on WhatsApp
      </a>
    </div>
  );
};
