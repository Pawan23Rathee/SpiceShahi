import React, { useState } from 'react';
import { Page } from '../types';
import { INSTAGRAM_REELS, DISPLAY_INSTAGRAM, DISPLAY_INSTAGRAM_URL } from '../data/products';
import { ReelCard } from '../components/ReelCard';
import { Instagram, Sparkles, ExternalLink, Play, Video } from 'lucide-react';

interface GalleryPageProps {
  onNavigate: (page: Page) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Reels & Videos' },
    { id: 'farm', label: 'Farm Harvesting' },
    { id: 'process', label: 'Cold-Stone Grinding' },
    { id: 'recipe', label: 'Recipes & Purity Tests' },
    { id: 'packaging', label: 'Aroma-Lock Packaging' },
  ];

  const filteredReels =
    selectedCategory === 'all'
      ? INSTAGRAM_REELS
      : INSTAGRAM_REELS.filter((r) => r.category === selectedCategory);

  return (
    <div className="space-y-12 pb-16">
      {/* Header Section - Artistic Flair */}
      <section className="bg-[#2C3E50] text-[#FCFAF2] py-16 border-b border-[#E8E4D5]/20">
        <div className="max-w-7xl mx-auto px-6 text-center max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#F1C40F]/15 border border-[#F1C40F]/30 text-[#F1C40F] text-[10px] font-bold uppercase tracking-[0.2em]">
            <Instagram className="w-3.5 h-3.5" />
            <span>Official Instagram Hub</span>
          </div>

          <h1 className="font-serif italic font-bold text-4xl sm:text-5xl text-[#FCFAF2] tracking-tight">
            Instagram Reels & Spice Stories
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            Take a visual tour through our sun-drenched harvest fields, traditional cold stone mills, nitrogen packaging sessions, and fragrant home kitchen recipes.
          </p>

          <div className="pt-2">
            <a
              href={DISPLAY_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#96281B] hover:bg-[#7D2116] text-white font-bold text-xs uppercase tracking-widest shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
              <span>Follow {DISPLAY_INSTAGRAM}</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#96281B] text-white shadow-xs'
                    : 'bg-white border border-[#E8E4D5] text-[#2C3E50] hover:bg-[#FCFAF2]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Reels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredReels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </div>

        {/* Instagram Tag Prompt Banner */}
        <div className="bg-white rounded-2xl border border-[#E8E4D5] p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-xl bg-[#FCFAF2] border border-[#E8E4D5] text-[#96281B] flex items-center justify-center mx-auto">
            <Instagram className="w-7 h-7" />
          </div>

          <h3 className="font-serif italic font-bold text-2xl text-[#2C3E50]">
            Cook With SpiceShahi & Tag Us!
          </h3>

          <p className="text-sm text-[#5D6D7E] max-w-xl mx-auto leading-relaxed">
            Are you whipping up a fragrant curry or biryani with SpiceShahi spices? Tag <strong className="text-[#2C3E50]">{DISPLAY_INSTAGRAM}</strong> on Instagram using the hashtag <strong className="text-[#96281B]">#SpiceShahiPurity</strong> to get featured on our reels and win a complimentary spice tasting kit!
          </p>

          <div className="pt-2">
            <a
              href={DISPLAY_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#2C3E50] hover:bg-[#243342] text-white text-xs font-bold uppercase tracking-widest transition-colors shadow-xs"
            >
              <span>Visit {DISPLAY_INSTAGRAM}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
