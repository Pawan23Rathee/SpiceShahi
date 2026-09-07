import React, { useState, useMemo } from 'react';
import { Page, Product } from '../types';
import { PRODUCTS, getWhatsAppGeneralUrl } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal, MessageCircle, Sparkles, X } from 'lucide-react';

interface ProductsPageProps {
  onNavigate: (page: Page, productSlug?: string) => void;
  onSelectProduct: (slug: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onNavigate, onSelectProduct }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high'>('featured');

  const categories = [
    { id: 'all', label: 'All Spices' },
    { id: 'single', label: 'Haldi, Mirch & Dhaniya' },
  ];

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.hindiName.toLowerCase().includes(q) ||
        product.shortDesc.toLowerCase().includes(q) ||
        product.origin.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') {
        return a.packSizes[0].price - b.packSizes[0].price;
      }
      if (sortBy === 'price-high') {
        return b.packSizes[0].price - a.packSizes[0].price;
      }
      // default featured
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-12 pb-16">
      {/* Page Header - Artistic Flair */}
      <section className="bg-[#FCFAF2] border-b border-[#E8E4D5] py-14">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-3">
          <span className="inline-block px-3 py-1 bg-[#F39C12]/20 text-[#D35400] text-[10px] font-bold uppercase tracking-[0.2em] rounded">
            Authentic Farm Harvests
          </span>
          <h1 className="font-serif italic font-bold text-4xl sm:text-5xl text-[#2C3E50] tracking-tight">
            Our Spices & <span className="text-[#96281B]">Masalas</span>
          </h1>
          <p className="text-base text-[#5D6D7E] leading-relaxed">
            Freshly hand-beaten in small batches with zero added colors, starch, or synthetic additives. Order directly to your doorstep via WhatsApp.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Controls: Search, Categories & Sort */}
        <div className="bg-white p-5 rounded-xl border border-[#E8E4D5] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-[#5D6D7E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by spice name (Haldi, Mirch, Dhaniya...)"
                className="w-full pl-10 pr-9 py-2.5 bg-[#FCFAF2] border border-[#E8E4D5] rounded-lg text-xs sm:text-sm text-[#2C3E50] placeholder-[#5D6D7E]/60 focus:outline-hidden focus:border-[#96281B]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D6D7E] hover:text-[#2C3E50] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-xs text-[#5D6D7E] font-medium whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-2 px-3 bg-[#FCFAF2] border border-[#E8E4D5] rounded-lg text-xs text-[#2C3E50] focus:outline-hidden focus:border-[#96281B]"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#96281B] text-white shadow-xs'
                      : 'bg-[#FCFAF2] text-[#2C3E50] border border-[#E8E4D5] hover:bg-[#E8E4D5]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-[#5D6D7E] px-1">
          <p>
            Showing <strong className="text-[#2C3E50]">{filteredProducts.length}</strong> authentic products
            {selectedCategory !== 'all' && ` in ${categories.find((c) => c.id === selectedCategory)?.label}`}
          </p>

          <a
            href={getWhatsAppGeneralUrl('Hi SpiceShahi! I would like to place a custom bulk spice order.')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2D5A27] hover:underline font-bold flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>Need bulk/wholesale quantities? WhatsApp Us</span>
          </a>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E8E4D5] p-12 text-center max-w-md mx-auto space-y-4">
            <Sparkles className="w-10 h-10 text-[#F1C40F] mx-auto" />
            <h3 className="font-serif italic font-bold text-lg text-[#2C3E50]">No spices matched your search</h3>
            <p className="text-xs text-[#5D6D7E]">
              Try searching for "haldi", "chili", "coriander", or clear your filter to view all products.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-5 py-2.5 rounded-lg bg-[#96281B] text-white text-xs font-bold uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Farm Freshness Assurance Banner - Artistic Flair */}
        <div className="bg-[#FCFAF2] border border-[#E8E4D5] rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-serif italic font-bold text-lg text-[#2C3E50]">
              Not sure which grind or spice size you need?
            </h4>
            <p className="text-xs sm:text-sm text-[#5D6D7E]">
              Our master blender can recommend custom spice combos for specific recipes, gift packs, or culinary businesses.
            </p>
          </div>

          <a
            href={getWhatsAppGeneralUrl('Hi SpiceShahi! I need help choosing the right spices and pack sizes for my kitchen.')}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-[#2D5A27] hover:bg-[#1E3E1A] text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 shrink-0 transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Consult via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
