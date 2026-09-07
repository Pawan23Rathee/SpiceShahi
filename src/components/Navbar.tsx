import React, { useState } from 'react';
import { Page } from '../types';
import { getWhatsAppGeneralUrl, DISPLAY_WHATSAPP } from '../data/products';
import { Menu, X, MessageCircle, Sparkles, ChevronRight, Phone } from 'lucide-react';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page, productSlug?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; page: Page }[] = [
    { label: 'Home', page: 'home' },
    { label: 'About Us', page: 'about' },
    { label: 'Products', page: 'products' },
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
      {/* Announcement Bar */}
      <div className="bg-[#96281B] text-[#FCFAF2] text-xs sm:text-sm py-2 px-4 border-b border-[#7D2116]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="inline-block w-2 h-2 rounded-full bg-[#F1C40F] animate-pulse"></span>
            <span className="font-medium tracking-wide">
              Fresh Harvest Batch Ready • 100% Cold-Ground & Pure • Free Shipping on WhatsApp orders above ₹599
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-[#F1C40F]/90">
            <a
              href={getWhatsAppGeneralUrl('Hi SpiceShahi team, I want to inquire about your spices')}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp: {DISPLAY_WHATSAPP}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header with Artistic Flair styling */}
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

            {/* Desktop Navigation Links - Artistic Flair uppercase tracking-widest */}
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

            {/* Right Action: Artistic Flair Button */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                id="nav-shop-online-btn"
                onClick={() => handleNavClick('products')}
                className="px-6 py-2 bg-[#2D5A27] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#1E3E1A] transition-colors shadow-sm cursor-pointer"
              >
                Shop Online
              </button>
              <a
                id="nav-whatsapp-order-btn"
                href={getWhatsAppGeneralUrl('Hi SpiceShahi! I would like to order fresh spices.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27] hover:text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center gap-2">
              <a
                href={getWhatsAppGeneralUrl('Hi SpiceShahi! I would like to order fresh spices.')}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[#2D5A27] text-white"
                title="Order on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
              </a>

              <button
                id="mobile-menu-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#2C3E50] hover:bg-[#E8E4D5] transition-colors focus:outline-hidden"
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

            <div className="pt-4 border-t border-[#E8E4D5] space-y-2">
              <button
                onClick={() => handleNavClick('products')}
                className="w-full py-3 bg-[#2D5A27] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#1E3E1A] transition-colors text-center"
              >
                Shop Online
              </button>
              <a
                href={getWhatsAppGeneralUrl('Hi SpiceShahi! I would like to order fresh spices.')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-[#2D5A27] text-[#2D5A27] text-xs font-bold uppercase tracking-wider"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat & Order on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
