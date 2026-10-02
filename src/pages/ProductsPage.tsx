import React, { useState, useMemo } from 'react';
import { Page } from '../types';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { Search, Sparkles, ChefHat } from 'lucide-react';

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
            Carefully sourced and traditionally crafted Indian spices with zero added colors, starch, or synthetic additives. Order directly online for fast doorstep delivery.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Controls: Search, Categories & Sort */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E8E4D5] shadow-xs space-y-3 sm:space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-[#5D6D7E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search turmeric, coriander, chili, origin..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#FCFAF2] border border-[#E8E4D5] rounded-lg text-sm text-[#2C3E50] placeholder-[#5D6D7E]/60 focus:outline-hidden focus:border-[#96281B] transition-colors"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              <span className="text-xs text-[#5D6D7E] font-medium shrink-0">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#FCFAF2] border border-[#E8E4D5] text-xs font-semibold text-[#2C3E50] rounded-lg px-3 py-2 focus:outline-hidden focus:border-[#96281B] cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 border-t border-[#E8E4D5]">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#96281B] text-white shadow-xs'
                      : 'bg-[#FCFAF2] text-[#5D6D7E] hover:text-[#2C3E50] border border-[#E8E4D5]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#5D6D7E] gap-2 px-1">
          <p>
            Showing <strong className="text-[#2C3E50]">{filteredProducts.length}</strong> authentic products
            {selectedCategory !== 'all' && ` in ${categories.find((c) => c.id === selectedCategory)?.label}`}
          </p>

          <button
            onClick={() => onNavigate('contact')}
            className="text-[#96281B] hover:underline font-bold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Need bulk/wholesale quantities? Contact Us</span>
          </button>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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

        {/* Master Blender Assistance Banner */}
        <div className="bg-[#FCFAF2] border border-[#E8E4D5] rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-serif italic font-bold text-lg text-[#2C3E50]">
              Not sure which grind or spice size you need?
            </h4>
            <p className="text-xs sm:text-sm text-[#5D6D7E]">
              Our Shahi Sommelier AI or culinary specialists can recommend custom spice pairings for specific recipes, gift packs, or culinary businesses.
            </p>
          </div>

          <button
            onClick={() => onNavigate('ai-sommelier')}
            className="px-6 py-3 rounded-lg bg-[#96281B] hover:bg-[#781E13] text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 shrink-0 transition-colors shadow-xs cursor-pointer"
          >
            <ChefHat className="w-4 h-4 text-[#F1C40F]" />
            <span>Consult AI Sommelier</span>
          </button>
        </div>
      </div>
    </div>
  );
};
