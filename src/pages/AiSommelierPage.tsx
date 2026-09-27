import React, { useState, useRef } from 'react';
import { Page, Product } from '../types';
import { PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import {
  ChefHat,
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Compass,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  BookOpen,
  Award,
  Flame,
  ShieldCheck,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Array<{ title: string; uri: string }>;
  suggestedProduct?: Product;
}

interface AiSommelierPageProps {
  onNavigate: (page: Page, slug?: string) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'asst-1',
    role: 'assistant',
    content: `Namaste! Swagatam to the **SpiceShahi AI Kitchen & Spice Sommelier**.

I am your personal culinary consultant trained in traditional Indian cold-ground spices, Ayurvedic balance, and regional recipes.

Here is how I can assist you:
- **Tadka Chemistry:** The precise oil temperature and sequence for blooming whole spices without burning volatile oils.
- **Ayurvedic Potency:** Maximizing curcumin bioavailability in Turmeric and cooling digestive balance with Coriander.
- **Recipe Pairings:** Tailoring Dhaniya, Haldi, and Lal Mirch proportions for restaurant-quality curries, biryanis, and sabzis.

Ask me any recipe or spice query below, or speak using your microphone!`,
    timestamp: 'Just now',
    sources: [
      { title: 'SpiceShahi Purity Standards', uri: 'https://spiceshahi.in/#/about' }
    ]
  }
];

export const AiSommelierPage: React.FC<AiSommelierPageProps> = ({ onNavigate }) => {
  const { addToCart } = useCart();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSend = async (queryText?: string) => {
    const query = (queryText || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, history: historyPayload }),
      });

      const data = await res.json();

      let detectedProduct: Product | undefined;
      const lower = (data.text || '').toLowerCase();
      if (lower.includes('coriander') || lower.includes('dhaniya')) {
        detectedProduct = PRODUCTS.find((p) => p.id === 'coriander-powder');
      } else if (lower.includes('turmeric') || lower.includes('haldi')) {
        detectedProduct = PRODUCTS.find((p) => p.id === 'turmeric-powder');
      } else if (lower.includes('chili') || lower.includes('mirch')) {
        detectedProduct = PRODUCTS.find((p) => p.id === 'kashmiri-red-chili');
      }

      const asstMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources && data.sources.length > 0 ? data.sources : undefined,
        suggestedProduct: detectedProduct,
      };

      setMessages((prev) => [...prev, asstMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
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
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
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
            console.error('Transcription error:', e);
          } finally {
            setIsLoading(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      setInputPrompt('How to cook Shahi Paneer with authentic cold-ground spices?');
    }
  };

  const handlePlayTts = (msgId: string, text: string) => {
    if (playingAudioId === msgId) {
      window.speechSynthesis?.cancel();
      setPlayingAudioId(null);
      return;
    }
    setPlayingAudioId(msgId);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, '').slice(0, 300));
      u.rate = 0.95;
      u.onend = () => setPlayingAudioId(null);
      u.onerror = () => setPlayingAudioId(null);
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero Header */}
      <div className="bg-linear-to-r from-[#96281B] via-[#7D2116] to-[#2C3E50] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#F1C40F] bg-black/30 px-3 py-1 rounded-full border border-[#F1C40F]/30">
            <Sparkles className="w-3.5 h-3.5" />
            AI Kitchen & Spice Sommelier • Powered by Gemini 3.5
          </span>
          <h1 className="font-serif italic font-bold text-3xl sm:text-5xl tracking-tight">
            Consult the Master Spice Blender
          </h1>
          <p className="text-sm text-white/80 leading-relaxed">
            Get instant culinary guidance, exact tadka timings, Ayurvedic wellness dosages, and custom recipe formulations grounded in Google Search and SpiceShahi's centuries-old cold-ground tradition.
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Chat thread */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E8E4D5] shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Top Bar */}
          <div className="p-4 border-b border-[#E8E4D5] flex items-center justify-between bg-[#FCFAF2]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#96281B] flex items-center justify-center text-[#F1C40F]">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#2C3E50]">
                  Shahi Sommelier Conversation
                </h3>
                <p className="text-[10px] text-[#2D5A27] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27] animate-pulse"></span>
                  Grounded with Google Search Live Data
                </p>
              </div>
            </div>

            <button
              onClick={() => setMessages(INITIAL_MESSAGES)}
              className="text-xs text-[#5D6D7E] hover:text-[#96281B] font-semibold"
            >
              Reset Chat
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[#96281B] text-[#F1C40F] flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <ChefHat className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 space-y-2.5 ${
                    m.role === 'user'
                      ? 'bg-[#96281B] text-white rounded-br-xs shadow-sm'
                      : 'bg-[#FCFAF2] border border-[#E8E4D5] text-[#2C3E50] rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                    {m.content}
                  </div>

                  {/* Sources Grounding */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="pt-2 border-t border-[#E8E4D5] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#5D6D7E] flex items-center gap-1">
                        <Compass className="w-3 h-3 text-[#D35400]" />
                        Search Grounding Citations:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.sources.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#96281B] bg-white px-2.5 py-0.5 rounded-md border border-[#E8E4D5] hover:bg-[#E8E4D5] transition-colors"
                          >
                            <span>{s.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Product Box */}
                  {m.suggestedProduct && (
                    <div className="p-3 bg-white rounded-xl border border-[#E8E4D5] flex items-center justify-between gap-3 mt-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={m.suggestedProduct.imageUrl}
                          alt={m.suggestedProduct.name}
                          className="w-12 h-12 object-contain rounded-lg bg-[#FCFAF2] border border-[#E8E4D5] p-1 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-serif font-bold text-xs text-[#2C3E50] truncate">
                            {m.suggestedProduct.name}
                          </p>
                          <p className="text-xs text-[#96281B] font-bold">
                            ₹{m.suggestedProduct.packSizes[0].price} ({m.suggestedProduct.packSizes[0].size})
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => addToCart(m.suggestedProduct!, m.suggestedProduct!.packSizes[0], 1)}
                        className="px-3 py-1.5 bg-[#96281B] hover:bg-[#7D2116] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] opacity-70 pt-1">
                    <span>{m.timestamp}</span>
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => handlePlayTts(m.id, m.content)}
                        className="hover:text-[#96281B] flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        {playingAudioId === m.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-[#96281B]" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen Aloud</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-[#FCFAF2] rounded-xl border border-[#E8E4D5] text-xs text-[#5D6D7E] max-w-sm">
                <Sparkles className="w-4 h-4 text-[#F1C40F] animate-spin" />
                <span>Consulting Gemini 3.5 with live search data...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
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
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-red-500 text-white border-red-600 animate-pulse'
                    : 'bg-[#FCFAF2] border-[#E8E4D5] text-[#5D6D7E] hover:text-[#96281B]'
                }`}
                title="Microphone voice input (Hindi / English)"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                placeholder={isRecording ? 'Listening to your microphone...' : 'Ask about recipes, tadka, Ayurvedic benefits, dosage...'}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-[#E8E4D5] bg-[#FCFAF2] text-xs sm:text-sm text-[#2C3E50] focus:outline-hidden focus:ring-2 focus:ring-[#96281B]"
              />

              <button
                type="submit"
                disabled={!inputPrompt.trim() || isLoading}
                className="py-3 px-5 bg-[#96281B] hover:bg-[#7D2116] disabled:bg-stone-300 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right: Quick Topics & Spice Pairing Cards */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E8E4D5] p-6 shadow-xs space-y-4">
            <h3 className="font-serif italic font-bold text-lg text-[#2C3E50] pb-2 border-b border-[#E8E4D5]">
              Recommended Culinary Topics
            </h3>

            <div className="space-y-2">
              {[
                {
                  title: '🌟 Sacred Golden Milk Dosage',
                  query: 'What is the exact ratio of SpiceShahi Turmeric and black pepper for maximum curcumin absorption?',
                },
                {
                  title: '🌿 Foundation Tadka for Dal',
                  query: 'What is the correct temperature and sequence to add SpiceShahi Coriander Powder to hot ghee?',
                },
                {
                  title: '🌶️ Restaurant-Style Red Gravy Rogan',
                  query: 'How to use SpiceShahi Red Chili Powder to achieve a bright red natural gravy without synthetic food colors?',
                },
                {
                  title: '🌾 Traditional Milling vs Industrial Heat Grinding',
                  query: 'Why do mass-market spice brands lose volatile aromatic oils, and how does SpiceShahi traditional cold process preserve them?',
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.query)}
                  className="w-full text-left p-3 rounded-xl bg-[#FCFAF2] hover:bg-[#F7F3E8] border border-[#E8E4D5] transition-colors group cursor-pointer"
                >
                  <p className="font-bold text-xs text-[#2C3E50] group-hover:text-[#96281B]">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-[#5D6D7E] line-clamp-1 mt-0.5">
                    {item.query}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Add Flagship Spices */}
          <div className="bg-[#FCFAF2] rounded-3xl border border-[#E8E4D5] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4D5]">
              <h3 className="font-serif italic font-bold text-lg text-[#2C3E50]">
                Featured Spices
              </h3>
              <button
                onClick={() => onNavigate('products')}
                className="text-xs font-bold text-[#96281B] hover:underline"
              >
                Catalog →
              </button>
            </div>

            <div className="space-y-3">
              {PRODUCTS.map((prod) => (
                <div key={prod.id} className="p-3 bg-white rounded-2xl border border-[#E8E4D5] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-10 h-10 object-contain rounded-lg bg-[#FCFAF2] border border-[#E8E4D5] p-1 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-[#2C3E50] truncate">{prod.name}</p>
                      <p className="text-[11px] text-[#96281B] font-bold">
                        ₹{prod.packSizes[0].price} ({prod.packSizes[0].size})
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(prod, prod.packSizes[0], 1)}
                    className="p-2 bg-[#96281B] hover:bg-[#7D2116] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                    title="Add to Basket"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
