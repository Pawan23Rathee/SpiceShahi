import React, { useState } from 'react';
import { Page } from '../types';
import { DISPLAY_PHONE, DISPLAY_EMAIL } from '../data/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { platformService } from '../services';
import { ENABLE_WHATSAPP } from '../config/features';
import { WhatsAppHeaderLink, WhatsAppMobileMenuItem } from './WhatsAppComponents';
import {
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Phone,
  Mail,
  ShoppingBag,
  User,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page, productSlug?: string) => void;
  onOpenAiDrawer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onOpenAiDrawer }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, openCart } = useCart();
  const { customer, isAuthenticated } = useAuth();

  const navLinks: { label: string; page: Page }[] = [
    { label: 'Home', page: 'home' },
    { label: 'About Us', page: 'about' },
    { label: 'Products', page: 'products' },
    { label: 'Become a Distributor', page: 'distributor' },
    { label: 'AI Sommelier', page: 'ai-sommelier' },
    { label: 'Reels & Gallery', page: 'gallery' },
    { label: 'Contact Us', page: 'contact' },
  ];

  const handleNavClick = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#96281B] text-[#FCFAF2] text-xs sm:text-sm py-2 px-4 border-b border-[#7D2116]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="inline-block w-2 h-2 rounded-full bg-[#F1C40F] animate-pulse"></span>
            <span className="font-medium tracking-wide">
              Fresh Harvest Batch • 100% Cold-Ground & Pure Masalas
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-[#F1C40F]/90">
            <a
              href={`tel:${DISPLAY_PHONE.replace(/\s+/g, '')}`}
              className="hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call: {DISPLAY_PHONE}</span>
            </a>
            <span className="text-white/40">|</span>
            <a
              href={`mailto:${DISPLAY_EMAIL}`}
              className="hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{DISPLAY_EMAIL}</span>
            </a>
            {ENABLE_WHATSAPP && (
              <>
                <span className="text-white/40">|</span>
                <WhatsAppHeaderLink />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#FCFAF2]/95 backdrop-blur-md border-b border-[#E8E4D5] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button
              id="nav-logo-btn"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 text-left group focus:outline-hidden cursor-pointer"
            >
              <img
                src="/images/spiceshahi-logo.jpg"
                alt="SpiceShahi Logo"
                className="w-12 h-12 rounded-full object-cover shadow-sm border border-[#F39C12]/40 group-hover:scale-105 transition-transform duration-200"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-serif font-bold tracking-tight text-[#96281B] flex items-center gap-1.5">
                  SpiceShahi
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#5D6D7E] font-semibold -mt-0.5">
                  Desi Khushboo Spices
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium uppercase tracking-widest">
              {navLinks.map((link) => {
                const isActive = currentPage === link.page;
                return (
                  <button
                    key={link.page}
                    id={`nav-link-${link.page}`}
                    onClick={() => handleNavClick(link.page)}
                    className={`transition-colors duration-150 cursor-pointer pb-1 ${
                      isActive
                        ? 'text-[#96281B] border-b-2 border-[#96281B] font-bold'
                        : 'text-[#2C3E50] hover:text-[#96281B]'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Actions: Cart, Account, Shop Online, Ask AI */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Cart Button with Count Badge */}
              <button
                id="navbar-cart-btn"
                onClick={openCart}
                className="relative p-2.5 rounded-full bg-white border border-[#E8E4D5] hover:border-[#96281B] text-[#2C3E50] hover:text-[#96281B] shadow-xs transition-all cursor-pointer flex items-center justify-center group"
                aria-label={`Open Cart (${totalItems} items)`}
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#96281B] text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Customer Account Button */}
              <button
                id="navbar-account-btn"
                onClick={() => handleNavClick(isAuthenticated ? 'account' : 'login')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#E8E4D5] bg-white hover:border-[#96281B] text-xs font-semibold text-[#2C3E50] hover:text-[#96281B] transition-colors cursor-pointer"
                title={isAuthenticated ? `My Account (${customer?.fullName})` : 'Sign In / Register'}
              >
                <User className="w-3.5 h-3.5 text-[#96281B]" />
                <span className="truncate max-w-[110px]">
                  {isAuthenticated ? customer?.fullName.split(' ')[0] : 'Sign In'}
                </span>
              </button>

              {/* Ask AI Sommelier Button */}
              {onOpenAiDrawer && (
                <button
                  id="navbar-ask-ai-btn"
                  onClick={onOpenAiDrawer}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full bg-linear-to-r from-[#96281B] to-[#D35400] text-white text-xs font-bold uppercase tracking-wider shadow-xs hover:opacity-95 transition-all cursor-pointer border border-[#F1C40F]/30"
                  title="Ask Shahi Sommelier AI Chatbot"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F1C40F] animate-pulse" />
                  <span>Ask AI</span>
                </button>
              )}

              {/* Shop Online (Desktop) */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  id="nav-shop-online-btn"
                  onClick={() => handleNavClick('products')}
                  className="px-5 py-2.5 bg-[#96281B] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#7D2116] transition-colors shadow-sm cursor-pointer"
                >
                  Shop Spices
                </button>
              </div>

              {/* Mobile Hamburger Button */}
              <button
                id="mobile-menu-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-[#2C3E50] hover:bg-[#E8E4D5] transition-colors focus:outline-hidden"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E8E4D5] bg-[#FCFAF2] px-6 pt-4 pb-6 space-y-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => {
              const isActive = currentPage === link.page;
              return (
                <button
                  key={link.page}
                  id={`mobile-nav-${link.page}`}
                  onClick={() => handleNavClick(link.page)}
                  className={`w-full flex items-center justify-between py-2 text-left text-sm uppercase tracking-widest font-semibold transition-all ${
                    isActive
                      ? 'text-[#96281B] border-b border-[#96281B]'
                      : 'text-[#2C3E50] hover:text-[#96281B]'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#96281B]' : 'text-[#5D6D7E]'}`} />
                </button>
              );
            })}

            {/* Cart & Customer Account in Mobile Menu */}
            <div className="pt-3 border-t border-[#E8E4D5] space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNavClick(isAuthenticated ? 'account' : 'login');
                }}
                className="w-full flex items-center justify-between py-2.5 px-4 bg-white border border-[#E8E4D5] rounded-xl text-xs font-bold uppercase tracking-wider text-[#2C3E50]"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#96281B]" />
                  {isAuthenticated ? `My Account (${customer?.fullName})` : 'Customer Sign In / Register'}
                </span>
                <span className="text-[#96281B] font-serif">
                  {isAuthenticated ? 'Profile' : 'Login'}
                </span>
              </button>

              {onOpenAiDrawer && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAiDrawer();
                  }}
                  className="w-full flex items-center justify-between py-2.5 px-4 bg-linear-to-r from-[#96281B] to-[#D35400] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#F1C40F]" />
                    Chat with AI Sommelier
                  </span>
                  <span className="text-[#F1C40F] text-[10px] font-mono">VOICE/TEXT</span>
                </button>
              )}

              {ENABLE_WHATSAPP && <WhatsAppMobileMenuItem />}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openCart();
                }}
                className="w-full flex items-center justify-between py-2.5 px-4 bg-white border border-[#E8E4D5] rounded-xl text-xs font-bold uppercase tracking-wider text-[#2C3E50]"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#96281B]" />
                  View Spice Basket ({totalItems})
                </span>
                <span className="text-[#96281B] font-serif">Open</span>
              </button>

              <button
                onClick={() => handleNavClick('products')}
                className="w-full py-3 bg-[#96281B] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#7D2116] transition-colors text-center shadow-sm"
              >
                Shop All Spices
              </button>

              <button
                onClick={() => handleNavClick('admin')}
                className="w-full py-2 text-[11px] text-[#5D6D7E] hover:text-[#2C3E50] flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                <span>Admin Portal Login</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
