import React, { useState } from 'react';
import { getWhatsAppGeneralUrl } from '../data/products';
import { MessageCircle, X } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);
  const whatsappUrl = getWhatsAppGeneralUrl('Hi I want to know more about your spices');

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end group">
      {/* Mini Tooltip / Speech Bubble */}
      {showTooltip && (
        <div className="mb-3 mr-1 max-w-[220px] bg-[#FCFAF2] border border-[#E8E4D5] shadow-xl rounded-2xl p-3 text-xs text-[#2C3E50] animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-[#E8E4D5] hover:bg-stone-300 rounded-full flex items-center justify-center text-[#2C3E50]"
            title="Dismiss"
          >
            <X className="w-2.5 h-2.5" />
          </button>
          <p className="font-serif italic font-bold text-[#96281B] flex items-center gap-1.5 text-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-[#25D366]"></span>
            SpiceShahi Direct Care
          </p>
          <p className="text-[11px] text-[#5D6D7E] mt-1 leading-relaxed">
            Chat with us on WhatsApp to order fresh hand-beaten spices or ask any query!
          </p>
        </div>
      )}

      {/* Floating Button - Artistic Flair */}
      <a
        id="floating-whatsapp-btn"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with SpiceShahi on WhatsApp"
        className="w-16 h-16 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 relative focus:outline-hidden"
      >
        <MessageCircle className="w-8 h-8 fill-current" />
        {/* Subtle pulsing halo */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping -z-10"></span>
      </a>
    </div>
  );
};
