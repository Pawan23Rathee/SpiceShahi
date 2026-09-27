import React, { useState } from 'react';
import { ChefHat, Sparkles, X, Mic } from 'lucide-react';

interface FloatingAiChatButtonProps {
  onOpen: () => void;
}

export const FloatingAiChatButton: React.FC<FloatingAiChatButtonProps> = ({ onOpen }) => {
  const [showBubble, setShowBubble] = useState(true);

  return (
    <div className="fixed bottom-8 left-8 z-40 flex flex-col items-start group">
      {/* Mini Tooltip / Prompt Bubble */}
      {showBubble && (
        <div className="mb-3 ml-1 max-w-[240px] bg-white border border-[#E8E4D5] shadow-2xl rounded-2xl p-3 text-xs text-[#2C3E50] animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowBubble(false);
            }}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#E8E4D5] hover:bg-stone-300 rounded-full flex items-center justify-center text-[#2C3E50]"
            title="Dismiss"
          >
            <X className="w-2.5 h-2.5" />
          </button>
          <div className="flex items-center gap-1.5 font-serif italic font-bold text-[#96281B] text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F1C40F]" />
            <span>Ask Shahi Sommelier AI</span>
          </div>
          <p className="text-[11px] text-[#5D6D7E] mt-1 leading-snug">
            Need cooking tips, tadka timing, or spice pairings? Speak or type to our AI Chef!
          </p>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        id="floating-ai-sommelier-btn"
        onClick={onOpen}
        aria-label="Open AI Spice Sommelier Assistant"
        className="px-4 py-3.5 bg-linear-to-r from-[#96281B] to-[#D35400] text-white rounded-full flex items-center gap-2.5 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 relative focus:outline-hidden cursor-pointer border border-[#F1C40F]/40 hover:shadow-[#96281B]/40"
      >
        <div className="relative">
          <ChefHat className="w-5 h-5 text-white" />
          <Sparkles className="w-2.5 h-2.5 text-[#F1C40F] absolute -top-1 -right-1 animate-pulse" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
          Ask Spice AI
        </span>
        <span className="p-1 rounded-full bg-white/20 text-[#F1C40F]">
          <Mic className="w-3 h-3" />
        </span>
        {/* Subtle pulsing background glow */}
        <span className="absolute -inset-1 rounded-full bg-[#96281B] opacity-25 animate-ping -z-10"></span>
      </button>
    </div>
  );
};
