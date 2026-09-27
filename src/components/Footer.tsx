import React, { useState } from 'react';
import { Page } from '../types';
import { ENABLE_WHATSAPP } from '../config/features';
import { WhatsAppFooterItem } from './WhatsAppComponents';
import {
  DISPLAY_EMAIL,
  DISPLAY_INSTAGRAM,
  DISPLAY_INSTAGRAM_URL,
  DISPLAY_ADDRESS,
  DISPLAY_PHONE,
} from '../data/products';
import {
  Instagram,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Truck,
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
            <div className="w-10 h-10 rounded-lg bg-[#243342] border border-slate-600 flex items-center justify-center text-[#F1C40F]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#FCFAF2]">Fast Dispatch</p>
              <p className="text-xs text-slate-300">Haryana ₹50 • India ₹100</p>
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
              SpiceShahi is dedicated to reviving the sacred purity and enchanting natural aroma of Indian spices. Carefully sourced and traditionally inspired, each blend is ground with care to preserve natural taste, deep aroma, nutrition, and true essence.
            </p>
            <div className="flex items-center gap-3 pt-2">
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
              <a
                href={`tel:${DISPLAY_PHONE.replace(/\s+/g, '')}`}
                className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/40 text-green-300 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all"
                title="Call Customer Care"
              >
                <Phone className="w-5 h-5" />
              </a>
              {ENABLE_WHATSAPP && <WhatsAppFooterItem variant="icon" />}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#F1C40F]">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#F1C40F] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#F1C40F] transition-colors"
                >
                  Our Heritage
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="hover:text-[#F1C40F] transition-colors"
                >
                  Shop Spices
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ai-sommelier')}
                  className="hover:text-[#F1C40F] transition-colors"
                >
                  AI Sommelier
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-[#F1C40F] transition-colors"
                >
                  Video Reels
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#F1C40F] transition-colors"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Support & Account */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#F1C40F]">
              Customer Care
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button
                  onClick={() => onNavigate('account')}
                  className="hover:text-[#F1C40F] transition-colors text-left"
                >
                  My Account & Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cart')}
                  className="hover:text-[#F1C40F] transition-colors text-left"
                >
                  View Spice Cart
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#F1C40F] transition-colors text-left"
                >
                  Shipping & Inquiries
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-[#F1C40F] transition-colors text-left"
                >
                  Admin Management
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
                <Phone className="w-4 h-4 text-green-400 shrink-0" />
                <a
                  href={`tel:${DISPLAY_PHONE.replace(/\s+/g, '')}`}
                  className="hover:text-[#F1C40F] transition-colors"
                >
                  {DISPLAY_PHONE}
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
              {ENABLE_WHATSAPP && <WhatsAppFooterItem variant="link" />}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 pt-8 mt-4 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} SpiceShahi (SRS Global Enterprises). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>FSSAI Lic. 20826007001593</span>
            <span>Bahadurgarh, Haryana</span>
            <span>100% Pure Spices</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
