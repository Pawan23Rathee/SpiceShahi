import React, { useState } from 'react';
import { Page } from '../types';
import {
  getWhatsAppGeneralUrl,
  DISPLAY_WHATSAPP,
  DISPLAY_EMAIL,
  DISPLAY_INSTAGRAM,
  DISPLAY_INSTAGRAM_URL,
  DISPLAY_ADDRESS,
} from '../data/products';
import {
  MessageCircle,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribedEmail.trim()) {
      setIsSubscribed(true);
      setTimeout(() => {
        setSubscribedEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="bg-[#2C3E50] text-[#FCFAF2] pt-16 pb-12 border-t-4 border-[#96281B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#243342] border border-slate-600 flex items-center justify-center text-[#F1C40F]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#FCFAF2]">100% Unadulterated</p>
              <p className="text-xs text-slate-300">Zero colors or fillers</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#243342] border border-slate-600 flex items-center justify-center text-[#D35400]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#FCFAF2]">Cold Stone Ground</p>
              <p className="text-xs text-slate-300">Preserves natural khushboo</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#243342] border border-slate-600 flex items-center justify-center text-[#2D5A27]">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#FCFAF2]">Direct Farm Fresh</p>
              <p className="text-xs text-slate-300">Sun-dried native crops</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#243342] border border-slate-600 flex items-center justify-center text-[#25D366]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#FCFAF2]">Direct WhatsApp Care</p>
              <p className="text-xs text-slate-300">Instant answers & orders</p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 py-12">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/spiceshahi-logo.jpg"
                alt="SpiceShahi Logo"
                className="w-12 h-12 rounded-full object-cover border border-[#F1C40F]/40 shadow-md"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="font-serif italic font-bold text-2xl tracking-tight text-[#FCFAF2] block">
                  SpiceShahi
                </span>
                <span className="text-[10px] tracking-wider uppercase text-[#F1C40F] font-semibold">
                  SRS Global Enterprises
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              SpiceShahi is dedicated to reviving the sacred purity and enchanting natural aroma of Indian spices. Handcrafted using time-honored traditions, each blend is hand-beaten to preserve natural taste, deep aroma, nutrition, and true essence.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={getWhatsAppGeneralUrl('Hi SpiceShahi! I would like to order pure spices.')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#2D5A27]/40 border border-[#2D5A27] text-white flex items-center justify-center hover:bg-[#2D5A27] transition-all"
                title="WhatsApp Us"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
              </a>
              <a
                href={DISPLAY_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all"
                title="Instagram Reels & Updates"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={`mailto:${DISPLAY_EMAIL}`}
                className="w-10 h-10 rounded-lg bg-[#F1C40F]/20 border border-[#F1C40F]/40 text-[#F1C40F] flex items-center justify-center hover:bg-[#96281B] hover:text-white transition-all"
                title="Email Us"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#F1C40F]">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#F1C40F] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#F1C40F] transition-colors cursor-pointer"
                >
                  About Our Brand
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('products');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#F1C40F] transition-colors cursor-pointer"
                >
                  All Spices & Masalas
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('gallery');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#F1C40F] transition-colors cursor-pointer"
                >
                  Instagram Reels & Farm
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#F1C40F] transition-colors cursor-pointer"
                >
                  Contact & Bulk Orders
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#F1C40F]">
              Connect With Us
            </h4>
            <ul className="space-y-3 text-sm text-slate-200">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D35400] shrink-0 mt-1" />
                <span className="text-slate-300 leading-snug">{DISPLAY_ADDRESS}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#25D366] shrink-0" />
                <a
                  href={`tel:+${DISPLAY_WHATSAPP.replace(/[^0-9]/g, '')}`}
                  className="hover:text-[#F1C40F] transition-colors"
                >
                  {DISPLAY_WHATSAPP}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 fill-current" />
                <a
                  href={getWhatsAppGeneralUrl('Hi SpiceShahi! I have a question about spices.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 underline underline-offset-4"
                >
                  Chat on WhatsApp Directly
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                <a
                  href={DISPLAY_INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-300 transition-colors"
                >
                  {DISPLAY_INSTAGRAM}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#F1C40F] shrink-0" />
                <a href={`mailto:${DISPLAY_EMAIL}`} className="hover:text-[#FCFAF2] transition-colors">
                  {DISPLAY_EMAIL}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter / Spice Tips */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#F1C40F]">
              Spice Tales & Batches
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Subscribe to receive traditional masala secrets, seasonal harvest alerts, and purity testing guides.
            </p>

            {isSubscribed ? (
              <div className="p-3 bg-[#2D5A27]/40 border border-[#2D5A27] rounded-xl text-green-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Thank you! You are subscribed to SpiceShahi updates.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex">
                  <input
                    type="email"
                    required
                    value={subscribedEmail}
                    onChange={(e) => setSubscribedEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full px-3 py-2 text-xs rounded-l-lg bg-[#243342] border border-slate-600 text-white placeholder-slate-400 focus:outline-hidden focus:border-[#F1C40F]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#96281B] hover:bg-[#7D2116] text-white rounded-r-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  No spam. Only fragrant culinary inspiration.
                </p>
              </form>
            )}

            <div className="pt-2">
              <span className="inline-block text-[11px] font-bold text-[#F1C40F] border border-[#F1C40F]/30 bg-[#F1C40F]/10 rounded-md px-2.5 py-1 uppercase tracking-wider">
                FSSAI Lic: 20826007001593 • 100% Food Grade
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-4 border-t border-slate-600 text-center sm:flex sm:justify-between sm:items-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} SpiceShahi (SRS Global Enterprises). All rights reserved.</p>
          <div className="mt-4 sm:mt-0 flex items-center justify-center space-x-6 font-serif italic">
            <span>Pure Spices, Real Aroma</span>
            <span>Hand-Beaten Desi Khushboo</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
