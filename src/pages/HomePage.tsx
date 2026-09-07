import React from 'react';
import { Page, Product } from '../types';
import { PRODUCTS, INSTAGRAM_REELS, TRUST_BADGES, getWhatsAppGeneralUrl } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { ReelCard } from '../components/ReelCard';
import {
  ArrowRight,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Sun,
  Leaf,
  Flame,
  Award,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: Page, productSlug?: string) => void;
  onSelectProduct: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProduct }) => {
  const featuredProducts = PRODUCTS.filter((p) => p.featured).slice(0, 4);
  const featuredReels = INSTAGRAM_REELS.slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION - Artistic Flair */}
      <section className="relative overflow-hidden bg-[#FCFAF2] border-b border-[#E8E4D5]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12 lg:py-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 flex flex-col justify-center z-10">
              <div className="inline-block self-start px-3 py-1 bg-[#F39C12]/20 text-[#D35400] text-[10px] font-bold uppercase tracking-[0.2em] rounded mb-6">
                100% Pure & Organic
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif italic leading-[1.1] text-[#2C3E50] mb-6">
                Pure Spices, <br />
                <span className="text-[#96281B]">Real Aroma.</span>
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-[#5D6D7E] max-w-md mb-8">
                Experience the richness of farm-to-home freshness. Hand-picked, sun-dried, and stone-ground to preserve the natural soul and essential oils of Indian masalas.
              </p>

              {/* Action Buttons - Artistic Flair */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  id="hero-shop-now-btn"
                  onClick={() => onNavigate('products')}
                  className="bg-[#96281B] text-white px-8 py-4 rounded-lg font-bold shadow-lg shadow-[#96281B]/20 hover:bg-[#7D2116] transition-all cursor-pointer"
                >
                  Shop Now
                </button>

                <button
                  id="hero-view-products-btn"
                  onClick={() => onNavigate('products')}
                  className="border-2 border-[#96281B] text-[#96281B] px-8 py-4 rounded-lg font-bold hover:bg-[#96281B]/5 transition-all cursor-pointer"
                >
                  View Products
                </button>

                <a
                  id="hero-whatsapp-btn"
                  href={getWhatsAppGeneralUrl('Hi SpiceShahi! I want to order fresh pure spices for my home.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 rounded-lg bg-[#2D5A27] text-white font-bold text-sm flex items-center gap-2 hover:bg-[#1E3E1A] transition-all cursor-pointer shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>WhatsApp Order</span>
                </a>
              </div>
            </div>

            {/* Right Hero Artistic Visual Composition */}
            <div className="lg:col-span-5 relative flex items-center justify-center py-6 sm:py-10">
              {/* Concentric Golden Ring */}
              <div className="absolute top-6 right-6 sm:top-10 sm:right-10 w-64 sm:w-80 h-64 sm:h-80 rounded-full border-[16px] border-[#F1C40F]/15 pointer-events-none" />

              {/* Main Tilted Crimson Card */}
              <div className="w-[280px] sm:w-[380px] lg:w-[420px] h-[340px] sm:h-[420px] bg-[#96281B] rounded-[48px] sm:rounded-[60px] rotate-[8deg] sm:rotate-[10deg] overflow-hidden shadow-2xl flex items-center justify-center p-6 relative group transition-transform duration-500 hover:rotate-3">
                <div className="w-full h-full border-2 border-white/20 rounded-[36px] sm:rounded-[44px] flex flex-col items-center justify-center text-center relative overflow-hidden p-6">
                  <img
                    src="/images/spiceshahi-hero.jpg"
                    alt="SpiceShahi Authentic Indian Spices"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="text-white/40 font-serif italic text-6xl sm:text-7xl opacity-20 pointer-events-none select-none">
                    Shahi
                  </div>
                  <div className="absolute inset-0 bg-linear-to-tr from-[#96281B] via-transparent to-transparent opacity-70" />

                  <div className="relative z-10 text-white space-y-2 text-center">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] px-3 py-1 bg-white/15 rounded-full backdrop-blur-xs">
                      Hand-Beaten Desi Khushboo
                    </span>
                    <h3 className="font-serif italic font-bold text-2xl sm:text-3xl text-white">
                      SpiceShahi Purity
                    </h3>
                    <p className="text-xs text-white/80 max-w-[200px] mx-auto leading-relaxed">
                      100% natural, hand-beaten without machines to lock in volatile oils
                    </p>
                    <button
                      onClick={() => onSelectProduct('turmeric-powder')}
                      className="mt-2 px-5 py-2 rounded-full bg-white text-[#96281B] text-xs font-bold uppercase tracking-wider hover:bg-[#FCFAF2] transition-colors shadow-sm cursor-pointer"
                    >
                      Explore Spice
                    </button>
                  </div>
                </div>
              </div>

              {/* Tilted Circle Badge - Artistic Flair */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-8 w-36 h-36 sm:w-52 sm:h-52 bg-[#2D5A27] rounded-full flex flex-col items-center justify-center text-white text-center p-4 shadow-xl rotate-[-5deg] hover:rotate-0 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl font-serif italic mb-0.5">No</div>
                <div className="text-[9px] sm:text-xs uppercase tracking-tighter opacity-90 leading-tight">
                  Preservatives <br />Added
                </div>
                <div className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#F1C40F] font-bold mt-1">
                  100% Pure
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED SELECTION STRIP - Artistic Flair Design Pattern */}
      <section className="bg-white border-y border-[#E8E4D5] flex flex-col lg:flex-row px-6 sm:px-12 py-8 items-center gap-8 overflow-hidden max-w-7xl mx-auto rounded-2xl shadow-xs">
        <div className="min-w-[160px] text-center lg:text-left">
          <h3 className="font-serif italic text-2xl text-[#96281B] leading-tight">
            Featured<br className="hidden lg:block" /> Selection
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-[#5D6D7E] mt-1.5">Fresh Harvest</p>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          {/* Card 1: Mirch */}
          <div
            onClick={() => onSelectProduct('kashmiri-lal-mirch')}
            className="bg-[#FCFAF2] p-4 rounded-xl border border-[#E8E4D5] flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="w-16 h-16 bg-[#D35400] rounded-lg rotate-3 shrink-0 flex items-center justify-center text-white font-serif italic text-xl shadow-xs group-hover:rotate-0 transition-transform">
              🌶️
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#2C3E50] group-hover:text-[#96281B] transition-colors">
                Lal Mirch Powder
              </h4>
              <p className="text-xs text-[#5D6D7E]">Bright & Spicy</p>
              <p className="text-[#96281B] font-bold mt-1 text-sm">₹180 / 250g</p>
            </div>
          </div>

          {/* Card 2: Haldi */}
          <div
            onClick={() => onSelectProduct('turmeric-powder')}
            className="bg-[#FCFAF2] p-4 rounded-xl border border-[#E8E4D5] flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="w-16 h-16 bg-[#F1C40F] rounded-lg -rotate-3 shrink-0 flex items-center justify-center text-[#96281B] font-serif italic text-xl shadow-xs group-hover:rotate-0 transition-transform">
              ✨
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#2C3E50] group-hover:text-[#96281B] transition-colors">
                Haldi Powder
              </h4>
              <p className="text-xs text-[#5D6D7E]">Rich Curcumin</p>
              <p className="text-[#96281B] font-bold mt-1 text-sm">₹140 / 250g</p>
            </div>
          </div>

          {/* Card 3: Dhaniya */}
          <div
            onClick={() => onSelectProduct('coriander-powder')}
            className="bg-[#FCFAF2] p-4 rounded-xl border border-[#E8E4D5] flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="w-16 h-16 bg-[#2D5A27] rounded-lg rotate-6 shrink-0 flex items-center justify-center text-white font-serif italic text-xl shadow-xs group-hover:rotate-0 transition-transform">
              🌿
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#2C3E50] group-hover:text-[#96281B] transition-colors">
                Dhaniya Powder
              </h4>
              <p className="text-xs text-[#5D6D7E]">Natural Aroma</p>
              <p className="text-[#96281B] font-bold mt-1 text-sm">₹120 / 250g</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CUSTOMER TRUST BADGES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FCFAF2] rounded-2xl border border-[#E8E4D5] p-6 sm:p-10 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-block px-3 py-1 bg-[#F39C12]/20 text-[#D35400] text-[10px] font-bold uppercase tracking-[0.2em] rounded">
              Purity You Can Smell & Taste
            </span>
            <h2 className="font-serif italic font-bold text-2xl sm:text-3xl text-[#2C3E50] mt-3">
              The SpiceShahi Farm-to-Home Promise
            </h2>
            <p className="text-sm text-[#5D6D7E] mt-2 leading-relaxed">
              Unlike industrial spices that sit in warehouses for years losing their oils and color, SpiceShahi brings you freshly prepared, hand-beaten spices packed with nature's richness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_BADGES.map((badge, idx) => {
              const icons = [
                <ShieldCheck key="1" className="w-6 h-6 text-[#96281B]" />,
                <Flame key="2" className="w-6 h-6 text-[#D35400]" />,
                <Sun key="3" className="w-6 h-6 text-[#F39C12]" />,
                <Award key="4" className="w-6 h-6 text-[#2D5A27]" />,
              ];
              return (
                <div
                  key={badge.id}
                  className="p-5 rounded-xl bg-white border border-[#E8E4D5] hover:border-[#96281B]/40 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#FCFAF2] border border-[#E8E4D5] flex items-center justify-center shadow-xs mb-4">
                    {icons[idx]}
                  </div>
                  <h3 className="font-serif italic font-bold text-base text-[#2C3E50] mb-1">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-[#5D6D7E] leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. BRAND INTRO & THE STORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="inline-block px-3 py-1 bg-[#F39C12]/20 text-[#D35400] text-[10px] font-bold uppercase tracking-[0.2em] rounded">
              True Aroma • Real Khushboo
            </span>
            <h2 className="font-serif italic font-bold text-3xl sm:text-4xl text-[#2C3E50] leading-tight">
              Remember When Spices Filled the Whole House with Fragrance?
            </h2>
            <p className="text-sm sm:text-base text-[#5D6D7E] leading-relaxed">
              In most modern grocery aisles, spices have been stripped of their precious essential oils through intense high-speed factory heat, dyed with chemical pigments, and bulked up with husk fillers.
            </p>
            <p className="text-sm sm:text-base text-[#5D6D7E] leading-relaxed">
              At <strong className="text-[#2C3E50]">SpiceShahi</strong>, we are on a mission to restore the authentic soul of Indian cooking. We source pristine crops directly from ethical farmers. We follow the time-honored tradition of hand-beaten spices without machine heat so the volatile aroma compounds remain alive right until they hit your hot pan.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3 text-sm text-[#2C3E50] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <span>Zero chemical dyes, Sudan red, or artificial additives</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#2C3E50] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <span>Traditional hand-beaten process preserving natural volatile oils</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#2C3E50] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0" />
                <span>Farm traceability from harvest to resealable zipper pouch</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={() => onNavigate('about')}
                className="px-7 py-3.5 rounded-lg bg-[#96281B] hover:bg-[#7D2116] text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-md shadow-[#96281B]/20 transition-colors cursor-pointer"
              >
                <span>Read Our Story</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('products')}
                className="px-7 py-3.5 rounded-lg border-2 border-[#96281B] text-[#96281B] font-bold text-xs uppercase tracking-widest hover:bg-[#96281B]/5 transition-colors cursor-pointer"
              >
                View Products
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#E8E4D5]">
              <img
                src="https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=1000&auto=format&fit=crop"
                alt="Traditional hand spices"
                className="w-full h-[440px] object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-transparent to-transparent flex items-end p-8">
                <div className="text-white space-y-1">
                  <p className="font-serif italic font-bold text-xl">Handcrafted Desi Heritage</p>
                  <p className="text-xs text-[#FCFAF2]/80">
                    Traditional hand-beating methods protect delicate natural oils and ensure authentic desi khushboo in every pinch.
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Badge - Artistic Flair */}
            <div className="absolute -bottom-6 -left-6 bg-[#FCFAF2] p-4 rounded-xl shadow-xl border border-[#E8E4D5] max-w-[220px] hidden sm:block">
              <div className="flex items-center gap-2 text-[#96281B] font-serif italic font-bold text-sm">
                <Sparkles className="w-4 h-4 text-[#F39C12]" />
                100% Farm Fresh
              </div>
              <p className="text-[11px] text-[#5D6D7E] mt-1 leading-relaxed">
                Airtight zip-lock seal locks in the pure aroma from batch to table.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED PRODUCTS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="inline-block px-3 py-1 bg-[#F39C12]/20 text-[#D35400] text-[10px] font-bold uppercase tracking-[0.2em] rounded">
              Fresh Mill Batch
            </span>
            <h2 className="font-serif italic font-bold text-3xl text-[#2C3E50] mt-2">
              Featured Farm Spices & Masalas
            </h2>
            <p className="text-sm text-[#5D6D7E] mt-1">
              Our most celebrated pure spices, ground slow and ready to ship to your doorstep.
            </p>
          </div>

          <button
            onClick={() => onNavigate('products')}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#96281B] hover:text-[#7D2116] group cursor-pointer"
          >
            <span>Explore All Spices</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>

        {/* Quick WhatsApp Order Banner - Artistic Flair */}
        <div className="mt-12 bg-[#96281B] rounded-2xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-[#7D2116]">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-serif italic font-bold text-2xl sm:text-3xl text-white">
              Want a Custom Spice Combo or Bulk Pack?
            </h3>
            <p className="text-sm text-[#FCFAF2]/80 max-w-xl">
              Message us directly on WhatsApp! We curate family combos, wedding favors, and grocery shop bulk supplies.
            </p>
          </div>

          <a
            href={getWhatsAppGeneralUrl('Hi SpiceShahi! I am interested in custom spice combos and bulk packs.')}
            target="_blank"
            rel="noopener noreferrer"
            className="px-7 py-3.5 rounded-full bg-[#2D5A27] hover:bg-[#1E3E1A] text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shrink-0 transition-transform hover:scale-105"
          >
            <MessageCircle className="w-4 h-4 fill-current text-white" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </section>

      {/* 6. INSTAGRAM REELS & VIDEOS PREVIEW - Artistic Slate */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#2C3E50] rounded-2xl p-8 sm:p-12 text-white overflow-hidden relative border border-[#E8E4D5]/20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 relative z-10">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#F1C40F]">
                Behind the Scenes & Recipes
              </span>
              <h2 className="font-serif italic font-bold text-2xl sm:text-3xl text-white mt-1">
                Watch Our Instagram Reels
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                See our farm visits, hand-beaten process, purity experiments, and mouthwatering recipes.
              </p>
            </div>

            <button
              onClick={() => onNavigate('gallery')}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#F1C40F] hover:text-white transition-colors cursor-pointer"
            >
              <span>View Full Gallery ({INSTAGRAM_REELS.length} Reels)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grid of Reels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {featuredReels.map((reel) => (
              <ReelCard key={reel.id} reel={reel} />
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-600 text-center relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-300">
              Join spice lovers following our authentic journey on Instagram @SpiceShahi
            </p>
            <a
              href="https://instagram.com/SpiceShahi"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-full bg-[#96281B] hover:bg-[#7D2116] text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Follow @SpiceShahi
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
