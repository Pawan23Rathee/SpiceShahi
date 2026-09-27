import React from 'react';
import { ENABLE_WHATSAPP, WHATSAPP_CONFIG } from '../config/features';
import { MessageCircle } from 'lucide-react';

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
 * Product Card & Detail Page: "Order on WhatsApp" button
 */
interface WhatsAppOrderButtonProps {
  productName: string;
  packSize: string;
  price: number;
  className?: string;
  variant?: 'card' | 'detail';
}

export const WhatsAppOrderButton: React.FC<WhatsAppOrderButtonProps> = ({
  productName,
  packSize,
  price,
  className = '',
  variant = 'card',
}) => {
  if (!ENABLE_WHATSAPP) return null;

  const url = WHATSAPP_CONFIG.getWhatsAppUrl(
    WHATSAPP_CONFIG.orderMessage(productName, packSize, price)
  );

  if (variant === 'detail') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`py-3 px-5 rounded-xl border border-emerald-600 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${className}`}
      >
        <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
        <span>Order on WhatsApp</span>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-full py-2 px-3 rounded-lg border border-emerald-300 text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 font-semibold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${className}`}
    >
      <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
      <span>Order on WhatsApp</span>
    </a>
  );
};

/**
 * Floating WhatsApp Button (positioned bottom-left so it complements the bottom-right AI Advisor)
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
 * Cart Drawer / Cart Page WhatsApp Order Assistance Link
 */
interface WhatsAppCartHelpProps {
  totalItems: number;
  grandTotal: number;
  className?: string;
}

export const WhatsAppCartHelp: React.FC<WhatsAppCartHelpProps> = ({
  totalItems,
  grandTotal,
  className = '',
}) => {
  if (!ENABLE_WHATSAPP) return null;

  const url = WHATSAPP_CONFIG.getWhatsAppUrl(
    WHATSAPP_CONFIG.cartMessage(totalItems, grandTotal)
  );

  return (
    <div className={`p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2 ${className}`}>
      <span className="flex items-center gap-2 font-medium">
        <WhatsAppIcon className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Prefer to complete order via WhatsApp?</span>
      </span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] uppercase tracking-wider rounded-lg shrink-0 transition-colors"
      >
        Chat Now
      </a>
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
