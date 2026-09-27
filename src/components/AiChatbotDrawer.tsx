import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import { Page, Product } from '../types';
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RefreshCw,
  ExternalLink,
  ShoppingBag,
  ChefHat,
  Compass,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Array<{ title: string; uri: string }>;
  suggestedProduct?: Product;
}

interface AiChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page, slug?: string) => void;
}

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-0',
  role: 'assistant',
  content: `Namaste & Swagatam! 🙏 I am your **Shahi Sommelier**, master spice blender at SpiceShahi.

Ask me about:
- ✨ **Authentic Tadka Techniques:** When to add Dhaniya & Haldi without scorching volatile oils.
- 🥛 **Ayurvedic Golden Milk (Haldi Doodh):** Exact dosage, black pepper activation, and healing benefits.
- 🥘 **Royal Curry Recipes:** Handcrafted pairings with our 100% pure, cold-ground spices.
- 🌾 **The Cold-Ground Advantage:** Why slow cold-ground spices retain sacred color and therapeutic aromas.

How can I elevate your culinary creation today?`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  sources: [
    { title: 'SpiceShahi Purity Heritage', uri: 'https://spiceshahi.in/#/about' }
  ]
};

const SUGGESTED_PROMPTS = [
  'How to make perfect Dal Tadka with SpiceShahi Haldi & Dhaniya?',
  'Why does slow cold-ground Coriander taste so much fresher?',
  'Ayurvedic Golden Milk recipe with pure Turmeric & pepper',
  'How to get restaurant-style natural Rogan with Kashmiri Lal Mirch?',
];

export const AiChatbotDrawer: React.FC<AiChatbotDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { addToCart } = useCart();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Build history payload
      const historyPayload = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, history: historyPayload }),
      });

      if (!res.ok) {
        throw new Error('Could not get response from Sommelier');
      }

      const data = await res.json();

      // Detect relevant product to suggest
      let detectedProduct: Product | undefined;
      const lowerResp = (data.text || '').toLowerCase();
      if (lowerResp.includes('coriander') || lowerResp.includes('dhaniya')) {
        detectedProduct = PRODUCTS.find((p) => p.id === 'coriander-powder');
      } else if (lowerResp.includes('turmeric') || lowerResp.includes('haldi')) {
        detectedProduct = PRODUCTS.find((p) => p.id === 'turmeric-powder');
      } else if (lowerResp.includes('chili') || lowerResp.includes('mirch')) {
        detectedProduct = PRODUCTS.find((p) => p.id === 'kashmiri-red-chili');
      }

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources && data.sources.length > 0 ? data.sources : undefined,
        suggestedProduct: detectedProduct,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `asst-err-${Date.now()}`,
        role: 'assistant',
        content: `I apologize, I am temporarily having trouble reaching the recipe archive. Please try asking again or feel free to call our customer care team for personalized spice advice!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice recording for audio input
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          try {
            setIsLoading(true);
            const res = await fetch('/api/ai/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64Data, mimeType: 'audio/webm' }),
            });
            const data = await res.json();
            if (data.text) {
              setInputPrompt(data.text);
              handleSend(data.text);
            }
          } catch (e) {
            console.error('Voice transcription error:', e);
          } finally {
            setIsLoading(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone permission denied or not supported:', err);
      // Friendly speech recognition simulation if hardware blocked
      setInputPrompt('What are the health benefits of SpiceShahi Turmeric and Coriander powder?');
    }
  };

  // Text-To-Speech for Chef voice
  const handlePlayTts = async (msgId: string, text: string) => {
    if (playingAudioId === msgId) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      setPlayingAudioId(null);
      return;
    }

    try {
      setPlayingAudioId(msgId);
      // Clean markdown tags for spoken audio
      const cleanText = text.replace(/[*#_`]/g, '').slice(0, 300);

      // Web Speech Synthesis API fallback if server key is not live
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        utterance.onend = () => setPlayingAudioId(null);
        utterance.onerror = () => setPlayingAudioId(null);
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
      setPlayingAudioId(null);
    }
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_GREETING]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-[#FCFAF2] border-l border-[#E8E4D5] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E8E4D5] flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-[#96281B] to-[#D35400] flex items-center justify-center text-white shadow-md">
                <ChefHat className="w-5 h-5 text-[#F1C40F]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif italic font-bold text-lg text-[#2C3E50]">
                    Shahi Sommelier AI
                  </h2>
                  <span className="text-[10px] font-bold bg-[#2D5A27]/10 text-[#2D5A27] px-2 py-0.5 rounded-full border border-[#2D5A27]/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] animate-pulse"></span>
                    Gemini 3.5
                  </span>
                </div>
                <p className="text-[11px] text-[#5D6D7E]">
                  Royal Spice Pairings, Recipes & Ayurvedic Wisdom
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="p-2 text-stone-400 hover:text-[#96281B] rounded-lg transition-colors"
                title="Clear Conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-[#5D6D7E] hover:text-[#2C3E50] rounded-lg transition-colors"
                title="Close AI Sommelier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Conversation Thread */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[#96281B] flex items-center justify-center text-[#F1C40F] shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 space-y-2 shadow-xs ${
                    m.role === 'user'
                      ? 'bg-[#96281B] text-white rounded-br-xs'
                      : 'bg-white border border-[#E8E4D5] text-[#2C3E50] rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed">
                    {m.content}
                  </div>

                  {/* Sources Grounding Display */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="pt-2 border-t border-[#E8E4D5]/80 mt-2 space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#5D6D7E] flex items-center gap-1">
                        <Compass className="w-3 h-3 text-[#D35400]" />
                        Search Grounded References:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-[#96281B] bg-[#FCFAF2] px-2 py-0.5 rounded border border-[#E8E4D5] hover:bg-[#E8E4D5] transition-colors"
                          >
                            <span>{src.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Recommendation Card */}
                  {m.suggestedProduct && (
                    <div className="mt-3 p-3 bg-[#FCFAF2] rounded-xl border border-[#E8E4D5] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={m.suggestedProduct.imageUrl}
                          alt={m.suggestedProduct.name}
                          className="w-10 h-10 object-contain rounded-lg bg-white border border-[#E8E4D5] p-1 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#2C3E50] truncate text-[11px]">
                            {m.suggestedProduct.name}
                          </p>
                          <p className="text-[10px] text-[#96281B] font-bold">
                            ₹{m.suggestedProduct.packSizes[0].price} ({m.suggestedProduct.packSizes[0].size})
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          addToCart(m.suggestedProduct!, m.suggestedProduct!.packSizes[0], 1);
                        }}
                        className="px-2.5 py-1.5 bg-[#96281B] hover:bg-[#7D2116] text-white rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  )}

                  {/* Footer with Audio Speech Readout & Timestamp */}
                  <div className="flex items-center justify-between text-[10px] opacity-70 pt-1">
                    <span>{m.timestamp}</span>

                    {m.role === 'assistant' && (
                      <button
                        onClick={() => handlePlayTts(m.id, m.content)}
                        className="hover:text-[#96281B] transition-colors flex items-center gap-1 font-semibold"
                        title="Listen to Chef Voice"
                      >
                        {playingAudioId === m.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-[#96281B]" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#5D6D7E] p-3 bg-white rounded-2xl border border-[#E8E4D5] max-w-[70%]">
                <Sparkles className="w-4 h-4 text-[#F1C40F] animate-spin" />
                <span className="italic font-medium">Shahi Sommelier is consulting ancient spice grimoires & live search...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Pills */}
          <div className="px-6 py-2 border-t border-[#E8E4D5] bg-[#F7F3E8] overflow-x-auto scrollbar-none flex gap-2">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-3 py-1 bg-white hover:bg-[#FCFAF2] text-[#2C3E50] border border-[#E8E4D5] rounded-full text-[11px] font-medium transition-colors shadow-2xs cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box with Voice Mic & Send */}
          <div className="p-4 border-t border-[#E8E4D5] bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-red-500 text-white border-red-600 animate-pulse'
                    : 'bg-[#FCFAF2] border-[#E8E4D5] text-[#5D6D7E] hover:text-[#96281B]'
                }`}
                title={isRecording ? 'Stop Recording' : 'Voice Input (Hindi/English)'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                placeholder={isRecording ? 'Listening to your voice...' : 'Ask about recipes, dosages, tadka, haldi benefits...'}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs text-[#2C3E50] focus:outline-hidden focus:ring-2 focus:ring-[#96281B]"
              />

              <button
                type="submit"
                disabled={!inputPrompt.trim() || isLoading}
                className="p-2.5 bg-[#96281B] hover:bg-[#7D2116] disabled:bg-stone-300 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
